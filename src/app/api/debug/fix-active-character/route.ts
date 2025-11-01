import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session as { user: { id: string } }).user.id;
    
    // Get user's characters
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        characters: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Find the sv character
    const svCharacter = user.characters.find(char => char.name === 'sv');
    
    if (!svCharacter) {
      return NextResponse.json({ error: 'sv character not found' }, { status: 404 });
    }
    
    // Update the user's activeCharacterId to point to sv
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        activeCharacterId: svCharacter.id
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Active character set to sv',
      activeCharacterId: updatedUser.activeCharacterId,
      character: {
        id: svCharacter.id,
        name: svCharacter.name
      }
    });

  } catch (error) {
    console.error('Error fixing active character:', error);
    return NextResponse.json(
      { error: 'Failed to fix active character' },
      { status: 500 }
    );
  }
}
















