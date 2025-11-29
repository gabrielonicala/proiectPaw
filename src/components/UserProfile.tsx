'use client';

import { motion } from 'framer-motion';
import { useState, useMemo, useRef, useEffect } from 'react';
import { HiInformationCircle } from "react-icons/hi";
import { RefreshCw, Pencil, MoreVertical, Check } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import MovingGradientBackground from './MovingGradientBackground';
import AppNavigation from './AppNavigation';
import { User, Character, Avatar, Theme } from '@/types';
import { themes } from '@/themes';
import { migrateTheme } from '@/lib/theme-migration';
import { saveUser, saveUserPreferences } from '@/lib/client-utils';
import LayeredAvatarBuilder from './LayeredAvatarBuilder';
import { LayeredAvatar } from '@/lib/layered-avatars';
import { CharacterStats } from '@/lib/character-stats';
import { getCachedImageUrl } from '@/lib/asset-cache';
import { hasPremiumAccess } from '@/lib/paddle';
// import Footer from './Footer';

interface UserProfileProps {
  user: User;
  activeCharacter: Character;
  onBack: () => void;
  onAvatarChange: (avatar: Avatar) => void;
  onUsernameChange?: (username: string) => void;
  onCharacterSwitch?: (characterId: string) => void;
  onNavigateToCharacterSelect?: () => void;
}


export default function UserProfile({ user, activeCharacter, onBack, onAvatarChange, onUsernameChange, onCharacterSwitch, onNavigateToCharacterSelect }: UserProfileProps) {
  const [, setSelectedAvatar] = useState<Avatar>(activeCharacter.avatar || {
    id: 'default',
    name: 'Adventurer',
    image: '🧙‍♂️',
    color: '#6B73FF',
    accessories: ['staff', 'crystal', 'spellbook'],
    description: 'A brave adventurer',
    race: 'Human',
    class: 'Adventurer',
    stats: {
      strength: 10,
      intelligence: 10,
      dexterity: 10,
      wisdom: 10,
      charisma: 10
    }
  });
  const [isChangingUsername, setIsChangingUsername] = useState(false);
  const [statsHeight, setStatsHeight] = useState<number>(0);
  
  const statsRef = useRef<HTMLDivElement>(null);
  const usernameEditRef = useRef<HTMLDivElement>(null);
  const usernameInputContainerRef = useRef<HTMLDivElement>(null);
  const usernameCheckButtonRef = useRef<HTMLDivElement>(null);
  const [newUsername, setNewUsername] = useState(user.username || '');
  const [usernameError, setUsernameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Update local state when user prop changes (e.g., after username change)
  useEffect(() => {
    setNewUsername(user.username || '');
  }, [user.username]);

  // Handle clicks outside the username edit input to cancel editing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isChangingUsername && usernameEditRef.current && !usernameEditRef.current.contains(event.target as Node)) {
        setNewUsername(user.username || '');
        setUsernameError('');
        setIsChangingUsername(false);
      }
    };

    if (isChangingUsername) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChangingUsername, user.username]);

  const [showLayeredAvatarBuilder, setShowLayeredAvatarBuilder] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState(activeCharacter.id);
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);
  const [showStarTooltip, setShowStarTooltip] = useState(false);
  const [characterStats, setCharacterStats] = useState<CharacterStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // HYBRID APPROACH: Fetch stats from API instead of calculating client-side
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const response = await fetch(`/api/characters/${activeCharacter.id}/stats`);
        if (response.ok) {
          const data = await response.json();
          setCharacterStats(data.stats);
        } else {
          console.error('Failed to fetch character stats');
          // Fallback to empty stats
          setCharacterStats(null);
        }
      } catch (error) {
        console.error('Error fetching character stats:', error);
        setCharacterStats(null);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [activeCharacter.id]);

  // HYBRID APPROACH: Memoize parsed stats to ensure they update when activeCharacter changes
  // This fixes the issue where stats show default values after character switch
  const parsedStats = useMemo(() => {
    if (!activeCharacter?.stats) return null;
    // Stats should already be parsed from JSON on the server, but ensure it's an object
    if (typeof activeCharacter.stats === 'string') {
      try {
        return JSON.parse(activeCharacter.stats);
      } catch {
        return null;
      }
    }
    return activeCharacter.stats;
  }, [activeCharacter?.id, activeCharacter?.stats]); // Use both id and stats to detect changes

  useEffect(() => {
    // Measure stats height and update achievements column height
    const measureStatsHeight = () => {
      if (statsRef.current) {
        const height = statsRef.current.offsetHeight;
        console.log('Stats height measured:', height);
        setStatsHeight(height);
      }
    };

    // Measure on mount and when content changes
    measureStatsHeight();
    
    // Re-measure when character changes
    const timeoutId = setTimeout(measureStatsHeight, 100);
    
    return () => clearTimeout(timeoutId);
  }, [activeCharacter, characterStats]);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenTooltip(null);
    };

    if (openTooltip) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openTooltip]);
  
  // Get available characters for selection
  const availableCharacters = user.characters || [];

  const handleLayeredAvatarSelect = (layeredAvatar: LayeredAvatar) => {
    // Convert LayeredAvatar to Avatar format
    const avatar: Avatar = {
      id: layeredAvatar.id,
      name: layeredAvatar.name,
      image: '👤', // Fallback emoji
      pixelArt: undefined, // We'll use the layered pieces instead
      color: '#FF6B35', // Default color
      accessories: [],
      description: `Custom ${layeredAvatar.head.name} ${layeredAvatar.torso.name} ${layeredAvatar.legs.name}`,
      race: 'Custom',
      class: 'Adventurer',
      stats: {
        strength: 10,
        intelligence: 10,
        dexterity: 10,
        wisdom: 10,
        charisma: 10
      },
      options: {
        layeredAvatar: layeredAvatar // Store the layered avatar data
      }
    };
    
    setSelectedAvatar(avatar);
    const updatedUser = { ...user, avatar };
    saveUserPreferences(updatedUser); // Save to database
    onAvatarChange(avatar);
    setShowLayeredAvatarBuilder(false);
  };

  // Themes are now tied to characters and cannot be changed directly

  const handleUsernameChange = async () => {
    if (!newUsername.trim()) {
      setUsernameError('Username cannot be empty');
      return;
    }

    if (newUsername === user.username) {
      setIsChangingUsername(false);
      return;
    }

    setIsLoading(true);
    setUsernameError('');

    try {
      const response = await fetch('/api/auth/change-username', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: newUsername }),
      });

      const data = await response.json();

      if (!response.ok) {
        setUsernameError(data.error || 'Failed to change username');
        return;
      }

      // Update the user object with new username
      const updatedUser = { ...user, username: newUsername };
      saveUser(updatedUser);
      
      // Update the parent component
      if (onUsernameChange) {
        onUsernameChange(newUsername);
      }
      
      setIsChangingUsername(false);
    } catch {
      setUsernameError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelUsernameChange = () => {
    setNewUsername(user.username || '');
    setUsernameError('');
    setIsChangingUsername(false);
  };

  const handleCharacterSelect = (characterId: string) => {
    setSelectedCharacterId(characterId);
    if (onCharacterSwitch) {
      onCharacterSwitch(characterId);
    }
  };

  // Get theme colors for background
  const migratedTheme = migrateTheme(activeCharacter.theme) as Theme;
  const themeConfig = themes[migratedTheme];
  const colors = themeConfig?.colors;

  // Memoize particle positions and animation values to prevent reset on re-render
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
  }, []); // Empty dependency array - only generate once

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: colors ? `linear-gradient(to bottom, ${colors.background}, ${colors.primary}, ${colors.secondary})` : 'linear-gradient(to bottom, #581c87, #1e3a8a, #312e81)'
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 opacity-20 pixelated"
          style={{ backgroundColor: colors?.accent || '#fbbf24' }}
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-24 h-24 opacity-20 pixelated"
          style={{ backgroundColor: colors?.primary || '#ec4899' }}
          animate={{
            rotate: -360,
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-16 h-16 opacity-20 pixelated"
          style={{ backgroundColor: colors?.secondary || '#10b981' }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 opacity-30 pixelated"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              backgroundColor: colors?.text || '#ffffff'
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      <div className="flex-1 p-1">
      {/* <MovingGradientBackground theme={activeCharacter.theme} /> */}
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <AppNavigation
          activeCharacter={activeCharacter}
          currentPage="profile"
          onBack={onBack}
          showLogout={true}
          theme={activeCharacter.theme}
        />

        {/* Loading Overlay */}
        {statsLoading && (
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
              Loading profile...
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Column 1: Character Header */}
          <div className="lg:col-span-1 flex flex-col h-full">

        {/* Character Selector */}
        {/* {availableCharacters.length > 1 && (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <Card theme={activeCharacter.theme} effect="glow" className="p-4">
              <h3 className="font-pixel text-lg text-white mb-3">Select Character</h3>
              <div className="flex flex-wrap gap-2">
                {availableCharacters.map((character) => (
            <Button 
                    key={character.id}
                    onClick={() => handleCharacterSelect(character.id)}
                    variant={selectedCharacterId === character.id ? "primary" : "secondary"}
                    className="px-4 py-2"
                    theme={activeCharacter.theme}
                  >
                    {character.name}
            </Button>
                ))}
          </div>
            </Card>
        </motion.div>
        )} */}

        {/* Character Header */}
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-2"
        >
          <Card theme={activeCharacter.theme} effect="glow" className="p-2 flex flex-col relative">
            {/* Three dots menu button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors navbar-button-icon bg-transparent border-none z-10"
              title="More options"
              style={{
                background: 'transparent',
                border: 'none'
              }}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown menu */}
            {showDropdown && (
              <>
                {/* Backdrop to close dropdown when clicking outside */}
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowDropdown(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute top-10 right-2 z-30 bg-gray-800 border-2 border-gray-600 pixelated rounded shadow-lg min-w-[180px]"
                >
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setShowDeleteAccountConfirm(true);
                    }}
                    className="w-full text-left px-4 py-3 font-pixel text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                  >
                    Delete Account
                  </button>
                </motion.div>
              </>
            )}

            <div className="flex flex-col items-center gap-0 flex-1">
              {/* Character Avatar */}
                <motion.div
                className="flex-shrink-0 mt-4 -mb-4"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                {activeCharacter.avatar?.options?.layeredAvatar ? (
                  <div className="relative w-40 h-40 flex flex-col">
                    <div className="flex-shrink-0 h-14">
                      <img
                        src={getCachedImageUrl(activeCharacter.avatar?.options?.layeredAvatar?.head.imagePath || '')}
                        alt={activeCharacter.avatar?.options?.layeredAvatar?.head.name}
                          className="w-full h-full object-contain pixelated"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                    <div className="flex-shrink-0 h-12">
                        <img
                        src={getCachedImageUrl(activeCharacter.avatar?.options?.layeredAvatar.torso.imagePath || '')}
                        alt={activeCharacter.avatar?.options?.layeredAvatar.torso.name}
                          className="w-full h-full object-contain pixelated"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                    <div className="flex-shrink-0 h-10">
                        <img
                        src={getCachedImageUrl(activeCharacter.avatar?.options?.layeredAvatar.legs.imagePath || '')}
                        alt={activeCharacter.avatar?.options?.layeredAvatar.legs.name}
                          className="w-full h-full object-contain pixelated"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                    </div>
                ) : activeCharacter.avatar?.options?.imagePath ? (
                  <img 
                    src={getCachedImageUrl(activeCharacter.avatar?.options?.imagePath || '')} 
                    alt={activeCharacter.avatar?.name}
                    className="w-40 h-40 pixelated"
                      style={{ imageRendering: 'pixelated' }}
                    />
                ) : activeCharacter.avatar?.pixelArt ? (
                  <img 
                    src={getCachedImageUrl(activeCharacter.avatar?.pixelArt || '')} 
                    alt={activeCharacter.avatar?.name}
                    className="w-40 h-40 pixelated"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : (
                  <div className="text-5xl">{activeCharacter.avatar?.image}</div>
                  )}
                </motion.div>
                
              {/* Character Info */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h2 className="font-pixel text-2xl text-white">{activeCharacter.name}</h2>
                  <button
                    onClick={() => onNavigateToCharacterSelect && onNavigateToCharacterSelect()}
                    className="text-yellow-400 hover:text-yellow-300 transition-colors navbar-button-icon bg-transparent border-none"
                    title="Switch character"
                    style={{
                      background: 'transparent',
                      border: 'none'
                    }}
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Username Section */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  {isChangingUsername ? (
                    <div ref={usernameEditRef} className="flex items-center gap-2 relative">
                      {hasPremiumAccess(user) && user.username && (
                        <span className="text-base -mt-2 relative cursor-help flex-shrink-0">
                          🌟
                        </span>
                      )}
                      <div ref={usernameInputContainerRef} className="relative" style={{ width: '25ch' }}>
                      <Input
                        type="text"
                        value={newUsername}
                        onChange={setNewUsername}
                        placeholder="Enter new username"
                          className="text-sm font-pixel border-0 rounded-none bg-transparent px-0 py-1 w-full"
                        theme={activeCharacter.theme}
                          maxLength={20}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUsernameChange();
                            } else if (e.key === 'Escape') {
                              handleCancelUsernameChange();
                            }
                          }}
                          autoFocus
                        />
                      </div>
                      <div ref={usernameCheckButtonRef}>
                        <Button
                          onClick={handleUsernameChange}
                          disabled={isLoading}
                          variant="secondary"
                          size="sm"
                          className="text-xs px-1 py-1 opacity-60 hover:opacity-100 navbar-button-icon bg-transparent border-none flex-shrink-0"
                        theme={activeCharacter.theme}
                          style={{
                            background: 'transparent',
                            borderWidth: 0,
                            borderColor: 'transparent'
                          }}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-sm text-gray-300 flex items-center gap-1">
                        {hasPremiumAccess(user) && user.username && (
                          <span 
                            className="text-base -mt-2 relative cursor-help"
                            onMouseEnter={() => setShowStarTooltip(true)}
                            onMouseLeave={() => setShowStarTooltip(false)}
                          >
                            🌟
                            {showStarTooltip && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-3 py-2 bg-gray-900 text-white text-sm font-pixel rounded-lg shadow-lg z-10 whitespace-nowrap">
                                Unbound Adventurer
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            )}
                          </span>
                        )}
                        {user.username ? `@${user.username}` : 'No username set'}
                      </span>
                      <button
                        onClick={() => setIsChangingUsername(true)}
                        className="text-yellow-400 hover:text-yellow-300 transition-colors navbar-button-icon bg-transparent border-none"
                        title="Edit username"
                        style={{
                          background: 'transparent',
                          border: 'none'
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {usernameError && (
                    <p className="text-red-400 text-xs">{usernameError}</p>
                  )}
                </div>
                
                {/* Bio feature temporarily disabled */}
                {/* {activeCharacter.description && (
                  <p className="font-pixel text-sm text-gray-300">{activeCharacter.description}</p>
                )} */}
              </div>


              {/* Level Progress Bar */}
              {!themes[activeCharacter.theme]?.hidden ? (
                <div className="mt-4">
                  {(() => {
                    const totalExp = (activeCharacter as any).experience || 0;
                    
                    // Calculate level using scaling curve: 100 + 20×(level-1)
                    let currentLevel = 1;
                    let expForNextLevel = 100;
                    let totalExpNeeded = 0;
                    let expInCurrentLevel = totalExp;
                    
                    while (totalExpNeeded + expForNextLevel <= totalExp) {
                      totalExpNeeded += expForNextLevel;
                      currentLevel++;
                      expForNextLevel = 100 + 20 * (currentLevel - 1);
                    }
                    
                    expInCurrentLevel = totalExp - totalExpNeeded;
                    const expToNextLevel = expForNextLevel - expInCurrentLevel;
                    
                    return (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="font-pixel text-lg text-yellow-300">Level {currentLevel}</span>
                          <span className="font-pixel text-sm text-gray-300">
                            ({expInCurrentLevel}/{expForNextLevel} EXP)
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                          <div 
                            className="h-3 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(expInCurrentLevel / expForNextLevel) * 100}%`,
                              backgroundColor: themes[activeCharacter.theme]?.colors.accent || '#FFD700'
                            }}
                          />
                        </div>
                        <p className="font-pixel text-xs text-gray-400">
                          {expToNextLevel} EXP to Level {currentLevel + 1}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex gap-6 text-center mt-4">
                  <div>
                    <div className="font-pixel text-2xl text-yellow-300">
                      {statsLoading ? '...' : characterStats?.totalAdventures ?? 0}
                    </div>
                    <div className="font-pixel text-xs text-gray-300">Adventures</div>
                  </div>
                  <div>
                    <div className="font-pixel text-2xl text-yellow-300">
                      {statsLoading ? '...' : characterStats?.currentStreak ?? 0}
                    </div>
                    <div className="font-pixel text-xs text-gray-300">Day Streak</div>
                  </div>
                  <div>
                    <div className="font-pixel text-2xl text-yellow-300">
                      {statsLoading ? '...' : characterStats?.characterAge ?? 0}
                    </div>
                    <div className="font-pixel text-xs text-gray-300">Days Old</div>
                  </div>
                </div>
              )}
              </div>
            </Card>
          </motion.div>

         {/* Theme Display Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.3 }}
         >
           <Card theme={activeCharacter.theme} effect="glow" className="p-3">
             <div>
               <h3 className="font-pixel text-lg text-yellow-300 mb-3 text-center">
                 {themes[activeCharacter.theme]?.hidden 
                   ? (themes[activeCharacter.theme]?.name || 'Theme')
                   : (themes[activeCharacter.theme]?.archetype?.name ? `The ${themes[activeCharacter.theme]?.archetype?.name}` : themes[activeCharacter.theme]?.name || 'Theme')
                 }
               </h3>
               {themes[activeCharacter.theme]?.hidden ? (
                 <p className="font-pixel text-sm text-gray-300 leading-relaxed">
                   {themes[activeCharacter.theme]?.detailedDescription || 'No theme description available.'}
                 </p>
               ) : themes[activeCharacter.theme]?.archetype ? (
                 <div key={`stats-${activeCharacter.id}`}>
                   <h4 className="font-pixel text-sm mb-3 text-center text-white">
                     {activeCharacter.name}&apos;s stats:
                   </h4>
                  {Object.keys(themes[activeCharacter.theme]?.archetype?.stats || {}).map((statName, idx) => {
                    // HYBRID APPROACH: Use memoized parsedStats to ensure values update on character switch
                    const statValue = parsedStats?.[statName]?.value || 10; // Default to 10 if no value
                     return (
                        <div key={`${activeCharacter.id}-${statName}-${idx}`} className="mb-2 last:mb-0">
                          <div className="flex justify-between items-center">
                            <div className="relative flex items-center gap-1 sm:gap-1">
                              <span 
                                className="font-pixel text-sm" 
                                style={{ color: themes[activeCharacter.theme]?.colors.text }}
                              >
                                {statName}
                              </span>
                              <button
                                className="flex items-center justify-center transition-colors hover:opacity-70"
                                style={{ 
                                  color: themes[activeCharacter.theme]?.colors.accent
                                }}
                                onClick={() => setOpenTooltip(openTooltip === statName ? null : statName)}
                                title="View description"
                              >
                                <HiInformationCircle size={20} className="sm:w-4 sm:h-4" />
                              </button>
                              {/* Tooltip */}
                              {openTooltip === statName && (
                                <div className="absolute bottom-full left-0 transform translate-x-4 mb-2 px-3 py-2 bg-gray-900 text-white text-base readable-text rounded-lg shadow-lg z-10 w-56 text-center">
                                  {themes[activeCharacter.theme]?.archetype?.stats[statName]}
                                  <div className="absolute top-full left-8 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </div>
                              )}
                            </div>
                            <span 
                              className="font-pixel text-lg px-2 py-1 rounded"
                              style={{ 
                                backgroundColor: themes[activeCharacter.theme]?.colors.background,
                                color: themes[activeCharacter.theme]?.colors.text
                              }}
                            >
                              {statValue}
                            </span>
                          </div>
                        </div>
                     );
                   })}
                 </div>
               ) : (
               <p className="font-pixel text-sm text-gray-300 leading-relaxed">
                 {themes[activeCharacter.theme]?.detailedDescription || 'No theme description available.'}
               </p>
               )}
             </div>
           </Card>
         </motion.div>
              </div>

           {/* Column 2: Stats */}
          <div className="lg:col-span-1 flex flex-col h-full">
            <div ref={statsRef}>
              <div className="flex flex-col gap-6 h-full">
          {/* Adventure Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card theme={activeCharacter.theme} effect="glow">
              <h3 className="font-pixel text-lg text-white mb-4">📊 Adventure Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-pixel text-sm text-gray-300">Total Adventures:</span>
                  <span className="font-pixel text-yellow-300">
                    {statsLoading ? '...' : characterStats?.totalAdventures ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel text-sm text-gray-300">This Week:</span>
                  <span className="font-pixel text-yellow-300">
                    {statsLoading ? '...' : characterStats?.adventuresThisWeek ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel text-sm text-gray-300">This Month:</span>
                  <span className="font-pixel text-yellow-300">
                    {statsLoading ? '...' : characterStats?.adventuresThisMonth ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel text-sm text-gray-300">Avg/Week:</span>
                  <span className="font-pixel text-yellow-300">
                    {statsLoading ? '...' : characterStats ? characterStats.averageAdventuresPerWeek.toFixed(1) : '0.0'}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Content Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card theme={activeCharacter.theme} effect="vintage">
              <h3 className="font-pixel text-lg text-white mb-4">📝 Content Created</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-pixel text-sm text-gray-300">Chapters:</span>
                  <span className="font-pixel text-yellow-300">
                    {statsLoading ? '...' : characterStats?.storiesCreated ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel text-sm text-gray-300">Scenes:</span>
                  <span className="font-pixel text-yellow-300">
                    {statsLoading ? '...' : characterStats?.scenesGenerated ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel text-sm text-gray-300">Words Written:</span>
                  <span className="font-pixel text-yellow-300">
                    {statsLoading ? '...' : characterStats ? characterStats.totalWordsWritten.toLocaleString() : '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel text-sm text-gray-300">Avg Chapter Length:</span>
                  <span className="font-pixel text-yellow-300">
                    {statsLoading ? '...' : characterStats ? `${characterStats.averageStoryLength.toFixed(0)} words` : '0 words'}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Streak Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card theme={activeCharacter.theme} effect="book">
              <h3 className="font-pixel text-lg text-white mb-4">🔥 Streak Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-pixel text-sm text-gray-300">Current Streak:</span>
                  <span className="font-pixel text-yellow-300">
                    {statsLoading ? '...' : characterStats ? `${characterStats.currentStreak} days` : '0 days'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel text-sm text-gray-300">Longest Streak:</span>
                  <span className="font-pixel text-yellow-300">
                    {statsLoading ? '...' : characterStats ? `${characterStats.longestStreak} days` : '0 days'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel text-sm text-gray-300">Most Active Day:</span>
                  <span className="font-pixel text-yellow-300">
                    {statsLoading ? '...' : characterStats?.mostActiveDay ?? 'Monday'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel text-sm text-gray-300">Peak Hour:</span>
                  <span className="font-pixel text-yellow-300">
                    {statsLoading ? '...' : characterStats ? `${characterStats.mostActiveHour}:00` : '12:00'}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
              </div>
            </div>
          </div>

          {/* Column 3: Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="lg:col-span-1 flex flex-col"
          >
            <div style={{ height: statsHeight > 0 ? `${statsHeight}px` : 'auto' }}>
              {/* Debug: statsHeight = {statsHeight} */}
              <Card theme={activeCharacter.theme} effect="glow" className="flex flex-col h-full">
            <h3 className="font-pixel text-xl text-white mb-6">🏆 Achievements</h3>
            <hr className="border-gray-600 -mt-1 mb-4" />
            {/* <div className="flex flex-col gap-4 flex-1 overflow-y-auto min-h-0"> */}
            {/* <div className="flex-1 overflow-y-auto min-h-0 overflow-x-hidden"> */}
            <div className="flex-1 overflow-y-auto min-h-0 overflow-x-hidden">
              <div className="space-y-4">
              {statsLoading ? (
                // Show placeholder achievement cards while loading
                Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={`loading-${idx}`}
                    className="p-4 rounded-lg border-2 border-gray-600 bg-gray-800/50 opacity-50 text-center"
                  >
                    <div className="text-3xl mb-2 grayscale opacity-50">🏆</div>
                    <h4 className="font-pixel text-sm mb-1 text-gray-500">...</h4>
                    <p className="font-pixel text-xs text-gray-600">...</p>
                    <div className="mt-2 text-xs font-pixel text-gray-600">...</div>
                  </div>
                ))
              ) : characterStats?.achievements ? (
                characterStats.achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-lg border-2 text-center relative ${
                    achievement.unlockedAt 
                      ? (achievement.isSpecial 
                          ? 'border-purple-400 bg-gradient-to-br from-purple-400/20 to-pink-400/20' 
                          : 'border-yellow-400 bg-yellow-400/10')
                      : 'border-gray-600 bg-gray-800/50 opacity-50'
                  }`}
                >
                  {/* Special achievement indicator */}
                  {achievement.isSpecial && (
                    <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs font-pixel px-1 rounded">
                      ★
                    </div>
                  )}
                  <div className={`text-3xl mb-2 ${achievement.unlockedAt ? '' : 'grayscale opacity-50'}`}>{achievement.icon}</div>
                  <h4 className={`font-pixel text-sm mb-1 ${
                    achievement.unlockedAt 
                      ? (achievement.isSpecial ? 'text-purple-300' : 'text-yellow-300')
                      : 'text-gray-500'
                  }`}>
                    {achievement.name}
                  </h4>
                  <p className={`font-pixel text-xs ${
                    achievement.unlockedAt ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {achievement.description}
                  </p>
                  <div className={`mt-2 text-xs font-pixel ${
                    achievement.unlockedAt 
                      ? (achievement.rarity === 'legendary' ? 'text-purple-400' :
                         achievement.rarity === 'epic' ? 'text-pink-400' :
                         achievement.rarity === 'rare' ? 'text-blue-400' :
                         achievement.rarity === 'uncommon' ? 'text-green-400' :
                         'text-gray-400')
                      : 'text-gray-600'
                  }`}>
                    {achievement.rarity.toUpperCase()}
                    {achievement.isSpecial && ' • SPECIAL'}
                  </div>
                  {/* Special achievement glow effect */}
                  {achievement.isSpecial && achievement.unlockedAt && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-400/10 to-pink-400/10 animate-pulse pointer-events-none"></div>
                  )}
                </motion.div>
                ))
              ) : (
                <div className="font-pixel text-sm text-gray-400 text-center">No achievements available</div>
              )}
              </div>
            </div>
              </Card>
            </div>
          </motion.div>

          {/* Danger Zone Section - Spans all 3 columns */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-3 mt-4"
          >
            <Card 
              theme={activeCharacter.theme} 
              effect="glow" 
              className="p-4 border-2"
              style={{
                borderColor: '#ef4444', // red-500
                backgroundColor: 'rgba(239, 68, 68, 0.05)' // red-500 with low opacity
              }}
            >
              <div className="text-center">
                <h3 className="font-pixel text-xl text-red-400 mb-2">⚠️ DANGER ZONE</h3>
                <p className="font-pixel text-sm text-gray-300 mb-4">
                  Irreversible and destructive actions. Please proceed with caution.
                </p>
                <Button
                  onClick={() => setShowDeleteAccountConfirm(true)}
                  variant="primary"
                  className="w-full md:w-auto"
                  theme={activeCharacter.theme}
                  style={{
                    backgroundColor: '#ef4444',
                    borderColor: '#dc2626',
                  }}
                >
                  DELETE ACCOUNT
                </Button>
              </div>
            </Card>
          </motion.div> */}
        </div>
      </div>

      {/* Layered Avatar Builder Modal */}
      {showLayeredAvatarBuilder && (
        <LayeredAvatarBuilder
          onSave={handleLayeredAvatarSelect}
          onCancel={() => setShowLayeredAvatarBuilder(false)}
          currentAvatar={activeCharacter.avatar?.options?.layeredAvatar}
        />
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteAccountConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4"
          onClick={() => !isDeletingAccount && setShowDeleteAccountConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="p-6 rounded-lg pixelated border-2 max-w-md w-full"
            style={{
              backgroundColor: themes[activeCharacter.theme].colors.background,
              borderColor: '#ef4444' // red-500
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-pixel text-lg mb-4 text-center text-red-400">
              ⚠️ DELETE ACCOUNT
            </h3>
            
            <p className="font-pixel mb-4 text-center" style={{ color: themes[activeCharacter.theme].colors.text }}>
              Are you absolutely sure you want to delete your account?
            </p>
            
            <div className="bg-red-900/20 border border-red-500/50 rounded p-3 mb-4">
              <p className="font-pixel text-xs text-red-300 mb-2">
                This action will permanently delete:
              </p>
              <ul className="font-pixel text-xs text-red-200 list-disc list-inside space-y-1">
                <li>Your account and all user data</li>
                <li>All your characters</li>
                <li>All your journal entries</li>
                <li>All your achievements and progress</li>
                <li>Your subscription (if active)</li>
              </ul>
              <p className="font-pixel text-xs text-red-400 mt-2 font-bold">
                THIS ACTION CANNOT BE UNDONE.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteAccountConfirm(false)}
                variant="secondary"
                className="flex-1"
                theme="obsidian-veil"
                disabled={isDeletingAccount}
                style={{
                  background: 'linear-gradient(to bottom, #6B7280, #4B5563)',
                  borderColor: '#6B7280',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8), -1px -1px 0px rgba(0, 0, 0, 0.8), 1px -1px 0px rgba(0, 0, 0, 0.8), -1px 1px 0px rgba(0, 0, 0, 0.8), 0px 1px 0px rgba(0, 0, 0, 0.8), 0px -1px 0px rgba(0, 0, 0, 0.8), 1px 0px 0px rgba(0, 0, 0, 0.8), -1px 0px 0px rgba(0, 0, 0, 0.8)'
                }}
              >
                CANCEL
              </Button>
              <Button
                onClick={async () => {
                  setIsDeletingAccount(true);
                  try {
                    const response = await fetch('/api/user/delete-account', {
                      method: 'DELETE',
                    });

                    if (!response.ok) {
                      const error = await response.json();
                      throw new Error(error.error || 'Failed to delete account');
                    }

                    // Account deleted successfully, redirect to home
                    window.location.href = '/home';
                  } catch (error) {
                    console.error('Error deleting account:', error);
                    alert(error instanceof Error ? error.message : 'Failed to delete account. Please try again.');
                    setIsDeletingAccount(false);
                  }
                }}
                variant="destructive"
                className="flex-1"
                theme="obsidian-veil"
                disabled={isDeletingAccount}
                style={{
                  background: 'linear-gradient(to bottom, #ef4444, #dc2626)',
                  borderColor: '#dc2626',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8), -1px -1px 0px rgba(0, 0, 0, 0.8), 1px -1px 0px rgba(0, 0, 0, 0.8), -1px 1px 0px rgba(0, 0, 0, 0.8), 0px 1px 0px rgba(0, 0, 0, 0.8), 0px -1px 0px rgba(0, 0, 0, 0.8), 1px 0px 0px rgba(0, 0, 0, 0.8), -1px 0px 0px rgba(0, 0, 0, 0.8)'
                }}
              >
                {isDeletingAccount ? 'DELETING...' : 'DELETE ACCOUNT'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </div>
      {/* <Footer /> */}
    </div>
  );
}
