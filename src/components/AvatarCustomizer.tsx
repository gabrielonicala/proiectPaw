import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from './ui/Card';
import Button from './ui/Button';
import { AssetAvatar } from '@/lib/asset-avatars';
import { Theme } from '@/types';

interface AvatarCustomizerProps {
  avatar: AssetAvatar;
  onSave: (customizedAvatar: AssetAvatar) => void;
  onCancel: () => void;
  theme?: string;
}

interface ColorSettings {
  skinHue: number;
  skinSaturation: number;
  skinBrightness: number;
  clothingHue: number;
  clothingSaturation: number;
  clothingBrightness: number;
}

export default function AvatarCustomizer({ avatar, onSave, onCancel, theme = 'obsidian-veil' }: AvatarCustomizerProps) {
  const [colorSettings, setColorSettings] = useState<ColorSettings>({
    skinHue: 0,
    skinSaturation: 100,
    skinBrightness: 100,
    clothingHue: 0,
    clothingSaturation: 100,
    clothingBrightness: 100
  });

  const [customizedAvatar, setCustomizedAvatar] = useState<AssetAvatar>(avatar);

  // Apply color filters to create customized avatar
  useEffect(() => {
    // const skinFilter = `hue-rotate(${colorSettings.skinHue}deg) saturate(${colorSettings.skinSaturation}%) brightness(${colorSettings.skinBrightness}%)`;
    // const clothingFilter = `hue-rotate(${colorSettings.clothingHue}deg) saturate(${colorSettings.clothingSaturation}%) brightness(${colorSettings.clothingBrightness}%)`;
    
    setCustomizedAvatar({
      ...avatar,
      name: `${avatar.name} (Custom)`,
      description: `${avatar.description} - Customized colors`
    });
  }, [avatar, colorSettings]);

  const handleColorChange = (property: keyof ColorSettings, value: number) => {
    setColorSettings(prev => ({
      ...prev,
      [property]: value
    }));
  };

  const handleSave = () => {
    onSave(customizedAvatar);
  };

  const resetColors = () => {
    setColorSettings({
      skinHue: 0,
      skinSaturation: 100,
      skinBrightness: 100,
      clothingHue: 0,
      clothingSaturation: 100,
      clothingBrightness: 100
    });
  };

  const getSkinFilter = () => {
    return `hue-rotate(${colorSettings.skinHue}deg) saturate(${colorSettings.skinSaturation}%) brightness(${colorSettings.skinBrightness}%)`;
  };

  const getClothingFilter = () => {
    return `hue-rotate(${colorSettings.clothingHue}deg) saturate(${colorSettings.clothingSaturation}%) brightness(${colorSettings.clothingBrightness}%)`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-lg p-4 max-w-4xl w-full max-h-[80vh] overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-pixel text-xl text-white">Customize Avatar</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-y-auto">
          {/* Preview Section */}
          <div className="space-y-3">
            <h3 className="font-pixel text-base text-white">Preview</h3>
            
            {/* Side by side comparison */}
            <div className="grid grid-cols-2 gap-3">
              {/* Original Avatar */}
              <Card className="p-3">
                <h4 className="font-pixel text-xs text-gray-300 mb-2">Original</h4>
                <div className="flex justify-center">
                  <img
                    src={avatar.imagePath}
                    alt={avatar.name}
                    className="w-20 h-20 pixelated"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
              </Card>

              {/* Customized Avatar */}
              <Card className="p-3">
                <h4 className="font-pixel text-xs text-gray-300 mb-2">Customized</h4>
                <div className="flex justify-center">
                  <div className="relative">
                    <img
                      src={avatar.imagePath}
                      alt={customizedAvatar.name}
                      className="w-20 h-20 pixelated"
                      style={{ 
                        imageRendering: 'pixelated',
                        filter: `${getSkinFilter()} ${getClothingFilter()}`
                      }}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Customization Controls */}
          <div className="space-y-4">
            <h3 className="font-pixel text-base text-white">Color Settings</h3>

            {/* Skin Color Controls */}
            <Card className="p-3">
              <h4 className="font-pixel text-xs text-white mb-3">Skin Color</h4>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Hue: {colorSettings.skinHue}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={colorSettings.skinHue}
                    onChange={(e) => handleColorChange('skinHue', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Saturation: {colorSettings.skinSaturation}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={colorSettings.skinSaturation}
                    onChange={(e) => handleColorChange('skinSaturation', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Brightness: {colorSettings.skinBrightness}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={colorSettings.skinBrightness}
                    onChange={(e) => handleColorChange('skinBrightness', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </Card>

            {/* Clothing Color Controls */}
            <Card className="p-3">
              <h4 className="font-pixel text-xs text-white mb-3">Clothing Color</h4>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Hue: {colorSettings.clothingHue}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={colorSettings.clothingHue}
                    onChange={(e) => handleColorChange('clothingHue', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Saturation: {colorSettings.clothingSaturation}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={colorSettings.clothingSaturation}
                    onChange={(e) => handleColorChange('clothingSaturation', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    Brightness: {colorSettings.clothingBrightness}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={colorSettings.clothingBrightness}
                    onChange={(e) => handleColorChange('clothingBrightness', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </Card>

            {/* Preset Colors */}
            <Card className="p-3">
              <h4 className="font-pixel text-xs text-white mb-3">Quick Presets</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => setColorSettings({
                    skinHue: 30, skinSaturation: 120, skinBrightness: 110,
                    clothingHue: 0, clothingSaturation: 100, clothingBrightness: 100
                  })}
                  variant="secondary"
                  className="px-2 py-1 text-xs"
                >
                  Warm Skin
                </Button>
                <Button
                  onClick={() => setColorSettings({
                    skinHue: 200, skinSaturation: 80, skinBrightness: 90,
                    clothingHue: 0, clothingSaturation: 100, clothingBrightness: 100
                  })}
                  variant="secondary"
                  className="px-2 py-1 text-xs"
                >
                  Cool Skin
                </Button>
                <Button
                  onClick={() => setColorSettings({
                    skinHue: 0, skinSaturation: 100, skinBrightness: 100,
                    clothingHue: 240, clothingSaturation: 150, clothingBrightness: 100
                  })}
                  variant="secondary"
                  className="px-2 py-1 text-xs"
                >
                  Blue Clothes
                </Button>
                <Button
                  onClick={() => setColorSettings({
                    skinHue: 0, skinSaturation: 100, skinBrightness: 100,
                    clothingHue: 0, clothingSaturation: 150, clothingBrightness: 80
                  })}
                  variant="secondary"
                  className="px-2 py-1 text-xs"
                >
                  Red Clothes
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-700 flex-shrink-0">
          <Button
            onClick={resetColors}
            variant="secondary"
            className="px-3 py-2 text-sm"
            theme={theme as Theme}
          >
            Reset Colors
          </Button>
          
          <div className="flex gap-2">
            <Button
              onClick={onCancel}
              variant="secondary"
              className="px-4 py-2 text-sm"
              theme={theme as Theme}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="px-4 py-2 text-sm"
              theme={theme as Theme}
            >
              Save Custom Avatar
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
