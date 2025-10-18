import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { decryptText } from '@/lib/encryption';

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

    // Decrypt stat progressions entries
    const decryptedStatProgressions = await Promise.all(
      statProgressions.map(async (progression) => ({
        ...progression,
        entry: progression.entry ? {
          ...progression.entry,
          originalText: await decryptText(progression.entry.originalText),
          reimaginedText: progression.entry.reimaginedText 
            ? await decryptText(progression.entry.reimaginedText) 
            : null
        } : null
      }))
    );

    // Decrypt recent entries
    const decryptedRecentEntries = await Promise.all(
      recentEntries.map(async (entry) => ({
        ...entry,
        originalText: await decryptText(entry.originalText),
        reimaginedText: entry.reimaginedText 
          ? await decryptText(entry.reimaginedText) 
          : null,
        statAnalysis: entry.statAnalysis ? JSON.parse(entry.statAnalysis) : null
      }))
    );

    return NextResponse.json({
      character: {
        ...character,
        stats: character.stats ? JSON.parse(character.stats) : null
      },
      statProgressions: decryptedStatProgressions,
      recentEntries: decryptedRecentEntries
    });

  } catch (error) {
    console.error('Error in debug stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
