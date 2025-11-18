'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getIubendaConsent,
  getIubendaPreferences,
  setIubendaConsent,
  acceptAllIubenda,
  rejectAllIubenda,
  canUseAnalytics,
  canUsePerformance,
  isIubendaReady,
} from '@/lib/iubenda';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  performance: boolean;
}

/**
 * Hook to manage cookie consent via iubenda API
 * This syncs your custom UI with iubenda's consent management
 */
export function useIubendaConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    performance: false,
  });
  const [hasConsented, setHasConsented] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Load consent status from iubenda on mount
  useEffect(() => {
    const loadConsent = async () => {
      // Wait for iubenda to be ready
      const checkReady = setInterval(() => {
        if (isIubendaReady()) {
          clearInterval(checkReady);
          setIsReady(true);
        }
      }, 100);

      // Also check localStorage as fallback
      const localConsent = localStorage.getItem('cookie-consent');
      if (localConsent) {
        try {
          const savedPreferences = JSON.parse(localConsent);
          setPreferences(savedPreferences);
          setHasConsented(true);
        } catch (e) {
          // Invalid JSON, ignore
        }
      }

      // Once iubenda is ready, sync with it
      setTimeout(async () => {
        if (isIubendaReady()) {
          setIsReady(true);
          const iubendaConsent = await getIubendaConsent();
          const iubendaPrefs = await getIubendaPreferences();

          if (iubendaConsent && iubendaPrefs) {
            const mappedPrefs: CookiePreferences = {
              essential: true,
              analytics: iubendaPrefs.analytics === true,
              performance: iubendaPrefs.performance === true,
            };
            setPreferences(mappedPrefs);
            setHasConsented(true);
            // Sync to localStorage as backup
            localStorage.setItem('cookie-consent', JSON.stringify(mappedPrefs));
          }
        }
      }, 1000);
    };

    loadConsent();

    // Listen for iubenda consent events
    const handleConsentGiven = () => {
      setHasConsented(true);
    };

    const handlePreferenceExpressed = (event: CustomEvent) => {
      const prefs = event.detail;
      const mappedPrefs: CookiePreferences = {
        essential: true,
        analytics: prefs.analytics === true,
        performance: prefs.performance === true,
      };
      setPreferences(mappedPrefs);
      setHasConsented(true);
      localStorage.setItem('cookie-consent', JSON.stringify(mappedPrefs));
    };

    window.addEventListener('iubenda:consent-given', handleConsentGiven as EventListener);
    window.addEventListener('iubenda:preference-expressed', handlePreferenceExpressed as EventListener);

    return () => {
      window.removeEventListener('iubenda:consent-given', handleConsentGiven as EventListener);
      window.removeEventListener('iubenda:preference-expressed', handlePreferenceExpressed as EventListener);
    };
  }, []);

  const updatePreferences = useCallback(async (newPreferences: CookiePreferences) => {
    setPreferences(newPreferences);
    setHasConsented(true);
    
    // Save to localStorage
    localStorage.setItem('cookie-consent', JSON.stringify(newPreferences));
    
    // Sync to iubenda
    await setIubendaConsent({
      analytics: newPreferences.analytics,
      performance: newPreferences.performance,
    });
  }, []);

  const acceptAll = useCallback(async () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      performance: true,
    };
    await updatePreferences(allAccepted);
    await acceptAllIubenda();
  }, [updatePreferences]);

  const rejectAll = useCallback(async () => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      analytics: false,
      performance: false,
    };
    await updatePreferences(onlyEssential);
    await rejectAllIubenda();
  }, [updatePreferences]);

  const checkAnalytics = useCallback(async (): Promise<boolean> => {
    if (!isReady) {
      // Fallback to local state
      return hasConsented && preferences.analytics;
    }
    return await canUseAnalytics();
  }, [isReady, hasConsented, preferences.analytics]);

  const checkPerformance = useCallback(async (): Promise<boolean> => {
    if (!isReady) {
      // Fallback to local state
      return hasConsented && preferences.performance;
    }
    return await canUsePerformance();
  }, [isReady, hasConsented, preferences.performance]);

  return {
    preferences,
    hasConsented,
    isReady,
    updatePreferences,
    acceptAll,
    rejectAll,
    canUseAnalytics: checkAnalytics,
    canUsePerformance: checkPerformance,
  };
}


