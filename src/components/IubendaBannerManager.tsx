'use client';

import { useEffect } from 'react';

export default function IubendaBannerManager() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

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
          const privacyWidget = document.querySelector('.iub__us-widget') as HTMLElement;
          if (privacyWidget) {
            privacyWidget.style.setProperty('display', 'none', 'important');
            privacyWidget.style.setProperty('visibility', 'hidden', 'important');
            privacyWidget.style.setProperty('opacity', '0', 'important');
            privacyWidget.style.setProperty('pointer-events', 'none', 'important');
          }
          
          // Hide the floating consent preferences button with !important
          const consentButton = document.querySelector('.iubenda-tp-btn.iubenda-cs-preferences-link') as HTMLElement;
          if (consentButton) {
            consentButton.style.setProperty('display', 'none', 'important');
            consentButton.style.setProperty('visibility', 'hidden', 'important');
            consentButton.style.setProperty('opacity', '0', 'important');
            consentButton.style.setProperty('pointer-events', 'none', 'important');
          }
          
          return true;
        } else {
          // Show the elements on allowed pages
          const privacyWidget = document.querySelector('.iub__us-widget') as HTMLElement;
          if (privacyWidget) {
            privacyWidget.style.removeProperty('display');
            privacyWidget.style.removeProperty('visibility');
            privacyWidget.style.removeProperty('opacity');
            privacyWidget.style.removeProperty('pointer-events');
          }
          
          const consentButton = document.querySelector('.iubenda-tp-btn.iubenda-cs-preferences-link') as HTMLElement;
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
    
    // Initial check - run immediately
    checkAndHandleBanner();
    hidePrivacyWidget();
    
    // Also run on next tick to catch anything that loads very quickly
    setTimeout(() => {
      checkAndHandleBanner();
      hidePrivacyWidget();
    }, 0);
    
    // Retry after delays to catch dynamically loaded content
    const timeouts = [
      setTimeout(() => {
        checkAndHandleBanner();
        hidePrivacyWidget();
      }, 50),
      setTimeout(() => {
        checkAndHandleBanner();
        hidePrivacyWidget();
      }, 100),
      setTimeout(() => {
        checkAndHandleBanner();
        hidePrivacyWidget();
      }, 500),
      setTimeout(() => {
        checkAndHandleBanner();
        hidePrivacyWidget();
      }, 1000),
      setTimeout(() => {
        checkAndHandleBanner();
        hidePrivacyWidget();
      }, 2000),
    ];
    
    // Use MutationObserver to catch elements when they're added or modified
    let observer: MutationObserver | null = null;
    if (document.body) {
      observer = new MutationObserver((mutations) => {
        checkAndHandleBanner();
        hidePrivacyWidget();
        
        // Also check if iubenda is trying to reset styles
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            const target = mutation.target as Element;
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
        // Immediately move banner on route change
        checkAndHandleBanner();
        hidePrivacyWidget();
        // Also check multiple times to catch delayed iubenda repositioning
        setTimeout(() => {
          checkAndHandleBanner();
          hidePrivacyWidget();
        }, 0);
        setTimeout(() => {
          checkAndHandleBanner();
          hidePrivacyWidget();
        }, 50);
        setTimeout(() => {
          checkAndHandleBanner();
          hidePrivacyWidget();
        }, 100);
        setTimeout(() => {
          checkAndHandleBanner();
          hidePrivacyWidget();
        }, 200);
        setTimeout(() => {
          checkAndHandleBanner();
          hidePrivacyWidget();
        }, 500);
      }
    };
    
    // Check for route changes more frequently
    const routeCheckInterval = setInterval(checkRouteChange, 50);
    
    // Aggressively move banner to bottom and hide widgets every 200ms
    const maintenanceInterval = setInterval(() => {
      // Always move banner to bottom
      checkAndHandleBanner();
      
      // Hide/show widgets based on route
      const path = window.location.pathname;
      const shouldShow = path === '/home' || path === '/legal/contact';
      
      if (!shouldShow) {
        const consentButton = document.querySelector('.iubenda-tp-btn.iubenda-cs-preferences-link') as HTMLElement;
        if (consentButton) {
          consentButton.style.setProperty('display', 'none', 'important');
          consentButton.style.setProperty('visibility', 'hidden', 'important');
          consentButton.style.setProperty('opacity', '0', 'important');
          consentButton.style.setProperty('pointer-events', 'none', 'important');
        }
        
        const privacyWidget = document.querySelector('.iub__us-widget') as HTMLElement;
        if (privacyWidget) {
          privacyWidget.style.setProperty('display', 'none', 'important');
          privacyWidget.style.setProperty('visibility', 'hidden', 'important');
          privacyWidget.style.setProperty('opacity', '0', 'important');
          privacyWidget.style.setProperty('pointer-events', 'none', 'important');
        }
      }
    }, 200);
    
    // Also listen to popstate events (browser back/forward)
    const handlePopState = () => {
      setTimeout(() => {
        checkAndHandleBanner();
        hidePrivacyWidget();
      }, 100);
    };
    window.addEventListener('popstate', handlePopState);
    
    // Cleanup function
    return () => {
      // Clear all timeouts
      timeouts.forEach(timeout => clearTimeout(timeout));
      
      // Disconnect observer
      if (observer) {
        observer.disconnect();
      }
      
      // Clear intervals
      clearInterval(routeCheckInterval);
      clearInterval(maintenanceInterval);
      
      // Remove event listener
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // Empty dependency array - only run once on mount

  // This component doesn't render anything
  return null;
}

