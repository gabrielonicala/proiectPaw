import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ThemeConfig } from '@/types';
import { getCharacterMemoryForStory, createStoryPromptWithMemory, updateCharacterMemory } from '@/lib/character-memory';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
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

    const systemPrompt = `You are a creative fantasy story generator. Transform the user's real-life experiences into engaging stories with the following aesthetic/theme:

Description: ${themeConfig.description}
Inspiration Elements: ${themeConfig.storyPrompts?.join(', ') || 'Adventure and discovery'}

CHARACTER MEMORY CONTEXT:
${memoryContext}

CRITICAL TRANSFORMATION RULES:
- PRESERVE the core activity/event from the original text
- TRANSFORM the entire setting to be authentically reimagined in the given aesthetic (not just background elements)
- The main action/activity must remain recognizable but reimagined
- ALWAYS use the character's name "${characterData.name}" as the main character - never use any other name
- Use the character's pronouns (${characterPronouns}) when referring to ${characterData.name}
- MAINTAIN CONTINUITY with previous entries - reference ongoing relationships, locations, and plots when relevant


Guidelines:
- Keep the core activity and emotions from the original text
- Transform the ENTIRE setting into the given theme - not just background elements
- ALWAYS refer to the main character as "${characterData.name}" - never use any other name
- Use ${characterPronouns} pronouns when referring to ${characterData.name}
- Create vivid, immersive descriptions that preserve the original experience
- Make it feel like the original activity, but with EVERYTHING reimagined in the given theme
- Length: Keep it concise but complete - aim for 5-6 sentences that tell a complete mini-story
- CONTINUITY: NATURALLY reference previous events, relationships, or ongoing plots if/when they enhance the story
- USE THE MEMORY CONTEXT: Reference the character's previous journey, world state, and recent entries if/when relevant
- WEAVE CONTINUITY SUBTLY: Make connections feel natural and organic, not forced or obvious
- REFERENCE SPECIFIC ELEMENTS: Mention locations, objects, or emotional states from previous entries if/when relevant
- NARRATIVE FLOW: Let continuity emerge naturally through shared locations, objects, emotions, or relationships
- AVOID REPETITIVE OPENINGS: Don't start multiple stories with the same phrase or pattern
- VARY YOUR OPENINGS: Use different starting approaches - direct action, character thoughts, environmental details, dialogue, etc.
- THEME-SPECIFIC ELEMENTS: Only use locations, objects, and references that belong to or fit the given theme - don't mix elements from other themes
- CHARACTER NAMING: When introducing new characters, give them specific names (not generic titles like "comrade", "stranger", "merchant"). Use names that fit the given theme
- NEVER USE THEME NAMES: Do not mention the theme name anywhere in the story. Only use the aesthetic elements, descriptions, and atmosphere of the theme without naming it
- PUNCTUATION: Use commas instead of em dashes (—) for pauses and breaks in sentences. Em dashes are not allowed. Always use commas for pauses, never em dashes.
- STORY FOCUS: Focus ONLY on the specific activity from the original text. Do not try to incorporate multiple story prompts or themes. Create ONE cohesive story about the actual activity described.
- INSPIRATION USAGE: The inspiration elements are examples of the theme's atmosphere, not requirements to include. Use them as reference for tone and style, but focus only on the actual activity described in the original text.
- NATURAL WRITING: Write in a conversational, natural style. Avoid overly formal language, excessive adjectives, or dramatic flourishes. Tell the story simply and directly, as if describing what actually happened.
- FANTASY WRITING: Create vibrant, engaging fantasy that transforms reality into immersive adventure. Make it feel alive and exciting, not dry or formulaic. Draw the reader into the experience.
- NATURAL NAMING: Create unique, theme-appropriate names for locations and objects. Avoid overly mystical or cliché fantasy names like "Garden of Tranquility", "Tea House of Reflection", "Market of the Dawn", "Steel Lotus Temple", or any "X of the Y" format. Instead, create names that feel authentic to the theme while being creative and memorable.`;

    const userPrompt = `Transform this real-life experience into a new story in the given theme featuring ${characterData.name}:

"${originalText}"

Create a concise but complete mini-story (5-6 sentences) that shows the core activity from the original text happening in a COMPLETELY reimagined setting fitting the theme. The main action should be clearly recognizable but with EVERYTHING reimagined in the given theme - characters, setting, equipment, and atmosphere.

CRITICAL: NEVER mention the theme name in the story. Only use the aesthetic elements and atmosphere without naming the theme.

WRITING STYLE: Use commas for pauses and breaks, never em dashes (—). Always use commas for pauses, never em dashes. For example: "He paused, thinking carefully" NOT "He paused—thinking carefully". Write in a natural, human style without AI-typical punctuation patterns. Create vivid, engaging fantasy that feels alive and immersive.

STORY SCOPE: Focus ONLY on the specific activity described in the original text. Do not try to incorporate multiple themes or story elements. Create ONE focused story about the actual activity.

INSPIRATION GUIDANCE: The inspiration elements show the theme's style and atmosphere. Use them as reference for tone, but do NOT try to include multiple elements in one story. Focus only on transforming the specific activity described.

FANTASY STORYTELLING: Transform the reality into vibrant, engaging fantasy. Make it feel alive and immersive, not dry or formulaic. Create a story that draws the reader in and makes them feel like they're experiencing the adventure.

NAMING STYLE: Create unique, theme-appropriate names for locations and objects. Avoid cliché fantasy names like "Garden of Tranquility", "Tea House of Reflection", "Market of the Dawn", "Steel Lotus Temple", or any "X of the Y" format. Instead, create names that feel authentic to the theme while being creative and memorable.

CONTINUITY REQUIREMENT: If this experience relates to previous entries in the character's memory, NATURALLY weave those connections into the story. For example:
- If they're in the same location, mention it organically
- If they're continuing an activity, let it flow naturally
- Reference previous meals, objects, or emotions subtly
- Let continuity emerge through shared elements, not forced temporal phrases

After writing the story, also analyze the content and extract any new relationships, locations, or goals that emerge. Return your response in this exact JSON format:
{
  "story": "Your generated story here",
  "worldState": {
    "relationships": [
      {
        "name": "CharacterName",
        "relationshipType": "relationship type (e.g., friend, mentor, rival, ally)",
        "context": "what activity/context this relationship is about (e.g., gym partner, library companion, work colleague)",
        "establishedIn": "brief description of when/where it was established"
      }
    ],
    "locations": [
      {
        "reimaginedName": "Fantasy name used in the story",
        "realName": "what it actually represents (e.g., gym, library, office, home)",
        "context": "what activities happen there",
        "establishedIn": "brief description of when/where it was established"
      }
    ],
    "goals": [
      {
        "description": "Goal description",
        "status": "active|completed|failed"
      }
    ]
  }
}

IMPORTANT: 
- RELATIONSHIPS: Only include actual character NAMES (not titles, roles, or generic terms like "comrade", "stranger", "merchant", etc.). The character must have a specific name like "Marcus", "Elena", "Captain Blackthorn", etc. Include the CONTEXT of the relationship (e.g., "gym partner", "library companion", "work colleague") to distinguish between different relationships with the same person.
- LOCATIONS: Include any specific locations mentioned in the story. Provide both the fantasy name used in the story and what it actually represents in real life. Include context about what activities happen there.
- GOALS: Only include goals that are explicitly mentioned. Mark as "completed" if the story shows the goal being achieved, "failed" if it's clearly not achieved, or "active" if it's ongoing.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 700,
      temperature: 0.8,
    });

    const generatedText = completion.choices[0]?.message?.content;

    if (!generatedText) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let storyText: string;
    let worldStateUpdate: { 
      relationships: Array<{ name: string; relationshipType: string; context: string; establishedIn: string }>; 
      locations: Array<{ reimaginedName: string; realName: string; context: string; establishedIn: string }>;
      goals: Array<{ description: string; status: string }>; 
    } = { relationships: [], locations: [], goals: [] };

    try {
      const parsedResponse = JSON.parse(generatedText);
      storyText = parsedResponse.story;
      worldStateUpdate = parsedResponse.worldState || { relationships: [], locations: [], goals: [] };
    } catch (error) {
      // Fallback: treat the entire response as the story if JSON parsing fails
      console.warn('Failed to parse JSON response, using entire response as story:', error);
      storyText = generatedText;
    }

    // Update character memory with the new entry and world state
    await updateCharacterMemory(character.id, {
      originalText,
      reimaginedText: storyText,
      worldStateUpdate
    });

    return NextResponse.json({
      success: true,
      reimaginedText: storyText,
      outputType,
      theme: themeConfig.id,
      worldStateUpdate
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
