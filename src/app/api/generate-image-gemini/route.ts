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


    const { originalText, themeConfig, character, generatedChapter } = await request.json();

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
    // Use generated chapter if available, otherwise fall back to original text
    const sceneText = generatedChapter || originalText;
    const prompt = createGeminiPrompt(sceneText, themeConfig, character, generatedChapter ? true : false);

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

function createGeminiPrompt(sceneText: string, themeConfig: any, character: any, isFromChapter: boolean = false): string {
  const avatarDescription = generateAvatarDescription(character);
  const themePrompt = getThemePrompt(themeConfig, sceneText, avatarDescription, isFromChapter);
  
  return themePrompt;
}

function getThemePrompt(themeConfig: any, sceneText: string, avatarDescription: string, isFromChapter: boolean = false): string {
  const styleDesc = getThemeStyleDescription(themeConfig.id);
  const inspirations = getThemeInspirations(themeConfig.id);
  
  const sceneIntro = isFromChapter 
    ? `Scene from generated story: ${sceneText}`
    : `Scene: ${sceneText}`;
  
  const reimagineInstruction = isFromChapter
    ? `Visualize this fantasy chapter as a detailed illustration.`
    : `Reimagine this real-world experience naturally within that world.`;
  
  return `Generate a high-quality digital illustration in ${styleDesc} style.

${sceneIntro}

${reimagineInstruction} 

Let the environment, objects, and attire adapt organically to the ${styleDesc} aesthetic.

Style inspiration: ${inspirations}.

User's avatar: ${avatarDescription}

- Character remains central and clearly visible

- Character preserves the avatar's general colors while the outfit is transformed to fit the ${styleDesc} setting. IMPORTANT: it is mandatory to preserve the skin color. 

Visual style: detailed digital art, cinematic composition, 1024x1024, no text or lettering.

Cinematography:

- Avoid direct eye contact with the viewer.

- Frame the character at a natural angle (three-quarter, profile, or motion shot) to create depth and realism.`;
}

function getThemeStyleDescription(themeId: string): string {
  switch (themeId) {
    case 'neon-ashes':
      return 'a neon-noir cyberpunk dystopia';
    case 'crimson-casefiles':
      return 'a hard-boiled detective noir';
    case 'blazeheart-saga':
      return 'an anime samurai inspired';
    case 'obsidian-veil':
      return 'a gothic dark fantasy';
    case 'starlit-horizon':
      return 'an exploratory space science fiction';
    case 'ivory-quill':
      return 'a scholarly high fantasy';
    case 'wild-west':
      return 'a frontier western';
    case 'crimson-tides':
      return 'a high seas adventure';
    default:
      return 'a fantasy';
  }
}

function getThemeInspirations(themeId: string): string {
  switch (themeId) {
    case 'neon-ashes':
      return 'Blade Runner 2049, Ghost in the Shell, Cyberpunk 2077';
    case 'crimson-casefiles':
      return 'Cowboy Bebop, LA Noire, The Big Sleep';
    case 'blazeheart-saga':
      return 'Rurouni Kenshin, Inuyasha, Yu Yu Hakusho';
    case 'obsidian-veil':
      return 'Castlevania, Bloodborne, Dark Souls III';
    case 'starlit-horizon':
      return 'Interstellar, The Expanse, Starfield';
    case 'ivory-quill':
      return 'Fullmetal Alchemist, Elden Ring, The Witcher 3';
    case 'wild-west':
      return 'Trigun Stampede, Red Dead Redemption 2, The Good the Bad and the Ugly';
    case 'crimson-tides':
      return 'One Piece, Sea of Thieves, Pirates of the Caribbean';
    default:
      return 'fantasy media';
  }
}

// OLD IMPLEMENTATION - COMMENTED OUT
/*
function createGeminiPrompt(originalText: string, themeConfig: any, character: any): string {
  const avatarDescription = generateAvatarDescription(character);

  return `Create an image based on this real-life experience: "${originalText}"

  MAIN CHARACTER: ${avatarDescription}
  - Character must be the central focus, clearly visible and recognizable
  - Character must match the avatar description while adapting to the given theme

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
  - Effects: ${themeConfig.effects?.join(', ') || 'atmospheric elements'}
  - Transform the setting and atmosphere to match the ${themeConfig.name} aesthetic
  - Apply theme styling while keeping the core activity and appropriate setting recognizable
  - Use colors that naturally fit the theme's mood and atmosphere
  
  SPECIFIC THEME AESTHETICS:
  ${getThemeSpecificGuidance(themeConfig)}

  VISUAL STYLE: 
  - Digital art, 1024x1024, high quality, detailed
  - Character is central focus
  - Show the actual experience described in an appropriate setting
  - NO TEXT OR WORDS in the image - pure visual scene only
  - NO speech bubbles, signs, or written elements`;
}
*/

// OLD THEME GUIDANCE FUNCTION - COMMENTED OUT
/*
function getThemeSpecificGuidance(themeConfig: any): string {
  const THEME_STYLE_LABEL: Record<string, string> = {
    'wild-west': 'Lawless Frontier Western',
    'crimson-tides': 'Seafaring Pirate Epic',
    'blazeheart-saga': 'Edo Samurai',
    'crimson-casefiles': 'Gritty 1940s Detective',
    'ivory-quill': 'Scholarly arcane',
    'neon-ashes': 'Cyberpunk Dystopia',
    'obsidian-veil': 'Whispered Eldritch Fantasy',
    'starlit-horizon': 'Interstellar Discovery Fiction'
  };
  
  const themeLabel = THEME_STYLE_LABEL[themeConfig.id] || themeConfig.name || 'Fantasy';
  
  switch (themeConfig.id) {
    case 'neon-ashes':
      return `- ${themeLabel.toUpperCase()} STYLE:
      - Visual Style: Grounded cyberpunk with human-scale elements, rain-kissed streets, passive scanners, data terminals
      - Atmosphere: Near-future city where screens hum with secrets, surveillance is subtle but present
      - Elements: Datachips, terminals, blackout zones, rooftop gardens, payphones, ghost processes, biometric systems
      - Mood: Quiet resistance, clever subterfuge, finding connection despite isolation
      - Lighting: Neon glows from signs and displays, dim ambient with occasional electric bursts
      - Transformation: Ordinary activities become quiet acts of navigation through surveillance and corporate power
      - Avoid: Over-the-top sci-fi spectacle, spaceships, aliens, pure fantasy elements`;
      
    case 'crimson-casefiles':
      return `- ${themeLabel.toUpperCase()} STYLE:
      - Visual Style: Classic film noir with shadowy contrasts, vintage detective aesthetics
      - Atmosphere: Mystery and intrigue where every detail matters, nothing is as it seems
      - Elements: Cigarette smoke, desk lamps casting warm pools of light, shadows, vintage furniture, city streets at night
      - Mood: Suspenseful, intriguing, the satisfaction of uncovering truth through deduction
      - Lighting: Dramatic shadows with golden desk lamp glows, dim ambient light, silhouettes
      - Transformation: Daily experiences become detective investigations filled with hidden clues and unexpected twists
      - Avoid: Bright modern lighting, cheerful colors, high-tech elements`;
      
    case 'blazeheart-saga':
      return `- ${themeLabel.toUpperCase()} STYLE:
      - Visual Style: Traditional Japanese aesthetics with clean lines, honor-bound atmosphere
      - Atmosphere: Disciplined, meditative, every moment a lesson in bushido and self-mastery
      - Elements: Dojos, cherry blossoms, traditional architecture, training grounds, katana, tea ceremony settings, ancient scrolls
      - Mood: Focused, dignified, the weight of honor and the discipline of daily practice
      - Lighting: Balanced natural light, dramatic shadows, clear definition, candlelit interiors
      - Transformation: Ordinary activities become samurai training, meditation, and moments of profound wisdom
      - Avoid: Chaotic action scenes, modern technology, lack of restraint or discipline`;
      
    case 'obsidian-veil':
      return `- ${themeLabel.toUpperCase()} STYLE:
      - Visual Style: Dark fantasy with intimate gothic elements, mystical shadows, quiet dread
      - Atmosphere: Velvet black where prayers taste of iron, names carry debt, power arrives politely
      - Elements: Chapels that listen, relics that hunger, mirrors that remember, ancient symbols, dark forests, locked rooms
      - Mood: Mysterious, patient temptation, the thin line between protection and possession
      - Lighting: Dramatic shadows, candlelight that refuses to die, ethereal glows, deep blacks
      - Transformation: Daily moments become intimate dark fantasy tales about secrecy, cost, and bargains with consequences
      - Avoid: Bright lighting, cheerful colors, modern elements, pure horror jump scares`;
      
    case 'starlit-horizon':
      return `- ${themeLabel.toUpperCase()} STYLE:
      - Visual Style: Grounded science fiction, quiet starships, lonely outposts, cosmic wonder
      - Atmosphere: Vast skies that never end, making small choices that matter on a cosmic scale
      - Elements: Starships, navigation consoles, beacons, damaged panels, starfields, signal frequencies, survey drones
      - Mood: Awe-inspiring discovery, human ingenuity over destiny, steady work of exploration
      - Lighting: Ethereal cosmic light, starlight, nebula glows, instrument panel illumination
      - Transformation: Ordinary tasks become navigation, adaptation, and charting courses through the unknown
      - Avoid: Over-the-top space battles, pure fantasy magic, cozy earth-bound atmospheres`;
      
    case 'ivory-quill':
      return `- ${themeLabel.toUpperCase()} STYLE:
      - Visual Style: High fantasy medieval with scholarly magical elements, ancient wisdom
      - Atmosphere: Magic flows through ancient tomes, every word holds power, knowledge as weapon
      - Elements: Mystical libraries, ancient scrolls, noble courts, magical academies, legendary artifacts, spell books
      - Mood: Noble, scholarly, the eternal dance between knowledge and power
      - Lighting: Warm candlelit libraries, enchanted glows, natural light filtering through stained glass
      - Transformation: Daily experiences become scholarly pursuits, magical study, and uncovering lost spells
      - Avoid: Modern technology, dark horror themes, overly brutal settings`;
      
    case 'wild-west':
      return `- ${themeLabel.toUpperCase()} STYLE:
      - Visual Style: Rustic frontier with dusty earth tones, lawless but grounded
      - Atmosphere: Dust on boots, sun at back, towns that remember names, grit and reputation
      - Elements: Saloons, dusty streets, horses, frontier towns, desert landscapes, livery stables, general stores
      - Mood: Adventurous, rugged, the long road between what's legal and what's right
      - Lighting: Warm dusty light, dramatic shadows, golden hour sunsets, lantern light
      - Transformation: Ordinary moments become frontier stories about grit, barter, and quiet favors
      - Avoid: Modern elements, bright urban colors, futuristic technology`;
      
    case 'crimson-tides':
      return `- ${themeLabel.toUpperCase()} STYLE:
      - Visual Style: Nautical maritime with salt-worn aesthetics, ocean-bound adventure
      - Atmosphere: Hoist canvas and read the waters, clever work over brute force, maps that don't agree
      - Elements: Ships, ocean waves, treasure maps, pirate flags, nautical gear, harbors, compasses, logbooks
      - Mood: Adventurous, maritime, patient with the wind, trust earned on the line
      - Lighting: Dramatic ocean lighting, stormy skies, lantern glow on deck, ocean reflections
      - Transformation: Daily activities become salt-worn tales of seamanship, codes in logbooks, hidden coves
      - Avoid: Landlocked elements, modern technology, urban city settings`;
      
    default:
      return `- Apply the theme's aesthetic while maintaining the core activity
      - Use atmospheric elements that match the theme's mood and atmosphere
      - Create a cohesive visual style that naturally fits the theme
      - Transform the setting naturally while keeping the activity recognizable`;
  }
}
*/

