'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in effect when page loads
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '', type: 'general' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`min-h-screen flex flex-col bg-black relative overflow-hidden transition-opacity duration-150 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex-1 flex items-center justify-center p-4">
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

      <Card className="w-full max-w-2xl relative z-10 bg-gray-900/95 border border-gray-700">
        <div className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2 font-pixel">Contact Us</h1>
            <p className="text-gray-300 font-pixel">Get in touch with the Quillia team</p>
          </div>

          {status === 'success' && (
            <div className="mb-6 p-4 bg-green-900/50 border border-green-600 rounded-lg">
              <p className="text-green-400 text-center font-pixel">
                Thank you for your message! We&apos;ll get back to you soon.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded-lg">
              <p className="text-red-400 text-center font-pixel">
                Sorry, there was an error sending your message. Please try again.
              </p>
            </div>
          )}

          <form id="contact-form" name="contact-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2 font-pixel">
                  Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(value) => handleInputChange('name', value)}
                  placeholder="Your name"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2 font-pixel">
                  Email *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(value) => handleInputChange('email', value)}
                  placeholder="your.email@example.com"
                  className="w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2 font-pixel">
                Subject *
              </label>
              <Input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={(value) => handleInputChange('subject', value)}
                placeholder="What is this about?"
                className="w-full"
                required
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2 font-pixel">
                Inquiry Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white font-pixel focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="general">General Inquiry</option>
                <option value="support">Technical Support</option>
                <option value="privacy">Privacy Concern</option>
                <option value="feature">Feature Request</option>
                <option value="bug">Bug Report</option>
                <option value="business">Business Inquiry</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2 font-pixel">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Tell us more about your inquiry..."
                rows={6}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white font-sans focus:outline-none focus:ring-2 focus:ring-orange-500 resize-vertical"
                required
              />
            </div>

            <Button
              id="contact-submit"
              type="submit"
              disabled={isLoading}
              className="w-full relative"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-4 border-yellow-400 border-t-transparent pixelated animate-spin"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                'Send Message'
              )}
            </Button>
          </form>
          {/* iubenda Consent Database - Submit function for contact form */}
          <Script
            id="iubenda-consent-contact"
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
                    const form = document.getElementById('contact-form');
                    
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
                      const name = (formData.get('name') || '').trim();
                      const subject = (formData.get('subject') || '').trim();
                      const message = (formData.get('message') || '').trim();
                      
                      // Create a unique hash for this submission
                      const submissionHash = btoa(email + '|' + name + '|' + subject + '|' + message.substring(0, 100)).replace(/[^a-zA-Z0-9]/g, '');
                      const submissionId = 'contact_' + submissionHash + '_' + Date.now();
                      
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
                                full_name: name
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
        </div>
      </Card>
      </div>
      <Footer />
    </div>
  );
}
