import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { checkGeneralRateLimit, getUserIdentifier } from '@/lib/rate-limit';
import { getCharacterAccess } from '@/lib/character-access';
import { createErrorResponse } from '@/lib/error-utils';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session as { user: { id: string } }).user.id;
    console.log('Fetching characters for user:', userId);

    // Get character access information
    const accessInfo = await getCharacterAccess(userId);
    console.log('Character access info:', {
      accessibleCount: accessInfo.accessibleCharacters.length,
      lockedCount: accessInfo.lockedCharacters.length,
      totalAllowed: accessInfo.totalAllowed,
      totalOwned: accessInfo.totalOwned
    });
    
    // Parse avatar data for accessible characters
    const accessibleCharacters = accessInfo.accessibleCharacters.map(character => ({
      ...character,
      avatar: character.avatar ? JSON.parse(character.avatar) : null,
      isLocked: false
    }));

    // Parse avatar data for locked characters (for display purposes)
    const lockedCharacters = accessInfo.lockedCharacters.map(character => ({
      ...character,
      avatar: character.avatar ? JSON.parse(character.avatar) : null,
      isLocked: true
    }));

    return NextResponse.json({ 
      characters: [...accessibleCharacters, ...lockedCharacters],
      accessInfo: {
        totalAllowed: accessInfo.totalAllowed,
        totalOwned: accessInfo.totalOwned,
        accessibleCount: accessInfo.accessibleCharacters.length,
        lockedCount: accessInfo.lockedCharacters.length
      }
    });
  } catch (error) {
    const errorResponse = createErrorResponse(error, 'GET /api/characters', 500);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting for character creation
    const identifier = getUserIdentifier(session.user.id);
    const rateLimitResult = await checkGeneralRateLimit(identifier, 'create-character');
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: 'Too many character creation requests. Please try again later.',
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

    const { name, description, theme, avatar, appearance, pronouns, customPronouns } = await request.json();

    // Validate required fields
    if (!name || !theme) {
      return NextResponse.json({ error: 'Name and theme are required' }, { status: 400 });
    }

    // Check if user has available character slots
    const user = await db.user.findUnique({
      where: { id: (session as { user: { id: string } }).user.id },
      select: { characterSlots: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existingCharacters = await db.character.count({
      where: { userId: (session as { user: { id: string } }).user.id }
    });

    if (existingCharacters >= user.characterSlots) {
      return NextResponse.json({ 
        error: 'Character slot limit reached. Upgrade to create more characters.',
        currentSlots: user.characterSlots,
        currentCharacters: existingCharacters
      }, { status: 403 });
    }

    // Create the character
    const character = await db.character.create({
      data: {
        userId: (session as { user: { id: string } }).user.id,
        name,
        description,
        theme,
        avatar: avatar ? JSON.stringify(avatar) : null,
        appearance: appearance || 'androgynous',
        pronouns: pronouns || 'they/them',
        customPronouns: customPronouns || null,
        isActive: existingCharacters === 0 // First character is automatically active
      }
    });

    // Set the new character as active (for both first and subsequent characters)
    await db.user.update({
      where: { id: (session as { user: { id: string } }).user.id },
      data: { activeCharacterId: character.id }
    });

    // Set the new character as active and deactivate any previous active character
    await db.character.updateMany({
      where: { 
        userId: (session as { user: { id: string } }).user.id,
        id: { not: character.id }
      },
      data: { isActive: false }
    });

    await db.character.update({
      where: { id: character.id },
      data: { isActive: true }
    });

    // Parse avatar data if it exists
    const characterWithParsedAvatar = {
      ...character,
      avatar: character.avatar ? JSON.parse(character.avatar) : null
    };

    return NextResponse.json({ character: characterWithParsedAvatar });
  } catch (error) {
    const errorResponse = createErrorResponse(error, 'POST /api/characters', 500);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
