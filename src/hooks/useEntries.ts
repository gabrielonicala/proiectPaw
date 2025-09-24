'use client';

import { useState, useEffect } from 'react';
import { JournalEntry } from '@/types';

export function useEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/entries');
      if (!response.ok) {
        throw new Error('Failed to load entries');
      }
      
      const data = await response.json();
      setEntries(data.entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries');
      console.error('Error loading entries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEntry = async (entryId: string) => {
    try {
      const response = await fetch(`/api/entries/${entryId}`, {
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
