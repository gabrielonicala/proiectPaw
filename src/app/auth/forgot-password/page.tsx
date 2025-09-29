'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send reset email. Please try again.');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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
          
          {/* Blazeheart Saga - Red */}
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

        <Card className="w-full max-w-md relative z-10 bg-gray-900/95 border border-gray-700">
          <div className="p-6 text-center">
            <div className="text-green-400 text-6xl mb-4 font-pixel">✓</div>
            <h1 className="text-2xl font-bold text-white mb-4 font-pixel">Check Your Email</h1>
            <p className="text-gray-300 mb-6 font-pixel">
              We&apos;ve sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-gray-400 text-sm mb-6 font-pixel">
              If you don&apos;t see the email, check your spam folder.
            </p>
            <Button
              onClick={() => router.push('/auth/signin')}
              className="w-full"
            >
              Back to Sign In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
        
        {/* Blazeheart Saga - Red */}
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

      <Card className="w-full max-w-md relative z-10 bg-gray-900/95 border border-gray-700">
        <div className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2 font-pixel">Forgot Password?</h1>
            <p className="text-gray-300 font-pixel">Enter your email to reset your password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2 font-pixel">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Enter your email"
                className="w-full"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center font-pixel">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300 font-pixel mb-2">
              Remember your password?
            </p>
            <a href="/auth/signin" className="text-blue-400 hover:text-blue-300 font-pixel">
              Sign in
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
