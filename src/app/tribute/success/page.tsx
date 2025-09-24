'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';
import MovingGradientBackground from '@/components/MovingGradientBackground';

function TributeSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setError('No session ID found');
      setIsLoading(false);
      return;
    }

    // Verify the session with Stripe
    verifySession(sessionId);
  }, [searchParams]);

  const verifySession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/subscription/verify?session_id=${sessionId}`);
      const data = await response.json();
      
      if (data.success) {
        setIsLoading(false);
      } else {
        setError(data.error || 'Failed to verify subscription');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error verifying session:', error);
      setError('An error occurred while verifying your subscription');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-white text-xl font-pixel">Verifying your Tribute...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <MovingGradientBackground theme="obsidian-veil" />
        <div className="relative z-10 max-w-md mx-auto mt-20">
          <Card theme="obsidian-veil" effect="vintage">
            <div className="p-6 text-center">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h1 className="font-pixel text-2xl text-white mb-4">Verification Failed</h1>
              <p className="text-gray-300 mb-6">{error}</p>
              <Button
                onClick={() => router.push('/')}
                variant="primary"
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <MovingGradientBackground theme="obsidian-veil" />
      <div className="relative z-10 max-w-md mx-auto mt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Card theme="obsidian-veil" effect="glow">
            <div className="p-6 text-center">
              <div className="text-green-400 text-6xl mb-4">🎉</div>
              <h1 className="font-pixel text-3xl text-white mb-4">Tribute Accepted!</h1>
              <p className="text-gray-300 mb-6">
                Thank you for supporting the realm! Your Tribute is now active and you have access to unlimited adventures.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/')}
                  variant="accent"
                  className="w-full"
                >
                  Start Your Adventure
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="secondary"
                  className="w-full"
                >
                  Manage Tribute
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function TributeSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-white text-xl font-pixel">Loading...</div>
        </div>
      </div>
    }>
      <TributeSuccessContent />
    </Suspense>
  );
}
