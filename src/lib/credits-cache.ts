/**
 * Module-level cache for user credits and starter kit eligibility
 * Persists across component mounts/unmounts, similar to calendar entries cache
 */

import { LOW_CREDITS_THRESHOLD } from './credits';
import { loadUser, saveUser } from './client-utils';

interface CreditsCacheData {
  credits: number;
  isLow: boolean;
  hasPurchasedStarterKit: boolean;
  lastUpdated: number; // timestamp
}

// Module-level cache keyed by userId
const creditsCache = new Map<string, CreditsCacheData>();

// Track when purchases happened (keyed by userId, value is timestamp)
const lastPurchaseTime = new Map<string, number>();

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000;

// Time window after purchase during which we should ignore cache (30 seconds)
const PURCHASE_IGNORE_CACHE_MS = 30 * 1000;

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

/**
 * Mark that a purchase was completed for a user
 * This will cause the cache to be ignored for a short period
 * Note: We don't delete the cache here because it should be updated with the new value
 * before this is called. We just mark the timestamp to skip cache on next navigation.
 */
export function markPurchaseCompleted(userId: string): void {
  lastPurchaseTime.set(userId, Date.now());
  // Don't delete cache - it should already be updated with the new value
  // We just mark the timestamp so we know to use fresh data
}

/**
 * Check if there was a recent purchase that should cause us to ignore cache
 */
export function hasRecentPurchase(userId: string): boolean {
  const purchaseTime = lastPurchaseTime.get(userId);
  if (!purchaseTime) {
    return false;
  }
  
  const timeSincePurchase = Date.now() - purchaseTime;
  if (timeSincePurchase > PURCHASE_IGNORE_CACHE_MS) {
    // Purchase was too long ago, clear the tracking
    lastPurchaseTime.delete(userId);
    return false;
  }
  
  return true;
}

/**
 * Check if cache was updated after the purchase (meaning it has the correct new value)
 */
export function isCacheUpdatedAfterPurchase(userId: string): boolean {
  const purchaseTime = lastPurchaseTime.get(userId);
  if (!purchaseTime) {
    return false; // No purchase recorded
  }
  
  const cached = creditsCache.get(userId);
  if (!cached) {
    return false; // No cache
  }
  
  // Cache was updated after purchase - it has the correct value
  return cached.lastUpdated >= purchaseTime;
}

/**
 * Update credits in ALL storage locations (cache, localStorage, and dispatch event)
 * This ensures consistency across all storage mechanisms and prevents flash issues
 */
export function updateCreditsEverywhere(
  userId: string,
  newCredits: number,
  isLow?: boolean
): void {
  // Calculate isLow if not provided
  const calculatedIsLow = isLow !== undefined ? isLow : newCredits <= LOW_CREDITS_THRESHOLD;
  
  // 1. Update module-level cache
  setCachedCredits(userId, {
    credits: newCredits,
    isLow: calculatedIsLow
  });
  
  // 2. Update localStorage user object (if available)
  if (typeof window !== 'undefined') {
    try {
      const localUser = loadUser();
      if (localUser && localUser.id === userId) {
        localUser.credits = newCredits;
        saveUser(localUser);
      }
    } catch (error) {
      // localStorage might not be available (SSR, private browsing, etc.)
      console.warn('Failed to update credits in localStorage:', error);
    }
  }
  
  // 3. Dispatch event for React components to update their state
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('credits:updated', {
      detail: { credits: newCredits, isLow: calculatedIsLow }
    }));
  }
}

