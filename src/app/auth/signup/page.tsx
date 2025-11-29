'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';

export default function SignUpPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    // Username validation
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      setIsLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    if (password.length > 20) {
      setError('Password must be at most 20 characters');
      setIsLoading(false);
      return;
    }

    try {
      // Create user account
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Detect and send timezone
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account. Please try again.');
        return;
      }

      // Redirect to success page
      setError(''); // Clear any previous errors
      router.push('/auth/signup-success');
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden p-4">
      {/* Theme-colored moving squares */}
      <div className="absolute inset-0">
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

      <Card className="w-full max-w-md relative z-10 bg-gray-900/90 backdrop-blur-sm border-gray-700">
        <div className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2 font-pixel">Start Your Adventure</h1>
            <p className="text-gray-300 font-pixel">Create your account to begin</p>
          </div>

          {/* Google Sign-Up Option */}
          <div className="mb-6">
            <GoogleSignInButton 
              variant="signup"
              className="w-full"
            />
            <div className="text-center text-white/70 my-4 -mb-4 text-sm font-pixel">or</div>
          </div>

          <form id="signup-form" name="signup-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2 font-pixel">
                Username
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={setUsername}
                // placeholder="Choose a unique username"
                placeholder="Username"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2 font-pixel">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={setEmail}
                // placeholder="Enter your email"
                placeholder="Email"
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
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={setPassword}
                  // placeholder="Enter your password"
                  placeholder="Password"
                  className="w-full pr-12"
                  maxLength={20}
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2 font-pixel">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  // placeholder="Confirm your password"
                  placeholder="Confirm password"
                  className="w-full pr-12"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors flex items-center justify-center right-[2%] min-[769px]:right-[4%]"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
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

            <Button
              id="signup-submit"
              type="submit"
              disabled={isLoading}
              className="w-full relative"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-4 border-yellow-400 border-t-transparent pixelated animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
          {/* iubenda Consent Database - Submit function for signup form */}
          <Script
            id="iubenda-consent-signup"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  // Initialize global submission tracking Set if it doesn't exist
                  if (!window._iubConsentSubmissions) {
                    window._iubConsentSubmissions = new Set();
                  }
                  
                  function waitForIubenda(callback, maxAttempts = 50) {
                    let attempts = 0;
                    const checkInterval = setInterval(function() {
                      attempts++;
                      if (window._iub && window._iub.cons_instructions) {
                        clearInterval(checkInterval);
                        callback();
                      } else if (attempts >= maxAttempts) {
                        clearInterval(checkInterval);
                        console.warn('iubenda Consent Database not loaded after ' + maxAttempts + ' attempts');
                      }
                    }, 100);
                  }
                  
                  function setupConsentCollection() {
                    const form = document.getElementById('signup-form');
                    
                    if (!form) {
                      // Retry if form not found yet
                      setTimeout(setupConsentCollection, 500);
                      return;
                    }
                    
                    // Check if this form already has a handler attached
                    if (form._iubConsentHandlerAttached) {
                      return; // Already set up
                    }
                    form._iubConsentHandlerAttached = true;
                    
                    // Create handler
                    const consentHandler = function(e) {
                      // Simple debounce - prevent multiple rapid fires
                      if (form._iubSending) {
                        return;
                      }
                      form._iubSending = true;
                      setTimeout(function() {
                        form._iubSending = false;
                      }, 500);
                      
                      const formData = new FormData(form);
                      const email = (formData.get('email') || '').trim();
                      const username = (formData.get('username') || '').trim();
                      
                      // Create a unique hash for this submission
                      const submissionHash = btoa(email + '|' + username).replace(/[^a-zA-Z0-9]/g, '');
                      const submissionId = 'signup_' + submissionHash + '_' + Date.now();
                      
                      // Check if we've already processed this exact submission
                      if (window._iubConsentSubmissions.has(submissionId)) {
                        console.log('Duplicate consent submission prevented:', submissionId);
                        return;
                      }
                      
                      // Mark as processed immediately
                      window._iubConsentSubmissions.add(submissionId);
                      
                      // Clean up old entries (keep only last 100)
                      if (window._iubConsentSubmissions.size > 100) {
                        const entries = Array.from(window._iubConsentSubmissions);
                        window._iubConsentSubmissions.clear();
                        entries.slice(-50).forEach(function(id) {
                          window._iubConsentSubmissions.add(id);
                        });
                      }
                      
                      // Send consent
                      try {
                        if (window._iub && window._iub.cons_instructions) {
                          const formDataObj = {};
                          for (let [key, value] of formData.entries()) {
                            formDataObj[key] = value;
                          }
                          
                          window._iub.cons_instructions.push(["submit", {
                            form: form,
                            consent: {
                              subject: {
                                email: email,
                                full_name: username
                              },
                              legal_notices: [
                                {
                                  identifier: "cookie_policy",
                                  version: 1
                                }
                              ],
                              proofs: [
                                {
                                  content: JSON.stringify(formDataObj),
                                  form: form.outerHTML
                                }
                              ],
                              preferences: {}
                            }
                          }]);
                        }
                      } catch(err) {
                        console.error('Error sending consent data:', err);
                        // Remove from set on error so it can be retried
                        window._iubConsentSubmissions.delete(submissionId);
                      }
                    };
                    
                    // Attach listener only once
                    form.addEventListener('submit', consentHandler, { once: false, passive: true });
                  }
                  
                  // Wait for iubenda and set up
                  waitForIubenda(setupConsentCollection);
                  
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', function() {
                      waitForIubenda(setupConsentCollection);
                    });
                  } else {
                    waitForIubenda(setupConsentCollection);
                  }
                })();
              `
            }}
          />

          {/* Forgot password link - only needed on sign-in page
          <div className="mt-4 text-center">
            <a href="/auth/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm font-pixel">
              Forgot your password?
            </a>
          </div>
          */}

          <div className="mt-6 text-center">
            <p className="text-gray-300 font-pixel">
              Already have an account?
            </p>
            <a href="/auth/signin" className="text-blue-400 hover:text-blue-300 font-pixel">
              Sign in
            </a>
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
