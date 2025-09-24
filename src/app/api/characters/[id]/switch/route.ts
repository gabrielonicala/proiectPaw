import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { canAccessCharacter } from '@/lib/character-access';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify the character belongs to the user
    const character = await db.character.findFirst({
      where: { 
        id: id,
        userId: (session as { user: { id: string } }).user.id 
      }
    });

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // Check if user can access this character (not locked)
    const canAccess = await canAccessCharacter((session as { user: { id: string } }).user.id, id);
    if (!canAccess) {
      return NextResponse.json({ 
        error: 'Character locked', 
        message: 'This character is locked. Upgrade your plan to access all characters.' 
      }, { status: 403 });
    }

    // Update user's active character
    const updatedUser = await db.user.update({
      where: { id: (session as { user: { id: string } }).user.id },
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
