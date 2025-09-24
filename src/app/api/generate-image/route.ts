import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ThemeConfig } from '@/types';
import { getAvatarDescription } from '@/lib/avatar-descriptions';
import { generateAvatarDescription } from '@/lib/avatar-utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { canCreateEntry } from '@/lib/subscription-limits';

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

    if (!process.env.OPENAI_API_KEY) {
      // Return a demo image when no API key is configured
      return NextResponse.json({
        success: true,
        imageUrl: getDemoImageUrl(themeConfig.id),
        theme: themeConfig.id
      });
    }

    // First, analyze the text intelligently
    // Use the request URL to determine the correct base URL
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
        characters: ['Unknown character'],
        setting: 'general location',
        mood: 'neutral'
      };
    }

    // Use theme config directly for better context

    // Create a detailed prompt for image generation using AI analysis
    const imagePrompt = createImagePrompt(originalText, themeConfig, analysis, character);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      size: "1024x1024", // Square aspect ratio to prevent rotation
      quality: "standard",
      n: 1,
    });

    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('No image generated');
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      theme: themeConfig.id
    });

  } catch (error: unknown) {
    console.error('Image generation error:', error);
    
    // Check if it's a content policy violation
    const errorObj = error as { code?: string; message?: string };
    if (errorObj.code === 'content_policy_violation' || 
        errorObj.message?.includes('safety system') || 
        errorObj.message?.includes('content policy')) {
      return NextResponse.json({
        success: false,
        error: 'content_policy_violation',
        message: 'This content cannot be visualized due to safety guidelines. Please try rephrasing your adventure in a more family-friendly way.'
      }, { status: 400 });
    }
    
    // For other errors, return generic message
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate image',
        message: 'Unable to create your scene. Please try again.'
      },
      { status: 500 }
    );
  }
}

function createImagePrompt(originalText: string, themeConfig: ThemeConfig, analysis: { mood: string; setting: string; characters: string[] }, character: any): string {
  // Use the full theme configuration for better context
  const themeName = themeConfig.name;
  const themeDescription = themeConfig.description;
  const themeEffects = themeConfig.effects?.join(', ') || '';
  const themeColors = Object.values(themeConfig.colors || {}).join(', ');

  // Generate detailed avatar description
  const avatarDescription = generateAvatarDescription(character);

  return `Transform this experience into ${themeName}: "${originalText}"

  ${themeName} THEME: ${themeConfig.description}
  ${themeConfig.detailedDescription}
  
  ${themeName} VISUAL STYLE:
  - Colors: ${themeColors}
  - Effects: ${themeConfig.effects?.join(', ') || 'mystical atmosphere'}
  - Transform the setting into gothic castles, ancient curses, mysterious shadows
  - Dark fantasy atmosphere with forbidden magic and cursed artifacts
  
  CHARACTER: ${character.name} (${character.appearance || 'androgynous'}) - ${avatarDescription}
  
  SCENE: Show the core activity but completely transformed into ${themeName} world
  
  STYLE: Pixel art, 1024x1024, dark fantasy aesthetic
  
  CRITICAL: 
  - The entire scene must be transformed into ${themeName} - gothic castles, ancient magic, mysterious shadows, not modern settings
  - NO TEXT OR WORDS in the image - pure visual scene only
  - NO speech bubbles, signs, or written elements`;
}


function extractColorFromPath(imagePath: string): string | null {
  // Try to extract color information from the image path
  const path = imagePath.toLowerCase();
  
  // Common color patterns in filenames
  const colorPatterns = {
    'red': ['red', 'crimson', 'scarlet', 'burgundy'],
    'blue': ['blue', 'navy', 'azure', 'cobalt'],
    'green': ['green', 'emerald', 'forest', 'lime'],
    'yellow': ['yellow', 'gold', 'amber', 'mustard'],
    'purple': ['purple', 'violet', 'lavender', 'plum'],
    'black': ['black', 'dark', 'shadow', 'charcoal'],
    'white': ['white', 'light', 'pale', 'ivory'],
    'brown': ['brown', 'tan', 'beige', 'khaki'],
    'gray': ['gray', 'grey', 'silver', 'ash']
  };
  
  for (const [color, patterns] of Object.entries(colorPatterns)) {
    if (patterns.some(pattern => path.includes(pattern))) {
      return color;
    }
  }
  
  return null;
}

function extractStyleFromPath(imagePath: string): string | null {
  // Try to extract style information from the image path
  const path = imagePath.toLowerCase();
  
  const stylePatterns = {
    'casual': ['casual', 'everyday', 'simple'],
    'formal': ['formal', 'dress', 'suit'],
    'armor': ['armor', 'plate', 'chain', 'leather'],
    'robes': ['robe', 'cloak', 'mantle'],
    'warrior': ['warrior', 'fighter', 'battle'],
    'mage': ['mage', 'wizard', 'magic', 'spell']
  };
  
  for (const [style, patterns] of Object.entries(stylePatterns)) {
    if (patterns.some(pattern => path.includes(pattern))) {
      return style;
    }
  }
  
  return null;
}


function getDemoImageUrl(theme: string): string {
  // Return placeholder images with card aspect ratio (portrait)
  const demoImages = {
    'cyberpunk': 'https://picsum.photos/300/500?random=1',
    'melancholy': 'https://picsum.photos/300/500?random=2', 
    'dark-academia': 'https://picsum.photos/300/500?random=3',
    'shonen': 'https://picsum.photos/300/500?random=4',
    'steampunk': 'https://picsum.photos/300/500?random=5',
    'fantasy': 'https://picsum.photos/300/500?random=6'
  };
  
  return demoImages[theme as keyof typeof demoImages] || demoImages.fantasy;
}
