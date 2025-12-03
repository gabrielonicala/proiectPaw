import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

// Validate webhook secret
const webhookSecret = process.env.FASTSPRING_WEBHOOK_SECRET;

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
      endDate.setMonth(endDate.getDate() + 1);
      break;
    case 'yearly':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    default:
      endDate.setMonth(endDate.getMonth() + 1);
  }
  
  return endDate;
}

/**
 * Get billing cycle from subscription tags or product path
 */
function getBillingCycle(subscription: any): string {
  // Try to parse tags if they're a string
  let tags = subscription.tags;
  if (typeof tags === 'string') {
    try {
      tags = JSON.parse(tags);
    } catch {
      tags = {};
    }
  }
  
  if (tags?.billingCycle) {
    return tags.billingCycle;
  }
  
  // Try to infer from product path
  if (subscription.product?.product || subscription.items?.[0]?.product) {
    const productPath = subscription.product?.product || subscription.items[0].product;
    if (productPath.includes('weekly')) return 'weekly';
    if (productPath.includes('yearly')) return 'yearly';
    if (productPath.includes('monthly')) return 'monthly';
  }
  
  return 'monthly';
}

if (!webhookSecret) {
  console.error('❌ FASTSPRING_WEBHOOK_SECRET is not set');
  throw new Error('FastSpring webhook secret is not configured');
}

export async function POST(request: NextRequest) {
  try {
    console.log('📨 Webhook received from FastSpring');
    const body = await request.text();
    const signature = request.headers.get('x-fs-signature') || request.headers.get('fastspring-signature');

    if (!signature) {
      console.error('❌ Missing FastSpring signature header');
      // For now, continue without signature verification (you can enable it later)
      console.warn('⚠️ Continuing without signature verification');
    } else if (webhookSecret) {
      // Verify webhook signature if provided
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature && !signature.includes(expectedSignature)) {
        console.error('❌ Webhook signature verification failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
      console.log('✅ Webhook signature verification passed');
    }

    const event = JSON.parse(body);
    console.log('📨 Received FastSpring webhook:', event.type || event.event || JSON.stringify(event).substring(0, 100));

    // FastSpring webhook events can have different structures
    const eventType = event.type || event.event || event['@type'];
    
    // Process the webhook event
    switch (eventType) {
      case 'order.completed':
      case 'order.fulfilled': {
        const order = event.data || event;
        const subscription = order.subscription || order.subscriptions?.[0];
        
        // Try to get userId from tags
        let tags = subscription?.tags || order.tags;
        if (typeof tags === 'string') {
          try {
            tags = JSON.parse(tags);
          } catch {
            tags = {};
          }
        }
        
        const userId = tags?.userId;

        if (userId && subscription) {
          const billingCycle = getBillingCycle(subscription);
          
          let subscriptionEndsAt: Date | null = null;
          if (subscription.endDate) {
            subscriptionEndsAt = new Date(subscription.endDate);
          } else if (subscription.nextChargeDate) {
            subscriptionEndsAt = new Date(subscription.nextChargeDate);
          } else {
            subscriptionEndsAt = calculateSubscriptionEndDate(billingCycle);
          }

          await db.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: 'active',
              subscriptionPlan: billingCycle,
              subscriptionId: subscription.id || subscription.subscription,
              subscriptionEndsAt: subscriptionEndsAt,
              characterSlots: 3,
            },
          });
          console.log('✅ Subscription created for user:', userId, 'plan:', billingCycle);
        }
        break;
      }

      case 'subscription.activated':
      case 'subscription.updated': {
        const subscription = event.data || event;
        let tags = subscription.tags;
        if (typeof tags === 'string') {
          try {
            tags = JSON.parse(tags);
          } catch {
            tags = {};
          }
        }
        const userId = tags?.userId;

        if (userId) {
          const billingCycle = getBillingCycle(subscription);
          
          let subscriptionEndsAt: Date | null = null;
          if (subscription.endDate) {
            subscriptionEndsAt = new Date(subscription.endDate);
          } else if (subscription.nextChargeDate) {
            subscriptionEndsAt = new Date(subscription.nextChargeDate);
          } else if (subscription.status === 'active') {
            subscriptionEndsAt = calculateSubscriptionEndDate(billingCycle);
          }

          let newStatus: string;
          if (subscription.status === 'active' || subscription.status === 'active_trial') {
            newStatus = 'active';
          } else if (subscription.status === 'canceled' || subscription.status === 'deactivated') {
            newStatus = 'canceled';
          } else if (subscriptionEndsAt && subscriptionEndsAt < new Date()) {
            newStatus = 'free';
          } else {
            newStatus = 'inactive';
          }

          await db.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: newStatus,
              subscriptionPlan: newStatus === 'free' ? 'free' : billingCycle,
              subscriptionEndsAt: subscriptionEndsAt,
              ...(newStatus === 'free' ? { characterSlots: 1 } : {}),
            },
          });
          console.log('✅ Subscription updated for user:', userId, 'status:', newStatus);
        }
        break;
      }

      case 'subscription.canceled':
      case 'subscription.deactivated': {
        const subscription = event.data || event;
        let tags = subscription.tags;
        if (typeof tags === 'string') {
          try {
            tags = JSON.parse(tags);
          } catch {
            tags = {};
          }
        }
        const userId = tags?.userId;

        if (userId) {
          let subscriptionEndsAt: Date | null = null;
          
          if (subscription.endDate) {
            subscriptionEndsAt = new Date(subscription.endDate);
          } else if (subscription.nextChargeDate) {
            subscriptionEndsAt = new Date(subscription.nextChargeDate);
          } else {
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
          console.log('✅ Subscription canceled for user:', userId);
        }
        break;
      }

      default:
        console.log('ℹ️ Unhandled webhook event type:', eventType);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Error processing FastSpring webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

