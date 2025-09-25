'use client';

import { motion } from 'framer-motion';
import { useState, useMemo, useRef, useEffect } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import MovingGradientBackground from './MovingGradientBackground';
import AppNavigation from './AppNavigation';
import { User, Character, Avatar } from '@/types';
import { themes } from '@/themes';
import { saveUser, saveUserPreferences } from '@/lib/client-utils';
import { useEntries } from '@/hooks/useEntries';
import LayeredAvatarBuilder from './LayeredAvatarBuilder';
import { LayeredAvatar } from '@/lib/layered-avatars';
import { calculateCharacterStats } from '@/lib/character-stats';

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
  const [newUsername, setNewUsername] = useState(user.username || '');
  const [usernameError, setUsernameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLayeredAvatarBuilder, setShowLayeredAvatarBuilder] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState(activeCharacter.id);
  
  const { entries, isLoading: entriesLoading } = useEntries();
  
  // Calculate character stats
  const characterStats = useMemo(() => {
    return calculateCharacterStats(activeCharacter, entries, 
      user.subscriptionPlan && user.subscriptionStatus ? {
        plan: user.subscriptionPlan,
        status: user.subscriptionStatus
      } : undefined
    );
  }, [activeCharacter, entries, user.subscriptionPlan, user.subscriptionStatus]);

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

  return (
    <div className="min-h-screen p-1">
      <MovingGradientBackground theme={activeCharacter.theme} />
      
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
        {entriesLoading && (
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
              Loading character data...
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
          <Card theme={activeCharacter.theme} effect="glow" className="p-2 flex flex-col">
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
                        src={activeCharacter.avatar?.options?.layeredAvatar?.head.imagePath}
                        alt={activeCharacter.avatar?.options?.layeredAvatar?.head.name}
                          className="w-full h-full object-contain pixelated"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                    <div className="flex-shrink-0 h-12">
                        <img
                        src={activeCharacter.avatar?.options?.layeredAvatar.torso.imagePath}
                        alt={activeCharacter.avatar?.options?.layeredAvatar.torso.name}
                          className="w-full h-full object-contain pixelated"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                    <div className="flex-shrink-0 h-10">
                        <img
                        src={activeCharacter.avatar?.options?.layeredAvatar.legs.imagePath}
                        alt={activeCharacter.avatar?.options?.layeredAvatar.legs.name}
                          className="w-full h-full object-contain pixelated"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                    </div>
                ) : activeCharacter.avatar?.options?.imagePath ? (
                  <img 
                    src={activeCharacter.avatar?.options?.imagePath} 
                    alt={activeCharacter.avatar?.name}
                    className="w-40 h-40 pixelated"
                      style={{ imageRendering: 'pixelated' }}
                    />
                ) : activeCharacter.avatar?.pixelArt ? (
                  <img 
                    src={activeCharacter.avatar?.pixelArt} 
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
                    className="text-yellow-400 hover:text-yellow-300 transition-colors"
                    title="Switch character"
                  >
                    🔄
                  </button>
                </div>
                
                {/* Username Section */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  {isChangingUsername ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={newUsername}
                        onChange={setNewUsername}
                        placeholder="Enter new username"
                        className="text-sm w-32"
                        theme={activeCharacter.theme}
                      />
                        <Button
                          onClick={handleUsernameChange}
                          disabled={isLoading}
                        className="px-2 py-1 text-xs"
                        theme={activeCharacter.theme}
                        >
                          {isLoading ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          onClick={handleCancelUsernameChange}
                          variant="secondary"
                        className="px-2 py-1 text-xs"
                        theme={activeCharacter.theme}
                        >
                          Cancel
                        </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-sm text-gray-300">
                        {user.username ? `@${user.username}` : 'No username set'}
                      </span>
                      <button
                        onClick={() => setIsChangingUsername(true)}
                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                        title="Edit username"
                      >
                        ✏️
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


              {/* Quick Stats */}
              <div className="flex gap-6 text-center mt-4">
                <div>
                  <div className="font-pixel text-2xl text-yellow-300">{characterStats.totalAdventures}</div>
                  <div className="font-pixel text-xs text-gray-300">Adventures</div>
                </div>
                <div>
                  <div className="font-pixel text-2xl text-yellow-300">{characterStats.currentStreak}</div>
                  <div className="font-pixel text-xs text-gray-300">Day Streak</div>
                </div>
                <div>
                  <div className="font-pixel text-2xl text-yellow-300">{characterStats.characterAge}</div>
                  <div className="font-pixel text-xs text-gray-300">Days Old</div>
                </div>
                </div>
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
               <h3 className="font-pixel text-lg text-yellow-300 mb-3 text-center">{themes[activeCharacter.theme]?.name || 'Theme'}</h3>
               <p className="font-pixel text-sm text-gray-300 leading-relaxed">
                 {themes[activeCharacter.theme]?.detailedDescription || 'No theme description available.'}
               </p>
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
                  <span className="font-pixel text-yellow-300">{characterStats.totalAdventures}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel text-sm text-gray-300">This Week:</span>
                  <span className="font-pixel text-yellow-300">{characterStats.adventuresThisWeek}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel text-sm text-gray-300">This Month:</span>
                  <span className="font-pixel text-yellow-300">{characterStats.adventuresThisMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel text-sm text-gray-300">Avg/Week:</span>
                  <span className="font-pixel text-yellow-300">{characterStats.averageAdventuresPerWeek.toFixed(1)}</span>
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
                  <span className="font-pixel text-yellow-300">{characterStats.storiesCreated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel text-sm text-gray-300">Scenes:</span>
                  <span className="font-pixel text-yellow-300">{characterStats.scenesGenerated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel text-sm text-gray-300">Words Written:</span>
                  <span className="font-pixel text-yellow-300">{characterStats.totalWordsWritten.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel text-sm text-gray-300">Avg Chapter Length:</span>
                  <span className="font-pixel text-yellow-300">{characterStats.averageStoryLength.toFixed(0)} words</span>
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
                  <span className="font-pixel text-yellow-300">{characterStats.currentStreak} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel text-sm text-gray-300">Longest Streak:</span>
                  <span className="font-pixel text-yellow-300">{characterStats.longestStreak} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel text-sm text-gray-300">Most Active Day:</span>
                  <span className="font-pixel text-yellow-300">{characterStats.mostActiveDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-pixel text-sm text-gray-300">Peak Hour:</span>
                  <span className="font-pixel text-yellow-300">{characterStats.mostActiveHour}:00</span>
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
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="space-y-4">
              {characterStats.achievements.map((achievement) => (
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
              ))}
              </div>
            </div>
              </Card>
            </div>
          </motion.div>
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
    </div>
  );
}
