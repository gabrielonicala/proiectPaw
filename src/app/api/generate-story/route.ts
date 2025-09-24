import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ThemeConfig } from '@/types';
import { getCharacterMemoryForStory, createStoryPromptWithMemory, updateCharacterMemory } from '@/lib/character-memory';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { checkSubscriptionAwareRateLimit, getClientIdentifier, getUserIdentifier } from '@/lib/rate-limit';
import { canCreateEntry } from '@/lib/subscription-limits';
import { db } from '@/lib/db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user subscription info for rate limiting
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionPlan: true }
    });

    // Subscription-aware rate limiting (more permissive since subscription limits handle the real restrictions)
    const rateLimitResult = await checkSubscriptionAwareRateLimit(
      session.user.id, 
      'generate-story', 
      user?.subscriptionPlan || 'free'
    );
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: 'Too many requests. Please try again later.',
          resetTime: rateLimitResult.reset
        }, 
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset instanceof Date ? rateLimitResult.reset.toISOString() : new Date(rateLimitResult.reset).toISOString(),
            'Retry-After': Math.ceil(((rateLimitResult.reset instanceof Date ? rateLimitResult.reset.getTime() : rateLimitResult.reset) - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const { originalText, themeConfig, outputType, pastContext, character } = await request.json();

    // Check subscription limits for story generation
    const limitCheck = await canCreateEntry(session.user.id, character.id, 'text');
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'Daily limit exceeded', 
          message: limitCheck.reason,
          usage: limitCheck.usage,
          limit: limitCheck.limit
        }, 
        { status: 429 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      // Return a demo story when no API key is configured
      const demoStory = generateDemoStory(originalText, themeConfig);
      return NextResponse.json({
        success: true,
        reimaginedText: demoStory,
        outputType,
        theme: themeConfig.id
      });
    }

    // Get character memory for continuity
    const { character: characterData, memory } = await getCharacterMemoryForStory(character.id);

    // Get character pronouns for story generation
    const characterPronouns = characterData?.pronouns === 'custom' 
      ? characterData.customPronouns || 'they/them'
      : characterData?.pronouns || 'they/them';

    // Create memory-aware prompt
    const memoryContext = createStoryPromptWithMemory(characterData, memory, originalText);
    
    // Debug: Log memory context for troubleshooting
    console.log('🧠 Character Memory Context:', {
      characterId: character.id,
      characterName: characterData.name,
      hasMemory: !!memory,
      recentEntriesCount: memory.recentEntries.length,
      summaryLogLength: memory.summaryLog.length,
      worldStateKeys: Object.keys(memory.worldState || {})
    });

    const systemPrompt = `You are a creative fantasy story generator. Transform the user's real-life experiences into engaging stories with a ${themeConfig.name} aesthetic.

Theme: ${themeConfig.name}
Description: ${themeConfig.description}
Story Prompts: ${themeConfig.storyPrompts?.join(', ') || 'Adventure and discovery'}

CHARACTER MEMORY CONTEXT:
${memoryContext}

CRITICAL TRANSFORMATION RULES:
- PRESERVE the core activity/event from the original text
- COMPLETELY TRANSFORM all characters to fit the ${themeConfig.name} theme (costumes, appearance, equipment)
- TRANSFORM the entire setting to be authentically ${themeConfig.name} (not just background elements)
- The main action/activity must remain recognizable but reimagined
- ALWAYS use the character's name "${characterData.name}" as the main character - never use any other name
- Use the character's pronouns (${characterPronouns}) when referring to ${characterData.name}
- MAINTAIN CONTINUITY with previous entries - reference ongoing relationships, locations, and plots when relevant
- Example: "played soccer" with Crimson Tides = ${characterData.name} and other pirates in pirate costumes playing soccer on a beach with their ship docked nearby

Guidelines:
- Keep the core activity and emotions from the original text
- ALL characters must be described as wearing ${themeConfig.name} costumes and having ${themeConfig.name} appearance
- Transform the ENTIRE setting into ${themeConfig.name} style - not just background elements
- ALWAYS refer to the main character as "${characterData.name}" - never use any other name
- Use ${characterPronouns} pronouns when referring to ${characterData.name}
- Create vivid, immersive descriptions that preserve the original experience
- Make it feel like the original activity, but with EVERYTHING reimagined as ${themeConfig.name}
- Length: Keep it concise but complete - aim for 3-4 sentences that tell a complete mini-story
- CONTINUITY: NATURALLY reference previous events, relationships, or ongoing plots when they enhance the story
- USE THE MEMORY CONTEXT: Reference the character's previous journey, world state, and recent entries when relevant
- WEAVE CONTINUITY SUBTLY: Make connections feel natural and organic, not forced or obvious
- REFERENCE SPECIFIC ELEMENTS: Mention locations, objects, or emotional states from previous entries
- NARRATIVE FLOW: Let continuity emerge naturally through shared locations, objects, emotions, or relationships
- AVOID REPETITIVE OPENINGS: Don't start multiple stories with the same phrase or pattern
- VARY YOUR OPENINGS: Use different starting approaches - direct action, character thoughts, environmental details, dialogue, etc.
- THEME-SPECIFIC ELEMENTS: Only use locations, objects, and references that belong to the ${themeConfig.name} theme - don't mix elements from other themes`;

    const userPrompt = `Transform this real-life experience into a ${themeConfig.name} story featuring ${characterData.name}:

"${originalText}"

Create a concise but complete mini-story (3-4 sentences) that shows the core activity from the original text happening in a COMPLETELY ${themeConfig.name} setting. ALL characters must be described as wearing ${themeConfig.name} costumes and having ${themeConfig.name} appearance. The main action should be clearly recognizable but with EVERYTHING reimagined as ${themeConfig.name} - characters, setting, equipment, and atmosphere.

CONTINUITY REQUIREMENT: If this experience relates to previous entries in the character's memory, NATURALLY weave those connections into the story. For example:
- If they're in the same location, mention it organically
- If they're continuing an activity, let it flow naturally
- Reference previous meals, objects, or emotions subtly
- Let continuity emerge through shared elements, not forced temporal phrases`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    const generatedText = completion.choices[0]?.message?.content;

    if (!generatedText) {
      throw new Error('No response from OpenAI');
    }

    // Update character memory with the new entry
    await updateCharacterMemory(character.id, {
      originalText,
      reimaginedText: generatedText
    });

    return NextResponse.json({
      success: true,
      reimaginedText: generatedText,
      outputType,
      theme: themeConfig.id
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    );
  }
}


function generateDemoStory(originalText: string, themeConfig: ThemeConfig): string {
  const themeName = themeConfig.name;
  const themeDescription = themeConfig.description || 'adventure awaits';
  const storyPrompts = themeConfig.storyPrompts?.[0] || 'Adventure and discovery';

  return `In the world of ${themeName}, where ${themeDescription.toLowerCase()}, your story unfolds...

"${originalText}"

${storyPrompts} Your real experience transforms into an epic adventure that bridges the ordinary and extraordinary. The essence of your moment becomes the foundation for a tale that transcends reality itself.

[Demo story - add OpenAI API key for AI generation!]`;
}
