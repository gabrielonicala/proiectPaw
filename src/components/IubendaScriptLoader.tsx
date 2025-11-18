'use client';

import { useEffect } from 'react';
import { initIubenda } from '@/lib/iubenda';

/**
 * Component to load and initialize iubenda script
 * This should be added to your root layout
 */
export default function IubendaScriptLoader() {
  useEffect(() => {
    const siteId = process.env.NEXT_PUBLIC_IUBENDA_SITE_ID;
    
    if (!siteId) {
      console.warn('iubenda Site ID not found. Please set NEXT_PUBLIC_IUBENDA_SITE_ID in your environment variables.');
      return;
    }

    // Initialize iubenda
    initIubenda(siteId);
  }, []);

  return null;
}


