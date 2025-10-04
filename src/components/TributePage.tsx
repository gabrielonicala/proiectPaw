'use client';

import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';
import MovingGradientBackground from '@/components/MovingGradientBackground';
import AppNavigation from '@/components/AppNavigation';
import { User, Character } from '@/types';
import { USE_SHARED_LIMITS } from '@/lib/subscription-limits';
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
  // const { data: session } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  useEffect(() => {
    // Use user data directly instead of calling API
    const hasActiveSubscription = user.subscriptionPlan === 'tribute' && user.subscriptionStatus === 'active';
    setSubscription({ hasSubscription: hasActiveSubscription });
  }, [user]);

  const handleCreateSubscription = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
      });
      
      if (!response.ok) {
        if (response.headers.get('content-type')?.includes('text/html')) {
          alert('Subscription service is not configured yet. Please set up Stripe API keys first.');
          setIsCreating(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert('Failed to create subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Subscription service is not configured yet. Please set up Stripe API keys first.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your Tribute? You will lose access to premium features at the end of your current period.')) {
      return;
    }

    setIsCanceling(true);
    try {
      const response = await fetch('/api/subscription/manage', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        if (response.headers.get('content-type')?.includes('text/html')) {
          alert('Subscription service is not configured yet. Please set up Stripe API keys first.');
          setIsCanceling(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        alert('Your Tribute has been canceled. You will retain access until the end of your current period.');
        // Update local state to reflect cancellation
        setSubscription(prev => prev ? { ...prev, hasSubscription: false } : null);
      } else {
        alert('Failed to cancel subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Subscription service is not configured yet. Please set up Stripe API keys first.');
    } finally {
      setIsCanceling(false);
    }
  };

  // Remove the loading state - let the main app handle loading

  // Theme is now tied to the active character

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-4">
      <MovingGradientBackground theme={activeCharacter.theme} />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Navigation */}
        <AppNavigation
          activeCharacter={activeCharacter}
          currentPage="tribute"
          onBack={onBack}
          theme={activeCharacter.theme}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="font-pixel text-4xl md:text-6xl text-white mb-4">
            🏰 TRIBUTE 🏰
          </h1>
          <p className="text-gray-300">
            Enhance your adventures and support the realm
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card theme={activeCharacter.theme} effect="vintage" className="h-full">
              <div className="p-6">
                <h3 className="font-pixel text-2xl text-white mb-4">Common Adventurer</h3>
                <div className="text-4xl font-bold text-gray-300 mb-4">$0<span className="text-lg">/week</span></div>
                <ul className="space-y-3 text-gray-300 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    5 chapters per day
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    1 character
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Basic support
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Basic achievements
                  </li>
                </ul>
                
                {/* Show "Your Current Plan" for free users */}
                {user.subscriptionPlan !== 'tribute' || user.subscriptionStatus !== 'active' ? (
                  <div className="text-lg font-pixel text-yellow-400 mt-20 text-center">
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
              className={`h-full ${
                user.subscriptionPlan === 'tribute' && user.subscriptionStatus === 'active' 
                  ? 'ring-4 ring-yellow-400 ring-opacity-75' 
                  : ''
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-pixel text-2xl text-white">Unbound Adventurer</h3>
                  <span className="bg-yellow-400 text-white px-2 py-1 text-xs font-pixel rounded border-2 border-black">
                    POPULAR
                  </span>
                </div>
                <div className="text-4xl font-bold text-yellow-400 mb-4">$7<span className="text-lg">/week</span></div>
                <ul className="space-y-3 text-gray-300 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    {USE_SHARED_LIMITS ? '30 chapters daily (shared)' : '10 chapters per character daily'}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    {USE_SHARED_LIMITS ? '3 scenes daily (shared)' : '1 scene per character daily'}
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    3 characters
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Special achievements
                  </li>
                </ul>
                
                {user.subscriptionPlan === 'tribute' && user.subscriptionStatus === 'active' ? (
                  <Button
                    onClick={handleCancelSubscription}
                    variant="secondary"
                    theme={activeCharacter.theme}
                    className="w-full"
                    disabled={isCanceling}
                  >
                    {isCanceling ? 'Canceling...' : 'Cancel Tribute'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreateSubscription}
                    variant="accent"
                    theme={activeCharacter.theme}
                    className="w-full"
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creating...' : 'Start Tribute - $7/week'}
                  </Button>
                )}
                
                {/* Show "Your Current Plan" for active tribute subscribers */}
                {user.subscriptionPlan === 'tribute' && user.subscriptionStatus === 'active' && (
                  <div className="text-lg font-pixel text-yellow-400 mt-6 text-center">
                    Your Current Plan
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
