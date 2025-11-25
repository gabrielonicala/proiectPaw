import { db } from './db';
import { hasPremiumAccess } from './paddle';

// Subscription limits
export const SUBSCRIPTION_LIMITS = {
  FREE: {
    DAILY_CHAPTERS: 5,
    DAILY_SCENES: 1, // Free users get 1 scene per day
    CHARACTER_SLOTS: 1
  },
  TRIBUTE: {
    DAILY_CHAPTERS_PER_CHARACTER: 10,
    DAILY_SCENES_PER_CHARACTER: 1,
    CHARACTER_SLOTS: 3,
    // Shared limits (alternative approach)
    DAILY_CHAPTERS_SHARED: 15, // Total across all characters
    DAILY_SCENES_SHARED: 5,    // Total across all characters
  }
} as const;

// Configuration: Set to true for shared limits, false for per-character limits
// 
// PER-CHARACTER LIMITS (false):
//   - Tribute: 10 chapters + 1 scene per character (30 total chapters, 3 total scenes)
//   - Free: 5 chapters + 1 scene (shared across all characters)
//   - Encourages character diversity and exploration
//
// SHARED LIMITS (true):
//   - Tribute: 15 chapters + 5 scenes (shared across all characters)
//   - Free: 5 chapters + 1 scene (shared across all characters)
//   - Maximum flexibility, can focus on one character
//
// To toggle: Run `npx tsx scripts/toggle-limits.ts`
export const USE_SHARED_LIMITS = true;

export interface DailyUsage {
  chapters: number;
  scenes: number;
}

/**
 * Get user's daily usage for a specific date
 */
export async function getDailyUsage(
  userId: string, 
  characterId: string, 
  date: Date = new Date()
): Promise<DailyUsage> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const entries = await db.journalEntry.findMany({
    where: {
      userId,
      characterId,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    select: {
      outputType: true
    }
  });

  const usage: DailyUsage = {
    chapters: 0,
    scenes: 0
  };

  entries.forEach(entry => {
    if (entry.outputType === 'text') {
      usage.chapters++;
    } else if (entry.outputType === 'image') {
      usage.scenes++;
    }
  });

  return usage;
}

/**
 * Check if user can create a new entry of the specified type
 */
export async function canCreateEntry(
  userId: string,
  characterId: string,
  outputType: 'text' | 'image',
  userSubscriptionPlan: string = 'free'
): Promise<{ allowed: boolean; reason?: string; usage?: DailyUsage; limit?: number }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { subscriptionPlan: true, subscriptionStatus: true, subscriptionEndsAt: true }
  });

  if (!user) {
    return { allowed: false, reason: 'User not found' };
  }

  // Check if user has premium access (active subscription OR cancelled but still in grace period)
  const isActiveSubscription = hasPremiumAccess(user);
  const dailyUsage = await getDailyUsage(userId, characterId);

  if (outputType === 'text') {
    if (isActiveSubscription) {
      if (USE_SHARED_LIMITS) {
        // Tribute users: 30 chapters total per day (across all characters)
        const limit = SUBSCRIPTION_LIMITS.TRIBUTE.DAILY_CHAPTERS_SHARED;
        if (dailyUsage.chapters >= limit) {
          return {
            allowed: false,
            reason: `You've reached your daily chapter limit of ${limit} chapters. Try again tomorrow!`,
            usage: dailyUsage,
            limit
          };
        }
      } else {
        // Tribute users: 10 chapters per character per day
        const limit = SUBSCRIPTION_LIMITS.TRIBUTE.DAILY_CHAPTERS_PER_CHARACTER;
        if (dailyUsage.chapters >= limit) {
          return {
            allowed: false,
            reason: `You've reached your daily chapter limit of ${limit} chapters for this character. Try again tomorrow or switch to another character.`,
            usage: dailyUsage,
            limit
          };
        }
      }
    } else {
      // Free users: 5 chapters total per day (across all characters)
      const limit = SUBSCRIPTION_LIMITS.FREE.DAILY_CHAPTERS;
      if (dailyUsage.chapters >= limit) {
        return {
          allowed: false,
          reason: `You've reached your daily chapter limit of ${limit} chapters. Upgrade to Tribute plan for unlimited chapters per character!`,
          usage: dailyUsage,
          limit
        };
      }
    }
  } else if (outputType === 'image') {
    if (isActiveSubscription) {
      if (USE_SHARED_LIMITS) {
        // Tribute users: 5 scenes total per day (across all characters)
        const limit = SUBSCRIPTION_LIMITS.TRIBUTE.DAILY_SCENES_SHARED;
        if (dailyUsage.scenes >= limit) {
          return {
            allowed: false,
            reason: `You've reached your daily scene limit of ${limit} scenes. Try again tomorrow!`,
            usage: dailyUsage,
            limit
          };
        }
      } else {
        // Tribute users: 1 scene per character per day
        const limit = SUBSCRIPTION_LIMITS.TRIBUTE.DAILY_SCENES_PER_CHARACTER;
        if (dailyUsage.scenes >= limit) {
          return {
            allowed: false,
            reason: `You've reached your daily scene limit of ${limit} scene for this character. Try again tomorrow or switch to another character.`,
            usage: dailyUsage,
            limit
          };
        }
      }
    } else {
      // Free users: 1 scene total per day (across all characters)
      const limit = SUBSCRIPTION_LIMITS.FREE.DAILY_SCENES;
      if (dailyUsage.scenes >= limit) {
        return {
          allowed: false,
          reason: `You've reached your daily scene limit of ${limit} scene. Upgrade to Tribute plan for 5 scenes per day!`,
          usage: dailyUsage,
          limit
        };
      }
    }
  }

  return { allowed: true, usage: dailyUsage };
}

/**
 * Get user's subscription limits info
 */
export async function getSubscriptionLimits(userId: string): Promise<{
  plan: string;
  isActive: boolean;
  limits: {
    dailyChapters: number;
    dailyScenes: number;
    characterSlots: number;
  };
  usage: DailyUsage;
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { 
      subscriptionPlan: true, 
      subscriptionStatus: true,
      subscriptionEndsAt: true,
      characterSlots: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if user has premium access (active subscription OR cancelled but still in grace period)
  const isActive = hasPremiumAccess(user);
  const dailyUsage = await getDailyUsage(userId, ''); // Get total daily usage

  let limits;
  if (isActive) {
    if (USE_SHARED_LIMITS) {
      limits = {
        dailyChapters: SUBSCRIPTION_LIMITS.TRIBUTE.DAILY_CHAPTERS_SHARED,
        dailyScenes: SUBSCRIPTION_LIMITS.TRIBUTE.DAILY_SCENES_SHARED,
        characterSlots: SUBSCRIPTION_LIMITS.TRIBUTE.CHARACTER_SLOTS
      };
    } else {
      limits = {
        dailyChapters: SUBSCRIPTION_LIMITS.TRIBUTE.DAILY_CHAPTERS_PER_CHARACTER,
        dailyScenes: SUBSCRIPTION_LIMITS.TRIBUTE.DAILY_SCENES_PER_CHARACTER,
        characterSlots: SUBSCRIPTION_LIMITS.TRIBUTE.CHARACTER_SLOTS
      };
    }
  } else {
    limits = {
      dailyChapters: SUBSCRIPTION_LIMITS.FREE.DAILY_CHAPTERS,
      dailyScenes: SUBSCRIPTION_LIMITS.FREE.DAILY_SCENES,
      characterSlots: SUBSCRIPTION_LIMITS.FREE.CHARACTER_SLOTS
    };
  }

  return {
    plan: user.subscriptionPlan || 'free',
    isActive,
    limits,
    usage: dailyUsage
  };
}
