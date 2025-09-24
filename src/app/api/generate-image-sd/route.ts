import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { checkAIRateLimit, getClientIdentifier, getUserIdentifier } from '@/lib/rate-limit';
import { canCreateEntry } from '@/lib/subscription-limits';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting - use user ID for authenticated requests, IP for others
    const identifier = session.user.id ? getUserIdentifier(session.user.id) : getClientIdentifier(request);, 
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

    if (!originalText || !themeConfig || !character) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Generate image prompt optimized for Stable Diffusion
    const imagePrompt = createSDPrompt(originalText, themeConfig, character);
    
    console.log('Stable Diffusion prompt:', imagePrompt);

    // Call Replicate API for Stable Diffusion XL
    const imageUrl = await generateSDImage(imagePrompt);

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Stable Diffusion generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}

function createSDPrompt(originalText: string, themeConfig: any, character: any): string {
  const themeName = themeConfig.name;
  const themeColors = Object.values(themeConfig.colors || {}).join(', ');

  // Generate detailed avatar description
  const avatarDescription = generateAvatarDescription(character);

  return `A scene showing: ${originalText}

  Character: ${avatarDescription}
  
  Theme: ${themeConfig.description}
  Colors: ${themeColors}
  Effects: ${themeConfig.effects?.join(', ') || 'atmospheric elements'}

  Style: Digital art, 1024x1024, high quality, detailed
  
  Show the character doing the activity in the themed environment. Character is central focus. No text or words.`;
}

async function generateSDImage(prompt: string): Promise<string> {
  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
  
  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN not found in environment variables');
  }

  // Use Stable Diffusion XL with reference image support
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", // SDXL base model
      input: {
        prompt: prompt,
        width: 1024,
        height: 1024,
        num_inference_steps: 50,
        guidance_scale: 15,
        seed: Math.floor(Math.random() * 1000000), // Random seed for variety
        scheduler: "K_EULER_ANCESTRAL",
        num_outputs: 1,
        apply_watermark: false,
        negative_prompt: "modern, realistic, photograph, 3d, rendered, low quality, blurry, text, words, writing, generic, boring, simple, empty, plain, basic"
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Replicate API error: ${error}`);
  }

  const prediction = await response.json();
  
  // Poll for completion
  let result = prediction;
  while (result.status === 'starting' || result.status === 'processing') {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      },
    });
    
    result = await statusResponse.json();
  }

  if (result.status === 'failed') {
    throw new Error(`Generation failed: ${result.error}`);
  }

  if (!result.output || result.output.length === 0) {
    throw new Error('No image generated');
  }

  return result.output[0];
}

function generateAvatarDescription(character: any): string {
  try {
    // Parse the avatar data if it's a JSON string
    const avatarData = typeof character.avatar === 'string' 
      ? JSON.parse(character.avatar) 
      : character.avatar;

    if (!avatarData || !avatarData.options || !avatarData.options.layeredAvatar) {
      return `A ${character.appearance || 'androgynous'} character with basic appearance`;
    }

    const { head, torso, legs } = avatarData.options.layeredAvatar;
    const appearance = character.appearance || 'androgynous';
    
    const parts = [];
    
    if (head) {
      const headDesc = generatePieceDescription(head, 'head');
      parts.push(headDesc);
    }
    if (torso) {
      const torsoDesc = generatePieceDescription(torso, 'torso');
      parts.push(torsoDesc);
    }
    if (legs) {
      const legsDesc = generatePieceDescription(legs, 'legs');
      parts.push(legsDesc);
    }
    
    if (parts.length === 0) {
      return `A ${appearance} character with basic appearance`;
    }
    
    const description = `A ${appearance} character with ${parts.join(', ')}`;
    console.log('Generated avatar description:', description);
    return description;
    
  } catch (error) {
    console.error('Error generating avatar description:', error);
    return `A ${character.appearance || 'androgynous'} character with custom appearance`;
  }
}

function generatePieceDescription(piece: any, category: string): string {
  console.log(`Generating description for ${category}:`, piece);
  
  // Get descriptive name from mapping or use fallback
  const descriptiveName = getDescriptiveName(piece.id, piece.name);
  const gender = piece.gender || 'unisex';
  
  // Create description based on the descriptive name
  if (category === 'head') {
    return `a ${gender === 'male' ? 'masculine' : gender === 'female' ? 'feminine' : 'neutral'} styled head with ${descriptiveName}`;
  } else if (category === 'torso') {
    return `wearing ${descriptiveName}`;
  } else if (category === 'legs') {
    return `${descriptiveName}`;
  }
  
  return descriptiveName;
}

function getDescriptiveName(id: string, fallbackName: string): string {
  // Import the avatar descriptions
  const { avatarDescriptions } = require('@/lib/avatar-descriptions');
  
  return avatarDescriptions[id] || fallbackName;
}
