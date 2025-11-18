/**
 * iubenda Integration Utilities
 * 
 * This module provides utilities for interacting with iubenda's Cookie Solution API
 * while maintaining your custom cookie banner UI.
 */

declare global {
  interface Window {
    _iub?: {
      csConfiguration: {
        siteId: number;
        cookiePolicyId: number;
        lang: string;
        banner: {
          position: string;
          acceptButtonDisplay: boolean;
          customizeButtonDisplay: boolean;
          rejectButtonDisplay: boolean;
        };
        callback: {
          onConsentGiven?: () => void;
          onConsentRejected?: () => void;
          onPreferenceExpressed?: (preference: any) => void;
        };
      };
      csApi?: {
        getConsent: () => boolean;
        getPreferences: () => any;
        setConsent: (preferences: any) => void;
        accept: () => void;
        reject: () => void;
      };
    };
  }
}

/**
 * Initialize iubenda Cookie Solution
 * This should be called once when the app loads
 */
export function initIubenda(siteId: string) {
  if (typeof window === 'undefined') return;

  // Check if already initialized
  if (window._iub?.csApi) {
    return;
  }

  // Load iubenda script if not already loaded
  if (!document.querySelector('script[src*="iubenda.com/cs"]')) {
    const script = document.createElement('script');
    script.src = `https://cs.iubenda.com/autoblocking/${siteId}.js`;
    script.async = true;
    document.head.appendChild(script);
  }

  // Configure iubenda (this will be set up when script loads)
  if (!window._iub) {
    window._iub = {
      csConfiguration: {
        siteId: 0,
        cookiePolicyId: 0,
        lang: 'en',
        banner: {
          position: 'bottom',
          acceptButtonDisplay: false,
          customizeButtonDisplay: false,
          rejectButtonDisplay: false,
        },
        callback: {},
      },
    };
  }
  window._iub.csConfiguration = {
    siteId: parseInt(siteId),
    cookiePolicyId: parseInt(siteId), // Usually same as siteId
    lang: 'en',
    banner: {
      position: 'bottom',
      acceptButtonDisplay: false, // We use our custom banner
      customizeButtonDisplay: false,
      rejectButtonDisplay: false,
    },
    callback: {
      onConsentGiven: () => {
        // Dispatch custom event for your components
        window.dispatchEvent(new CustomEvent('iubenda:consent-given'));
      },
      onConsentRejected: () => {
        window.dispatchEvent(new CustomEvent('iubenda:consent-rejected'));
      },
      onPreferenceExpressed: (preference: any) => {
        window.dispatchEvent(new CustomEvent('iubenda:preference-expressed', {
          detail: preference
        }));
      },
    },
  };
}

/**
 * Check if iubenda API is ready
 */
export function isIubendaReady(): boolean {
  return typeof window !== 'undefined' && !!window._iub?.csApi;
}

/**
 * Wait for iubenda API to be ready
 */
export function waitForIubenda(): Promise<void> {
  return new Promise((resolve) => {
    if (isIubendaReady()) {
      resolve();
      return;
    }

    const checkInterval = setInterval(() => {
      if (isIubendaReady()) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, 5000);
  });
}

/**
 * Get current consent status from iubenda
 */
export async function getIubendaConsent(): Promise<boolean> {
  await waitForIubenda();
  if (!isIubendaReady()) return false;
  return window._iub!.csApi!.getConsent() || false;
}

/**
 * Get consent preferences from iubenda
 */
export async function getIubendaPreferences(): Promise<any> {
  await waitForIubenda();
  if (!isIubendaReady()) return null;
  return window._iub!.csApi!.getPreferences() || null;
}

/**
 * Set consent preferences in iubenda
 */
export async function setIubendaConsent(preferences: {
  analytics?: boolean;
  performance?: boolean;
}): Promise<void> {
  await waitForIubenda();
  if (!isIubendaReady()) return;

  // Map your preferences to iubenda format
  const iubendaPreferences = {
    necessary: true, // Always true
    marketing: false, // You don't use marketing cookies
    analytics: preferences.analytics || false,
    performance: preferences.performance || false,
  };

  window._iub!.csApi!.setConsent(iubendaPreferences);
}

/**
 * Accept all cookies in iubenda
 */
export async function acceptAllIubenda(): Promise<void> {
  await waitForIubenda();
  if (!isIubendaReady()) return;
  window._iub!.csApi!.accept();
}

/**
 * Reject all non-essential cookies in iubenda
 */
export async function rejectAllIubenda(): Promise<void> {
  await waitForIubenda();
  if (!isIubendaReady()) return;
  window._iub!.csApi!.reject();
}

/**
 * Check if analytics cookies are consented
 */
export async function canUseAnalytics(): Promise<boolean> {
  const preferences = await getIubendaPreferences();
  if (!preferences) return false;
  return preferences.analytics === true;
}

/**
 * Check if performance cookies are consented
 */
export async function canUsePerformance(): Promise<boolean> {
  const preferences = await getIubendaPreferences();
  if (!preferences) return false;
  return preferences.performance === true;
}





