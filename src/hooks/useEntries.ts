'use client';

import { useState, useEffect } from 'react';
import { JournalEntry } from '@/types';
import { loadEntries as loadEntriesFromStorage, saveEntries } from '@/lib/client-utils';
import { fetchWithAutoLogout, shouldAutoLogout } from '@/lib/auto-logout';
import { queueOfflineChange } from '@/lib/offline-sync';

export function useEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetchWithAutoLogout('/api/entries');
      if (!response.ok) {
        throw new Error('Failed to load entries');
      }
      
      const data = await response.json();
      setEntries(data.entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries');
      console.error('Error loading entries:', err);
      
      // Fallback to localStorage when offline
      console.warn('Falling back to localStorage for entries');
      const localEntries = loadEntriesFromStorage();
      setEntries(localEntries);
    } finally {
      setIsLoading(false);
    }
  };

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
      
      // Queue the deletion for offline sync
      queueOfflineChange('entry_delete', { entryId });
      
      // Still remove from local state and localStorage
      setEntries(prev => {
        const updatedEntries = prev.filter(entry => entry.id !== entryId);
        saveEntries(updatedEntries);
        return updatedEntries;
      });
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
