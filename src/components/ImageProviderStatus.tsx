'use client';

import { getImageProvider } from '@/lib/image-generation-config';

export default function ImageProviderStatus() {
  const provider = getImageProvider();
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`px-3 py-2 rounded-lg text-xs font-pixel shadow-lg ${
        provider === 'stable-diffusion' 
          ? 'bg-green-900/80 text-green-300 border border-green-500/50' 
          : 'bg-blue-900/80 text-blue-300 border border-blue-500/50'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            provider === 'stable-diffusion' ? 'bg-green-400' : 'bg-blue-400'
          }`}></div>
          <span>
            {provider === 'stable-diffusion' ? '🎨 SD + Ref' : '🎨 DALL-E'}
          </span>
        </div>
      </div>
    </div>
  );
}
