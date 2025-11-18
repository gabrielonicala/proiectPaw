'use client';

import { useEffect, useRef } from 'react';

interface IubendaPrivacyPolicyProps {
  policyId: string;
}

/**
 * Component to embed iubenda Privacy Policy
 * This maintains your custom styling while showing iubenda's generated policy
 */
export default function IubendaPrivacyPolicy({ policyId }: IubendaPrivacyPolicyProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !policyId) return;

    // Load iubenda privacy policy script
    const script = document.createElement('script');
    script.src = `https://www.iubenda.com/api/privacy-policy/${policyId}/cookie-policy`;
    script.async = true;
    script.onload = () => {
      // iubenda will automatically inject the policy into the container
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
      const existingScript = document.querySelector(`script[src*="iubenda.com/api/privacy-policy/${policyId}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [policyId]);

  return (
    <div 
      ref={containerRef}
      className="iubenda-embed prose prose-invert max-w-none"
      data-iubenda-id={policyId}
      data-iubenda-cookie-policy
    />
  );
}


