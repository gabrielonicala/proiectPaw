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
import { setCachedCredits } from '@/lib/credits-cache';
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
    setIsPurchasing(packageKey);
    try {
      // Check if FastSpring API is loaded
      if (typeof window === 'undefined' || !(window as any).fastspring) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!(window as any).fastspring) {
          alert('FastSpring checkout is loading. Please try again in a moment.');
          setIsPurchasing(null);
          return;
        }
      }

      const fastspring = (window as any).fastspring;
      const packageInfo = CREDIT_PACKAGES[packageKey];
      
      // Notify backend that checkout is starting
      try {
        await fetch('/api/fastspring/checkout/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Failed to notify backend of checkout start:', error);
      }

      const handleOrderComplete = () => {
        console.log('Order completed for package:', packageKey);
        // Reset button state immediately when order completes
        setIsPurchasing(null);
        
        // Remove all event listeners
        window.removeEventListener('fsc:popup.closed', handlePopupClosed);
        window.removeEventListener('fsc:checkout.closed', handlePopupClosed);
        window.removeEventListener('fsc:order.complete', handleOrderComplete);
        
        // Refresh credits after purchase (trigger event-driven cache invalidation)
        setTimeout(() => {
          // Dispatch event to invalidate cache
          window.dispatchEvent(new CustomEvent('credits:purchase'));
          
          // Also fetch fresh data
          fetch('/api/credits/balance')
            .then(res => res.json())
            .then(data => {
              setCredits(data.credits);
              setIsLowOnCredits(data.isLow);
            })
            .catch(err => console.error('Error refreshing credits:', err));
        }, 2000);
      };

      const handlePopupClosed = () => {
        console.log('Popup closed for package:', packageKey);
        // Remove event listeners first to prevent double-firing
        window.removeEventListener('fsc:popup.closed', handlePopupClosed);
        window.removeEventListener('fsc:checkout.closed', handlePopupClosed);
        window.removeEventListener('fsc:order.complete', handleOrderComplete);
        
        // If popup closed, check if order completed by checking credits after a delay
        // This handles cases where order completes but event doesn't fire
        setTimeout(() => {
          // Always check credits and reset button state
          // This ensures the button doesn't get stuck even if events don't fire properly
          fetch('/api/credits/balance')
            .then(res => res.json())
            .then(data => {
              const newCredits = data.credits;
              // Reset button state regardless - if order completed, credits will have increased
              // If order didn't complete, we still want to reset the button
              setIsPurchasing(null);
              
              // Update credits if they changed
              if (newCredits !== credits) {
                setCredits(newCredits);
                setIsLowOnCredits(data.isLow);
                // Dispatch event to invalidate cache
                window.dispatchEvent(new CustomEvent('credits:purchase'));
              }
            })
            .catch(err => {
              console.error('Error checking credits after popup close:', err);
              // Always reset button state on error to prevent it from being stuck
              setIsPurchasing(null);
            });
        }, 3000);
      };

      window.addEventListener('fsc:popup.closed', handlePopupClosed);
      window.addEventListener('fsc:checkout.closed', handlePopupClosed);
      window.addEventListener('fsc:order.complete', handleOrderComplete);

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
      fastspring.builder.checkout();

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
