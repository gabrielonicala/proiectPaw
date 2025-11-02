'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode, CSSProperties } from 'react';
import { Theme } from '@/types';
import { themes } from '@/themes';

interface CardProps {
  children: ReactNode;
  className?: string;
  pixelated?: boolean;
  hover?: boolean;
  onClick?: () => void;
  theme?: Theme;
  effect?: string;
  style?: CSSProperties;
}

export default function Card({
  children,
  className,
  pixelated = true,
  hover = false,
  onClick,
  theme,
  effect,
  style
}: CardProps) {
  // Get theme colors
  const themeConfig = themes[theme || 'obsidian-veil'];
  const colors = themeConfig?.colors;
  
  // Create dynamic styles based on theme colors
  const getCardStyle = () => {
    if (!colors) return {};
    
    return {
      background: `linear-gradient(to bottom, ${colors.background}, ${adjustColor(colors.background, -20)})`,
      borderColor: colors.border,
      color: colors.text,
      boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
    };
  };

  // Helper function to adjust color brightness
  const adjustColor = (color: string, amount: number) => {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const baseClasses = 'border-2 p-4';
  const pixelatedClasses = pixelated ? 'pixelated' : 'rounded-lg';
  const hoverClasses = hover ? 'cursor-pointer transition-all duration-200' : '';
  
  // Theme-specific classes
  const themeClasses = theme ? `theme-${theme}` : '';
  const effectClasses = effect ? `${effect}-effect` : '';

  const Component = hover ? motion.div : 'div';
  const motionProps = hover ? {
    whileHover: { 
      scale: 1.02,
      boxShadow: colors ? `0 0 20px ${colors.accent}, 0 0 40px ${colors.accent}` : "0 0 20px #FFD700, 0 0 40px #FFD700"
    },
    whileTap: { scale: 0.98 }
  } : {};

  return (
    <Component
      {...motionProps}
      onClick={onClick}
      style={{ ...getCardStyle(), ...(style || {}) }}
      className={cn(
        baseClasses, 
        pixelatedClasses, 
        hoverClasses, 
        themeClasses,
        effectClasses,
        className
      )}
    >
      {children}
    </Component>
  );
}
