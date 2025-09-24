'use client';

import { motion } from 'framer-motion';
import { Avatar } from '@/types';

interface LayeredAvatarRendererProps {
  layeredAvatar: NonNullable<NonNullable<Avatar['options']>['layeredAvatar']>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LayeredAvatarRenderer({ 
  layeredAvatar, 
  size = 'md',
  className = '' 
}: LayeredAvatarRendererProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-32 h-40'
  };

  const imageSize = {
    sm: 48,
    md: 64,
    lg: 160
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Layered Avatar Container */}
      <motion.div 
        className="absolute inset-0 flex flex-col justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Head Layer (top) */}
        <motion.div 
          className="flex-shrink-0"
          style={{ height: imageSize[size] * 0.35 }} // ~56px for lg size
        >
          <img
            src={layeredAvatar.head.imagePath}
            alt={layeredAvatar.head.name}
            className="w-full h-full object-contain pixelated"
            style={{ imageRendering: 'pixelated' }}
          />
        </motion.div>
        
        {/* Torso Layer (middle) */}
        <motion.div 
          className="flex-shrink-0"
          style={{ height: imageSize[size] * 0.35 }} // ~56px for lg size
        >
          <img
            src={layeredAvatar.torso.imagePath}
            alt={layeredAvatar.torso.name}
            className="w-full h-full object-contain pixelated"
            style={{ imageRendering: 'pixelated' }}
          />
        </motion.div>
        
        {/* Legs Layer (bottom) */}
        <motion.div 
          className="flex-shrink-0"
          style={{ height: imageSize[size] * 0.30 }} // ~48px for lg size
        >
          <img
            src={layeredAvatar.legs.imagePath}
            alt={layeredAvatar.legs.name}
            className="w-full h-full object-contain pixelated"
            style={{ imageRendering: 'pixelated' }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
