'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Button from './ui/Button';
import Card from './ui/Card';
import { JournalEntry, User } from '@/types';
import { format } from 'date-fns';
import { themes } from '@/themes';

interface EntryDetailModalProps {
  entry: JournalEntry | null;
  user: User;
  activeCharacter: User['activeCharacter'];
  isOpen: boolean;
  onClose: () => void;
}

export default function EntryDetailModal({ entry, user, activeCharacter, isOpen, onClose }: EntryDetailModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Check if content is loaded
  const isContentReady = entry ? ((entry.outputType === 'text' && entry.reimaginedText) || 
                        (entry.outputType === 'image' && entry.imageUrl && isImageLoaded) || 
                        (entry.outputType === 'coming-soon')) : false;

  // Handle image loading
  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  // Reset image loading state when entry changes
  useEffect(() => {
    setIsImageLoaded(false);
    setIsContentLoading(true);
  }, [entry?.id]);

  // Simulate loading time for better UX
  useEffect(() => {
    if (isContentReady) {
      const timer = setTimeout(() => setIsContentLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isContentReady]);

  if (!entry) return null;

  // Download functions
  const downloadMediaOnly = async (entry: JournalEntry) => {
    setIsDownloading(true);
    
    try {
      if (entry.outputType === 'image' && entry.imageUrl) {
        const filename = `adventure-${entry.id}.png`;
        
        // Try direct download first (for same-origin images)
        try {
          const response = await fetch(entry.imageUrl);
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the object URL
            window.URL.revokeObjectURL(url);
            
            // Add a small delay to show the loading animation
            await new Promise(resolve => setTimeout(resolve, 1500));
            return;
          }
        } catch (directError) {
          console.log('Direct download failed, trying proxy:', directError);
        }
        
        // Fallback to proxy endpoint
        const downloadUrl = `/api/download-media?url=${encodeURIComponent(entry.imageUrl)}&filename=${encodeURIComponent(filename)}`;
        
        // Create a direct download link
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Add a small delay to show the loading animation
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // VIDEO GENERATION COMMENTED OUT - TOO EXPENSIVE FOR NOW
      /*
      else if (entry.outputType === 'video' && entry.videoUrl) {
        // Use our proxy endpoint to download the video
        const filename = `adventure-${entry.id}.mp4`;
        const downloadUrl = `/api/download-media?url=${encodeURIComponent(entry.videoUrl)}&filename=${encodeURIComponent(filename)}`;
        
        // Create a direct download link instead of iframe
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Add a small delay to show the loading animation
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      */
    } catch (error) {
      console.error('Error downloading media:', error);
      // Fallback to opening in new tab
      if (entry.outputType === 'image' && entry.imageUrl) {
        window.open(entry.imageUrl, '_blank');
      }
      // VIDEO GENERATION COMMENTED OUT - TOO EXPENSIVE FOR NOW
      /*
      else if (entry.outputType === 'video' && entry.videoUrl) {
        window.open(entry.videoUrl, '_blank');
      }
      */
    } finally {
      setIsDownloading(false);
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
              <Card theme={activeCharacter?.theme || 'obsidian-veil'} effect="glow" className="relative px-2 py-4">
               {/* Loading overlay */}
               {isDownloading && (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex items-center justify-center"
                 >
                   <div className="text-center">
                     <motion.div
                       animate={{ rotate: 360 }}
                       transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                       className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"
                     />
                     <p className="font-pixel text-white text-lg">
                       DOWNLOADING MEDIA...
                     </p>
                   </div>
                 </motion.div>
               )}



              {/* Content */}
              <div className="space-y-4">
                {/* Original Text */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="font-pixel text-lg text-white mb-3">Original Entry:</h3>
                  <Card theme={activeCharacter?.theme || 'obsidian-veil'} effect="vintage" className="bg-gray-800/50">
                    <p className="text-gray-200 leading-relaxed">{entry.originalText}</p>
                  </Card>
                </motion.div>

                {/* Generated Content */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="font-pixel text-lg text-white mb-3">Your Adventure:</h3>
                  <Card theme={activeCharacter?.theme || 'obsidian-veil'} effect="glow" className="bg-gradient-to-b from-yellow-900/20 to-orange-900/20">
                    {entry.outputType === 'text' && entry.reimaginedText && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-white leading-relaxed"
                      >
                        {entry.reimaginedText}
                      </motion.div>
                    )}
                    
                    {entry.outputType === 'image' && entry.imageUrl && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-center"
                      >
                <div className="w-full rounded-xl overflow-hidden shadow-2xl">
                  <div className="relative" style={{ border: 'none' }}>
                    <Image
                      src={entry.imageUrl}
                      alt="Generated adventure scene"
                      width={320}
                      height={427}
                      className="w-full h-auto object-cover pixelated no-border"
                      style={{ aspectRatio: '3/4' }}
                      onLoad={handleImageLoad}
                    />
                  </div>
                          <div className="px-1 py-0.5 text-xs text-white/90 font-pixel space-y-0 text-left">
                            <div className="flex justify-between">
                              <span>Generated:</span>
                              <span>{format(new Date(entry.createdAt), 'M/d/yyyy')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Style:</span>
                              <span>{entry.character?.theme ? themes[entry.character.theme]?.name || entry.character.theme.charAt(0).toUpperCase() + entry.character.theme.slice(1) : 'Adventure'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Time:</span>
                              <span>{format(new Date(entry.createdAt), 'h:mm a')}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {entry.outputType === 'coming-soon' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-center"
                      >
                        <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-6 border-2 border-purple-400/30 shadow-2xl">
                          <div className="text-4xl mb-3">🎬</div>
                          <h3 className="font-pixel text-xl text-white mb-2">
                            Animation Coming Soon!
                          </h3>
                          <p className="text-purple-200 mb-3 text-sm">
                            We&apos;re working on bringing you amazing animated adventures.
                          </p>
                          <div className="text-xs text-purple-300 font-pixel">
                            <div className="flex justify-between mb-1">
                              <span>Status:</span>
                              <span className="text-yellow-400">In Development</span>
                            </div>
                            <div className="flex justify-between mb-1">
                              <span>Style:</span>
                              <span>{entry.character?.theme ? themes[entry.character.theme]?.name || entry.character.theme.charAt(0).toUpperCase() + entry.character.theme.slice(1) : 'Adventure'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Created:</span>
                              <span>{format(new Date(entry.createdAt), 'M/d/yyyy')}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* VIDEO GENERATION COMMENTED OUT - TOO EXPENSIVE FOR NOW
                    {entry.outputType === 'video' && entry.videoUrl && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-center"
                      >
                        <div className="w-full rounded-xl overflow-hidden shadow-2xl">
                          <div className="relative" style={{ border: 'none' }}>
                             <video
                               src={entry.videoUrl}
                               controls
                               autoPlay
                               loop
                               muted
                               playsInline
                               className="w-full h-auto object-cover pixelated no-border"
                               style={{ aspectRatio: '3/4' }}
                             />
                          </div>
                          <div className="px-1 py-0.5 text-xs text-white/90 font-pixel space-y-0 text-left">
                            <div className="flex justify-between">
                              <span>Generated:</span>
                              <span>{format(new Date(entry.createdAt), 'M/d/yyyy')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Style:</span>
                              <span>{entry.character?.theme ? themes[entry.character.theme]?.name || entry.character.theme.charAt(0).toUpperCase() + entry.character.theme.slice(1) : 'Adventure'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Time:</span>
                              <span>{format(new Date(entry.createdAt), 'h:mm a')}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    */}
                  </Card>
                </motion.div>

                {/* Past Context */}
                {entry.pastContext && entry.pastContext.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="font-pixel text-lg text-white mb-3">Previous Adventures:</h3>
                    <Card theme={activeCharacter?.theme || 'obsidian-veil'} effect="book" className="bg-gray-800/30">
                      <div className="space-y-2">
                        {entry.pastContext.map((context, index) => (
                          <motion.div
                            key={`context-${index}-${context.substring(0, 20).replace(/\s+/g, '-')}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="text-sm text-gray-300 p-2 bg-gray-700/50 pixelated border-l-2 border-yellow-500"
                          >
                            {context.substring(0, 100)}...
                          </motion.div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-4 flex justify-between items-center"
              >
                <div className="flex gap-2">
                  {/* Copy adventure text button */}
                  {entry.reimaginedText && (
                    <Button 
                      onClick={() => {
                        if (entry.reimaginedText) {
                          navigator.clipboard.writeText(entry.reimaginedText);
                          setShowCopyToast(true);
                          setTimeout(() => setShowCopyToast(false), 2000);
                        }
                      }} 
                      variant="secondary"
                      className="text-xs"
                    >
                      📋 COPY
                    </Button>
                  )}
                  {/* Download media only button */}
                  {(entry.outputType === 'image' /* || entry.outputType === 'video' || entry.outputType === 'coming-soon' */) && ( // VIDEO GENERATION COMMENTED OUT, coming-soon doesn't need download
                    <Button 
                      onClick={() => downloadMediaOnly(entry)} 
                      variant="secondary"
                      className="text-xs"
                      disabled={isDownloading}
                    >
                      ⬇ COLLECT
                    </Button>
                  )}
                </div>
                
                <Button onClick={onClose} variant="primary">
                  CLOSE
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Fullscreen Loading Overlay */}
      {isContentLoading && (
        <motion.div
          key="loading-overlay"
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
            Loading your adventure...
          </p>
        </motion.div>
      )}

      {/* Copy Toast Notification */}
      {showCopyToast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          className="fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg pixelated border-2 border-green-400 z-[10001]"
        >
          <p className="font-pixel text-sm">📋 Copied!</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
