'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import { migrateTheme } from '@/lib/theme-migration';
import { Theme, Character, Avatar } from '@/types';
import { themes } from '@/themes';
import AssetAvatarSelector from './AssetAvatarSelector';
import LayeredAvatarBuilder from './LayeredAvatarBuilder';
import LayeredAvatarRenderer from './LayeredAvatarRenderer';
import { AssetAvatar } from '@/lib/asset-avatars';
import { fetchWithAutoLogout, shouldAutoLogout } from '@/lib/auto-logout';

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
  const [selectedTheme, setSelectedTheme] = useState<Theme>(currentTheme || 'blazeheart-saga');
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
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const existingCharacters = user.characters || [];
  const canCreateCharacter = existingCharacters.length < user.characterSlots;
  const visibleThemes = Object.values(themes).filter(theme => !theme.hidden);

  // Touch handling for swipe gestures
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const navigateToTheme = (newIndex: number) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentThemeIndex(newIndex);
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isTransitioning) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      navigateToTheme((currentThemeIndex + 1) % visibleThemes.length);
    }
    if (isRightSwipe) {
      navigateToTheme((currentThemeIndex - 1 + visibleThemes.length) % visibleThemes.length);
    }
  };
  
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
      const response = await fetchWithAutoLogout('/api/characters', {
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
        {/* <MovingGradientBackground theme="obsidian-veil" /> */}
        
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

  // Get the currently viewed theme for background (or selected theme if not in theme step)
  const currentViewTheme = step === 'theme' 
    ? (visibleThemes[currentThemeIndex]?.id || selectedTheme)
    : selectedTheme;
  
  // Get theme colors for background
  const migratedTheme = migrateTheme(currentViewTheme) as Theme;
  const themeConfig = themes[migratedTheme];
  const colors = themeConfig?.colors;

  return (
    <div 
      className="min-h-screen p-4 relative overflow-hidden"
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
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 opacity-30 pixelated"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: colors?.text || '#ffffff'
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      
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
              {step === 'theme' && (
                <>
                  <span className="md:hidden">Select your new world</span>
                  <span className="hidden md:inline">Select the world for your character</span>
                </>
              )}
              {step === 'avatar' && 'Choose how your character looks'}
              {step === 'details' && 'Bring your character to life'}
            </p>
          </div>
          <button 
            onClick={handleBack} 
            className="font-pixel text-white bg-transparent border-none cursor-pointer navbar-button hidden md:inline-block"
          >
            BACK
          </button>
          <button 
            onClick={handleBack} 
            className="font-pixel text-white bg-transparent border-none cursor-pointer navbar-button navbar-button-arrow inline-block md:hidden"
          >
            ←
          </button>
        </motion.div>

        {/* Step Content */}
        {step === 'theme' && (
          <div className="relative w-full max-w-6xl mx-auto mb-8 -mt-2">
            {/* Mobile Swipe Hint */}
            <div className="md:hidden text-center mb-2 px-2">
                <p className="text-sm font-pixel whitespace-nowrap" style={{ 
                  color: visibleThemes[currentThemeIndex]?.colors.accent,
                  textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000'
                }}>
                  ← Swipe to explore themes →
                </p>
            </div>

            {/* Navigation Arrows - Desktop only, positioned relative to fixed-height container */}
            <button
              onClick={() => navigateToTheme((currentThemeIndex - 1 + visibleThemes.length) % visibleThemes.length)}
              className="hidden md:flex absolute -left-3 top-[350px] transform -translate-y-1/2 z-10 w-10 h-10 rounded items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg text-white"
              style={{ 
                background: 'linear-gradient(to bottom, #1F2937, #111827)',
                border: '2px solid #1F2937'
              }}
            >
              <span className="text-2xl">←</span>
            </button>
            <button
              onClick={() => navigateToTheme((currentThemeIndex + 1) % visibleThemes.length)}
              className="hidden md:flex absolute -right-3 top-[350px] transform -translate-y-1/2 z-10 w-10 h-10 rounded items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg text-white"
              style={{ 
                background: 'linear-gradient(to bottom, #1F2937, #111827)',
                border: '2px solid #1F2937'
              }}
            >
              <span className="text-2xl">→</span>
            </button>

            {/* Carousel Container */}
            <div 
              className="overflow-hidden"
              ref={carouselRef}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="min-h-[700px] flex items-center justify-center">
                <motion.div
                  key={visibleThemes[currentThemeIndex]?.id}
                  className="w-full px-8 py-2 cursor-pointer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ 
                    opacity: 1,
                    scale: 1
                  }}
                  transition={{ 
                    duration: 0.3,
                    ease: "easeInOut"
                  }}
                  onClick={() => handleThemeSelect(visibleThemes[currentThemeIndex]?.id)}
                >
                  <Card
                    theme={visibleThemes[currentThemeIndex]?.id}
                    className="animate-gentle-pulse h-full modal-text-container"
                    style={{ background: 'linear-gradient(to bottom, #374151, #1F2937)' }}
                  >
                    <div className="p-4 md:p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <motion.div
                          className="w-16 h-16 pixelated border-2 flex-shrink-0"
                          style={{ 
                            background: `linear-gradient(135deg, ${visibleThemes[currentThemeIndex]?.colors.background} 0%, ${visibleThemes[currentThemeIndex]?.colors.primary} 50%, ${visibleThemes[currentThemeIndex]?.colors.secondary} 100%)`,
                            borderColor: visibleThemes[currentThemeIndex]?.colors.border
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 
                              className={`font-pixel ${visibleThemes[currentThemeIndex]?.id === 'starlit-horizon' ? 'text-base md:text-[1.25rem]' : 'text-lg md:text-[1.375rem]'}`}
                              style={{ color: visibleThemes[currentThemeIndex]?.colors.text }}
                            >
                              {visibleThemes[currentThemeIndex]?.name.split(' ').map((word, index, array) => (
                                <span key={index}>
                                  {word}
                                  {index < array.length - 1 && <span className="md:hidden"><br /></span>}
                                  {index < array.length - 1 && <span className="hidden md:inline"> </span>}
                                </span>
                              ))}
                            </h3>
                          </div>
                          <p className="font-pixel text-sm md:text-[0.9375rem] mb-3" style={{ color: visibleThemes[currentThemeIndex]?.colors.accent }}>
                            {visibleThemes[currentThemeIndex]?.archetype ? `The ${visibleThemes[currentThemeIndex]?.archetype.name}` : visibleThemes[currentThemeIndex]?.description}
                          </p>
                        </div>
                      </div>
                      <p className="theme-description-font leading-relaxed" style={{ color: '#F0F0F0', fontSize: '1.0625rem', letterSpacing: '0.15em' }}>
                        {visibleThemes[currentThemeIndex]?.detailedDescription}
                      </p>
                      <div className="mt-4">
                        {visibleThemes[currentThemeIndex]?.archetype ? (
                          <>
                            <h4 className="font-pixel text-base mb-3" style={{ color: visibleThemes[currentThemeIndex]?.colors.accent, fontSize: '0.9375rem' }}>
                              The {visibleThemes[currentThemeIndex]?.archetype.name}&apos;s traits:
                            </h4>
                            {Object.entries(visibleThemes[currentThemeIndex]?.archetype.stats || {}).map(([statName, statDescription], idx) => (
                              <div key={idx} className="mb-3 last:mb-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-pixel text-base" style={{ color: visibleThemes[currentThemeIndex]?.colors.accent, fontSize: '0.9375rem' }}>
                                    {idx + 1}.
                                  </span>
                                  <span className="font-pixel text-base" style={{ color: visibleThemes[currentThemeIndex]?.colors.text, fontSize: '0.9375rem' }}>
                                    {statName}
                                  </span>
                                </div>
                                <p className="theme-description-font leading-relaxed" style={{ color: '#F0F0F0', fontSize: '0.95rem', letterSpacing: '0.20em' }}>
                                  {statDescription}
                                </p>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {visibleThemes[currentThemeIndex]?.effects.slice(0, 3).map((effect, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-sm font-pixel rounded"
                                style={{ 
                                  backgroundColor: visibleThemes[currentThemeIndex]?.colors.secondary,
                                  color: visibleThemes[currentThemeIndex]?.colors.text
                                }}
                              >
                                {effect}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>

                {/* Dots Indicator */}
                {/* <div className="flex justify-center mt-3 space-x-2">
                  {visibleThemes.map((theme, index) => (
                    <button
                      key={index}
                      onClick={() => navigateToTheme(index)}
                      className={`w-[2px] h-[2px] sm:w-[18px] sm:h-[18px] md:w-[22px] md:h-[22px] rounded-full transition-all duration-300 ${
                        index === currentThemeIndex ? 'opacity-100 scale-125' : 'opacity-50'
                      }`}
                      style={{ 
                        background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.primary} 50%, ${theme.colors.secondary} 100%)`,
                        border: `1px solid ${theme.colors.border}`
                      }}
                    />
                  ))}
                </div> */}
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
                theme={selectedTheme}
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
                  <div className="flex justify-center items-center">
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
                  theme="obsidian-veil"
                  style={{
                    background: 'linear-gradient(to bottom, #6B7280, #4B5563)',
                    borderColor: '#6B7280',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8), -1px -1px 0px rgba(0, 0, 0, 0.8), 1px -1px 0px rgba(0, 0, 0, 0.8), -1px 1px 0px rgba(0, 0, 0, 0.8), 0px 1px 0px rgba(0, 0, 0, 0.8), 0px -1px 0px rgba(0, 0, 0, 0.8), 1px 0px 0px rgba(0, 0, 0, 0.8), -1px 0px 0px rgba(0, 0, 0, 0.8)'
                  }}
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
