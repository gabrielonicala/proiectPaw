'use client';

import { motion } from 'framer-motion';
import { Theme } from '@/types';
import { useState, useEffect } from 'react';

interface ThemeEffectsProps {
  theme: Theme;
}

export default function ThemeEffects({ theme }: ThemeEffectsProps) {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const handleKeyDown = () => setIsTyping(true);
    const handleKeyUp = () => {
      setTimeout(() => setIsTyping(false), 1000); // Keep reduced animations for 1 second after typing stops
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const renderThemeEffects = () => {
    switch (theme) {
      case 'echoes-of-dawn':
        return (
          <>
            {/* Rain drops - reduced count for performance */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`rain-${i}`}
                className="absolute w-0.5 h-8 bg-blue-400 opacity-30 pixelated"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={isTyping ? {} : {
                  y: [0, 100],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: isTyping ? 0 : 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
            {/* Fog effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"
              animate={isTyping ? {} : { x: [-100, 100] }}
              transition={{ duration: isTyping ? 0 : 8, repeat: Infinity, ease: "linear" }}
            />
            {/* Gentle floating particles - reduced count for performance */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1 h-1 bg-blue-300 opacity-20 pixelated"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={isTyping ? {} : {
                  y: [0, -50, 0],
                  x: [0, Math.random() * 20 - 10, 0],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: isTyping ? 0 : 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </>
        );

      case 'neon-ashes':
        return (
          <>
            {/* Matrix-style falling code - reduced count for performance */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`matrix-${i}`}
                className="absolute w-1 h-12 bg-cyan-400 opacity-20 pixelated"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={isTyping ? {} : {
                  y: [-100, 100],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: isTyping ? 0 : 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
            {/* Neon grid lines */}
            <motion.div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(cyan 1px, transparent 1px),
                  linear-gradient(90deg, cyan 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
              }}
              animate={isTyping ? {} : { opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: isTyping ? 0 : 2, repeat: Infinity }}
            />
            {/* Glitch effects */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`glitch-${i}`}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
                animate={{
                  x: [-100, 100],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </>
        );

      case 'blazeheart-saga':
        return (
          <>
            {/* Energy bursts - reduced count for performance */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`energy-${i}`}
                className="absolute w-16 h-1 bg-orange-400 opacity-30 pixelated"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={isTyping ? {} : {
                  x: [-100, 100],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: isTyping ? 0 : 1.5,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
            {/* Speed lines - reduced count for performance */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`speed-${i}`}
                className="absolute w-20 h-0.5 bg-yellow-400 opacity-40 pixelated"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [-200, 200],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: Math.random() * 1.5,
                }}
              />
            ))}
            {/* Power aura particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`aura-${i}`}
                className="absolute w-2 h-2 bg-orange-400 opacity-20 pixelated"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [0, 2, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </>
        );

      case 'obsidian-veil':
        return (
          <>
            {/* Floating book pages */}
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={`page-${i}`}
                className="absolute w-8 h-10 bg-yellow-200 opacity-20 pixelated"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  rotate: [0, 5],
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  duration: 6 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
            {/* Ink splatters */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`ink-${i}`}
                className="absolute w-4 h-4 bg-gray-800 opacity-20 pixelated"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [0, 1.5, 1],
                  opacity: [0, 0.4, 0.2],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: Math.random() * 4,
                }}
              />
            ))}
            {/* Candle flicker effect */}
            <motion.div
              className="absolute top-10 right-10 w-2 h-8 bg-yellow-400 opacity-30 pixelated"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </>
        );

      case 'ivory-quill':
        return (
          <>
            {/* Banner waves */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`banner-${i}`}
                className="absolute w-16 h-20 bg-red-600 opacity-20 pixelated"
                style={{
                  left: `${20 + i * 20}%`,
                  top: '10%',
                }}
                animate={{
                  rotate: [0, 2],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
            {/* Torch flames */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`torch-${i}`}
                className="absolute w-3 h-6 bg-orange-400 opacity-30 pixelated"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
            {/* Stone texture overlay */}
            <motion.div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 50%, rgba(139, 69, 19, 0.3) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(139, 69, 19, 0.3) 0%, transparent 50%),
                  radial-gradient(circle at 40% 80%, rgba(139, 69, 19, 0.3) 0%, transparent 50%)
                `,
              }}
              animate={{ opacity: [0.05, 0.1, 0.05] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
          </>
        );

      case 'wild-west':
        return (
          <>
            {/* Steam clouds */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`steam-${i}`}
                className="absolute w-12 h-12 bg-gray-300 opacity-20 pixelated"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -40, -80],
                  scale: [1, 1.5, 2],
                  opacity: [0.2, 0.4, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
            {/* Gear rotations */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`gear-${i}`}
                className="absolute w-8 h-8 border-2 border-yellow-600 opacity-20 pixelated"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
            {/* Brass glow effects */}
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={`brass-${i}`}
                className="absolute w-3 h-3 bg-yellow-400 opacity-20 pixelated"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.2, 0.6, 0.2],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {renderThemeEffects()}
    </div>
  );
}
