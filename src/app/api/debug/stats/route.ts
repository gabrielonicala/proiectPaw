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
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');

    if (!characterId) {
      return NextResponse.json({ error: 'Character ID required' }, { status: 400 });
    }

    // Get character info
    const character = await db.character.findFirst({
      where: { 
        id: characterId,
        userId: userId 
      },
      select: {
        id: true,
        name: true,
        theme: true,
        stats: true,
        experience: true,
        level: true
      }
    });

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // Get recent stat progressions
    const statProgressions = await db.statProgression.findMany({
      where: { characterId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        entry: {
          select: {
            id: true,
            originalText: true,
            reimaginedText: true,
            statAnalysis: true,
            expGained: true,
            createdAt: true
          }
        }
      }
    });

    // Get recent journal entries with stat analysis
    const recentEntries = await db.journalEntry.findMany({
      where: { 
        characterId,
        outputType: 'text',
        statAnalysis: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        originalText: true,
        reimaginedText: true,
        statAnalysis: true,
        expGained: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      character: {
        ...character,
        stats: character.stats ? JSON.parse(character.stats) : null
      },
      statProgressions,
      recentEntries: recentEntries.map(entry => ({
        ...entry,
        statAnalysis: entry.statAnalysis ? JSON.parse(entry.statAnalysis) : null
      }))
    });

  } catch (error) {
    console.error('Error in debug stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
