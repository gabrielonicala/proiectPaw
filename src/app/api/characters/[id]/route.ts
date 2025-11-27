import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, avatar } = await request.json();
    const { id } = await params;

    // Validate character name length if provided
    if (name && name.length > 15) {
      return NextResponse.json(
        { error: 'Character name must be at most 15 characters long' },
        { status: 400 }
      );
    }

    // Verify the character belongs to the user
    const existingCharacter = await db.character.findFirst({
      where: { 
        id: id,
        userId: (session as { user: { id: string } }).user.id 
      }
    });

    if (!existingCharacter) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // Update the character
    const updatedCharacter = await db.character.update({
      where: { id: id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(avatar && { avatar: JSON.stringify(avatar) })
      }
    });

    // Parse avatar data if it exists
    const characterWithParsedAvatar = {
      ...updatedCharacter,
      avatar: updatedCharacter.avatar ? JSON.parse(updatedCharacter.avatar) : null
    };

    return NextResponse.json({ character: characterWithParsedAvatar });
  } catch (error) {
    console.error('Error updating character:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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
    const existingCharacter = await db.character.findFirst({
      where: { 
        id: id,
        userId: (session as { user: { id: string } }).user.id 
      }
    });

    if (!existingCharacter) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // Check if this is the user's active character
    const user = await db.user.findUnique({
      where: { id: (session as { user: { id: string } }).user.id },
      select: { activeCharacterId: true }
    });

    if (user?.activeCharacterId === id) {
      // Find all other characters ordered by creation date
      const otherCharacters = await db.character.findMany({
        where: { 
          userId: (session as { user: { id: string } }).user.id,
          id: { not: id }
        },
        orderBy: { createdAt: 'asc' }
      });

      if (otherCharacters.length > 0) {
        // Get the deleted character's creation date
        const deletedCharacter = await db.character.findUnique({
          where: { id },
          select: { createdAt: true }
        });

        if (deletedCharacter) {
          // Sort all characters by creation date (oldest first)
          const allCharacters = [...otherCharacters, { id, createdAt: deletedCharacter.createdAt }]
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

          // Find the index of the deleted character
          const deletedIndex = allCharacters.findIndex(c => c.id === id);

          let adjacentCharacter = null;

          if (deletedIndex > 0) {
            // If not the first character, prefer the previous one (older)
            adjacentCharacter = otherCharacters.find(c => c.id === allCharacters[deletedIndex - 1].id);
          } else if (deletedIndex < allCharacters.length - 1) {
            // If it's the first character, use the next one (newer)
            adjacentCharacter = otherCharacters.find(c => c.id === allCharacters[deletedIndex + 1].id);
          }

          if (adjacentCharacter) {
            await db.user.update({
              where: { id: (session as { user: { id: string } }).user.id },
              data: { activeCharacterId: adjacentCharacter.id }
            });
          } else {
            // Fallback to first character if no adjacent found
            await db.user.update({
              where: { id: (session as { user: { id: string } }).user.id },
              data: { activeCharacterId: otherCharacters[0].id }
            });
          }
        } else {
          // Fallback to first character if deleted character not found
          await db.user.update({
            where: { id: (session as { user: { id: string } }).user.id },
            data: { activeCharacterId: otherCharacters[0].id }
          });
        }
      } else {
        // No other characters, set activeCharacterId to null
        await db.user.update({
          where: { id: (session as { user: { id: string } }).user.id },
          data: { activeCharacterId: null }
        });
      }
    }

    // Delete the character (this will cascade delete journal entries)
    await db.character.delete({
      where: { id: id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
