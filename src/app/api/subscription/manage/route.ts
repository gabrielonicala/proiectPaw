import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import Stripe from 'stripe';

export async function GET() {
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

    if (!user.subscriptionId) {
      return NextResponse.json({ 
        hasSubscription: false,
        subscription: null 
      });
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
    const customer = await stripe.customers.retrieve(subscription.customer as string);

    return NextResponse.json({
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date((subscription as unknown as Stripe.Subscription & { current_period_start: number }).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as unknown as Stripe.Subscription & { current_period_end: number }).current_period_end * 1000),
        cancelAtPeriodEnd: (subscription as unknown as Stripe.Subscription & { cancel_at_period_end: boolean }).cancel_at_period_end,
        customer: {
          id: customer.id,
          email: (customer as Stripe.Customer).email,
        }
      }
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: (session as { user: { id: string } }).user.id }
    });

    if (!user || !user.subscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Cancel subscription at period end
    await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({ 
      success: true,
      message: 'Subscription will be canceled at the end of the current period'
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
