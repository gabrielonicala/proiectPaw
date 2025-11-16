/**
 * Daily usage tracking functions
 * Tracks chapters and scenes per user per day, independent of entries
 */

import { db } from './db';
import { getUserDate, getNextResetTime } from './timezone-utils';

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
  subscriptionPlan: string = 'free'
): Promise<DailyUsageData> {
  const usage = await getOrCreateDailyUsage(userId, userTimezone);
  
  // Define limits based on subscription plan
  const limits = {
    free: { chapters: 5, scenes: 3 },
    tribute: { chapters: 30, scenes: 30 },
    // Add more plans as needed
  };
  
  const planLimits = limits[subscriptionPlan as keyof typeof limits] || limits.free;
  
  // Get next reset time
  const nextResetAt = getNextResetTime(userTimezone);
  
  return {
    chapters: usage.chapters,
    scenes: usage.scenes,
    chaptersLimit: planLimits.chapters,
    scenesLimit: planLimits.scenes,
    nextResetAt,
  };
}

/**
 * Check if user can create more entries of a given type
 */
export async function canCreateEntry(
  userId: string,
  type: 'chapters' | 'scenes',
  userTimezone: string = 'UTC',
  subscriptionPlan: string = 'free'
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const usage = await getOrCreateDailyUsage(userId, userTimezone);
  
  const limits = {
    free: { chapters: 5, scenes: 3 },
    tribute: { chapters: 30, scenes: 30 },
  };
  
  const planLimits = limits[subscriptionPlan as keyof typeof limits] || limits.free;
  const limit = planLimits[type];
  const used = type === 'chapters' ? usage.chapters : usage.scenes;
  const remaining = Math.max(0, limit - used);
  
  return {
    allowed: used < limit,
    remaining,
    limit,
  };
}

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

