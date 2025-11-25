import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { PADDLE_CONFIG, TRIBUTE_PLAN } from '@/lib/paddle';

// Debug: Log environment variables
console.log('Paddle config check:', {
  vendorId: PADDLE_CONFIG.vendorId,
  apiKey: PADDLE_CONFIG.apiKey ? 'Set' : 'Not set',
  priceIds: {
    weekly: TRIBUTE_PLAN.weekly.priceId,
    monthly: TRIBUTE_PLAN.monthly.priceId,
    yearly: TRIBUTE_PLAN.yearly.priceId
  },
  environment: PADDLE_CONFIG.environment
});

if (!PADDLE_CONFIG.vendorId || !PADDLE_CONFIG.apiKey) {
  console.error('Missing Paddle config:', {
    vendorId: PADDLE_CONFIG.vendorId,
    apiKey: PADDLE_CONFIG.apiKey ? 'Set' : 'Not set'
  });
  throw new Error('Paddle configuration is missing');
}

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

    // Get the appropriate price ID based on billing cycle
    const plan = TRIBUTE_PLAN[billingCycle];
    if (!plan) {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 });
    }

    // Create Paddle checkout session using the correct API format
    const checkoutData = {
      items: [
        {
          price_id: plan.priceId,
          quantity: 1
        }
      ],
      customer_email: user.email,
      custom_data: {
        userId: user.id,
        billingCycle: billingCycle
      },
      return_url: `${process.env.NEXTAUTH_URL}/tribute/success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/tribute/cancel`
    };

    // Make API call to Paddle's transactions endpoint
    const response = await fetch(`${PADDLE_CONFIG.baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PADDLE_CONFIG.apiKey}`
      },
      body: JSON.stringify(checkoutData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Paddle API error:', errorData);
      throw new Error('Failed to create Paddle checkout');
    }

    const checkoutSession = await response.json();
    console.log('Paddle API response:', JSON.stringify(checkoutSession, null, 2));

    return NextResponse.json({ 
      success: true, 
      checkoutUrl: checkoutSession.data?.checkout?.url
    });

  } catch (error) {
    console.error('Error creating Paddle checkout:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
