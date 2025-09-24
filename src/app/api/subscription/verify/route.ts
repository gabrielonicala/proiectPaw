import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Retrieve the checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // Update user subscription status
    await db.user.update({
      where: { id: (session as { user: { id: string } }).user.id },
      data: {
        subscriptionStatus: 'active',
        subscriptionPlan: 'tribute',
        subscriptionId: checkoutSession.subscription as string,
        subscriptionEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Subscription activated successfully'
    });

  } catch (error) {
    console.error('Error verifying subscription:', error);
    return NextResponse.json(
      { error: 'Failed to verify subscription' },
      { status: 500 }
    );
  }
}
