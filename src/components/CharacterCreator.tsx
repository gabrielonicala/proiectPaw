'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import MovingGradientBackground from './MovingGradientBackground';
import { Theme, Character, Avatar } from '@/types';
import { themes } from '@/themes';
import AssetAvatarSelector from './AssetAvatarSelector';
import LayeredAvatarBuilder from './LayeredAvatarBuilder';
import LayeredAvatarRenderer from './LayeredAvatarRenderer';
import { AssetAvatar } from '@/lib/asset-avatars';

interface CharacterCreatorProps {
  user: {
    id: string;
    characterSlots: number;
    characters?: Character[];
  };
  onCharacterCreate: (character: Character) => void;
  onBack: () => void;
  currentTheme?: Theme;
  onUpgrade?: () => void;
}

export default function CharacterCreator({ user, onCharacterCreate, onBack, currentTheme, onUpgrade }: CharacterCreatorProps) {
  const [step, setStep] = useState<'theme' | 'avatar' | 'details'>('theme');
  const [selectedTheme, setSelectedTheme] = useState<Theme>(currentTheme || 'velour-nights');
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [characterName, setCharacterName] = useState('');
  // Bio feature temporarily disabled
  // const [characterDescription, setCharacterDescription] = useState('');
  const [appearance, setAppearance] = useState<'masculine' | 'feminine' | 'androgynous'>('androgynous');
  const [pronouns, setPronouns] = useState<'he/him' | 'she/her' | 'they/them' | 'custom'>('they/them');
  const [customSubjectPronoun, setCustomSubjectPronoun] = useState('');
  const [customObjectPronoun, setCustomObjectPronoun] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLayeredAvatarBuilder, setShowLayeredAvatarBuilder] = useState(true);

  const existingCharacters = user.characters || [];
  const canCreateCharacter = existingCharacters.length < user.characterSlots;
  
  // Don't show the "slots full" screen if we're in the middle of creating a character
  const isCreatingCharacter = step !== 'theme';

  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    setStep('avatar');
  };

  const handleAvatarSelect = (assetAvatar: AssetAvatar) => {
    // Convert AssetAvatar to Avatar format
    const avatar: Avatar = {
      id: assetAvatar.id,
      name: assetAvatar.name,
      image: '👤',
      pixelArt: undefined,
      color: '#FF6B35',
      accessories: [],
      description: assetAvatar.description,
      race: assetAvatar.race,
      class: assetAvatar.class,
      stats: assetAvatar.stats,
      options: {
        imagePath: assetAvatar.imagePath,
        category: assetAvatar.category,
        type: assetAvatar.type
      }
    };
    
    setSelectedAvatar(avatar);
    setStep('details');
  };

  const handleLayeredAvatarSelect = (layeredAvatar: { head: { id: string; name: string; imagePath: string; category: 'head' | 'torso' | 'legs'; gender: 'male' | 'female' | 'unisex'; description: string }; torso: { id: string; name: string; imagePath: string; category: 'head' | 'torso' | 'legs'; gender: 'male' | 'female' | 'unisex'; description: string }; legs: { id: string; name: string; imagePath: string; category: 'head' | 'torso' | 'legs'; gender: 'male' | 'female' | 'unisex'; description: string }; id: string; name: string }) => {
    // Convert LayeredAvatar to Avatar format
    const avatar: Avatar = {
      id: layeredAvatar.id,
      name: layeredAvatar.name,
      image: '👤',
      pixelArt: undefined,
      color: '#FF6B35',
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
        layeredAvatar: layeredAvatar
      }
    };
    
    setSelectedAvatar(avatar);
    setShowLayeredAvatarBuilder(false);
    setStep('details');
  };

  const handleCreateCharacter = async () => {
    if (!characterName.trim() || !selectedAvatar) return;
    
    // Validate custom pronouns if selected
    if (pronouns === 'custom' && (!customSubjectPronoun.trim() || !customObjectPronoun.trim())) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: characterName.trim(),
          description: undefined, // Bio feature temporarily disabled
          theme: selectedTheme,
          avatar: selectedAvatar,
          appearance: appearance,
          pronouns: pronouns,
          customPronouns: pronouns === 'custom' ? `${customSubjectPronoun.trim()}/${customObjectPronoun.trim()}` : undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create character');
      }

      const { character } = await response.json();
      onCharacterCreate(character);
    } catch (error) {
      console.error('Error creating character:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'theme') {
      onBack();
    } else if (step === 'avatar') {
      setStep('theme');
    } else if (step === 'details') {
      setStep('avatar');
    }
  };

  if (!canCreateCharacter && !isCreatingCharacter) {
    return (
      <div className="min-h-screen p-4">
        <MovingGradientBackground theme="obsidian-veil" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="font-pixel text-4xl text-white mb-4">
              CHARACTER SLOTS FULL
            </h1>
            <p className="font-pixel text-lg text-yellow-300 mb-8">
              You&apos;ve reached your character limit ({user.characterSlots} slots)
            </p>
            <Card theme="obsidian-veil" className="max-w-md mx-auto">
              <p className="font-pixel text-white mb-4">
                You&apos;ve reached your character limit ({user.characterSlots} slots)
              </p>
              <p className="font-pixel text-sm text-yellow-300 mb-4">
                Upgrade to Tribute plan to unlock 3 character slots and experience different themes!
              </p>
              <div className="flex gap-2">
                <Button onClick={onBack} variant="secondary" theme="obsidian-veil">
                  BACK TO JOURNAL
                </Button>
                <Button 
                  onClick={() => {
                    if (typeof onUpgrade === 'function') {
                      onUpgrade();
                    } else {
                      console.error('onUpgrade callback not provided');
                    }
                  }} 
                  variant="primary" 
                  theme="obsidian-veil"
                >
                  UPGRADE NOW
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <MovingGradientBackground theme={selectedTheme} />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="font-pixel text-3xl md:text-4xl text-white mb-2">
              {step === 'theme' && 'CHOOSE YOUR THEME'}
              {step === 'avatar' && 'SELECT YOUR AVATAR'}
              {step === 'details' && 'CHARACTER DETAILS'}
            </h1>
            <p className="font-pixel text-lg text-yellow-300">
              {step === 'theme' && 'Select the world for your character'}
              {step === 'avatar' && 'Choose how your character looks'}
              {step === 'details' && 'Bring your character to life'}
            </p>
          </div>
          <Button onClick={handleBack} variant="secondary" theme={selectedTheme}>
            BACK
          </Button>
        </motion.div>

        {/* Step Content */}
        {step === 'theme' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {Object.values(themes).map((theme, index) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card
                  hover
                  onClick={() => handleThemeSelect(theme.id)}
                  theme={theme.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedTheme === theme.id ? 'animate-gentle-pulse' : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <motion.div
                        className="w-16 h-16 pixelated border-2 flex-shrink-0"
                        style={{ 
                          background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.primary} 50%, ${theme.colors.secondary} 100%)`,
                          borderColor: theme.colors.border
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{theme.emoji}</span>
                          <h3 className="font-pixel text-xl" style={{ color: theme.colors.text }}>
                            {theme.name}
                          </h3>
                        </div>
                        <p className="font-pixel text-sm mb-3" style={{ color: theme.colors.accent }}>
                          {theme.description}
                        </p>
                      </div>
                    </div>
                    <p className="font-pixel text-sm leading-relaxed" style={{ color: theme.colors.text }}>
                      {theme.detailedDescription}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {theme.effects.slice(0, 3).map((effect, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs font-pixel rounded"
                          style={{ 
                            backgroundColor: theme.colors.secondary,
                            color: theme.colors.text
                          }}
                        >
                          {effect}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {step === 'avatar' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-pixel text-2xl text-white mb-4">
                Create Your Unique Avatar
              </h2>
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={() => setShowLayeredAvatarBuilder(true)}
                  variant="primary"
                  theme={selectedTheme}
                >
                  🎨 CUSTOM BUILDER
                </Button>
                {/* Predefined avatar selector temporarily disabled */}
                {/* <Button 
                  onClick={() => setShowLayeredAvatarBuilder(false)}
                  variant={!showLayeredAvatarBuilder ? "primary" : "secondary"}
                  theme={selectedTheme}
                >
                  📦 PREDEFINED
                </Button> */}
              </div>
            </div>

            {/* Predefined avatar selector temporarily disabled */}
            {/* {!showLayeredAvatarBuilder ? (
              <AssetAvatarSelector
                onSelect={handleAvatarSelect}
                onCancel={() => setShowLayeredAvatarBuilder(true)}
                theme={selectedTheme}
              />
            ) : ( */}
              <LayeredAvatarBuilder
                onSave={handleLayeredAvatarSelect}
                onCancel={() => setStep('theme')}
              />
            {/* )} */}
          </div>
        )}

        {step === 'details' && selectedAvatar && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <Card theme={selectedTheme}>
              <div className="space-y-6">
                {/* Character Preview */}
                <div className="text-center">
                  <h2 className="font-pixel text-2xl text-white mb-4">
                    Character Preview
                  </h2>
                  <div className="flex justify-center items-center gap-6">
                    {selectedAvatar?.options?.layeredAvatar ? (
                      <LayeredAvatarRenderer
                        layeredAvatar={selectedAvatar.options.layeredAvatar}
                        size="lg"
                        className="pixelated"
                      />
                    ) : (
                      <div
                        className="w-24 h-24 pixelated"
                        style={{ 
                          background: `linear-gradient(135deg, ${themes[selectedTheme].colors.background} 0%, ${themes[selectedTheme].colors.primary} 50%, ${themes[selectedTheme].colors.secondary} 100%)`
                        }}
                      />
                    )}
                    <div className="text-left">
                      <p className="font-pixel" style={{ color: themes[selectedTheme].colors.text }}>
                        <span style={{ color: themes[selectedTheme].colors.accent }}>Theme:</span> {themes[selectedTheme].name}
                      </p>
                      <p className="font-pixel" style={{ color: themes[selectedTheme].colors.text }}>
                        <span style={{ color: themes[selectedTheme].colors.accent }}>Avatar:</span> Custom Character
                      </p>
                    </div>
                  </div>
                </div>

                {/* Character Details Form */}
                <div className="space-y-4">
                  <div>
                    <label className="font-pixel text-white block mb-2">
                      Character Name *
                    </label>
                    <input
                      type="text"
                      value={characterName}
                      onChange={(e) => setCharacterName(e.target.value)}
                      placeholder="Enter character name..."
                      className="w-full p-3 border-2 font-pixel pixelated focus:outline-none"
                      style={{
                        backgroundColor: themes[selectedTheme].colors.background,
                        borderColor: themes[selectedTheme].colors.border,
                        color: themes[selectedTheme].colors.text
                      }}
                      maxLength={50}
                    />
                  </div>

                  {/* Bio feature temporarily disabled */}
                  {/* <div>
                    <label className="font-pixel text-white block mb-2">
                      Character Description (Optional)
                    </label>
                    <textarea
                      value={characterDescription}
                      onChange={(e) => setCharacterDescription(e.target.value)}
                      placeholder="Tell us about your character's backstory, personality, or goals..."
                      className="w-full p-3 border-2 font-pixel pixelated focus:outline-none h-24 resize-none"
                      style={{
                        backgroundColor: themes[selectedTheme].colors.background,
                        borderColor: themes[selectedTheme].colors.border,
                        color: themes[selectedTheme].colors.text
                      }}
                      maxLength={500}
                    />
                    <p className="font-pixel text-xs text-gray-400 mt-1">
                      {characterDescription.length}/500 characters
                    </p>
                  </div> */}

                  {/* Appearance Selection */}
                  <div>
                    <label className="font-pixel text-white block mb-2">
                      Character Appearance
                    </label>
                    <div className="flex gap-3">
                      {(['masculine', 'feminine', 'androgynous'] as const).map((option) => (
                        <button
                          key={option}
                          onClick={() => setAppearance(option)}
                          className="flex-1 p-2 border-2 font-pixel pixelated transition-all duration-200 text-sm"
                          style={{
                            borderColor: appearance === option ? themes[selectedTheme].colors.accent : themes[selectedTheme].colors.border,
                            backgroundColor: appearance === option ? themes[selectedTheme].colors.accent + '20' : themes[selectedTheme].colors.background,
                            color: appearance === option ? themes[selectedTheme].colors.accent : themes[selectedTheme].colors.text
                          }}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pronouns Selection */}
                  <div>
                    <label className="font-pixel text-white block mb-2">
                      Character Pronouns
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['he/him', 'she/her', 'they/them', 'custom'] as const).map((option) => (
                        <button
                          key={option}
                          onClick={() => setPronouns(option)}
                          className="p-3 border-2 font-pixel pixelated transition-all duration-200"
                          style={{
                            borderColor: pronouns === option ? themes[selectedTheme].colors.accent : themes[selectedTheme].colors.border,
                            backgroundColor: pronouns === option ? themes[selectedTheme].colors.accent + '20' : themes[selectedTheme].colors.background,
                            color: pronouns === option ? themes[selectedTheme].colors.accent : themes[selectedTheme].colors.text
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Pronouns Input */}
                  {pronouns === 'custom' && (
                    <div>
                      <label className="font-pixel text-white block mb-2">
                        Custom Pronouns
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customSubjectPronoun}
                          onChange={(e) => setCustomSubjectPronoun(e.target.value)}
                          placeholder="xe"
                          className="flex-1 p-3 border-2 font-pixel pixelated focus:outline-none"
                          style={{
                            backgroundColor: themes[selectedTheme].colors.background,
                            borderColor: themes[selectedTheme].colors.border,
                            color: themes[selectedTheme].colors.text
                          }}
                          maxLength={20}
                        />
                        <span className="font-pixel text-lg" style={{ color: themes[selectedTheme].colors.text }}>/</span>
                        <input
                          type="text"
                          value={customObjectPronoun}
                          onChange={(e) => setCustomObjectPronoun(e.target.value)}
                          placeholder="xem"
                          className="flex-1 p-3 border-2 font-pixel pixelated focus:outline-none"
                          style={{
                            backgroundColor: themes[selectedTheme].colors.background,
                            borderColor: themes[selectedTheme].colors.border,
                            color: themes[selectedTheme].colors.text
                          }}
                          maxLength={20}
                        />
                      </div>
                      <p className="font-pixel text-xs text-gray-400 mt-1">
                        Format: subject/object (e.g., xe/xem, ze/zir, fae/faer)
                      </p>
                    </div>
                  )}
                </div>

                {/* Create Button */}
                <Button
                  onClick={handleCreateCharacter}
                  disabled={!characterName.trim() || isLoading || (pronouns === 'custom' && (!customSubjectPronoun.trim() || !customObjectPronoun.trim()))}
                  variant="primary"
                  className="w-full py-3"
                  theme={selectedTheme}
                >
                  {isLoading ? 'CREATING...' : 'CREATE CHARACTER'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
