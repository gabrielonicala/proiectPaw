import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parseAnalyticsData, getCountryFromIP } from '@/lib/analytics-parser';

// Production domains that should be tracked
const PRODUCTION_DOMAINS = ['quillia.app', 'www.quillia.app'];

function isProductionDomain(hostname: string): boolean {
  return PRODUCTION_DOMAINS.includes(hostname);
}

// Hash IP address for privacy (keep only first 3 octets)
function hashIP(ip: string | null): string | null {
  if (!ip) return null;
  // Remove last octet for privacy
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  }
  // For IPv6 or other formats, just use a simple hash
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).substring(0, 8) + 'xxx';
}

export async function POST(request: NextRequest) {
  try {
    // Only track on production domains
    const hostname = request.nextUrl.hostname;
    if (!isProductionDomain(hostname)) {
      return NextResponse.json({ success: true, skipped: true, reason: 'Not a production domain' });
    }

    const { path, clientIP } = await request.json();
    
    if (!path || typeof path !== 'string') {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    // Don't track API routes, static files, or admin pages
    if (path.startsWith('/api') || 
        path.startsWith('/_next') || 
        path === '/favicon.ico' ||
        path.startsWith('/admin')) {
      return NextResponse.json({ success: true, skipped: true });
    }

    // Get request info
    const userAgent = request.headers.get('user-agent') || null;
    const referer = request.headers.get('referer') || null;
    
    // Use clientIP from request body first (more accurate for client-side requests)
    // Fall back to server headers (for direct API calls or server-side rendering)
    const ip = clientIP || 
               request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               'unknown';
    const ipHash = hashIP(ip);
    
    // Parse analytics data (GDPR-compliant)
    const analytics = parseAnalyticsData(userAgent, referer);
    // Get country from IP (async, but we'll await it)
    const country = await getCountryFromIP(ip, request.headers);
    
    // Track the page view
    await db.pageView.create({
      data: {
        path,
        method: 'GET',
        userAgent: userAgent?.substring(0, 500) || null,
        referer: referer?.substring(0, 500) || null,
        referrerSource: analytics.referrerSource,
        deviceType: analytics.deviceType,
        browser: analytics.browser,
        country,
        ipHash,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking page view:', error);
    // Don't fail the request - tracking is non-critical
    return NextResponse.json(
      { success: false, error: 'Tracking failed' },
      { status: 500 }
    );
  }
}

