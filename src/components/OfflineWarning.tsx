'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineWarning() {
  const [isOffline, setIsOffline] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if we're using localStorage fallback
    const checkOfflineStatus = () => {
      // Only check if we're online according to navigator
      if (!navigator.onLine) {
        setIsOffline(true);
        setIsVisible(true);
        return;
      }

      // Try to ping the database API with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      fetch('/api/user/preferences', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      })
      .then(() => {
        // API is available
        clearTimeout(timeoutId);
        setIsOffline(false);
        setIsVisible(false);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        // Only set offline if it's a network error, not an auth error
        if (error.name === 'AbortError' || error.name === 'TypeError' || !navigator.onLine) {
          setIsOffline(true);
          setIsVisible(true);
        }
        // Don't set offline for 401/403 errors - those are auth issues, not network issues
      });
    };

    // Check if we're currently using localStorage fallback
    const checkLocalStorageFallback = () => {
      // Check if we have localStorage data but no recent API success
      const hasLocalStorageData = localStorage.getItem('quillia-user');
      if (hasLocalStorageData && !navigator.onLine) {
        setIsOffline(true);
        setIsVisible(true);
      }
    };

    // Check if we're using localStorage for entries
    const checkEntriesFallback = () => {
      const hasLocalStorageEntries = localStorage.getItem('quillia-entries');
      if (hasLocalStorageEntries && !navigator.onLine) {
        setIsOffline(true);
        setIsVisible(true);
      }
    };

    // Check immediately
    checkOfflineStatus();
    checkLocalStorageFallback();
    checkEntriesFallback();

    // Check periodically
    const interval = setInterval(() => {
      checkOfflineStatus();
      checkLocalStorageFallback();
      checkEntriesFallback();
    }, 30000); // Every 30 seconds

    // Check on network status change
    const handleOnline = () => {
      checkOfflineStatus();
    };

    const handleOffline = () => {
      setIsOffline(true);
      setIsVisible(true);
    };

    // Listen for localStorage fallback events
    const handleLocalStorageFallback = (event: CustomEvent) => {
      console.log('localStorage fallback detected:', event.detail);
      setIsOffline(true);
      setIsVisible(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('localStorageFallback', handleLocalStorageFallback as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('localStorageFallback', handleLocalStorageFallback as EventListener);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <>
            <style jsx>{`
              .offline-banner {
                width: calc(100vw - 3rem);
                max-width: calc(100vw - 3rem);
              }
              .offline-banner .close-button {
                margin-right: -2rem;
              }
              @media (min-width: 640px) {
                .offline-banner {
                  width: auto;
                  max-width: 28rem;
                }
                .offline-banner .close-button {
                  margin-right: 0;
                }
              }
            `}</style>
            <div 
              className="offline-banner bg-yellow-600 border border-yellow-500 rounded-lg px-4 py-3 shadow-lg mx-4"
            >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-200" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-100" style={{ 
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    fontSize: '14px',
                    lineHeight: '1.4',
                    fontWeight: '500'
                  }}>
                    You&apos;re offline! Currently using local storage...
                  </p>
                  <p className="text-sm text-yellow-200 mt-1" style={{ 
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    fontSize: '14px',
                    lineHeight: '1.4',
                    fontWeight: '400',
                    border: 'none',
                    outline: 'none',
                    textShadow: 'none',
                    boxShadow: 'none'
                  }}>
                    Data will sync when connection is restored
                  </p>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={handleDismiss}
                  className="close-button text-yellow-200 hover:text-yellow-100 transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            </div>
            </>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
