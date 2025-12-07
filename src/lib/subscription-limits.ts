// SUBSCRIPTION CODE - COMMENTED OUT FOR CREDITS MIGRATION - DO NOT DELETE
// This entire file is preserved for potential future use but is currently disabled
// All subscription limit checks have been replaced with credit checks
// 
// Stub exports to prevent import errors (used in commented-out UI code)

export const SUBSCRIPTION_LIMITS = {
  FREE: {
    DAILY_CHAPTERS: 5,
    DAILY_SCENES: 1,
    CHARACTER_SLOTS: 1
  },
  TRIBUTE: {
    DAILY_CHAPTERS_PER_CHARACTER: 10,
    DAILY_SCENES_PER_CHARACTER: 1,
    CHARACTER_SLOTS: 3,
    DAILY_CHAPTERS_SHARED: 15,
    DAILY_SCENES_SHARED: 5,
  }
} as const;

export const USE_SHARED_LIMITS = true;

export interface DailyUsage {
  chapters: number;
  scenes: number;
}

export async function getSubscriptionLimits(_userId: string): Promise<{
  plan: string;
  isActive: boolean;
  limits: {
    dailyChapters: number;
    dailyScenes: number;
    characterSlots: number;
  };
  usage: DailyUsage;
}> {
  // Stub implementation - not used in credits system
  return {
    plan: 'free',
    isActive: false,
    limits: {
      dailyChapters: 5,
      dailyScenes: 1,
      characterSlots: 1
    },
    usage: { chapters: 0, scenes: 0 }
  };
}

/*
// Original subscription limits code (commented out):
// 
// import { db } from './db';
// import { hasPremiumAccess } from './paddle';
// 
// export const SUBSCRIPTION_LIMITS = {
//   FREE: {
//     DAILY_CHAPTERS: 5,
//     DAILY_SCENES: 1,
//     CHARACTER_SLOTS: 1
//   },
//   TRIBUTE: {
//     DAILY_CHAPTERS_PER_CHARACTER: 10,
//     DAILY_SCENES_PER_CHARACTER: 1,
//     CHARACTER_SLOTS: 3,
//     DAILY_CHAPTERS_SHARED: 15,
//     DAILY_SCENES_SHARED: 5,
//   }
// } as const;
// 
// export const USE_SHARED_LIMITS = true;
// 
// export interface DailyUsage {
//   chapters: number;
//   scenes: number;
// }
// 
// ... (rest of the original code)
*/
