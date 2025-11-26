import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get Terms ID from environment variable or use default
    const termsId = process.env.NEXT_PUBLIC_IUBENDA_TERMS_ID || '70554621';
    
    // Fetch the full rendered terms page from iubenda
    const response = await fetch(`https://www.iubenda.com/terms-and-conditions/${termsId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Quillia/1.0)',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      console.error('Failed to fetch iubenda terms:', response.status, response.statusText);
      console.error('Error details:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch terms and conditions', details: errorText },
        { status: response.status }
      );
    }

    let html = await response.text();
    
    // Extract the main content from the page
    // Look for the main content container (usually has id="iub-legalDoc" or similar)
    const mainContentMatch = html.match(/<div[^>]*id="iub-legalDoc"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/i);
    if (mainContentMatch) {
      html = mainContentMatch[1];
    } else {
      // Fallback: try to find the main content area
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        html = bodyMatch[1];
      }
    }
    
    // Remove footer elements from HTML using regex (server-side processing)
    // This function removes HTML elements (and their content) containing specific text
    const removeElementsWithText = (html: string, text: string): string => {
      const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      let result = html;
      let previousResult = '';
      
      // Match any opening tag, then find matching closing tag that contains the text
      // This handles nested divs, sections, etc.
      const pattern = new RegExp(`<([a-z]+)[^>]*>[\\s\\S]*?${escapedText}[\\s\\S]*?</\\1>`, 'gi');
      
      // Keep removing until no more matches (handles nested elements)
      while (result !== previousResult) {
        previousResult = result;
        result = result.replace(pattern, '');
      }
      
      return result;
    };
    
    // Remove footer and address tags
    html = html.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
    html = html.replace(/<address[^>]*>[\s\S]*?<\/address>/gi, '');
    
    // Remove elements with footer-related classes/ids
    html = html.replace(/<[^>]*(?:class|id)="[^"]*footer[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi, '');
    html = html.replace(/<[^>]*(?:class|id)="[^"]*downloadable[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi, '');
    
    // Remove elements containing specific footer text (handles nested elements)
    const textsToRemove = [
      'Downloadable documents',
      'Terms and Conditions by iubenda',
      'Privacy Policy by iubenda',
      'Generate yours with',
      'iubenda hosts this content',
      'Owner contact email',
      'ELA OPPORTUNITY S.R.L.',
      'Aleea Marin Preda',
      'Râmnicu Vâlcea',
    ];
    
    textsToRemove.forEach(text => {
      html = removeElementsWithText(html, text);
    });
    
    // Remove the "Welcome" header section - more aggressive approach
    // Remove everything from start until "Table of" or first section
    const tableOfContentsIndex = html.search(/Table of|Summary|1\.|First|Introduction/i);
    if (tableOfContentsIndex > 0) {
      // Find the last closing tag before "Table of" to preserve structure
      const beforeTable = html.substring(0, tableOfContentsIndex);
      const lastTagEnd = beforeTable.lastIndexOf('>');
      if (lastTagEnd > 0) {
        // Remove everything from start to just before "Table of"
        html = html.substring(lastTagEnd + 1);
      }
    }
    
    // Also remove welcome text patterns (fallback)
    html = html.replace(/<[^>]*>[\s\S]*?Welcome to the[\s\S]*?<\/[^>]+>/gi, '');
    html = html.replace(/<p[^>]*>[\s\S]*?Welcome to the[\s\S]*?<\/p>/gi, '');
    html = html.replace(/<div[^>]*>[\s\S]*?Welcome to the[\s\S]*?<\/div>/gi, '');
    html = removeElementsWithText(html, 'Welcome to the');
    
    // Remove "Latest update" and "Download PDF" elements - more aggressive
    html = html.replace(/<[^>]*>[\s\S]*?Latest update[\s\S]*?Download PDF[\s\S]*?<\/[^>]+>/gi, '');
    html = html.replace(/<[^>]*>[\s\S]*?Latest update:[\s\S]*?<\/[^>]+>/gi, '');
    html = html.replace(/<a[^>]*>[\s\S]*?Download PDF[\s\S]*?<\/a>/gi, '');
    html = html.replace(/Latest update:[\s\S]*?Download PDF/gi, '');
    html = removeElementsWithText(html, 'Latest update');
    html = removeElementsWithText(html, 'Download PDF');
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate', // Disable cache for testing
      },
    });
  } catch (error) {
    console.error('Error fetching iubenda terms and conditions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

