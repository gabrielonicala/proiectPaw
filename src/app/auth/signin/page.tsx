'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

function SignInContent() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'account-linked') {
      setSuccessMessage('Account successfully linked! You can now sign in with Google.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!identifier || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      // Use custom authentication API
      const response = await fetch('/api/auth/signin-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'EMAIL_NOT_VERIFIED') {
          setError('Please verify your email address before signing in. Check your inbox for a verification email.');
        } else {
          setError(data.error || 'Invalid email/username or password');
        }
        return;
      }

      // Success - force a full page reload to ensure session cookie is recognized
      window.location.href = '/';
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden p-4">
      {/* Mobile background pattern */}
      <div className="absolute inset-0 md:hidden bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
      
      {/* Theme-colored moving squares - Reduced on mobile for performance */}
      <div className="absolute inset-0 hidden md:block">
        {/* Velour Nights - Orange */}
        <div 
          className="absolute w-6 h-6 pixelated opacity-60" 
          style={{
            backgroundColor: '#E8A87C',
            animation: 'float1 8s ease-in-out infinite',
            top: '20%',
            left: '15%'
          }}
        ></div>
        <div 
          className="absolute w-4 h-4 pixelated opacity-50" 
          style={{
            backgroundColor: '#E8A87C',
            animation: 'float2 6s ease-in-out infinite',
            top: '70%',
            right: '20%'
          }}
        ></div>
        
        {/* Neon Ashes - Green */}
        <div 
          className="absolute w-8 h-8 pixelated opacity-70" 
          style={{
            backgroundColor: '#00FF88',
            animation: 'float3 10s ease-in-out infinite',
            top: '10%',
            right: '25%'
          }}
        ></div>
        <div 
          className="absolute w-5 h-5 pixelated opacity-55" 
          style={{
            backgroundColor: '#00FF88',
            animation: 'float4 7s ease-in-out infinite',
            bottom: '30%',
            left: '25%'
          }}
        ></div>
        
        {/* Crimson Casefiles - Gold */}
        <div 
          className="absolute w-4 h-4 pixelated opacity-80"
          style={{
            backgroundColor: '#FFD700',
            animation: 'float5 9s ease-in-out infinite',
            top: '50%',
            left: '10%'
          }}
        ></div>
        <div 
          className="absolute w-6 h-6 pixelated opacity-65"
          style={{
            backgroundColor: '#FFD700',
            animation: 'float6 5s ease-in-out infinite',
            bottom: '20%',
            right: '15%'
          }}
        ></div>
        
        {/* Obsidian Veil - Purple */}
        <div 
          className="absolute w-5 h-5 pixelated opacity-75"
          style={{
            backgroundColor: '#8B5CF6',
            animation: 'float7 11s ease-in-out infinite',
            top: '30%',
            right: '10%'
          }}
        ></div>
        <div 
          className="absolute w-3 h-3 pixelated opacity-60"
          style={{
            backgroundColor: '#8B5CF6',
            animation: 'float8 8s ease-in-out infinite',
            bottom: '50%',
            left: '20%'
          }}
        ></div>
        
        {/* Steel Spirit - Red */}
        <div 
          className="absolute w-7 h-7 pixelated opacity-70"
          style={{
            backgroundColor: '#EF4444',
            animation: 'float9 12s ease-in-out infinite',
            top: '80%',
            left: '30%'
          }}
        ></div>
        <div 
          className="absolute w-4 h-4 pixelated opacity-55"
          style={{
            backgroundColor: '#EF4444',
            animation: 'float10 6s ease-in-out infinite',
            top: '15%',
            left: '40%'
          }}
        ></div>
        
        {/* Ivory Quill - Cream */}
        <div 
          className="absolute w-5 h-5 pixelated opacity-60"
          style={{
            backgroundColor: '#F5F5DC',
            animation: 'float11 10s ease-in-out infinite',
            bottom: '10%',
            right: '30%'
          }}
        ></div>
        <div 
          className="absolute w-3 h-3 pixelated opacity-50"
          style={{
            backgroundColor: '#F5F5DC',
            animation: 'float12 7s ease-in-out infinite',
            top: '60%',
            right: '5%'
          }}
        ></div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          50% { transform: translateX(15px) rotate(-180deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-25px) scale(1.1); }
        }
        @keyframes float4 {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          50% { transform: translateX(-20px) rotate(90deg); }
        }
        @keyframes float5 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(270deg); }
        }
        @keyframes float6 {
          0%, 100% { transform: translateX(0px) scale(1); }
          50% { transform: translateX(10px) scale(0.9); }
        }
        @keyframes float7 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(180deg); }
        }
        @keyframes float8 {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          50% { transform: translateX(-15px) rotate(-90deg); }
        }
        @keyframes float9 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.2); }
        }
        @keyframes float10 {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          50% { transform: translateX(20px) rotate(180deg); }
        }
        @keyframes float11 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(270deg); }
        }
        @keyframes float12 {
          0%, 100% { transform: translateX(0px) scale(1); }
          50% { transform: translateX(-10px) scale(0.8); }
        }
      `}</style>

      <Card className="w-full max-w-md relative z-10 bg-gray-900/95 border-gray-700">
        <div className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2 font-pixel">Welcome Back</h1>
            <p className="text-gray-300 font-pixel">Sign in to continue</p>
          </div>

          {/* Google Sign-In Option */}
          <div className="mb-6">
            <GoogleSignInButton 
              variant="signin"
              className="w-full"
            />
            <div className="text-center text-white/70 my-4 text-sm font-pixel">or</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-300 mb-2 font-pixel">
                Email or Username
              </label>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={setIdentifier}
                // placeholder="Enter your email or username"
                placeholder="Email or username"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2 font-pixel">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={setPassword}
                  // placeholder="Enter your password"
                  placeholder="Password"
                  className="w-full pr-12"
                  maxLength={40}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors flex items-center justify-center right-[2%] min-[769px]:right-[4%]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center font-pixel">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="text-green-400 text-sm text-center font-pixel">
                {successMessage}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full relative"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-4 border-yellow-400 border-t-transparent pixelated animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <a href="/auth/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm font-pixel">
              Forgot your password?
            </a>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-300 font-pixel">
                Don&apos;t have an account?{' '}
              <a href="/auth/signup" className="text-blue-400 hover:text-blue-300">
                Sign up
              </a>
            </p>
          </div>

          {/* Test Account Message */}
          {/* <div className="mt-8 p-4 bg-gray-800/50 border border-gray-600 rounded-lg">
            <div className="text-center">
              <p className="text-gray-300 text-sm font-pixel mb-2">
                Thank you for trying out Quillia!
              </p>
              <p className="text-gray-400 text-xs font-pixel mb-3">
                If you&apos;d like to skip the whole sign-up process, just use this test account:
              </p>
              <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
                <p className="text-green-400 text-sm font-pixel font-mono">
                  Username: <span className="text-white">test</span>
                </p>
                <p className="text-green-400 text-sm font-pixel font-mono">
                  Password: <span className="text-white">123456</span>
                </p>
              </div>
              <p className="text-gray-300 text-xs font-pixel mt-3">
                Hope you enjoy Quillia!
              </p>
            </div>
          </div> */}

          {/* Back to Quillia Button */}
          <div className="mt-6 text-center">
            <a 
              href="/home" 
              className="inline-flex items-center gap-1.5 bg-transparent hover:bg-gray-800/50 text-white text-sm font-pixel px-4 py-2 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return home
            </a>
          </div>

        </div>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
