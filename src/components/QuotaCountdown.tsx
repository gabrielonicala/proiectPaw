'use client';

import { useState, useEffect } from 'react';

interface QuotaCountdownProps {
  theme?: string;
  nextResetAt?: string; // ISO string from server
}

export default function QuotaCountdown({ theme = 'obsidian-veil', nextResetAt }: QuotaCountdownProps) {
  const [timeUntilReset, setTimeUntilReset] = useState<string>('...');

  useEffect(() => {
    if (!nextResetAt) {
      setTimeUntilReset('...');
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const resetTime = new Date(nextResetAt);
      
      const timeDiff = resetTime.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        // Reset time has passed, show 00:00:00 and refresh will happen on next API call
        setTimeUntilReset('00:00:00');
        return;
      }
      
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
  }, [nextResetAt]);

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
