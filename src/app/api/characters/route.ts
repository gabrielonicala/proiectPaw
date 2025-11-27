import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { themes } from '@/themes';
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
    
    // Parse avatar and stats data for accessible characters
    const accessibleCharacters = accessInfo.accessibleCharacters.map(character => ({
      ...character,
      avatar: character.avatar ? JSON.parse(character.avatar) : null,
      stats: character.stats ? JSON.parse(character.stats) : null,
      isLocked: false
    }));

    // Parse avatar and stats data for locked characters (for display purposes)
    const lockedCharacters = accessInfo.lockedCharacters.map(character => ({
      ...character,
      avatar: character.avatar ? JSON.parse(character.avatar) : null,
      stats: character.stats ? JSON.parse(character.stats) : null,
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
    console.error('Error in GET /api/characters:', error);
    
    // If it's a "User account deleted" error, return a special response for auto-logout
    if (error instanceof Error && error.message === 'USER_ACCOUNT_DELETED') {
      return NextResponse.json({ 
        error: 'Your account has been deleted. You will be signed out automatically.',
        code: 'USER_ACCOUNT_DELETED',
        autoLogout: true
      }, { status: 401 });
    }
    
    // If it's a "User not found" error, return a more specific error
    if (error instanceof Error && error.message === 'User not found') {
      return NextResponse.json({ 
        error: 'User session is invalid. Please sign out and sign in again.',
        code: 'USER_NOT_FOUND'
      }, { status: 401 });
    }
    
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


    const { name, description, theme, avatar, appearance, pronouns, customPronouns } = await request.json();

    // Validate required fields
    if (!name || !theme) {
      return NextResponse.json({ error: 'Name and theme are required' }, { status: 400 });
    }

    // Validate character name length
    if (name.length > 15) {
      return NextResponse.json(
        { error: 'Character name must be at most 15 characters long' },
        { status: 400 }
      );
    }

    // Check if user has available character slots
    const user = await db.user.findUnique({
      where: { id: (session as { user: { id: string } }).user.id },
      select: { characterSlots: true }
    });

    if (!user) {
      console.error('User not found during character creation:', (session as { user: { id: string } }).user.id);
      return NextResponse.json({ 
        error: 'Your account has been deleted. You will be signed out automatically.',
        code: 'USER_ACCOUNT_DELETED',
        autoLogout: true
      }, { status: 401 });
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

    // Prepare default stats from theme archetype (value 5 for each)
    let statsJson: string | null = null;
    const themeConfig = themes[theme as keyof typeof themes];
    if (themeConfig?.archetype?.stats) {
      const defaultStats: Record<string, { value: number; description: string }> = {};
      Object.entries(themeConfig.archetype.stats).forEach(([statName, description]) => {
        defaultStats[statName] = { value: 10, description };
      });
      statsJson = JSON.stringify(defaultStats);
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
        stats: statsJson,
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

    // Parse avatar and stats data if they exist
    const characterWithParsedAvatar = {
      ...character,
      avatar: character.avatar ? JSON.parse(character.avatar) : null,
      stats: character.stats ? JSON.parse(character.stats as unknown as string) : null
    };

    return NextResponse.json({ character: characterWithParsedAvatar });
  } catch (error) {
    const errorResponse = createErrorResponse(error, 'POST /api/characters', 500);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
