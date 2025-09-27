'use client';

/**
 * Asset caching system for offline support
 * Caches avatar images and background music in localStorage as base64
 */

interface CachedAsset {
  data: string; // base64 encoded data
  mimeType: string;
  lastCached: number;
  size: number;
}

interface CacheStats {
  totalSize: number;
  assetCount: number;
  lastCleanup: number;
}

const CACHE_PREFIX = 'quillia-asset-cache-';
const CACHE_STATS_KEY = 'quillia-cache-stats';
const MAX_CACHE_SIZE = 25 * 1024 * 1024; // 25MB max cache size (balanced approach)
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Get cache statistics
 */
export function getCacheStats(): CacheStats {
  const stats = localStorage.getItem(CACHE_STATS_KEY);
  return stats ? JSON.parse(stats) : { totalSize: 0, assetCount: 0, lastCleanup: 0 };
}

/**
 * Update cache statistics
 */
function updateCacheStats(deltaSize: number, deltaCount: number) {
  const stats = getCacheStats();
  stats.totalSize += deltaSize;
  stats.assetCount += deltaCount;
  stats.lastCleanup = Date.now();
  localStorage.setItem(CACHE_STATS_KEY, JSON.stringify(stats));
}

/**
 * Clean up old or oversized cache entries
 */
function cleanupCache() {
  const stats = getCacheStats();
  const now = Date.now();
  
  // Clean up if cache is too large or hasn't been cleaned in 24 hours
  if (stats.totalSize > MAX_CACHE_SIZE || (now - stats.lastCleanup) > 24 * 60 * 60 * 1000) {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    
    // Sort by last cached time (oldest first)
    const cacheEntries = cacheKeys.map(key => {
      const data = localStorage.getItem(key);
      return data ? { key, data: JSON.parse(data) as CachedAsset } : null;
    }).filter(Boolean) as { key: string; data: CachedAsset }[];
    
    cacheEntries.sort((a, b) => a.data.lastCached - b.data.lastCached);
    
    // Remove oldest entries until we're under the limit
    let removedSize = 0;
    let removedCount = 0;
    
    for (const entry of cacheEntries) {
      if (stats.totalSize - removedSize <= MAX_CACHE_SIZE * 0.8) break; // Keep 80% of max size
      
      localStorage.removeItem(entry.key);
      removedSize += entry.data.size;
      removedCount++;
    }
    
    updateCacheStats(-removedSize, -removedCount);
  }
}

/**
 * Cache an asset (image or audio) as base64
 */
export async function cacheAsset(url: string, mimeType: string): Promise<string | null> {
  try {
    const cacheKey = CACHE_PREFIX + btoa(url);
    
    // Check if already cached
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const asset: CachedAsset = JSON.parse(cached);
      // Check if cache is still valid
      if (Date.now() - asset.lastCached < CACHE_EXPIRY) {
        return asset.data;
      } else {
        // Remove expired cache
        localStorage.removeItem(cacheKey);
        updateCacheStats(-asset.size, -1);
      }
    }
    
    // Fetch and cache the asset
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const blob = await response.blob();
    const reader = new FileReader();
    
    return new Promise((resolve) => {
      reader.onload = () => {
        const base64 = reader.result as string;
        const asset: CachedAsset = {
          data: base64,
          mimeType,
          lastCached: Date.now(),
          size: base64.length
        };
        
        try {
          localStorage.setItem(cacheKey, JSON.stringify(asset));
          updateCacheStats(asset.size, 1);
          cleanupCache();
          resolve(base64);
        } catch (quotaError) {
          console.warn('localStorage quota exceeded, cleaning cache and retrying...', quotaError);
          // Try to clean up cache and retry once
          cleanupCache();
          try {
            localStorage.setItem(cacheKey, JSON.stringify(asset));
            updateCacheStats(asset.size, 1);
            resolve(base64);
          } catch (retryError) {
            console.error('Failed to cache asset even after cleanup:', retryError);
            // Still return the base64 data even if we can't cache it
            // This ensures the asset still works, just won't be cached for next time
            resolve(base64);
          }
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error caching asset:', error);
    return null;
  }
}

/**
 * Get cached asset or return null if not cached
 */
export function getCachedAsset(url: string): string | null {
  try {
    const cacheKey = CACHE_PREFIX + btoa(url);
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const asset: CachedAsset = JSON.parse(cached);
      // Check if cache is still valid
      if (Date.now() - asset.lastCached < CACHE_EXPIRY) {
        return asset.data;
      } else {
        // Remove expired cache
        localStorage.removeItem(cacheKey);
        updateCacheStats(-asset.size, -1);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting cached asset:', error);
    return null;
  }
}

/**
 * Preload and cache avatar pieces
 */
export async function preloadAvatarPieces(pieces: Array<{ imagePath: string }>): Promise<void> {
  const promises = pieces.map(piece => 
    cacheAsset(piece.imagePath, 'image/png')
  );
  
  await Promise.allSettled(promises);
}

/**
 * Preload and cache background music
 */
export async function preloadBackgroundMusic(musicFiles: string[]): Promise<void> {
  const promises = musicFiles.map(file => 
    cacheAsset(file, 'audio/mpeg')
  );
  
  await Promise.allSettled(promises);
}

/**
 * Get cached image URL or fallback to original URL
 */
export function getCachedImageUrl(originalUrl: string): string {
  const cached = getCachedAsset(originalUrl);
  return cached || originalUrl;
}

/**
 * Get cached audio URL or fallback to original URL
 */
export function getCachedAudioUrl(originalUrl: string): string {
  const cached = getCachedAsset(originalUrl);
  return cached || originalUrl;
}

/**
 * Clear all cached assets
 */
export function clearAssetCache(): void {
  const keys = Object.keys(localStorage);
  const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
  
  cacheKeys.forEach(key => localStorage.removeItem(key));
  localStorage.removeItem(CACHE_STATS_KEY);
}
