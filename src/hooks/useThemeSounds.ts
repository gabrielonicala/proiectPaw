'use client';

import { useEffect, useRef } from 'react';
import { Theme } from '@/types';

interface SoundConfig {
  backgroundMusic?: string;
  ambientSounds?: string[];
  uiSounds?: {
    click?: string;
    hover?: string;
    success?: string;
    error?: string;
  };
}

const themeSounds: Record<Theme, SoundConfig> = {
  'velour-nights': {
    backgroundMusic: '/sounds/lo-fi-beats.mp3',
    ambientSounds: ['/sounds/soft-jazz.mp3', '/sounds/chillhop.mp3'],
    uiSounds: {
      click: '/sounds/vinyl-scratch.mp3',
      hover: '/sounds/cozy-chime.mp3',
      success: '/sounds/warm-bell.mp3',
    }
  },
  'neon-ashes': {
    backgroundMusic: '/sounds/dark-synthwave.mp3',
    ambientSounds: ['/sounds/glitch-pulses.mp3', '/sounds/cyber-ambient.mp3'],
    uiSounds: {
      click: '/sounds/neon-click.mp3',
      hover: '/sounds/glitch.mp3',
      success: '/sounds/data-stream.mp3',
    }
  },
  'crimson-casefiles': {
    backgroundMusic: '/sounds/saxophone-noir.mp3',
    ambientSounds: ['/sounds/suspenseful-piano.mp3', '/sounds/city-ambient.mp3'],
    uiSounds: {
      click: '/sounds/typewriter.mp3',
      hover: '/sounds/paper-rustle.mp3',
      success: '/sounds/case-solved.mp3',
    }
  },
  'blazeheart-saga': {
    backgroundMusic: '/sounds/upbeat-rock.mp3',
    ambientSounds: ['/sounds/orchestral-shonen.mp3', '/sounds/battle-music.mp3'],
    uiSounds: {
      click: '/sounds/power-up.mp3',
      hover: '/sounds/energy-charge.mp3',
      success: '/sounds/victory-fanfare.mp3',
    }
  },
  'echoes-of-dawn': {
    backgroundMusic: '/sounds/soft-piano.mp3',
    ambientSounds: ['/sounds/ambient-strings.mp3', '/sounds/retro-synth.mp3'],
    uiSounds: {
      click: '/sounds/gentle-chime.mp3',
      hover: '/sounds/nostalgic-bell.mp3',
      success: '/sounds/memory-chime.mp3',
    }
  },
  'obsidian-veil': {
    backgroundMusic: '/sounds/gothic-choir.mp3',
    ambientSounds: ['/sounds/dark-ambient.mp3', '/sounds/mystical-chimes.mp3'],
    uiSounds: {
      click: '/sounds/dark-chime.mp3',
      hover: '/sounds/mystical-whisper.mp3',
      success: '/sounds/ancient-bell.mp3',
    }
  },
  'starlit-horizon': {
    backgroundMusic: '/sounds/space-ambient.mp3',
    ambientSounds: ['/sounds/sci-fi-synth.mp3', '/sounds/cosmic-echoes.mp3'],
    uiSounds: {
      click: '/sounds/star-chime.mp3',
      hover: '/sounds/cosmic-pulse.mp3',
      success: '/sounds/galaxy-chime.mp3',
    }
  },
  'ivory-quill': {
    backgroundMusic: '/sounds/medieval-music.mp3',
    ambientSounds: ['/sounds/magical-chimes.mp3', '/sounds/castle-ambient.mp3'],
    uiSounds: {
      click: '/sounds/quill-scratch.mp3',
      hover: '/sounds/parchment-rustle.mp3',
      success: '/sounds/magical-chime.mp3',
    }
  },
  'wild-west': {
    backgroundMusic: '/sounds/wild-west-theme.mp3',
    ambientSounds: ['/sounds/acoustic-guitar.mp3', '/sounds/harmonica-melody.mp3', '/sounds/horse-hooves.mp3'],
    uiSounds: {
      click: '/sounds/saloon-piano.mp3',
      hover: '/sounds/spur-jingle.mp3',
      success: '/sounds/gun-cock.mp3',
    }
  },
  'crimson-tides': {
    backgroundMusic: '/sounds/pirate-theme.mp3',
    ambientSounds: ['/sounds/sea-shanty.mp3', '/sounds/ocean-waves.mp3', '/sounds/ship-creaking.mp3'],
    uiSounds: {
      click: '/sounds/compass-click.mp3',
      hover: '/sounds/sail-billow.mp3',
      success: '/sounds/treasure-chime.mp3',
    }
  }
};

export function useThemeSounds(theme: Theme, enabled: boolean = true) {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    if (!enabled) return;

    const soundConfig = themeSounds[theme];
    
    // Preload sounds
    const preloadSound = (src: string, key: string) => {
      if (!audioRefs.current[key]) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = 0.3; // Default volume
        audioRefs.current[key] = audio;
      }
    };

    // Preload background music
    if (soundConfig.backgroundMusic) {
      preloadSound(soundConfig.backgroundMusic, 'background');
    }

    // Preload ambient sounds
    soundConfig.ambientSounds?.forEach((sound, index) => {
      preloadSound(sound, `ambient-${index}`);
    });

    // Preload UI sounds
    Object.entries(soundConfig.uiSounds || {}).forEach(([key, sound]) => {
      if (sound) {
        preloadSound(sound, key);
      }
    });

    return () => {
      // Cleanup audio elements
      const currentAudioRefs = audioRefs.current;
      Object.values(currentAudioRefs).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [theme, enabled]);

  const playSound = (soundKey: string, volume: number = 0.3) => {
    if (!enabled) return;
    
    const audio = audioRefs.current[soundKey];
    if (audio) {
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(console.error);
    }
  };

  const playBackgroundMusic = (loop: boolean = true) => {
    if (!enabled) return;
    
    const audio = audioRefs.current['background'];
    if (audio) {
      audio.loop = loop;
      audio.volume = 0.2;
      audio.play().catch(console.error);
    }
  };

  const stopBackgroundMusic = () => {
    const audio = audioRefs.current['background'];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  const playAmbientSound = (index: number = 0) => {
    if (!enabled) return;
    
    const audio = audioRefs.current[`ambient-${index}`];
    if (audio) {
      audio.volume = 0.1;
      audio.play().catch(console.error);
    }
  };

  return {
    playSound,
    playBackgroundMusic,
    stopBackgroundMusic,
    playAmbientSound,
    // Convenience methods for common UI sounds
    playClick: () => playSound('click', 0.2),
    playHover: () => playSound('hover', 0.1),
    playSuccess: () => playSound('success', 0.4),
    playError: () => playSound('error', 0.3),
  };
}
