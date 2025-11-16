'use client';

import { useState, useEffect } from 'react';
import { JournalEntry } from '@/types';
import { fetchWithAutoLogout } from '@/lib/auto-logout';

interface UseEntriesByDateRangeOptions {
  startDate: Date;
  endDate: Date;
  characterId?: string;
  autoLoad?: boolean;
}

export function useEntriesByDateRange(options: UseEntriesByDateRangeOptions) {
  const { startDate, endDate, characterId, autoLoad = true } = options;
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      if (characterId) {
        params.append('characterId', characterId);
      }

      const response = await fetchWithAutoLogout(`/api/entries?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load entries');
      }

      const data = await response.json();
      setEntries(data.entries);
      setHasLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries');
      console.error('Error loading entries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      loadEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate.toISOString(), endDate.toISOString(), characterId, autoLoad]);

  return {
    entries,
    isLoading,
    error,
    refetch: loadEntries,
    hasLoaded,
  };
}


