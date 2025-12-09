'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface RealtimeUpdate {
  type: 'connected' | 'heartbeat' | 'credits:updated' | 'slots:updated';
  data?: any;
  timestamp?: number;
  message?: string;
}

interface UseRealtimeUpdatesOptions {
  /** Enable real-time updates (default: true) */
  enabled?: boolean;
  /** Callback when credits are updated */
  onCreditsUpdate?: (credits: number, isLow: boolean) => void;
  /** Callback when character slots are updated */
  onSlotsUpdate?: (slots: number) => void;
}

/**
 * Hook for real-time updates via Server-Sent Events (SSE)
 * Listens for credit balance and character slot updates
 */
export function useRealtimeUpdates(options: UseRealtimeUpdatesOptions = {}) {
  const { 
    enabled = true,
    onCreditsUpdate,
    onSlotsUpdate 
  } = options;

  const { data: session } = useSession();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled || !session?.user) {
      return;
    }

    // Create EventSource connection
    const eventSource = new EventSource('/api/realtime/stream');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('Real-time updates connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const update: RealtimeUpdate = JSON.parse(event.data);
        
        switch (update.type) {
          case 'connected':
            console.log('Real-time updates:', update.message);
            break;
            
          case 'heartbeat':
            // Heartbeat to keep connection alive
            break;
            
          case 'credits:updated':
            if (onCreditsUpdate && update.data) {
              onCreditsUpdate(update.data.credits, update.data.isLow);
            }
            break;
            
          case 'slots:updated':
            if (onSlotsUpdate && update.data) {
              onSlotsUpdate(update.data.characterSlots);
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing real-time update:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Real-time updates error:', error);
      // EventSource will automatically reconnect
    };

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [enabled, session, onCreditsUpdate, onSlotsUpdate]);

  // Function to manually close connection
  const close = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  return { close };
}
