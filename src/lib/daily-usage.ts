/**
 * Daily usage tracking functions
 * Tracks chapters and scenes per user per day, independent of entries
 */

import { db } from './db';
import { getUserDate, getNextResetTime } from './timezone-utils';
import { hasPremiumAccess } from './paddle';
import { SUBSCRIPTION_LIMITS } from './subscription-limits';

export interface DailyUsageData {
  chapters: number;
  scenes: number;
  chaptersLimit: number;
  scenesLimit: number;
  nextResetAt: string; // ISO string for countdown
}

/**
 * Get or create daily usage record for a user
 */
export async function getOrCreateDailyUsage(
  userId: string,
  userTimezone: string = 'UTC'
): Promise<{ chapters: number; scenes: number }> {
  const userDate = getUserDate(userTimezone);
  
  // Find or create daily usage record
  let dailyUsage = await db.dailyUsage.findUnique({
    where: {
      userId_date: {
        userId,
        date: userDate,
      },
    },
  });

  if (!dailyUsage) {
    // Create new record for today
    dailyUsage = await db.dailyUsage.create({
      data: {
        userId,
        date: userDate,
        chapters: 0,
        scenes: 0,
      },
    });
  }

  return {
    chapters: dailyUsage.chapters,
    scenes: dailyUsage.scenes,
  };
}

/**
 * Increment usage counter (chapters or scenes)
 * This is called when an entry is created
 */
export async function incrementDailyUsage(
  userId: string,
  type: 'chapters' | 'scenes',
  userTimezone: string = 'UTC'
): Promise<void> {
  const userDate = getUserDate(userTimezone);
  
  // Use upsert to create if doesn't exist, update if exists
  await db.dailyUsage.upsert({
    where: {
      userId_date: {
        userId,
        date: userDate,
      },
    },
    create: {
      userId,
      date: userDate,
      chapters: type === 'chapters' ? 1 : 0,
      scenes: type === 'scenes' ? 1 : 0,
    },
    update: {
      [type]: {
        increment: 1,
      },
    },
  });
}

/**
 * Get daily usage with limits and reset time
 * Used by API endpoints to return usage data to client
 */
export async function getDailyUsageWithLimits(
  userId: string,
  userTimezone: string = 'UTC',
  user: { 
    subscriptionPlan?: string | null; 
    subscriptionStatus?: string | null; 
    subscriptionEndsAt?: Date | null 
  }
): Promise<DailyUsageData> {
  const usage = await getOrCreateDailyUsage(userId, userTimezone);
  
  // Determine limits based on premium access (not just plan type)
  let chaptersLimit: number;
  let scenesLimit: number;
  
  if (hasPremiumAccess(user)) {
    // All paid plans (weekly, monthly, yearly) always use shared limits
    chaptersLimit = SUBSCRIPTION_LIMITS.TRIBUTE.DAILY_CHAPTERS_SHARED; // 15
    scenesLimit = SUBSCRIPTION_LIMITS.TRIBUTE.DAILY_SCENES_SHARED; // 5
  } else {
    // Free plan or inactive/expired subscription
    chaptersLimit = SUBSCRIPTION_LIMITS.FREE.DAILY_CHAPTERS; // 5
    scenesLimit = SUBSCRIPTION_LIMITS.FREE.DAILY_SCENES; // 1
  }
  
  // Get next reset time
  const nextResetAt = getNextResetTime(userTimezone);
  
  return {
    chapters: usage.chapters,
    scenes: usage.scenes,
    chaptersLimit,
    scenesLimit,
    nextResetAt,
  };
}

/**
 * SUBSCRIPTION CODE - COMMENTED OUT FOR CREDITS MIGRATION - DO NOT DELETE
 * This function has been replaced with credit checks in src/lib/credits.ts
 * 
 * Check if user can create more entries of a given type
 */
/*
export async function canCreateEntry(
  userId: string,
  type: 'chapters' | 'scenes',
  userTimezone: string = 'UTC',
  user: { 
    subscriptionPlan?: string | null; 
    subscriptionStatus?: string | null; 
    subscriptionEndsAt?: Date | null 
  }
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const usage = await getOrCreateDailyUsage(userId, userTimezone);
  
  // Determine limits based on premium access (not just plan type)
  let limit: number;
  
  if (hasPremiumAccess(user)) {
    // All paid plans (weekly, monthly, yearly) always use shared limits
    limit = type === 'chapters' 
      ? SUBSCRIPTION_LIMITS.TRIBUTE.DAILY_CHAPTERS_SHARED // 15
      : SUBSCRIPTION_LIMITS.TRIBUTE.DAILY_SCENES_SHARED; // 5
  } else {
    // Free plan or inactive/expired subscription
    limit = type === 'chapters'
      ? SUBSCRIPTION_LIMITS.FREE.DAILY_CHAPTERS // 5
      : SUBSCRIPTION_LIMITS.FREE.DAILY_SCENES; // 1
  }
  
  const used = type === 'chapters' ? usage.chapters : usage.scenes;
  const remaining = Math.max(0, limit - used);
  
  return {
    allowed: used < limit,
    remaining,
    limit,
  };
}
*/

/**
 * Clean up old daily usage records
 * Deletes records older than the specified number of days
 * This should be run periodically to prevent table growth
 */
export async function cleanupOldDailyUsage(retentionDays: number = 30): Promise<{ deleted: number }> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  // Delete records older than cutoff date
  const result = await db.dailyUsage.deleteMany({
    where: {
      date: {
        lt: cutoffDate
      }
    }
  });
  
  return {
    deleted: result.count
  };
}

