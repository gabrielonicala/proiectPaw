'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function IubendaBannerManager() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    // Simple function to force banner to bottom
    function forceBannerToBottom() {
      try {
        const banner = document.getElementById('iubenda-cs-banner');
        if (banner && banner instanceof HTMLElement) {
          banner.classList.remove('iubenda-cs-top');
          banner.classList.add('iubenda-cs-bottom');
          banner.style.setProperty('position', 'fixed', 'important');
          banner.style.setProperty('bottom', '0', 'important');
          banner.style.setProperty('top', 'auto', 'important');
          banner.style.setProperty('left', '0', 'important');
          banner.style.setProperty('right', '0', 'important');
          banner.style.setProperty('transform', 'translateY(0)', 'important');
          banner.style.setProperty('z-index', '99999', 'important');
        }
      } catch (e) {
        // Ignore
      }
    }
    
    // Simple function to hide the privacy widget (always hide it)
    function hidePrivacyWidget() {
      try {
        const privacyWidget = document.querySelector('.iub__us-widget');
        if (privacyWidget && privacyWidget instanceof HTMLElement) {
          privacyWidget.style.setProperty('display', 'none', 'important');
          privacyWidget.style.setProperty('visibility', 'hidden', 'important');
          privacyWidget.style.setProperty('opacity', '0', 'important');
          privacyWidget.style.setProperty('pointer-events', 'none', 'important');
        }
        
        // Show/hide the floating consent button based on route
        const consentButton = document.querySelector('.iubenda-tp-btn.iubenda-cs-preferences-link');
        if (consentButton && consentButton instanceof HTMLElement) {
          const shouldShow = pathname === '/home' || pathname === '/legal/contact';
          if (!shouldShow) {
            consentButton.style.setProperty('display', 'none', 'important');
            consentButton.style.setProperty('visibility', 'hidden', 'important');
            consentButton.style.setProperty('opacity', '0', 'important');
            consentButton.style.setProperty('pointer-events', 'none', 'important');
          } else {
            // Explicitly show the button and make it clickable
            consentButton.style.setProperty('display', 'block', 'important');
            consentButton.style.setProperty('visibility', 'visible', 'important');
            consentButton.style.setProperty('opacity', '1', 'important');
            consentButton.style.setProperty('pointer-events', 'auto', 'important');
          }
        }
      } catch (e) {
        // Ignore
      }
    }
    
    // Initial checks after a short delay
    const timeouts: NodeJS.Timeout[] = [];
    [100, 500, 1000, 2000].forEach((delay) => {
      timeouts.push(setTimeout(() => {
        forceBannerToBottom();
        hidePrivacyWidget();
      }, delay));
    });
    
    // Simple interval - only check every 2 seconds (very lightweight)
    const interval = setInterval(() => {
      forceBannerToBottom();
      hidePrivacyWidget();
    }, 2000);
    
    // Watch for banner/widget when they're added
    let observer: MutationObserver | null = null;
    if (typeof MutationObserver !== 'undefined' && document.body) {
      observer = new MutationObserver((mutations) => {
        let shouldReposition = false;
        for (const mutation of mutations) {
          for (const node of Array.from(mutation.addedNodes)) {
            if (node instanceof Element) {
              if (node.id === 'iubenda-cs-banner' || node.querySelector('#iubenda-cs-banner')) {
                shouldReposition = true;
              }
              if (node.classList?.contains('iub__us-widget') || node.querySelector('.iub__us-widget')) {
                hidePrivacyWidget();
              }
            }
          }
        }
        if (shouldReposition) {
          setTimeout(() => forceBannerToBottom(), 50);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
    
    // Cleanup
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
      clearInterval(interval);
      if (observer) {
        try {
          observer.disconnect();
        } catch (e) {}
      }
    };
  }, [pathname]);

  return null;
}
