'use client';

/**
 * Offline sync system for queuing changes made while offline
 * and syncing them when connection is restored
 */

interface PendingChange {
  id: string;
  type: 'avatar_change' | 'character_update' | 'entry_create' | 'entry_update' | 'entry_delete';
  data: any;
  timestamp: number;
  retryCount: number;
}

const PENDING_CHANGES_KEY = 'quillia-pending-changes';
const MAX_RETRY_COUNT = 3;

/**
 * Add a change to the pending changes queue
 */
export function queueOfflineChange(type: PendingChange['type'], data: any): void {
  try {
    const pendingChanges = getPendingChanges();
    const change: PendingChange = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    pendingChanges.push(change);
    localStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(pendingChanges));
    
    console.log(`Queued offline change: ${type}`, change);
  } catch (error) {
    console.error('Error queuing offline change:', error);
  }
}

/**
 * Get all pending changes
 */
export function getPendingChanges(): PendingChange[] {
  try {
    const stored = localStorage.getItem(PENDING_CHANGES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting pending changes:', error);
    return [];
  }
}

/**
 * Remove a specific pending change
 */
export function removePendingChange(changeId: string): void {
  try {
    const pendingChanges = getPendingChanges();
    const filtered = pendingChanges.filter(change => change.id !== changeId);
    localStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing pending change:', error);
  }
}

/**
 * Clear all pending changes
 */
export function clearPendingChanges(): void {
  try {
    localStorage.removeItem(PENDING_CHANGES_KEY);
  } catch (error) {
    console.error('Error clearing pending changes:', error);
  }
}

/**
 * Sync all pending changes when connection is restored
 */
export async function syncPendingChanges(): Promise<void> {
  const pendingChanges = getPendingChanges();
  
  if (pendingChanges.length === 0) {
    console.log('No pending changes to sync');
    return;
  }
  
  console.log(`Syncing ${pendingChanges.length} pending changes...`);
  
  const successfulChanges: string[] = [];
  const failedChanges: PendingChange[] = [];
  
  for (const change of pendingChanges) {
    try {
      const success = await syncChange(change);
      if (success) {
        successfulChanges.push(change.id);
      } else {
        failedChanges.push(change);
      }
    } catch (error) {
      console.error(`Error syncing change ${change.id}:`, error);
      failedChanges.push(change);
    }
  }
  
  // Remove successful changes
  successfulChanges.forEach(changeId => removePendingChange(changeId));
  
  // Update retry count for failed changes
  failedChanges.forEach(change => {
    change.retryCount++;
    if (change.retryCount >= MAX_RETRY_COUNT) {
      console.warn(`Max retry count reached for change ${change.id}, removing from queue`);
      removePendingChange(change.id);
    }
  });
  
  // Save updated failed changes
  if (failedChanges.length > 0) {
    const remainingChanges = getPendingChanges();
    const updatedFailed = failedChanges.map(change => ({
      ...change,
      retryCount: change.retryCount
    }));
    const allChanges = [...remainingChanges.filter(c => !failedChanges.some(fc => fc.id === c.id)), ...updatedFailed];
    localStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(allChanges));
  }
  
  console.log(`Sync complete: ${successfulChanges.length} successful, ${failedChanges.length} failed`);
}

/**
 * Sync a single change
 */
async function syncChange(change: PendingChange): Promise<boolean> {
  try {
    switch (change.type) {
      case 'avatar_change':
        return await syncAvatarChange(change.data);
      case 'character_update':
        return await syncCharacterUpdate(change.data);
      case 'entry_create':
        return await syncEntryCreate(change.data);
      case 'entry_update':
        return await syncEntryUpdate(change.data);
      case 'entry_delete':
        return await syncEntryDelete(change.data);
      default:
        console.warn(`Unknown change type: ${change.type}`);
        return false;
    }
  } catch (error) {
    console.error(`Error syncing change ${change.type}:`, error);
    return false;
  }
}

/**
 * Sync avatar change
 */
async function syncAvatarChange(data: { characterId: string; avatar: any }): Promise<boolean> {
  try {
    const response = await fetch(`/api/characters/${data.characterId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar: data.avatar })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error syncing avatar change:', error);
    return false;
  }
}

/**
 * Sync character update
 */
async function syncCharacterUpdate(data: { characterId: string; updates: any }): Promise<boolean> {
  try {
    const response = await fetch(`/api/characters/${data.characterId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data.updates)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error syncing character update:', error);
    return false;
  }
}

/**
 * Sync entry creation
 */
async function syncEntryCreate(data: any): Promise<boolean> {
  try {
    const response = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error syncing entry creation:', error);
    return false;
  }
}

/**
 * Sync entry update
 */
async function syncEntryUpdate(data: { entryId: string; updates: any }): Promise<boolean> {
  try {
    const response = await fetch(`/api/entries/${data.entryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data.updates)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error syncing entry update:', error);
    return false;
  }
}

/**
 * Sync entry deletion
 */
async function syncEntryDelete(data: { entryId: string }): Promise<boolean> {
  try {
    const response = await fetch(`/api/entries/${data.entryId}`, {
      method: 'DELETE'
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error syncing entry deletion:', error);
    return false;
  }
}

/**
 * Check if we're online and sync pending changes
 */
export async function checkConnectionAndSync(): Promise<void> {
  if (navigator.onLine) {
    try {
      // Test if we can reach the API
      const response = await fetch('/api/user/preferences', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        await syncPendingChanges();
      }
    } catch (error) {
      console.log('API not reachable, skipping sync');
    }
  }
}
