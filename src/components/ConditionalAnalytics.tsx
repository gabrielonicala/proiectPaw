'use client';

import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Check iubenda consent status
function checkIubendaConsent(category: 'analytics' | 'performance'): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if iubenda unified solution is available
  // The unified solution stores consent in a different way
  try {
    // Check for iubenda consent cookie or localStorage
    const consentData = localStorage.getItem('_iub_cs-*') || 
                       document.cookie.match(/_iub_cs-[^=]+=([^;]+)/);
    
    // Also check the global iubenda API if available
    if ((window as any)._iub?.csApi) {
      const preferences = (window as any)._iub.csApi.getPreferences();
      if (preferences) {
        return preferences[category] === true;
      }
    }
    
    // Fallback: check if user has given any consent
    // If no consent data exists, return false (block analytics)
    return false;
  } catch (e) {
    return false;
  }
}

export default function ConditionalAnalytics() {
  const [canUseAnalytics, setCanUseAnalytics] = useState(false);
  const [canUsePerformance, setCanUsePerformance] = useState(false);

  useEffect(() => {
    // Check consent status periodically until iubenda is ready
    const checkConsent = () => {
      const analytics = checkIubendaConsent('analytics');
      const performance = checkIubendaConsent('performance');
      
      setCanUseAnalytics(analytics);
      setCanUsePerformance(performance);
      
      // Disable analytics if user hasn't consented
      if (!analytics && typeof window !== 'undefined') {
        (window as any).gtag = (window as any).gtag || function() {
          // No-op function to prevent errors
        };
      }
    };

    // Check immediately
    checkConsent();

    // Listen for iubenda consent events
    const handleConsent = () => {
      checkConsent();
    };

    window.addEventListener('iubenda:consent-given', handleConsent);
    window.addEventListener('iubenda:preference-expressed', handleConsent);

    // Check periodically until iubenda is ready
    const interval = setInterval(() => {
      checkConsent();
      // Stop checking after 10 seconds
    }, 500);

    setTimeout(() => clearInterval(interval), 10000);

    return () => {
      window.removeEventListener('iubenda:consent-given', handleConsent);
      window.removeEventListener('iubenda:preference-expressed', handleConsent);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {canUseAnalytics && <Analytics />}
      {canUsePerformance && <SpeedInsights />}
    </>
  );
}


