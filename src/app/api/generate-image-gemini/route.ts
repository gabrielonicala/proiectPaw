import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Modality } from '@google/genai';
import { generateAvatarDescription } from '@/lib/avatar-utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { canCreateEntry } from '@/lib/subscription-limits';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const { originalText, themeConfig, character } = await request.json();

    // Check subscription limits for image generation
    const limitCheck = await canCreateEntry(session.user.id, character.id, 'image');
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
    
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    
    if (!GOOGLE_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GOOGLE_API_KEY not found in environment variables' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
    const prompt = createGeminiPrompt(originalText, themeConfig, character);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: prompt,
    });
    
    
    // Process the response to find image data
    let imageData = null;
    
    // Check if response has candidates array
    if (response.candidates && response.candidates.length > 0) {
      for (const candidate of response.candidates) {
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData) {
              imageData = part.inlineData;
              break;
            }
          }
        }
        if (imageData) break;
      }
    }
    
    if (!imageData) {
      throw new Error('No image data received from Gemini');
    }

    // Convert base64 to data URL
    const imageUrl = `data:${imageData.mimeType || 'image/png'};base64,${imageData.data}`;

    return NextResponse.json({ success: true, imageUrl });
  } catch (error: any) {
    console.error('Gemini image generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate image with Gemini' },
      { status: 500 }
    );
  }
}

function createGeminiPrompt(originalText: string, themeConfig: any, character: any): string {
  const themeColors = Object.values(themeConfig.colors || {}).join(', ');
  const avatarDescription = generateAvatarDescription(character);

  return `Create an image based on this real-life experience: "${originalText}"

  MAIN CHARACTER: ${avatarDescription}
  - Character must be the central focus, clearly visible and recognizable
  - Character must match the avatar description exactly

  CRITICAL CONTEXT UNDERSTANDING:
  - Analyze the activity described in the text and determine the MOST APPROPRIATE setting
  - Sports activities (soccer, basketball, tennis, etc.) need sports fields, courts, or athletic facilities
  - Water activities (fishing, swimming, boating) need water bodies (lakes, rivers, pools, oceans)
  - Romantic activities (dates, dinners, walks) need intimate, romantic settings
  - Work activities need professional environments (offices, workplaces)
  - Social activities (parties, gatherings) need celebration venues
  - Travel activities need transportation hubs or destinations
  - Cooking activities need kitchens or food preparation areas
  - Shopping activities need retail environments (stores, malls, markets)
  - Exercise activities need fitness facilities (gyms, tracks, fields)
  - Educational activities need learning environments (schools, libraries, classrooms)

  SETTING REQUIREMENTS:
  - The setting MUST be contextually appropriate for the described activity
  - Include all necessary objects, equipment, and environmental elements for the activity
  - Show the character actively engaged in the specific activity described
  - The environment should support and enhance the activity, not contradict it

  ${themeConfig.name.toUpperCase()} THEME STYLING:
  - Theme: ${themeConfig.description}
  - Colors: ${themeColors}
  - Effects: ${themeConfig.effects?.join(', ') || 'atmospheric elements'}
  - Transform the setting and atmosphere to match the ${themeConfig.name} aesthetic
  - Apply theme styling while keeping the core activity and appropriate setting recognizable
  
  SPECIFIC THEME AESTHETICS:
  ${getThemeSpecificGuidance(themeConfig.name)}

  VISUAL STYLE: 
  - Pixel art, 1024x1024, high quality, detailed
  - Character is central focus, larger and more prominent
  - Show the actual experience described in an appropriate setting
  - NO TEXT OR WORDS in the image - pure visual scene only
  - NO speech bubbles, signs, or written elements`;
}

function getThemeSpecificGuidance(themeName: string): string {
  switch (themeName.toLowerCase()) {
    case 'velour nights':
      return `- VELOUR NIGHTS AESTHETIC: Tumblr-ish, cozy, warm, intimate
      - Visual Style: Soft, warm lighting with golden/orange tones
      - Atmosphere: Cozy, comfortable, introspective, nostalgic
      - Elements: Warm string lights, soft shadows, comfortable seating, plants, books, mugs
      - Mood: Peaceful, contemplative, like a cozy evening at home
      - Lighting: Soft, diffused, warm glow from lamps or string lights
      - Colors: Warm oranges, soft purples, muted browns, cream tones
      - Avoid: Harsh lighting, cold colors, industrial elements, bright neon`;
      
    case 'neon ashes':
      return `- NEON ASHES AESTHETIC: Cyberpunk, futuristic, vibrant, high-tech
      - Visual Style: Bright neon colors, high contrast, futuristic elements
      - Atmosphere: High-tech, urban, energetic, slightly dystopian
      - Elements: Neon signs, city skylines, rain-soaked streets, holographic displays
      - Mood: Dynamic, intense, like a futuristic city at night
      - Lighting: Bright neon glows, dramatic shadows, electric lighting
      - Colors: Bright neon greens, electric blues, hot pinks, vibrant yellows
      - Avoid: Soft lighting, warm tones, cozy elements, natural materials`;
      
    case 'crimson casefiles':
      return `- CRIMSON CASEFILES AESTHETIC: Film noir, detective, mysterious, shadowy
      - Visual Style: Dark, dramatic lighting with golden accents
      - Atmosphere: Mysterious, suspenseful, classic detective story
      - Elements: Cigarette smoke, desk lamps, shadows, vintage furniture
      - Mood: Intriguing, mysterious, like a classic noir film
      - Lighting: Dramatic shadows, warm desk lamp glow, dim ambient light
      - Colors: Deep browns, golden yellows, dark reds, warm shadows
      - Avoid: Bright lighting, modern elements, cheerful colors`;
      
    case 'blazeheart saga':
      return `- BLAZEHEART SAGA AESTHETIC: Shōnen anime, energetic, heroic, vibrant
      - Visual Style: Bright, dynamic, anime-inspired with bold colors
      - Atmosphere: Energetic, heroic, determined, youthful
      - Elements: Dynamic poses, energy effects, bright backgrounds, action lines
      - Mood: Exciting, inspiring, like an anime protagonist moment
      - Lighting: Bright, dramatic, with energy effects and dynamic shadows
      - Colors: Bright oranges, fiery reds, electric blues, vibrant yellows
      - Avoid: Dark, moody tones, realistic lighting, subdued colors`;
      
    case 'echoes of dawn':
      return `- ECHOES OF DAWN AESTHETIC: Nostalgic, bittersweet, coming-of-age, soft
      - Visual Style: Soft, dreamy lighting with pastel tones
      - Atmosphere: Nostalgic, bittersweet, contemplative, gentle
      - Elements: Soft natural light, gentle shadows, organic shapes, memories
      - Mood: Melancholic but hopeful, like a memory or dream
      - Lighting: Soft, natural, like early morning or golden hour
      - Colors: Soft pastels, muted tones, gentle blues, warm creams
      - Avoid: Harsh lighting, bright colors, dramatic shadows`;
      
    case 'obsidian veil':
      return `- OBSIDIAN VEIL AESTHETIC: Dark fantasy, gothic, mysterious, mystical
      - Visual Style: Dark, atmospheric with mystical elements
      - Atmosphere: Mysterious, magical, slightly ominous, enchanting
      - Elements: Gothic architecture, mystical fog, ancient symbols, dark forests
      - Mood: Mysterious, magical, like a dark fantasy world
      - Lighting: Dramatic, mystical, with ethereal glows and deep shadows
      - Colors: Deep purples, dark blues, mystical silvers, shadowy blacks
      - Avoid: Bright lighting, cheerful colors, modern elements`;
      
    case 'starlit horizon':
      return `- STARLIT HORIZON AESTHETIC: Sci-fi, cosmic, futuristic, expansive
      - Visual Style: Cosmic, space-themed with ethereal lighting
      - Atmosphere: Vast, mysterious, cosmic, awe-inspiring
      - Elements: Stars, galaxies, cosmic phenomena, futuristic technology
      - Mood: Awe-inspiring, cosmic, like exploring the universe
      - Lighting: Ethereal, cosmic, with starlight and nebula glows
      - Colors: Deep blues, cosmic purples, starlight whites, nebula colors
      - Avoid: Earth-bound elements, natural lighting, cozy atmospheres`;
      
    case 'ivory quill':
      return `- IVORY QUILL AESTHETIC: High fantasy, medieval, magical, noble
      - Visual Style: Medieval fantasy with rich, regal colors
      - Atmosphere: Noble, magical, ancient, heroic
      - Elements: Castles, magical forests, ancient libraries, mystical creatures
      - Mood: Noble, magical, like a high fantasy adventure
      - Lighting: Warm, magical, with enchanted glows and natural light
      - Colors: Rich golds, deep greens, royal purples, ivory whites
      - Avoid: Modern elements, technology, dark themes`;
      
    case 'wild west':
      return `- WILD WEST AESTHETIC: Frontier, rustic, adventurous, lawless
      - Visual Style: Rustic, dusty, with warm earth tones
      - Atmosphere: Adventurous, lawless, rugged, frontier spirit
      - Elements: Saloons, dusty streets, horses, frontier towns, desert landscapes
      - Mood: Adventurous, rugged, like the old frontier
      - Lighting: Warm, dusty, with dramatic shadows and golden hour light
      - Colors: Dusty browns, warm oranges, desert tans, sunset reds
      - Avoid: Modern elements, bright colors, urban settings`;
      
    case 'treasure tides':
      return `- TREASURE TIDES AESTHETIC: Pirate, nautical, adventurous, maritime
      - Visual Style: Nautical, maritime with ocean-inspired colors
      - Atmosphere: Adventurous, maritime, free-spirited, swashbuckling
      - Elements: Ships, ocean waves, treasure maps, pirate flags, nautical gear
      - Mood: Adventurous, free-spirited, like a pirate adventure
      - Lighting: Dramatic, with ocean reflections and stormy skies
      - Colors: Ocean blues, deep reds, golden yellows, stormy grays
      - Avoid: Landlocked elements, modern technology, urban settings`;
      
    default:
      return `- Apply the theme's aesthetic while maintaining the core activity
      - Use the theme's color palette and atmospheric elements
      - Create a cohesive visual style that matches the theme's mood`;
  }
}

