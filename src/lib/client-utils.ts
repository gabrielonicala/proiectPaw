import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { JournalEntry, User, ThemeConfig, Character } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Check localStorage usage and clean up if needed
 */
export function checkAndCleanupLocalStorage(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // Test if we can write to localStorage
    const testKey = 'quillia-storage-test';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (quotaError) {
    console.warn('localStorage quota exceeded, performing cleanup...');
    
    // Clean up asset cache to free space
    const keysToRemove: string[] = [];
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('quillia-asset-cache-')) {
        keysToRemove.push(key);
      }
    }
    
    // Remove oldest cache entries first
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Error removing cache key:', key, e);
      }
    });
    
    // Test again
    try {
      const testKey = 'quillia-storage-test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      console.log('localStorage cleanup successful');
      return true;
    } catch (retryError) {
      console.error('localStorage still full after cleanup:', retryError);
      return false;
    }
  }
}

export function saveToLocalStorage(key: string, data: unknown): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (quotaError) {
      console.warn(`localStorage quota exceeded for key ${key}, attempting cleanup...`, quotaError);
      
      // Try to free up space by clearing old cache data
      try {
        // Clear asset cache to free up space (but keep essential data)
        const keysToRemove: string[] = [];
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const keyToCheck = localStorage.key(i);
          if (keyToCheck && keyToCheck.startsWith('quillia-asset-cache-')) {
            keysToRemove.push(keyToCheck);
          }
        }
        
        // Remove cache entries in batches to free up space
        for (const cacheKey of keysToRemove.slice(0, Math.floor(keysToRemove.length / 2))) {
          localStorage.removeItem(cacheKey);
        }
        
        // Retry saving the data
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`Successfully saved ${key} after cache cleanup`);
      } catch (retryError) {
        console.error(`Failed to save ${key} even after cleanup:`, retryError);
        // Don't throw - just log the error and continue
      }
    }
  }
}

export function loadFromLocalStorage<T>(key: string): T | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
  return null;
}

export function saveUser(user: User): void {
  saveToLocalStorage('quillia-user', user);
}

export function loadUser(): User | null {
  return loadFromLocalStorage<User>('quillia-user');
}

// Database-backed user preferences
export async function saveUserPreferences(user: User): Promise<void> {
  try {
    const response = await fetch('/api/user/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: user.name,
        username: user.username
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save user preferences: ${response.status}`);
    }

    // Also save to localStorage as backup
    saveUser(user);
  } catch (error) {
    console.error('Error saving user preferences:', error);
    // Fallback to localStorage only - emit event for offline warning
    console.warn('Falling back to localStorage for user preferences');
    saveUser(user);
    // Emit custom event for offline warning
    window.dispatchEvent(new CustomEvent('localStorageFallback', { 
      detail: { type: 'userPreferences' } 
    }));
  }
}

export async function loadUserPreferences(): Promise<User | null> {
  try {
    const response = await fetch('/api/user/preferences');
    
    if (!response.ok) {
      throw new Error(`Failed to load user preferences: ${response.status}`);
    }

    const data = await response.json();
    const user = data.user as User;
    
    // Also save to localStorage as backup
    saveUser(user);
    
    return user;
  } catch (error) {
    console.error('Error loading user preferences:', error);
    // Fallback to localStorage - this will trigger the offline warning
    console.warn('Falling back to localStorage for user preferences');
    // Emit custom event for offline warning
    window.dispatchEvent(new CustomEvent('localStorageFallback', { 
      detail: { type: 'userPreferences' } 
    }));
    return loadUser();
  }
}

// Legacy localStorage functions - kept for backward compatibility but not used
// All data is now stored in the database
export function saveEntries(entries: JournalEntry[]): void {
  saveToLocalStorage('quillia-entries', entries);
}

export function loadEntries(): JournalEntry[] {
  return loadFromLocalStorage<JournalEntry[]>('quillia-entries') || [];
}

export function addEntry(entry: JournalEntry): void {
  const entries = loadEntries();
  entries.unshift(entry); // Add to beginning
  saveEntries(entries);
}

export function getEntriesByDate(date: Date): JournalEntry[] {
  const entries = loadEntries();
  const targetDate = date.toDateString();
  return entries.filter(entry => 
    new Date(entry.createdAt).toDateString() === targetDate
  );
}

export async function getPastContext(limit: number = 3): Promise<string[]> {
  try {
    const response = await fetch(`/api/entries/past-context?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch past context: ${response.status}`);
    }

    const data = await response.json();
    return data.pastContext;
  } catch (error) {
    console.error('Error fetching past context:', error);
    // Fallback to localStorage - emit event for offline warning
    console.warn('Falling back to localStorage for past context');
    // Emit custom event for offline warning
    window.dispatchEvent(new CustomEvent('localStorageFallback', { 
      detail: { type: 'pastContext' } 
    }));
    const entries = loadEntries();
    return entries.slice(0, limit).map(entry => entry.originalText);
  }
}

// Real AI functions using OpenAI API
export async function generateReimaginedText(
  originalText: string, 
  themeConfig: ThemeConfig,
  pastContext: string[] = [],
  character?: { appearance: string; pronouns: string; customPronouns?: string },
  skipCreditDeduction?: boolean
): Promise<string> {
  try {
    const response = await fetch('/api/generate-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalText,
        themeConfig,
        outputType: 'text',
        pastContext,
        character,
        skipCreditDeduction
      }),
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        const text = await response.text();
        if (text) {
          errorData = JSON.parse(text);
        }
      } catch (e) {
        // If parsing fails, use empty object
        console.error('Failed to parse error response:', e);
      }
      
      // Log the full error for debugging
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url: response.url
      });
      
      const errorMessage = errorData.message || errorData.error || `API request failed: ${response.status} ${response.statusText}`;
      const error = new Error(errorMessage);
      (error as any).response = { data: errorData, status: response.status };
      (error as any).data = errorData;
      (error as any).status = response.status;
      throw error;
    }

    const data = await response.json();
    
    if (!data.success) {
      const error = new Error(data.error || 'Failed to generate story');
      (error as any).response = { data };
      (error as any).data = data;
      throw error;
    }

    return data.reimaginedText;
  } catch (error) {
    console.error('Error generating story:', error);
    // Throw the error instead of returning a fallback message
    // This prevents the frontend from saving failed generations to the database
    throw error;
  }
}

export async function generateImage(
  originalText: string, 
  themeConfig: ThemeConfig,
  character: Character
): Promise<string> {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalText,
        themeConfig,
        character
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      // Check if it's a content policy violation
      if (data.error === 'content_policy_violation') {
        // Return a special identifier for content policy violations
        return 'CONTENT_POLICY_VIOLATION';
      }
      throw new Error(data.error || 'Failed to generate image');
    }
    
    if (!data.success) {
      // Check if it's a content policy violation
      if (data.error === 'content_policy_violation') {
        return 'CONTENT_POLICY_VIOLATION';
      }
      throw new Error(data.error || 'Failed to generate image');
    }

    return data.imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    // Fallback to a placeholder image if API fails
    return `https://picsum.photos/300/500?random=${Date.now()}`;
  }
}

export async function generateImageSD(
  originalText: string, 
  themeConfig: ThemeConfig,
  character: Character,
  referenceImages?: string[]
): Promise<string> {
  try {
    const response = await fetch('/api/generate-image-sd-advanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalText,
        themeConfig,
        character,
        referenceImages
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate image with Stable Diffusion');
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Error generating image with Stable Diffusion:', error);
    // DALL-E fallback commented out to avoid wasting credits during testing
    // console.log('Falling back to DALL-E generation');
    // return generateImage(originalText, themeConfig, character);
    
    // For now, throw the error so we can see what's wrong with Stable Diffusion
    throw error;
  }
}

export async function generateImageGemini(
  originalText: string, 
  themeConfig: ThemeConfig,
  character: Character,
  generatedChapter?: string
): Promise<string> {
  try {
    const response = await fetch('/api/generate-image-gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalText,
        themeConfig,
        character,
        generatedChapter
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || errorData.error || 'Failed to generate image with Gemini');
      (error as any).response = { data: errorData };
      (error as any).data = errorData;
      throw error;
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Error generating image with Gemini:', error);
    // DALL-E fallback commented out to avoid wasting credits during testing
    // console.log('Falling back to DALL-E generation');
    // return generateImage(originalText, themeConfig, character);
    
    // For now, throw the error so we can see what's wrong with Gemini
    throw error;
  }
}

// VIDEO GENERATION COMMENTED OUT - TOO EXPENSIVE FOR NOW
// TODO: Re-enable when implementing paywall or when costs become more reasonable
/*
export async function generateVideo(
  originalText: string, 
  journeyType: string, 
  theme: string
): Promise<string> {
  try {
    const response = await fetch('/api/generate-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalText,
        journeyType,
        theme
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate video');
    }

    return data.videoUrl;
  } catch (error) {
    console.error('Error generating video:', error);
    // Fallback to a placeholder video if API fails
    return `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;
  }
}
*/
