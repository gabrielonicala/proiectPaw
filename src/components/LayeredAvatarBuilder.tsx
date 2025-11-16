import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Card from './ui/Card';
import Button from './ui/Button';
import { AvatarPiece, LayeredAvatar, headPieces, torsoPieces, legsPieces, createLayeredAvatar } from '@/lib/layered-avatars';
import { getCachedImageUrl } from '@/lib/asset-cache';
import { Theme } from '@/types';
import { themes } from '@/themes';

interface LayeredAvatarBuilderProps {
  onSave: (avatar: LayeredAvatar) => void;
  onCancel: () => void;
  currentAvatar?: LayeredAvatar;
  theme?: Theme;
}

export default function LayeredAvatarBuilder({ onSave, onCancel, currentAvatar, theme = 'obsidian-veil' }: LayeredAvatarBuilderProps) {
  const [selectedHead, setSelectedHead] = useState<AvatarPiece>(currentAvatar?.head || headPieces[0]);
  const [selectedTorso, setSelectedTorso] = useState<AvatarPiece>(currentAvatar?.torso || torsoPieces[0]);
  const [selectedLegs, setSelectedLegs] = useState<AvatarPiece>(currentAvatar?.legs || legsPieces[0]);
  const [activeCategory, setActiveCategory] = useState<'head' | 'torso' | 'legs'>('head');
  // Gender filter removed to avoid gender branding

  const themeConfig = themes[theme];

  const headRef = useRef<HTMLDivElement>(null);
  const torsoRef = useRef<HTMLDivElement>(null);
  const legsRef = useRef<HTMLDivElement>(null);

  const getFilteredPieces = (category: 'head' | 'torso' | 'legs') => {
    // Show all pieces regardless of gender to avoid gender branding
    return category === 'head' ? headPieces : category === 'torso' ? torsoPieces : legsPieces;
  };

  const currentPieces = {
    head: getFilteredPieces('head'),
    torso: getFilteredPieces('torso'),
    legs: getFilteredPieces('legs')
  };

  const handlePieceSelect = (piece: AvatarPiece) => {
    if (piece.category === 'head') {
      setSelectedHead(piece);
    } else if (piece.category === 'torso') {
      setSelectedTorso(piece);
    } else if (piece.category === 'legs') {
      setSelectedLegs(piece);
    }
  };

  const handleSave = () => {
    const layeredAvatar = createLayeredAvatar(selectedHead, selectedTorso, selectedLegs);
    onSave(layeredAvatar);
  };

  const scrollToCategory = (category: 'head' | 'torso' | 'legs') => {
    setActiveCategory(category);
    const ref = category === 'head' ? headRef : category === 'torso' ? torsoRef : legsRef;
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-[10002]" style={{ margin: 0, padding: 0 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-lg p-2 sm:p-4 max-w-4xl w-full h-[90vh] sm:h-[600px] overflow-hidden flex flex-col mx-4 my-4"
        style={{
          backgroundColor: themeConfig.colors.background,
          borderColor: themeConfig.colors.border,
          border: `2px solid ${themeConfig.colors.border}`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-pixel text-xl" style={{ color: themeConfig.colors.text }}>Build Your Avatar</h2>
          <button
            onClick={onCancel}
            className="text-2xl hover:opacity-70 transition-opacity"
            style={{ color: themeConfig.colors.text }}
          >
            ×
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden">
          {/* Avatar Preview */}
          <div className="flex-shrink-0 w-full lg:w-48 flex flex-col items-center">
            <h3 className="font-pixel text-lg text-white mb-4">Preview</h3>
            <div className="relative w-24 h-36 sm:w-32 sm:h-48 bg-gray-800 rounded-lg p-2 sm:p-4 flex flex-col items-center justify-center">
              {/* Layered Avatar Display */}
              <div className="relative w-16 h-24 sm:w-24 sm:h-40 flex flex-col">
                {/* Head Layer (top) */}
                <div className="flex-shrink-0 h-8 sm:h-16">
                  <img
                    src={getCachedImageUrl(selectedHead.imagePath)}
                    alt={selectedHead.name}
                    className="w-full h-full object-contain pixelated"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                {/* Torso Layer (middle) */}
                <div className="flex-shrink-0 h-8 sm:h-12">
                  <img
                    src={getCachedImageUrl(selectedTorso.imagePath)}
                    alt={selectedTorso.name}
                    className="w-full h-full object-contain pixelated"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                {/* Legs Layer (bottom) */}
                <div className="flex-shrink-0 h-8 sm:h-12">
                  <img
                    src={getCachedImageUrl(selectedLegs.imagePath)}
                    alt={selectedLegs.name}
                    className="w-full h-full object-contain pixelated"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              </div>
            </div>
            
            {/* Current Selection Info - Commented out for now, might reintroduce later */}
            {/* 
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-300 mb-2">
                <div className="font-pixel text-orange-400">Head:</div>
                <div className="text-xs">Selected</div>
              </div>
              <div className="text-sm text-gray-300 mb-2">
                <div className="font-pixel text-orange-400">Torso:</div>
                <div className="text-xs">Selected</div>
              </div>
              <div className="text-sm text-gray-300">
                <div className="font-pixel text-orange-400">Legs:</div>
                <div className="text-xs">Selected</div>
              </div>
            </div>
            */}
          </div>

          {/* Piece Selector */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Gender Filter removed to avoid gender branding */}

            {/* Category Tabs */}
            <div className="flex gap-1 sm:gap-2 mb-3">
              {(['head', 'torso', 'legs'] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => scrollToCategory(category)}
                  className={`px-2 py-1 sm:px-4 sm:py-2 rounded font-pixel text-xs sm:text-sm transition-all ${
                    activeCategory === category
                      ? ''
                      : 'hover:opacity-70'
                  }`}
                  style={{
                    backgroundColor: activeCategory === category ? themeConfig.colors.accent : themeConfig.colors.secondary,
                    color: activeCategory === category ? '#FFFFFF' : themeConfig.colors.text,
                    border: `1px solid ${themeConfig.colors.border}`
                  }}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {/* Pieces List */}
            <div className="flex-1 overflow-y-auto space-y-6">
              {/* Head Pieces */}
              <div ref={headRef} className="space-y-2">
                <h4 className="font-pixel text-lg" style={{ color: themeConfig.colors.accent }}>Head Pieces ({currentPieces.head.length})</h4>
                <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-1 sm:gap-2">
                  {currentPieces.head.map((piece) => (
                    <motion.div
                      key={piece.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`cursor-pointer ${
                        selectedHead.id === piece.id ? 'ring-2 ring-orange-500' : ''
                      }`}
                      onClick={() => handlePieceSelect(piece)}
                    >
                      <Card className="p-1 sm:p-2 text-center" theme={theme}>
                        <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-1 relative">
                          <img
                            src={getCachedImageUrl(piece.imagePath)}
                            alt={piece.name}
                            className="w-full h-full object-contain pixelated"
                            style={{ imageRendering: 'pixelated' }}
                            onError={(e) => {
                              console.log('Piece image error:', piece.name, piece.imagePath);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="text-xs text-white font-pixel mb-1 truncate">
                          {/* Piece name removed to avoid gender branding */}
                        </div>
                        <div className="text-xs text-gray-400 truncate hidden sm:block">
                          {/* Description removed to avoid gender branding */}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Torso Pieces */}
              <div ref={torsoRef} className="space-y-2">
                <h4 className="font-pixel text-lg" style={{ color: themeConfig.colors.accent }}>Torso Pieces ({currentPieces.torso.length})</h4>
                <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-1 sm:gap-2">
                  {currentPieces.torso.map((piece) => (
                    <motion.div
                      key={piece.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`cursor-pointer ${
                        selectedTorso.id === piece.id ? 'ring-2 ring-orange-500' : ''
                      }`}
                      onClick={() => handlePieceSelect(piece)}
                    >
                      <Card className="p-1 sm:p-2 text-center" theme={theme}>
                        <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-1 relative">
                          <img
                            src={getCachedImageUrl(piece.imagePath)}
                            alt={piece.name}
                            className="w-full h-full object-contain pixelated"
                            style={{ imageRendering: 'pixelated' }}
                            onError={(e) => {
                              console.log('Piece image error:', piece.name, piece.imagePath);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="text-xs text-white font-pixel mb-1 truncate">
                          {/* Piece name removed to avoid gender branding */}
                        </div>
                        <div className="text-xs text-gray-400 truncate hidden sm:block">
                          {/* Description removed to avoid gender branding */}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Legs Pieces */}
              <div ref={legsRef} className="space-y-2">
                <h4 className="font-pixel text-lg" style={{ color: themeConfig.colors.accent }}>Legs Pieces ({currentPieces.legs.length})</h4>
                <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-1 sm:gap-2">
                  {currentPieces.legs.map((piece) => (
                    <motion.div
                      key={piece.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`cursor-pointer ${
                        selectedLegs.id === piece.id ? 'ring-2 ring-orange-500' : ''
                      }`}
                      onClick={() => handlePieceSelect(piece)}
                    >
                      <Card className="p-1 sm:p-2 text-center" theme={theme}>
                        <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-1 relative">
                          <img
                            src={getCachedImageUrl(piece.imagePath)}
                            alt={piece.name}
                            className="w-full h-full object-contain pixelated"
                            style={{ imageRendering: 'pixelated' }}
                            onError={(e) => {
                              console.log('Piece image error:', piece.name, piece.imagePath);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <div className="text-xs text-white font-pixel mb-1 truncate">
                          {/* Piece name removed to avoid gender branding */}
                        </div>
                        <div className="text-xs text-gray-400 truncate hidden sm:block">
                          {/* Description removed to avoid gender branding */}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 pt-4" style={{ borderTop: `1px solid ${themeConfig.colors.border}` }}>
          <Button
            onClick={onCancel}
            variant="secondary"
            theme="obsidian-veil"
            className="px-3 py-2 text-sm"
            style={{
              background: 'linear-gradient(to bottom, #6B7280, #4B5563)',
              borderColor: '#6B7280',
              color: '#FFFFFF',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8), -1px -1px 0px rgba(0, 0, 0, 0.8), 1px -1px 0px rgba(0, 0, 0, 0.8), -1px 1px 0px rgba(0, 0, 0, 0.8), 0px 1px 0px rgba(0, 0, 0, 0.8), 0px -1px 0px rgba(0, 0, 0, 0.8), 1px 0px 0px rgba(0, 0, 0, 0.8), -1px 0px 0px rgba(0, 0, 0, 0.8)'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            theme="obsidian-veil"
            className="px-3 py-2 text-sm"
            style={{
              background: 'linear-gradient(to bottom, #6B7280, #4B5563)',
              borderColor: '#6B7280',
              color: '#FFFFFF',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8), -1px -1px 0px rgba(0, 0, 0, 0.8), 1px -1px 0px rgba(0, 0, 0, 0.8), -1px 1px 0px rgba(0, 0, 0, 0.8), 0px 1px 0px rgba(0, 0, 0, 0.8), 0px -1px 0px rgba(0, 0, 0, 0.8), 1px 0px 0px rgba(0, 0, 0, 0.8), -1px 0px 0px rgba(0, 0, 0, 0.8)'
            }}
          >
            Save Avatar
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
