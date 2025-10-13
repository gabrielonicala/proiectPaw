'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import { Theme } from '@/types';
import { themes } from '@/themes';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'accent' | 'destructive';
  theme?: Theme;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL',
  confirmVariant = 'destructive',
  theme = 'obsidian-veil',
  isLoading = false
}: ConfirmationModalProps) {
  if (!isOpen) return null;

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
            ⚠️ {title}
          </h3>
          
          <p className="font-pixel mb-6 text-center" style={{ color: themes[theme || 'obsidian-veil'].colors.text }}>
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="secondary"
              theme={theme || 'obsidian-veil'}
              className="flex-1"
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              variant={confirmVariant}
              theme={theme || 'obsidian-veil'}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'PROCESSING...' : confirmText}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
