'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCachedAudioUrl, cacheAsset } from '@/lib/asset-cache';

interface BackgroundMusicProps {
  theme?: string;
  isPlaying?: boolean;
  onToggle?: (isPlaying: boolean) => void;
}

// Theme-based music tracks
const themeMusic = {
  'velour-nights': {
    name: 'Cozy City Life',
    url: '/music/velour-nights.mp3',
    fallbackUrl: '/music/velour-nights.ogg',
    description: 'Lo-fi hip hop beats perfect for cozy urban adventures'
  },
  'neon-ashes': {
    name: 'Cyberpunk Dystopia',
    url: '/music/neon-ashes.mp3',
    fallbackUrl: '/music/neon-ashes.ogg',
    description: 'Dark synthwave for neon-soaked futuristic tales'
  },
  'crimson-casefiles': {
    name: 'Detective Mystery',
    url: '/music/crimson-casefiles.mp3',
    fallbackUrl: '/music/crimson-casefiles.ogg',
    description: 'Film noir jazz for shadowy detective stories'
  },
  'blazeheart-saga': {
    name: 'Shōnen Protagonist',
    url: '/music/blazeheart-saga.mp3',
    fallbackUrl: '/music/blazeheart-saga.ogg',
    description: 'Epic J-rock for fiery determination and training arcs'
  },
  'echoes-of-dawn': {
    name: 'Nostalgia',
    url: '/music/echoes-of-dawn.mp3',
    fallbackUrl: '/music/echoes-of-dawn.ogg',
    description: 'Ambient piano for bittersweet memories and coming-of-age'
  },
  'obsidian-veil': {
    name: 'Dark Fantasy',
    url: '/music/obsidian-veil.mp3',
    fallbackUrl: '/music/obsidian-veil.ogg',
    description: 'Gothic orchestral music for dark fantasy adventures'
  },
  'starlit-horizon': {
    name: 'Sci-Fi Exploration',
    url: '/music/starlit-horizon.mp3',
    fallbackUrl: '/music/starlit-horizon.ogg',
    description: 'Space ambient for cosmic adventures across the stars'
  },
  'ivory-quill': {
    name: 'High Fantasy',
    url: '/music/ivory-quill.mp3',
    fallbackUrl: '/music/ivory-quill.ogg',
    description: 'Medieval orchestral music for wizards and kingdoms'
  },
  'wild-west': {
    name: 'Frontier Justice',
    url: '/music/wild-west.mp3',
    fallbackUrl: '/music/wild-west.ogg',
    description: 'Country western music for lawless frontier adventures'
  },
  'crimson-tides': {
    name: 'High Seas Adventure',
    url: '/music/crimson-tides.mp3',
    fallbackUrl: '/music/crimson-tides.ogg',
    description: 'Sea shanties and nautical music for pirate adventures'
  },
  'default': {
    name: 'Adventure Awaits',
    url: '/music/default.mp3',
    fallbackUrl: '/music/default.ogg',
    description: 'Epic orchestral music for grand adventures'
  }
};

export default function BackgroundMusic({ theme = 'dark-academia' }: BackgroundMusicProps) {
  // const [isMusicPlaying, setIsMusicPlaying] = useState(true); // Always start playing
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [showInteractionPrompt, setShowInteractionPrompt] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isMobileRef = useRef<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState(themeMusic[theme as keyof typeof themeMusic] || themeMusic.default);
  const [cachedAudioUrl, setCachedAudioUrl] = useState<string | null>(null);

  // Cache audio when track changes
  useEffect(() => {
    const cacheCurrentTrack = async () => {
      const cached = getCachedAudioUrl(currentTrack.url);
      if (cached !== currentTrack.url) {
        setCachedAudioUrl(cached);
      } else {
        // Try to cache the audio for future use
        const cachedData = await cacheAsset(currentTrack.url, 'audio/mpeg');
        if (cachedData) {
          setCachedAudioUrl(cachedData);
        } else {
          setCachedAudioUrl(currentTrack.url);
        }
      }
    };

    cacheCurrentTrack();
  }, [currentTrack]);

  // Detect mobile device and update on resize
  useEffect(() => {
    const updateMobileDetection = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                      window.innerWidth <= 768;
      isMobileRef.current = isMobile;
      
      // Set volume to 50% on mobile
      if (isMobile) {
        setVolume(0.5);
      }
    };

    // Initial detection
    updateMobileDetection();

    // Listen for window resize (for device rotation, browser resize, etc.)
    window.addEventListener('resize', updateMobileDetection);
    
    return () => {
      window.removeEventListener('resize', updateMobileDetection);
    };
  }, []);

  // Update track when theme changes
  useEffect(() => {
    const newTrack = themeMusic[theme as keyof typeof themeMusic] || themeMusic.default;
    setCurrentTrack(newTrack);
    setHasError(false);
    setIsLoading(true);
  }, [theme]);

  // User interaction detection for autoplay
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!userInteracted) {
        setUserInteracted(true);
        setShowInteractionPrompt(false);
        // Try to play audio after user interaction
        if (audioRef.current && !isMuted) {
          audioRef.current.play().catch(e => {
            console.error("Error playing audio after user interaction:", e);
          });
        }
      }
    };

    // Listen for various user interactions
    const events = ['click', 'keydown', 'keyup', 'touchstart', 'mousedown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
    });

    // Show interaction prompt after a delay if no interaction yet
    const promptTimer = setTimeout(() => {
      if (!userInteracted) {
        setShowInteractionPrompt(true);
      }
    }, 3000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
      clearTimeout(promptTimer);
    };
  }, [userInteracted, isMuted]);

  // Handle audio loading and errors
  const handleCanPlay = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    console.warn(`Failed to load music: ${currentTrack.name}. Music will be disabled.`);
  };

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  // Handle audio playback - only play after user interaction
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      // Only try to play if user has interacted and not muted
      if (userInteracted && !isMuted) {
        audioRef.current.play().catch(e => {
          console.error("Error playing audio:", e);
          setHasError(true);
        });
      }
    }
  }, [volume, isMuted, currentTrack, userInteracted]);

  // Handle track end - loop the music
  const handleTrackEnd = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  };

  // Music always plays, we only toggle mute/unmute

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    // If user adjusts volume, unmute
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={cachedAudioUrl || currentTrack.url}
        loop
        onEnded={handleTrackEnd}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onLoadStart={handleLoadStart}
        preload="metadata"
      >
        <source src={currentTrack.url} type="audio/mpeg" />
        <source src={currentTrack.fallbackUrl} type="audio/ogg" />
        Your browser does not support the audio element.
      </audio>

      {/* Music Controls */}
      <div 
        className="fixed bottom-4 right-4 z-50"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Toggle Button */}
        <motion.button
          onClick={toggleMute}
          className={`w-12 h-12 bg-gray-900/80 backdrop-blur-sm border-2 rounded-full flex items-center justify-center transition-all duration-300 pixelated ${
            hasError 
              ? 'border-red-400 text-red-400 hover:bg-red-400/20' 
              : 'border-yellow-400 text-yellow-400 hover:bg-yellow-400/20'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          disabled={hasError}
        >
          {hasError ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          ) : isLoading ? (
            <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isMuted ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3z"/>
              <path d="M21 3L3 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          )}
        </motion.button>

        {/* Expanded Controls - Hidden on mobile */}
        <AnimatePresence>
          {showControls && !isMobileRef.current && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 bg-gray-900/90 backdrop-blur-sm border-2 border-yellow-400 rounded-lg p-4 min-w-64 pixelated"
            >
              {/* Track Info */}
              <div className="mb-3">
                {hasError && (
                  <p className="text-red-400 text-xs mt-1">
                    ⚠️ Music file not found. Add music files to /public/music/ to enable background music.
                  </p>
                )}
                {isLoading && (
                  <p className="text-yellow-400 text-xs mt-1">
                    🎵 Loading music...
                  </p>
                )}
              </div>

              {/* Volume Control - Hidden on mobile */}
              {!isMobileRef.current && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-yellow-400 font-pixel text-xs">Volume</span>
                    <button
                      onClick={toggleMute}
                      className="text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      {isMuted ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #FFD700 0%, #FFD700 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`
                    }}
                  />
                </div>
              )}

              {/* Theme Indicator */}
              <div className="text-center">
                <span className="text-gray-400 font-pixel text-xs">
                  {theme.replace(/-/g, ' ').toUpperCase()}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #FFD700;
          cursor: pointer;
          border: 2px solid #FFA500;
          touch-action: none;
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #FFD700;
          cursor: pointer;
          border: 2px solid #FFA500;
          touch-action: none;
        }
        
        .slider {
          touch-action: none;
        }
      `}</style>

      {/* User Interaction Prompt */}
      {/* <AnimatePresence>
        {showInteractionPrompt && !userInteracted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 z-50 bg-gray-900/90 backdrop-blur-sm border-2 border-yellow-400 rounded-lg p-3 max-w-xs"
          >
            <div className="flex items-center gap-2 text-yellow-400 text-sm font-pixel">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
              <span>Click anywhere to enable background music</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}
    </>
  );
}
