'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

interface GlobalLogoutButtonProps {
  theme?: string;
  currentPage?: string;
}

export default function GlobalLogoutButton({ theme = 'obsidian-veil', currentPage }: GlobalLogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Don't show on profile page since it already has logout in navigation
  if (currentPage === 'profile') {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: '/auth/signin' });
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Global Logout Button - Bottom Left */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="fixed bottom-4 left-4 z-50 w-12 h-12 border-2 font-pixel text-2xl transition-all duration-200 hover:shadow-lg pixelated"
        style={{
          backgroundColor: '#1a1a1a',
          borderColor: '#8B4513',
          color: '#fff'
        }}
        title="Logout"
      >
        {isLoggingOut ? '⏳' : '🚪'}
      </motion.button>

      {/* Logout Loading Overlay */}
      {isLoggingOut && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-[10000]"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-yellow-400 border-t-transparent pixelated mb-4"
          />
          <p className="font-pixel text-yellow-300 text-lg">
            Logging out...
          </p>
        </motion.div>
      )}
    </>
  );
}
