'use client';

import { useState, useEffect, startTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import IntroScreen from './IntroScreen';
import CharacterCreator from './CharacterCreator';
import CharacterSelector from './CharacterSelector';
import JournalEntry from './JournalEntry';
import CalendarView from './CalendarView';
import UserProfile from './UserProfile';
import TributePage from './TributePage';
import CustomCursor from './CustomCursor';
import ThemeCursorStyles from './ThemeCursorStyles';
import BackgroundMusic from './BackgroundMusic';
import OfflineWarning from './OfflineWarning';
import GlobalLogoutButton from './GlobalLogoutButton';
import Button from './ui/Button';
import { User, Character, Theme, Avatar } from '@/types';
import { fetchWithAutoLogout, shouldAutoLogout } from '@/lib/auto-logout';
import { queueOfflineChange } from '@/lib/offline-sync';
import { loadUserPreferences, loadUser } from '@/lib/client-utils';

type AppState = 'intro' | 'character-select' | 'character-create' | 'journal' | 'calendar' | 'profile' | 'tribute';

export default function QuilliaApp() {
  const { data: session } = useSession();
  const router = useRouter();
  const [appState, setAppState] = useState<AppState>('intro');
  const [user, setUser] = useState<User | null>(null);
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [currentTheme, setCurrentTheme] = useState<Theme>('velour-nights');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTheme, setLoadingTheme] = useState<Theme>('velour-nights');
  // const [isTransitioning, setIsTransitioning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check localStorage for theme immediately on mount
  useEffect(() => {
    const localUser = loadUser();
    if (localUser?.activeCharacter?.theme) {
      setLoadingTheme(localUser.activeCharacter.theme);
      setCurrentTheme(localUser.activeCharacter.theme);
    }
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (session?.user) {
        try {
          // Load user data from database
          const dbUser = await loadUserPreferences();
          
              if (dbUser && dbUser.id === (session as unknown as { user: { id: string } }).user.id) {
                // Load characters with lock status
                try {
                  const charactersResponse = await fetchWithAutoLogout('/api/characters');
                  if (charactersResponse.ok) {
                    const charactersData = await charactersResponse.json();
                    dbUser.characters = charactersData.characters || [];
                  } else {
                    console.error('Failed to load characters:', charactersResponse.status, charactersResponse.statusText);
                    const errorData = await charactersResponse.json().catch(() => ({}));
                    console.error('Error details:', errorData);
                    
                    // Check if this is an auto-logout scenario
                    if (shouldAutoLogout(errorData)) {
                      console.log('User account deleted, auto-logout will be handled by fetchWithAutoLogout');
                      return; // Exit early, auto-logout is in progress
                    }
                  }
                } catch (error) {
                  console.error('Error loading characters:', error);
                  // Set empty characters array as fallback
                  dbUser.characters = [];
                }
            
            // Set loading theme immediately if user has an active character
            if (dbUser.activeCharacter) {
              setLoadingTheme(dbUser.activeCharacter.theme);
              // Also update current theme immediately for consistency
              setCurrentTheme(dbUser.activeCharacter.theme);
            }
            
            // Use startTransition to batch state updates and prevent multiple re-renders
            startTransition(() => {
              setUser(dbUser);
              
              // Set active character and theme
              if (dbUser.activeCharacter) {
                setActiveCharacter(dbUser.activeCharacter);
                setCurrentTheme(dbUser.activeCharacter.theme);
                // Don't automatically transition - let user click "Start your adventure"
              } else if (dbUser.characters && dbUser.characters.length > 0) {
                // User has characters but no active one - don't auto-transition
              } else {
                // User has no characters - don't auto-transition
              }
            });
          } else {
            // No user data found, start with character creation
            const sessionUser: User = {
              id: (session as unknown as { user: { id: string } }).user.id,
              name: session.user.name || undefined,
              username: undefined,
              email: session.user.email || '',
              characterSlots: 1,
              createdAt: new Date()
            };
            startTransition(() => {
              setUser(sessionUser);
              if (appState === 'intro') {
                setAppState('character-create');
              }
            });
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          // Fallback: create basic user and go to character creation
          const sessionUser: User = {
            id: (session as unknown as { user: { id: string } }).user.id,
            name: session.user.name || undefined,
            username: undefined,
            email: session.user.email || '',
            characterSlots: 2,
            createdAt: new Date()
          };
          startTransition(() => {
            setUser(sessionUser);
            if (appState === 'intro') {
              setAppState('character-create');
            }
          });
        }
      }
      setIsLoading(false);
    };

    loadUserData();
  }, [session]);

  const handlePageTransition = (newState: AppState, delay: number = 300) => {
    setTimeout(() => {
      setAppState(newState);
    }, delay);
  };

  const handleStart = () => {
    // Check if user has characters and active character
    if (user?.activeCharacter) {
      // User has an active character, go to journal
      handlePageTransition('journal');
    } else if (user?.characters && user.characters.length > 0) {
      // User has characters but no active one, go to character selection
      handlePageTransition('character-select');
    } else {
      // User has no characters, go to character creation
      handlePageTransition('character-create');
    }
  };

  const handleCharacterCreate = (character: Character) => {
    if (user) {
      const updatedUser = {
        ...user,
        characters: [...(user.characters || []), character],
        activeCharacterId: character.id,
        activeCharacter: character
      };
      setUser(updatedUser);
      setActiveCharacter(character);
      setCurrentTheme(character.theme);
      handlePageTransition('journal');
    }
  };

  const handleCharacterSelect = (character: Character) => {
    setActiveCharacter(character);
    setCurrentTheme(character.theme);
    handlePageTransition('journal');
  };

  const handleCharacterSwitch = async (characterId: string) => {
    if (user && user.characters) {
      const character = user.characters.find(char => char.id === characterId);
      if (character) {
        setActiveCharacter(character);
        setCurrentTheme(character.theme);
        
        // Update the active character in the database
        try {
          const response = await fetch(`/api/characters/${characterId}/switch`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            // Update the user's active character
            const updatedUser = {
              ...user,
              activeCharacterId: characterId,
              activeCharacter: character
            };
            setUser(updatedUser);
          }
        } catch (error) {
          console.error('Error switching character:', error);
        }
      }
    }
  };

  const handleCharacterUpdate = (updatedCharacter: Character) => {
    if (user) {
      // Update the character in the user's characters array
      const updatedCharacters = user.characters?.map(char => 
        char.id === updatedCharacter.id ? updatedCharacter : char
      ) || [];
      
      const updatedUser = {
        ...user,
        characters: updatedCharacters,
        activeCharacter: updatedCharacter.id === user.activeCharacterId ? updatedCharacter : user.activeCharacter
      };
      
      setUser(updatedUser);
      
      // If this is the active character, update it
      if (updatedCharacter.id === activeCharacter?.id) {
        setActiveCharacter(updatedCharacter);
      }
    }
  };

  const handleCharacterDelete = async (deletedCharacterId: string) => {
    if (user) {
      // If no characters left after deletion, go to character creation
      const updatedCharacters = user.characters?.filter(char => char.id !== deletedCharacterId) || [];
      
      if (updatedCharacters.length === 0) {
        setAppState('character-create');
        setActiveCharacter(null);
        setUser({
          ...user,
          characters: [],
          activeCharacter: undefined,
          activeCharacterId: undefined
        });
      } else {
        // Fetch fresh user data from backend to get correct active character
        try {
          const response = await fetch('/api/user/preferences');
          if (response.ok) {
            const data = await response.json();
            const userData = data.user;
            setUser(userData);
            setActiveCharacter(userData.activeCharacter || null);
          } else {
            console.error('Failed to fetch updated user data:', response.status);
            // Fallback: remove character from local state
            setUser({
              ...user,
              characters: updatedCharacters,
              activeCharacter: user.activeCharacterId === deletedCharacterId ? updatedCharacters[0] : user.activeCharacter,
              activeCharacterId: user.activeCharacterId === deletedCharacterId ? updatedCharacters[0]?.id : user.activeCharacterId
            });
          }
        } catch (error) {
          console.error('Error fetching updated user data:', error);
          // Fallback: remove character from local state
          setUser({
            ...user,
            characters: updatedCharacters,
            activeCharacter: user.activeCharacterId === deletedCharacterId ? updatedCharacters[0] : user.activeCharacter,
            activeCharacterId: user.activeCharacterId === deletedCharacterId ? updatedCharacters[0]?.id : user.activeCharacterId
          });
        }
      }
    }
  };

  const handleCreateNewCharacter = () => {
    handlePageTransition('character-create');
  };

  const handleCharacterBack = () => {
    if (activeCharacter) {
      // If we have an active character, go back to journal
      handlePageTransition('journal');
    } else {
      // If no active character, go to intro
      handlePageTransition('intro');
    }
  };

  const handleJournalBack = () => {
    handlePageTransition('character-select');
  };

  const handleCalendarBack = () => {
    handlePageTransition('journal');
  };

  const handleProfileBack = () => {
    handlePageTransition('journal');
  };

  const handleTributeBack = () => {
    handlePageTransition('journal');
  };

  const handleAvatarChange = (avatar: Avatar) => {
    if (activeCharacter) {
      const updatedCharacter = { ...activeCharacter, avatar };
      setActiveCharacter(updatedCharacter);
      
      // Update the character in the database
      fetch(`/api/characters/${activeCharacter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update avatar');
        }
      })
      .catch(error => {
        console.error('Error updating avatar:', error);
        // Queue the change for offline sync
        queueOfflineChange('avatar_change', {
          characterId: activeCharacter.id,
          avatar: avatar
        });
      });
    }
  };

  const handleSimpleAvatarChange = (avatar: { id: string; name: string; image: string }) => {
    // Convert simple avatar to full Avatar type
    const fullAvatar: Avatar = {
      id: avatar.id,
      name: avatar.name,
      image: avatar.image,
      pixelArt: undefined,
      color: '#FF6B35',
      accessories: [],
      description: avatar.name,
      race: 'Human',
      class: 'Adventurer',
      stats: {
        strength: 10,
        intelligence: 10,
        dexterity: 10,
        wisdom: 10,
        charisma: 10
      }
    };
    handleAvatarChange(fullAvatar);
  };

  const handleThemeChange = (theme: Theme) => {
    // Themes are now tied to characters, so this shouldn't be called directly
    // But we'll keep it for backward compatibility
    setCurrentTheme(theme);
  };

  // Show intro screen while loading user data
  if (isLoading) {
    return <IntroScreen onStart={() => {}} theme={loadingTheme} />;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="font-pixel text-2xl text-white mb-4">Please sign in to continue</div>
          <Button onClick={() => router.push('/auth/signin')} variant="primary">
            SIGN IN
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ThemeCursorStyles theme={currentTheme} />
      <CustomCursor 
        isGenerating={isGenerating} 
        isModalOpen={isModalOpen} 
        theme={currentTheme} 
      />
      <BackgroundMusic theme={currentTheme} />
      <OfflineWarning />

      <AnimatePresence mode="wait">
        {appState === 'intro' && (
          <motion.div
            key="intro-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <IntroScreen key="intro-component" onStart={handleStart} theme={currentTheme} />
          </motion.div>
        )}

        {appState === 'character-select' && user && (
          <motion.div
            key="character-select"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <CharacterSelector
              characters={user.characters || []}
              activeCharacter={activeCharacter}
              onCharacterSelect={handleCharacterSelect}
              onCreateNew={handleCreateNewCharacter}
              onBack={handleCharacterBack}
              onCharacterUpdate={handleCharacterUpdate}
              onCharacterDelete={handleCharacterDelete}
              user={user}
              onUpgrade={() => handlePageTransition('tribute')}
            />
          </motion.div>
        )}

        {appState === 'character-create' && user && (
          <motion.div
            key="character-create"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <CharacterCreator
              user={user}
              onCharacterCreate={handleCharacterCreate}
              onBack={handleCharacterBack}
              currentTheme={currentTheme}
              onUpgrade={() => handlePageTransition('tribute')}
            />
          </motion.div>
        )}

        {appState === 'journal' && user && activeCharacter && (
          <motion.div
            key="journal"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <JournalEntry
              user={user}
              activeCharacter={activeCharacter}
              onBack={handleJournalBack}
              onCalendarView={() => handlePageTransition('calendar')}
              onProfileView={() => handlePageTransition('profile')}
              onTributeView={() => handlePageTransition('tribute')}
              onCharacterSwitch={() => handlePageTransition('character-select')}
              onAvatarChange={handleSimpleAvatarChange}
              onThemeChange={handleThemeChange}
              onModalOpen={() => setIsModalOpen(true)}
              onModalClose={() => setIsModalOpen(false)}
              onGeneratingStart={() => setIsGenerating(true)}
              onGeneratingEnd={() => setIsGenerating(false)}
            />
          </motion.div>
        )}

        {appState === 'calendar' && user && activeCharacter && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <CalendarView
              user={user}
              activeCharacter={activeCharacter}
              onBack={handleCalendarBack}
            />
          </motion.div>
        )}

        {appState === 'profile' && user && activeCharacter && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <UserProfile
              user={user}
              activeCharacter={activeCharacter}
              onBack={handleProfileBack}
              onAvatarChange={handleAvatarChange}
              onCharacterSwitch={handleCharacterSwitch}
              onNavigateToCharacterSelect={() => handlePageTransition('character-select')}
            />
          </motion.div>
        )}

        {appState === 'tribute' && user && activeCharacter && (
          <motion.div
            key="tribute"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <TributePage
              user={user}
              activeCharacter={activeCharacter}
              onBack={handleTributeBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Global Logout Button - Bottom Left */}
      {user && (
        <GlobalLogoutButton 
          theme={currentTheme} 
          currentPage={appState}
        />
      )}
    </div>
  );
}