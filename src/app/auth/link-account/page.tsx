'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

function LinkAccountContent() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [provider, setProvider] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      router.push('/auth/signin');
      return;
    }
    
    // Fetch OAuth data using the token
    fetch(`/api/auth/link-account?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEmail(data.email);
          setProvider(data.provider);
        } else {
          router.push('/auth/signin');
        }
      })
      .catch(() => {
        router.push('/auth/signin');
      });
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!password) {
      setError('Please enter your password');
      setIsLoading(false);
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid session. Please try again.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/link-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to link account');
        setIsLoading(false);
        return;
      }

      // Success - redirect to sign in page
      router.push('/auth/signin?message=account-linked');
    } catch {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/auth/signin');
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
            top: '60%',
            right: '15%'
          }}
        ></div>
        
        {/* Steel Spirit - Red */}
        <div 
          className="absolute w-5 h-5 pixelated opacity-65"
          style={{
            backgroundColor: '#FF6B35',
            animation: 'float7 8s ease-in-out infinite',
            top: '30%',
            left: '30%'
          }}
        ></div>
        <div 
          className="absolute w-3 h-3 pixelated opacity-70"
          style={{
            backgroundColor: '#FF6B35',
            animation: 'float8 6s ease-in-out infinite',
            bottom: '20%',
            right: '30%'
          }}
        ></div>
        
        {/* Ivory Quill - Purple */}
        <div 
          className="absolute w-7 h-7 pixelated opacity-55"
          style={{
            backgroundColor: '#8B5CF6',
            animation: 'float9 9s ease-in-out infinite',
            top: '40%',
            right: '10%'
          }}
        ></div>
        <div 
          className="absolute w-4 h-4 pixelated opacity-60"
          style={{
            backgroundColor: '#8B5CF6',
            animation: 'float10 7s ease-in-out infinite',
            bottom: '40%',
            left: '40%'
          }}
        ></div>
        
        {/* Echoes of Dawn - Blue */}
        <div 
          className="absolute w-5 h-5 pixelated opacity-50"
          style={{
            backgroundColor: '#3B82F6',
            animation: 'float11 8s ease-in-out infinite',
            top: '15%',
            left: '50%'
          }}
        ></div>
        <div 
          className="absolute w-6 h-6 pixelated opacity-45"
          style={{
            backgroundColor: '#3B82F6',
            animation: 'float12 6s ease-in-out infinite',
            bottom: '15%',
            right: '40%'
          }}
        ></div>
      </div>
      
      <Card className="relative z-10 w-full max-w-md">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white font-pixel mb-2">
              Link Your Account
            </h1>
            <p className="text-gray-300 font-pixel">
              We found an existing account with this email address
            </p>
          </div>

          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="text-center">
              <p className="text-blue-300 text-sm font-pixel mb-2">
                Account Found
              </p>
              <p className="text-white text-sm font-pixel font-mono">
                {email}
              </p>
              <p className="text-gray-400 text-xs font-pixel mt-2">
                To link your {provider === 'google' ? 'Google' : provider} account, please confirm your password
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 font-pixel mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Enter your password"
                required
                className="w-full"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm font-pixel text-center">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-pixel"
              >
                {isLoading ? 'Linking Account...' : 'Link Account'}
              </Button>
              
              <Button
                type="button"
                onClick={handleCancel}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-pixel"
              >
                Cancel
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-xs font-pixel">
              Once linked, you can sign in with either your password or by using your {provider === 'google' ? 'Google' : provider} account
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function LinkAccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LinkAccountContent />
    </Suspense>
  );
}
