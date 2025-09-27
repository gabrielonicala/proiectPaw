'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import LayeredAvatarRenderer from './LayeredAvatarRenderer';
import LayeredAvatarBuilder from './LayeredAvatarBuilder';
import AppNavigation from './AppNavigation';
import MovingGradientBackground from './MovingGradientBackground';
import { Character } from '@/types';
import { themes } from '@/themes';
import { migrateTheme } from '@/lib/theme-migration';

interface CharacterSelectorProps {
  characters: Character[];
  activeCharacter: Character | null;
  onCharacterSelect: (character: Character) => void;
  onCreateNew: () => void;
  onBack: () => void;
  onCharacterUpdate: (character: Character) => void;
  onCharacterDelete: (characterId: string) => void;
  user: {
    characterSlots: number;
  };
  // Triggered when user clicks upgrade; allows parent to show the Tribute view
  onUpgrade?: () => void;
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
  onUpgrade
}: CharacterSelectorProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showAvatarBuilder, setShowAvatarBuilder] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

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

    try {
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
    }
  };

  const handleAvatarCancel = () => {
    setShowAvatarBuilder(false);
    setEditingCharacter(null);
  };

  const handleEditName = (character: Character) => {
    setEditingName(character.id);
    setTempName(character.name);
  };

  const handleSaveName = async (characterId: string) => {
    if (!tempName.trim()) return;

    try {
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tempName.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to update character name');
      }

      const { character: updatedCharacter } = await response.json();
      onCharacterUpdate(updatedCharacter);
      setEditingName(null);
      setTempName('');
    } catch (error) {
      console.error('Error updating character name:', error);
    }
  };

  const handleCancelEditName = () => {
    setEditingName(null);
    setTempName('');
  };

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

  return (
    <div className="min-h-screen p-4">
      <MovingGradientBackground theme={activeCharacter?.theme || 'obsidian-veil'} />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <AppNavigation
          activeCharacter={activeCharacter || undefined}
          currentPage="character-select"
          onBack={onBack}
          theme={activeCharacter?.theme || 'obsidian-veil'}
        />

        {/* Character Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 auto-rows-fr">
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
                <div className="flex items-center gap-4 p-4 relative">
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
                            src={character.avatar.image}
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
                  <div className="flex-1 min-w-0">
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
                      <div className="flex items-center gap-2 mb-1">
                         <Input
                           value={tempName}
                           onChange={setTempName}
                           className="text-lg font-pixel"
                           theme={character.theme}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') {
                               handleSaveName(character.id);
                             } else if (e.key === 'Escape') {
                               handleCancelEditName();
                             }
                           }}
                           autoFocus
                         />
                         <Button
                           onClick={() => handleSaveName(character.id)}
                           variant="primary"
                           size="sm"
                           className="text-xs px-2 py-1"
                           theme={character.theme}
                         >
                           ✓
                         </Button>
                         <Button
                           onClick={handleCancelEditName}
                           variant="secondary"
                           size="sm"
                           className="text-xs px-2 py-1"
                           theme={character.theme}
                         >
                           ✗
                         </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-pixel text-lg text-white">
                          {character.name}
                        </h3>
                         <Button
                           onClick={(e) => {
                             e?.stopPropagation();
                             handleEditName(character);
                           }}
                           variant="secondary"
                           size="sm"
                           className="text-xs px-1 py-1 opacity-60 hover:opacity-100"
                           theme={character.theme}
                         >
                           ✏️
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
                           >
                             EDIT AVATAR
                           </Button>
                           <Button
                             onClick={(e) => {
                               e?.stopPropagation();
                               setShowDeleteConfirm(character.id);
                             }}
                             variant="secondary"
                             className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white"
                             theme={character.theme}
                           >
                             🗑️
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

          {/* Create New Character Card */}
          {canCreateNew && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: characters.length * 0.1, duration: 0.5 }}
            >
               <Card
                 hover
                 onClick={onCreateNew}
                 theme="obsidian-veil"
                 className="cursor-pointer transition-all duration-200 hover:border-green-500 border-dashed border-2 border-gray-600 h-full"
               >
                <div className="flex items-center gap-4 p-4">
                  {/* Plus Icon - Left Side */}
                  <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center">
                    <div className="text-6xl text-gray-400">➕</div>
                  </div>
                  
                  {/* Create Info - Right Side */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-pixel text-lg text-white mb-1">
                      CREATE NEW
                    </h3>
                    <p className="font-pixel text-sm text-gray-300 mb-3">
                      Start a new adventure
                    </p>
                    <div className="font-pixel text-xs text-green-400 bg-green-400/20 px-2 py-1 pixelated w-fit">
                      AVAILABLE
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Additional Create New Slots */}
          {Array.from({ length: Math.max(0, user.characterSlots - characters.length - 1) }, (_, index) => (
            <motion.div
              key={`locked-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (characters.length + index) * 0.1, duration: 0.5 }}
            >
               <Card
                 hover
                 onClick={onCreateNew}
                 theme="obsidian-veil"
                 className="cursor-pointer transition-all duration-200 hover:border-green-500 border-dashed border-2 border-gray-600 h-full"
               >
                <div className="flex items-center gap-4 p-4">
                  {/* Plus Icon - Left Side */}
                  <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center">
                    <div className="text-6xl text-gray-400">➕</div>
                  </div>
                  
                  {/* Create Info - Right Side */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-pixel text-lg text-white mb-1">
                      CREATE NEW
                    </h3>
                    <p className="font-pixel text-sm text-gray-300 mb-3">
                      Start a new adventure
                    </p>
                    <div className="font-pixel text-xs text-green-400 bg-green-400/20 px-2 py-1 pixelated w-fit">
                      AVAILABLE
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {/* Locked Character Slots (for users with less than 3 slots) */}
          {Array.from({ length: Math.max(0, 3 - user.characterSlots) }, (_, index) => (
            <motion.div
              key={`locked-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (characters.length + Math.max(0, user.characterSlots - characters.length - 1) + index) * 0.1, duration: 0.5 }}
            >
               <Card 
                 theme="obsidian-veil" 
                 className="border-2 border-gray-600 bg-gray-800/50 opacity-60 cursor-not-allowed h-full"
               >
                <div className="flex items-center gap-4 p-4">
                  {/* Locked Icon - Left Side */}
                  <div className="flex-shrink-0 w-32 h-40 flex items-center justify-center">
                    <div className="text-6xl text-gray-400 bg-gray-800 pixelated w-full h-full flex items-center justify-center">
                      🔒
                    </div>
                  </div>
                  
                  {/* Locked Info - Right Side */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-pixel text-lg text-gray-400 mb-1">
                      LOCKED SLOT
                    </h3>
                    <p className="font-pixel text-sm text-gray-500 mb-3">
                      Upgrade to unlock
                    </p>
                    <div className="font-pixel text-xs text-gray-500 bg-gray-600/20 px-2 py-1 pixelated w-fit">
                      LOCKED
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Character Slots Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
           <Card theme={activeCharacter?.theme || 'obsidian-veil'} className="max-w-md mx-auto">
             <p className="font-pixel text-white">
               Characters: <span className="font-pixel">{characters.length}/{user.characterSlots}</span>
             </p>
             {user.characterSlots < 3 && (
               <div className="mt-2">
                 <p className="font-pixel text-sm text-yellow-300">
                   Unlock all character slots<br />
                   and more with a weekly tribute!
                 </p>
                <Button 
                  onClick={() => {
                    if (typeof onUpgrade === 'function') {
                      onUpgrade();
                    } else {
                      console.error('onUpgrade callback not provided');
                    }
                  }} 
                  variant="primary" 
                  className="mt-3 text-lg px-6 py-2 w-full"
                  theme={activeCharacter?.theme || 'obsidian-veil'}
                >
                  PLEDGE ALLEGIANCE
                </Button>
               </div>
             )}
           </Card>
        </motion.div>
      </div>

      {/* Avatar Builder Modal */}
      {showAvatarBuilder && editingCharacter && (
        <LayeredAvatarBuilder
          onSave={handleAvatarSave}
          onCancel={handleAvatarCancel}
          currentAvatar={editingCharacter.avatar?.options?.layeredAvatar}
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
              borderColor: themes[activeCharacter?.theme || 'obsidian-veil'].colors.accent
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-pixel text-lg mb-4 text-center" style={{ color: themes[activeCharacter?.theme || 'obsidian-veil'].colors.accent }}>
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
                 theme={activeCharacter?.theme || 'obsidian-veil'}
               >
                 CANCEL
               </Button>
               <Button
                 onClick={() => handleDeleteCharacter(showDeleteConfirm)}
                 variant="primary"
                 className="flex-1"
                 theme={activeCharacter?.theme || 'obsidian-veil'}
               >
                 DELETE
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
  );
}
