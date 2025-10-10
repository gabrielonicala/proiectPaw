'use client';

/**
 * IndexedDB-based audio caching system for background music
 * Handles large audio files that exceed localStorage limits
 */

interface CachedAudio {
  data: Blob;
  mimeType: string;
  lastCached: number;
  size: number;
}

const DB_NAME = 'QuilliaAudioCache';
const DB_VERSION = 1;
const STORE_NAME = 'audio';
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB max cache size
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Initialize IndexedDB database
 */
function initDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store for audio files
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
        store.createIndex('lastCached', 'lastCached', { unique: false });
        store.createIndex('size', 'size', { unique: false });
      }
    };
  });

  return dbPromise;
}

/**
 * Get total cache size
 */
async function getCacheSize(): Promise<number> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const items = request.result as CachedAudio[];
        const totalSize = items.reduce((sum, item) => sum + item.size, 0);
        resolve(totalSize);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting cache size:', error);
    return 0;
  }
}

/**
 * Clean up old cache entries
 */
async function cleanupCache(): Promise<void> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('lastCached');
    const request = index.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const items = request.result as (CachedAudio & { url: string })[];
        const now = Date.now();
        
        // Determine which items to remove
        const currentSize = items.reduce((sum, item) => sum + item.size, 0);
        const itemsToRemove: (CachedAudio & { url: string })[] = [];
        
        // Add expired items
        items.forEach(item => {
          if (now - item.lastCached > CACHE_EXPIRY) {
            itemsToRemove.push(item);
          }
        });
        
        // If still over limit, add oldest items
        if (currentSize > MAX_CACHE_SIZE) {
          const remainingItems = items
            .filter(item => !itemsToRemove.includes(item))
            .sort((a, b) => a.lastCached - b.lastCached);
          
          let sizeToRemove = currentSize - (MAX_CACHE_SIZE * 0.8); // Keep 80% of max
          for (const item of remainingItems) {
            if (sizeToRemove <= 0) break;
            itemsToRemove.push(item);
            sizeToRemove -= item.size;
          }
        }
        
        // Remove items
        const removePromises = itemsToRemove.map(item => {
          return new Promise<void>((resolveRemove, rejectRemove) => {
            const deleteRequest = store.delete(item.url);
            deleteRequest.onsuccess = () => resolveRemove();
            deleteRequest.onerror = () => rejectRemove(deleteRequest.error);
          });
        });
        
        Promise.all(removePromises)
          .then(() => resolve())
          .catch(reject);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error cleaning up cache:', error);
  }
}

/**
 * Cache an audio file in IndexedDB
 */
export async function cacheAudio(url: string, mimeType: string = 'audio/mpeg'): Promise<string | null> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Check if already cached
    const getRequest = store.get(url);
    
    return new Promise((resolve, reject) => {
      getRequest.onsuccess = async () => {
        const cached = getRequest.result as (CachedAudio & { url: string }) | undefined;
        
        if (cached && Date.now() - cached.lastCached < CACHE_EXPIRY) {
          // Return cached blob URL
          const blobUrl = URL.createObjectURL(cached.data);
          resolve(blobUrl);
          return;
        }
        
        // Fetch and cache the audio
        try {
          const response = await fetch(url);
          if (!response.ok) {
            resolve(null);
            return;
          }
          
          const blob = await response.blob();
          const audioData: CachedAudio & { url: string } = {
            url,
            data: blob,
            mimeType,
            lastCached: Date.now(),
            size: blob.size
          };
          
          // Check cache size and clean up if needed
          const currentSize = await getCacheSize();
          if (currentSize + blob.size > MAX_CACHE_SIZE) {
            await cleanupCache();
          }
          
          // Store in IndexedDB
          const putRequest = store.put(audioData);
          putRequest.onsuccess = () => {
            const blobUrl = URL.createObjectURL(blob);
            resolve(blobUrl);
          };
          putRequest.onerror = () => {
            console.error('Failed to cache audio:', putRequest.error);
            // Still return the blob URL even if caching fails
            const blobUrl = URL.createObjectURL(blob);
            resolve(blobUrl);
          };
        } catch (error) {
          console.error('Error fetching audio:', error);
          resolve(null);
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('Error caching audio:', error);
    return null;
  }
}

/**
 * Get cached audio URL or return null if not cached
 */
export async function getCachedAudio(url: string): Promise<string | null> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(url);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const cached = request.result as (CachedAudio & { url: string }) | undefined;
        
        if (cached && Date.now() - cached.lastCached < CACHE_EXPIRY) {
          const blobUrl = URL.createObjectURL(cached.data);
          resolve(blobUrl);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting cached audio:', error);
    return null;
  }
}

/**
 * Clear all cached audio
 */
export async function clearAudioCache(): Promise<void> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error clearing audio cache:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getAudioCacheStats(): Promise<{ totalSize: number; itemCount: number }> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const items = request.result as (CachedAudio & { url: string })[];
        const totalSize = items.reduce((sum, item) => sum + item.size, 0);
        resolve({ totalSize, itemCount: items.length });
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { totalSize: 0, itemCount: 0 };
  }
}
