import { db } from './db';
import { decryptText } from './encryption';

/**
 * Interface for stored usage statistics (cumulative stats that can be updated incrementally)
 */
export interface StoredUsageStats {
  // Cumulative counts
  totalAdventures: number;
  storiesCreated: number;
  scenesGenerated: number;
  longestStreak: number; // Historical maximum streak
  totalWordsWritten: number;
  
  // Dates
  firstAdventureDate: string | null; // ISO string
  lastAdventureDate: string | null; // ISO string
  
  // Activity patterns (recalculated periodically, not on every entry)
  mostActiveDay: string | null;
  mostActiveHour: number | null;
  
  // Metadata
  lastUpdated: string; // ISO string
}

/**
 * Initialize default usage stats for a new character
 */
export function getDefaultUsageStats(): StoredUsageStats {
  return {
    totalAdventures: 0,
    storiesCreated: 0,
    scenesGenerated: 0,
    longestStreak: 0,
    totalWordsWritten: 0,
    firstAdventureDate: null,
    lastAdventureDate: null,
    mostActiveDay: null,
    mostActiveHour: null,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Get current usage stats for a character, or return defaults if none exist
 */
export async function getUsageStats(characterId: string): Promise<StoredUsageStats> {
  const character = await db.character.findUnique({
    where: { id: characterId },
    select: { usageStats: true }
  });

  if (!character?.usageStats) {
    return getDefaultUsageStats();
  }

  try {
    return JSON.parse(character.usageStats);
  } catch (error) {
    console.error('Error parsing usage stats:', error);
    return getDefaultUsageStats();
  }
}

/**
 * Update usage stats incrementally when a new entry is created
 */
export async function updateUsageStatsOnEntryCreate(
  characterId: string,
  entryData: {
    outputType: string;
    reimaginedText: string | null;
    createdAt: Date;
  }
): Promise<void> {
  const currentStats = await getUsageStats(characterId);
  const now = new Date();
  
  // Increment counters
  // Chapters only count text entries, not matching chapters from scenes
  const hasChapter = entryData.reimaginedText && 
    (entryData.outputType === 'text' || entryData.outputType === 'image');
  
  const updatedStats: StoredUsageStats = {
    ...currentStats,
    totalAdventures: currentStats.totalAdventures + 1,
    storiesCreated: currentStats.storiesCreated + (entryData.outputType === 'text' ? 1 : 0),
    scenesGenerated: currentStats.scenesGenerated + (entryData.outputType === 'image' ? 1 : 0),
    lastAdventureDate: entryData.createdAt.toISOString(),
    lastUpdated: now.toISOString()
  };

  // Set first adventure date if this is the first entry
  if (!currentStats.firstAdventureDate) {
    updatedStats.firstAdventureDate = entryData.createdAt.toISOString();
  }

  // Calculate word count for text entries AND matching chapters from image entries
  if (hasChapter && entryData.reimaginedText) {
    try {
      // Decrypt if needed (reimaginedText is stored encrypted)
      const decryptedText = await decryptText(entryData.reimaginedText);
      const wordCount = decryptedText.split(/\s+/).filter(word => word.length > 0).length;
      updatedStats.totalWordsWritten = currentStats.totalWordsWritten + wordCount;
    } catch (error) {
      // If decryption fails, try counting words directly (might be plain text in some cases)
      const wordCount = entryData.reimaginedText.split(/\s+/).filter(word => word.length > 0).length;
      updatedStats.totalWordsWritten = currentStats.totalWordsWritten + wordCount;
    }
  }

  // Update longest streak - we'll recalculate this from entries when needed
  // For now, we'll keep the existing value and recalculate periodically
  // The streak calculation is complex and requires checking all entries

  // Save updated stats
  await db.character.update({
    where: { id: characterId },
    data: {
      usageStats: JSON.stringify(updatedStats)
    }
  });
}

/**
 * Recalculate streaks and activity patterns from entries
 * This should be called periodically or when needed for accurate time-dependent stats
 */
export async function recalculateStreaksAndPatterns(
  characterId: string,
  entries: Array<{ createdAt: Date }>
): Promise<{ currentStreak: number; longestStreak: number; mostActiveDay: string; mostActiveHour: number }> {
  if (entries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      mostActiveDay: 'Monday',
      mostActiveHour: 12
    };
  }

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let checkDate = new Date(today);
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.createdAt);
    entryDate.setHours(0, 0, 0, 0);
    
    if (entryDate.getTime() === checkDate.getTime()) {
      currentStreak++;
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    } else if (entryDate.getTime() < checkDate.getTime()) {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;
  
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.createdAt);
    entryDate.setHours(0, 0, 0, 0);
    
    if (lastDate === null) {
      tempStreak = 1;
    } else {
      const daysDiff = Math.floor((lastDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    lastDate = entryDate;
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Calculate activity patterns
  const dayCounts: Record<string, number> = {};
  const hourCounts: Record<number, number> = {};
  
  entries.forEach(entry => {
    const date = new Date(entry.createdAt);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const hour = date.getHours();
    
    dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  const mostActiveDay = Object.entries(dayCounts).reduce((a, b) => 
    dayCounts[a[0]] > dayCounts[b[0]] ? a : b
  )[0];
  
  const mostActiveHour = Number(Object.entries(hourCounts).reduce((a, b) => 
    hourCounts[Number(a[0])] > hourCounts[Number(b[0])] ? a : b
  )[0]);

  return {
    currentStreak,
    longestStreak,
    mostActiveDay,
    mostActiveHour
  };
}

