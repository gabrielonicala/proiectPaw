import { JournalEntry, Character } from '@/types';

export interface CharacterStats {
  // Basic counts
  totalAdventures: number;
  storiesCreated: number;
  scenesGenerated: number;
  
  // Time-based stats
  adventuresThisWeek: number;
  adventuresThisMonth: number;
  currentStreak: number;
  longestStreak: number;
  
  // Activity patterns
  mostActiveDay: string;
  mostActiveHour: number;
  averageAdventuresPerWeek: number;
  
  // Character age
  characterAge: number; // in days
  firstAdventure: Date | null;
  lastAdventure: Date | null;
  
  // Content analysis
  averageStoryLength: number;
  totalWordsWritten: number;
  favoriteTopics: string[];
  
  // Achievements
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date | null;
  category: 'milestone' | 'streak' | 'content' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isSpecial?: boolean; // For Unbound Adventurer exclusive achievements
}

export function calculateCharacterStats(
  character: Character, 
  allEntries: JournalEntry[], 
  userSubscription?: {
    plan: string;
    status: string;
  }
): CharacterStats {
  // Filter entries for this character
  const characterEntries = allEntries.filter(entry => entry.characterId === character.id);
  
  // Basic counts
  const totalAdventures = characterEntries.length;
  const storiesCreated = characterEntries.filter(entry => entry.outputType === 'text').length;
  const scenesGenerated = characterEntries.filter(entry => entry.outputType === 'image').length;
  
  // Time-based calculations
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const adventuresThisWeek = characterEntries.filter(entry => 
    new Date(entry.createdAt) >= weekAgo
  ).length;
  
  const adventuresThisMonth = characterEntries.filter(entry => 
    new Date(entry.createdAt) >= monthAgo
  ).length;
  
  // Streak calculation
  const { currentStreak, longestStreak } = calculateStreaks(characterEntries);
  
  // Activity patterns
  const { mostActiveDay, mostActiveHour } = calculateActivityPatterns(characterEntries);
  
  // Character age
  const characterAge = Math.floor((now.getTime() - new Date(character.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  
  // Adventure dates
  const firstAdventure = characterEntries.length > 0 
    ? new Date(Math.min(...characterEntries.map(e => new Date(e.createdAt).getTime())))
    : null;
  const lastAdventure = characterEntries.length > 0
    ? new Date(Math.max(...characterEntries.map(e => new Date(e.createdAt).getTime())))
    : null;
  
  // Content analysis
  const storyEntries = characterEntries.filter(entry => entry.outputType === 'text' && entry.reimaginedText);
  const totalWordsWritten = storyEntries.reduce((total, entry) => 
    total + (entry.reimaginedText?.split(' ').length || 0), 0
  );
  const averageStoryLength = storyEntries.length > 0 ? totalWordsWritten / storyEntries.length : 0;
  
  // Simple topic extraction (could be enhanced with AI)
  const favoriteTopics = extractFavoriteTopics(characterEntries);
  
  // Calculate average adventures per week
  const weeksSinceCreation = Math.max(1, Math.floor(characterAge / 7));
  const averageAdventuresPerWeek = totalAdventures / weeksSinceCreation;
  
  // Generate achievements
  const achievements = generateAchievements(character, characterEntries, {
    totalAdventures,
    storiesCreated,
    scenesGenerated,
    currentStreak,
    longestStreak,
    characterAge,
    totalWordsWritten
  }, userSubscription);
  
  return {
    totalAdventures,
    storiesCreated,
    scenesGenerated,
    adventuresThisWeek,
    adventuresThisMonth,
    currentStreak,
    longestStreak,
    mostActiveDay,
    mostActiveHour,
    averageAdventuresPerWeek,
    characterAge,
    firstAdventure,
    lastAdventure,
    averageStoryLength,
    totalWordsWritten,
    favoriteTopics,
    achievements
  };
}

function calculateStreaks(entries: JournalEntry[]): { currentStreak: number; longestStreak: number } {
  if (entries.length === 0) return { currentStreak: 0, longestStreak: 0 };
  
  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check current streak
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
  
  return { currentStreak, longestStreak };
}

function calculateActivityPatterns(entries: JournalEntry[]): { mostActiveDay: string; mostActiveHour: number } {
  if (entries.length === 0) return { mostActiveDay: 'Monday', mostActiveHour: 12 };
  
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
  
  const mostActiveHour = Object.entries(hourCounts).reduce((a, b) => 
    hourCounts[Number(a[0])] > hourCounts[Number(b[0])] ? a : b
  )[0];
  
  return { mostActiveDay, mostActiveHour: Number(mostActiveHour) };
}

function extractFavoriteTopics(entries: JournalEntry[]): string[] {
  // Simple keyword extraction - could be enhanced with AI
  const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
  
  const wordCounts: Record<string, number> = {};
  
  entries.forEach(entry => {
    const text = `${entry.originalText} ${entry.reimaginedText || ''}`.toLowerCase();
    const words = text.split(/\W+/).filter(word => 
      word.length > 3 && !commonWords.has(word)
    );
    
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
  });
  
  return Object.entries(wordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

export function generateAchievements(
  character: Character, 
  entries: JournalEntry[], 
  stats: {
    totalAdventures: number;
    storiesCreated: number;
    scenesGenerated: number;
    currentStreak: number;
    longestStreak: number;
    characterAge: number;
    totalWordsWritten: number;
  },
  userSubscription?: {
    plan: string;
    status: string;
  }
): Achievement[] {
  const allAchievements: Achievement[] = [
    // Milestone achievements
    {
      id: 'first-adventure',
      name: 'First Steps',
      description: 'Created your first adventure',
      icon: '🌟',
      unlockedAt: stats.totalAdventures >= 1 ? (entries.length > 0 ? new Date(entries[0].createdAt) : new Date()) : null,
      category: 'milestone',
      rarity: 'common'
    },
    {
      id: 'adventurer',
      name: 'Adventurer',
      description: 'Created 10 adventures',
      icon: '⚔️',
      unlockedAt: stats.totalAdventures >= 10 ? new Date() : null,
      category: 'milestone',
      rarity: 'uncommon'
    },
    {
      id: 'hero',
      name: 'Hero',
      description: 'Created 50 adventures',
      icon: '🏆',
      unlockedAt: stats.totalAdventures >= 50 ? new Date() : null,
      category: 'milestone',
      rarity: 'rare'
    },
    {
      id: 'legend',
      name: 'Legend',
      description: 'Created 100 adventures',
      icon: '👑',
      unlockedAt: stats.totalAdventures >= 100 ? new Date() : null,
      category: 'milestone',
      rarity: 'epic'
    },
    // Story achievements
    {
      id: 'storyteller',
      name: 'Storyteller',
      description: 'Wrote 5 chapters',
      icon: '📖',
      unlockedAt: stats.storiesCreated >= 5 ? new Date() : null,
      category: 'content',
      rarity: 'uncommon'
    },
    {
      id: 'master-storyteller',
      name: 'Master Storyteller',
      description: 'Wrote 25 chapters',
      icon: '📚',
      unlockedAt: stats.storiesCreated >= 25 ? new Date() : null,
      category: 'content',
      rarity: 'rare'
    },
    // Scene achievements
    {
      id: 'artist',
      name: 'Artist',
      description: 'Captured 5 scenes',
      icon: '🎨',
      unlockedAt: stats.scenesGenerated >= 5 ? new Date() : null,
      category: 'content',
      rarity: 'uncommon'
    },
    {
      id: 'master-artist',
      name: 'Master Artist',
      description: 'Captured 25 scenes',
      icon: '🖼️',
      unlockedAt: stats.scenesGenerated >= 25 ? new Date() : null,
      category: 'content',
      rarity: 'rare'
    },
    // Streak achievements
    {
      id: 'dedicated',
      name: 'Dedicated',
      description: '3-day adventure streak',
      icon: '🔥',
      unlockedAt: stats.longestStreak >= 3 ? new Date() : null,
      category: 'streak',
      rarity: 'uncommon'
    },
    {
      id: 'unstoppable',
      name: 'Unstoppable',
      description: '7-day adventure streak',
      icon: '⚡',
      unlockedAt: stats.longestStreak >= 7 ? new Date() : null,
      category: 'streak',
      rarity: 'rare'
    },
    {
      id: 'legendary-streak',
      name: 'Legendary Streak',
      description: '30-day adventure streak',
      icon: '💎',
      unlockedAt: stats.longestStreak >= 30 ? new Date() : null,
      category: 'streak',
      rarity: 'legendary'
    },
    // Special achievements
    {
      id: 'veteran',
      name: 'Veteran',
      description: 'Character is 30 days old',
      icon: '🎖️',
      unlockedAt: stats.characterAge >= 30 ? new Date() : null,
      category: 'special',
      rarity: 'rare'
    },
    {
      id: 'prolific-writer',
      name: 'Prolific Writer',
      description: 'Written 1000+ words',
      icon: '✍️',
      unlockedAt: stats.totalWordsWritten >= 1000 ? new Date() : null,
      category: 'content',
      rarity: 'uncommon'
    },
    {
      id: 'master-writer',
      name: 'Master Writer',
      description: 'Written 10000+ words',
      icon: '📝',
      unlockedAt: stats.totalWordsWritten >= 10000 ? new Date() : null,
      category: 'content',
      rarity: 'epic'
    }
  ];

  // Special achievements for Unbound Adventurer subscribers
  const isUnboundAdventurer = userSubscription?.plan === 'tribute' && userSubscription?.status === 'active';
  
  if (isUnboundAdventurer) {
    const specialAchievements: Achievement[] = [
      // Attainable special achievements
      {
        id: 'premium-adventurer',
        name: 'Premium Adventurer',
        description: 'Created 25 adventures',
        icon: '💎',
        unlockedAt: stats.totalAdventures >= 25 ? new Date() : null,
        category: 'milestone',
        rarity: 'rare',
        isSpecial: true
      },
      {
        id: 'premium-storyteller',
        name: 'Premium Storyteller',
        description: 'Wrote 15 chapters',
        icon: '📚',
        unlockedAt: stats.storiesCreated >= 15 ? new Date() : null,
        category: 'content',
        rarity: 'rare',
        isSpecial: true
      },
      {
        id: 'premium-artist',
        name: 'Premium Artist',
        description: 'Captured 10 scenes',
        icon: '🎨',
        unlockedAt: stats.scenesGenerated >= 10 ? new Date() : null,
        category: 'content',
        rarity: 'rare',
        isSpecial: true
      },
      {
        id: 'premium-streak',
        name: 'Premium Streak',
        description: '15-day adventure streak',
        icon: '🔥',
        unlockedAt: stats.longestStreak >= 15 ? new Date() : null,
        category: 'streak',
        rarity: 'rare',
        isSpecial: true
      },
      {
        id: 'premium-writer',
        name: 'Premium Writer',
        description: 'Written 5000+ words',
        icon: '✍️',
        unlockedAt: stats.totalWordsWritten >= 5000 ? new Date() : null,
        category: 'content',
        rarity: 'rare',
        isSpecial: true
      },
      {
        id: 'premium-veteran',
        name: 'Premium Veteran',
        description: 'Character is 7 days old',
        icon: '🏅',
        unlockedAt: stats.characterAge >= 7 ? new Date() : null,
        category: 'special',
        rarity: 'uncommon',
        isSpecial: true
      },
      // Mid-tier special achievements
      {
        id: 'elite-adventurer',
        name: 'Elite Adventurer',
        description: 'Created 75 adventures',
        icon: '⚔️',
        unlockedAt: stats.totalAdventures >= 75 ? new Date() : null,
        category: 'milestone',
        rarity: 'epic',
        isSpecial: true
      },
      {
        id: 'elite-streak',
        name: 'Elite Streak',
        description: '30-day adventure streak',
        icon: '⚡',
        unlockedAt: stats.longestStreak >= 30 ? new Date() : null,
        category: 'streak',
        rarity: 'epic',
        isSpecial: true
      },
      {
        id: 'elite-writer',
        name: 'Elite Writer',
        description: 'Written 25000+ words',
        icon: '📝',
        unlockedAt: stats.totalWordsWritten >= 25000 ? new Date() : null,
        category: 'content',
        rarity: 'epic',
        isSpecial: true
      },
      // End-game special achievements
      {
        id: 'epic-hero',
        name: 'Epic Hero',
        description: 'Created 200 adventures',
        icon: '⚡',
        unlockedAt: stats.totalAdventures >= 200 ? new Date() : null,
        category: 'milestone',
        rarity: 'legendary',
        isSpecial: true
      },
      {
        id: 'mythic-legend',
        name: 'Mythic Legend',
        description: 'Created 500 adventures',
        icon: '🌟',
        unlockedAt: stats.totalAdventures >= 500 ? new Date() : null,
        category: 'milestone',
        rarity: 'legendary',
        isSpecial: true
      },
      {
        id: 'eternal-champion',
        name: 'Eternal Champion',
        description: 'Created 1000 adventures',
        icon: '💫',
        unlockedAt: stats.totalAdventures >= 1000 ? new Date() : null,
        category: 'milestone',
        rarity: 'legendary',
        isSpecial: true
      },
      // Elite streak achievements
      {
        id: 'streak-master',
        name: 'Streak Master',
        description: '60-day adventure streak',
        icon: '🔥',
        unlockedAt: stats.longestStreak >= 60 ? new Date() : null,
        category: 'streak',
        rarity: 'legendary',
        isSpecial: true
      },
      {
        id: 'streak-legend',
        name: 'Streak Legend',
        description: '90-day adventure streak',
        icon: '⚡',
        unlockedAt: stats.longestStreak >= 90 ? new Date() : null,
        category: 'streak',
        rarity: 'legendary',
        isSpecial: true
      },
      {
        id: 'streak-eternal',
        name: 'Eternal Streak',
        description: '365-day adventure streak',
        icon: '💎',
        unlockedAt: stats.longestStreak >= 365 ? new Date() : null,
        category: 'streak',
        rarity: 'legendary',
        isSpecial: true
      },
      // Master creator achievements
      {
        id: 'story-master',
        name: 'Story Master',
        description: 'Wrote 100 chapters',
        icon: '📚',
        unlockedAt: stats.storiesCreated >= 100 ? new Date() : null,
        category: 'content',
        rarity: 'legendary',
        isSpecial: true
      },
      {
        id: 'art-master',
        name: 'Art Master',
        description: 'Captured 100 scenes',
        icon: '🎨',
        unlockedAt: stats.scenesGenerated >= 100 ? new Date() : null,
        category: 'content',
        rarity: 'legendary',
        isSpecial: true
      },
      // Veteran achievements
      {
        id: 'ancient-veteran',
        name: 'Ancient Veteran',
        description: 'Character is 100 days old',
        icon: '🏛️',
        unlockedAt: stats.characterAge >= 100 ? new Date() : null,
        category: 'special',
        rarity: 'legendary',
        isSpecial: true
      },
      {
        id: 'eternal-veteran',
        name: 'Eternal Veteran',
        description: 'Character is 365 days old',
        icon: '⏳',
        unlockedAt: stats.characterAge >= 365 ? new Date() : null,
        category: 'special',
        rarity: 'legendary',
        isSpecial: true
      },
      // Writing achievements
      {
        id: 'word-master',
        name: 'Word Master',
        description: 'Written 50000+ words',
        icon: '✍️',
        unlockedAt: stats.totalWordsWritten >= 50000 ? new Date() : null,
        category: 'content',
        rarity: 'legendary',
        isSpecial: true
      },
      {
        id: 'word-legend',
        name: 'Word Legend',
        description: 'Written 100000+ words',
        icon: '📖',
        unlockedAt: stats.totalWordsWritten >= 100000 ? new Date() : null,
        category: 'content',
        rarity: 'legendary',
        isSpecial: true
      }
    ];
    
    allAchievements.push(...specialAchievements);
  }
  
  return allAchievements;
}
