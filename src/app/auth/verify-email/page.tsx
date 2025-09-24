'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Your email has been verified successfully! You can now sign in to your account.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred while verifying your email');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 bg-gray-900/90 backdrop-blur-sm border-gray-700">
        <div className="p-6 text-center">
          <div className="mb-6">
            {status === 'loading' && (
              <>
                <div className="text-6xl mb-4">⏳</div>
                <h1 className="text-2xl font-bold text-white mb-2 font-pixel">Verifying Email...</h1>
                <p className="text-gray-300 font-pixel">Please wait while we verify your email address</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <div className="text-6xl mb-4">✅</div>
                <h1 className="text-2xl font-bold text-white mb-2 font-pixel">Email Verified!</h1>
                <p className="text-gray-300 font-pixel mb-4">{message}</p>
                <Button
                  onClick={() => router.push('/auth/signin')}
                  className="w-full"
                >
                  Sign In
                </Button>
              </>
            )}
            
            {status === 'error' && (
              <>
                <div className="text-6xl mb-4">❌</div>
                <h1 className="text-2xl font-bold text-white mb-2 font-pixel">Verification Failed</h1>
                <p className="text-gray-300 font-pixel mb-4">{message}</p>
                <div className="space-y-2">
                  <Button
                    onClick={() => router.push('/auth/signin')}
                    variant="secondary"
                    className="w-full"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => router.push('/auth/signup')}
                    className="w-full"
                  >
                    Sign Up Again
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-white text-xl font-pixel">Loading...</div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
