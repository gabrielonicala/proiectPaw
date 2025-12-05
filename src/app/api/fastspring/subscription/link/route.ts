import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * Link a FastSpring subscription to the current user's account
 * This is called from the client-side after checkout completes,
 * using the user's active session to avoid email matching issues
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session as { user: { id: string } }).user.id;
    const body = await request.json();
    let { subscriptionId, accountId } = body;
    const { orderId, billingCycle } = body;

    // If we don't have subscriptionId or accountId but have orderId, fetch from FastSpring
    if (orderId && (!subscriptionId || !accountId)) {
      try {
        const { FASTSPRING_CONFIG } = await import('@/lib/fastspring');
        if (FASTSPRING_CONFIG.apiUsername && FASTSPRING_CONFIG.apiPassword) {
          const credentials = Buffer.from(`${FASTSPRING_CONFIG.apiUsername}:${FASTSPRING_CONFIG.apiPassword}`).toString('base64');
          
          const orderResponse = await fetch(`${FASTSPRING_CONFIG.apiBaseUrl}/orders/${orderId}`, {
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            if (!subscriptionId) {
              subscriptionId = orderData.items?.[0]?.subscription;
              console.log('✅ Fetched subscriptionId from FastSpring order:', subscriptionId);
            }
            if (!accountId) {
              // account can be a string ID or an object with an id property
              accountId = typeof orderData.account === 'string' 
                ? orderData.account 
                : orderData.account?.id;
              console.log('✅ Fetched accountId from FastSpring order:', accountId);
            }
          } else {
            console.warn('⚠️ Failed to fetch order from FastSpring:', orderResponse.status);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching order from FastSpring:', error);
      }
    }

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID is required (could not fetch from order)' }, { status: 400 });
    }

    // Verify the user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine billing cycle
    let plan = billingCycle || 'monthly';
    if (typeof billingCycle === 'string') {
      if (billingCycle.includes('weekly')) plan = 'weekly';
      else if (billingCycle.includes('yearly')) plan = 'yearly';
      else if (billingCycle.includes('monthly')) plan = 'monthly';
    }

    // Calculate subscription end date based on billing cycle
    let subscriptionEndsAt: Date;
    const now = new Date();
    if (plan === 'weekly') {
      subscriptionEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (plan === 'yearly') {
      subscriptionEndsAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    } else {
      subscriptionEndsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    // Link the subscription to the user
    // Store fastspringAccountId for reliable webhook matching
    const updateData: any = {
      subscriptionStatus: 'active',
      subscriptionPlan: plan,
      subscriptionId: subscriptionId,
      subscriptionEndsAt: subscriptionEndsAt,
      characterSlots: 3,
    };
    
    // Store account ID if available (for reliable webhook matching)
    if (accountId) {
      updateData.fastspringAccountId = accountId;
      console.log('✅ Storing FastSpring account ID:', accountId);
    }

    await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    console.log('✅ Subscription linked via client-side API:', {
      userId,
      subscriptionId,
      accountId,
      orderId,
      plan
    });

    return NextResponse.json({ 
      success: true,
      message: 'Subscription linked successfully'
    });

  } catch (error) {
    console.error('Error linking subscription:', error);
    return NextResponse.json(
      { error: 'Failed to link subscription' },
      { status: 500 }
    );
  }
}

