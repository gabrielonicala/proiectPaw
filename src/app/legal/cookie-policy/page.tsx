'use client';

import Script from 'next/script';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function CookiePolicyPage() {
  const [contentLoaded, setContentLoaded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Reset state on route change
    setContentLoaded(false);
    
    // Wait a bit for any page transitions to complete
    const initTimeout = setTimeout(() => {
      // Force reload iubenda content on every page visit
      const loadIubendaContent = () => {
        const container = document.getElementById('iubenda-cookie-policy');
        if (!container) return;

        // COMPLETELY CLEAR the container - remove ALL content
        container.innerHTML = '';

        // Create fresh anchor tag
        const anchor = document.createElement('a');
        anchor.href = 'https://www.iubenda.com/privacy-policy/70554621/cookie-policy';
        anchor.className = 'iubenda-black iubenda-noiframe iubenda-embed iubenda-noiframe iub-body-embed';
        anchor.title = 'Cookie Policy';
        anchor.textContent = 'Cookie Policy';
        container.appendChild(anchor);

        // Remove existing iubenda script to force fresh load
        const existingScript = document.querySelector('script[src="https://cdn.iubenda.com/iubenda.js"]');
        if (existingScript) {
          existingScript.remove();
        }

        // Clear iubenda from window if it exists
        if ((window as any).iubenda) {
          delete (window as any).iubenda;
        }

        // Create and load script fresh
        const script = document.createElement('script');
        script.src = 'https://cdn.iubenda.com/iubenda.js';
        script.async = true;
        script.onload = () => {
          // Wait a bit for iubenda to initialize, then trigger load
          setTimeout(() => {
            if ((window as any).iubenda) {
              if (typeof (window as any).iubenda.load === 'function') {
                (window as any).iubenda.load();
              }
              // Also try direct processing
              if (typeof (window as any).iubenda.processEmbeds === 'function') {
                (window as any).iubenda.processEmbeds();
              }
            }
          }, 200);
        };
        document.head.appendChild(script);
      };

      loadIubendaContent();
    }, 200); // Wait 200ms for transitions

    // Check for content loading
    const checkContent = () => {
      const container = document.getElementById('iubenda-cookie-policy');
      if (!container) return false;

      const hasContent = container.innerHTML.length > 500 && 
                        container.querySelector('h1, h2, h3, section');
      const anchor = container.querySelector('a.iub-body-embed');
      const anchorReplaced = !anchor || !container.innerHTML.includes('Cookie Policy</a>');

      if (hasContent || (anchorReplaced && container.innerHTML.length > 200)) {
        setContentLoaded(true);
        return true;
      }
      return false;
    };

    // Use MutationObserver to detect when content loads
    const container = document.getElementById('iubenda-cookie-policy');
    if (container) {
      const observer = new MutationObserver(() => {
        if (checkContent()) {
          observer.disconnect();
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        characterData: true
      });

      // Also poll as fallback
      const interval = setInterval(() => {
        if (checkContent()) {
          clearInterval(interval);
          observer.disconnect();
        }
      }, 200);

      // Fallback timeout - show page after 3 seconds
      const fallbackTimeout = setTimeout(() => {
        clearInterval(interval);
        observer.disconnect();
        setContentLoaded(true);
      }, 3000);

      return () => {
        clearTimeout(initTimeout);
        clearInterval(interval);
        clearTimeout(fallbackTimeout);
        observer.disconnect();
      };
    }

    return () => {
      clearTimeout(initTimeout);
    };
  }, [pathname]); // Re-run on route change

  return (
    <div className={`min-h-screen bg-white transition-opacity duration-300 ${contentLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Allow text selection on cookie policy page */}
      <style dangerouslySetInnerHTML={{
        __html: `
          #iubenda-cookie-policy,
          #iubenda-cookie-policy * {
            -webkit-user-select: text !important;
            -khtml-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
          }
        `
      }} />
      {/* iubenda Cookie Policy - Clean embed, no custom styling, full width */}
      <div id="iubenda-cookie-policy" key={pathname}>
        <a 
          href="https://www.iubenda.com/privacy-policy/70554621/cookie-policy" 
          className="iubenda-black iubenda-noiframe iubenda-embed iubenda-noiframe iub-body-embed" 
          title="Cookie Policy"
        >
          Cookie Policy
        </a>
      </div>
      <Footer />
    </div>
  );
}

