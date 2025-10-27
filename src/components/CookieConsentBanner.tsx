'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Settings, X } from 'lucide-react';
import { themes } from '@/themes';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  performance: boolean;
}

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, can't be disabled
    analytics: false,
    performance: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      performance: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      analytics: false,
      performance: false,
    };
    setPreferences(onlyEssential);
    localStorage.setItem('cookie-consent', JSON.stringify(onlyEssential));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    setIsVisible(false);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'essential') return; // Can't disable essential cookies
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed bottom-0 left-0 right-0 z-[10000] p-4"
      >
        <div className="max-w-5xl mx-auto">
          <div 
            className="bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-6 shadow-2xl"
            style={{
              borderColor: themes['obsidian-veil'].colors.border,
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Cookie className="w-6 h-6 text-yellow-400" />
                <h3 className="font-pixel text-lg text-white">
                   Cookie Preferences
                </h3>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-gray-300 font-pixel text-sm mb-6 leading-relaxed">
              We use cookies for login security and analytics to improve Quillia. 
              Essential cookies are required for the app to function properly.
            </p>

            {/* Cookie Types */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded border border-gray-700">
                <div>
                  <h4 className="font-pixel text-sm text-white">Essential Cookies</h4>
                  <p className="text-xs text-gray-400">Required for login and security</p>
                </div>
                <div 
                  className="bg-green-500 flex items-center justify-end px-1"
                  style={{
                    borderRadius: '6px',
                    width: '32px',
                    height: '12px',
                    minWidth: '32px',
                    minHeight: '12px',
                    maxHeight: '12px',
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    border: 'none',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <div 
                    className="bg-white"
                    style={{
                      borderRadius: '50%',
                      width: '8px',
                      height: '8px',
                      minWidth: '8px',
                      minHeight: '8px',
                      maxWidth: '8px',
                      maxHeight: '8px',
                      flexShrink: 0
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded border border-gray-700">
                <div>
                  <h4 className="font-pixel text-sm text-white">Analytics Cookies</h4>
                  <p className="text-xs text-gray-400">Help us improve the app</p>
                </div>
                <div
                  onClick={() => togglePreference('analytics')}
                  className={`flex items-center px-1 transition-colors cursor-pointer ${
                    preferences.analytics ? 'bg-green-500 justify-end' : 'bg-gray-600 justify-start'
                  }`}
                  style={{
                    borderRadius: '6px',
                    width: '32px',
                    height: '12px',
                    minWidth: '32px',
                    minHeight: '12px',
                    maxHeight: '12px',
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    border: 'none',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <div 
                    className="bg-white"
                    style={{
                      borderRadius: '50%',
                      width: '8px',
                      height: '8px',
                      minWidth: '8px',
                      minHeight: '8px',
                      maxWidth: '8px',
                      maxHeight: '8px',
                      flexShrink: 0
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded border border-gray-700">
                <div>
                  <h4 className="font-pixel text-sm text-white">Performance Cookies</h4>
                  <p className="text-xs text-gray-400">Monitor app speed and performance</p>
                </div>
                <div
                  onClick={() => togglePreference('performance')}
                  className={`flex items-center px-1 transition-colors cursor-pointer ${
                    preferences.performance ? 'bg-green-500 justify-end' : 'bg-gray-600 justify-start'
                  }`}
                  style={{
                    borderRadius: '6px',
                    width: '32px',
                    height: '12px',
                    minWidth: '32px',
                    minHeight: '12px',
                    maxHeight: '12px',
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    border: 'none',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <div 
                    className="bg-white"
                    style={{
                      borderRadius: '50%',
                      width: '8px',
                      height: '8px',
                      minWidth: '8px',
                      minHeight: '8px',
                      maxWidth: '8px',
                      maxHeight: '8px',
                      flexShrink: 0
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsVisible(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-pixel text-sm rounded border border-gray-600 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleSavePreferences}
                className="flex-1 px-4 py-2 font-pixel text-sm rounded transition-colors"
                style={{
                  backgroundColor: themes['obsidian-veil'].colors.accent,
                  color: '#FFFFFF',
                }}
              >
                ACCEPT
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-4 py-2 font-pixel text-sm rounded transition-colors"
                style={{
                  backgroundColor: themes['obsidian-veil'].colors.accent,
                  color: '#FFFFFF',
                }}
              >
                ACCEPT ALL
              </button>
            </div>

            {/* Privacy Policy Link */}
            <div className="mt-4 text-center">
              <a
                href="/legal/privacy"
                className="text-xs text-gray-400 hover:text-white transition-colors font-pixel underline"
              >
                Learn more in our Privacy Policy
              </a>
            </div>
          </div>
        </div>

        {/* Preferences Modal - COMMENTED OUT */}
        {/*
        <AnimatePresence>
          {showPreferences && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10001] p-4"
              onClick={() => setShowPreferences(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-6 max-w-md w-full"
                style={{
                  borderColor: themes['obsidian-veil'].colors.border,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-pixel text-lg text-white mb-4 text-center">
                  Cookie Settings
                </h3>
                
                <div className="space-y-4 mb-6">
                  {Object.entries(preferences).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-pixel text-sm text-white capitalize">
                          {key === 'essential' ? 'Essential Cookies' :
                           key === 'analytics' ? 'Analytics Cookies' :
                           'Performance Cookies'}
                        </h4>
                        <p className="text-xs text-gray-400">
                          {key === 'essential' ? 'Required for app functionality' :
                           key === 'analytics' ? 'Help us improve the app' :
                           'Monitor performance metrics'}
                        </p>
                      </div>
                      <div
                        onClick={() => key !== 'essential' && togglePreference(key as keyof CookiePreferences)}
                        className={`flex items-center px-1 transition-colors ${
                          value ? 'bg-green-500 justify-end' : 'bg-gray-600 justify-start'
                        } ${key === 'essential' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        style={{
                          borderRadius: '6px',
                          width: '32px',
                          height: '12px',
                          minWidth: '32px',
                          minHeight: '12px',
                          maxHeight: '12px',
                          WebkitAppearance: 'none',
                          appearance: 'none',
                          border: 'none',
                          outline: 'none',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <div 
                          className="bg-white"
                          style={{
                            borderRadius: '50%',
                            width: '8px',
                            height: '8px',
                            minWidth: '8px',
                            minHeight: '8px',
                            maxWidth: '8px',
                            maxHeight: '8px',
                            flexShrink: 0
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-pixel text-sm rounded border border-gray-600 transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    className="flex-1 px-4 py-2 font-pixel text-sm rounded transition-colors"
                    style={{
                      backgroundColor: themes['obsidian-veil'].colors.accent,
                      color: '#FFFFFF',
                    }}
                  >
                    SAVE
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        */}
      </motion.div>
    </AnimatePresence>
  );
}
