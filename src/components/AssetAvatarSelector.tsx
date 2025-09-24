import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from './ui/Card';
import Button from './ui/Button';
import AvatarCustomizer from './AvatarCustomizer';
import { AssetAvatar, getAllAssetAvatars } from '@/lib/asset-avatars';

interface AssetAvatarSelectorProps {
  onSelect: (avatar: AssetAvatar) => void;
  onCancel: () => void;
  currentAvatar?: AssetAvatar;
  theme?: string;
}

export default function AssetAvatarSelector({ onSelect, onCancel, currentAvatar, theme = 'obsidian-veil' }: AssetAvatarSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'male' | 'female'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'base' | 'clothed'>('all');
  const [selectedAvatar, setSelectedAvatar] = useState<AssetAvatar | null>(currentAvatar || null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [view, setView] = useState<'grid' | 'detail'>('grid');

  const allAvatars = getAllAssetAvatars();
  
  const filteredAvatars = allAvatars.filter(avatar => {
    const categoryMatch = selectedCategory === 'all' || avatar.category === selectedCategory;
    const typeMatch = selectedType === 'all' || avatar.type === selectedType;
    return categoryMatch && typeMatch;
  });

  const handleSelect = (avatar: AssetAvatar) => {
    setSelectedAvatar(avatar);
    setView('detail');
  };

  const handleBackToGrid = () => {
    setView('grid');
  };

  const handleConfirm = () => {
    if (selectedAvatar) {
      onSelect(selectedAvatar);
    }
  };

  const handleCustomize = () => {
    if (selectedAvatar) {
      setShowCustomizer(true);
    }
  };

  const handleCustomizedSave = (customizedAvatar: AssetAvatar) => {
    onSelect(customizedAvatar);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-lg p-3 max-w-4xl w-full h-[440px] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-pixel text-base text-white">
            {view === 'grid' ? 'Choose Your Avatar' : 'Avatar Details'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white text-lg"
          >
            ×
          </button>
        </div>

        {/* Grid View */}
        {view === 'grid' && (
          <motion.div
            key="grid"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-2">
              {/* Category Filter */}
              <div className="flex gap-2">
                <span className="text-white font-pixel">Category:</span>
                {[
                  { id: 'all', name: 'All' },
                  { id: 'male', name: 'Male' },
                  { id: 'female', name: 'Female' }
                ].map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id as 'all' | 'male' | 'female')}
                    className={`px-3 py-1 rounded font-pixel text-sm transition-all ${
                      selectedCategory === category.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Type Filter */}
              <div className="flex gap-2">
                <span className="text-white font-pixel">Type:</span>
                {[
                  { id: 'all', name: 'All' },
                  { id: 'base', name: 'Base' },
                  { id: 'clothed', name: 'Clothed' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id as 'all' | 'base' | 'clothed')}
                    className={`px-3 py-1 rounded font-pixel text-sm transition-all ${
                      selectedType === type.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

             {/* Avatar Grid */}
             <div className="grid grid-cols-6 gap-2 mb-3 overflow-y-auto border-2 border-gray-600 rounded-lg p-3" style={{ height: '280px' }}>
               {filteredAvatars.map((avatar) => (
                 <motion.div
                   key={avatar.id}
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   className="cursor-pointer hover:ring-2 hover:ring-gray-500"
                   onClick={() => handleSelect(avatar)}
                 >
                   <Card className="p-1 text-center h-20 hover:border-orange-500 transition-colors">
                     <div className="w-8 h-8 mx-auto mb-1 relative">
                       <img
                         src={avatar.imagePath}
                         alt={avatar.name}
                         className="w-full h-full object-contain pixelated"
                         style={{ imageRendering: 'pixelated' }}
                         onError={(e) => {
                           console.log('Avatar image error:', avatar.name, avatar.imagePath);
                           e.currentTarget.style.display = 'none';
                         }}
                       />
                     </div>
                     <div className="text-xs text-white font-pixel mb-1 truncate">
                       {avatar.name}
                     </div>
                     <div className="text-xs text-gray-400 truncate">
                       {avatar.class}
                     </div>
                   </Card>
                 </motion.div>
               ))}
             </div>

            {/* Action Buttons for Grid View */}
            <div className="flex justify-end flex-shrink-0 mt-auto">
              <Button
                onClick={onCancel}
                variant="secondary"
                className="px-2 py-1 text-xs"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {/* Detail View */}
        {view === 'detail' && selectedAvatar && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-max"
          >

                   {/* Avatar Details */}
                   <div className="flex-1 flex flex-col lg:flex-row gap-3 overflow-y-auto min-h-0">
              {/* Large Avatar Display */}
              <div className="flex-shrink-0 flex justify-center lg:justify-start">
                <div className="w-24 h-24 relative">
                  <img
                    src={selectedAvatar.imagePath}
                    alt={selectedAvatar.name}
                    className="w-full h-full object-contain pixelated"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              </div>

              {/* Avatar Information */}
              <div className="flex-1 min-w-0">
                <h3 className="font-pixel text-lg text-white mb-1">
                  {selectedAvatar.name}
                </h3>
                <p className="text-gray-300 text-xs mb-2">
                  {selectedAvatar.description}
                </p>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-gray-800 rounded-lg p-2">
                    <div className="text-orange-400 font-pixel text-xs mb-1">Race</div>
                    <div className="text-white text-xs">{selectedAvatar.race}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-2">
                    <div className="text-orange-400 font-pixel text-xs mb-1">Class</div>
                    <div className="text-white text-xs">{selectedAvatar.class}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-2">
                    <div className="text-orange-400 font-pixel text-xs mb-1">Type</div>
                    <div className="text-white text-xs capitalize">{selectedAvatar.type}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-2">
                    <div className="text-orange-400 font-pixel text-xs mb-1">Category</div>
                    <div className="text-white text-xs capitalize">{selectedAvatar.category}</div>
                  </div>
                </div>

                {/* Character Stats */}
                <div className="bg-gray-800 rounded-lg p-2 mb-8">
                  <h4 className="font-pixel text-xs text-white mb-1">Character Stats</h4>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {Object.entries(selectedAvatar.stats).map(([stat, value]) => (
                      <div key={stat} className="flex justify-between">
                        <span className="text-gray-400 capitalize">{stat}:</span>
                        <span className="text-white font-pixel">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

                   {/* Action Buttons for Detail View */}
                   <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700 flex-shrink-0">
               <Button
                 onClick={handleCustomize}
                 variant="secondary"
                 className="px-3 py-1 text-xs"
               >
                 Customize Colors
               </Button>
               
               <div className="flex gap-2">
                 <Button
                   onClick={handleBackToGrid}
                   variant="secondary"
                   className="px-3 py-1 text-xs"
                 >
                   ← Back to Grid
                 </Button>
                 <Button
                   onClick={handleConfirm}
                   className="px-3 py-1 text-xs"
                 >
                   Select Avatar
                 </Button>
               </div>
             </div>
          </motion.div>
        )}
      </motion.div>

      {/* Avatar Customizer Modal */}
      {showCustomizer && selectedAvatar && (
        <AvatarCustomizer
          avatar={selectedAvatar}
          onSave={handleCustomizedSave}
          onCancel={() => setShowCustomizer(false)}
          theme={theme}
        />
      )}
    </div>
  );
}
