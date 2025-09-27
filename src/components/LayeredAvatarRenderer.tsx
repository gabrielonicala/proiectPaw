'use client';

import { motion } from 'framer-motion';
import { Avatar } from '@/types';
import { useState } from 'react';

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
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

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

  const handleImageError = (imageKey: string) => {
    setImageErrors(prev => ({ ...prev, [imageKey]: true }));
  };

  const getEmojiForPart = (part: 'head' | 'torso' | 'legs', gender: string) => {
    if (part === 'head') {
      return gender === 'female' ? '👩' : '👨';
    } else if (part === 'torso') {
      return '👕';
    } else {
      return '👖';
    }
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
          {imageErrors['head'] ? (
            <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-800 pixelated">
              {getEmojiForPart('head', layeredAvatar.head.gender)}
            </div>
          ) : (
            <img
              src={layeredAvatar.head.imagePath}
              alt={layeredAvatar.head.name}
              className="w-full h-full object-contain pixelated"
              style={{ imageRendering: 'pixelated' }}
              onError={() => handleImageError('head')}
            />
          )}
        </motion.div>
        
        {/* Torso Layer (middle) */}
        <motion.div 
          className="flex-shrink-0"
          style={{ height: imageSize[size] * 0.35 }} // ~56px for lg size
        >
          {imageErrors['torso'] ? (
            <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-800 pixelated">
              {getEmojiForPart('torso', layeredAvatar.torso.gender)}
            </div>
          ) : (
            <img
              src={layeredAvatar.torso.imagePath}
              alt={layeredAvatar.torso.name}
              className="w-full h-full object-contain pixelated"
              style={{ imageRendering: 'pixelated' }}
              onError={() => handleImageError('torso')}
            />
          )}
        </motion.div>
        
        {/* Legs Layer (bottom) */}
        <motion.div 
          className="flex-shrink-0"
          style={{ height: imageSize[size] * 0.30 }} // ~48px for lg size
        >
          {imageErrors['legs'] ? (
            <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-800 pixelated">
              {getEmojiForPart('legs', layeredAvatar.legs.gender)}
            </div>
          ) : (
            <img
              src={layeredAvatar.legs.imagePath}
              alt={layeredAvatar.legs.name}
              className="w-full h-full object-contain pixelated"
              style={{ imageRendering: 'pixelated' }}
              onError={() => handleImageError('legs')}
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
