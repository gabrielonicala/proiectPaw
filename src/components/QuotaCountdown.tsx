'use client';

import { useState, useEffect } from 'react';

interface QuotaCountdownProps {
  theme?: string;
}

export default function QuotaCountdown({ theme = 'obsidian-veil' }: QuotaCountdownProps) {
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const timeDiff = tomorrow.getTime() - now.getTime();
      
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      setTimeUntilReset(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    // Update immediately
    updateCountdown();
    
    // Update every second
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pixelated rounded p-2 min-w-[100px]">
      <div className="text-center">
        <div className="font-pixel text-xs text-gray-400 mb-1">
          REFRESH IN
        </div>
        <div className="font-pixel text-sm text-yellow-300">
          <span>{timeUntilReset}</span>
        </div>
      </div>
    </div>
  );
}
