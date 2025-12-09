'use client';

import { motion } from 'framer-motion';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Trash, Pencil, Check } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import LayeredAvatarRenderer from './LayeredAvatarRenderer';
import LayeredAvatarBuilder from './LayeredAvatarBuilder';
import AppNavigation from './AppNavigation';
import MovingGradientBackground from './MovingGradientBackground';
import { Character, Theme } from '@/types';
import { themes } from '@/themes';
import { migrateTheme } from '@/lib/theme-migration';
import { getCachedImageUrl } from '@/lib/asset-cache';
import { queueOfflineChange } from '@/lib/offline-sync';
import { CHARACTER_SLOT_PRICE, CHARACTER_SLOT_PRODUCT_PATH } from '@/lib/credits';
// import Footer from './Footer';

const ADMIN_EMAILS = ['admin@quillia.app', 'gabrielonicala@gmail.com'];

interface CharacterSelectorProps {
  characters: Character[];
  activeCharacter: Character | null;
  onCharacterSelect: (character: Character) => void;
  onCreateNew: () => void;
  onBack: () => void;
  onCharacterUpdate: (character: Character) => void;
  onCharacterDelete: (characterId: string) => void;
  user: {
    id: string;
    email?: string | null;
    characterSlots: number;
  };
  // Triggered when user clicks upgrade; allows parent to show the Tribute view
  onUpgrade?: () => void;
  // Callback to refresh user data (for updating character slots after purchase)
  onUserRefresh?: () => Promise<void>;
}

export default function CharacterSelector({ 
  characters, 
  activeCharacter, 
  onCharacterSelect, 
  onCreateNew, 
  onBack,
  onCharacterUpdate,
  onCharacterDelete,
  user,
  onUpgrade,
  onUserRefresh
}: CharacterSelectorProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showAvatarBuilder, setShowAvatarBuilder] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isPurchasingSlot, setIsPurchasingSlot] = useState(false);
  const nameEditRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const checkButtonRef = useRef<HTMLDivElement>(null);

  const handleCharacterSwitch = async (character: Character) => {
    if (character.id === activeCharacter?.id) return;
    
    // Check if character is locked before attempting to switch
    if (character.isLocked) {
      alert('This character is locked. Upgrade your plan to access all characters!');
      return;
    }

    setIsLoading(character.id);
    try {
      const response = await fetch(`/api/characters/${character.id}/switch`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403 && errorData.message) {
          alert(errorData.message);
        } else {
          throw new Error('Failed to switch character');
        }
        return;
      }

      const { activeCharacter: newActiveCharacter } = await response.json();
      onCharacterSelect(newActiveCharacter);
    } catch (error) {
      console.error('Error switching character:', error);
      alert('Failed to switch character. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const handleEditAvatar = (character: Character) => {
    setEditingCharacter(character);
    setShowAvatarBuilder(true);
  };

  const handleAvatarSave = async (layeredAvatar: NonNullable<NonNullable<Character['avatar']>['options']>['layeredAvatar']) => {
    if (!editingCharacter) return;

    // Update the character's avatar
    const updatedCharacter = {
      ...editingCharacter,
      avatar: editingCharacter.avatar ? {
        ...editingCharacter.avatar,
        options: {
          ...editingCharacter.avatar.options,
          layeredAvatar: layeredAvatar
        }
      } : {
        id: 'temp-avatar',
        name: 'Custom Avatar',
        image: '👤',
        pixelArt: undefined,
        color: '#FF6B35',
        accessories: [],
        description: 'Custom layered avatar',
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
          layeredAvatar: layeredAvatar
        }
      }
    };

    try {
      // Save to database
      const response = await fetch(`/api/characters/${editingCharacter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          avatar: updatedCharacter.avatar 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update character avatar');
      }

      // Update the character in the parent component
      onCharacterUpdate(updatedCharacter);
      
      // Close the builder
      setShowAvatarBuilder(false);
      setEditingCharacter(null);
    } catch (error) {
      console.error('Error updating character avatar:', error);
      // Queue for offline sync if the request failed
      queueOfflineChange('character_update', {
        characterId: editingCharacter.id,
        updates: { avatar: updatedCharacter.avatar }
      });
      
      // Still update locally and close the builder
      onCharacterUpdate(updatedCharacter);
      setShowAvatarBuilder(false);
      setEditingCharacter(null);
    }
  };

  const handleAvatarCancel = () => {
    setShowAvatarBuilder(false);
    setEditingCharacter(null);
  };

  // Character slot purchase handler
  const handlePurchaseCharacterSlot = async () => {
    setIsPurchasingSlot(true);
    const slotsBeforePurchase = user.characterSlots; // Capture current slots for comparison
    try {
      if (typeof window === 'undefined' || !(window as any).fastspring) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!(window as any).fastspring) {
          alert('FastSpring checkout is loading. Please try again in a moment.');
          setIsPurchasingSlot(false);
          return;
        }
      }

      const fastspring = (window as any).fastspring;
      
      try {
        await fetch('/api/fastspring/checkout/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Failed to notify backend of checkout start:', error);
      }

      const handlePopupClosed = async () => {
        console.log('Character slot popup closed');
        // Remove event listeners first to prevent double-firing
        window.removeEventListener('fsc:popup.closed', handlePopupClosed);
        window.removeEventListener('fsc:checkout.closed', handlePopupClosed);
        window.removeEventListener('fsc:order.complete', handleOrderComplete);
        
        // If popup closed, check if order completed by checking user data after a delay
        // This handles cases where order completes but event doesn't fire
        setTimeout(async () => {
          if (onUserRefresh) {
            try {
              // Check if slots increased by fetching fresh user data
              const response = await fetch('/api/user/preferences');
              if (response.ok) {
                const data = await response.json();
                const updatedUser = data.user;
                
                // Always refresh to get latest data
                await onUserRefresh();
                setIsPurchasingSlot(false);
                
                // If slots increased, order completed successfully
                if (updatedUser && updatedUser.characterSlots > slotsBeforePurchase) {
                  console.log('Character slots increased, state refreshed');
                } else {
                  console.log('Popup closed, state refreshed (slots may not have increased yet)');
                }
              } else {
                // If API call fails, just reset the button and try refresh
                setIsPurchasingSlot(false);
                await onUserRefresh();
              }
            } catch (error) {
              console.error('Error checking slots after popup close:', error);
              // Always reset button state on error to prevent it from being stuck
              setIsPurchasingSlot(false);
              // Try to refresh anyway
              try {
                await onUserRefresh();
              } catch (refreshError) {
                console.error('Error refreshing user data:', refreshError);
                // Final fallback to page reload
                window.location.reload();
              }
            }
          } else {
            // No refresh callback, just reset button and reload
            setIsPurchasingSlot(false);
            setTimeout(() => window.location.reload(), 2000);
          }
        }, 3000);
      };

      const handleOrderComplete = async () => {
        console.log('Character slot order completed');
        // Reset button state immediately
        setIsPurchasingSlot(false);
        
        // Remove all event listeners
        window.removeEventListener('fsc:popup.closed', handlePopupClosed);
        window.removeEventListener('fsc:checkout.closed', handlePopupClosed);
        window.removeEventListener('fsc:order.complete', handleOrderComplete);
        
        // Refresh user data to get updated slots
        // Try immediately first (webhook might process quickly), then retry if needed
        if (onUserRefresh) {
          const refreshWithRetry = async (attempt: number = 1) => {
            try {
              await onUserRefresh();
              
              // Check if slots actually increased by fetching fresh data
              const response = await fetch('/api/user/preferences');
              if (response.ok) {
                const data = await response.json();
                const updatedUser = data.user;
                
                // If slots increased, we're done
                if (updatedUser && updatedUser.characterSlots > slotsBeforePurchase) {
                  console.log('Character slots updated successfully');
                  return;
                }
              }
              
              // If slots didn't increase yet and we haven't retried too many times, retry
              if (attempt < 3) {
                console.log(`Slots not updated yet, retrying (attempt ${attempt + 1})...`);
                setTimeout(() => refreshWithRetry(attempt + 1), 2000);
              } else {
                console.log('Slots may not have updated after multiple attempts');
              }
            } catch (error) {
              console.error(`Error refreshing user data (attempt ${attempt}):`, error);
              // Retry on error
              if (attempt < 3) {
                setTimeout(() => refreshWithRetry(attempt + 1), 2000);
              } else {
                // Final fallback to page reload
                window.location.reload();
              }
            }
          };
          
          // Start refresh attempts - try immediately, then retry if needed
          refreshWithRetry(); // First attempt immediately
        } else {
          // Fallback to page reload if no refresh callback
          setTimeout(() => window.location.reload(), 2000);
        }
      };

      window.addEventListener('fsc:popup.closed', handlePopupClosed);
      window.addEventListener('fsc:checkout.closed', handlePopupClosed);
      window.addEventListener('fsc:order.complete', handleOrderComplete);

      fastspring.builder.reset();

      const sessionData: any = {
        account: {
          buyerReference: user.id
        },
        products: [{
          path: CHARACTER_SLOT_PRODUCT_PATH,
          quantity: 1
        }]
      };

      if (user.email) {
        sessionData.paymentContact = { email: user.email };
      }

      fastspring.builder.push(sessionData);
      await new Promise(resolve => setTimeout(resolve, 200));
      fastspring.builder.checkout();

    } catch (error) {
      console.error('Error opening FastSpring checkout:', error);
      alert('Failed to open checkout. Please try again.');
      setIsPurchasingSlot(false);
    }
  };

  const handleEditName = (character: Character) => {
    setEditingName(character.id);
    setTempName(character.name);
  };

  const handleSaveName = async (characterId: string) => {
    if (!tempName.trim()) return;

    // Find the character to update
    const characterToUpdate = characters.find(c => c.id === characterId);
    if (!characterToUpdate) return;

    // Create updated character with new name
    const updatedCharacter = { ...characterToUpdate, name: tempName.trim() };

    try {
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tempName.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to update character name');
      }

      const { character: serverUpdatedCharacter } = await response.json();
      onCharacterUpdate(serverUpdatedCharacter);
      setEditingName(null);
      setTempName('');
    } catch (error) {
      console.error('Error updating character name:', error);
      // Queue for offline sync if the request failed
      queueOfflineChange('character_update', {
        characterId: characterId,
        updates: { name: tempName.trim() }
      });
      
      // Still update locally and close the editor
      onCharacterUpdate(updatedCharacter);
      setEditingName(null);
      setTempName('');
    }
  };

  const handleCancelEditName = () => {
    setEditingName(null);
    setTempName('');
  };

  // Handle clicks outside the name edit input to cancel editing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingName && nameEditRef.current && !nameEditRef.current.contains(event.target as Node)) {
        setEditingName(null);
        setTempName('');
      }
    };

    if (editingName) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingName]);

  // Position check button at the end of the input
  useEffect(() => {
    if (editingName && inputContainerRef.current && checkButtonRef.current) {
      const updateButtonPosition = () => {
        const inputContainer = inputContainerRef.current;
        const checkButton = checkButtonRef.current;
        if (inputContainer && checkButton) {
          const inputWidth = inputContainer.offsetWidth;
          checkButton.style.left = `${inputWidth + 8}px`; // 8px for gap (0.5rem)
        }
      };

      updateButtonPosition();
      window.addEventListener('resize', updateButtonPosition);

      return () => {
        window.removeEventListener('resize', updateButtonPosition);
      };
    }
  }, [editingName, tempName]);

  const handleDeleteCharacter = async (characterId: string) => {
    setIsDeleting(characterId);
    try {
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete character');
      }

      // Notify parent component about the deletion
      await onCharacterDelete(characterId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting character:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const canCreateNew = characters.length < user.characterSlots;

  // Get theme colors for background
  const migratedTheme = migrateTheme(activeCharacter?.theme || 'obsidian-veil') as Theme;
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

      <div className="flex-1 p-4">
      {/* <MovingGradientBackground theme={activeCharacter?.theme || 'obsidian-veil'} /> */}
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <AppNavigation
          activeCharacter={activeCharacter || undefined}
          currentPage="character-select"
          onBack={onBack}
          theme={activeCharacter?.theme || 'obsidian-veil'}
        />

        {/* Character Grid - Always show exactly 3 slots */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 auto-rows-fr">
          {/* Render existing characters first */}
          {characters.map((character, index) => {
            const isLocked = character.isLocked;
            return (
            <motion.div
              key={character.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
               <Card
                 hover={!isLocked}
                 onClick={() => !isLocked ? handleCharacterSwitch(character) : null}
                 theme={character.theme}
                 className={`transition-all duration-200 h-full ${
                   isLocked 
                     ? 'opacity-60 cursor-not-allowed border-2 border-gray-600' 
                     : `cursor-pointer ${
                         character.id === activeCharacter?.id
                           ? 'animate-gentle-pulse'
                           : ''
                       }`
                 }`}
               >
                <div className="flex items-center gap-2 -pl-6 -ml-4 pr-4 py-4 relative">
                  {/* Lock Overlay for locked characters */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <div className="text-4xl text-gray-400">🔒</div>
                    </div>
                  )}
                  
                  {/* Character Avatar - Left Side */}
                  <div className="flex-shrink-0">
                    {character.avatar ? (
                      character.avatar.options?.layeredAvatar ? (
                        <LayeredAvatarRenderer 
                          layeredAvatar={character.avatar.options.layeredAvatar}
                          size="lg"
                          className="w-32 h-40"
                        />
                      ) : (
                        <>
                        <img
                          src={getCachedImageUrl(character.avatar.image)}
                          alt={character.avatar.name}
                          className="w-32 h-40 pixelated object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                          <div className="w-32 h-40 flex items-center justify-center text-6xl text-gray-400 bg-gray-800 pixelated" style={{ display: 'none' }}>
                            👤
                          </div>
                        </>
                      )
                    ) : (
                      <div className="w-32 h-40 flex items-center justify-center text-6xl text-gray-400 bg-gray-800 pixelated">
                        👤
                      </div>
                    )}
                  </div>
                  
                  {/* Character Info - Right Side */}
                  <div className="flex-1 min-w-0 flex-shrink-0">
                    {isLocked ? (
                      <div className="mb-1">
                        <h3 className="font-pixel text-lg text-gray-400">
                          {character.name}
                        </h3>
                        <div className="font-pixel text-sm text-gray-500 bg-gray-600/20 px-2 py-1 pixelated w-fit mt-1">
                          LOCKED
                        </div>
                      </div>
                    ) : editingName === character.id ? (
                      <div ref={nameEditRef} className="flex items-center gap-2 mb-1 relative" style={{ minHeight: '1.75rem' }}>
                         <h3 className="font-pixel text-lg text-white whitespace-nowrap opacity-0">
                           {character.name}
                         </h3>
                         <Button
                           variant="secondary"
                           size="sm"
                           className="text-xs px-1 py-1 opacity-0 pointer-events-none flex-shrink-0"
                           style={{ width: '1.5rem', height: '1.5rem' }}
                         >
                           <Check className="w-4 h-4" />
                         </Button>
                         <div ref={inputContainerRef} className="absolute left-0" style={{ maxWidth: '200px' }}>
                            <Input
                              value={tempName}
                              onChange={setTempName}
                              className="text-lg font-pixel border-0 rounded-none bg-transparent px-0 py-1 w-full"
                              theme={character.theme}
                              maxLength={15}
                             onKeyDown={(e) => {
                               if (e.key === 'Enter') {
                                 handleSaveName(character.id);
                               } else if (e.key === 'Escape') {
                                 handleCancelEditName();
                               }
                             }}
                             autoFocus
                           />
                         </div>
                         <div ref={checkButtonRef} className="absolute">
                           <Button
                             onClick={() => handleSaveName(character.id)}
                             variant="secondary"
                             size="sm"
                             className="text-xs px-1 py-1 opacity-60 hover:opacity-100 navbar-button-icon bg-transparent border-none flex-shrink-0"
                             theme={character.theme}
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
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-pixel text-lg text-white whitespace-nowrap">
                          {character.name}
                        </h3>
                         <Button
                           onClick={(e) => {
                             e?.stopPropagation();
                             handleEditName(character);
                           }}
                           variant="secondary"
                           size="sm"
                           className="text-xs px-1 py-1 opacity-60 hover:opacity-100 navbar-button-icon bg-transparent border-none"
                           theme={character.theme}
                           style={{
                             background: 'transparent',
                             border: 'none'
                           }}
                         >
                           <Pencil className="w-4 h-4" />
                         </Button>
                      </div>
                    )}
                    
                    <p className="font-pixel text-sm text-gray-300 mb-2">
                      {themes[migrateTheme(character.theme)]?.name || 'Unknown Theme'}
                    </p>
                    
                    {character.description && (
                      <p className="font-pixel text-xs text-gray-400 mb-3 line-clamp-2">
                        {character.description}
                      </p>
                    )}

                    {/* Status and Actions */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {isLocked ? (
                          <span className="font-pixel text-xs text-gray-500 bg-gray-600/20 px-2 py-1 pixelated">
                            LOCKED
                          </span>
                        ) : character.id === activeCharacter?.id ? (
                          <span className="font-pixel text-xs text-yellow-300 bg-yellow-400/20 px-2 py-1 pixelated">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="font-pixel text-xs text-gray-400">
                            {isLoading === character.id ? 'SWITCHING...' : 'CLICK TO SWITCH'}
                          </span>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      {!isLocked && (
                        <div className="flex gap-2">
                           <Button
                             onClick={(e) => {
                               e?.stopPropagation();
                               handleEditAvatar(character);
                             }}
                             variant="secondary"
                             className="text-[10px] xs:text-xs sm:text-sm px-2 py-1 flex-1"
                             theme={character.theme}
                             style={{
                               background: 'linear-gradient(to bottom, #1F2937, #111827)',
                               borderColor: '#1F2937'
                             }}
                           >
                             EDIT AVATAR
                           </Button>
                           <Button
                             onClick={(e) => {
                               e?.stopPropagation();
                               setShowDeleteConfirm(character.id);
                             }}
                             variant="secondary"
                             className="text-xs px-2 py-1 navbar-button-icon"
                             theme={character.theme}
                             style={{
                               background: 'linear-gradient(to bottom, #1F2937, #111827)',
                               borderColor: '#1F2937'
                             }}
                           >
                             <Trash className="w-4 h-4" />
                           </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
            );
          })}

          {/* Fill remaining slots based on user's characterSlots */}
          {Array.from({ length: Math.max(0, user.characterSlots - characters.length) }, (_, index) => {
            const slotIndex = characters.length + index;
            const canCreate = slotIndex < user.characterSlots;
            
            return (
              <motion.div
                key={`slot-${slotIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: slotIndex * 0.1, duration: 0.5 }}
              >
                {/* Available slot - show create new */}
                <Card
                  hover
                  onClick={onCreateNew}
                  theme="obsidian-veil"
                  className="cursor-pointer transition-all duration-200 hover:border-green-500 border-dashed border-2 border-gray-600 h-full"
                >
                  <div 
                    className="flex items-center pt-4 mt-8"
                    style={{
                      gap: '1rem', // Horizontal gap between icon and text (16px)
                      padding: '1rem' // Card padding (16px)
                    }}
                  >
                    {/* Plus Icon - Left Side */}
                    <div 
                      className="flex-shrink-0 flex items-center justify-center"
                      style={{
                        width: '6rem', // Icon container width (96px)
                        height: '6rem' // Icon container height (96px)
                      }}
                    >
                      <div className="text-6xl text-gray-400">➕</div>
                    </div>
                    
                    {/* Create Info - Right Side */}
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-pixel text-lg text-white"
                        style={{
                          marginBottom: '0.25rem' // Space below "CREATE NEW" (4px)
                        }}
                      >
                        CREATE NEW
                      </h3>
                      <p 
                        className="font-pixel text-sm text-gray-300"
                        style={{
                          marginBottom: '0.75rem' // Space below "Start a new adventure" (12px)
                        }}
                      >
                        Start a new adventure
                      </p>
                      <div className="font-pixel text-xs text-green-400 bg-green-400/20 px-2 py-1 pixelated w-fit">
                        AVAILABLE
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {/* Always show purchase slot button after all character slots - Only for admin accounts */}
          {user.email && ADMIN_EMAILS.includes(user.email) && (
            <motion.div
              key="purchase-slot"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (characters.length + Math.max(0, user.characterSlots - characters.length)) * 0.1, duration: 0.5 }}
            >
              <Card
                hover
                onClick={handlePurchaseCharacterSlot}
                theme="obsidian-veil"
                className="cursor-pointer transition-all duration-200 hover:border-yellow-500 border-dashed border-2 border-yellow-600 h-full"
              >
                <div className="flex flex-col items-center justify-center pt-2 pb-2 p-6 text-center">
                  {/* Title at the top, centered */}
                  <h3 className="font-pixel text-3xl text-white mb-4 whitespace-nowrap">
                    EMBARK ON A NEW JOURNEY
                  </h3>
                  
                  {/* Plus icon */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-gray-800 flex items-center justify-center pixelated">
                      <div className="text-3xl text-yellow-400">➕</div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="font-pixel text-sm text-gray-300 mb-4 whitespace-nowrap">
                    Get a new character slot
                  </p>
                  
                  {/* Price */}
                  <p className="font-pixel text-yellow-400" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                    ${CHARACTER_SLOT_PRICE.toFixed(2)}
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Character Slots Info */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
           <Card theme={activeCharacter?.theme || 'obsidian-veil'} className="max-w-md mx-auto">
             <div className="p-4">
               <h3 className="font-pixel text-lg text-white mb-3">Character Slots</h3>
               <div className="flex items-center justify-between mb-4">
                 <div>
                   <p className="font-pixel text-gray-300 text-sm">Current Slots</p>
                   <p className="font-pixel text-white text-2xl">{user.characterSlots || 1}</p>
                 </div>
                 <div className="text-right">
                   <p className="font-pixel text-gray-300 text-sm">Add Slot</p>
                   <p className="font-pixel text-yellow-400 text-2xl">${CHARACTER_SLOT_PRICE.toFixed(2)}</p>
                 </div>
               </div>
               <p className="font-pixel text-white text-sm mb-3">
                 Characters: <span className="font-pixel">{characters.length}/{user.characterSlots}</span>
               </p>
               <Button 
                 onClick={handlePurchaseCharacterSlot}
                 disabled={isPurchasingSlot}
                 variant="primary" 
                 className="mt-3 text-lg px-6 py-2 w-full"
                 theme={activeCharacter?.theme || 'obsidian-veil'}
               >
                 {isPurchasingSlot ? 'Processing...' : 'Add Character Slot'}
               </Button>
             </div>
           </Card>
        </motion.div> */}
      </div>

      {/* Avatar Builder Modal */}
      {showAvatarBuilder && editingCharacter && (
        <LayeredAvatarBuilder
          onSave={handleAvatarSave}
          onCancel={handleAvatarCancel}
          currentAvatar={editingCharacter.avatar?.options?.layeredAvatar}
          theme={editingCharacter.theme}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="p-6 rounded-lg pixelated border-2 max-w-md w-full"
            style={{
              backgroundColor: themes[activeCharacter?.theme || 'obsidian-veil'].colors.background,
              borderColor: '#ef4444' // red-500 for danger
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-pixel text-lg mb-4 text-center text-red-400">
              ⚠️ DELETE CHARACTER
            </h3>
            
            <p className="font-pixel mb-6 text-center" style={{ color: themes[activeCharacter?.theme || 'obsidian-veil'].colors.text }}>
              Are you sure you want to delete this character? This action cannot be undone and will also delete all associated journal entries.
            </p>
            
             <div className="flex gap-3">
               <Button
                 onClick={() => setShowDeleteConfirm(null)}
                 variant="secondary"
                 className="flex-1"
                 theme="obsidian-veil"
                 disabled={isDeleting === showDeleteConfirm}
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
                 onClick={() => handleDeleteCharacter(showDeleteConfirm)}
                 variant="destructive"
                 className="flex-1"
                 theme="obsidian-veil"
                 disabled={isDeleting === showDeleteConfirm}
                 style={{
                   background: 'linear-gradient(to bottom, #ef4444, #dc2626)',
                   borderColor: '#dc2626',
                   color: '#FFFFFF',
                   boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                   textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8), -1px -1px 0px rgba(0, 0, 0, 0.8), 1px -1px 0px rgba(0, 0, 0, 0.8), -1px 1px 0px rgba(0, 0, 0, 0.8), 0px 1px 0px rgba(0, 0, 0, 0.8), 0px -1px 0px rgba(0, 0, 0, 0.8), 1px 0px 0px rgba(0, 0, 0, 0.8), -1px 0px 0px rgba(0, 0, 0, 0.8)'
                 }}
               >
                 {isDeleting === showDeleteConfirm ? 'DELETING...' : 'DELETE'}
               </Button>
             </div>
          </motion.div>
        </motion.div>
      )}

      {/* Character Switch Loading Overlay */}
      {isLoading && (
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
            Switching character...
          </p>
        </motion.div>
      )}

      {/* Character Delete Loading Overlay */}
      {isDeleting && (
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
            Deleting character...
          </p>
        </motion.div>
      )}
      </div>
      {/* <Footer /> */}
    </div>
  );
}
