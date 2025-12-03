import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

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

    // For FastSpring, cancellation is typically handled through their dashboard or customer portal
    // For now, we'll mark it as canceled in our database
    // The webhook will handle the actual cancellation when FastSpring processes it
    await db.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'canceled',
        // Keep subscriptionEndsAt as is - user keeps access until end of period
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription cancellation requested. You will retain access until the end of your current billing period. Please also cancel through your FastSpring account if needed.' 
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

