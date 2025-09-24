'use client';

import { useEffect } from 'react';

interface ThemeCursorStylesProps {
  theme?: string;
}

export default function ThemeCursorStyles({ theme = 'dark-academia' }: ThemeCursorStylesProps) {
  useEffect(() => {
    const getThemeColors = (theme: string) => {
      const themeColors = {
        'dark-academia': { primary: '#FFD700', secondary: '#FFA500' },
        'cyberpunk': { primary: '#00FFFF', secondary: '#FF00FF' },
        'melancholy': { primary: '#FF69B4', secondary: '#FF1493' },
        'fantasy-mystical': { primary: '#9370DB', secondary: '#8A2BE2' },
        'steampunk': { primary: '#CD853F', secondary: '#8B4513' },
        'default': { primary: '#FFD700', secondary: '#FFA500' }
      };
      return themeColors[theme as keyof typeof themeColors] || themeColors.default;
    };

    const colors = getThemeColors(theme);
    
    // Create dynamic CSS for theme-based cursors
    const cursorCSS = `
      /* Theme-based cursor styles */
      body {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" fill="${encodeURIComponent(colors.primary)}" stroke="${encodeURIComponent(colors.secondary)}" stroke-width="1" stroke-linejoin="round"/><path d="M13 13l6 6" stroke="${encodeURIComponent(colors.primary)}" stroke-width="2" stroke-linecap="round"/></svg>') 12 12, auto;
      }
      
      button:hover {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><defs><filter id="glow"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" fill="${encodeURIComponent(colors.primary)}" stroke="${encodeURIComponent(colors.secondary)}" stroke-width="1" stroke-linejoin="round" filter="url(%23glow)"/><path d="M13 13l6 6" stroke="${encodeURIComponent(colors.primary)}" stroke-width="2" stroke-linecap="round" filter="url(%23glow)"/></svg>') 12 12, pointer;
      }
      
      input, textarea {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="${encodeURIComponent(colors.primary)}" stroke="${encodeURIComponent(colors.secondary)}" stroke-width="1"/></svg>') 12 12, text;
      }
      
      button:disabled, input:disabled, textarea:disabled {
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" fill="%23666" stroke="%23444" stroke-width="1" stroke-linejoin="round"/><path d="M13 13l6 6" stroke="%23666" stroke-width="2" stroke-linecap="round"/></svg>') 12 12, not-allowed;
      }
    `;

    // Remove existing theme cursor styles
    const existingStyle = document.getElementById('theme-cursor-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Add new theme cursor styles
    const style = document.createElement('style');
    style.id = 'theme-cursor-styles';
    style.textContent = cursorCSS;
    document.head.appendChild(style);

    return () => {
      const styleToRemove = document.getElementById('theme-cursor-styles');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [theme]);

  return null;
}
