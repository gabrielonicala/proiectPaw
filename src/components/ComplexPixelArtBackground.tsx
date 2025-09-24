'use client';

import { Theme } from '@/types';

interface ComplexPixelArtBackgroundProps {
  theme: Theme;
}

export default function ComplexPixelArtBackground({ theme }: ComplexPixelArtBackgroundProps) {
  const renderCyberpunkBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(cyan 1px, transparent 1px),
            linear-gradient(90deg, cyan 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Neon glows */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-400 rounded-full opacity-30 blur-xl" />
      <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-fuchsia-400 rounded-full opacity-40 blur-xl" />
      <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-blue-400 rounded-full opacity-25 blur-xl" />
      
      {/* Building silhouettes */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-gray-900 to-transparent" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gray-800" />
      <div className="absolute bottom-0 left-1/4 w-1/6 h-2/3 bg-gray-700" />
      <div className="absolute bottom-0 right-1/4 w-1/5 h-3/5 bg-gray-800" />
      <div className="absolute bottom-0 right-0 w-1/4 h-1/2 bg-gray-700" />
    </div>
  );

  const renderMelancholyBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-800 via-pink-600 to-orange-500" />
      
      {/* Sun */}
      <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-orange-400 rounded-full opacity-80" />
      
      {/* Water reflection */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-blue-900 to-transparent" />
      <div className="absolute bottom-0 left-1/4 w-32 h-8 bg-orange-400 opacity-60" />
      
      {/* Palm trees */}
      <div className="absolute bottom-1/3 left-8 w-2 h-16 bg-gray-700" />
      <div className="absolute bottom-1/3 left-6 w-6 h-8 bg-green-600 transform -skew-x-12" />
      <div className="absolute bottom-1/3 right-8 w-2 h-12 bg-gray-700" />
      <div className="absolute bottom-1/3 right-6 w-6 h-6 bg-green-600 transform skew-x-12" />
      
      {/* Couple silhouette */}
      <div className="absolute bottom-1/3 right-1/3 w-4 h-8 bg-gray-900" />
      <div className="absolute bottom-1/3 right-1/3 ml-4 w-4 h-8 bg-gray-900" />
      
      {/* Clouds */}
      <div className="absolute top-1/4 left-1/3 w-16 h-8 bg-purple-400 rounded-full opacity-60" />
      <div className="absolute top-1/6 right-1/3 w-12 h-6 bg-purple-400 rounded-full opacity-60" />
    </div>
  );

  const renderDarkAcademiaBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-700" />
      
      {/* Stone blocks */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            repeating-linear-gradient(90deg, transparent 0px, transparent 19px, #444444 20px, #444444 39px),
            repeating-linear-gradient(0deg, transparent 0px, transparent 19px, #444444 20px, #444444 39px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Torches */}
      <div className="absolute top-1/4 left-8 w-1 h-8 bg-yellow-600" />
      <div className="absolute top-1/4 left-7 w-3 h-3 bg-orange-400 rounded-full" />
      <div className="absolute top-1/4 right-8 w-1 h-8 bg-yellow-600" />
      <div className="absolute top-1/4 right-7 w-3 h-3 bg-orange-400 rounded-full" />
      <div className="absolute top-1/4 left-1/2 w-1 h-8 bg-yellow-600" />
      <div className="absolute top-1/4 left-1/2 ml-1 w-3 h-3 bg-orange-400 rounded-full" />
      
      {/* Doorways */}
      <div className="absolute bottom-1/3 left-8 w-4 h-12 bg-gray-800" />
      <div className="absolute bottom-1/3 right-8 w-4 h-12 bg-gray-800" />
      <div className="absolute bottom-1/3 left-1/2 w-4 h-12 bg-gray-800" />
    </div>
  );

  const renderShonenBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-800 via-orange-600 to-yellow-500" />
      
      {/* Energy aura */}
      <div className="absolute top-1/2 left-1/2 w-64 h-64 border-4 border-orange-400 rounded-full opacity-40 transform -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-48 h-48 border-4 border-yellow-400 rounded-full opacity-30 transform -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-32 h-32 border-4 border-red-400 rounded-full opacity-20 transform -translate-x-1/2 -translate-y-1/2" />
      
      {/* Speed lines */}
      <div className="absolute top-1/4 left-0 w-1/3 h-1 bg-orange-400 opacity-60 transform rotate-12" />
      <div className="absolute top-1/3 left-0 w-1/4 h-1 bg-yellow-400 opacity-60 transform rotate-12" />
      <div className="absolute top-1/2 left-0 w-1/5 h-1 bg-orange-400 opacity-60 transform rotate-12" />
      <div className="absolute top-1/4 right-0 w-1/3 h-1 bg-orange-400 opacity-60 transform -rotate-12" />
      <div className="absolute top-1/3 right-0 w-1/4 h-1 bg-yellow-400 opacity-60 transform -rotate-12" />
      <div className="absolute top-1/2 right-0 w-1/5 h-1 bg-orange-400 opacity-60 transform -rotate-12" />
      
      {/* Mountains */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-gray-800 to-transparent" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gray-700 transform skew-x-12" />
      <div className="absolute bottom-0 left-1/4 w-1/4 h-1/3 bg-gray-600 transform -skew-x-12" />
      <div className="absolute bottom-0 right-1/4 w-1/4 h-1/2 bg-gray-700 transform skew-x-12" />
      <div className="absolute bottom-0 right-0 w-1/4 h-1/3 bg-gray-600 transform -skew-x-12" />
    </div>
  );

  const renderSteampunkBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-800 via-orange-700 to-yellow-600" />
      
      {/* Gears */}
      <div className="absolute top-1/4 left-1/4 w-16 h-16 border-4 border-yellow-600 rounded-full opacity-60" />
      <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-yellow-700 rounded-full" />
      <div className="absolute top-1/3 right-1/4 w-12 h-12 border-4 border-yellow-600 rounded-full opacity-60" />
      <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-yellow-700 rounded-full" />
      <div className="absolute bottom-1/4 left-1/3 w-20 h-20 border-4 border-yellow-600 rounded-full opacity-60" />
      <div className="absolute bottom-1/4 left-1/3 w-10 h-10 bg-yellow-700 rounded-full" />
      
      {/* Steam pipes */}
      <div className="absolute bottom-1/3 left-1/4 w-2 h-16 bg-gray-600" />
      <div className="absolute bottom-1/3 right-1/4 w-2 h-12 bg-gray-600" />
      <div className="absolute bottom-1/3 left-1/2 w-2 h-14 bg-gray-600" />
      
      {/* Steam clouds */}
      <div className="absolute bottom-1/2 left-1/4 w-8 h-4 bg-gray-300 rounded-full opacity-60" />
      <div className="absolute bottom-1/2 right-1/4 w-6 h-3 bg-gray-300 rounded-full opacity-60" />
      <div className="absolute bottom-1/2 left-1/2 w-10 h-5 bg-gray-300 rounded-full opacity-60" />
      
      {/* Buildings */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-yellow-800 to-transparent" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-yellow-700" />
      <div className="absolute bottom-0 left-1/4 w-1/6 h-2/3 bg-yellow-600" />
      <div className="absolute bottom-0 right-1/4 w-1/5 h-3/5 bg-yellow-700" />
      <div className="absolute bottom-0 right-0 w-1/4 h-1/2 bg-yellow-600" />
    </div>
  );

  const renderFantasyBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-800 to-purple-600" />
      
      {/* Castle */}
      <div className="absolute bottom-1/3 left-1/2 w-20 h-32 bg-purple-700 transform -translate-x-1/2" />
      <div className="absolute bottom-1/2 left-1/2 w-32 h-16 bg-purple-600 transform -translate-x-1/2" />
      <div className="absolute bottom-1/2 left-1/2 w-4 h-20 bg-purple-800 transform -translate-x-1/2" />
      <div className="absolute bottom-1/2 left-1/2 w-4 h-16 bg-purple-800 transform -translate-x-1/2 ml-8" />
      <div className="absolute bottom-1/2 left-1/2 w-4 h-16 bg-purple-800 transform -translate-x-1/2 -ml-8" />
      
      {/* Windows */}
      <div className="absolute bottom-1/2 left-1/2 w-2 h-3 bg-yellow-400 transform -translate-x-1/2" />
      <div className="absolute bottom-1/2 left-1/2 w-2 h-3 bg-yellow-400 transform -translate-x-1/2 ml-4" />
      <div className="absolute bottom-1/2 left-1/2 w-2 h-3 bg-yellow-400 transform -translate-x-1/2 -ml-4" />
      
      {/* Trees */}
      <div className="absolute bottom-1/3 left-8 w-2 h-12 bg-gray-700" />
      <div className="absolute bottom-1/3 left-6 w-6 h-8 bg-green-600 transform -skew-x-12" />
      <div className="absolute bottom-1/3 right-8 w-2 h-10 bg-gray-700" />
      <div className="absolute bottom-1/3 right-6 w-6 h-6 bg-green-600 transform skew-x-12" />
      
      {/* Magic sparkles */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full opacity-80" />
      <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-white rounded-full opacity-80" />
      <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-white rounded-full opacity-80" />
      <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-white rounded-full opacity-80" />
      <div className="absolute top-2/3 left-1/4 w-2 h-2 bg-white rounded-full opacity-80" />
      <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-white rounded-full opacity-80" />
      
      {/* Mountains */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-gray-800 to-transparent" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gray-700 transform skew-x-12" />
      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-gray-700 transform -skew-x-12" />
    </div>
  );

  const renderBackground = () => {
    switch (theme) {
      case 'neon-ashes':
        return renderCyberpunkBackground();
      case 'echoes-of-dawn':
        return renderMelancholyBackground();
      case 'obsidian-veil':
        return renderDarkAcademiaBackground();
      case 'blazeheart-saga':
        return renderShonenBackground();
      case 'wild-west':
        return renderSteampunkBackground();
      case 'ivory-quill':
        return renderFantasyBackground();
      default:
        return renderFantasyBackground();
    }
  };

  return (
    <div className="fixed inset-0 -z-10 pixel-art-bg">
      {renderBackground()}
    </div>
  );
}
