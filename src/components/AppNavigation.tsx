'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Calendar, User, RefreshCw, Gift } from 'lucide-react';
import Button from './ui/Button';
import { Character, Theme } from '@/types';
import CreditBalance from './CreditBalance';

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
  userEmail?: string;
  credits?: number;
  isLowOnCredits?: boolean;
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
  theme = 'obsidian-veil',
  userEmail,
  credits = 0,
  isLowOnCredits = false
}: AppNavigationProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: '/home' });
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
        return ''; // Title moved to TributePage component
      case 'character-select':
        return 'SELECT A CHARACTER';
      default:
        return '';
    }
  };

  const getPageSubtitle = () => {
    switch (currentPage) {
      case 'journal':
        return `Tell us about your day, ${activeCharacter?.name || 'Adventurer'}`;
      case 'profile':
        return `${activeCharacter?.name || 'Adventurer'}'s adventure log`;
      case 'calendar':
        return `${activeCharacter?.name || 'Adventurer'}'s journey through time`;
      case 'tribute':
        return ''; // Subtitle moved to TributePage component
      case 'character-select':
        return 'Which path will you take?';
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
      className="flex justify-between items-center mt-2 mb-6"
    >
      {/* Left Side */}
      <div className="flex items-center gap-4">
        {currentPage === 'journal' ? (
          <>
            {/* Credit Balance - Moved to left */}
            <CreditBalance 
              credits={credits} 
              isLow={isLowOnCredits}
              onClick={onTributeView}
            />
          </>
        ) : currentPage === 'tribute' ? (
          <div className="flex items-center gap-2">
            {credits !== undefined && (
              <CreditBalance
                credits={credits}
                isLow={isLowOnCredits}
                onClick={onTributeView}
              />
            )}
          </div>
        ) : (
          <div>
            <h1 className="font-pixel text-lg md:text-xl text-white mb-1">
              {getPageTitle()}
            </h1>
            <p className="font-pixel text-xs md:text-sm text-yellow-300">
              {getPageSubtitle()}
            </p>
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className="flex gap-6 md:gap-10 justify-end items-center">
        {currentPage === 'journal' ? (
          // Journal Entry: All navigation buttons on the right
          <>
            {/* Calendar - Desktop text, Mobile icon */}
            <button 
              onClick={onCalendarView} 
              className="font-pixel text-white bg-transparent border-none cursor-pointer navbar-button hidden md:flex"
            >
              CALENDAR
            </button>
            <button 
              onClick={onCalendarView} 
              className="font-pixel text-white bg-transparent border-none cursor-pointer navbar-button navbar-button-icon md:hidden"
            >
              <Calendar className="w-5 h-5" />
            </button>
            
            {/* Profile - Desktop text, Mobile icon */}
            <button 
              onClick={onProfileView} 
              className="font-pixel text-white bg-transparent border-none cursor-pointer navbar-button hidden md:flex"
            >
              PROFILE
            </button>
            <button 
              onClick={onProfileView} 
              className="font-pixel text-white bg-transparent border-none cursor-pointer navbar-button navbar-button-icon md:hidden"
            >
              <User className="w-5 h-5" />
            </button>
            
            {/* Switch Character - Desktop text, Mobile icon */}
            <button 
              onClick={onCharacterSwitch} 
              className="font-pixel text-white bg-transparent border-none cursor-pointer navbar-button hidden md:flex"
            >
              SWITCH CHARACTER
            </button>
            <button 
              onClick={onCharacterSwitch} 
              className="font-pixel text-white bg-transparent border-none cursor-pointer navbar-button navbar-button-icon md:hidden"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
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
                <button 
                  onClick={onBack} 
                  className="font-pixel text-white bg-transparent border-none cursor-pointer navbar-button hidden md:inline-block"
                >
                  BACK
                </button>
                <button 
                  onClick={onBack} 
                  className="font-pixel text-white bg-transparent border-none cursor-pointer navbar-button navbar-button-arrow inline-block md:hidden"
                >
                  ←
                </button>
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
