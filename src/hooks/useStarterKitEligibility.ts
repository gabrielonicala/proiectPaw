'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getCachedCredits, setCachedCredits } from '@/lib/credits-cache';

export function useStarterKitEligibility() {
  const { data: session } = useSession();
  const [eligible, setEligible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = (session as { user: { id: string } } | null)?.user?.id;
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchEligibility = async () => {
      
      // Check cache first for instant display
      const cached = getCachedCredits(userId);
      if (cached) {
        setEligible(!cached.hasPurchasedStarterKit);
        setIsLoading(false);
        // Continue to fetch fresh data in background
      }

      try {
        const response = await fetch('/api/credits/starter-kit-eligibility');
        if (response.ok) {
          const data = await response.json();
          setEligible(data.eligible);
          // Update cache with fresh data
          const cached = getCachedCredits(userId);
          if (cached) {
            setCachedCredits(userId, {
              ...cached,
              hasPurchasedStarterKit: !data.eligible
            });
          } else {
            // If no cache exists, create one with default values
            setCachedCredits(userId, {
              credits: 150,
              isLow: false,
              hasPurchasedStarterKit: !data.eligible
            });
          }
        }
      } catch (error) {
        console.error('Error fetching starter kit eligibility:', error);
        // If we have cached data, keep using it
        if (!cached) {
          setEligible(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEligibility();
  }, [(session as { user: { id: string } } | null)?.user?.id]);

  return { eligible, isLoading };
}



