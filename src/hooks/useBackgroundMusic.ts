'use client';

import { useState, useEffect } from 'react';

interface MusicSettings {
  isEnabled: boolean;
  volume: number;
  isMuted: boolean;
}

const defaultSettings: MusicSettings = {
  isEnabled: true,
  volume: 0.3,
  isMuted: false
};

export function useBackgroundMusic() {
  const [settings, setSettings] = useState<MusicSettings>(defaultSettings);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('quillia-music-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to load music settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('quillia-music-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<MusicSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleMusic = () => {
    setIsPlaying(prev => !prev);
  };

  const setVolume = (volume: number) => {
    updateSettings({ volume: Math.max(0, Math.min(1, volume)) });
  };

  const toggleMute = () => {
    updateSettings({ isMuted: !settings.isMuted });
  };

  const enableMusic = () => {
    updateSettings({ isEnabled: true });
  };

  const disableMusic = () => {
    updateSettings({ isEnabled: false });
    setIsPlaying(false);
  };

  return {
    settings,
    isPlaying,
    toggleMusic,
    setVolume,
    toggleMute,
    enableMusic,
    disableMusic,
    updateSettings
  };
}
