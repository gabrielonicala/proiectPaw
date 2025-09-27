import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { canAccessCharacter } from '@/lib/character-access';
import { validateUserSession } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session as { user: { id: string } }).user.id;
    
    // Validate that the user still exists in the database
    const userExists = await validateUserSession(userId);
    if (!userExists) {
      return NextResponse.json({ 
        error: 'Your account has been deleted. You will be signed out automatically.',
        code: 'USER_ACCOUNT_DELETED',
        autoLogout: true
      }, { status: 401 });
    }

    const { id } = await params;

    // Verify the character belongs to the user
    const character = await db.character.findFirst({
      where: { 
        id: id,
        userId: userId 
      }
    });

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // Check if user can access this character (not locked)
    const canAccess = await canAccessCharacter(userId, id);
    if (!canAccess) {
      return NextResponse.json({ 
        error: 'Character locked', 
        message: 'This character is locked. Upgrade your plan to access all characters.' 
      }, { status: 403 });
    }

    // Update user's active character
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { activeCharacterId: id },
      include: {
        activeCharacter: true
      }
    });

    // Parse avatar data if it exists
    const characterWithParsedAvatar = {
      ...character,
      avatar: character.avatar ? JSON.parse(character.avatar) : null
    };

    return NextResponse.json({ 
      user: updatedUser,
      activeCharacter: characterWithParsedAvatar 
    });
  } catch (error) {
    console.error('Error switching character:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
