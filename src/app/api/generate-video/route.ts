// VIDEO GENERATION API COMMENTED OUT - TOO EXPENSIVE FOR NOW
// TODO: Re-enable when implementing paywall or when costs become more reasonable

// Export empty functions to make this a valid module
export async function POST() {
  return new Response(JSON.stringify({ error: 'Video generation temporarily disabled' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

/*
import { NextRequest, NextResponse } from 'next/server';
import RunwayML, { TaskFailedError } from '@runwayml/sdk';

export async function POST(request: NextRequest) {
  try {
    const { originalText, journeyType, theme } = await request.json();

    if (!process.env.RUNWAYML_API_KEY) {
      // Return a demo video when no API key is configured
      return NextResponse.json({
        success: true,
        videoUrl: getDemoVideoUrl(theme, journeyType),
        journeyType,
        theme
      });
    }

    // First, analyze the text intelligently (reuse the analyze-text API)
    const requestUrl = new URL(request.url);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                    `${requestUrl.protocol}//${requestUrl.host}`);
    
    const analysisResponse = await fetch(`${baseUrl}/api/analyze-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ originalText }),
    });

    let analysis;
    if (analysisResponse.ok) {
      const analysisData = await analysisResponse.json();
      analysis = analysisData.analysis;
    } else {
      // Fallback to basic analysis if API fails
      analysis = {
        people: '1-2 people',
        activity: 'general activity',
        setting: 'general location',
        mood: 'neutral',
        content: 'none',
        keyElements: ['general scene'],
        emotions: ['neutral']
      };
    }

    // Create a detailed prompt for video generation using AI analysis
    const videoPrompt = createVideoPrompt(originalText, journeyType, theme, analysis);

    // For now, we'll simulate the video generation process
    // In a real implementation, you would call the Runway ML API here
    const videoUrl = await generateVideoWithRunway(videoPrompt, theme, journeyType, analysis);

    console.log('Generated video URL:', videoUrl);

    return NextResponse.json({
      success: true,
      videoUrl,
      journeyType,
      theme
    });

  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}

async function generateVideoWithRunway(prompt: string, theme: string, journeyType: string, analysis: any): Promise<string> {
  try {
    console.log('Starting Runway ML video generation...');
    console.log('API Key present:', !!process.env.RUNWAYML_API_KEY);
    
    // Initialize Runway ML client
    const client = new RunwayML({
      apiKey: process.env.RUNWAYML_API_KEY
    });

    // First, we need to generate a base image for the video
    // We'll use the same prompt but for image generation first
    console.log('Generating base image...');
    
    // Create a much shorter prompt for Runway ML (max 1000 characters)
    const shortPrompt = createShortPrompt(prompt);
    console.log('Image prompt length:', shortPrompt.length);
    console.log('Image prompt:', shortPrompt);
    
    const imageTask = await client.textToImage
      .create({
        model: 'gen4_image',
        ratio: '1080:1920', // Portrait aspect ratio
        promptText: shortPrompt,
      })
      .waitForTaskOutput();

    if (!imageTask.output || !imageTask.output[0]) {
      throw new Error('Failed to generate base image for video');
    }

    const baseImageUrl = imageTask.output[0];
    console.log('Base image generated:', baseImageUrl);

    // Now create the video from the generated image
    console.log('Generating video from image...');
    const animationPrompt = createActiveCharacterAnimationPrompt(theme, journeyType, analysis);
    console.log('Animation prompt length:', animationPrompt.length);
    console.log('Animation prompt:', animationPrompt);
    
    const videoTask = await client.imageToVideo
      .create({
        model: 'gen4_turbo',
        promptImage: baseImageUrl,
        promptText: animationPrompt,
        ratio: '720:1280', // Portrait aspect ratio
        duration: 5, // Maximum duration for more dynamic content
      })
      .waitForTaskOutput();

    if (!videoTask.output || !videoTask.output[0]) {
      throw new Error('Failed to generate video');
    }

    const videoUrl = videoTask.output[0];
    console.log('Video generated successfully:', videoUrl);
    return videoUrl;

  } catch (error) {
    if (error instanceof TaskFailedError) {
      console.error('Runway ML task failed:', error.taskDetails);
    } else {
      console.error('Runway ML API error:', error);
    }
    // Fallback to demo video
    return getDemoVideoUrl(theme, journeyType);
  }
}

function createVideoPrompt(originalText: string, journeyType: string, theme: string, analysis: any): string {
  const themeStyles = {
    'cyberpunk': 'neon-lit futuristic cityscape, cyberpunk aesthetic, electric colors, high-tech dystopia',
    'melancholy': 'romantic sunset scene, soft pastels, emotional atmosphere, bittersweet mood',
    'dark-academia': 'gothic library or classroom, candlelit atmosphere, scholarly mystery, vintage aesthetic',
    'shonen': 'epic fantasy scene, heroic atmosphere, dramatic lighting, inspiring adventure',
    'steampunk': 'Victorian-era technology, brass and copper, steam-powered machines, industrial magic',
    'fantasy': 'mystical forest or magical realm, enchanted atmosphere, fantasy creatures, wonder-filled landscape'
  };

  const journeyStyles = {
    'fantasy': 'fantasy adventure, magical elements, mythical creatures',
    'sci-fi': 'science fiction, futuristic technology, space or advanced tech',
    'mystery': 'mysterious atmosphere, clues and intrigue, detective noir style',
    'adventure': 'exciting exploration, treasure hunting, epic journey',
    'romance': 'romantic scene, emotional connection, heartfelt moment',
    'horror': 'spooky atmosphere, dark and eerie, suspenseful mood'
  };

  const themeStyle = themeStyles[theme as keyof typeof themeStyles] || themeStyles.fantasy;
  const journeyStyle = journeyStyles[journeyType as keyof typeof journeyStyles] || journeyStyles.fantasy;

  return `Create a 5-second pixel art animation inspired by this real-life experience: "${originalText}". 
  Transform this experience into a ${journeyStyle} adventure with ${themeStyle} elements.
  
  AI Analysis Results:
  - People involved: ${analysis.people}
  - Main activity: ${analysis.activity}
  - Setting/location: ${analysis.setting}
  - Mood/emotion: ${analysis.mood}
  - Content referenced: ${analysis.content || 'none'}
  - Key visual elements: ${analysis.keyElements?.join(', ') || 'general scene'}
  - Emotions to convey: ${analysis.emotions?.join(', ') || 'neutral'}
  
  Animation Requirements:
  - Pixel art style, 16-bit retro gaming aesthetic
  - CRITICAL: Portrait orientation ONLY (tall/vertical format, NOT landscape/horizontal)
  - 5 seconds duration for maximum dynamic content
  - ACTIVE, DYNAMIC animation with continuous movement and engaging sequences
  - ABSOLUTELY NO BORDERS, FRAMES, OR EDGES - the animation should fill the entire canvas edge-to-edge
  - NO decorative borders, NO frame elements, NO card-like borders
  - The scene should extend all the way to the edges of the video
  - Vibrant, clean pixel art colors
  - Each pixel should be clearly visible and distinct
  
  Dynamic Animation Guidelines:
  - Include exactly: ${analysis.people}
  - Show the activity: ${analysis.activity} with HIGHLY ACTIVE, LIVELY CHARACTER MOVEMENTS
  - Set the scene: ${analysis.setting} with dynamic camera work
  - Convey the mood: ${analysis.mood} through active character expressions and body language
  ${analysis.content && analysis.content !== 'none' ? `- Include references to: ${analysis.content}` : ''}
  - Include these visual elements: ${analysis.keyElements?.join(', ') || 'general scene elements'}
  - Convey these emotions: ${analysis.emotions?.join(', ') || 'neutral'}
  - Transform into a ${journeyStyle} adventure while keeping the core meaning
  - Use ${themeStyle} visual elements and atmosphere
  - Make it feel like an ACTIVE scene from an animated RPG with LIVELY CHARACTERS
  - CRITICAL: Characters must be CONSTANTLY MOVING - waving arms, gesturing, reacting, interacting
  - Add DYNAMIC movement like: character actions, facial expressions, body language, camera movements, particle systems, environmental changes, lighting effects, and scene transitions
  - Include multiple animation layers: active character movements, foreground action, background movement, particle effects, and atmospheric changes
  - Characters should NEVER be static - they must be actively doing something at all times
  
  The animation should be a pure pixel art scene that represents your experience as an epic adventure with ACTIVE, DYNAMIC movement and engaging visual storytelling.
  
  CRITICAL: Do NOT include any borders, frames, or decorative edges. The animation must fill the entire canvas from edge to edge with no border elements whatsoever.`;
}

function createActiveCharacterAnimationPrompt(theme: string, journeyType: string, analysis: any): string {
  // Create highly active character animation prompts with specific movements
  const characterActions = {
    'bus': [
      'characters waving arms excitedly', 'people pointing at new sights', 'friends high-fiving each other',
      'characters leaning out windows', 'people taking photos with phones', 'characters dancing on bus roof',
      'friends laughing and chatting animatedly', 'characters reacting to unexpected turns',
      'people clapping hands in excitement', 'characters doing victory poses'
    ],
    'general': [
      'characters walking and running', 'people jumping and celebrating', 'characters gesturing dramatically',
      'friends hugging and interacting', 'characters pointing and exploring', 'people dancing and moving',
      'characters reacting to environment', 'friends playing and having fun', 'characters expressing emotions',
      'people moving around actively'
    ]
  };

  const environmentalEffects = {
    'cyberpunk': [
      'neon lights pulsing and flickering', 'digital particles floating around', 'holographic displays changing',
      'electric sparks flying', 'data streams flowing', 'screen glitch effects', 'neon reflections moving'
    ],
    'melancholy': [
      'soft rain falling gently', 'leaves floating in wind', 'candle flames dancing',
      'fog drifting slowly', 'water ripples spreading', 'soft light changing', 'atmospheric particles'
    ],
    'dark-academia': [
      'pages turning in wind', 'ink spreading on paper', 'candle flames flickering',
      'dust particles floating', 'mystical auras glowing', 'vintage effects', 'scholarly atmosphere'
    ],
    'shonen': [
      'energy auras pulsing', 'speed lines trailing', 'power effects glowing',
      'dramatic wind effects', 'lightning crackling', 'heroic energy bursts', 'action particles'
    ],
    'steampunk': [
      'steam clouds rising', 'gears rotating visibly', 'brass mechanisms moving',
      'steam valves releasing', 'cogs spinning', 'mechanical sparks', 'industrial atmosphere'
    ],
    'fantasy': [
      'magical sparkles floating', 'spell effects glowing', 'enchanted particles',
      'mystical auras pulsing', 'magical portals shimmering', 'creature movements', 'fantasy atmosphere'
    ]
  };

  const cameraMovements = [
    'dynamic camera following action', 'zoom in on character reactions', 'panning to show excitement',
    'close-up on character faces', 'wide shots showing full scene', 'camera shaking with movement',
    'rotating camera angles', 'dramatic camera movements'
  ];

  // Get character actions based on the activity
  const isTransport = analysis.activity?.toLowerCase().includes('bus') || 
                     analysis.activity?.toLowerCase().includes('car') || 
                     analysis.activity?.toLowerCase().includes('travel') ||
                     analysis.activity?.toLowerCase().includes('ride');
  
  const selectedCharacterActions = isTransport ? 
    characterActions.bus.slice(0, 4) : 
    characterActions.general.slice(0, 4);

  const selectedEnvironmentalEffects = environmentalEffects[theme as keyof typeof environmentalEffects] || 
    environmentalEffects.fantasy;
  const selectedEffects = selectedEnvironmentalEffects.slice(0, 3);
  const selectedCamera = cameraMovements.slice(0, 2);

  // Create a concise but highly active animation prompt (under 1000 characters)
  const activePrompt = `HIGHLY ACTIVE pixel art animation with LIVELY CHARACTERS constantly moving and interacting. Characters: ${selectedCharacterActions.join(', ')}. Effects: ${selectedEffects.join(', ')}. Camera: ${selectedCamera.join(', ')}. Show ${analysis.activity} with active character movements, facial expressions, arm waving, body language. Characters expressing ${analysis.mood} through continuous motion. No static poses - everyone actively doing something. Dynamic lighting, particle effects, environmental changes. 10 seconds of continuous character animation and interaction. No text, no writing, no words, pure active animated pixel art.`;

  // Ensure it's under 1000 characters
  return activePrompt.length > 1000 ? activePrompt.substring(0, 997) + '...' : activePrompt;
}

function createDynamicAnimationPrompt(theme: string, journeyType: string, analysis: any): string {
  // Create dynamic animation prompts based on theme and journey type
  const animationIntensities = {
    'cyberpunk': {
      movements: ['rapid glitch effects', 'neon pulse animations', 'digital rain falling', 'holographic flicker', 'electric sparks', 'data streams flowing', 'screen distortion waves'],
      camera: ['dynamic camera shake', 'zoom in/out effects', 'panning movements', 'rotating perspectives'],
      effects: ['neon glow pulsing', 'cyberpunk glitch transitions', 'digital particle explosions', 'holographic overlays']
    },
    'melancholy': {
      movements: ['gentle swaying', 'soft floating particles', 'slow rain drops', 'fog drifting', 'leaves falling', 'water ripples', 'candle flame flickering'],
      camera: ['slow zoom in', 'gentle panning', 'soft focus transitions', 'dreamy camera movements'],
      effects: ['soft glow effects', 'atmospheric mist', 'romantic lighting changes', 'emotional color shifts']
    },
    'dark-academia': {
      movements: ['pages turning', 'ink spreading', 'candle flames dancing', 'dust particles floating', 'books opening', 'quill writing', 'scrolls unrolling'],
      camera: ['dramatic zoom', 'mysterious panning', 'gothic camera angles', 'scholarly focus pulls'],
      effects: ['vintage paper aging', 'ink splatter effects', 'candlelight flicker', 'mystical aura']
    },
    'shonen': {
      movements: ['energy blasts', 'speed lines', 'power auras', 'dramatic wind effects', 'explosive impacts', 'heroic poses', 'battle sequences'],
      camera: ['dynamic action shots', 'rapid zoom effects', 'epic wide angles', 'heroic close-ups'],
      effects: ['energy bursts', 'power auras', 'speed trails', 'dramatic lighting']
    },
    'steampunk': {
      movements: ['steam clouds rising', 'gears rotating', 'pistons moving', 'brass mechanisms working', 'cogs spinning', 'steam valves releasing', 'machinery operating'],
      camera: ['industrial panning', 'mechanical zoom', 'steampunk angles', 'gear-focused shots'],
      effects: ['steam particle systems', 'brass reflections', 'mechanical glows', 'industrial atmosphere']
    },
    'fantasy': {
      movements: ['magical sparkles', 'floating orbs', 'spell casting', 'creature animations', 'magical portals', 'enchanted forests swaying', 'mystical creatures moving'],
      camera: ['magical zoom effects', 'enchanted panning', 'mystical angles', 'fantasy transitions'],
      effects: ['magical auras', 'spell effects', 'enchanted glows', 'mystical particles']
    }
  };

  const journeyIntensities = {
    'fantasy': 'epic magical sequences with spell casting and creature animations',
    'sci-fi': 'futuristic technology with holographic displays and space effects',
    'mystery': 'suspenseful movements with shadow play and dramatic reveals',
    'adventure': 'dynamic exploration with camera movements and action sequences',
    'romance': 'emotional movements with soft transitions and intimate moments',
    'horror': 'eerie animations with shadow effects and unsettling movements'
  };

  const themeAnimations = animationIntensities[theme as keyof typeof animationIntensities] || animationIntensities.fantasy;
  const journeyAnimation = journeyIntensities[journeyType as keyof typeof journeyIntensities] || journeyIntensities.fantasy;

  // Select random movements and effects for variety
  const selectedMovements = themeAnimations.movements.slice(0, 3);
  const selectedCamera = themeAnimations.camera.slice(0, 2);
  const selectedEffects = themeAnimations.effects.slice(0, 2);

  // Create a dynamic animation prompt
  const animationPrompt = `Dynamic pixel art animation with ${journeyAnimation}. 
    Include: ${selectedMovements.join(', ')}, ${selectedCamera.join(', ')}, ${selectedEffects.join(', ')}.
    Show ${analysis.activity} with active movement and ${analysis.mood} atmosphere.
    Add particle effects, camera movements, and scene transitions.
    Make it feel like an active, engaging scene with continuous motion.
    No text, no writing, no words, pure animated pixel art.`;

  return animationPrompt;
}

function createShortPrompt(longPrompt: string): string {
  // Extract the core content from the long prompt and create a concise version
  // Runway ML has a 1000 character limit for prompts
  
  // Find the original text in quotes
  const originalTextMatch = longPrompt.match(/"([^"]+)"/);
  const originalText = originalTextMatch ? originalTextMatch[1] : 'daily experience';
  
  // Find the journey type and theme
  const journeyMatch = longPrompt.match(/Transform this experience into a (\w+) adventure/);
  const journeyType = journeyMatch ? journeyMatch[1] : 'fantasy';
  
  const themeMatch = longPrompt.match(/with (\w+) elements/);
  const theme = themeMatch ? themeMatch[1] : 'magical';
  
  // Create a short, focused prompt without any text overlays
  const shortPrompt = `Pixel art scene: ${originalText} transformed into a ${journeyType} adventure with ${theme} elements. 16-bit retro gaming style, portrait orientation, no borders, no text, no writing, no words, vibrant colors.`;
  
  // Ensure it's under 1000 characters
  return shortPrompt.length > 1000 ? shortPrompt.substring(0, 997) + '...' : shortPrompt;
}

function getDemoVideoUrl(theme: string, journeyType: string): string {
  // Return working demo video URLs with more dynamic content
  const demoVideos = {
    'cyberpunk': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // More action-oriented
    'melancholy': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', // Dreamy and atmospheric
    'dark-academia': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', // Mysterious and dynamic
    'shonen': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', // High energy
    'steampunk': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', // Industrial and dynamic
    'fantasy': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' // Classic animated adventure
  };
  
  return demoVideos[theme as keyof typeof demoVideos] || demoVideos.fantasy;
}
*/
