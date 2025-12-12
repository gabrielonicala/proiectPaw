'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_EMAILS = ['admin@quillia.app', 'gabrielonicala@gmail.com', 'contact@quillia.app', 'test@gmail.com'];

interface CreditBalanceProps {
  credits: number;
  isLow: boolean;
  onClick?: () => void;
  userEmail?: string;
}

export default function CreditBalance({ credits, isLow, onClick, userEmail }: CreditBalanceProps) {
  const [isFlashing, setIsFlashing] = useState(false);
  
  // Check if user is admin
  const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail);
  
  // Only allow clicking if user is admin
  const handleClick = () => {
    if (isAdmin && onClick) {
      onClick();
    }
  };

  useEffect(() => {
    if (isLow) {
      // Flash between white and red every 1 second
      const interval = setInterval(() => {
        setIsFlashing(prev => !prev);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsFlashing(false);
    }
  }, [isLow]);

  return (
    <button
      onClick={handleClick}
      className={`font-pixel text-white bg-transparent border-none flex items-center justify-center gap-1.5 ${
        isLow ? 'animate-pulse' : ''
      } ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
      style={{
        color: isFlashing ? '#ef4444' : '#ffffff',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        position: 'relative'
      }}
    >
      <Image
        src="/inkLogo.png"
        alt="Ink Vials"
        width={50}
        height={50}
        className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 ${isFlashing ? 'opacity-75 brightness-150' : ''}`}
        style={{
          filter: isFlashing 
            ? 'drop-shadow(0 0 12px rgba(139, 92, 246, 1)) drop-shadow(0 0 8px rgba(59, 130, 246, 0.9)) drop-shadow(0 0 4px rgba(147, 197, 253, 0.8)) brightness(1.5) saturate(2)' 
            : 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.9)) drop-shadow(0 0 6px rgba(59, 130, 246, 0.7)) drop-shadow(0 0 3px rgba(147, 197, 253, 0.6))',
          transition: 'filter 0.3s ease'
        }}
      />
      <AnimatePresence mode="wait">
        <motion.span
          key={credits}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="whitespace-nowrap font-pixel"
          style={{
            paddingTop: '4px',
            position: 'relative',
            fontSize: '1.425rem' // 18px - slightly bigger than text-base (16px)
          }}
        >
          {credits}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

