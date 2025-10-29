'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Button from './ui/Button';
import Card from './ui/Card';
import { JournalEntry, User } from '@/types';
import { format } from 'date-fns';
import { themes } from '@/themes';

interface UnifiedEntryModalProps {
  entry: JournalEntry | null;
  user: User;
  activeCharacter: User['activeCharacter'];
  isOpen: boolean;
  onClose: () => void;
  // For JournalEntry usage - when we don't have a full entry yet
  generatedContent?: string;
  outputType?: 'text' | 'image' | 'coming-soon';
  originalText?: string;
  imageError?: boolean;
  onImageLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onImageError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export default function UnifiedEntryModal({ 
  entry, 
  user, 
  activeCharacter, 
  isOpen, 
  onClose,
  generatedContent,
  outputType,
  originalText,
  imageError,
  onImageLoad,
  onImageError
}: UnifiedEntryModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  // Chapter numbering intentionally removed per request; keep section label generic

  // Determine if we're using entry data or generated content
  const isUsingGeneratedContent = !entry && generatedContent;
  const currentOutputType = entry?.outputType || outputType || 'text';
  const currentContent = entry?.reimaginedText || entry?.imageUrl || generatedContent || '';
  const currentOriginalText = entry?.originalText || originalText || '';

  // Check if content is loaded
  const isContentReady = isUsingGeneratedContent ? 
    (currentOutputType === 'text' && currentContent) || 
    (currentOutputType === 'image' && currentContent && isImageLoaded) || 
    (currentOutputType === 'coming-soon') :
    entry ? ((entry.outputType === 'text' && entry.reimaginedText) || 
             (entry.outputType === 'image' && entry.imageUrl && isImageLoaded) || 
             (entry.outputType === 'coming-soon')) : false;

  // Handle image loading
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsImageLoaded(true);
    onImageLoad?.(e);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    onImageError?.(e);
  };

  // Reset image loading state when entry changes
  useEffect(() => {
    setIsImageLoaded(false);
    setIsContentLoading(true);
  }, [entry?.id, generatedContent]);

  // Simulate loading time for better UX
  useEffect(() => {
    if (isContentReady) {
      const timer = setTimeout(() => setIsContentLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isContentReady]);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!entry && !generatedContent) return null;

  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Download functions
  const downloadMediaOnly = async (entry: JournalEntry) => {
    if (!entry.imageUrl) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(entry.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `adventure-${entry.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadFullEntry = async (entry: JournalEntry) => {
    setIsDownloading(true);
    try {
      const content = `The Inspiration: ${entry.originalText}\n\nThe Chapter: ${entry.reimaginedText || 'Image entry'}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `adventure-${entry.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // For image entries, use the simple modal style
  if (currentOutputType === 'image') {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 p-6 rounded-lg pixelated border-2 border-gray-700 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-pixel text-base text-yellow-400 mb-6 text-center">
                Today&apos;s adventure!
              </h3>
              
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
                    {currentContent === 'CONTENT_POLICY_VIOLATION' ? (
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
                        src={currentContent}
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
                    <span>Painted:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Theme:</span>
                    <span>{themes[migrateTheme(activeCharacter?.theme || 'obsidian-veil')]?.name || 'Adventure'}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                {entry && entry.imageUrl && (
                  <Button
                    onClick={() => downloadMediaOnly(entry)}
                    disabled={isDownloading}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-pixel px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    {isDownloading ? '⏳' : '🖼️'} Download
                  </Button>
                )}
                
                <Button
                  onClick={onClose}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-pixel px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // For text entries, use the detailed modal style (like EntryDetailModal)
  const resolvedTheme = migrateTheme(activeCharacter?.theme || 'obsidian-veil');
  const isTreasureTides = resolvedTheme === 'crimson-tides';
  const adventureBgClass = isTreasureTides
    ? 'bg-[#0B1533]/95'
    : 'bg-gradient-to-b from-yellow-900/20 to-orange-900/20';
  const originalBgClass = isTreasureTides ? 'bg-[#0B1533]/95' : 'bg-gray-800/50';
  const statsBgClass = isTreasureTides ? 'bg-[#0B1533]/95' : 'bg-gradient-to-b from-green-900/20 to-blue-900/20';
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-2 pt-8 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-6xl max-h-[90vh] lg:max-h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Card theme={activeCharacter?.theme || 'obsidian-veil'} effect="glow" className="relative px-2 py-4">
              {/* Loading overlay */}
              {isContentLoading && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                    <p className="font-pixel text-yellow-400">Loading your adventure...</p>
                  </div>
                </div>
              )}


              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="font-pixel text-lg lg:text-base text-white mb-3">The Inspiration:</h3>
                <Card theme={activeCharacter?.theme || 'obsidian-veil'} effect="vintage" className={`overflow-y-auto lg:max-h-80`} style={isTreasureTides ? { background: '#0B1533F2' } : {}}>
                  <p className="text-gray-200 lg:text-sm leading-relaxed">{currentOriginalText}</p>
                </Card>
              </motion.div>

              {/* Generated Content and Stat Progression */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start mt-4">
                {/* Adventure Content */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-2 lg:flex lg:flex-col lg:h-full"
                >
                  <h3 className="font-pixel text-lg lg:text-base text-white mb-3 lg:mb-2">The Chapter:</h3>
                  <Card theme={activeCharacter?.theme || 'obsidian-veil'} effect="glow" className={`lg:flex-1 lg:max-h-80 lg:overflow-y-auto`} style={isTreasureTides ? { background: '#0B1533F2' } : {}}>
                    {currentOutputType === 'text' && currentContent && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-white leading-relaxed lg:text-sm lg:pr-2"
                      >
                        {currentContent}
                      </motion.div>
                    )}
                    {currentOutputType === 'coming-soon' && (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">🎬</div>
                        <h3 className="font-pixel text-lg text-purple-300 mb-2">Coming Soon!</h3>
                        <p className="text-gray-300 text-sm">
                          We&apos;re working on bringing you amazing animated adventures.
                        </p>
                      </div>
                    )}
                  </Card>
                </motion.div>

                {/* Stat Progression - only show if we have stat analysis */}
                {entry?.statAnalysis && entry?.outputType === 'text' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-1 lg:flex lg:flex-col lg:h-full"
                  >
                    <h3 className="font-pixel text-lg lg:text-base text-white mb-3 lg:mb-2">📊 Character Growth:</h3>
                    <Card theme={activeCharacter?.theme || 'obsidian-veil'} effect="glow" className={`lg:flex-1 lg:flex lg:flex-col lg:max-h-80`} style={isTreasureTides ? { background: '#0B1533F2' } : {}}>
                      <div className="space-y-3 lg:space-y-2 lg:flex-1 lg:overflow-y-auto lg:pr-2">
                        {Object.entries(JSON.parse(entry.statAnalysis))
                          .filter(([_, change]: [string, any]) => change.change !== 0)
                          .map(([statName, change]: [string, any]) => (
                          <div
                            key={statName}
                            className={`p-3 lg:p-2 rounded-lg border-2 ${
                              change.change > 0
                                ? 'bg-green-600/20 border-green-500/50'
                                : change.change < 0
                                  ? 'bg-red-600/20 border-red-500/50'
                                  : 'bg-gray-600/20 border-gray-500/50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-pixel text-lg text-white">{statName}</span>
                              <span className={`font-pixel text-xl font-bold ${
                                change.change > 0 ? 'text-green-300' : change.change < 0 ? 'text-red-300' : 'text-gray-300'
                              }`}>
                                {change.change > 0 ? '+' : ''}{change.change}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 mb-1">{change.reason}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">Confidence:</span>
                              <span className="text-xs text-blue-300 font-pixel">
                                {Math.round(change.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        ))}
                        {entry.expGained && (
                          <div className="mt-4 p-3 bg-blue-600/20 border-2 border-blue-500/50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-pixel text-lg text-white">Exp. Gained</span>
                              <span className="font-pixel text-xl font-bold text-blue-300">
                                +{entry.expGained} EXP
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Past Context - only show for saved entries */}
              {entry?.pastContext && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6"
                >
                  <h3 className="font-pixel text-lg text-white mb-3">Past Context:</h3>
                  <Card theme={activeCharacter?.theme || 'obsidian-veil'} effect="vintage" className="bg-gray-800/30">
                    <p className="text-gray-300 text-sm leading-relaxed">{entry.pastContext}</p>
                  </Card>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center mt-4">
                <div className="flex-1 flex justify-start">
                  {currentOutputType === 'text' && currentContent && (
                    <Button
                      onClick={() => copyToClipboard(currentContent)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-pixel px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                    >
                      Copy Chapter
                    </Button>
                  )}
                </div>
                
                {/* Copy toast - truly centered */}
                <div className="flex-1 flex justify-center">
                  {showCopyToast && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-green-600 text-white px-2 py-1 rounded-lg font-pixel text-[4px] md:text-sm md:px-4 md:py-2"
                    >
                      <span className="md:hidden">Copied!</span>
                      <span className="hidden md:inline">Copied to clipboard!</span>
                    </motion.div>
                  )}
                </div>
                
                <div className="flex-1 flex justify-end">
                  <Button
                    onClick={onClose}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-pixel px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Helper function to migrate theme names
function migrateTheme(theme: string): string {
  const themeMap: Record<string, string> = {
    'blazeheart-saga': 'blazeheart-saga',
    'neon-ashes': 'neon-ashes',
    'crimson-casefiles': 'crimson-casefiles',
    'obsidian-veil': 'obsidian-veil',
    'starlit-horizon': 'starlit-horizon',
    'ivory-quill': 'ivory-quill',
    'wild-west': 'wild-west',
    'crimson-tides': 'crimson-tides',
    'echoes-of-dawn': 'echoes-of-dawn',
    'velour-nights': 'velour-nights'
  };
  return themeMap[theme] || theme;
}
