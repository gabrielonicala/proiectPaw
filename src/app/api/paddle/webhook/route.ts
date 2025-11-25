import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

// Validate webhook secret
const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

/**
 * Calculate subscription end date based on billing cycle
 */
function calculateSubscriptionEndDate(billingCycle: string, startDate: Date = new Date()): Date {
  const endDate = new Date(startDate);
  
  switch (billingCycle) {
    case 'weekly':
      endDate.setDate(endDate.getDate() + 7);
      break;
    case 'monthly':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case 'yearly':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    default:
      // Default to monthly if invalid
      endDate.setMonth(endDate.getMonth() + 1);
  }
  
  return endDate;
}

/**
 * Get billing cycle from subscription data or custom_data
 */
function getBillingCycle(subscription: any): string {
  // First try custom_data
  if (subscription.custom_data?.billingCycle) {
    return subscription.custom_data.billingCycle;
  }
  
  // Try to infer from interval in subscription
  if (subscription.items && subscription.items.length > 0) {
    const interval = subscription.items[0].price?.billing_cycle?.interval;
    if (interval === 'week') return 'weekly';
    if (interval === 'month') return 'monthly';
    if (interval === 'year') return 'yearly';
  }
  
  // Default to monthly
  return 'monthly';
}
if (!webhookSecret) {
  console.error('❌ PADDLE_WEBHOOK_SECRET is not set');
  throw new Error('Paddle webhook secret is not configured');
}

export async function POST(request: NextRequest) {
  try {
    console.log('📨 Webhook received from Paddle');
    const body = await request.text();
    const signature = request.headers.get('paddle-signature');

    console.log('Webhook signature:', signature ? 'Present' : 'Missing');
    console.log('Webhook body length:', body.length);

    if (!signature) {
      console.error('❌ Missing Paddle signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature - Paddle uses format: "ts=timestamp;h1=hash"
    // Extract timestamp and hash from the signature
    const timestampMatch = signature.match(/ts=(\d+)/);
    const hashMatch = signature.match(/h1=([a-f0-9]+)/);
    
    if (!timestampMatch || !hashMatch) {
      console.error('❌ Invalid signature format');
      return NextResponse.json({ error: 'Invalid signature format' }, { status: 400 });
    }

    const timestamp = timestampMatch[1];
    const receivedHash = hashMatch[1];
    
    // Paddle signature verification: HMAC-SHA256(timestamp:body, webhook_secret)
    const signedPayload = `${timestamp}:${body}`;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret!)
      .update(signedPayload)
      .digest('hex');

    console.log('Timestamp:', timestamp);
    console.log('Expected signature:', expectedSignature);
    console.log('Received signature hash:', receivedHash);

    if (receivedHash !== expectedSignature) {
      console.error('❌ Webhook signature verification failed');
      console.error('Expected:', expectedSignature);
      console.error('Received:', receivedHash);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('✅ Webhook signature verification passed');

    const event = JSON.parse(body);
    console.log('📨 Received Paddle webhook:', event.event_type);

    // Process the webhook event
    switch (event.event_type) {
      case 'subscription.created': {
        const subscription = event.data;
        const userId = subscription.custom_data?.userId;
        const billingCycle = subscription.custom_data?.billingCycle || 'monthly'; // Default to monthly if not provided

        if (userId) {
          // Validate billing cycle
          const validBillingCycles = ['weekly', 'monthly', 'yearly'];
          const subscriptionPlan = validBillingCycles.includes(billingCycle) ? billingCycle : 'monthly';

          // Update user subscription status
          await db.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: 'active',
              subscriptionPlan: subscriptionPlan,
              subscriptionId: subscription.id,
              subscriptionEndsAt: new Date(subscription.next_billed_at),
              characterSlots: 3, // Paid plans get 3 character slots
            },
          });
          console.log('✅ Subscription created for user:', userId, 'plan:', subscriptionPlan);
        }
        break;
      }

      case 'subscription.updated': {
        const subscription = event.data;
        const userId = subscription.custom_data?.userId;

        if (userId) {
          // Calculate subscription end date properly
          let subscriptionEndsAt = null;
          if (subscription.next_billed_at) {
            const nextBilledDate = new Date(subscription.next_billed_at);
            if (!isNaN(nextBilledDate.getTime())) {
              subscriptionEndsAt = nextBilledDate;
            }
          }
          
          // If no valid next_billed_at, calculate based on billing cycle
          if (!subscriptionEndsAt && subscription.status === 'active') {
            const billingCycle = getBillingCycle(subscription);
            subscriptionEndsAt = calculateSubscriptionEndDate(billingCycle);
          }

          // Determine status: if subscription is not active and has expired, set to free
          let newStatus: string;
          if (subscription.status === 'active') {
            newStatus = 'active';
          } else if (subscriptionEndsAt && subscriptionEndsAt < new Date()) {
            // Expired subscription - set to free
            newStatus = 'free';
          } else {
            newStatus = 'inactive';
          }

          await db.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: newStatus,
              subscriptionEndsAt: subscriptionEndsAt,
              // If expired, also update plan to free
              ...(newStatus === 'free' ? { subscriptionPlan: 'free', characterSlots: 1 } : {}),
            },
          });
          console.log('✅ Subscription updated for user:', userId);
        }
        break;
      }

      case 'subscription.canceled': {
        const subscription = event.data;
        const userId = subscription.custom_data?.userId;

        if (userId) {
          // Calculate when the subscription actually ends
          let subscriptionEndsAt = null;
          
          // If there's a canceled_at date, use it
          if (subscription.canceled_at) {
            const canceledDate = new Date(subscription.canceled_at);
            if (!isNaN(canceledDate.getTime())) {
              subscriptionEndsAt = canceledDate;
            }
          }
          
          // If no canceled_at date, use next_billed_at (end of current period)
          if (!subscriptionEndsAt && subscription.next_billed_at) {
            const nextBilledDate = new Date(subscription.next_billed_at);
            if (!isNaN(nextBilledDate.getTime())) {
              subscriptionEndsAt = nextBilledDate;
            }
          }
          
          // If still no valid date, calculate based on billing cycle
          if (!subscriptionEndsAt) {
            const billingCycle = getBillingCycle(subscription);
            subscriptionEndsAt = calculateSubscriptionEndDate(billingCycle);
          }

          await db.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: 'canceled',
              subscriptionEndsAt: subscriptionEndsAt,
            },
          });
          console.log('✅ Subscription canceled for user:', userId, 'ends at:', subscriptionEndsAt);
        }
        break;
      }

      case 'transaction.completed': {
        const transaction = event.data;
        const userId = transaction.custom_data?.userId;

        if (userId && transaction.status === 'completed') {
          // Update subscription end date for successful payment
          // Get billing cycle from transaction or subscription data
          const billingCycle = transaction.custom_data?.billingCycle || getBillingCycle(transaction.subscription || transaction);
          const nextBillingDate = calculateSubscriptionEndDate(billingCycle);
          
          await db.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: 'active',
              subscriptionEndsAt: nextBillingDate,
            },
          });
          console.log('✅ Transaction completed for user:', userId);
        }
        break;
      }

      case 'transaction.payment_failed': {
        const transaction = event.data;
        const userId = transaction.custom_data?.userId;

        if (userId) {
          // Mark subscription as past due
          await db.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: 'past_due',
            },
          });
          console.log('❌ Payment failed for user:', userId);
        }
        break;
      }

      case 'transaction.paid': {
        const transaction = event.data;
        const userId = transaction.custom_data?.userId;

        if (userId) {
          // Update subscription status for successful payment
          const billingCycle = transaction.custom_data?.billingCycle || getBillingCycle(transaction.subscription || transaction);
          const nextBillingDate = calculateSubscriptionEndDate(billingCycle);
          
          await db.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: 'active',
              subscriptionEndsAt: nextBillingDate,
            },
          });
          console.log('✅ Transaction paid for user:', userId);
        }
        break;
      }

      case 'subscription.activated': {
        const subscription = event.data;
        const userId = subscription.custom_data?.userId;

        if (userId) {
          // Update subscription status when activated
          const billingCycle = getBillingCycle(subscription);
          const nextBillingDate = calculateSubscriptionEndDate(billingCycle);
          
          await db.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: 'active',
              subscriptionEndsAt: nextBillingDate,
            },
          });
          console.log('✅ Subscription activated for user:', userId);
        }
        break;
      }

      default:
        console.log('ℹ️ Unhandled webhook event type:', event.event_type);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Error processing Paddle webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
