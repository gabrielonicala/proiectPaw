'use client';

import { signOut } from 'next-auth/react';

/**
 * Handles automatic logout when user account is deleted
 * This function should be called when API responses indicate the user account was deleted
 */
export async function handleAutoLogout() {
  try {
    // Clear any local storage data
    localStorage.removeItem('quillia-user');
    localStorage.removeItem('quillia-entries');
    localStorage.removeItem('quillia-characters');
    
    // Sign out the user
    await signOut({ 
      callbackUrl: '/auth/signin',
      redirect: true 
    });
  } catch (error) {
    console.error('Error during auto-logout:', error);
    // Force redirect to signin page even if signOut fails
    window.location.href = '/auth/signin';
  }
}

/**
 * Checks if an API response indicates the user should be auto-logged out
 */
export function shouldAutoLogout(response: any): boolean {
  return response?.code === 'USER_ACCOUNT_DELETED' && response?.autoLogout === true;
}

/**
 * Wrapper for fetch that automatically handles user account deletion
 */
export async function fetchWithAutoLogout(url: string, options?: RequestInit): Promise<Response> {
  const response = await fetch(url, options);
  
  if (!response.ok && response.status === 401) {
    try {
      const data = await response.json();
      if (shouldAutoLogout(data)) {
        console.log('User account deleted, initiating auto-logout...');
        await handleAutoLogout();
        return response; // Return the original response
      }
    } catch (error) {
      console.error('Error parsing auto-logout response:', error);
    }
  }
  
  return response;
}
