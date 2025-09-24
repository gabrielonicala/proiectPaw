'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { Theme } from '@/types';
import { themes } from '@/themes';

interface ButtonProps {
  children: ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  pixelated?: boolean;
  style?: React.CSSProperties;
  theme?: Theme;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
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
  const getVariantStyle = (variant: 'primary' | 'secondary' | 'accent') => {
    if (!colors) return {};
    
    const colorMap = {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent
    };
    
    const baseColor = colorMap[variant];
    
    return {
      background: `linear-gradient(to bottom, ${baseColor}, ${adjustColor(baseColor, -20)})`,
      borderColor: baseColor,
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

  const variantClasses = {
    primary: 'border-2',
    secondary: 'border-2', 
    accent: 'border-2'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[44px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]'
  };
  
  const pixelatedClasses = pixelated ? 'pixelated' : 'rounded-lg';

  return (
    <motion.button
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
