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
        // Preload all avatar pieces progressively
        console.log('Preloading avatar pieces...');
        await preloadAvatarPieces(allPieces);
        console.log('Avatar pieces preloaded successfully');

        // Preload all background music files
        const musicFiles = [
          '/music/velour-nights.mp3',
          '/music/neon-ashes.mp3',
          '/music/crimson-casefiles.mp3',
          '/music/crimson-tides.mp3',
          '/music/echoes-of-dawn.mp3',
          '/music/ivory-quill.mp3',
          '/music/obsidian-veil.mp3',
          '/music/starlit-horizon.mp3',
          '/music/wild-west.mp3',
          '/music/blazeheart-saga.mp3'
        ];

        console.log('Preloading background music...');
        await preloadBackgroundMusic(musicFiles);
        console.log('Background music preloaded successfully');
      } catch (error) {
        console.error('Error preloading assets:', error);
        // Don't fail completely - just log the error
      }
    };

    // Only preload if we're online
    if (navigator.onLine) {
      preloadAssets();
    }
  }, []);

  return <>{children}</>;
}
