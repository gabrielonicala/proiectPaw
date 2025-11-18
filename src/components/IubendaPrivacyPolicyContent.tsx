'use client';

import { useEffect, useState } from 'react';

export default function IubendaPrivacyPolicyContent() {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    // For demo: Load from the saved HTML file
    // In production, this would be a cleaned static HTML file
    fetch('/legal/privacy-policy-content.html')
      .then(res => {
        if (!res.ok) {
          // If file doesn't exist, show a message
          throw new Error('Content file not found');
        }
        return res.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Remove unwanted elements (but keep Summary cards content)
        const removeSelectors = [
          'header',
          'aside',
          '.table-of-content-btn-wrapper',
          '.pre-footer',
          'footer',
          'script',
          'style',
          '.iub-manage-preferences-btn',
          '.iub-manage-preferences-container',
          '.card-buttons-group', // Remove mobile card buttons
          'button.close-dialog', // Remove "Back to overview" buttons
          'footer[style*="display: none"]' // Remove hidden footers in cards
        ];
        
        removeSelectors.forEach(selector => {
          const elements = doc.querySelectorAll(selector);
          elements.forEach(el => el.remove());
        });
        
        // Remove images but keep the text content
        doc.querySelectorAll('img').forEach(img => {
          // Remove the image but keep its parent structure if it's just an icon
          const parent = img.parentElement;
          if (parent && parent.classList.contains('third-parties-item')) {
            // Keep the list item structure, just remove the image
            img.remove();
          } else {
            img.remove();
          }
        });
        
        // Restructure summary elements to put arrow inline with title
        doc.querySelectorAll('summary').forEach(summary => {
          const figure = summary.querySelector('figure');
          const div = summary.querySelector('div');
          const h4 = summary.querySelector('h4');
          
          // Remove figure (icon)
          if (figure) {
            figure.remove();
          }
          
          // Extract h4 text and put it first, then other content
          if (h4 && div) {
            const h4Text = h4.textContent || '';
            const meta = div.querySelector('.accordion__meta');
            if (meta) {
              meta.remove();
            }
            // Keep the div structure but make it inline
          }
        });
        
        // Get main content - try main tag first, then body
        let contentElement = doc.querySelector('main');
        if (!contentElement) {
          // If no main tag, use body (which will contain all the sections)
          contentElement = doc.body;
        }
        if (contentElement && contentElement.innerHTML.trim()) {
          setContent(contentElement.innerHTML);
        } else {
          // Fallback: try to get all sections directly
          const sections = doc.querySelectorAll('section');
          if (sections.length > 0) {
            setContent(Array.from(sections).map(s => s.outerHTML).join(''));
          } else {
            setContent('<p class="text-orange-400">Error: Could not extract content from HTML file.</p>');
          }
        }
      })
      .catch(err => {
        console.error('Error loading privacy policy content:', err);
        // Show a message that the file needs to be created
        setContent('<p class="text-orange-400">Please copy the main content from the saved HTML file to public/legal/privacy-policy-content.html</p>');
      });
  }, []);

  return (
    <>
      <style jsx global>{`
        /* Apply your custom styling to iubenda content */
        .iubenda-content {
          font-size: 1.2rem;
        }
        
        .iubenda-content section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background-color: rgba(31, 41, 55, 0.3);
          border-radius: 0.5rem;
          border-left: 4px solid #f97316;
        }
        
        .iubenda-content h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
          margin-top: 0;
          color: #f97316;
          font-family: Georgia, 'Times New Roman', serif;
          line-height: 1.3;
        }
        
        .iubenda-content h3 {
          font-size: 1.75rem;
          font-weight: 600;
          margin-bottom: 1rem;
          margin-top: 1.5rem;
          color: #f97316;
          font-family: Georgia, 'Times New Roman', serif;
          line-height: 1.3;
        }
        
        .iubenda-content h4 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          margin-top: 1.25rem;
          color: #fdba74;
          font-family: Georgia, 'Times New Roman', serif;
          line-height: 1.3;
        }
        
        .iubenda-content h5 {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          margin-top: 0.75rem;
          color: #fdba74;
          font-family: Georgia, 'Times New Roman', serif;
          line-height: 1.3;
        }
        
        .iubenda-content p {
          margin-bottom: 1.25rem;
          color: #d1d5db;
          font-family: Georgia, 'Times New Roman', serif;
          line-height: 1.8;
          font-size: 1.2rem;
        }
        
        .iubenda-content ul {
          list-style-type: disc;
          padding-left: 1.75rem;
          margin-bottom: 1.25rem;
          color: #d1d5db;
          font-family: Georgia, 'Times New Roman', serif;
          line-height: 1.8;
          font-size: 1.2rem;
        }
        
        .iubenda-content ol {
          list-style-type: decimal;
          padding-left: 1.75rem;
          margin-bottom: 1.25rem;
          color: #d1d5db;
          font-family: Georgia, 'Times New Roman', serif;
          line-height: 1.8;
          font-size: 1.2rem;
        }
        
        .iubenda-content li {
          margin-bottom: 0.75rem;
        }
        
        .iubenda-content a {
          color: #f97316;
          text-decoration: underline;
        }
        
        .iubenda-content a:hover {
          color: #fb923c;
        }
        
        /* Details/Summary styling - make expand button inline with title */
        .iubenda-content details {
          margin-bottom: 1.5rem;
        }
        
        .iubenda-content summary {
          cursor: pointer;
          color: #fdba74;
          font-weight: 600;
          font-size: 1.5rem;
          margin-bottom: 0.75rem;
          margin-top: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          list-style: none;
          user-select: none;
        }
        
        .iubenda-content summary::-webkit-details-marker {
          display: none;
        }
        
        .iubenda-content summary::marker {
          display: none;
        }
        
        .iubenda-content summary::before {
          content: '▶';
          display: inline-block;
          transition: transform 0.2s ease;
          font-size: 0.75em;
          color: #f97316;
          flex-shrink: 0;
          margin-right: 0.25rem;
        }
        
        .iubenda-content details[open] summary::before {
          transform: rotate(90deg);
        }
        
        /* Hide figure/images in summary */
        .iubenda-content summary figure {
          display: none !important;
        }
        
        /* Make summary content inline and properly aligned */
        .iubenda-content summary > div {
          display: flex;
          align-items: center;
          flex: 1;
        }
        
        .iubenda-content summary h4 {
          display: inline;
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #fdba74;
        }
        
        /* Hide accordion meta in summary */
        .iubenda-content summary .accordion__meta {
          display: none;
        }
        
        .iubenda-content .accordion__body {
          margin-top: 0.75rem;
          padding-left: 1.5rem;
        }
        
        /* Style Summary cards */
        .iubenda-content .summary__cards-wrapper {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        
        .iubenda-content .summary__card {
          background-color: rgba(31, 41, 55, 0.5);
          border-radius: 0.5rem;
          padding: 1.5rem;
          border-left: 3px solid #f97316;
        }
        
        .iubenda-content .summary__card header h3 {
          margin-top: 0;
          margin-bottom: 0.5rem;
        }
        
        .iubenda-content .summary__card header p {
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }
        
        .iubenda-content .summary__card-section {
          margin-bottom: 1.25rem;
        }
        
        .iubenda-content .pills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          list-style: none;
          padding-left: 0;
          margin-bottom: 1rem;
        }
        
        .iubenda-content .pills-list .pill {
          background-color: rgba(249, 115, 22, 0.2);
          color: #fdba74;
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.95rem;
          border: 1px solid rgba(249, 115, 22, 0.3);
        }
        
        .iubenda-content .third-parties-section {
          margin-top: 1rem;
        }
        
        .iubenda-content .third-parties-section h4 {
          font-size: 1.2rem;
          margin-bottom: 0.75rem;
        }
        
        .iubenda-content .unstyled-list {
          list-style: none;
          padding-left: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .iubenda-content .third-parties-item {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          background-color: rgba(31, 41, 55, 0.5);
          border-radius: 0.375rem;
          font-size: 0.9rem;
          color: #d1d5db;
        }
        
        .iubenda-content .check-style-list {
          list-style: none;
          padding-left: 0;
        }
        
        .iubenda-content .check-style-list li {
          position: relative;
          padding-left: 1.75rem;
          margin-bottom: 0.5rem;
        }
        
        .iubenda-content .check-style-list li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #f97316;
          font-weight: bold;
        }
        
        /* Hide iubenda-specific UI elements */
        .iubenda-content .accordion__meta,
        .iubenda-content .body__details-box {
          display: none;
        }
        
        /* Make strong/bold text more visible */
        .iubenda-content strong {
          color: #fbbf24;
          font-weight: 600;
        }
      `}</style>
      <div 
        className="text-gray-300 font-serif leading-relaxed iubenda-content"
        dangerouslySetInnerHTML={{ __html: content || '<p>Loading...</p>' }}
      />
    </>
  );
}

