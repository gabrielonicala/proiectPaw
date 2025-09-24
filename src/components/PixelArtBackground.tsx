'use client';

import { Theme } from '@/types';
import { useState } from 'react';

interface PixelArtBackgroundProps {
  theme: Theme;
}

export default function PixelArtBackground({ theme }: PixelArtBackgroundProps) {
  const [imageError, setImageError] = useState(false);

  const getBackgroundImage = () => {
    switch (theme) {
      case 'neon-ashes':
        return '/backgrounds/cyberpunk-cityscape.png';
      
      case 'echoes-of-dawn':
        return '/backgrounds/melancholy-sunset.png';
      
      case 'obsidian-veil':
        return '/backgrounds/dark-academia-classroom.png';
      
      case 'blazeheart-saga':
        return '/backgrounds/shonen-epic-scene.png';
      
      case 'wild-west':
        return '/backgrounds/steampunk-castle.png';
      
      case 'ivory-quill':
        return '/backgrounds/fantasy-mystical-landscape.png';
      
      default:
        return '/backgrounds/default-landscape.png';
    }
  };

  const getFallbackBackground = () => {
    switch (theme) {
      case 'neon-ashes':
        return 'linear-gradient(135deg, #001122 0%, #002244 50%, #003366 100%)';
      case 'echoes-of-dawn':
        return 'linear-gradient(180deg, #662288 0%, #8844AA 50%, #FF4488 100%)';
      case 'obsidian-veil':
        return 'linear-gradient(180deg, #221111 0%, #442222 100%)';
      case 'blazeheart-saga':
        return 'linear-gradient(180deg, #002244 0%, #004488 50%, #FF6600 100%)';
      case 'wild-west':
        return 'linear-gradient(135deg, #664422 0%, #886644 100%)';
      case 'ivory-quill':
        return 'linear-gradient(180deg, #442288 0%, #6644AA 100%)';
      default:
        return 'linear-gradient(135deg, #222244 0%, #444466 100%)';
    }
  };

  if (imageError) {
    return (
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: getFallbackBackground()
        }}
      />
    );
  }

  return (
    <div 
      className="fixed inset-0 -z-10"
      style={{
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        // imageRendering: '-moz-crisp-edges',
        // imageRendering: 'crisp-edges'
      }}
    >
      <img
        src={getBackgroundImage()}
        alt={`${theme} background`}
        className="hidden"
        onError={() => setImageError(true)}
      />
    </div>
  );
}