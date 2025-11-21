'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { Theme } from '@/types';
import { themes } from '@/themes';

interface ButtonProps {
  id?: string;
  children: ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  pixelated?: boolean;
  style?: React.CSSProperties;
  theme?: Theme;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  id,
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  pixelated = true,
  style,
  theme = 'obsidian-veil',
  type = 'button'
}: ButtonProps) {
  const baseClasses = 'font-bold text-center cursor-pointer transition-all duration-200 active:scale-95';
  
  // Get theme colors from the actual theme configuration
  const themeConfig = themes[theme];
  const colors = themeConfig?.colors;
  
  // Create dynamic styles based on theme colors
  const getVariantStyle = (variant: 'primary' | 'secondary' | 'accent' | 'destructive') => {
    if (!colors) {
      // Fallback colors when theme is not available
      const fallbackColors = {
        primary: '#8B5CF6',
        secondary: '#6B7280', 
        accent: '#F59E0B',
        text: '#FFFFFF'
      };
      
      const colorMap = {
        primary: fallbackColors.primary,
        secondary: fallbackColors.secondary,
        accent: fallbackColors.accent,
        destructive: '#DC2626' // Red color for destructive actions
      };
      
      const baseColor = colorMap[variant];
      
      return {
        background: `linear-gradient(to bottom, ${baseColor}, ${adjustColor(baseColor, -20)})`,
        borderColor: baseColor,
        color: fallbackColors.text,
        boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
      };
    }
    
    // Special handling for Steel Spirit theme navigation buttons
    if (theme === 'blazeheart-saga' && variant === 'secondary') {
      return {
        background: `linear-gradient(to bottom, #8B0000, ${adjustColor('#8B0000', -20)})`,
        borderColor: '#8B0000',
        color: '#FFFFFF',
        boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
      };
    }
    
    const colorMap = {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      destructive: '#DC2626' // Red color for destructive actions
    };
    
    const baseColor = colorMap[variant];
    
    const baseStyle = {
      background: `linear-gradient(to bottom, ${baseColor}, ${adjustColor(baseColor, -20)})`,
      borderColor: baseColor,
      color: colors.text,
      boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
    };
    
    // Add text-shadow border for secondary buttons with white/light text for better visibility
    if (variant === 'secondary') {
      // Check if text is white or very light (hex codes starting with #F, #E, or exact matches)
      const isLightText = colors.text === '#FFFFFF' || 
                         colors.text === '#F5F5F5' || 
                         colors.text === '#F5DEB3' ||
                         colors.text === '#E6E6FA' ||
                         colors.text === '#E6F3FF' ||
                         colors.text?.match(/^#[EF][0-9A-Fa-f]/);
      
      if (isLightText) {
        return {
          ...baseStyle,
          textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8), -1px -1px 0px rgba(0, 0, 0, 0.8), 1px -1px 0px rgba(0, 0, 0, 0.8), -1px 1px 0px rgba(0, 0, 0, 0.8), 0px 1px 0px rgba(0, 0, 0, 0.8), 0px -1px 0px rgba(0, 0, 0, 0.8), 1px 0px 0px rgba(0, 0, 0, 0.8), -1px 0px 0px rgba(0, 0, 0, 0.8)'
        };
      }
    }
    
    return baseStyle;
  };

  // Helper function to adjust color brightness
  const adjustColor = (color: string | undefined, amount: number) => {
    if (!color) return '#666666'; // Fallback color
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const variantClasses = {
    primary: 'border-2',
    secondary: 'border-2', 
    accent: 'border-2',
    destructive: 'border-2'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[44px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]'
  };
  
  const pixelatedClasses = pixelated ? 'pixelated' : 'rounded-lg';

  return (
    <motion.button
      id={id}
      type={type}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...getVariantStyle(variant),
        ...style
      }}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        pixelatedClasses,
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </motion.button>
  );
}
