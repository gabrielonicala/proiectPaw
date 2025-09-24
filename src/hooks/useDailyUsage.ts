import { useState, useEffect } from 'react';

interface DailyUsage {
  chapters: {
    used: number;
    limit: number;
    remaining: number;
  };
  scenes: {
    used: number;
    limit: number;
    remaining: number;
  };
}

interface UsageLimits {
  dailyChapters: number;
  dailyScenes: number;
  plan: string;
}

interface DailyUsageData {
  usage: DailyUsage;
  limits: UsageLimits;
}

export function useDailyUsage(characterId?: string) {
  const [usageData, setUsageData] = useState<DailyUsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const url = characterId 
        ? `/api/usage/daily?characterId=${encodeURIComponent(characterId)}`
        : '/api/usage/daily';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch usage data');
      }
      
      const data = await response.json();
      setUsageData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching daily usage:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUsage = () => {
    fetchUsage();
  };

  useEffect(() => {
    fetchUsage();
  }, [characterId]);

  return {
    usageData,
    isLoading,
    error,
    refreshUsage,
  };
}
