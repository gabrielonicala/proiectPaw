'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { getCachedCredits, setCachedCredits, updateCachedCredits } from '@/lib/credits-cache';

interface CreditsData {
  credits: number;
  isLow: boolean;
}

export function useCredits() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<CreditsData>({ credits: 150, isLow: false });
  const [isLoading, setIsLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    const userId = (session as { user: { id: string } } | null)?.user?.id;
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    // Check cache first for instant display
    const cached = getCachedCredits(userId);
    if (cached) {
      setCredits({ credits: cached.credits, isLow: cached.isLow });
      setIsLoading(false);
      // Continue to fetch fresh data in background
    }

    try {
      const response = await fetch('/api/credits/balance');
      if (response.ok) {
        const data = await response.json();
        setCredits({ credits: data.credits, isLow: data.isLow });
        // Update cache with fresh data
        setCachedCredits(userId, {
          credits: data.credits,
          isLow: data.isLow
        });
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      // If we have cached data, keep using it
      if (!cached) {
        // Only set default if we have no cache
        setCredits({ credits: 150, isLow: false });
      }
    } finally {
      setIsLoading(false);
    }
  }, [(session as { user: { id: string } } | null)?.user?.id]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Function to update credits immediately (e.g., after generation or purchase)
  const updateCredits = useCallback((newCredits: number) => {
    const userId = (session as { user: { id: string } } | null)?.user?.id;
    if (!userId) return;
    updateCachedCredits(userId, newCredits);
    
    // Get updated cache to get isLow value
    const updated = getCachedCredits(userId);
    if (updated) {
      setCredits({ credits: updated.credits, isLow: updated.isLow });
    }
  }, [(session as { user: { id: string } } | null)?.user?.id]);

  return { credits: credits.credits, isLow: credits.isLow, isLoading, refreshCredits: fetchCredits, updateCredits };
}

