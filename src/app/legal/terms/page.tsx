'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useState } from 'react';
// import IubendaTerms from '@/components/IubendaTerms'; // Temporarily commented for Footer-only deployment
import Footer from '@/components/Footer';

export default function TermsPage() {
  const [termsContent, setTermsContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Fetch the terms content via our server-side API route (bypasses CORS)
    const fetchTerms = async () => {
      try {
        const response = await fetch('/api/iubenda/terms');
        
        if (response.ok) {
          let html = await response.text();
          
          // Client-side cleanup - more aggressive approach
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          // Walk through all text nodes and find ones with unwanted content
          const walker = doc.createTreeWalker(
            doc.body,
            NodeFilter.SHOW_TEXT,
            null
          );
          
          const nodesToRemove: Node[] = [];
          let node: Node | null;
          
          while (node = walker.nextNode()) {
            const text = node.textContent || '';
            if (text.includes('Welcome to the') ||
                text.includes('Latest update:') ||
                text.includes('Download PDF')) {
              // Find the closest block-level parent to remove
              let parent = node.parentElement;
              while (parent && parent !== doc.body) {
                // Check if this parent also contains "Table of" or "Summary"
                const parentText = parent.textContent || '';
                if (parentText.includes('Table of') || parentText.includes('Summary')) {
                  // Don't remove - it contains the content we want to keep
                  break;
                }
                // If it's a block element or contains only the unwanted text, mark for removal
                const tagName = parent.tagName.toLowerCase();
                if (['p', 'div', 'section', 'h1', 'h2', 'h3', 'span'].includes(tagName)) {
                  // Check if this element only has the unwanted text
                  const siblings = Array.from(parent.parentElement?.children || []);
                  const index = siblings.indexOf(parent);
                  // Remove if it's before any "Table of" content
                  const hasTableOfLater = siblings.slice(index + 1).some(sib => 
                    (sib.textContent || '').includes('Table of') || 
                    (sib.textContent || '').includes('Summary')
                  );
                  if (!hasTableOfLater && !parentText.includes('Table of') && !parentText.includes('Summary')) {
                    nodesToRemove.push(parent);
                    break;
                  }
                }
                parent = parent.parentElement;
              }
            }
          }
          
          // Remove the marked nodes
          nodesToRemove.forEach(node => {
            if (node.parentNode) {
              node.parentNode.removeChild(node);
            }
          });
          
          // Also remove by direct text matching (fallback)
          Array.from(doc.querySelectorAll('p, div, span, h1, h2, h3')).forEach(el => {
            const text = el.textContent || '';
            if ((text.includes('Welcome to the') ||
                 text.includes('Latest update:') ||
                 text.includes('Download PDF')) &&
                !text.includes('Table of') &&
                !text.includes('Summary')) {
              el.remove();
            }
          });
          
          // Final fallback: find first element with "Table of" and remove all previous siblings
          const bodyChildren = Array.from(doc.body.children);
          let tableOfIndex = -1;
          for (let i = 0; i < bodyChildren.length; i++) {
            const text = bodyChildren[i].textContent || '';
            if (text.includes('Table of') || text.includes('Summary')) {
              tableOfIndex = i;
              break;
            }
          }
          
          if (tableOfIndex > 0) {
            // Remove all elements before "Table of"
            for (let i = 0; i < tableOfIndex; i++) {
              bodyChildren[i].remove();
            }
          }
          
          html = doc.body.innerHTML;
          setTermsContent(html);
        } else {
          // Fallback: try the embed method
          console.log('Direct fetch failed, using embed method');
        }
      } catch (error) {
        console.error('Error fetching terms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerms();

    // Check if embed content actually loaded (for embed method fallback)
    const checkEmbedContent = () => {
      const container = document.getElementById('iubenda-terms');
      if (container) {
        const embedLink = container.querySelector('a.iub-body-embed');
        if (embedLink) {
          // Check if iubenda has replaced the link with actual content
          const hasContent = container.innerHTML.trim().length > 200 && 
                           !container.innerHTML.includes('Terms and Conditions</a>');
          if (!hasContent && !termsContent) {
            // Embed hasn't loaded, show fallback after timeout
            setTimeout(() => {
              if (!termsContent && !container.querySelector('.iubenda-embed-content')) {
                setShowFallback(true);
                setIsLoading(false);
              }
            }, 5000);
          }
        }
      }
    };
    
    // Check periodically if embed loaded
    const embedCheckInterval = setInterval(checkEmbedContent, 1000);
    
    // Also set a timeout to show fallback if content doesn't load
    const fallbackTimeout = setTimeout(() => {
      if (!termsContent) {
        const container = document.getElementById('iubenda-terms');
        if (container) {
          const embedLink = container.querySelector('a.iub-body-embed');
          if (embedLink && embedLink.textContent === 'Terms and Conditions') {
            // Embed hasn't loaded, show fallback
            setShowFallback(true);
            setIsLoading(false);
          }
        }
      }
    }, 8000); // 8 second timeout

    // Inject styles to hide unwanted elements - AGGRESSIVE CSS APPROACH
    const styleId = 'iubenda-terms-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Hide any remaining iubenda footer elements */
        #iubenda-terms footer,
        #iubenda-terms .iubenda-footer,
        #iubenda-terms [class*="footer"],
        #iubenda-terms [id*="footer"],
        #iubenda-terms .downloadable-documents,
        #iubenda-terms [class*="downloadable"],
        #iubenda-terms address,
        #iubenda-terms [class*="iubenda-attribution"],
        #iubenda-terms [id*="iubenda-attribution"] {
          display: none !important;
        }
        
        /* Style the main content */
        #iubenda-terms .iubenda-embed,
        #iubenda-terms {
          color: #d1d5db;
          font-family: 'Georgia', 'Times New Roman', serif;
        }
        #iubenda-terms .iubenda-embed h1,
        #iubenda-terms .iubenda-embed h2,
        #iubenda-terms .iubenda-embed h3,
        #iubenda-terms h1,
        #iubenda-terms h2,
        #iubenda-terms h3 {
          color: #f97316;
          margin-top: 1.5em;
          margin-bottom: 0.75em;
        }
        #iubenda-terms .iubenda-embed p,
        #iubenda-terms p {
          margin-bottom: 1em;
          line-height: 1.7;
        }
        #iubenda-terms .iubenda-embed ul,
        #iubenda-terms .iubenda-embed ol,
        #iubenda-terms ul,
        #iubenda-terms ol {
          margin-bottom: 1em;
          padding-left: 1.5em;
        }
        #iubenda-terms .iubenda-embed li,
        #iubenda-terms li {
          margin-bottom: 0.5em;
        }
        #iubenda-terms .iubenda-embed a,
        #iubenda-terms a {
          color: #f97316;
          text-decoration: underline;
        }
        #iubenda-terms .iubenda-embed a:hover,
        #iubenda-terms a:hover {
          color: #fb923c;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Use MutationObserver to catch and remove unwanted elements as they're added
    const observer = new MutationObserver((mutations) => {
      const container = document.getElementById('iubenda-terms');
      if (!container) return;
      
      // Find and remove welcome/update elements
      const allElements = container.querySelectorAll('*');
      allElements.forEach(el => {
        const text = el.textContent || '';
        if ((text.includes('Welcome to the') ||
             text.includes('Latest update:') ||
             text.includes('Download PDF')) &&
            !text.includes('Table of') &&
            !text.includes('Summary')) {
          el.remove();
        }
      });
      
      // Also hide using CSS as backup
      allElements.forEach(el => {
        const text = el.textContent || '';
        if (text.includes('Welcome to the') ||
            text.includes('Latest update:') ||
            text.includes('Download PDF')) {
          (el as HTMLElement).style.display = 'none';
        }
      });
    });
    
    // Start observing
    const container = document.getElementById('iubenda-terms');
    if (container) {
      observer.observe(container, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }
    
    // Also run cleanup immediately after a delay
    setTimeout(() => {
      const container = document.getElementById('iubenda-terms');
      if (container) {
        container.querySelectorAll('*').forEach(el => {
          const text = el.textContent || '';
          if ((text.includes('Welcome to the') ||
               text.includes('Latest update:') ||
               text.includes('Download PDF')) &&
              !text.includes('Table of') &&
              !text.includes('Summary')) {
            el.remove();
            (el as HTMLElement).style.display = 'none';
          }
        });
      }
    }, 100);
    
    setTimeout(() => {
      const container = document.getElementById('iubenda-terms');
      if (container) {
        container.querySelectorAll('*').forEach(el => {
          const text = el.textContent || '';
          if ((text.includes('Welcome to the') ||
               text.includes('Latest update:') ||
               text.includes('Download PDF')) &&
              !text.includes('Table of') &&
              !text.includes('Summary')) {
            el.remove();
            (el as HTMLElement).style.display = 'none';
          }
        });
      }
    }, 500);
    
    setTimeout(() => {
      const container = document.getElementById('iubenda-terms');
      if (container) {
        container.querySelectorAll('*').forEach(el => {
          const text = el.textContent || '';
          if ((text.includes('Welcome to the') ||
               text.includes('Latest update:') ||
               text.includes('Download PDF')) &&
              !text.includes('Table of') &&
              !text.includes('Summary')) {
            el.remove();
            (el as HTMLElement).style.display = 'none';
          }
        });
      }
    }, 1000);

    return () => {
      // Cleanup: remove style on unmount
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
      clearTimeout(fallbackTimeout);
      clearInterval(embedCheckInterval);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black relative overflow-hidden">
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

      <div className="w-full max-w-6xl relative z-10 bg-gray-900/95 border border-gray-700 rounded-lg shadow-2xl">
        <div className="p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white font-pixel">Terms of Service</h1>
            <p className="text-gray-300 font-pixel">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose prose-invert max-w-none">
            {/* iubenda Terms & Conditions Embed - Try direct fetch first, fallback to embed */}
            <div 
              id="iubenda-terms" 
              className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400 min-h-[600px]"
            >
              {termsContent ? (
                <div 
                  className="text-gray-300 font-serif leading-relaxed iubenda-embed"
                  dangerouslySetInnerHTML={{ __html: termsContent }}
                />
              ) : showFallback ? (
                // Show original content as fallback if embed doesn't load
                <div className="text-gray-300 font-serif leading-relaxed">
                  <p className="mb-4 text-orange-400 text-sm">
                    Note: Unable to load iubenda content. Showing original terms.
                  </p>
                  {/* Original content sections will be uncommented below */}
                  <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
                    <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">1. Acceptance of Terms and Binding Agreement</h2>
                    <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                      These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User&quot;, &quot;you&quot;, or &quot;your&quot;) and Quillia (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) regarding your use of the Quillia fantasy journal application and related services (&quot;Service&quot;). By accessing, downloading, installing, or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
                    </p>
                    <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                      If you do not agree to these Terms, you may not use the Service. We reserve the right to modify these Terms at any time, and your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
                    </p>
                  </section>
                  <p className="text-gray-400 text-sm mt-4">
                    For the complete terms and conditions, please visit{' '}
                    <a href="https://www.iubenda.com/terms-and-conditions/70554621" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline">
                      our iubenda Terms & Conditions page
                    </a>
                  </p>
                </div>
              ) : (
                <>
                  <a 
                    href="https://www.iubenda.com/terms-and-conditions/70554621" 
                    className="iubenda-black iubenda-noiframe iubenda-embed iubenda-noiframe iub-body-embed" 
                    title="Terms and Conditions"
                  >
                    Terms and Conditions
                  </a>
                  <Script
                    id="iubenda-terms-embed"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                      __html: `
                        (function (w,d) {
                          var loader = function () {
                            var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; 
                            s.src="https://cdn.iubenda.com/iubenda.js"; 
                            tag.parentNode.insertBefore(s,tag);
                          }; 
                          // Run immediately instead of waiting for load event
                          if(d.readyState === 'complete'){
                            loader();
                          }else if(w.addEventListener){
                            w.addEventListener("load", loader, false);
                          }else if(w.attachEvent){
                            w.attachEvent("onload", loader);
                          }else{
                            w.onload = loader;
                          }
                          // Also try immediately as fallback
                          setTimeout(loader, 100);
                        })(window, document);
                      `
                    }}
                  />
                </>
              )}
            </div>

            {/* Original content - Commented out to test iubenda embed */}
            {/*
            <>
            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">1. Acceptance of Terms and Binding Agreement</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User&quot;, &quot;you&quot;, or &quot;your&quot;) and Quillia (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) regarding your use of the Quillia fantasy journal application and related services (&quot;Service&quot;). By accessing, downloading, installing, or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
              </p>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                If you do not agree to these Terms, you may not use the Service. We reserve the right to modify these Terms at any time, and your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
              </p>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                <strong>Effective Date:</strong> January 22, 2025
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">2. Service Description and AI-Generated Content</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                Quillia is a fantasy journal application that transforms your daily experiences into magical adventures using artificial intelligence. The Service includes:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li><strong>AI Story Generation:</strong> OpenAI GPT-4o-mini transforms your journal entries into fantasy stories</li>
                <li><strong>AI Image Generation:</strong> OpenAI DALL-E 3 and Google Gemini create visual content for your stories</li>
                <li><strong>Character System:</strong> Create and manage multiple fantasy characters with unique personalities and memories</li>
                <li><strong>Theme-Based Adventures:</strong> Multiple fantasy themes including pirate, detective, cowboy, and more</li>
                <li><strong>Character Memory:</strong> AI maintains continuity across your character&apos;s adventures and relationships</li>
                <li><strong>Progress Tracking:</strong> Experience points, character levels, and achievement systems</li>
                <li><strong>Calendar Integration:</strong> Track your fantasy journey over time</li>
                <li><strong>Layered Avatar System:</strong> Customize character appearances with modular avatar pieces</li>
              </ul>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                <strong>AI Processing:</strong> Your journal entries are processed by OpenAI and Google Gemini to generate personalized fantasy content. These services may have their own terms and conditions that apply to the generated content.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">3. Eligibility and Age Restrictions</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                You must be at least 13 years old to use the Service. If you are between 13 and 18 years old, you must have parental or guardian consent to use the Service.
              </p>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                By using the Service, you represent and warrant that you meet the age requirements and have the legal capacity to enter into this agreement. If you are under 18, you represent that you have obtained parental or guardian consent.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">4. User Accounts and Registration</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                <strong>Account Registration Requirements:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li><strong>Username:</strong> Required, must be at least 3 characters long, contain only letters, numbers, and underscores</li>
                <li><strong>Email:</strong> Required for account verification and communication</li>
                <li><strong>Password:</strong> Required for username/password accounts, minimum 6 characters</li>
                <strong>Authentication Methods:</strong>
                <li>Google OAuth (automatic username generation)</li>
                <li>Username/password with email verification</li>
              </ul>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                You agree to provide accurate and complete information during registration and to update such information to keep it current. You are responsible for all activities that occur under your account, whether authorized or not.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">5. Acceptable Use Policy and Prohibited Activities</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                You agree not to use the Service for any unlawful or prohibited activities. The following activities are strictly prohibited:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li>Creating, uploading, or sharing content that is graphic, violent, or disturbing</li>
                <li>Posting discriminatory, racist, hateful, or offensive content</li>
                <li>Content promoting self-harm, violence, or illegal activities</li>
                <li>Harassment, abuse, or threatening behavior toward other users</li>
                <li>Spam, commercial content, or unauthorized advertising</li>
                <li>Attempting to hack, disrupt, or compromise the Service</li>
                <li>Violating intellectual property rights of others</li>
                <li>Creating multiple accounts to circumvent restrictions</li>
              </ul>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                We reserve the right to remove content that violates these Terms and to suspend or terminate accounts for violations.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">6. Content Moderation and Reporting</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                We reserve the right to moderate content and remove any material that violates these Terms.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">7. Intellectual Property Rights and Content Ownership</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                You retain ownership of your original journal entries, but grant us license to use them for service provision.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">8. Privacy and Data Protection</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                Your privacy is important to us. Our collection, use, and protection of your information is governed by our Privacy Policy.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">9. Subscription Services and Payment Terms</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                Quillia offers both free and paid subscription plans:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li><strong>Free Plan:</strong> 1 character slot, basic journaling capabilities</li>
                <li><strong>Tribute Plan:</strong> $7.00 USD per week, 3 character slots, unlimited AI generation</li>
              </ul>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                <strong>Payment Processing:</strong>
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">
                <li>Payments are processed through Paddle (Merchant of Record)</li>
                <li>Weekly billing cycle for Tribute subscriptions</li>
                <li>Automatic renewal unless cancelled</li>
                <li>Subscription fees are non-refundable</li>
                <li>Cancellation takes effect at the end of the current billing period</li>
                <li>Failed payments may result in subscription suspension</li>
                <li>We reserve the right to change pricing with 30 days&apos; notice</li>
              </ul>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">10. Limitation of Liability and Indemnification</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, QUILLIA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE, ARISING OUT OF OR RELATING TO YOUR USE OF THE SERVICE.
              </p>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                Our total liability to you for any claims arising from or relating to the Service shall not exceed the amount you paid for the Service in the 12 months preceding the claim.
              </p>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                We do not warrant that the Service will be error-free, uninterrupted, or free from viruses or other harmful components.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">11. Termination and Account Suspension</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                You may terminate your account at any time by contacting us at contact@quillia.app. We may terminate or suspend your account for violations of these Terms.
              </p>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                Upon termination, your right to use the Service ceases immediately. We will delete your data within 30 days of account termination, unless required to retain it for legal purposes.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">12. Dispute Resolution and Governing Law</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                These Terms are governed by the laws of Romania. Any disputes shall be resolved in the courts of Romania.
              </p>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                For EU users, you have the right to use the European Commission&apos;s Online Dispute Resolution platform at https://ec.europa.eu/consumers/odr/.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">13. Force Majeure</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                We are not liable for delays or failures due to circumstances beyond our control.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">14. Changes to Terms and Service</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                We may modify these Terms at any time with notice to users.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">15. Governing Law and Jurisdiction</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                These Terms are governed by applicable law and jurisdiction.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">16. Severability and Entire Agreement</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and Quillia.
              </p>
            </section>

            <section className="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 font-serif">18. Company Information and Contact</h2>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                For questions about these Terms, please contact us at:
              </p>
              <div className="mb-4 text-gray-300 font-serif leading-relaxed">
                <p><strong>Email:</strong> <Link href="mailto:contact@quillia.app" className="text-orange-400 hover:text-orange-300">contact@quillia.app</Link></p>
                <p><strong>Website:</strong> <Link href="https://quillia.app" className="text-orange-400 hover:text-orange-300">https://quillia.app</Link></p>
                <p><strong>Business Address:</strong> [Your Business Address], Romania</p>
              </div>
              <p className="mb-4 text-gray-300 font-serif leading-relaxed">
                These Terms of Service are effective as of January 22, 2025.
              </p>
            </section>
            </>
            */}
          </div>

          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-pixel px-6 py-3 rounded transition-colors"
            >
              Back to Quillia
            </Link>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
