'use client';

import { useEffect, useRef } from 'react';

interface IubendaTermsProps {
  termsId: string;
}

/**
 * Component to embed iubenda Terms & Conditions
 * This maintains your custom styling while showing iubenda's generated terms
 */
export default function IubendaTerms({ termsId }: IubendaTermsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !termsId) return;

    // Load iubenda terms script
    const script = document.createElement('script');
    script.src = `https://www.iubenda.com/api/terms-and-conditions/${termsId}`;
    script.async = true;
    script.onload = () => {
      // iubenda will automatically inject the terms into the container
      if (containerRef.current) {
        // Apply custom styling to iubenda content
        const style = document.createElement('style');
        style.textContent = `
          .iubenda-embed {
            color: #d1d5db !important;
            font-family: 'Press Start 2P', monospace !important;
          }
          .iubenda-embed h1,
          .iubenda-embed h2,
          .iubenda-embed h3 {
            color: #f97316 !important;
            font-family: 'Press Start 2P', monospace !important;
          }
          .iubenda-embed a {
            color: #f97316 !important;
          }
          .iubenda-embed a:hover {
            color: #fb923c !important;
          }
        `;
        document.head.appendChild(style);
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector(`script[src*="iubenda.com/api/terms-and-conditions/${termsId}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [termsId]);

  return (
    <div 
      ref={containerRef}
      className="iubenda-embed prose prose-invert max-w-none"
      data-iubenda-id={termsId}
      data-iubenda-terms
    />
  );
}


