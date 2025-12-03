import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createCheckoutSession, TRIBUTE_PLAN } from '@/lib/fastspring';

/**
 * Get country code from request headers (Cloudflare) or IP
 * Returns ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB') or null
 */
async function getCountryCode(request: NextRequest): Promise<string | null> {
  // First, check for Cloudflare country header (if using Cloudflare)
  const cfCountry = request.headers.get('cf-ipcountry');
  if (cfCountry && cfCountry !== 'XX' && cfCountry.length === 2) {
    return cfCountry.toUpperCase();
  }

  // Fallback: try to get from IP using a simple service
  // Get IP from request
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             null;

  if (!ip || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.16.')) {
    return null; // Skip localhost/internal IPs
  }

  // Try to get country code from IP (using ipapi.co which returns country code directly)
  try {
    const response = await fetch(`https://ipapi.co/${ip}/country/`, {
      headers: {
        'User-Agent': 'Quillia',
      },
      signal: AbortSignal.timeout(2000),
    });

    if (response.ok) {
      const countryCode = (await response.text()).trim();
      if (countryCode && countryCode.length === 2 && countryCode !== 'None') {
        return countryCode.toUpperCase();
      }
    }
  } catch (error) {
    // Silently fail - country detection is optional
    console.warn('Country detection failed:', error);
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get billing cycle from request body
    const body = await request.json().catch(() => ({}));
    const billingCycle = (body.billingCycle || 'monthly') as 'weekly' | 'monthly' | 'yearly';

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: (session as { user: { id: string } }).user.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has an active subscription
    if (user.subscriptionStatus === 'active' && user.subscriptionEndsAt && user.subscriptionEndsAt > new Date()) {
      return NextResponse.json({ error: 'User already has an active subscription' }, { status: 400 });
    }

    // Validate billing cycle
    if (!TRIBUTE_PLAN[billingCycle]) {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 });
    }

    // Try to detect country code for automatic tax calculation
    const countryCode = await getCountryCode(request);
    console.log('Detected country code:', countryCode);

    // Create FastSpring checkout session with buyerReference (userId)
    // This ensures webhooks can match the subscription to the correct user
    // Include country code if detected to enable automatic tax calculation
    const { checkoutUrl } = await createCheckoutSession(
      billingCycle,
      user.id,
      user.email || '',
      countryCode || undefined
    );

    return NextResponse.json({ 
      success: true, 
      checkoutUrl: checkoutUrl
    });

  } catch (error) {
    console.error('Error creating FastSpring checkout:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}


