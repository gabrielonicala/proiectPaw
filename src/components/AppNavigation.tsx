'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Button from './ui/Button';
import { Character, Theme } from '@/types';

interface AppNavigationProps {
  activeCharacter?: Character;
  currentPage: 'journal' | 'profile' | 'calendar' | 'tribute' | 'character-select';
  onCharacterSwitch?: () => void;
  onCalendarView?: () => void;
  onProfileView?: () => void;
  onTributeView?: () => void;
  onBack?: () => void;
  showLogout?: boolean;
  theme?: Theme;
}

export default function AppNavigation({
  activeCharacter,
  currentPage,
  onCharacterSwitch,
  onCalendarView,
  onProfileView,
  onTributeView,
  onBack,
  showLogout = false,
  theme = 'obsidian-veil'
}: AppNavigationProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: '/auth/signin' });
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'journal':
        return 'JOURNAL ENTRY';
      case 'profile':
        return 'CHARACTER PROFILE';
      case 'calendar':
        return 'ADVENTURE CALENDAR';
      case 'tribute':
        return 'PLEDGE ALLEGIANCE';
      case 'character-select':
        return 'SELECT CHARACTER';
      default:
        return '';
    }
  };

  const getPageSubtitle = () => {
    switch (currentPage) {
      case 'journal':
        return `Tell us about your day, ${activeCharacter?.name || 'Adventurer'}`;
      case 'profile':
        return `${activeCharacter?.name || 'Adventurer'}'s Journey`;
      case 'calendar':
        return `${activeCharacter?.name || 'Adventurer'}'s adventure through time`;
      case 'tribute':
        return 'Support Your Journey';
      case 'character-select':
        return 'Choose which character to play as';
      default:
        return '';
    }
  };

  return (
    <>
      <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex ${currentPage === 'journal' ? 'lg:grid lg:grid-cols-3' : ''} justify-between ${currentPage === 'journal' ? 'lg:justify-stretch' : ''} items-center mb-6`}
    >
      {/* Left Side */}
      <div className="flex items-center gap-4">
        {currentPage === 'journal' ? (
          <>
            <Button onClick={onCharacterSwitch} variant="secondary" className="hidden md:flex" theme={theme}>
              SWITCH CHARACTER
            </Button>
            <Button onClick={onCharacterSwitch} variant="secondary" className="md:hidden" theme={theme}>
              🔄
            </Button>
          </>
        ) : (
          <div>
            <h1 className="font-pixel text-2xl md:text-3xl text-white mb-1">
              {getPageTitle()}
            </h1>
            <p className="font-pixel text-sm md:text-lg text-yellow-300">
              {getPageSubtitle()}
            </p>
          </div>
        )}
      </div>

      {/* Center - Only for Journal Entry */}
      {currentPage === 'journal' && activeCharacter && (
        <div className="text-center hidden lg:block">
          <p className="font-pixel text-lg text-white">
            <span className="text-yellow-300">Playing as </span>
            {activeCharacter.name}
          </p>
        </div>
      )}

      {/* Right Side */}
      <div className="flex gap-2 justify-end">
        {currentPage === 'journal' ? (
          // Journal Entry: Navigation with responsive text/icons
          <>
            <Button onClick={onCalendarView} variant="secondary" className="hidden md:flex" theme={theme}>
              Calendar
            </Button>
            <Button onClick={onCalendarView} variant="secondary" className="md:hidden" theme={theme}>
              📅
            </Button>
            <Button onClick={onProfileView} variant="secondary" className="hidden md:flex" theme={theme}>
              Profile
            </Button>
            <Button onClick={onProfileView} variant="secondary" className="md:hidden" theme={theme}>
              👤
            </Button>
            {/* <Button onClick={onTributeView} variant="secondary" className="hidden md:flex" theme={theme}>
              Tribute
            </Button>
            <Button onClick={onTributeView} variant="secondary" className="md:hidden" theme={theme}>
              💎
            </Button> */}
          </>
        ) : (
          // Other pages: Back button and optional logout
          <>
            {/* Logout button commented out - now using global logout button */}
            {/* {showLogout && (
              <>
                <Button 
                  onClick={handleLogout}
                  variant="secondary"
                  className="hidden md:flex"
                  theme={theme}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? 'LOGGING OUT...' : 'LOGOUT'}
                </Button>
                <Button 
                  onClick={handleLogout}
                  variant="secondary"
                  className="md:hidden"
                  theme={theme}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? '⏳' : '🚪'}
                </Button>
              </>
            )} */}
            {onBack && (
              <>
                <Button onClick={onBack} variant="secondary" className="hidden md:flex" theme={theme}>
                  BACK
                </Button>
                <Button onClick={onBack} variant="secondary" className="md:hidden" theme={theme}>
                  ←
                </Button>
              </>
            )}
          </>
        )}
      </div>
      </motion.div>

      {/* Logout Loading Overlay */}
      {isLoggingOut && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-[10000]"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-yellow-400 border-t-transparent pixelated mb-4"
          />
          <p className="font-pixel text-yellow-300 text-lg">
            Logging out...
          </p>
        </motion.div>
      )}
    </>
  );
}
