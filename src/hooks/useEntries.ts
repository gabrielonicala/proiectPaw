'use client';

import { useState, useEffect, useMemo } from 'react';
import { JournalEntry } from '@/types';
import { loadEntries as loadEntriesFromStorage, saveEntries, checkAndCleanupLocalStorage } from '@/lib/client-utils';
import { fetchWithAutoLogout } from '@/lib/auto-logout';

interface UseEntriesOptions {
  autoLoad?: boolean; // HYBRID APPROACH: Don't auto-load by default
  daysToLoad?: number; // HYBRID APPROACH: Progressive loading - load recent entries first (default: all)
}

export function useEntries(options: UseEntriesOptions = {}) {
  const { autoLoad = false, daysToLoad } = options;
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false); // HYBRID APPROACH: Start as false since we don't auto-load
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false); // Track if entries have been loaded at least once

  // HYBRID APPROACH: Progressive loading - filter entries by date if daysToLoad is specified
  // Entries are already sorted by date (most recent first) from the API
  const filteredEntries = useMemo(() => {
    if (!daysToLoad || daysToLoad <= 0) {
      return entries; // Return all entries
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToLoad);
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= cutoffDate;
    });
  }, [entries, daysToLoad]);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // HYBRID APPROACH: Check localStorage first for instant display
      const cachedEntries = loadEntriesFromStorage();
      if (cachedEntries.length > 0 && !hasLoaded) {
        console.log('Loading cached entries for instant display');
        setEntries(cachedEntries);
        setHasLoaded(true);
        // Continue to fetch fresh data in background
      }
      
      // Check if we're offline
      if (!navigator.onLine) {
        console.log('Offline detected, using cached entries from localStorage');
        if (cachedEntries.length > 0) {
          setEntries(cachedEntries);
          setHasLoaded(true);
        } else {
          setError('No cached entries available offline');
        }
        setIsLoading(false);
        return;
      }
      
      const response = await fetchWithAutoLogout('/api/entries');
      if (!response.ok) {
        throw new Error('Failed to load entries');
      }
      
      const data = await response.json();
      // HYBRID APPROACH: Entries are already sorted by date (most recent first) from API
      setEntries(data.entries);
      setHasLoaded(true);
      
      // Cache all entries to localStorage for offline use
      console.log('Caching all entries to localStorage for offline use');
      
      // Check and cleanup localStorage before saving entries
      if (checkAndCleanupLocalStorage()) {
        saveEntries(data.entries);
      } else {
        console.warn('Could not save entries to localStorage due to quota issues');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries');
      console.error('Error loading entries:', err);
      
      // Fallback to localStorage when offline or API fails
      console.warn('Falling back to localStorage for entries');
      const localEntries = loadEntriesFromStorage();
      if (localEntries.length > 0) {
        setEntries(localEntries);
        setHasLoaded(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Note: Entry deletion functionality is not implemented in the UI
  // This function is kept for potential future use but is not currently used
  const deleteEntry = async (entryId: string) => {
    try {
      const response = await fetchWithAutoLogout(`/api/entries/${entryId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }
      
      // Remove the entry from local state
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      
      // Update localStorage cache
      const updatedEntries = entries.filter(entry => entry.id !== entryId);
      saveEntries(updatedEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
      console.error('Error deleting entry:', err);
    }
  };

  // HYBRID APPROACH: Only auto-load if explicitly requested
  useEffect(() => {
    if (autoLoad && !hasLoaded) {
      loadEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]); // Only depend on autoLoad, not hasLoaded to avoid re-renders

  return {
    entries: filteredEntries, // Return filtered entries for progressive loading
    allEntries: entries, // Return all entries if needed
    isLoading,
    error,
    refetch: loadEntries,
    deleteEntry,
    hasLoaded,
  };
}
