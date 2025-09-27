'use client';

import { useState, useEffect } from 'react';
import { JournalEntry } from '@/types';
import { loadEntries as loadEntriesFromStorage, saveEntries } from '@/lib/client-utils';
import { fetchWithAutoLogout } from '@/lib/auto-logout';

export function useEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if we're offline first
      if (!navigator.onLine) {
        console.log('Offline detected, loading entries from localStorage');
        const localEntries = loadEntriesFromStorage();
        setEntries(localEntries);
        return;
      }
      
      const response = await fetchWithAutoLogout('/api/entries');
      if (!response.ok) {
        throw new Error('Failed to load entries');
      }
      
      const data = await response.json();
      setEntries(data.entries);
      
      // Cache all entries to localStorage for offline use
      console.log('Caching all entries to localStorage for offline use');
      saveEntries(data.entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries');
      console.error('Error loading entries:', err);
      
      // Fallback to localStorage when offline or API fails
      console.warn('Falling back to localStorage for entries');
      const localEntries = loadEntriesFromStorage();
      setEntries(localEntries);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
      console.error('Error deleting entry:', err);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  return {
    entries,
    isLoading,
    error,
    refetch: loadEntries,
    deleteEntry,
  };
}
