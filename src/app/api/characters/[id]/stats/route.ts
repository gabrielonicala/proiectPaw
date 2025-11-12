import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getUsageStats, recalculateStreaksAndPatterns } from '@/lib/usage-stats';
import { calculateCharacterStats, CharacterStats } from '@/lib/character-stats';
import { decryptText } from '@/lib/encryption';
import { Character, JournalEntry } from '@/types';

/**
 * GET /api/characters/[id]/stats
 * Get computed character statistics (combines stored stats with time-dependent calculations)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session as { user: { id: string } }).user.id;
    const { id: characterId } = await params;

    // Verify the character belongs to the user
    const character = await db.character.findUnique({
      where: { id: characterId },
      select: {
        id: true,
        userId: true,
        name: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
        appearance: true,
        pronouns: true,
        isActive: true,
        stats: true
      }
    });

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    if (character.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get stored usage stats
    const storedStats = await getUsageStats(characterId);

    // Get entries for time-dependent calculations (only need dates, not full content)
    const entries = await db.journalEntry.findMany({
      where: { characterId },
      select: {
        id: true,
        createdAt: true,
        outputType: true,
        reimaginedText: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Recalculate streaks and activity patterns from entries
    const { currentStreak, longestStreak, mostActiveDay, mostActiveHour } = 
      await recalculateStreaksAndPatterns(characterId, entries);

    // Update stored longest streak if it's higher
    if (longestStreak > storedStats.longestStreak) {
      const updatedStats = {
        ...storedStats,
        longestStreak,
        mostActiveDay,
        mostActiveHour
      };
      await db.character.update({
        where: { id: characterId },
        data: {
          usageStats: JSON.stringify(updatedStats)
        }
      });
      storedStats.longestStreak = longestStreak;
      storedStats.mostActiveDay = mostActiveDay;
      storedStats.mostActiveHour = mostActiveHour;
    }

    // Calculate time-dependent stats
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const adventuresThisWeek = entries.filter(entry => 
      new Date(entry.createdAt) >= weekAgo
    ).length;

    const adventuresThisMonth = entries.filter(entry => 
      new Date(entry.createdAt) >= monthAgo
    ).length;

    // Calculate character age
    const characterAge = Math.floor(
      (now.getTime() - new Date(character.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate average adventures per week
    const weeksSinceCreation = Math.max(1, Math.floor(characterAge / 7));
    const averageAdventuresPerWeek = storedStats.totalAdventures / weeksSinceCreation;

    // Calculate average story length
    const storiesCreated = storedStats.storiesCreated;
    const averageStoryLength = storiesCreated > 0 
      ? storedStats.totalWordsWritten / storiesCreated 
      : 0;

    // Get first and last adventure dates
    const firstAdventure = storedStats.firstAdventureDate 
      ? new Date(storedStats.firstAdventureDate) 
      : null;
    const lastAdventure = storedStats.lastAdventureDate 
      ? new Date(storedStats.lastAdventureDate) 
      : null;

    // Extract favorite topics (simplified - could be enhanced)
    const favoriteTopics: string[] = [];
    // For now, we'll skip topic extraction as it requires decrypting all entries
    // This could be cached separately or calculated periodically

    // Get user subscription for achievements
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionPlan: true,
        subscriptionStatus: true
      }
    });

    // Generate achievements (using the existing function)
    // We need to convert entries to the format expected by calculateCharacterStats
    const characterForStats: Character = {
      id: character.id,
      userId: character.userId,
      name: character.name,
      theme: character.theme as any,
      appearance: character.appearance as 'masculine' | 'feminine' | 'androgynous' | 'custom',
      pronouns: character.pronouns as 'he/him' | 'she/her' | 'they/them' | 'custom',
      isActive: character.isActive,
      createdAt: character.createdAt,
      updatedAt: character.updatedAt,
      stats: character.stats ? JSON.parse(character.stats) : null
    };

    const entriesForStats: JournalEntry[] = entries.map(entry => ({
      id: entry.id,
      userId: userId,
      characterId: characterId,
      createdAt: entry.createdAt,
      updatedAt: entry.createdAt, // Use createdAt as fallback
      outputType: entry.outputType as 'text' | 'image' | 'coming-soon',
      originalText: '', // Not needed for stats calculation
      reimaginedText: undefined // Not needed for stats calculation
    })) as JournalEntry[];

    // Calculate stats - but we need to manually calculate achievements with correct totalWordsWritten
    // because calculateCharacterStats only counts words from text entries, not matching chapters
    const tempStats = calculateCharacterStats(
      characterForStats,
      entriesForStats,
      user ? {
        plan: user.subscriptionPlan || 'free',
        status: user.subscriptionStatus || 'inactive'
      } : undefined
    );
    
    // Recalculate achievements with correct totalWordsWritten (includes matching chapters from scenes)
    const { generateAchievements } = await import('@/lib/character-stats');
    const achievements = generateAchievements(
      characterForStats,
      entriesForStats,
      {
        totalAdventures: storedStats.totalAdventures,
        storiesCreated: storedStats.storiesCreated,
        scenesGenerated: storedStats.scenesGenerated,
        currentStreak,
        longestStreak: storedStats.longestStreak,
        characterAge,
        totalWordsWritten: storedStats.totalWordsWritten // Use stored value that includes matching chapters
      },
      user ? {
        plan: user.subscriptionPlan || 'free',
        status: user.subscriptionStatus || 'inactive'
      } : undefined
    );
    
    const fullStats = {
      ...tempStats,
      totalWordsWritten: storedStats.totalWordsWritten,
      achievements
    };

    // Combine stored stats with computed time-dependent stats
    const computedStats: CharacterStats = {
      // From stored stats
      totalAdventures: storedStats.totalAdventures,
      storiesCreated: storedStats.storiesCreated,
      scenesGenerated: storedStats.scenesGenerated,
      longestStreak: storedStats.longestStreak,
      totalWordsWritten: storedStats.totalWordsWritten,
      
      // Time-dependent (computed)
      adventuresThisWeek,
      adventuresThisMonth,
      currentStreak,
      
      // Activity patterns
      mostActiveDay: storedStats.mostActiveDay || 'Monday',
      mostActiveHour: storedStats.mostActiveHour ?? 12,
      averageAdventuresPerWeek,
      
      // Character age
      characterAge,
      firstAdventure,
      lastAdventure,
      
      // Content analysis
      averageStoryLength,
      favoriteTopics: fullStats.favoriteTopics, // Use from full calculation
      
      // Achievements
      achievements: fullStats.achievements
    };

    return NextResponse.json({ stats: computedStats });
  } catch (error) {
    console.error('Error fetching character stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch character stats' },
      { status: 500 }
    );
  }
}

