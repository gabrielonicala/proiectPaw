'use client';

import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useCookieConsent } from '@/hooks/useCookieConsent';

export default function ConditionalAnalytics() {
  const { canUseAnalytics, canUsePerformance } = useCookieConsent();

  useEffect(() => {
    // Disable analytics if user hasn't consented
    if (!canUseAnalytics()) {
      // Disable Vercel Analytics
      if (typeof window !== 'undefined') {
        (window as any).gtag = (window as any).gtag || function() {
          // No-op function to prevent errors
        };
      }
    }
  }, [canUseAnalytics]);

  return (
    <>
      {canUseAnalytics() && <Analytics />}
      {canUsePerformance() && <SpeedInsights />}
    </>
  );
}
