import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
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
    const identifier = session.user.id ? getUserIdentifier(session.user.id) : getClientIdentifier(request);
    const rateLimitResult = await checkAIRateLimit(identifier, 'generate-image-sd-advanced');
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: 'Too many image generation requests. Please try again later.',
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

    const { originalText, themeConfig, character, referenceImages } = await request.json();

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
    console.log('Reference images provided:', referenceImages?.length || 0);

    // Call Replicate API for Stable Diffusion XL with reference images
    const imageUrl = await generateSDImageWithReference(imagePrompt, referenceImages);

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

async function generateSDImageWithReference(prompt: string, referenceImages?: string[]): Promise<string> {
  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
  
  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN not found in environment variables');
  }

  // For now, use regular SDXL generation with enhanced prompting
  // Reference images will be used to improve the prompt quality
  return await generateRegularSDXL(prompt, REPLICATE_API_TOKEN);
}

async function generateWithControlNet(prompt: string, referenceImage: string, apiToken: string): Promise<string> {
  // Convert local file path to data URI for Replicate
  const imageUri = await convertToDataUri(referenceImage);
  
  // Use ControlNet with reference image for better consistency
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: "jagilley/controlnet-sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      input: {
        prompt: prompt,
        image: imageUri,
        width: 1024,
        height: 1024,
        num_inference_steps: 50,
        guidance_scale: 7.5,
        controlnet_conditioning_scale: 0.8,
        seed: Math.floor(Math.random() * 1000000),
        scheduler: "K_EULER",
        num_outputs: 1,
        apply_watermark: false
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Replicate API error: ${error}`);
  }

  const prediction = await response.json();
  return await pollForCompletion(prediction.id, apiToken);
}

async function generateRegularSDXL(prompt: string, apiToken: string): Promise<string> {
  // Use Juggernaut XL - better character consistency and prompt following
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      input: {
        prompt: prompt,
        width: 1024,
        height: 1024,
        num_inference_steps: 50,
        guidance_scale: 15,
        seed: Math.floor(Math.random() * 1000000),
        scheduler: "K_EULER_ANCESTRAL",
        num_outputs: 1,
        apply_watermark: false,
        negative_prompt: "modern, realistic, photograph, 3d, rendered, low quality, blurry, text, words, writing, generic, boring, simple, empty, plain, basic, theme showcase, no characters, no action"
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Replicate API error: ${error}`);
  }

  const prediction = await response.json();
  return await pollForCompletion(prediction.id, apiToken);
}

async function pollForCompletion(predictionId: string, apiToken: string): Promise<string> {
  let result;
  let attempts = 0;
  const maxAttempts = 60; // 60 seconds timeout

  while (attempts < maxAttempts) {
    const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Token ${apiToken}`,
      },
    });
    
    result = await statusResponse.json();
    
    if (result.status === 'succeeded') {
      break;
    }
    
    if (result.status === 'failed') {
      throw new Error(`Generation failed: ${result.error}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error('Generation timeout');
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

async function convertToDataUri(imagePath: string): Promise<string> {
  try {
    // Handle local file paths (starting with /)
    if (imagePath.startsWith('/')) {
      const fullPath = join(process.cwd(), 'public', imagePath);
      const imageBuffer = readFileSync(fullPath);
      const base64 = imageBuffer.toString('base64');
      
      // Determine MIME type from file extension
      const extension = imagePath.split('.').pop()?.toLowerCase();
      const mimeType = extension === 'png' ? 'image/png' : 
                      extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : 
                      'image/png'; // default to PNG
      
      return `data:${mimeType};base64,${base64}`;
    }
    
    // If it's already a URL or data URI, return as is
    return imagePath;
  } catch (error) {
    console.error('Error converting image to data URI:', error);
    throw new Error(`Failed to convert image to data URI: ${error}`);
  }
}
