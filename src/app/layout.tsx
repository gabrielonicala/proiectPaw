import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "../styles/custom-cursor.css";
import SessionProvider from "@/components/SessionProvider";
import AssetPreloader from "@/components/AssetPreloader";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import ConditionalAnalytics from "@/components/ConditionalAnalytics";
import IubendaBannerManager from "@/components/IubendaBannerManager";
// import IubendaScriptLoader from "@/components/IubendaScriptLoader"; // Temporarily commented for Footer-only deployment

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quillia - Turn Your Days Into Adventures",
  description: "A magical journal app that turns your daily experiences into fantasy adventures with AI-generated stories, images, and animations.",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="iubenda-unified-embed"
          strategy="afterInteractive"
          src="https://embeds.iubenda.com/widgets/79c6704c-4cbd-460f-b519-5e7a3d06ddf8.js"
        />
        {/* iubenda Consent Database - Must be loaded for form consent collection */}
        <Script
          id="iubenda-consent-database"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var _iub = _iub || {}; 
              _iub.cons_instructions = _iub.cons_instructions || []; 
              _iub.cons_instructions.push(["init", {api_key: "hILOWdQyCvy6xtOPwzGoeFGSr5yEdoZF"}]);
            `
          }}
        />
        <Script
          id="iubenda-consent-database-script"
          strategy="afterInteractive"
          src="https://cdn.iubenda.com/cons/iubenda_cons.js"
          async
        />
        {/* Google Consent Mode v2 - Must be loaded before any Google services */}
        <Script
          id="google-consent-mode"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied',
                'functionality_storage': 'denied',
                'personalization_storage': 'denied',
                'security_storage': 'granted',
                'wait_for_update': 500
              });
            `
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* iubenda Privacy Controls and Cookie Solution - Unified Embedding Code */}
        {/* This should be placed at the very beginning of the <head> according to iubenda */}
        {/* Using strategy="beforeInteractive" to load it early */}
        {/* <Script
          id="iubenda-unified-embed"
          strategy="afterInteractive"
          src="https://embeds.iubenda.com/widgets/79c6704c-4cbd-460f-b519-5e7a3d06ddf8.js"
        /> */}
        {/* <IubendaScriptLoader /> */}
        <SessionProvider>
          <AssetPreloader>
            {children}
          </AssetPreloader>
        </SessionProvider>
        {/* Temporarily hidden to see iubenda's default banner */}
        {/* <CookieConsentBanner /> */}
        <ConditionalAnalytics />
        {/* Manage iubenda banner position and widget visibility */}
        <IubendaBannerManager />
        {/* Move iubenda banner to bottom after it loads and hide privacy widget when logged in */}
        {/* Temporarily disabled - using IubendaBannerManager component instead */}
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                
                function init() {
                  function moveBannerToBottom() {
                    try {
                      const banner = document.getElementById('iubenda-cs-banner');
                      if (banner) {
                        banner.classList.remove('iubenda-cs-top');
                        banner.classList.add('iubenda-cs-bottom');
                        banner.style.cssText = 'position: fixed !important; bottom: 0 !important; top: auto !important; left: 0 !important; right: 0 !important; transform: translateY(0) !important; z-index: 99999 !important;';
                        return true;
                      }
                    } catch(e) {}
                    return false;
                  }
                  
                  function hideWidgets() {
                    try {
                      if (!document.body) return;
                      const path = window.location.pathname;
                      const shouldShow = path === '/home' || path === '/legal/contact';
                      document.body.setAttribute('data-page', path);
                      
                      const privacyWidget = document.querySelector('.iub__us-widget');
                      const consentButton = document.querySelector('.iubenda-tp-btn.iubenda-cs-preferences-link');
                      
                      if (!shouldShow) {
                        if (privacyWidget) {
                          privacyWidget.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
                        }
                        if (consentButton) {
                          consentButton.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
                        }
                      }
                    } catch(e) {}
                  }
                  
                  moveBannerToBottom();
                  hideWidgets();
                  
                  // Retry multiple times
                  [0, 50, 100, 500, 1000, 2000].forEach(delay => {
                    setTimeout(() => {
                      moveBannerToBottom();
                      hideWidgets();
                    }, delay);
                  });
                  
                  // Continuous monitoring
                  if (document.body) {
                    const observer = new MutationObserver(() => {
                      moveBannerToBottom();
                      hideWidgets();
                    });
                    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
                    
                    // Monitor route changes
                    let lastPath = window.location.pathname;
                    setInterval(() => {
                      if (window.location.pathname !== lastPath) {
                        lastPath = window.location.pathname;
                        moveBannerToBottom();
                        hideWidgets();
                        [0, 50, 100, 200, 500].forEach(delay => {
                          setTimeout(() => {
                            moveBannerToBottom();
                            hideWidgets();
                          }, delay);
                        });
                      }
                    }, 50);
                    
                    // Continuous maintenance
                    setInterval(() => {
                      moveBannerToBottom();
                      hideWidgets();
                    }, 200);
                  }
                }
                
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', init);
                } else {
                  init();
                }
              })();
            `
          }}
        /> */}
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  function checkAndHandleBanner() {
                    try {
                      const banner = document.getElementById('iubenda-cs-banner');
                      if (banner) {
                        // Move banner to bottom for all pages
                        banner.classList.remove('iubenda-cs-top');
                        banner.classList.add('iubenda-cs-bottom');
                        
                        // Force positioning with inline styles
                        banner.style.position = 'fixed';
                        banner.style.bottom = '0';
                        banner.style.top = 'auto';
                        banner.style.left = '0';
                        banner.style.right = '0';
                        banner.style.transform = 'translateY(0)';
                        banner.style.zIndex = '99999';
                        
                        return true;
                      }
                    } catch (e) {
                      console.error('Error in checkAndHandleBanner:', e);
                    }
                    return false;
                  }
                  
                  function hidePrivacyWidget() {
                    try {
                      if (!document.body) return false;
                      
                      const path = window.location.pathname;
                      // Only show on /home and /contact pages, hide everywhere else
                      const shouldShow = path === '/home' || path === '/legal/contact';
                      
                      // Update body data attribute for CSS targeting
                      document.body.setAttribute('data-page', path);
                      
                      if (!shouldShow) {
                        // Hide the privacy widget (Notice at collection / Your Privacy Choices)
                        const privacyWidget = document.querySelector('.iub__us-widget');
                        if (privacyWidget) {
                          privacyWidget.style.setProperty('display', 'none', 'important');
                          privacyWidget.style.setProperty('visibility', 'hidden', 'important');
                          privacyWidget.style.setProperty('opacity', '0', 'important');
                          privacyWidget.style.setProperty('pointer-events', 'none', 'important');
                        }
                        
                        // Hide the floating consent preferences button with !important
                        const consentButton = document.querySelector('.iubenda-tp-btn.iubenda-cs-preferences-link');
                        if (consentButton) {
                          consentButton.style.setProperty('display', 'none', 'important');
                          consentButton.style.setProperty('visibility', 'hidden', 'important');
                          consentButton.style.setProperty('opacity', '0', 'important');
                          consentButton.style.setProperty('pointer-events', 'none', 'important');
                        }
                        
                        return true;
                      } else {
                        // Show the elements on allowed pages
                        const privacyWidget = document.querySelector('.iub__us-widget');
                        if (privacyWidget) {
                          privacyWidget.style.removeProperty('display');
                          privacyWidget.style.removeProperty('visibility');
                          privacyWidget.style.removeProperty('opacity');
                          privacyWidget.style.removeProperty('pointer-events');
                        }
                        
                        const consentButton = document.querySelector('.iubenda-tp-btn.iubenda-cs-preferences-link');
                        if (consentButton) {
                          consentButton.style.removeProperty('display');
                          consentButton.style.removeProperty('visibility');
                          consentButton.style.removeProperty('opacity');
                          consentButton.style.removeProperty('pointer-events');
                        }
                      }
                    } catch (e) {
                      console.error('Error in hidePrivacyWidget:', e);
                    }
                    return false;
                  }
                  
                  // Wait for DOM to be ready
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', function() {
                      checkAndHandleBanner();
                      hidePrivacyWidget();
                    });
                  } else {
                    // DOM is already ready
                    checkAndHandleBanner();
                    hidePrivacyWidget();
                  }
                  
                  // If not found, try after delays
                  setTimeout(() => {
                    checkAndHandleBanner();
                    hidePrivacyWidget();
                  }, 100);
                  setTimeout(() => {
                    checkAndHandleBanner();
                    hidePrivacyWidget();
                  }, 500);
                  setTimeout(() => {
                    checkAndHandleBanner();
                    hidePrivacyWidget();
                  }, 1000);
                  setTimeout(() => {
                    checkAndHandleBanner();
                    hidePrivacyWidget();
                  }, 2000);
                  
                  // Use MutationObserver to catch elements when they're added or modified
                  if (document.body) {
                    const observer = new MutationObserver((mutations) => {
                      checkAndHandleBanner();
                      hidePrivacyWidget();
                      
                      // Also check if iubenda is trying to reset styles
                      mutations.forEach((mutation) => {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                          const target = mutation.target;
                          if (target.classList && (
                            target.classList.contains('iubenda-tp-btn') || 
                            target.classList.contains('iub__us-widget')
                          )) {
                            hidePrivacyWidget();
                          }
                        }
                      });
                    });
                    
                    observer.observe(document.body, {
                      childList: true,
                      subtree: true,
                      attributes: true,
                      attributeFilter: ['style', 'class']
                    });
                  }
                  
                  // Listen for route changes (Next.js client-side navigation)
                  let lastPath = window.location.pathname;
                  const checkRouteChange = () => {
                    const currentPath = window.location.pathname;
                    if (currentPath !== lastPath) {
                      lastPath = currentPath;
                      setTimeout(() => {
                        checkAndHandleBanner();
                        hidePrivacyWidget();
                      }, 100);
                    }
                  };
                  
                  // Check for route changes periodically
                  setInterval(checkRouteChange, 100);
                  
                  // Aggressively hide the button every 500ms to override iubenda's attempts to show it
                  setInterval(() => {
                    const path = window.location.pathname;
                    const shouldShow = path === '/home' || path === '/legal/contact';
                    
                    if (!shouldShow) {
                      const consentButton = document.querySelector('.iubenda-tp-btn.iubenda-cs-preferences-link');
                      if (consentButton) {
                        consentButton.style.setProperty('display', 'none', 'important');
                        consentButton.style.setProperty('visibility', 'hidden', 'important');
                        consentButton.style.setProperty('opacity', '0', 'important');
                        consentButton.style.setProperty('pointer-events', 'none', 'important');
                      }
                      
                      const privacyWidget = document.querySelector('.iub__us-widget');
                      if (privacyWidget) {
                        privacyWidget.style.setProperty('display', 'none', 'important');
                        privacyWidget.style.setProperty('visibility', 'hidden', 'important');
                        privacyWidget.style.setProperty('opacity', '0', 'important');
                        privacyWidget.style.setProperty('pointer-events', 'none', 'important');
                      }
                    }
                  }, 500);
                  
                  // Also listen to popstate events (browser back/forward)
                  window.addEventListener('popstate', () => {
                    setTimeout(() => {
                      checkAndHandleBanner();
                      hidePrivacyWidget();
                    }, 100);
                  });
                } catch (e) {
                  console.error('Error initializing iubenda script:', e);
                }
              })();
            `
          }}
        /> */}
      </body>
    </html>
  );
}
