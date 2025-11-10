'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Button from './ui/Button';
import { Theme } from '@/types';
import { themes } from '@/themes';
import { useEntries } from '@/hooks/useEntries';

interface IntroScreenProps {
  onStart: () => void;
  theme?: Theme;
}

export default function IntroScreen({ onStart, theme = 'velour-nights' }: IntroScreenProps) {
  const themeConfig = themes[theme];
  const colors = themeConfig?.colors;
  const [showPressToStart, setShowPressToStart] = useState(false);
  const { entries, isLoading } = useEntries();

  // Check if user is new based on their entry count
  const isFirstTimeUser = entries.length === 0;

  useEffect(() => {
    // Only show the button after entries have been loaded from the backend
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowPressToStart(true);
      }, 1000); // Reduced delay since we're already waiting for backend
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: colors ? `linear-gradient(to bottom, ${colors.background}, ${colors.primary}, ${colors.secondary})` : 'linear-gradient(to bottom, #581c87, #1e3a8a, #312e81)'
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 opacity-20 pixelated"
          style={{ backgroundColor: colors?.accent || '#fbbf24' }}
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-24 h-24 opacity-20 pixelated"
          style={{ backgroundColor: colors?.primary || '#ec4899' }}
          animate={{
            rotate: -360,
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-16 h-16 opacity-20 pixelated"
          style={{ backgroundColor: colors?.secondary || '#10b981' }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center z-10"
      >
        {/* App Logo */}
        <motion.div
          className="mb-0"
          animate={{
            scale: [1, 1.02, 1],
            filter: [
              'drop-shadow(0 0 20px rgba(255,255,255,0.5))',
              'drop-shadow(0 0 30px rgba(255,255,255,0.7))',
              'drop-shadow(0 0 20px rgba(255,255,255,0.5))'
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <img 
            src="/logo.png" 
            alt="Quillia" 
            className="w-48 md:w-64 lg:w-80 h-auto mx-auto pixelated"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))',
              imageRendering: 'pixelated',
              transform: 'translateX(17%)'
            }}
            loading="eager"
            decoding="sync"
          />
        </motion.div>

        {/* Subtitle */}
        {/* <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="font-pixel text-3xl md:text-4xl lg:text-5xl mb-8 font-semibold tracking-wide"
          style={{ 
            color: '#d4af37',
            textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8), -2px -2px 0px rgba(0, 0, 0, 0.8), 2px -2px 0px rgba(0, 0, 0, 0.8), -2px 2px 0px rgba(0, 0, 0, 0.8)'
          }}
        >
          Turn Your Days Into Adventures
        </motion.p> */}

        {/* Decorative border */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="w-80 md:w-96 lg:w-[500px] h-1 mx-auto mb-8"
          style={{
            background: `linear-gradient(to right, transparent, ${colors?.accent || '#fbbf24'}, transparent)`,
            boxShadow: `0 0 10px ${colors?.accent || '#fbbf24'}, 0 0 20px ${colors?.accent || '#fbbf24'}`
          }}
        />

        {/* Press to start button */}
        {showPressToStart && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Button
                onClick={onStart}
                variant="primary"
                size="lg"
                className="text-lg px-12 py-4 font-pixel"
                style={{ 
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  boxShadow: 'none'
                }}
              >
                {isFirstTimeUser ? 'Start your adventure...' : 'Continue your adventure...'}
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Loading dots */}
        {(!showPressToStart || isLoading) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex justify-center space-x-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 pixelated"
                style={{ backgroundColor: colors?.accent || '#fbbf24' }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 opacity-30 pixelated"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: colors?.text || '#ffffff'
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
