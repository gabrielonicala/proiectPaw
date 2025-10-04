'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';
import MovingGradientBackground from './MovingGradientBackground';
import AppNavigation from './AppNavigation';
import { OutputType, User, Character, Theme } from '@/types';
import { generateReimaginedText, generateImage, generateImageSD, generateImageGemini, /* generateVideo, */ getPastContext } from '@/lib/client-utils';
import { fetchWithAutoLogout } from '@/lib/auto-logout';
import { migrateTheme } from '@/lib/theme-migration';
import { getImageProvider, getReferenceImages } from '@/lib/image-generation-config';
import { useDailyUsage } from '@/hooks/useDailyUsage';
import QuotaCountdown from './QuotaCountdown';
// import Footer from './Footer';

interface JournalEntryProps {
  user: User;
  activeCharacter: Character;
  onBack: () => void;
  onCalendarView: () => void;
  onProfileView: () => void;
  onTributeView: () => void;
  onCharacterSwitch: () => void;
  onAvatarChange: (avatar: { id: string; name: string; image: string }) => void;
  onThemeChange: (theme: Theme) => void;
  onModalOpen: () => void;
  onModalClose: () => void;
  onGeneratingStart: () => void;
  onGeneratingEnd: () => void;
}

// Import themes to get full theme details
import { themes } from '@/themes';

// Get reference images from configuration
const REFERENCE_IMAGES = getReferenceImages();

const outputTypes: { value: OutputType; label: string; emoji: string }[] = [
  { value: 'text', label: 'Chapter', emoji: '📖' },
  { value: 'image', label: 'Scene', emoji: '🖼️' },
  // { value: 'coming-soon', label: 'Episode', emoji: '🎬' } // Coming Soon placeholder - commented out for now
];

export default function JournalEntry({ 
  user, 
  activeCharacter, 
  onBack: _onBack, 
  onCalendarView, 
  onProfileView, 
  onTributeView, 
  onCharacterSwitch, 
  // onAvatarChange, 
  // onThemeChange, 
  onModalOpen, 
  onModalClose, 
  onGeneratingStart, 
  onGeneratingEnd 
}: JournalEntryProps) {
  const [entryText, setEntryText] = useState('');
  const [selectedOutput, setSelectedOutput] = useState<OutputType>('text');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageProvider, setImageProvider] = useState<string>('');
  const loadingSetupRef = useRef(false);

  // Daily usage data
  const { usageData, isLoading: usageLoading, refreshUsage } = useDailyUsage(activeCharacter?.id);

  // Modal state management
  useEffect(() => {
    if (generatedContent && !loadingSetupRef.current) {
      // Show modal for content policy violations but don't save to database
      if (generatedContent === 'CONTENT_POLICY_VIOLATION') {
        setShowModal(true);
        // Don't call onModalOpen() to prevent saving to database
        return;
      }
      
      if (selectedOutput === 'image') {
        console.log('Setting up image loading state');
        loadingSetupRef.current = true;
        setIsImageLoading(true);
        setShowModal(true);
        onModalOpen();
        
        // Fallback timeout for image loading
        const timeout = setTimeout(() => {
          console.log('Image load timeout - forcing ready state');
          setIsImageLoading(false);
        }, 5000); // 5 second timeout to account for the 500ms delay

        return () => {
          console.log('Cleaning up image loading timeout');
          clearTimeout(timeout);
        };
      } else {
        setShowModal(true);
        onModalOpen();
      }
    }
  }, [generatedContent, selectedOutput]);


  // Loading state management
  useEffect(() => {
    if (isGenerating || isImageLoading) {
      onGeneratingStart();
    } else {
      onGeneratingEnd();
    }
  }, [isGenerating, isImageLoading, onGeneratingStart, onGeneratingEnd]);

  // const getThemeBorderClass = (theme: string) => {
  //   const borderClasses = {
  //     'cyberpunk': 'border-2 border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/20',
  //     'melancholy': 'border-2 border-pink-400 bg-pink-400/10 shadow-lg shadow-pink-400/20',
  //     'dark-academia': 'border-2 border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/20',
  //     'shonen': 'border-2 border-orange-400 bg-orange-400/10 shadow-lg shadow-orange-400/20',
  //     'steampunk': 'border-2 border-yellow-600 bg-yellow-600/10 shadow-lg shadow-yellow-600/20',
  //     'fantasy': 'border-2 border-purple-400 bg-purple-400/10 shadow-lg shadow-purple-400/20'
  //   };
  //   return borderClasses[theme as keyof typeof borderClasses] || borderClasses.fantasy;
  // };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log('Image loaded successfully');
    console.log('Image URL:', generatedContent);
    console.log('Current isImageLoading state:', isImageLoading);
    
    const img = e.currentTarget;
    
    // Check if image is actually visible and has dimensions
    const checkImageReady = () => {
      if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
        console.log('Image fully rendered with dimensions:', img.naturalWidth, 'x', img.naturalHeight);
        setIsImageLoading(false);
        setImageError(false);
      } else {
        console.log('Image not fully ready, checking again...');
        // Check again in 100ms
        setTimeout(checkImageReady, 100);
      }
    };
    
    // Start checking after a small delay
    setTimeout(checkImageReady, 200);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log('Image failed to load');
    console.log('Error:', e);
    console.log('Image URL:', generatedContent);
    console.log('Current isImageLoading state:', isImageLoading);
    setIsImageLoading(false);
    setImageError(true);
  };

  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setGeneratedContent('');
      setEntryText('');
      setIsGenerating(false);
      setImageError(false);
      setShowModal(false);
      setIsImageLoading(false);
      setIsClosingModal(false);
      loadingSetupRef.current = false; // Reset the ref
      onModalClose();
    }, 500); // Animation duration
  };

  // VIDEO GENERATION COMMENTED OUT - TOO EXPENSIVE FOR NOW
  /*
  const handleVideoLoad = () => {
    setIsVideoLoading(false);
    setIsGenerating(false);
  };

  const handleVideoError = () => {
    setIsVideoLoading(false);
    setIsGenerating(false);
  };
  */

  const handleGenerate = async () => {
    if (!entryText.trim()) return;

    // Validate character limits
    const minLength = 80;
    const maxLength = selectedOutput === 'image' ? 300 : 500;
    
    if (entryText.length < minLength) {
      alert(`Please provide at least ${minLength} characters for a better ${selectedOutput === 'image' ? 'scene' : 'chapter'}.`);
      return;
    }
    
    if (entryText.length > maxLength) {
      alert(`Please keep your input under ${maxLength} characters for optimal ${selectedOutput === 'image' ? 'scene' : 'chapter'} generation.`);
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');
    setImageError(false);
    setShowModal(false);
    loadingSetupRef.current = false; // Reset the ref for new generation

    try {
      // Get past context for continuity
      const pastContext = await getPastContext(3);
      
      // Get full theme details for better story generation
      const migratedTheme = migrateTheme(activeCharacter.theme);
      const themeConfig = themes[migratedTheme];
      
      let content = '';
      
      switch (selectedOutput) {
        case 'text':
          content = await generateReimaginedText(entryText, themeConfig, pastContext, activeCharacter);
          break;
      case 'image':
        // Use configured image generation provider
        const provider = getImageProvider();
        if (provider === 'gemini') {
          console.log('🎨 Generating image with Google Gemini...');
          content = await generateImageGemini(entryText, themeConfig, activeCharacter);
          console.log('✅ Gemini image generation completed, URL:', content);
          setImageProvider('Google Gemini');
        } else if (provider === 'stable-diffusion') {
          // SD commented out to avoid wasting credits during testing
          // console.log('🎨 Generating image with Stable Diffusion + Reference Images...');
          // content = await generateImageSD(entryText, themeConfig, activeCharacter, REFERENCE_IMAGES);
          // console.log('✅ Stable Diffusion image generation completed, URL:', content);
          // console.log('📸 Reference images used:', REFERENCE_IMAGES);
          // setImageProvider('Stable Diffusion + Reference Images');
          throw new Error('Stable Diffusion temporarily disabled for testing');
        } else {
          // DALL-E commented out to avoid wasting credits during testing
          // console.log('🎨 Generating image with DALL-E...');
          // content = await generateImage(entryText, themeConfig, activeCharacter);
          // console.log('✅ DALL-E image generation completed, URL:', content);
          // setImageProvider('DALL-E');
          throw new Error('DALL-E temporarily disabled for testing');
        }
        break;
        case 'coming-soon':
          content = 'coming-soon-placeholder';
          // Skip loading spinner for coming-soon, show modal directly
          setGeneratedContent(content);
          setShowModal(true);
          setIsGenerating(false);
          return;
      }

      setGeneratedContent(content);
      setIsGenerating(false);

      // Don't save content policy violations to database
      if (content !== 'CONTENT_POLICY_VIOLATION') {
        // Save the entry to database
        const entryData = {
          originalText: entryText,
          reimaginedText: selectedOutput === 'text' ? content : undefined,
          imageUrl: selectedOutput === 'image' ? content : undefined,
          outputType: selectedOutput,
          characterId: activeCharacter.id,
        };

        try {
          const response = await fetchWithAutoLogout('/api/entries', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(entryData),
          });

          if (!response.ok) {
            throw new Error('Failed to save entry');
          }

          const { entry: savedEntry } = await response.json();
          
          // Entry created successfully
          // Note: Entry will be cached to localStorage when entries are next loaded
          // Refresh daily usage data
          refreshUsage();
        } catch (error) {
          console.error('Error saving entry:', error);
          // Note: Entry creation requires AI API calls and cannot work offline
          // The entry will need to be recreated when back online
        }
      }
    } catch (error) {
      console.error('Error generating content:', error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-4">
      {/* Pixel art background */}
      <MovingGradientBackground theme={migrateTheme(activeCharacter.theme) as Theme} />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Navigation Header */}
        <AppNavigation
          activeCharacter={activeCharacter}
          currentPage="journal"
          onCharacterSwitch={onCharacterSwitch}
          onCalendarView={onCalendarView}
          onProfileView={onProfileView}
          onTributeView={onTributeView}
          theme={migrateTheme(activeCharacter.theme) as Theme}
        />

        {/* Main Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-4"
        >
          <motion.h1 
            className="font-pixel text-3xl md:text-4xl text-white mb-2"
            animate={{
              textShadow: migrateTheme(activeCharacter.theme) === 'neon-ashes' 
                ? ["0 0 10px #00FFFF, 0 0 20px #00FFFF", "0 0 20px #00FFFF, 0 0 30px #00FFFF"]
                : migrateTheme(activeCharacter.theme) === 'blazeheart-saga'
                ? ["0 0 10px #FF6B35, 0 0 20px #FF6B35", "0 0 20px #FF6B35, 0 0 30px #FF6B35"]
                : ["0 0 10px #fff, 0 0 20px #fff", "0 0 20px #fff, 0 0 30px #fff"]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            JOURNAL ENTRY
          </motion.h1>
          <motion.p 
            className="font-pixel text-lg text-yellow-300"
            animate={migrateTheme(activeCharacter.theme) === 'echoes-of-dawn' ? { opacity: [0.7, 1, 0.7] } : {}}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Tell us about your day, {activeCharacter.name}
          </motion.p>
        </motion.div>

        {/* Main Content - Wide Desktop Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full"
        >
          <Card className="h-full rounded-xl" theme={migrateTheme(activeCharacter.theme) as Theme} effect="vintage">
            
            {/* Generated Content Modal */}
            {showModal && generatedContent ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4"
                onClick={handleCloseModal}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="bg-gray-900 p-6 rounded-lg pixelated border-2 border-gray-700 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="font-pixel text-base text-yellow-400 mb-6 text-center">
                    {selectedOutput === 'text' ? 'Today\'s adventure!' : 
                     selectedOutput === 'image' ? 'Today\'s adventure!' : 
                     'Animation Coming Soon!'}
                </h3>
                  
                  {selectedOutput === 'text' ? (
                    <div className="relative mb-3">
                      {/* Decorative border */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 rounded-lg opacity-75"></div>
                      <div className="relative bg-gray-900 border-2 border-yellow-400 rounded-lg p-4">
                        {/* Scrollable text area */}
                        <div className="text-yellow-100 leading-relaxed whitespace-pre-wrap text-sm max-h-96 overflow-y-auto font-serif">
                          <div className="flex items-center mb-3">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                            <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                            <span className="text-yellow-400 text-xs font-pixel tracking-wider">ADVENTURE LOG</span>
                          </div>
                          <div className="border-l-2 border-yellow-400 pl-4 ml-2">
                            {generatedContent}
                          </div>
                          <div className="flex justify-end mt-3">
                            <div className="text-yellow-400 text-xs font-pixel opacity-75">
                              ✦ END OF ENTRY ✦
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : selectedOutput === 'image' ? (
                    <div className="text-center mb-3">
                      {imageError ? (
                        <div className="w-full h-96 bg-gray-800 pixelated border-2 border-gray-600 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-2">⚠️</div>
                            <p className="text-red-400 text-sm font-pixel">Image failed to load</p>
                            <p className="text-gray-400 text-xs mt-1">Please try again</p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-96 bg-gray-800 pixelated border-2 border-gray-600 flex items-center justify-center">
                          {generatedContent === 'CONTENT_POLICY_VIOLATION' ? (
                            <div className="text-center p-6">
                              <div className="text-6xl mb-4">🚫</div>
                              <h3 className="font-pixel text-lg text-yellow-300 mb-2">
                                Content Policy Violation
                              </h3>
                              <p className="font-pixel text-sm text-gray-300 leading-relaxed">
                                This content cannot be visualized due to safety guidelines. Please try rephrasing your adventure in a more family-friendly way.
                              </p>
                            </div>
                          ) : (
                            <Image
                              src={generatedContent}
                              alt="Generated adventure scene"
                              width={350}
                              height={500}
                              className="w-full h-full object-cover pixelated"
                              onLoad={handleImageLoad}
                              onError={handleImageError}
                              priority
                              unoptimized
                            />
                          )}
                        </div>
                      )}
                      <div className="mt-2 px-2 py-1 text-xs text-white/90 font-pixel bg-black/30 rounded">
                          <div className="flex justify-between">
                            <span>Generated:</span>
                            <span>{new Date().toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Theme:</span>
                            <span>{themes[migrateTheme(activeCharacter.theme)]?.name || 'Adventure'.charAt(0).toUpperCase() + themes[migrateTheme(activeCharacter.theme)]?.name || 'Adventure'.slice(1)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Time:</span>
                            <span>{new Date().toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                  ) : selectedOutput === 'coming-soon' ? (
                    <div className="text-center mb-3">
                      <div className="text-3xl mb-2">🎬</div>
                      <p className="text-purple-200 mb-2 text-xs">
                        We&apos;re working on bringing you amazing animated adventures.
                      </p>
                      <div className="text-xs text-purple-300 font-pixel bg-black/30 rounded p-2">
                        <div className="flex justify-between mb-1">
                          <span>Status:</span>
                          <span className="text-yellow-400">In Development</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>ETA:</span>
                          <span className="text-yellow-400">Coming Soon</span>
                        </div>
                      </div>
                </div>
                  ) : null}
                  
                <Button
                    onClick={handleCloseModal}
                  variant="secondary"
                  size="sm"
                    theme={migrateTheme(activeCharacter.theme) as Theme}
                    className="w-full"
                >
                  Create Another Adventure
                </Button>
                </motion.div>
              </motion.div>
            ) : null}

            {/* Pixelated Brick Falling Animation */}
            {isClosingModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-[9998] overflow-hidden"
              >
                {/* Pixelated Bricks Falling */}
                <div className="absolute inset-0">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute pixelated"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: '-20px',
                        width: `${20 + Math.random() * 40}px`,
                        height: `${20 + Math.random() * 40}px`,
                        backgroundColor: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#B22222'][Math.floor(Math.random() * 5)],
                        border: '2px solid #654321',
                      }}
                      initial={{ y: -50, rotate: 0 }}
                      animate={{ 
                        y: window.innerHeight + 100,
                        rotate: 360,
                        scale: [1, 0.8, 1.2, 0.9, 1]
                      }}
                      transition={{
                        duration: 1.5 + Math.random() * 1,
                        delay: Math.random() * 0.5,
                        ease: "easeIn"
                      }}
                    />
                  ))}
                </div>
                
                {/* Pixelated Dust Effect */}
                <div className="absolute inset-0">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <motion.div
                      key={`dust-${i}`}
                      className="absolute pixelated"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: '4px',
                        height: '4px',
                        backgroundColor: '#D2B48C',
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        x: (Math.random() - 0.5) * 100,
                        y: (Math.random() - 0.5) * 100
                      }}
                      transition={{
                        duration: 0.8 + Math.random() * 0.4,
                        delay: Math.random() * 0.3,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </div>

                {/* Central Message */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.div
                    className="text-center pixelated bg-gray-900 p-6 border-4 border-yellow-400"
                    animate={{
                      boxShadow: [
                        "0 0 20px #FFD700",
                        "0 0 40px #FFD700", 
                        "0 0 20px #FFD700"
                      ]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 border-4 border-yellow-400 border-t-transparent pixelated mb-4 mx-auto"
                    />
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="font-pixel text-yellow-300 text-lg"
                    >
                      Building new adventure...
                    </motion.p>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* Main Form - Always Visible */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isClosingModal ? { 
                scale: [0.8, 1.1, 1], 
                opacity: [0, 0.3, 1],
                filter: ["blur(10px)", "blur(5px)", "blur(0px)"]
              } : { 
                scale: 1, 
                opacity: 1,
                filter: "blur(0px)"
              }}
              transition={{ 
                duration: 0.8, 
                ease: "easeOut",
                delay: isClosingModal ? 0.3 : 0
              }}
            >
                {/* Input Section with Visual Enhancement */}
                <div className="relative">
                  {/* Input Labels - What happened today? and Today's Quota */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex flex-col">
                      <h3 className="font-pixel text-yellow-400 text-xl">What happened today?</h3>
                      {usageData && !usageLoading && (
                        <div className="mt-2">
                          <div className="text-center">
                            <div className="flex justify-start text-sm gap-2">
                              <span className="font-pixel text-white">📖 <span>{usageData.usage.chapters.used}/{usageData.usage.chapters.limit || '?'}</span></span>
                              {usageData.limits.plan !== 'free' && (
                                <span className="font-pixel text-white">🖼️ <span>{usageData.usage.scenes.used}/{usageData.usage.scenes.limit || '?'}</span></span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {usageData && !usageLoading && (
                      <QuotaCountdown theme={migrateTheme(activeCharacter.theme)} />
                    )}
                  </div>
                  
                <div className="relative">
                <Input
                  value={entryText}
                  onChange={setEntryText}
                    placeholder={`Describe your day, your thoughts, or anything you'd like to transform into an adventure!
Hint: Rich details weave the most captivating tales.`}
                  type="textarea"
                  rows={8}
                  className="w-full"
                  theme={migrateTheme(activeCharacter.theme) as Theme}
                  maxLength={selectedOutput === 'image' ? 300 : 500}
                  minLength={80}
                  showCharCount={true}
                  charCountLabel="characters"
                />
                
                  {/* Decorative squares aligned with textarea corners */}
                  <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 pixelated"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 pixelated"></div>
                </div>
                </div>

                {/* Output Type Selection */}
                <div className="w-full">
                  <div className="relative p-3 bg-black/20 border border-white/10 pixelated rounded-lg w-full">
                    <div className="absolute top-1 right-1 text-purple-400 text-sm">✨</div>
                    <h3 className="font-pixel text-sm text-white mb-3 text-center">
                      <span className="mr-2">🎨</span>
                      What kind of adventure should {activeCharacter.name} go on?
                    </h3>
                    <div className="flex gap-2 w-full">
                    {outputTypes.map((output) => (
                      <Button
                        key={output.value}
                        onClick={() => setSelectedOutput(output.value)}
                        variant={selectedOutput === output.value ? 'accent' : 'secondary'}
                        size="sm"
                          theme={migrateTheme(activeCharacter.theme) as Theme}
                          className="text-sm py-2 flex-1"
                      >
                        {output.emoji} {output.label}
                      </Button>
                    ))}
                    </div>
                  </div>
                </div>


                {/* Create Adventure Button with Visual Flair */}
                <div className="relative">
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 pixelated"></div>
                <Button
                  onClick={handleGenerate}
                  disabled={
                    !entryText.trim() || 
                    isGenerating || 
                    entryText.length < 80 ||
                    (usageData ? (
                      (selectedOutput === 'text' && usageData.usage.chapters.remaining <= 0) ||
                      (selectedOutput === 'image' && usageData.usage.scenes.remaining <= 0)
                    ) : false)
                  }
                  variant="primary"
                  size="lg"
                    theme={migrateTheme(activeCharacter.theme) as Theme}
                    className="w-full text-base py-3 relative overflow-hidden"
                >
                    <span className="relative z-10 flex items-center justify-center">
                      <motion.span 
                        key={`${selectedOutput}-${isGenerating ? 'generating' : 'normal'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="transition-opacity duration-300 ease-in-out"
                      >
                        {isGenerating 
                          ? 'GENERATING...' 
                          : (usageData && (
                              (selectedOutput === 'text' && usageData.usage.chapters.remaining <= 0) ||
                              (selectedOutput === 'image' && usageData.usage.scenes.remaining <= 0)
                            ))
                          ? 'DAILY LIMIT REACHED'
                          : selectedOutput === 'text' ? 'WRITE CHAPTER' : 'PAINT SCENE'
                        }
                      </motion.span>
                    </span>
                    {!isGenerating && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse"></div>
                    )}
                </Button>
                </div>
              </motion.div>
          </Card>
        </motion.div>

        {/* Loading Overlay */}
        {(isGenerating || isImageLoading) && (
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
        {isGenerating ? (
          selectedOutput === 'text' ? 'Writing a chapter...' : 
          selectedOutput === 'image' ? 'Painting a scene...' :
          selectedOutput === 'coming-soon' ? 'Filming an episode...' :
          'Creating your adventure...'
        ) : (
          'Loading your scene...'
        )}
      </p>
          </motion.div>
        )}
      </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
