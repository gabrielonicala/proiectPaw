/**
 * Module-level cache for user credits and starter kit eligibility
 * Persists across component mounts/unmounts, similar to calendar entries cache
 */

import { LOW_CREDITS_THRESHOLD } from './credits';

interface CreditsCacheData {
  credits: number;
  isLow: boolean;
  hasPurchasedStarterKit: boolean;
  lastUpdated: number; // timestamp
}

// Module-level cache keyed by userId
const creditsCache = new Map<string, CreditsCacheData>();

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000;

/**
 * Get cached credits data for a user
 */
export function getCachedCredits(userId: string): CreditsCacheData | null {
  const cached = creditsCache.get(userId);
  if (!cached) {
    return null;
  }

  // Check if cache is expired
  const now = Date.now();
  if (now - cached.lastUpdated > CACHE_EXPIRATION_MS) {
    creditsCache.delete(userId);
    return null;
  }

  return cached;
}

/**
 * Set cached credits data for a user
 */
export function setCachedCredits(
  userId: string,
  data: { credits: number; isLow: boolean; hasPurchasedStarterKit?: boolean }
): void {
  const cached: CreditsCacheData = {
    credits: data.credits,
    isLow: data.isLow,
    hasPurchasedStarterKit: data.hasPurchasedStarterKit ?? false,
    lastUpdated: Date.now()
  };
  creditsCache.set(userId, cached);
}

/**
 * Update credits in cache (e.g., after deduction or addition)
 */
export function updateCachedCredits(
  userId: string,
  newCredits: number
): void {
  const cached = creditsCache.get(userId);
  if (cached) {
    cached.credits = newCredits;
    cached.isLow = newCredits <= LOW_CREDITS_THRESHOLD;
    cached.lastUpdated = Date.now();
  }
}

/**
 * Update starter kit purchase status in cache
 */
export function updateCachedStarterKitStatus(
  userId: string,
  hasPurchased: boolean
): void {
  const cached = creditsCache.get(userId);
  if (cached) {
    cached.hasPurchasedStarterKit = hasPurchased;
    cached.lastUpdated = Date.now();
  }
}

/**
 * Clear cache for a user (e.g., on logout)
 */
export function clearCreditsCache(userId?: string): void {
  if (userId) {
    creditsCache.delete(userId);
  } else {
    creditsCache.clear();
  }
}

/**
 * Invalidate cache for a user (force refresh on next fetch)
 * This is event-driven cache invalidation - call when credits might have changed
 */
export function invalidateCreditsCache(userId: string): void {
  creditsCache.delete(userId);
}

