import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { PADDLE_CONFIG } from '@/lib/paddle';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session as { user: { id: string } }).user.id;

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.subscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
    }

    // Call Paddle API to cancel the subscription
    const response = await fetch(`${PADDLE_CONFIG.baseUrl}/subscriptions/${user.subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PADDLE_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        effective_from: 'next_billing_period' // Cancel at end of current period
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Paddle API error during cancellation:', errorData);
      
      // Handle specific error cases
      if (errorData.error?.code === 'subscription_locked_pending_changes') {
        // Subscription is already canceled or has pending changes
        console.log('ℹ️ Subscription already has pending changes, updating database only');
        
        // Update database to reflect canceled status
        await db.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: 'canceled',
            subscriptionEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          }
        });
        
        return NextResponse.json({ 
          success: true, 
          message: 'Subscription was already canceled. Database updated to reflect current status.' 
        });
      }
      
      return NextResponse.json({ error: 'Failed to cancel subscription with Paddle' }, { status: response.status });
    }

    const paddleResponse = await response.json();
    console.log('✅ Paddle subscription cancellation response:', paddleResponse);

    // Update user's subscription status in the database
    await db.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'canceled',
        // Keep subscriptionEndsAt as is - user keeps access until end of period
      }
    });

    console.log('✅ User subscription status updated to canceled in DB for user:', userId);

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription canceled successfully. You will retain access until the end of your current billing period.' 
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
