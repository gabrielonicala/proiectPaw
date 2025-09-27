'use client';

import { useEffect } from 'react';
import { preloadAvatarPieces, preloadBackgroundMusic } from '@/lib/asset-cache';
import { allPieces } from '@/lib/layered-avatars';

interface AssetPreloaderProps {
  children: React.ReactNode;
}

export default function AssetPreloader({ children }: AssetPreloaderProps) {
  useEffect(() => {
    const preloadAssets = async () => {
      try {
        // Only preload a subset of essential avatar pieces to avoid quota issues
        console.log('Preloading essential avatar pieces...');
        const essentialPieces = allPieces.slice(0, 20); // Only first 20 pieces
        await preloadAvatarPieces(essentialPieces);
        console.log('Essential avatar pieces preloaded successfully');

        // Only preload 2-3 most common music files
        const essentialMusicFiles = [
          '/music/velour-nights.mp3',
          '/music/neon-ashes.mp3',
          '/music/crimson-casefiles.mp3'
        ];

        console.log('Preloading essential background music...');
        await preloadBackgroundMusic(essentialMusicFiles);
        console.log('Essential background music preloaded successfully');
      } catch (error) {
        console.error('Error preloading assets:', error);
        // Don't fail completely - just log the error
      }
    };

    // Only preload if we're online and have enough storage space
    if (navigator.onLine) {
      // Check if we have enough localStorage space
      try {
        const testKey = 'quillia-storage-test';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        preloadAssets();
      } catch (quotaError) {
        console.warn('Not enough localStorage space for asset preloading, skipping...');
      }
    }
  }, []);

  return <>{children}</>;
}
