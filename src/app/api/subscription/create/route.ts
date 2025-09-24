import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { stripe, TRIBUTE_PLAN } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: TRIBUTE_PLAN.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/tribute/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/tribute/cancel`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ 
      success: true, 
      checkoutUrl: checkoutSession.url 
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
