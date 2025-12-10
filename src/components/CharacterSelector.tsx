'use client';

import { motion } from 'framer-motion';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Trash, Pencil, Check } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import LayeredAvatarRenderer from './LayeredAvatarRenderer';
import LayeredAvatarBuilder from './LayeredAvatarBuilder';
import AppNavigation from './AppNavigation';
import MovingGradientBackground from './MovingGradientBackground';
import { Character, Theme } from '@/types';
import { themes } from '@/themes';
import { migrateTheme } from '@/lib/theme-migration';
import { getCachedImageUrl } from '@/lib/asset-cache';
import { queueOfflineChange } from '@/lib/offline-sync';
import { CHARACTER_SLOT_PRICE, CHARACTER_SLOT_PRODUCT_PATH } from '@/lib/credits';
// import Footer from './Footer';

const ADMIN_EMAILS = ['admin@quillia.app', 'gabrielonicala@gmail.com'];

interface CharacterSelectorProps {
  characters: Character[];
  activeCharacter: Character | null;
  onCharacterSelect: (character: Character) => void;
  onCreateNew: () => void;
  onBack: () => void;
  onCharacterUpdate: (character: Character) => void;
  onCharacterDelete: (characterId: string) => void;
  user: {
    id: string;
    email?: string | null;
    characterSlots: number;
  };
  // Triggered when user clicks upgrade; allows parent to show the Tribute view
  onUpgrade?: () => void;
  // Callback to refresh user data (for updating character slots after purchase)
  onUserRefresh?: () => Promise<void>;
}

export default function CharacterSelector({ 
  characters, 
  activeCharacter, 
  onCharacterSelect, 
  onCreateNew, 
  onBack,
  onCharacterUpdate,
  onCharacterDelete,
  user,
  onUpgrade,
  onUserRefresh
}: CharacterSelectorProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showAvatarBuilder, setShowAvatarBuilder] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isPurchasingSlot, setIsPurchasingSlot] = useState(false);
  const [showPurchaseOverlay, setShowPurchaseOverlay] = useState(false);
  const nameEditRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const checkButtonRef = useRef<HTMLDivElement>(null);

  const handleCharacterSwitch = async (character: Character) => {
    if (character.id === activeCharacter?.id) return;
    
    // Check if character is locked before attempting to switch
    if (character.isLocked) {
      alert('This character is locked. Upgrade your plan to access all characters!');
      return;
    }

    setIsLoading(character.id);
    try {
      const response = await fetch(`/api/characters/${character.id}/switch`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403 && errorData.message) {
          alert(errorData.message);
        } else {
          throw new Error('Failed to switch character');
        }
        return;
      }

      const { activeCharacter: newActiveCharacter } = await response.json();
      onCharacterSelect(newActiveCharacter);
    } catch (error) {
      console.error('Error switching character:', error);
      alert('Failed to switch character. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const handleEditAvatar = (character: Character) => {
    setEditingCharacter(character);
    setShowAvatarBuilder(true);
  };

  const handleAvatarSave = async (layeredAvatar: NonNullable<NonNullable<Character['avatar']>['options']>['layeredAvatar']) => {
    if (!editingCharacter) return;

    // Update the character's avatar
    const updatedCharacter = {
      ...editingCharacter,
      avatar: editingCharacter.avatar ? {
        ...editingCharacter.avatar,
        options: {
          ...editingCharacter.avatar.options,
          layeredAvatar: layeredAvatar
        }
      } : {
        id: 'temp-avatar',
        name: 'Custom Avatar',
        image: '👤',
        pixelArt: undefined,
        color: '#FF6B35',
        accessories: [],
        description: 'Custom layered avatar',
        race: 'Custom',
        class: 'Adventurer',
        stats: {
          strength: 10,
          intelligence: 10,
          dexterity: 10,
          wisdom: 10,
          charisma: 10
        },
        options: {
          layeredAvatar: layeredAvatar
        }
      }
    };

    try {
      // Save to database
      const response = await fetch(`/api/characters/${editingCharacter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          avatar: updatedCharacter.avatar 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update character avatar');
      }

      // Update the character in the parent component
      onCharacterUpdate(updatedCharacter);
      
      // Close the builder
      setShowAvatarBuilder(false);
      setEditingCharacter(null);
    } catch (error) {
      console.error('Error updating character avatar:', error);
      // Queue for offline sync if the request failed
      queueOfflineChange('character_update', {
        characterId: editingCharacter.id,
        updates: { avatar: updatedCharacter.avatar }
      });
      
      // Still update locally and close the builder
      onCharacterUpdate(updatedCharacter);
      setShowAvatarBuilder(false);
      setEditingCharacter(null);
    }
  };

  const handleAvatarCancel = () => {
    setShowAvatarBuilder(false);
    setEditingCharacter(null);
  };

  // Character slot purchase handler
  const handlePurchaseCharacterSlot = async () => {
    console.log('🛒 [SLOTS] Starting character slot purchase');
    setIsPurchasingSlot(true);
    setShowPurchaseOverlay(true); // Show loading overlay
    const slotsBeforePurchase = user.characterSlots; // Capture current slots for comparison
    const pollingIntervals: NodeJS.Timeout[] = [];
    const timeouts: NodeJS.Timeout[] = [];
    let isStillPurchasing = true;
    let orderCompleteFired = false; // Track if order.complete event fired
    
    // Cleanup function
    const cleanup = () => {
      console.log('🧹 [SLOTS] Cleaning up polling and timeouts...');
      pollingIntervals.forEach(interval => clearInterval(interval));
      timeouts.forEach(timeout => clearTimeout(timeout));
      pollingIntervals.length = 0;
      timeouts.length = 0;
    };
    
    try {
      if (typeof window === 'undefined' || !(window as any).fastspring) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!(window as any).fastspring) {
          console.error('❌ [SLOTS] FastSpring not loaded');
          alert('FastSpring checkout is loading. Please try again in a moment.');
          setIsPurchasingSlot(false);
          return;
        }
      }

      const fastspring = (window as any).fastspring;
      
      console.log('🛒 [SLOTS] FastSpring loaded, notifying backend...');
      try {
        await fetch('/api/fastspring/checkout/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        console.log('✅ [SLOTS] Backend notified of checkout start');
      } catch (error) {
        console.error('❌ [SLOTS] Failed to notify backend of checkout start:', error);
      }
      
      // Start constant polling for character slots every 5 seconds while purchase is in progress
      console.log('🔄 [SLOTS] Starting constant polling (every 5s)...');
      const interval = setInterval(async () => {
        if (!isStillPurchasing) {
          console.log('🔄 [SLOTS] Purchase completed, stopping polling');
          cleanup();
          return;
        }
        
        console.log('🔄 [SLOTS] Polling character slots...');
        try {
          const response = await fetch('/api/user/preferences');
          if (response.ok) {
            const data = await response.json();
            const updatedUser = data.user;
            const newSlots = updatedUser?.characterSlots || 0;
            console.log(`💰 [SLOTS] Current slots: ${newSlots} (was ${slotsBeforePurchase})`);
            
            // If slots increased, purchase likely completed
            if (newSlots > slotsBeforePurchase) {
              console.log('✅ [SLOTS] Character slots increased! Purchase completed via polling');
              isStillPurchasing = false;
              setIsPurchasingSlot(false);
              setShowPurchaseOverlay(false); // Hide overlay when purchase detected
              if (onUserRefresh) {
                await onUserRefresh();
              }
              cleanup();
            }
          }
        } catch (error) {
          console.error('❌ [SLOTS] Error during polling:', error);
        }
      }, 5000); // Poll every 5 seconds
      pollingIntervals.push(interval);
      
      // Force reset button after 60 seconds (safety net)
      const forceReset = setTimeout(() => {
        console.log('⏰ [SLOTS] Force resetting button after 60s timeout');
        isStillPurchasing = false;
        setIsPurchasingSlot(false);
        cleanup();
      }, 60000);
      timeouts.push(forceReset);

      // Shared refresh slots function (matching credit overlay pattern)
      const refreshSlots = async () => {
        console.log('🔄 [SLOTS] Refreshing slots...');
        try {
          // Refresh UI
          if (onUserRefresh) {
            await onUserRefresh();
          }
          
          // Check if slots actually increased
          const res = await fetch('/api/user/preferences');
          const data = await res.json();
          const updatedUser = data.user;
          const newSlots = updatedUser?.characterSlots || 0;
          console.log(`💰 [SLOTS] Updated slots: ${newSlots} (was ${slotsBeforePurchase})`);
          
          // Hide overlay when slots actually increase (after animations)
          if (newSlots > slotsBeforePurchase) {
            // Wait for animations to complete
            const waitTime = 2000; // 2 seconds for React re-render + animations
            console.log(`⏳ [SLOTS] Slots increased, waiting ${waitTime}ms for animations...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            setShowPurchaseOverlay(false);
            setIsPurchasingSlot(false);
            console.log('✅ [SLOTS] Slots increased, hiding overlay after animations');
            return true; // Indicate success
          }
          return false; // Slots not updated yet
        } catch (err) {
          console.error('❌ [SLOTS] Error refreshing slots:', err);
          return false;
        }
      };

      // Function to start refresh attempts (used by both handlers)
      const startRefreshAttempts = () => {
        // First refresh attempt after 2 seconds (matching credit overlay)
        setTimeout(async () => {
          const updated = await refreshSlots();
          if (!updated) {
            // If not updated, try again after 4.5 seconds total
            setTimeout(async () => {
              const updated2 = await refreshSlots();
              // Hide overlay after final refresh regardless (safety net)
              // This handles the case where user closed checkout without purchasing
              if (!updated2) {
                setShowPurchaseOverlay(false);
                setIsPurchasingSlot(false);
                console.log('✅ [SLOTS] Loading overlay hidden after final refresh (4.5s) - slots may not have updated');
              }
            }, 2500); // 2s + 2.5s = 4.5s total
          }
        }, 2000);
      };

      const handlePopupClosed = async () => {
        console.log('🚪 [SLOTS] Popup closed');
        
        // Mark as no longer purchasing
        isStillPurchasing = false;
        
        // Remove event listeners to prevent double-firing
        window.removeEventListener('fsc:popup.closed', handlePopupClosed);
        window.removeEventListener('fsc:checkout.closed', handlePopupClosed);
        
        // Immediately hide overlay and reset button when popup closes
        // If order.complete fires, it will show overlay again and handle purchase
        setIsPurchasingSlot(false);
        setShowPurchaseOverlay(false);
        console.log('✅ [SLOTS] Overlay hidden immediately on popup close');
        
        // Wait a short time to see if order.complete fires
        // If it does, it will show overlay again and handle the purchase
        setTimeout(() => {
          // Remove order.complete listener after waiting
          window.removeEventListener('fsc:order.complete', handleOrderComplete);
          
          if (orderCompleteFired) {
            console.log('✅ [SLOTS] Order completed detected after popup close');
          } else {
            console.log('✅ [SLOTS] No order completed, overlay remains hidden');
          }
        }, 1000); // Wait 1 second for order.complete to fire
      };

      const handleOrderComplete = async () => {
        console.log('✅ [SLOTS] fsc:order.complete event fired');
        orderCompleteFired = true; // Mark that order completed
        
        console.log('🔄 [SLOTS] Checkout finished - resetting button and cleaning up...');
        
        // Show overlay again if it was hidden (in case popup closed before order.complete fired)
        setShowPurchaseOverlay(true);
        console.log('✅ [SLOTS] Overlay shown for purchase completion');
        
        // Log checkout completion server-side
        fetch('/api/fastspring/checkout/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            purchaseType: 'character-slot' 
          })
        })
        .then(res => {
          if (!res.ok) {
            console.error('❌ [SLOTS] Checkout completion log failed with status:', res.status);
          } else {
            console.log('✅ [SLOTS] Checkout completion logged successfully');
          }
        })
        .catch(err => console.error('❌ [SLOTS] Failed to log checkout completion:', err));
        
        // Mark as no longer purchasing
        isStillPurchasing = false;
        
        // Clean up polling and timeouts
        cleanup();
        
        // Don't reset button state or hide overlay yet - wait until slots actually update
        // Reset button state immediately (but keep overlay visible)
        setIsPurchasingSlot(false);
        console.log('✅ [SLOTS] Button state reset to false (overlay still visible)');
        
        // Remove all event listeners
        window.removeEventListener('fsc:popup.closed', handlePopupClosed);
        window.removeEventListener('fsc:checkout.closed', handlePopupClosed);
        window.removeEventListener('fsc:order.complete', handleOrderComplete);
        console.log('🧹 [SLOTS] Event listeners removed');
        
        // Start refresh attempts (will hide overlay after animations when slots increase)
        startRefreshAttempts();
      };

      console.log('👂 [SLOTS] Setting up FastSpring event listeners...');
      window.addEventListener('fsc:popup.closed', handlePopupClosed);
      window.addEventListener('fsc:checkout.closed', handlePopupClosed);
      window.addEventListener('fsc:order.complete', handleOrderComplete);
      console.log('✅ [SLOTS] Event listeners registered');

      fastspring.builder.reset();

      const sessionData: any = {
        account: {
          buyerReference: user.id
        },
        products: [{
          path: CHARACTER_SLOT_PRODUCT_PATH,
          quantity: 1
        }]
      };

      if (user.email) {
        sessionData.paymentContact = { email: user.email };
      }

      fastspring.builder.push(sessionData);
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('🛒 [SLOTS] Opening FastSpring checkout popup...');
      fastspring.builder.checkout();
      console.log('✅ [SLOTS] Checkout popup opened');
      
      // Wait a bit longer for FastSpring to render the modal
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Watch for the close button and add click listener
      let closeButtonListenerAttached = false;
      const attachCloseButtonListener = (targetDocument: Document = document) => {
        if (closeButtonListenerAttached) {
          console.log('⚠️ [SLOTS] Close button listener already attached, skipping');
          return true;
        }
        
        // Debug: Log what we're searching for
        console.log('🔍 [SLOTS] Searching for close button with ID: close-payment-modal in document:', targetDocument === document ? 'main' : 'other');
        
        // Try multiple ways to find the button
        let closeButton = targetDocument.getElementById('close-payment-modal');
        console.log('🔍 [SLOTS] getElementById result:', closeButton);
        
        if (!closeButton) {
          // Try querySelector as fallback
          closeButton = targetDocument.querySelector('#close-payment-modal') as HTMLButtonElement;
          console.log('🔍 [SLOTS] querySelector("#close-payment-modal") result:', closeButton);
        }
        if (!closeButton) {
          // Try finding by class or other attributes
          closeButton = targetDocument.querySelector('button[aria-label="Close"]') as HTMLButtonElement;
          console.log('🔍 [SLOTS] querySelector("button[aria-label="Close"]") result:', closeButton);
        }
        if (!closeButton) {
          // Try by class name
          closeButton = targetDocument.querySelector('button.close') as HTMLButtonElement;
          console.log('🔍 [SLOTS] querySelector("button.close") result:', closeButton);
        }
        if (!closeButton) {
          // Try finding in iframe if it exists
          const iframes = targetDocument.querySelectorAll('iframe');
          console.log('🔍 [SLOTS] Found iframes:', iframes.length);
          for (let i = 0; i < iframes.length; i++) {
            const iframe = iframes[i];
            console.log(`🔍 [SLOTS] Checking iframe ${i}:`, {
              src: iframe.src,
              id: iframe.id,
              className: iframe.className
            });
            try {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
              if (iframeDoc) {
                console.log(`🔍 [SLOTS] Can access iframe ${i} document`);
                closeButton = iframeDoc.getElementById('close-payment-modal') as HTMLButtonElement;
                if (closeButton) {
                  console.log('✅ [SLOTS] Close button found in iframe', i);
                  break;
                } else {
                  // Log all buttons in iframe for debugging
                  const allButtons = iframeDoc.querySelectorAll('button');
                  console.log(`🔍 [SLOTS] Iframe ${i} has ${allButtons.length} buttons:`, 
                    Array.from(allButtons).map(btn => ({
                      id: btn.id,
                      className: btn.className,
                      ariaLabel: btn.getAttribute('aria-label'),
                      text: btn.textContent?.trim()
                    }))
                  );
                }
              }
            } catch (e) {
              // Cross-origin iframe, can't access
              console.log(`⚠️ [SLOTS] Cannot access iframe ${i} content (cross-origin):`, e);
            }
          }
        }
        
        // Debug: Log all buttons with "close" in their ID, class, or aria-label
        if (!closeButton) {
          console.log('🔍 [SLOTS] Button not found, searching for any close-related buttons...');
          const allButtons = targetDocument.querySelectorAll('button');
          const closeRelatedButtons = Array.from(allButtons).filter(btn => 
            btn.id?.toLowerCase().includes('close') ||
            btn.className?.toLowerCase().includes('close') ||
            btn.getAttribute('aria-label')?.toLowerCase().includes('close')
          );
          console.log('🔍 [SLOTS] Found close-related buttons:', closeRelatedButtons.length);
          closeRelatedButtons.forEach((btn, idx) => {
            console.log(`🔍 [SLOTS] Close button candidate ${idx}:`, {
              id: btn.id,
              className: btn.className,
              ariaLabel: btn.getAttribute('aria-label'),
              text: btn.textContent?.trim()
            });
          });
        }
        
        if (closeButton) {
          console.log('✅ [SLOTS] Close button found!', closeButton);
          console.log('✅ [SLOTS] Button element:', {
            id: closeButton.id,
            className: closeButton.className,
            tagName: closeButton.tagName,
            ariaLabel: closeButton.getAttribute('aria-label')
          });
          
          const handleCloseClick = (e: Event) => {
            console.log('🚪🚪🚪 [SLOTS] CLOSE BUTTON CLICKED! Event:', e);
            console.log('🚪 [SLOTS] Hiding overlay immediately');
            setIsPurchasingSlot(false);
            setShowPurchaseOverlay(false);
            closeButton.removeEventListener('click', handleCloseClick);
            console.log('✅ [SLOTS] Close button listener removed');
          };
          
          closeButton.addEventListener('click', handleCloseClick, true); // Use capture phase
          closeButtonListenerAttached = true;
          console.log('✅ [SLOTS] Close button click listener attached successfully');
          return true;
        }
        
        return false;
      };
      
      // Function to check for popup windows
      const checkPopupWindows = () => {
        try {
          // Check if there are any popup windows (FastSpring might open a separate window)
          // We can't directly enumerate windows, but we can check if the current window has a reference
          // to a popup or if FastSpring stores it somewhere
          const fastspringWindow = (window as any).fastspring?.popupWindow;
          if (fastspringWindow && !fastspringWindow.closed) {
            console.log('🔍 [SLOTS] Found FastSpring popup window, checking its document...');
            try {
              const popupDoc = fastspringWindow.document;
              if (popupDoc && attachCloseButtonListener(popupDoc)) {
                return true;
              }
            } catch (e) {
              console.log('⚠️ [SLOTS] Cannot access popup window document:', e);
            }
          }
        } catch (e) {
          console.log('⚠️ [SLOTS] Error checking popup windows:', e);
        }
        return false;
      };
      
      // Try immediately in main document
      console.log('🔍 [SLOTS] Looking for close button immediately in main document...');
      let found = attachCloseButtonListener();
      
      // Also check popup windows
      if (!found) {
        found = checkPopupWindows();
      }
      
      if (!found) {
        console.log('⚠️ [SLOTS] Close button not found immediately, starting to watch...');
        
        // Use MutationObserver for better detection
        const observer = new MutationObserver((mutations) => {
          if (!closeButtonListenerAttached) {
            console.log('🔍 [SLOTS] DOM changed, checking for close button...');
            if (attachCloseButtonListener() || checkPopupWindows()) {
              observer.disconnect();
              console.log('✅ [SLOTS] Close button found via MutationObserver, observer disconnected');
            }
          }
        });
        
        // Observe the entire document
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        // Also poll as fallback
        const closeButtonInterval = setInterval(() => {
          if (!closeButtonListenerAttached) {
            console.log('🔍 [SLOTS] Polling for close button...');
            if (attachCloseButtonListener() || checkPopupWindows()) {
              clearInterval(closeButtonInterval);
              observer.disconnect();
              console.log('✅ [SLOTS] Close button found via polling, interval cleared');
            }
          } else {
            clearInterval(closeButtonInterval);
            observer.disconnect();
          }
        }, 200); // Check every 200ms
        
        // Stop watching after 10 seconds
        setTimeout(() => {
          if (!closeButtonListenerAttached) {
            console.log('⏰ [SLOTS] Timeout: Close button not found after 10 seconds');
            clearInterval(closeButtonInterval);
            observer.disconnect();
          }
        }, 10000);
      }

    } catch (error) {
      console.error('Error opening FastSpring checkout:', error);
      alert('Failed to open checkout. Please try again.');
      setIsPurchasingSlot(false);
    }
  };

  const handleEditName = (character: Character) => {
    setEditingName(character.id);
    setTempName(character.name);
  };

  const handleSaveName = async (characterId: string) => {
    if (!tempName.trim()) return;

    // Find the character to update
    const characterToUpdate = characters.find(c => c.id === characterId);
    if (!characterToUpdate) return;

    // Create updated character with new name
    const updatedCharacter = { ...characterToUpdate, name: tempName.trim() };

    try {
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tempName.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to update character name');
      }

      const { character: serverUpdatedCharacter } = await response.json();
      onCharacterUpdate(serverUpdatedCharacter);
      setEditingName(null);
      setTempName('');
    } catch (error) {
      console.error('Error updating character name:', error);
      // Queue for offline sync if the request failed
      queueOfflineChange('character_update', {
        characterId: characterId,
        updates: { name: tempName.trim() }
      });
      
      // Still update locally and close the editor
      onCharacterUpdate(updatedCharacter);
      setEditingName(null);
      setTempName('');
    }
  };

  const handleCancelEditName = () => {
    setEditingName(null);
    setTempName('');
  };

  // Handle clicks outside the name edit input to cancel editing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingName && nameEditRef.current && !nameEditRef.current.contains(event.target as Node)) {
        setEditingName(null);
        setTempName('');
      }
    };

    if (editingName) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingName]);

  // Position check button at the end of the input
  useEffect(() => {
    if (editingName && inputContainerRef.current && checkButtonRef.current) {
      const updateButtonPosition = () => {
        const inputContainer = inputContainerRef.current;
        const checkButton = checkButtonRef.current;
        if (inputContainer && checkButton) {
          const inputWidth = inputContainer.offsetWidth;
          checkButton.style.left = `${inputWidth + 8}px`; // 8px for gap (0.5rem)
        }
      };

      updateButtonPosition();
      window.addEventListener('resize', updateButtonPosition);

      return () => {
        window.removeEventListener('resize', updateButtonPosition);
      };
    }
  }, [editingName, tempName]);

  const handleDeleteCharacter = async (characterId: string) => {
    setIsDeleting(characterId);
    try {
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete character');
      }

      // Notify parent component about the deletion
      await onCharacterDelete(characterId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting character:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const canCreateNew = characters.length < user.characterSlots;

  // Get theme colors for background
  const migratedTheme = migrateTheme(activeCharacter?.theme || 'obsidian-veil') as Theme;
  const themeConfig = themes[migratedTheme];
  const colors = themeConfig?.colors;

  // Memoize particle positions and animation values to prevent reset on re-render
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
  }, []); // Empty dependency array - only generate once

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: colors ? `linear-gradient(to bottom, ${colors.background}, ${colors.primary}, ${colors.secondary})` : 'linear-gradient(to bottom, #581c87, #1e3a8a, #312e81)'
      }}
    >
      {/* Purchase Loading Overlay */}
      {showPurchaseOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-[10000]"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-yellow-400 border-t-transparent pixelated mb-4"
          />
          <p className="font-pixel text-yellow-300 text-lg mb-2">
            Processing your purchase...
          </p>
          <p className="font-pixel text-gray-400 text-sm">
            Please wait while we confirm your transaction
          </p>
        </motion.div>
      )}
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 opacity-20 pixelated"
          style={{ backgroundColor: colors?.accent || '#fbbf24' }}
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-24 h-24 opacity-20 pixelated"
          style={{ backgroundColor: colors?.primary || '#ec4899' }}
          animate={{
            rotate: -360,
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-16 h-16 opacity-20 pixelated"
          style={{ backgroundColor: colors?.secondary || '#10b981' }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 opacity-30 pixelated"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              backgroundColor: colors?.text || '#ffffff'
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      <div className="flex-1 p-4">
      {/* <MovingGradientBackground theme={activeCharacter?.theme || 'obsidian-veil'} /> */}
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <AppNavigation
          activeCharacter={activeCharacter || undefined}
          currentPage="character-select"
          onBack={onBack}
          theme={activeCharacter?.theme || 'obsidian-veil'}
        />

        {/* Character Grid - Always show exactly 3 slots */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 auto-rows-fr">
          {/* Render existing characters first */}
          {characters.map((character, index) => {
            const isLocked = character.isLocked;
            return (
            <motion.div
              key={character.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.5,
                layout: { duration: 0.5, ease: "easeInOut" }
              }}
            >
               <Card
                 hover={!isLocked}
                 onClick={() => !isLocked ? handleCharacterSwitch(character) : null}
                 theme={character.theme}
                 className={`transition-all duration-200 h-full ${
                   isLocked 
                     ? 'opacity-60 cursor-not-allowed border-2 border-gray-600' 
                     : `cursor-pointer ${
                         character.id === activeCharacter?.id
                           ? 'animate-gentle-pulse'
                           : ''
                       }`
                 }`}
               >
                <div className="flex items-center gap-2 -pl-6 -ml-4 pr-4 py-4 relative">
                  {/* Lock Overlay for locked characters */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <div className="text-4xl text-gray-400">🔒</div>
                    </div>
                  )}
                  
                  {/* Character Avatar - Left Side */}
                  <div className="flex-shrink-0">
                    {character.avatar ? (
                      character.avatar.options?.layeredAvatar ? (
                        <LayeredAvatarRenderer 
                          layeredAvatar={character.avatar.options.layeredAvatar}
                          size="lg"
                          className="w-32 h-40"
                        />
                      ) : (
                        <>
                        <img
                          src={getCachedImageUrl(character.avatar.image)}
                          alt={character.avatar.name}
                          className="w-32 h-40 pixelated object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                          <div className="w-32 h-40 flex items-center justify-center text-6xl text-gray-400 bg-gray-800 pixelated" style={{ display: 'none' }}>
                            👤
                          </div>
                        </>
                      )
                    ) : (
                      <div className="w-32 h-40 flex items-center justify-center text-6xl text-gray-400 bg-gray-800 pixelated">
                        👤
                      </div>
                    )}
                  </div>
                  
                  {/* Character Info - Right Side */}
                  <div className="flex-1 min-w-0 flex-shrink-0">
                    {isLocked ? (
                      <div className="mb-1">
                        <h3 className="font-pixel text-lg text-gray-400">
                          {character.name}
                        </h3>
                        <div className="font-pixel text-sm text-gray-500 bg-gray-600/20 px-2 py-1 pixelated w-fit mt-1">
                          LOCKED
                        </div>
                      </div>
                    ) : editingName === character.id ? (
                      <div ref={nameEditRef} className="flex items-center gap-2 mb-1 relative" style={{ minHeight: '1.75rem' }}>
                         <h3 className="font-pixel text-lg text-white whitespace-nowrap opacity-0">
                           {character.name}
                         </h3>
                         <Button
                           variant="secondary"
                           size="sm"
                           className="text-xs px-1 py-1 opacity-0 pointer-events-none flex-shrink-0"
                           style={{ width: '1.5rem', height: '1.5rem' }}
                         >
                           <Check className="w-4 h-4" />
                         </Button>
                         <div ref={inputContainerRef} className="absolute left-0" style={{ maxWidth: '200px' }}>
                            <Input
                              value={tempName}
                              onChange={setTempName}
                              className="text-lg font-pixel border-0 rounded-none bg-transparent px-0 py-1 w-full"
                              theme={character.theme}
                              maxLength={15}
                             onKeyDown={(e) => {
                               if (e.key === 'Enter') {
                                 handleSaveName(character.id);
                               } else if (e.key === 'Escape') {
                                 handleCancelEditName();
                               }
                             }}
                             autoFocus
                           />
                         </div>
                         <div ref={checkButtonRef} className="absolute">
                           <Button
                             onClick={() => handleSaveName(character.id)}
                             variant="secondary"
                             size="sm"
                             className="text-xs px-1 py-1 opacity-60 hover:opacity-100 navbar-button-icon bg-transparent border-none flex-shrink-0"
                             theme={character.theme}
                             style={{
                               background: 'transparent',
                               borderWidth: 0,
                               borderColor: 'transparent'
                             }}
                           >
                             <Check className="w-4 h-4" />
                           </Button>
                         </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-pixel text-lg text-white whitespace-nowrap">
                          {character.name}
                        </h3>
                         <Button
                           onClick={(e) => {
                             e?.stopPropagation();
                             handleEditName(character);
                           }}
                           variant="secondary"
                           size="sm"
                           className="text-xs px-1 py-1 opacity-60 hover:opacity-100 navbar-button-icon bg-transparent border-none"
                           theme={character.theme}
                           style={{
                             background: 'transparent',
                             border: 'none'
                           }}
                         >
                           <Pencil className="w-4 h-4" />
                         </Button>
                      </div>
                    )}
                    
                    <p className="font-pixel text-sm text-gray-300 mb-2">
                      {themes[migrateTheme(character.theme)]?.name || 'Unknown Theme'}
                    </p>
                    
                    {character.description && (
                      <p className="font-pixel text-xs text-gray-400 mb-3 line-clamp-2">
                        {character.description}
                      </p>
                    )}

                    {/* Status and Actions */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {isLocked ? (
                          <span className="font-pixel text-xs text-gray-500 bg-gray-600/20 px-2 py-1 pixelated">
                            LOCKED
                          </span>
                        ) : character.id === activeCharacter?.id ? (
                          <span className="font-pixel text-xs text-yellow-300 bg-yellow-400/20 px-2 py-1 pixelated">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="font-pixel text-xs text-gray-400">
                            {isLoading === character.id ? 'SWITCHING...' : 'CLICK TO SWITCH'}
                          </span>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      {!isLocked && (
                        <div className="flex gap-2">
                           <Button
                             onClick={(e) => {
                               e?.stopPropagation();
                               handleEditAvatar(character);
                             }}
                             variant="secondary"
                             className="text-[10px] xs:text-xs sm:text-sm px-2 py-1 flex-1"
                             theme={character.theme}
                             style={{
                               background: 'linear-gradient(to bottom, #1F2937, #111827)',
                               borderColor: '#1F2937'
                             }}
                           >
                             EDIT AVATAR
                           </Button>
                           <Button
                             onClick={(e) => {
                               e?.stopPropagation();
                               setShowDeleteConfirm(character.id);
                             }}
                             variant="secondary"
                             className="text-xs px-2 py-1 navbar-button-icon"
                             theme={character.theme}
                             style={{
                               background: 'linear-gradient(to bottom, #1F2937, #111827)',
                               borderColor: '#1F2937'
                             }}
                           >
                             <Trash className="w-4 h-4" />
                           </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
            );
          })}

          {/* Fill remaining slots based on user's characterSlots */}
          {Array.from({ length: Math.max(0, user.characterSlots - characters.length) }, (_, index) => {
            const slotIndex = characters.length + index;
            const canCreate = slotIndex < user.characterSlots;
            
            return (
              <motion.div
                key={`empty-slot-${index}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: slotIndex * 0.1, 
                  duration: 0.5,
                  layout: { duration: 0.5, ease: "easeInOut" }
                }}
              >
                {/* Available slot - show create new */}
                <Card
                  hover
                  onClick={onCreateNew}
                  theme="obsidian-veil"
                  className="cursor-pointer transition-all duration-200 hover:border-green-500 border-dashed border-2 border-gray-600 h-full"
                >
                  <div 
                    className="flex items-center pt-4 mt-8"
                    style={{
                      gap: '1rem', // Horizontal gap between icon and text (16px)
                      padding: '1rem' // Card padding (16px)
                    }}
                  >
                    {/* Plus Icon - Left Side */}
                    <div 
                      className="flex-shrink-0 flex items-center justify-center"
                      style={{
                        width: '6rem', // Icon container width (96px)
                        height: '6rem' // Icon container height (96px)
                      }}
                    >
                      <div className="text-6xl text-gray-400">➕</div>
                    </div>
                    
                    {/* Create Info - Right Side */}
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-pixel text-lg text-white"
                        style={{
                          marginBottom: '0.25rem' // Space below "CREATE NEW" (4px)
                        }}
                      >
                        CREATE NEW
                      </h3>
                      <p 
                        className="font-pixel text-sm text-gray-300"
                        style={{
                          marginBottom: '0.75rem' // Space below "Start a new adventure" (12px)
                        }}
                      >
                        Start a new adventure
                      </p>
                      <div className="font-pixel text-xs text-green-400 bg-green-400/20 px-2 py-1 pixelated w-fit">
                        AVAILABLE
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {/* Always show purchase slot button after all character slots - Only for admin accounts */}
          {user.email && ADMIN_EMAILS.includes(user.email) && (
            <motion.div
              key="purchase-slot"
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: (characters.length + Math.max(0, user.characterSlots - characters.length)) * 0.1, 
                duration: 0.5,
                layout: { duration: 0.5, ease: "easeInOut" }
              }}
            >
              <Card
                hover
                onClick={handlePurchaseCharacterSlot}
                theme="obsidian-veil"
                className="cursor-pointer transition-all duration-200 hover:border-yellow-500 border-dashed border-2 border-yellow-600 h-full"
              >
                <div className="flex flex-col items-center justify-center pt-2 pb-2 p-6 text-center">
                  {/* Title at the top, centered */}
                  <h3 className="font-pixel text-3xl text-white mb-4 whitespace-nowrap">
                    EMBARK ON A NEW JOURNEY
                  </h3>
                  
                  {/* Plus icon */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-gray-800 flex items-center justify-center pixelated">
                      <div className="text-3xl text-yellow-400">➕</div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="font-pixel text-sm text-gray-300 mb-4 whitespace-nowrap">
                    Get a new character slot
                  </p>
                  
                  {/* Price */}
                  <p className="font-pixel text-yellow-400" style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                    ${CHARACTER_SLOT_PRICE.toFixed(2)}
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Character Slots Info */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
           <Card theme={activeCharacter?.theme || 'obsidian-veil'} className="max-w-md mx-auto">
             <div className="p-4">
               <h3 className="font-pixel text-lg text-white mb-3">Character Slots</h3>
               <div className="flex items-center justify-between mb-4">
                 <div>
                   <p className="font-pixel text-gray-300 text-sm">Current Slots</p>
                   <p className="font-pixel text-white text-2xl">{user.characterSlots || 1}</p>
                 </div>
                 <div className="text-right">
                   <p className="font-pixel text-gray-300 text-sm">Add Slot</p>
                   <p className="font-pixel text-yellow-400 text-2xl">${CHARACTER_SLOT_PRICE.toFixed(2)}</p>
                 </div>
               </div>
               <p className="font-pixel text-white text-sm mb-3">
                 Characters: <span className="font-pixel">{characters.length}/{user.characterSlots}</span>
               </p>
               <Button 
                 onClick={handlePurchaseCharacterSlot}
                 disabled={isPurchasingSlot}
                 variant="primary" 
                 className="mt-3 text-lg px-6 py-2 w-full"
                 theme={activeCharacter?.theme || 'obsidian-veil'}
               >
                 {isPurchasingSlot ? 'Processing...' : 'Add Character Slot'}
               </Button>
             </div>
           </Card>
        </motion.div> */}
      </div>

      {/* Avatar Builder Modal */}
      {showAvatarBuilder && editingCharacter && (
        <LayeredAvatarBuilder
          onSave={handleAvatarSave}
          onCancel={handleAvatarCancel}
          currentAvatar={editingCharacter.avatar?.options?.layeredAvatar}
          theme={editingCharacter.theme}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="p-6 rounded-lg pixelated border-2 max-w-md w-full"
            style={{
              backgroundColor: themes[activeCharacter?.theme || 'obsidian-veil'].colors.background,
              borderColor: '#ef4444' // red-500 for danger
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-pixel text-lg mb-4 text-center text-red-400">
              ⚠️ DELETE CHARACTER
            </h3>
            
            <p className="font-pixel mb-6 text-center" style={{ color: themes[activeCharacter?.theme || 'obsidian-veil'].colors.text }}>
              Are you sure you want to delete this character? This action cannot be undone and will also delete all associated journal entries.
            </p>
            
             <div className="flex gap-3">
               <Button
                 onClick={() => setShowDeleteConfirm(null)}
                 variant="secondary"
                 className="flex-1"
                 theme="obsidian-veil"
                 disabled={isDeleting === showDeleteConfirm}
                 style={{
                   background: 'linear-gradient(to bottom, #6B7280, #4B5563)',
                   borderColor: '#6B7280',
                   color: '#FFFFFF',
                   boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                   textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8), -1px -1px 0px rgba(0, 0, 0, 0.8), 1px -1px 0px rgba(0, 0, 0, 0.8), -1px 1px 0px rgba(0, 0, 0, 0.8), 0px 1px 0px rgba(0, 0, 0, 0.8), 0px -1px 0px rgba(0, 0, 0, 0.8), 1px 0px 0px rgba(0, 0, 0, 0.8), -1px 0px 0px rgba(0, 0, 0, 0.8)'
                 }}
               >
                 CANCEL
               </Button>
               <Button
                 onClick={() => handleDeleteCharacter(showDeleteConfirm)}
                 variant="destructive"
                 className="flex-1"
                 theme="obsidian-veil"
                 disabled={isDeleting === showDeleteConfirm}
                 style={{
                   background: 'linear-gradient(to bottom, #ef4444, #dc2626)',
                   borderColor: '#dc2626',
                   color: '#FFFFFF',
                   boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                   textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8), -1px -1px 0px rgba(0, 0, 0, 0.8), 1px -1px 0px rgba(0, 0, 0, 0.8), -1px 1px 0px rgba(0, 0, 0, 0.8), 0px 1px 0px rgba(0, 0, 0, 0.8), 0px -1px 0px rgba(0, 0, 0, 0.8), 1px 0px 0px rgba(0, 0, 0, 0.8), -1px 0px 0px rgba(0, 0, 0, 0.8)'
                 }}
               >
                 {isDeleting === showDeleteConfirm ? 'DELETING...' : 'DELETE'}
               </Button>
             </div>
          </motion.div>
        </motion.div>
      )}

      {/* Character Switch Loading Overlay */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-[10000]"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-yellow-400 border-t-transparent pixelated mb-4"
          />
          <p className="font-pixel text-yellow-300 text-lg">
            Switching character...
          </p>
        </motion.div>
      )}

      {/* Character Delete Loading Overlay */}
      {isDeleting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-[10000]"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-yellow-400 border-t-transparent pixelated mb-4"
          />
          <p className="font-pixel text-yellow-300 text-lg">
            Deleting character...
          </p>
        </motion.div>
      )}
      </div>
      {/* <Footer /> */}
    </div>
  );
}
