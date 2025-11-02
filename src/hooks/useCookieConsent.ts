'use client';

import { useState, useEffect } from 'react';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  performance: boolean;
}

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    performance: false,
  });
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent) {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
      setHasConsented(true);
    }
  }, []);

  const updatePreferences = (newPreferences: CookiePreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('cookie-consent', JSON.stringify(newPreferences));
    setHasConsented(true);
  };

  const canUseAnalytics = () => {
    return hasConsented && preferences.analytics;
  };

  const canUsePerformance = () => {
    return hasConsented && preferences.performance;
  };

  return {
    preferences,
    hasConsented,
    updatePreferences,
    canUseAnalytics,
    canUsePerformance,
  };
}
