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

  // Show on all pages now (including profile page)
  // if (currentPage === 'profile') {
  //   return null;
  // }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: '/home' });
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
        className="fixed bottom-4 left-4 z-50 w-12 h-12 border-2 font-pixel transition-all duration-200 hover:shadow-lg pixelated flex items-center justify-center"
        style={{
          backgroundColor: '#1a1a1a',
          borderColor: '#ef4444',
          color: '#ef4444'
        }}
        title="Logout"
      >
        {isLoggingOut ? '⏳' : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
        )}
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
