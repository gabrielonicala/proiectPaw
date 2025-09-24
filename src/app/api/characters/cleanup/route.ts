import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with their characters
    const user = await db.user.findUnique({
      where: { id: (session as { user: { id: string } }).user.id },
      include: {
        characters: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If user has more characters than their slot limit, keep only the first N characters
    if (user.characters.length > user.characterSlots) {
      const charactersToKeep = user.characters.slice(0, user.characterSlots);
      const charactersToDelete = user.characters.slice(user.characterSlots);

      // Delete excess characters (this will cascade delete their journal entries)
      await db.character.deleteMany({
        where: {
          id: {
            in: charactersToDelete.map(char => char.id)
          }
        }
      });

      // Update active character if it was deleted
      if (user.activeCharacterId && charactersToDelete.some(char => char.id === user.activeCharacterId)) {
        await db.user.update({
          where: { id: user.id },
          data: {
            activeCharacterId: charactersToKeep[0]?.id || null
          }
        });
      }

      return NextResponse.json({ 
        success: true,
        message: `Removed ${charactersToDelete.length} excess characters`,
        charactersKept: charactersToKeep.length
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'No cleanup needed',
      charactersKept: user.characters.length
    });

  } catch (error) {
    console.error('Error cleaning up characters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
