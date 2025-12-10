'use client';

import { useState, useEffect, useMemo } from 'react';
// import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';
import MovingGradientBackground from '@/components/MovingGradientBackground';
import AppNavigation from '@/components/AppNavigation';
import ConfirmationModal from '@/components/ConfirmationModal';
import AlertModal from '@/components/AlertModal';
import { User, Character, Theme } from '@/types';
// SUBSCRIPTION CODE - COMMENTED OUT FOR CREDITS MIGRATION - Imports kept for commented-out UI code
import { USE_SHARED_LIMITS, SUBSCRIPTION_LIMITS } from '@/lib/subscription-limits';
import { migrateTheme } from '@/lib/theme-migration';
import { themes } from '@/themes';
// SUBSCRIPTION CODE - COMMENTED OUT FOR CREDITS MIGRATION - Imports kept for commented-out UI code
import { isPaidPlan, hasPremiumAccess } from '@/lib/fastspring';
import { CREDIT_PACKAGES, CHARACTER_SLOT_PRICE, CHARACTER_SLOT_PRODUCT_PATH, INK_VIAL_COSTS, LOW_CREDITS_THRESHOLD, STARTER_KIT_ELIGIBILITY_DAYS } from '@/lib/credits';
import { useCredits } from '@/hooks/useCredits';
import { useStarterKitEligibility } from '@/hooks/useStarterKitEligibility';
import { setCachedCredits, markPurchaseCompleted } from '@/lib/credits-cache';
// import Footer from './Footer';

interface SubscriptionData {
  hasSubscription: boolean;
  subscription?: {
    id: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    customer: {
      id: string;
      email: string;
    };
  };
}

interface TributePageProps {
  user: User;
  activeCharacter: Character;
  onBack: () => void;
}

export default function TributePage({ user, activeCharacter, onBack }: TributePageProps) {
  // SUBSCRIPTION CODE - COMMENTED OUT FOR CREDITS MIGRATION - Variables kept for commented-out UI code
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isCreating, setIsCreating] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isCanceling, setIsCanceling] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  
  // Credits system state
  const [credits, setCredits] = useState<number>(user.credits || 150);
  const [isLowOnCredits, setIsLowOnCredits] = useState(false);
  
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [showPurchaseOverlay, setShowPurchaseOverlay] = useState(false);
  // Character slot purchase moved to CharacterSelector
  // const [isPurchasingSlot, setIsPurchasingSlot] = useState(false);
  
  // Modal states
  // SUBSCRIPTION CODE - COMMENTED OUT FOR CREDITS MIGRATION
  // const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    variant: 'info' as 'success' | 'error' | 'info'
  });

  // Initialize cache from user object if available
  useEffect(() => {
    if (user?.credits !== undefined) {
      setCachedCredits(user.id, {
        credits: user.credits,
        isLow: user.credits <= LOW_CREDITS_THRESHOLD,
        hasPurchasedStarterKit: user.hasPurchasedStarterKit || false
      });
    }
  }, [user?.id, user?.credits, user?.hasPurchasedStarterKit]);

  // Fetch credit balance and starter kit eligibility with caching
  const { credits: cachedCredits, isLow: cachedIsLow } = useCredits();
  const { eligible: cachedEligible } = useStarterKitEligibility();
  
  // Calculate starter kit eligibility directly from user data (prevents flash)
  // Only use hook value as fallback if user data is incomplete
  const starterKitEligible = useMemo(() => {
    // If we have complete user data, calculate from it immediately
    if (user?.hasPurchasedStarterKit !== undefined && user?.createdAt) {
      // If already purchased, not eligible
      if (user.hasPurchasedStarterKit) {
        return false;
      }
      // Check if within eligibility window (30 days)
      const daysSinceCreation = Math.floor(
        (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceCreation <= STARTER_KIT_ELIGIBILITY_DAYS;
    }
    // Fallback to hook value if user data incomplete
    return cachedEligible;
  }, [user?.hasPurchasedStarterKit, user?.createdAt, cachedEligible]);
  
  useEffect(() => {
    setCredits(cachedCredits);
    setIsLowOnCredits(cachedIsLow);
  }, [cachedCredits, cachedIsLow]);

  // SUBSCRIPTION CODE - COMMENTED OUT FOR CREDITS MIGRATION
  /*
  useEffect(() => {
    // Use user data directly instead of calling API
    const hasActiveSubscription = hasPremiumAccess(user);
    setSubscription({ hasSubscription: hasActiveSubscription });
  }, [user]);
  */

  // SUBSCRIPTION CODE - COMMENTED OUT FOR CREDITS MIGRATION
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCreateSubscription = async () => {
    setIsCreating(true);
    try {
      // Check if FastSpring API is loaded
      if (typeof window === 'undefined' || !(window as any).fastspring) {
        // Wait a bit for the script to load
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!(window as any).fastspring) {
          alert('FastSpring checkout is loading. Please try again in a moment.');
          setIsCreating(false);
          return;
        }
      }

      const fastspring = (window as any).fastspring;
      const productPath = getProductPath(selectedBillingCycle);
      
      // Notify backend that checkout is starting - this creates a temporary mapping
      // that webhooks can use to link the account ID to the user
      try {
        await fetch('/api/fastspring/checkout/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Failed to notify backend of checkout start:', error);
        // Continue anyway - webhook will try to match
      }

      // Set up simple popup close handler to reset button state
      const handlePopupClosed = () => {
        setIsCreating(false);
        window.removeEventListener('fsc:popup.closed', handlePopupClosed);
        window.removeEventListener('fsc:checkout.closed', handlePopupClosed);
      };
      window.addEventListener('fsc:popup.closed', handlePopupClosed);
      window.addEventListener('fsc:checkout.closed', handlePopupClosed);

      // Reset the session first (clear any existing cart)
      fastspring.builder.reset();

      // Build session object with account (buyerReference) and products
      // Using direct session object format - more reliable than event-based
      const sessionData: any = {
        account: {
          buyerReference: user.id
        },
        products: [{
          path: productPath,
          quantity: 1
        }]
      };

      // Add payment contact if available (helps with tax calculation)
      if (user.email) {
        sessionData.paymentContact = {
          email: user.email
        };
      }

      // Push the complete session data at once
      fastspring.builder.push(sessionData);

      // Small delay to ensure session is ready (FastSpring needs a moment to process)
      await new Promise(resolve => setTimeout(resolve, 200));

      // Open the popup checkout
      fastspring.builder.checkout();
      
      // Set a timeout to reset button state if popup closes without event
      // (some browsers/popup blockers might prevent events from firing)
      setTimeout(() => {
        // Check if popup is still open by checking if button is still in creating state
        // If it is, the popup likely closed without firing events
        if (isCreating) {
          setIsCreating(false);
          // Reload page after a delay to check if subscription was created via webhook
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      }, 60000); // 60 second timeout

    } catch (error) {
      console.error('Error opening FastSpring checkout:', error);
      alert('Failed to open checkout. Please try again.');
      setIsCreating(false);
    }
  };

  // Helper function to get product path
  function getProductPath(billingCycle: 'weekly' | 'monthly' | 'yearly'): string {
    const paths = {
      weekly: 'quillia-weekly-tribute',
      monthly: 'quillia-monthly-tribute',
      yearly: 'quillia-yearly-tribute'
    };
    return paths[billingCycle];
  }

  // Credit purchase handler
  const handlePurchaseCredits = async (packageKey: keyof typeof CREDIT_PACKAGES) => {
    console.log('🛒 [CREDITS] Starting purchase for package:', packageKey);
    setIsPurchasing(packageKey);
    setShowPurchaseOverlay(true); // Show loading overlay
    const creditsBeforePurchase = credits; // Capture for comparison
    const pollingIntervals: NodeJS.Timeout[] = [];
    const timeouts: NodeJS.Timeout[] = [];
    
    try {
      // Check if FastSpring API is loaded
      if (typeof window === 'undefined' || !(window as any).fastspring) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!(window as any).fastspring) {
          console.error('❌ [CREDITS] FastSpring not loaded');
          alert('FastSpring checkout is loading. Please try again in a moment.');
          setIsPurchasing(null);
          return;
        }
      }

      const fastspring = (window as any).fastspring;
      const packageInfo = CREDIT_PACKAGES[packageKey];
      
      console.log('🛒 [CREDITS] FastSpring loaded, notifying backend...');
      // Notify backend that checkout is starting
      try {
        await fetch('/api/fastspring/checkout/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        console.log('✅ [CREDITS] Backend notified of checkout start');
      } catch (error) {
        console.error('❌ [CREDITS] Failed to notify backend of checkout start:', error);
      }
      
      // Cleanup function
      const cleanup = () => {
        console.log('🧹 [CREDITS] Cleaning up polling and timeouts...');
        pollingIntervals.forEach(interval => clearInterval(interval));
        timeouts.forEach(timeout => clearTimeout(timeout));
        pollingIntervals.length = 0;
        timeouts.length = 0;
      };
      
      // Track if we're still purchasing (using a flag that persists)
      let isStillPurchasing = true;
      let orderCompleteFired = false; // Track if order.complete event fired
      
      // Start constant polling for credits every 4 seconds while purchase is in progress
      console.log('🔄 [CREDITS] Starting constant polling (every 4s)...');
      const interval = setInterval(async () => {
        if (!isStillPurchasing) {
          console.log('🔄 [CREDITS] Purchase completed, stopping polling');
          cleanup();
          return;
        }
        
        console.log('🔄 [CREDITS] Polling credits...');
        try {
          const response = await fetch('/api/credits/balance');
          if (response.ok) {
            const data = await response.json();
            const newCredits = data.credits;
            console.log(`💰 [CREDITS] Current balance: ${newCredits} (was ${creditsBeforePurchase})`);
            
              // If credits increased, purchase likely completed
              if (newCredits > creditsBeforePurchase) {
                console.log('✅ [CREDITS] Credits increased! Purchase completed via polling');
                isStillPurchasing = false;
                setIsPurchasing(null);
                setCredits(newCredits);
                setIsLowOnCredits(data.isLow);
                
                // Update cache immediately with new value
                setCachedCredits(user.id, {
                  credits: newCredits,
                  isLow: data.isLow
                });
                
                window.dispatchEvent(new CustomEvent('credits:purchase'));
                setShowPurchaseOverlay(false); // Hide overlay when purchase detected
                cleanup();
              }
          }
        } catch (error) {
          console.error('❌ [CREDITS] Error during polling:', error);
        }
      }, 4000); // Poll every 4 seconds
      pollingIntervals.push(interval);
      
      // Force reset button after 60 seconds (safety net)
      const forceReset = setTimeout(() => {
        console.log('⏰ [CREDITS] Force resetting button after 60s timeout');
        if (isPurchasing === packageKey) {
          setIsPurchasing(null);
        }
        cleanup();
      }, 60000);
      timeouts.push(forceReset);

      const handleOrderComplete = () => {
        console.log('✅ [CREDITS] fsc:order.complete event fired for package:', packageKey);
        orderCompleteFired = true; // Mark that order completed
        console.log('🔄 [CREDITS] Checkout finished - resetting button and cleaning up...');
        
        // Show overlay again if it was hidden (in case popup closed before order.complete fired)
        setShowPurchaseOverlay(true);
        console.log('✅ [CREDITS] Overlay shown for purchase completion');
        
        // Log checkout completion server-side
        fetch('/api/fastspring/checkout/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            packageKey, 
            purchaseType: 'credits' 
          })
        })
        .then(res => {
          if (!res.ok) {
            console.error('❌ [CREDITS] Checkout completion log failed with status:', res.status);
          } else {
            console.log('✅ [CREDITS] Checkout completion logged successfully');
          }
        })
        .catch(err => console.error('❌ [CREDITS] Failed to log checkout completion:', err));
        
        // Mark as no longer purchasing
        isStillPurchasing = false;
        
        // Clean up polling and timeouts
        cleanup();
        
        // Reset button state immediately when order completes
        setIsPurchasing(null);
        console.log('✅ [CREDITS] Button state reset to null');
        
        // Remove all event listeners
        window.removeEventListener('fsc:popup.closed', handlePopupClosed);
        window.removeEventListener('fsc:checkout.closed', handlePopupClosed);
        window.removeEventListener('fsc:order.complete', handleOrderComplete);
        console.log('🧹 [CREDITS] Event listeners removed');
        
        // Refresh credits after purchase (trigger event-driven cache invalidation)
        const refreshCredits = async () => {
          console.log('🔄 [CREDITS] Refreshing credits...');
          // Dispatch event to invalidate cache
          window.dispatchEvent(new CustomEvent('credits:purchase'));
          
          // Also fetch fresh data
          try {
            const res = await fetch('/api/credits/balance', { cache: 'no-cache' });
            const data = await res.json();
            console.log(`💰 [CREDITS] Updated balance: ${data.credits} (was ${creditsBeforePurchase})`);
            setCredits(data.credits);
            setIsLowOnCredits(data.isLow);
            
            // Update cache immediately with new value
            setCachedCredits(user.id, {
              credits: data.credits,
              isLow: data.isLow
            });
            
            // Hide overlay when credits actually increase
            if (data.credits > creditsBeforePurchase) {
              setShowPurchaseOverlay(false);
              console.log('✅ [CREDITS] Credits increased, hiding overlay');
              return true; // Indicate success
            }
            return false; // Credits not updated yet
          } catch (err) {
            console.error('❌ [CREDITS] Error refreshing credits:', err);
            return false;
          }
        };
        
        // First refresh attempt after 2 seconds
        setTimeout(async () => {
          const updated = await refreshCredits();
          if (!updated) {
            // If not updated, try again after 4.5 seconds total
            setTimeout(async () => {
              const updated2 = await refreshCredits();
              // Hide overlay after final refresh regardless (safety net)
              if (!updated2) {
                setShowPurchaseOverlay(false);
                console.log('✅ [CREDITS] Loading overlay hidden after final refresh (4.5s) - credits may not have updated');
              }
            }, 2500); // 2s + 2.5s = 4.5s total
          }
        }, 2000);
        
        // Also hide overlay immediately if order completes (but keep it visible for a bit to show processing)
        // The 4.5s timeout above will handle the final hide
      };

      const handlePopupClosed = () => {
        console.log('🚪 [CREDITS] Popup closed for package:', packageKey);
        
        // Remove event listeners to prevent double-firing
        window.removeEventListener('fsc:popup.closed', handlePopupClosed);
        window.removeEventListener('fsc:checkout.closed', handlePopupClosed);
        
        // Immediately hide overlay and reset button when popup closes
        // If order.complete fires, it will show overlay again and handle purchase
        setIsPurchasing(null);
        setShowPurchaseOverlay(false);
        console.log('✅ [CREDITS] Overlay hidden immediately on popup close');
        
        // Wait a short time to see if order.complete fires
        // If it does, it will show overlay again and handle the purchase
        setTimeout(() => {
          // Remove order.complete listener after waiting
          window.removeEventListener('fsc:order.complete', handleOrderComplete);
          
          if (orderCompleteFired) {
            console.log('✅ [CREDITS] Order completed detected after popup close');
          } else {
            console.log('✅ [CREDITS] No order completed, overlay remains hidden');
          }
        }, 1000); // Wait 1 second for order.complete to fire
      };

      console.log('👂 [CREDITS] Setting up FastSpring event listeners...');
      window.addEventListener('fsc:popup.closed', handlePopupClosed);
      window.addEventListener('fsc:checkout.closed', handlePopupClosed);
      window.addEventListener('fsc:order.complete', handleOrderComplete);
      console.log('✅ [CREDITS] Event listeners registered');
      
      // Alternative detection: Watch for FastSpring iframe removal/hiding
      const watchFastSpringIframe = () => {
        const fastspringIframe = document.getElementById('fsc-popup-frame') || 
                                 document.querySelector('iframe[id*="fsc"]') ||
                                 document.querySelector('iframe[src*="fastspring"]') ||
                                 document.querySelector('iframe[src*="onfastspring"]');
        
        if (fastspringIframe) {
          console.log('🔍 [CREDITS] Found FastSpring iframe, watching for removal...');
          
          // Watch for iframe removal from DOM
          const iframeObserver = new MutationObserver((mutations) => {
            const stillExists = document.getElementById('fsc-popup-frame') || 
                               document.querySelector('iframe[id*="fsc"]') ||
                               document.querySelector('iframe[src*="fastspring"]') ||
                               document.querySelector('iframe[src*="onfastspring"]');
            
            if (!stillExists) {
              console.log('🔍 [CREDITS] FastSpring iframe removed from DOM - popup likely closed');
              console.log('🔍 [CREDITS] State check:', {
                orderCompleteFired,
                isPurchasing,
                packageKey,
                shouldHide: !orderCompleteFired && isPurchasing === packageKey
              });
              if (!orderCompleteFired && isPurchasing === packageKey) {
                console.log('🚪🚪🚪 [CREDITS] Closing detected via iframe removal - FORCING overlay hide');
                setIsPurchasing(null);
                setShowPurchaseOverlay(false);
                console.log('✅ [CREDITS] Overlay state updated - should be hidden now');
                iframeObserver.disconnect();
              } else if (!orderCompleteFired) {
                console.log('🔧 [CREDITS] Force hiding overlay since iframe is gone and no order completed');
                setIsPurchasing(null);
                setShowPurchaseOverlay(false);
                iframeObserver.disconnect();
              } else {
                console.log('⚠️ [CREDITS] Order completed, not hiding overlay');
              }
            }
          });
          
          // Watch the parent container for iframe removal
          if (fastspringIframe.parentElement) {
            iframeObserver.observe(fastspringIframe.parentElement, {
              childList: true,
              subtree: false
            });
          }
          
          // Also watch document body in case iframe is removed directly
          iframeObserver.observe(document.body, {
            childList: true,
            subtree: true
          });
          
          // Poll for iframe visibility/style changes
          const iframeCheckInterval = setInterval(() => {
            const currentIframe = document.getElementById('fsc-popup-frame') || 
                                 document.querySelector('iframe[id*="fsc"]') ||
                                 document.querySelector('iframe[src*="fastspring"]') ||
                                 document.querySelector('iframe[src*="onfastspring"]');
            
            if (!currentIframe) {
              console.log('🔍 [CREDITS] FastSpring iframe no longer exists - popup closed');
              console.log('🔍 [CREDITS] State check:', {
                orderCompleteFired,
                isPurchasing,
                packageKey,
                shouldHide: !orderCompleteFired && isPurchasing === packageKey
              });
              if (!orderCompleteFired && isPurchasing === packageKey) {
                console.log('🚪🚪🚪 [CREDITS] Closing detected via iframe polling - FORCING overlay hide');
                setIsPurchasing(null);
                setShowPurchaseOverlay(false);
                console.log('✅ [CREDITS] Overlay state updated - should be hidden now');
                clearInterval(iframeCheckInterval);
                iframeObserver.disconnect();
              } else {
                console.log('⚠️ [CREDITS] Condition not met for polling, overlay not hidden:', {
                  orderCompleteFired,
                  isPurchasing,
                  packageKey
                });
                // Force hide anyway if popup is clearly closed (iframe gone)
                if (!orderCompleteFired) {
                  console.log('🔧 [CREDITS] Force hiding overlay since iframe is gone and no order completed');
                  setIsPurchasing(null);
                  setShowPurchaseOverlay(false);
                  clearInterval(iframeCheckInterval);
                  iframeObserver.disconnect();
                }
              }
            } else {
              // Check if iframe is hidden
              const style = window.getComputedStyle(currentIframe);
              if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                console.log('🔍 [CREDITS] FastSpring iframe is hidden - popup likely closed');
                console.log('🔍 [CREDITS] State check:', {
                  orderCompleteFired,
                  isPurchasing,
                  packageKey,
                  shouldHide: !orderCompleteFired && isPurchasing === packageKey
                });
                if (!orderCompleteFired && isPurchasing === packageKey) {
                  console.log('🚪 [CREDITS] Closing detected via iframe visibility - hiding overlay');
                  setIsPurchasing(null);
                  setShowPurchaseOverlay(false);
                  clearInterval(iframeCheckInterval);
                  iframeObserver.disconnect();
                } else if (!orderCompleteFired) {
                  console.log('🔧 [CREDITS] Force hiding overlay since iframe is hidden and no order completed');
                  setIsPurchasing(null);
                  setShowPurchaseOverlay(false);
                  clearInterval(iframeCheckInterval);
                  iframeObserver.disconnect();
                }
              }
            }
          }, 500); // Check every 500ms
          
          // Clean up after 60 seconds
          setTimeout(() => {
            clearInterval(iframeCheckInterval);
            iframeObserver.disconnect();
          }, 60000);
        } else {
          console.log('⚠️ [CREDITS] FastSpring iframe not found immediately, will retry...');
          // Retry after a short delay
          setTimeout(watchFastSpringIframe, 1000);
        }
      };
      
      // Start watching for iframe after a short delay
      setTimeout(watchFastSpringIframe, 500);

      fastspring.builder.reset();

      const sessionData: any = {
        account: {
          buyerReference: user.id
        },
        products: [{
          path: packageInfo.productPath,
          quantity: 1
        }]
      };

      if (user.email) {
        sessionData.paymentContact = { email: user.email };
      }

      fastspring.builder.push(sessionData);
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('🛒 [CREDITS] Opening FastSpring checkout popup...');
      fastspring.builder.checkout();
      console.log('✅ [CREDITS] Checkout popup opened');
      
      // Wait a bit longer for FastSpring to render the modal
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Watch for the close button and add click listener
      let closeButtonListenerAttached = false;
      const attachCloseButtonListener = (targetDocument: Document = document) => {
        if (closeButtonListenerAttached) {
          console.log('⚠️ [CREDITS] Close button listener already attached, skipping');
          return true;
        }
        
        // Debug: Log what we're searching for
        console.log('🔍 [CREDITS] Searching for close button with ID: close-payment-modal in document:', targetDocument === document ? 'main' : 'other');
        
        // Try multiple ways to find the button
        let closeButton = targetDocument.getElementById('close-payment-modal');
        console.log('🔍 [CREDITS] getElementById result:', closeButton);
        
        if (!closeButton) {
          // Try querySelector as fallback
          closeButton = targetDocument.querySelector('#close-payment-modal') as HTMLButtonElement;
          console.log('🔍 [CREDITS] querySelector("#close-payment-modal") result:', closeButton);
        }
        if (!closeButton) {
          // Try finding by class or other attributes
          closeButton = targetDocument.querySelector('button[aria-label="Close"]') as HTMLButtonElement;
          console.log('🔍 [CREDITS] querySelector("button[aria-label="Close"]") result:', closeButton);
        }
        if (!closeButton) {
          // Try by class name
          closeButton = targetDocument.querySelector('button.close') as HTMLButtonElement;
          console.log('🔍 [CREDITS] querySelector("button.close") result:', closeButton);
        }
        if (!closeButton) {
          // Try finding in iframe if it exists
          const iframes = targetDocument.querySelectorAll('iframe');
          console.log('🔍 [CREDITS] Found iframes:', iframes.length);
          for (let i = 0; i < iframes.length; i++) {
            const iframe = iframes[i];
            console.log(`🔍 [CREDITS] Checking iframe ${i}:`, {
              src: iframe.src,
              id: iframe.id,
              className: iframe.className
            });
            try {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
              if (iframeDoc) {
                console.log(`🔍 [CREDITS] Can access iframe ${i} document`);
                closeButton = iframeDoc.getElementById('close-payment-modal') as HTMLButtonElement;
                if (closeButton) {
                  console.log('✅ [CREDITS] Close button found in iframe', i);
                  break;
                } else {
                  // Log all buttons in iframe for debugging
                  const allButtons = iframeDoc.querySelectorAll('button');
                  console.log(`🔍 [CREDITS] Iframe ${i} has ${allButtons.length} buttons:`, 
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
              console.log(`⚠️ [CREDITS] Cannot access iframe ${i} content (cross-origin):`, e);
            }
          }
        }
        
        // Debug: Log all buttons with "close" in their ID, class, or aria-label
        if (!closeButton) {
          console.log('🔍 [CREDITS] Button not found, searching for any close-related buttons...');
          const allButtons = targetDocument.querySelectorAll('button');
          const closeRelatedButtons = Array.from(allButtons).filter(btn => 
            btn.id?.toLowerCase().includes('close') ||
            btn.className?.toLowerCase().includes('close') ||
            btn.getAttribute('aria-label')?.toLowerCase().includes('close')
          );
          console.log('🔍 [CREDITS] Found close-related buttons:', closeRelatedButtons.length);
          closeRelatedButtons.forEach((btn, idx) => {
            console.log(`🔍 [CREDITS] Close button candidate ${idx}:`, {
              id: btn.id,
              className: btn.className,
              ariaLabel: btn.getAttribute('aria-label'),
              text: btn.textContent?.trim()
            });
          });
        }
        
        if (closeButton) {
          console.log('✅ [CREDITS] Close button found!', closeButton);
          console.log('✅ [CREDITS] Button element:', {
            id: closeButton.id,
            className: closeButton.className,
            tagName: closeButton.tagName,
            ariaLabel: closeButton.getAttribute('aria-label')
          });
          
          const handleCloseClick = (e: Event) => {
            console.log('🚪🚪🚪 [CREDITS] CLOSE BUTTON CLICKED! Event:', e);
            console.log('🚪 [CREDITS] Hiding overlay immediately');
            setIsPurchasing(null);
            setShowPurchaseOverlay(false);
            closeButton.removeEventListener('click', handleCloseClick);
            console.log('✅ [CREDITS] Close button listener removed');
          };
          
          closeButton.addEventListener('click', handleCloseClick, true); // Use capture phase
          closeButtonListenerAttached = true;
          console.log('✅ [CREDITS] Close button click listener attached successfully');
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
            console.log('🔍 [CREDITS] Found FastSpring popup window, checking its document...');
            try {
              const popupDoc = fastspringWindow.document;
              if (popupDoc && attachCloseButtonListener(popupDoc)) {
                return true;
              }
            } catch (e) {
              console.log('⚠️ [CREDITS] Cannot access popup window document:', e);
            }
          }
        } catch (e) {
          console.log('⚠️ [CREDITS] Error checking popup windows:', e);
        }
        return false;
      };
      
      // Try immediately in main document
      console.log('🔍 [CREDITS] Looking for close button immediately in main document...');
      let found = attachCloseButtonListener();
      
      // Also check popup windows
      if (!found) {
        found = checkPopupWindows();
      }
      
      if (!found) {
        console.log('⚠️ [CREDITS] Close button not found immediately, starting to watch...');
        
        // Use MutationObserver for better detection
        const observer = new MutationObserver((mutations) => {
          if (!closeButtonListenerAttached) {
            console.log('🔍 [CREDITS] DOM changed, checking for close button...');
            if (attachCloseButtonListener() || checkPopupWindows()) {
              observer.disconnect();
              console.log('✅ [CREDITS] Close button found via MutationObserver, observer disconnected');
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
            console.log('🔍 [CREDITS] Polling for close button...');
            if (attachCloseButtonListener() || checkPopupWindows()) {
              clearInterval(closeButtonInterval);
              observer.disconnect();
              console.log('✅ [CREDITS] Close button found via polling, interval cleared');
            }
          } else {
            clearInterval(closeButtonInterval);
            observer.disconnect();
          }
        }, 200); // Check every 200ms
        
        // Stop watching after 10 seconds
        setTimeout(() => {
          if (!closeButtonListenerAttached) {
            console.log('⏰ [CREDITS] Timeout: Close button not found after 10 seconds');
            clearInterval(closeButtonInterval);
            observer.disconnect();
          }
        }, 10000);
      }

    } catch (error) {
      console.error('Error opening FastSpring checkout:', error);
      alert('Failed to open checkout. Please try again.');
      setIsPurchasing(null);
    }
  };

  // Character slot purchase handler - moved to CharacterSelector
  // const handlePurchaseCharacterSlot = async () => { ... }

  // SUBSCRIPTION CODE - COMMENTED OUT FOR CREDITS MIGRATION
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCancelSubscription = () => {
    setShowCancelConfirm(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const confirmCancelSubscription = async () => {
    setShowCancelConfirm(false);
    setIsCanceling(true);
    
    try {
      const response = await fetch('/api/fastspring/subscription/cancel', {
        method: 'POST',
      });
      
      if (!response.ok) {
        if (response.headers.get('content-type')?.includes('text/html')) {
          setAlertConfig({
            title: 'Configuration Error',
            message: 'Subscription service is not configured yet. Please set up FastSpring first.',
            variant: 'error'
          });
          setShowAlert(true);
          setIsCanceling(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setAlertConfig({
          title: 'Subscription Canceled',
          message: data.message || 'Your Tribute has been canceled. You will retain access until the end of your current period.',
          variant: 'success'
        });
        setShowAlert(true);
        // Update local state to reflect cancellation
        setSubscription(prev => prev ? { ...prev, hasSubscription: false } : null);
      } else {
        setAlertConfig({
          title: 'Cancellation Failed',
          message: data.error || 'Failed to cancel subscription. Please try again.',
          variant: 'error'
        });
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      setAlertConfig({
        title: 'Error',
        message: 'Failed to cancel subscription. Please try again.',
        variant: 'error'
      });
      setShowAlert(true);
    } finally {
      setIsCanceling(false);
    }
  };

  // Remove the loading state - let the main app handle loading

  // Theme is now tied to the active character

  // Get theme colors for background
  const migratedTheme = migrateTheme(activeCharacter.theme) as Theme;
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

      <div className="flex-1 p-1 sm:p-2 md:p-4 overflow-x-hidden">
      {/* <MovingGradientBackground theme={activeCharacter.theme} /> */}
      
      <div className="relative z-10 max-w-4xl mx-auto w-full px-1 sm:px-2 md:px-4 max-w-full">
        {/* Navigation */}
        <AppNavigation
          activeCharacter={activeCharacter}
          currentPage="tribute"
          onBack={onBack}
          theme={activeCharacter.theme}
          credits={credits}
          isLowOnCredits={isLowOnCredits}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 -mt-4"
        >
          <motion.h1 
            className="font-pixel text-lg md:text-xl text-white mb-4"
            animate={{
              textShadow: migrateTheme(activeCharacter.theme) === 'neon-ashes' 
                ? ["0 0 10px #00FFFF, 0 0 20px #00FFFF", "0 0 20px #00FFFF, 0 0 30px #00FFFF"]
                : migrateTheme(activeCharacter.theme) === 'blazeheart-saga'
                ? ["0 0 10px #FF6B35, 0 0 20px #FF6B35", "0 0 20px #FF6B35, 0 0 30px #FF6B35"]
                : ["0 0 10px #fff, 0 0 20px #fff", "0 0 20px #fff, 0 0 30px #fff"]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* OLD SUBSCRIPTION MESSAGES - COMMENTED OUT FOR CREDITS MIGRATION */}
            {/* REACH NEW LEVELS */}
            REFILL YOUR INK
          </motion.h1>
          <motion.p 
            className="font-pixel text-lg text-yellow-300"
            animate={migrateTheme(activeCharacter.theme) === 'echoes-of-dawn' ? { opacity: [0.7, 1, 0.7] } : {}}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {/* OLD SUBSCRIPTION MESSAGES - COMMENTED OUT FOR CREDITS MIGRATION */}
            {/* Unlock your potential */}
            Keep your creative well flowing!
          </motion.p>
        </motion.div>

        {/* SUBSCRIPTION CODE - COMMENTED OUT FOR CREDITS MIGRATION - DO NOT DELETE */}
        {false && (
        <div className="grid md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-8 w-full max-w-full overflow-hidden">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card theme={activeCharacter.theme} effect="vintage" className="h-full w-full max-w-full min-w-0 overflow-hidden">
              <div className="p-3 sm:p-4 md:p-6">
                <h3 className="font-pixel text-lg sm:text-xl md:text-2xl text-white mb-3 sm:mb-4 break-words overflow-wrap-anywhere">Common Adventurer</h3>
                {/* Price section - same height as billing selector + price in paid card */}
                <div className="mb-3 sm:mb-4 w-full flex flex-col justify-between" style={{ minHeight: '7.5rem' }}>
                  {/* Spacer to match billing cycle selector height */}
                  <div className="mb-3 sm:mb-4"></div>
                  {/* Price centered between selector and price positions */}
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-300 text-center -mt-8">$0<span className="text-sm sm:text-base md:text-lg">/week</span></div>
                  {/* Spacer to match price margin bottom */}
                  <div className="mb-3 sm:mb-4"></div>
                </div>
                <ul className="space-y-2 sm:space-y-3 text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
                  <li className="flex items-center break-words">
                    <span className="text-green-400 mr-2 flex-shrink-0">✓</span>
                    <span className="min-w-0">{SUBSCRIPTION_LIMITS.FREE.CHARACTER_SLOTS} character</span>
                  </li>
                  <li className="flex items-center break-words">
                    <span className="text-green-400 mr-2 flex-shrink-0">✓</span>
                    <span className="min-w-0">{SUBSCRIPTION_LIMITS.FREE.DAILY_CHAPTERS} chapters per day</span>
                  </li>
                  <li className="flex items-center break-words">
                    <span className="text-green-400 mr-2 flex-shrink-0">✓</span>
                    <span className="min-w-0">{SUBSCRIPTION_LIMITS.FREE.DAILY_SCENES} scene per day</span>
                  </li>
                  <li className="flex items-center break-words">
                    <span className="text-green-400 mr-2 flex-shrink-0">✓</span>
                    <span className="min-w-0">Basic achievements</span>
                  </li>
                </ul>
                
                {/* Show "Your Current Plan" for free users or users without premium access */}
                {!hasPremiumAccess(user) ? (
                  <div className="font-pixel text-yellow-400 text-center" style={{ fontSize: '1.3rem' }}>
                    Your Current Plan
                  </div>
                ) : null}
              </div>
            </Card>
          </motion.div>

          {/* Tribute Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card 
              theme={activeCharacter.theme} 
              effect="glow" 
              className={`h-full w-full max-w-full min-w-0 overflow-hidden ${
                user.subscriptionPlan === selectedBillingCycle && hasPremiumAccess(user)
                  ? 'ring-4 ring-yellow-400 ring-opacity-75' 
                  : ''
              }`}
            >
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2 min-w-0">
                  <h3 className="font-pixel text-lg sm:text-xl md:text-2xl text-white break-words min-w-0 flex-shrink overflow-wrap-anywhere">Unbound Adventurer</h3>
                  <span className={`bg-yellow-400 text-white px-1.5 sm:px-2 py-1 text-xs font-pixel rounded border-2 border-black flex-shrink-0 ${
                    selectedBillingCycle === 'monthly' ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}>
                    POPULAR
                  </span>
                </div>
                {/* Billing Cycle Selector */}
                <div className="mb-3 sm:mb-4 w-full" style={{ minHeight: '7.5rem' }}>
                  <div className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4 w-full min-w-0">
                    <button
                      onClick={() => setSelectedBillingCycle('weekly')}
                      className={`flex-1 px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 rounded font-pixel text-xs transition-all min-w-0 ${
                        selectedBillingCycle === 'weekly'
                          ? 'bg-yellow-400 text-white border-2 border-yellow-400'
                          : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => setSelectedBillingCycle('monthly')}
                      className={`flex-1 px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 rounded font-pixel text-xs transition-all min-w-0 ${
                        selectedBillingCycle === 'monthly'
                          ? 'bg-yellow-400 text-white border-2 border-yellow-400'
                          : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setSelectedBillingCycle('yearly')}
                      className={`flex-1 px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 rounded font-pixel text-xs transition-all min-w-0 ${
                        selectedBillingCycle === 'yearly'
                          ? 'bg-yellow-400 text-white border-2 border-yellow-400'
                          : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      Yearly
                    </button>
                  </div>
                  
                  {/* Price Display */}
                  <div className="text-center mb-3 sm:mb-4">
                    {selectedBillingCycle === 'weekly' && (
                      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400">
                        $4<span className="text-sm sm:text-base md:text-lg">/week</span>
                      </div>
                    )}
                    {selectedBillingCycle === 'monthly' && (
                      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400">
                        $12<span className="text-sm sm:text-base md:text-lg">/month</span>
                      </div>
                    )}
                    {selectedBillingCycle === 'yearly' && (
                      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400">
                        $108<span className="text-sm sm:text-base md:text-lg">/year</span>
                      </div>
                    )}
                  </div>
                </div>

                <ul className="space-y-2 sm:space-y-3 text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
                  <li className="flex items-center break-words">
                    <span className="text-green-400 mr-2 flex-shrink-0">✓</span>
                    <span className="min-w-0">{SUBSCRIPTION_LIMITS.TRIBUTE.CHARACTER_SLOTS} characters</span>
                  </li>
                  <li className="flex items-center break-words">
                    <span className="text-green-400 mr-2 flex-shrink-0">✓</span>
                    <span className="min-w-0">{USE_SHARED_LIMITS 
                      ? `${SUBSCRIPTION_LIMITS.TRIBUTE.DAILY_CHAPTERS_SHARED} chapters daily (shared)` 
                      : `${SUBSCRIPTION_LIMITS.TRIBUTE.DAILY_CHAPTERS_PER_CHARACTER} chapters per character daily`}</span>
                  </li>
                  <li className="flex items-center break-words">
                    <span className="text-green-400 mr-2 flex-shrink-0">✓</span>
                    <span className="min-w-0">{USE_SHARED_LIMITS 
                      ? `${SUBSCRIPTION_LIMITS.TRIBUTE.DAILY_SCENES_SHARED} scenes daily (shared)` 
                      : `${SUBSCRIPTION_LIMITS.TRIBUTE.DAILY_SCENES_PER_CHARACTER} scene per character daily`}</span>
                  </li>
                  <li className="flex items-center break-words">
                    <span className="text-green-400 mr-2 flex-shrink-0">✓</span>
                    <span className="min-w-0">Special achievements</span>
                  </li>
                </ul>
                
                {hasPremiumAccess(user) && user.subscriptionPlan === selectedBillingCycle ? (
                  // User has premium access matching the selected billing cycle - show cancel button
                  <button
                    onClick={handleCancelSubscription}
                    disabled={isCanceling}
                    style={{ fontSize: '1.1rem' }}
                    className="w-full font-pixel text-white bg-red-600 hover:bg-red-700 active:bg-red-800 border-2 border-red-500 px-4 py-5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCanceling ? 'Stopping...' : 'Stop Tribute'}
                  </button>
                ) : hasPremiumAccess(user) && user.subscriptionPlan !== selectedBillingCycle ? (
                  // User has active subscription but different billing cycle - show message
                  <div className="text-center p-4 bg-gray-800 border border-yellow-400 rounded-lg">
                    <p className="font-pixel text-yellow-400 text-sm">
                      You&apos;re currently on the {user.subscriptionPlan === 'weekly' ? 'weekly' : user.subscriptionPlan === 'monthly' ? 'monthly' : 'yearly'} plan. Switch to your current plan to manage your subscription.
                    </p>
                  </div>
                ) : isPaidPlan(user.subscriptionPlan) && user.subscriptionStatus === 'canceled' && user.subscriptionPlan === selectedBillingCycle ? (
                  // User has canceled subscription matching the selected billing cycle - show canceled message
                  <div className="text-center p-4 bg-gray-800 border border-yellow-400 rounded-lg">
                    <p className="font-pixel text-yellow-400 text-sm">
                      Your Tribute has been cancelled. You will retain access until the end of your current period.
                    </p>
                  </div>
                ) : (
                  // User is free or inactive - show start subscription button
                  <button
                    onClick={handleCreateSubscription}
                    disabled={isCreating}
                    className="w-full font-pixel text-white bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 border-2 border-yellow-400 px-4 py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? 'Creating...' : 'Start Tribute'}
                  </button>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
        )}

        {/* Credit Packages - Responsive Grid */}
        <div 
          className="grid gap-4 md:gap-6 mb-8"
          style={{ 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'
          }}
        >
          {/* Starter Kit - only show if eligible */}
          {starterKitEligible && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-full flex relative"
            >
              <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 bg-yellow-400 text-white px-3 py-1.5 text-xs font-pixel rounded border-2 border-black whitespace-nowrap">
                ONE TIME OFFER
              </span>
              <Card theme={activeCharacter.theme} effect="glow" className="h-full w-full flex flex-col border-4 border-yellow-400">
                <div className="p-4 md:p-6 flex flex-col flex-grow">
                  {/* Pack Title - Centered at Top */}
                  <div className="mb-3 flex justify-center">
                    <h3 className="font-pixel text-xs md:text-sm text-white whitespace-nowrap">
                      {CREDIT_PACKAGES['starter-kit'].name}
                    </h3>
                  </div>
                  
                  {/* Logo, Price, and Vials - Horizontal Layout, Centered */}
                  <div className="flex items-center gap-3 mb-3 flex-shrink-0 justify-center">
                    {/* Pack Logo - Left Side */}
                    <div className="flex-shrink-0">
                      <Image
                        src="/starterKit.png"
                        alt="Starter Kit"
                        width={120}
                        height={120}
                        className="object-contain"
                      />
                    </div>
                    {/* Price and Vials - Right Side */}
                    <div className="flex flex-col justify-center">
                      <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-3">
                        ${CREDIT_PACKAGES['starter-kit'].price.toFixed(2)}
                      </div>
                      <div className="text-base md:text-lg text-gray-300 whitespace-nowrap">
                        {CREDIT_PACKAGES['starter-kit'].inkVials.toLocaleString()} Ink Vials
                      </div>
                    </div>
                  </div>
                  <div className="text-base text-white mb-4 flex-grow flex items-center">
                    <p className="text-center leading-relaxed">{CREDIT_PACKAGES['starter-kit'].description}</p>
                  </div>
                  <button
                    onClick={() => handlePurchaseCredits('starter-kit')}
                    disabled={isPurchasing === 'starter-kit'}
                    className="w-full font-pixel text-white bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 border-2 border-yellow-400 px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-auto"
                  >
                    {isPurchasing === 'starter-kit' ? 'Processing...' : 'Purchase'}
                  </button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Regular Credit Packages */}
          {Object.entries(CREDIT_PACKAGES).filter(([key]) => key !== 'starter-kit').map(([key, pkg], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="h-full flex relative"
            >
              {key === 'chroniclers-kit' && (
                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 bg-yellow-400 text-white px-3 py-1.5 text-xs font-pixel rounded border-2 border-black whitespace-nowrap">
                  POPULAR
                </span>
              )}
              <Card theme={activeCharacter.theme} effect={key === 'chroniclers-kit' ? 'glow' : 'vintage'} className="h-full w-full flex flex-col">
                <div className="p-4 md:p-6 flex flex-col flex-grow">
                  {/* Pack Title - Centered at Top */}
                  <div className="mb-3 flex justify-center">
                    <h3 className="font-pixel text-xs md:text-sm text-white whitespace-nowrap">{pkg.name}</h3>
                  </div>
                  
                  {/* Logo, Price, and Vials - Horizontal Layout, Centered */}
                  <div className="flex items-center gap-3 mb-3 flex-shrink-0 justify-center">
                    {/* Pack Logo - Left Side */}
                    <div className="flex-shrink-0">
                      {key === 'novice-sack' && (
                        <Image
                          src="/noviceSack.png"
                          alt="Novice Sack"
                          width={120}
                          height={120}
                          className="object-contain"
                        />
                      )}
                      {key === 'chroniclers-kit' && (
                        <Image
                          src="/chroniclersKit.png"
                          alt="Chronicler's Kit"
                          width={120}
                          height={120}
                          className="object-contain"
                        />
                      )}
                      {key === 'worldbuilders-chest' && (
                        <Image
                          src="/worldbuildersChest.png"
                          alt="Worldbuilder's Chest"
                          width={120}
                          height={120}
                          className="object-contain"
                        />
                      )}
                    </div>
                    {/* Price and Vials - Right Side */}
                    <div className="flex flex-col justify-center">
                      <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-3">
                        ${pkg.price.toFixed(2)}
                      </div>
                      <div className="text-base md:text-lg text-gray-300 whitespace-nowrap">
                        {pkg.inkVials.toLocaleString()} Ink Vials
                      </div>
                    </div>
                  </div>
                  <div className="text-base text-white mb-4 flex-grow flex items-center">
                    <p className="text-center leading-relaxed">{pkg.description}</p>
                  </div>
                  <button
                    onClick={() => handlePurchaseCredits(key as keyof typeof CREDIT_PACKAGES)}
                    disabled={isPurchasing === key}
                    className="w-full font-pixel text-white bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 border-2 border-yellow-400 px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-auto"
                  >
                    {isPurchasing === key ? 'Processing...' : 'Purchase'}
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Character Slots Section - Moved to CharacterSelector */}
      </div>
      </div>
      {/* <Footer /> */}
      
      {/* SUBSCRIPTION CODE - COMMENTED OUT FOR CREDITS MIGRATION */}
      {/* 
      <ConfirmationModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={confirmCancelSubscription}
        title="STOP TRIBUTE"
        message="Are you sure you want to stop your Tribute? You will lose access to premium features at the end of your current period."
        confirmText="STOP TRIBUTE"
        cancelText="Cancel"
        confirmVariant="destructive"
        theme={activeCharacter?.theme || 'obsidian-veil'}
        isLoading={isCanceling}
      />
      */}
      
      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        variant={alertConfig.variant}
        theme={activeCharacter?.theme || 'obsidian-veil'}
      />
    </div>
  );
}
