import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getCheckoutUrl, TRIBUTE_PLAN } from '@/lib/fastspring';

export async function POST(request: Request) {
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

    // Get the checkout URL - FastSpring uses direct product URLs
    const checkoutUrl = getCheckoutUrl(billingCycle);

    return NextResponse.json({ 
      success: true, 
      checkoutUrl: checkoutUrl
    });

  } catch (error) {
    console.error('Error creating FastSpring checkout:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}


