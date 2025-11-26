'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Load iubenda script for footer widget
    const loadIubendaScript = () => {
      // Check if script is already loaded
      if (document.querySelector('script[src="https://cdn.iubenda.com/iubenda.js"]')) {
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.iubenda.com/iubenda.js';
      script.async = true;
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }
    };
    
    // Load script immediately if DOM is ready, otherwise wait for load
    if (document.readyState === 'complete') {
      loadIubendaScript();
    } else {
      window.addEventListener('load', loadIubendaScript);
      // Also try after a short delay as fallback
      setTimeout(loadIubendaScript, 100);
    }
  }, []);

  return (
    <footer className={`border-t border-gray-800 relative z-50 ${className}`} style={{ backgroundColor: '#0d1117' }}>
      <div className="container mx-auto px-4 py-6 relative z-50">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo and Description */}
          <div className="flex flex-col items-center md:items-start">
            <Link 
              href="/home"
              onClick={(e) => {
                // If already on /home, scroll to top
                if (pathname === '/home') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="font-bold text-white font-pixel mb-2 hover:text-gray-300 transition-colors cursor-pointer"
              style={{ fontSize: '1.75rem' }}
            >
              Quillia
            </Link>
            <p className="hidden md:block text-sm text-gray-400 text-center md:text-left max-w-xs font-pixel whitespace-nowrap">
              Turn Your Days Into Adventures
            </p>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col justify-center md:justify-end space-y-3 text-sm items-center md:items-end">
            <Link 
              href="/legal/contact" 
              className="text-gray-400 hover:text-orange-400 transition-colors font-pixel relative z-50 pointer-events-auto"
              onClick={(e) => {
                // Only apply transition if we're not already on the contact page
                if (pathname !== '/legal/contact') {
                  e.preventDefault();
                  // Find the main page container and fade it out
                  const mainContainer = document.querySelector('.min-h-screen');
                  if (mainContainer) {
                    (mainContainer as HTMLElement).style.transition = 'opacity 0.15s ease-in-out';
                    (mainContainer as HTMLElement).style.opacity = '0';
                  }
                  // Navigate after fade-out
                  setTimeout(() => {
                    router.push('/legal/contact');
                  }, 150);
                }
              }}
            >
              Contact
            </Link>
            {/* Cookie Policy - Now hosted on our domain */}
            <Link 
              href="/legal/cookie-policy" 
              className="text-gray-400 hover:text-orange-400 transition-colors font-pixel relative z-50 pointer-events-auto"
              onClick={(e) => {
                // Only apply transition if we're not already on the cookie policy page
                if (pathname !== '/legal/cookie-policy') {
                  e.preventDefault();
                  // Find the main page container and fade it out
                  const mainContainer = document.querySelector('.min-h-screen');
                  if (mainContainer) {
                    (mainContainer as HTMLElement).style.transition = 'opacity 0.15s ease-in-out';
                    (mainContainer as HTMLElement).style.opacity = '0';
                  }
                  // Navigate after fade-out
                  setTimeout(() => {
                    router.push('/legal/cookie-policy');
                  }, 150);
                }
              }}
            >
              Cookie Policy
            </Link>
            {/* Privacy Policy - Now hosted on our domain */}
            <Link 
              href="/legal/privacy" 
              className="text-gray-400 hover:text-orange-400 transition-colors font-pixel relative z-50 pointer-events-auto"
              onClick={(e) => {
                // Only apply transition if we're not already on the privacy page
                if (pathname !== '/legal/privacy') {
                  e.preventDefault();
                  // Find the main page container and fade it out
                  const mainContainer = document.querySelector('.min-h-screen');
                  if (mainContainer) {
                    (mainContainer as HTMLElement).style.transition = 'opacity 0.15s ease-in-out';
                    (mainContainer as HTMLElement).style.opacity = '0';
                  }
                  // Navigate after fade-out
                  setTimeout(() => {
                    router.push('/legal/privacy');
                  }, 150);
                }
              }}
            >
              Privacy Policy
            </Link>
            {/* Notice at Collection - Required for California users */}
            <a 
              href="https://www.iubenda.com/privacy-policy/70554621#notice_at_collection" 
              className="text-gray-400 hover:text-orange-400 transition-colors font-pixel relative z-50 pointer-events-auto" 
              title="Notice at Collection"
            >
              Notice at Collection
            </a>
            {/* Terms & Conditions - Now hosted on our domain */}
            <Link 
              href="/legal/terms" 
              className="text-gray-400 hover:text-orange-400 transition-colors font-pixel relative z-50 pointer-events-auto"
              onClick={(e) => {
                // Only apply transition if we're not already on the terms page
                if (pathname !== '/legal/terms') {
                  e.preventDefault();
                  // Find the main page container and fade it out
                  const mainContainer = document.querySelector('.min-h-screen');
                  if (mainContainer) {
                    (mainContainer as HTMLElement).style.transition = 'opacity 0.15s ease-in-out';
                    (mainContainer as HTMLElement).style.opacity = '0';
                  }
                  // Navigate after fade-out
                  setTimeout(() => {
                    router.push('/legal/terms');
                  }, 150);
                }
              }}
            >
              Terms & Conditions
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center font-pixel">
            © {currentYear} Quillia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
