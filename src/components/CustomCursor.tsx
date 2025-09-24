'use client';

import { useEffect, useState } from 'react';

interface CustomCursorProps {
  isGenerating?: boolean;
  isModalOpen?: boolean;
  theme?: string;
}

export default function CustomCursor({ isGenerating = false, theme = 'dark-academia' }: CustomCursorProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const [trails, setTrails] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Theme-based colors
  const getThemeColors = (theme: string) => {
    const themeColors = {
      'dark-academia': { primary: '#FFD700', secondary: '#FFA500', glow: 'rgba(255, 215, 0, 0.3)' },
      'cyberpunk': { primary: '#00FFFF', secondary: '#FF00FF', glow: 'rgba(0, 255, 255, 0.3)' },
      'melancholy': { primary: '#FF69B4', secondary: '#FF1493', glow: 'rgba(255, 105, 180, 0.3)' },
      'fantasy-mystical': { primary: '#9370DB', secondary: '#8A2BE2', glow: 'rgba(147, 112, 219, 0.3)' },
      'steampunk': { primary: '#CD853F', secondary: '#8B4513', glow: 'rgba(205, 133, 63, 0.3)' },
      'default': { primary: '#FFD700', secondary: '#FFA500', glow: 'rgba(255, 215, 0, 0.3)' }
    };
    return themeColors[theme as keyof typeof themeColors] || themeColors.default;
  };

  const colors = getThemeColors(theme);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateMousePosition(e);
      
      // Create sparkle trail on click
      if (e.buttons === 1) { // Left mouse button pressed
        const newTrail = {
          id: Date.now() + Math.random(),
          x: e.clientX,
          y: e.clientY
        };
        setTrails(prev => [...prev.slice(-5), newTrail]); // Keep only last 5 trails
        
        // Remove trail after animation
        setTimeout(() => {
          setTrails(prev => prev.filter(trail => trail.id !== newTrail.id));
        }, 600);
      }
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Main cursor glow */}
      <div
        className="cursor-glow"
        style={{
          left: mousePosition.x - 20,
          top: mousePosition.y - 20,
          opacity: isGenerating ? 0.8 : 0.6,
          transform: isGenerating ? 'scale(1.2)' : 'scale(1)',
          background: isGenerating 
            ? `radial-gradient(circle, ${colors.glow.replace('0.3', '0.5')} 0%, transparent 70%)`
            : `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`
        }}
      />
      
      {/* Sparkle trails */}
      {trails.map((trail) => (
        <div
          key={trail.id}
          className="cursor-trail"
          style={{
            left: trail.x - 10,
            top: trail.y - 10,
          }}
        />
      ))}
      
      {/* Loading cursor overlay */}
      {isGenerating && (
        <div
          className="fixed pointer-events-none z-[10001]"
          style={{
            left: mousePosition.x - 12,
            top: mousePosition.y - 12,
          }}
        >
          <div className="w-6 h-6 animate-spin">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <circle 
                cx="12" 
                cy="12" 
                r="10" 
                fill="none" 
                stroke={colors.primary} 
                strokeWidth="2" 
                strokeDasharray="31.416" 
                strokeDashoffset="31.416"
                className="animate-pulse"
              />
              <circle cx="12" cy="12" r="3" fill={colors.secondary} className="animate-pulse" />
            </svg>
          </div>
        </div>
      )}
    </>
  );
}
