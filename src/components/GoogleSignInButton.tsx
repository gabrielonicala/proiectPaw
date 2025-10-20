'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

interface GoogleSignInButtonProps {
  text?: string;
  className?: string;
  variant?: 'signin' | 'signup';
}

export function GoogleSignInButton({ 
  text, 
  className = "",
  variant = 'signin'
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const defaultText = variant === 'signin' ? 'Continue with Google' : 'Sign up with Google';
  const buttonText = text || defaultText;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { 
        callbackUrl: '/',
        redirect: true 
      });
    } catch (error) {
      console.error('Google sign-in error:', error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className={`flex items-center justify-center gap-3 bg-white text-gray-800 border border-gray-300 rounded-lg px-4 py-4 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-pixel text-xl ${className}`}
      style={{ textShadow: 'none' }}
    >
      <img 
        src="/pixelatedGoogleIcon.jpg" 
        alt="Google" 
        className="w-5 h-5"
        style={{ imageRendering: 'pixelated' }}
      />
      {isLoading ? 'Signing in...' : buttonText}
    </button>
  );
}
