import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { cleanupDuplicateRelationships } from '@/lib/character-memory';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { characterId } = await request.json();

    if (!characterId) {
      return NextResponse.json({ error: 'Character ID is required' }, { status: 400 });
    }

    // Verify the character belongs to the user
    const character = await db.character.findFirst({
      where: {
        id: characterId,
        userId: session.user.id
      }
    });

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // Clean up duplicate relationships and goals
    await cleanupDuplicateRelationships(characterId);

    return NextResponse.json({
      success: true,
      message: 'Duplicate relationships and goals cleaned up successfully'
    });

  } catch (error) {
    console.error('Cleanup duplicates error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup duplicates' },
      { status: 500 }
    );
  }
}
