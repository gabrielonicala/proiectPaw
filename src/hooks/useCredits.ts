'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { getCachedCredits, setCachedCredits, updateCachedCredits, invalidateCreditsCache, markPurchaseCompleted, hasRecentPurchase } from '@/lib/credits-cache';

interface CreditsData {
  credits: number;
  isLow: boolean;
}

interface UseCreditsOptions {
  /** Enable periodic polling (default: true) */
  enablePolling?: boolean;
  /** Polling interval in milliseconds (default: 30000 = 30 seconds) */
  pollingInterval?: number;
  /** Only poll when tab is visible (default: true) */
  pollWhenVisible?: boolean;
}

export function useCredits(options: UseCreditsOptions = {}) {
  const { 
    enablePolling = true, 
    pollingInterval = 30000, // 30 seconds
    pollWhenVisible = true 
  } = options;

  const { data: session } = useSession();
  const [credits, setCredits] = useState<CreditsData>({ credits: 150, isLow: false });
  const [isLoading, setIsLoading] = useState(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  const fetchCredits = useCallback(async (forceRefresh = false) => {
    const userId = (session as { user: { id: string } } | null)?.user?.id;
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    // If force refresh, invalidate cache first
    if (forceRefresh) {
      invalidateCreditsCache(userId);
    }
    
    // Check cache first for instant display (unless forcing refresh)
    // Skip cache if there was a recent purchase to avoid showing stale data
    if (!forceRefresh && !hasRecentPurchase(userId)) {
      const cached = getCachedCredits(userId);
      if (cached) {
        const cacheAge = Date.now() - cached.lastUpdated;
        const FRESH_THRESHOLD_MS = 10 * 1000; // 10 seconds
        
        // Only use cache for immediate display if it's very fresh
        // Otherwise, wait for API call to avoid showing stale data
        if (cacheAge < FRESH_THRESHOLD_MS) {
          setCredits({ credits: cached.credits, isLow: cached.isLow });
          setIsLoading(false);
          // Continue to fetch fresh data in background
        } else {
          // Cache is stale, don't show it - wait for API call
          console.log(`[CREDITS] Cache is stale (${Math.round(cacheAge / 1000)}s old), waiting for fresh data`);
        }
      }
    } else if (hasRecentPurchase(userId)) {
      console.log('[CREDITS] Recent purchase detected, skipping cache to avoid stale data');
    }

    try {
      const response = await fetch('/api/credits/balance', {
        cache: forceRefresh ? 'no-cache' : 'default'
      });
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
      if (!forceRefresh) {
        const cached = getCachedCredits(userId);
      if (!cached) {
        // Only set default if we have no cache
        setCredits({ credits: 150, isLow: false });
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [(session as { user: { id: string } } | null)?.user?.id]);

  // Initial fetch on mount
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Periodic polling
  useEffect(() => {
    if (!enablePolling) return;

    const startPolling = () => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      const poll = () => {
        // Only poll if tab is visible (or if pollWhenVisible is false)
        if (pollWhenVisible && document.hidden) {
          return;
        }

        fetchCredits(false);
      };

      // Poll immediately, then set interval
      poll();
      pollingIntervalRef.current = setInterval(poll, pollingInterval);
    };

    const stopPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      isPollingRef.current = false;
    };

    // Start polling when tab becomes visible
    if (pollWhenVisible) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          stopPolling();
        } else {
          startPolling();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Start polling if tab is visible
      if (!document.hidden) {
        startPolling();
      }

      return () => {
        stopPolling();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      // Always poll regardless of visibility
      startPolling();
      return stopPolling;
    }
  }, [enablePolling, pollingInterval, pollWhenVisible, fetchCredits]);

  // Event-driven cache invalidation
  useEffect(() => {
    const userId = (session as { user: { id: string } } | null)?.user?.id;
    if (!userId) return;

    // Listen for credit-related events
    const handleCreditEvent = () => {
      markPurchaseCompleted(userId);
      invalidateCreditsCache(userId);
      fetchCredits(true);
    };

    // Listen for custom events that indicate credits might have changed
    window.addEventListener('credits:invalidate', handleCreditEvent);
    window.addEventListener('credits:purchase', handleCreditEvent);
    window.addEventListener('credits:deduct', handleCreditEvent);

    return () => {
      window.removeEventListener('credits:invalidate', handleCreditEvent);
      window.removeEventListener('credits:purchase', handleCreditEvent);
      window.removeEventListener('credits:deduct', handleCreditEvent);
    };
  }, [(session as { user: { id: string } } | null)?.user?.id, fetchCredits]);

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

  // Function to invalidate cache and force refresh
  const invalidateAndRefresh = useCallback(() => {
    const userId = (session as { user: { id: string } } | null)?.user?.id;
    if (!userId) return;
    invalidateCreditsCache(userId);
    fetchCredits(true);
  }, [fetchCredits, (session as { user: { id: string } } | null)?.user?.id]);

  return { 
    credits: credits.credits, 
    isLow: credits.isLow, 
    isLoading, 
    refreshCredits: fetchCredits, 
    updateCredits,
    invalidateAndRefresh
  };
}

