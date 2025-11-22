'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Production domains that should be tracked
const PRODUCTION_DOMAINS = ['quillia.app', 'www.quillia.app'];

function isProductionDomain(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return PRODUCTION_DOMAINS.includes(hostname);
}

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Only track in production on production domains
    if (!isProductionDomain()) {
      return;
    }

    // Don't track admin pages or API routes
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/api')) {
      return;
    }

    // Skip tracking for static assets
    if (!pathname || pathname.startsWith('/_next') || pathname === '/favicon.ico') {
      return;
    }

    // Track the page view
    const trackPageView = async () => {
      try {
        // Get IP from a free service (client-side)
        let clientIP: string | null = null;
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json', {
            signal: AbortSignal.timeout(2000),
          });
          if (ipResponse.ok) {
            const ipData = await ipResponse.json();
            clientIP = ipData.ip;
          }
        } catch (error) {
          // Silently fail - IP detection is optional
        }

        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            path: pathname,
            clientIP: clientIP, // Send IP from client side
          }),
        });
      } catch (error) {
        // Silently fail - tracking shouldn't break the site
        console.error('Failed to track page view:', error);
      }
    };

    // Small delay to ensure page is fully loaded
    const timeoutId = setTimeout(trackPageView, 100);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null; // This component doesn't render anything
}

