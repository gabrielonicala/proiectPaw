'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import { Theme } from '@/types';
import { themes } from '@/themes';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  variant?: 'success' | 'error' | 'info';
  theme?: Theme;
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'OK',
  variant = 'info',
  theme = 'obsidian-veil'
}: AlertModalProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-400';
      case 'error':
        return 'border-red-400';
      default:
        return 'border-yellow-400';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      default:
        return 'ℹ';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="p-6 rounded-lg pixelated border-2 max-w-md w-full"
          style={{
            backgroundColor: themes[theme || 'obsidian-veil'].colors.background,
            borderColor: themes[theme || 'obsidian-veil'].colors.accent
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="font-pixel text-lg mb-4 text-center" style={{ color: themes[theme || 'obsidian-veil'].colors.accent }}>
            {getIcon()} {title}
          </h3>
          
          <p className="font-pixel mb-6 text-center" style={{ color: themes[theme || 'obsidian-veil'].colors.text }}>
            {message}
          </p>

          {/* Button */}
          <div className="flex justify-center">
            <Button
              onClick={onClose}
              variant="accent"
              theme={theme || 'obsidian-veil'}
              className="px-8"
            >
              {buttonText}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
