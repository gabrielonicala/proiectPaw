import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getCharacterAccess, getActiveCharacter } from '@/lib/character-access';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session as { user: { id: string } }).user.id;
    
    // Get user data
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        activeCharacter: true,
        characters: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get character access info
    const accessInfo = await getCharacterAccess(userId);
    const activeCharacter = await getActiveCharacter(userId);

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionEndsAt: user.subscriptionEndsAt,
        activeCharacterId: user.activeCharacterId,
        characterSlots: user.characterSlots
      },
      characters: user.characters.map(char => ({
        id: char.id,
        name: char.name,
        theme: char.theme,
        createdAt: char.createdAt,
        isActive: char.id === user.activeCharacterId
      })),
      accessInfo: {
        accessibleCount: accessInfo.accessibleCharacters.length,
        lockedCount: accessInfo.lockedCharacters.length,
        totalAllowed: accessInfo.totalAllowed,
        totalOwned: accessInfo.totalOwned,
        accessibleCharacters: accessInfo.accessibleCharacters.map(char => ({
          id: char.id,
          name: char.name,
          theme: char.theme
        })),
        lockedCharacters: accessInfo.lockedCharacters.map(char => ({
          id: char.id,
          name: char.name,
          theme: char.theme
        }))
      },
      activeCharacter: activeCharacter ? {
        id: activeCharacter.id,
        name: activeCharacter.name,
        theme: activeCharacter.theme
      } : null
    });

  } catch (error) {
    console.error('Error in debug character access:', error);
    return NextResponse.json(
      { error: 'Failed to get character access info' },
      { status: 500 }
    );
  }
}
















