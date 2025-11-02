import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session as { user: { id: string } }).user.id;
    
    // Get user's current database state
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
    
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionEndsAt: user.subscriptionEndsAt,
        characterSlots: user.characterSlots,
        activeCharacterId: user.activeCharacterId,
        activeCharacter: user.activeCharacter ? {
          id: user.activeCharacter.id,
          name: user.activeCharacter.name
        } : null,
        characters: user.characters.map(char => ({
          id: char.id,
          name: char.name,
          createdAt: char.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Error getting user state:', error);
    return NextResponse.json(
      { error: 'Failed to get user state' },
      { status: 500 }
    );
  }
}

















