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
  
  // Try to infer from product path (can be in different places)
  const productPath = subscription.product || 
                      subscription.product?.product || 
                      subscription.items?.[0]?.product ||
                      '';
  
  if (typeof productPath === 'string') {
    if (productPath.includes('weekly')) return 'weekly';
    if (productPath.includes('yearly')) return 'yearly';
    if (productPath.includes('monthly')) return 'monthly';
  }
  
  // Try intervalUnit from subscription
  if (subscription.intervalUnit === 'week') return 'weekly';
  if (subscription.intervalUnit === 'year') return 'yearly';
  if (subscription.intervalUnit === 'month') return 'monthly';
  
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

    const payload = JSON.parse(body);
    console.log('📨 Received FastSpring webhook payload:', JSON.stringify(payload).substring(0, 200));

    // FastSpring sends events in an array: { events: [{ type, data, ... }] }
    if (!payload.events || !Array.isArray(payload.events)) {
      console.error('❌ Invalid webhook format - expected events array');
      return NextResponse.json({ error: 'Invalid webhook format' }, { status: 400 });
    }

    // Process each event in the array
    for (const event of payload.events) {
      const eventType = event.type;
      const eventData = event.data;
      
      console.log(`📨 Processing event: ${eventType}`);
    
      // Process the webhook event
      switch (eventType) {
        case 'order.completed':
        case 'order.fulfilled': {
          const order = eventData;
          
          // Get userId from buyerReference (set during popup checkout or session creation)
          // buyerReference can be on order, order.account, or in tags
          let userId = order.buyerReference || order.account?.buyerReference;
          
          // Fallback: try to get from tags if buyerReference is not set
          if (!userId && order.items?.[0]?.tags) {
            const tags = typeof order.items[0].tags === 'string' 
              ? JSON.parse(order.items[0].tags) 
              : order.items[0].tags;
            userId = tags?.userId;
          }
          
          if (!userId) {
            console.warn('⚠️ No buyerReference or userId in tags found in order - cannot match user');
            break;
          }

          // Find user by buyerReference (userId)
          const user = await db.user.findUnique({
            where: { id: userId }
          });

          if (!user) {
            console.error('❌ User not found for buyerReference:', userId);
            break;
          }

          // Get subscription from order items
          const subscriptionId = order.items?.[0]?.subscription;
          
          if (subscriptionId) {
            // Determine billing cycle from product path
            const productPath = order.items[0].product || '';
            let billingCycle = 'monthly';
            if (productPath.includes('weekly')) billingCycle = 'weekly';
            else if (productPath.includes('yearly')) billingCycle = 'yearly';
            
            // Store subscription ID - subscription.activated will update with proper end date
            await db.user.update({
              where: { id: user.id },
              data: {
                subscriptionStatus: 'active',
                subscriptionPlan: billingCycle,
                subscriptionId: subscriptionId,
                characterSlots: 3,
              },
            });
            console.log('✅ Order completed - subscription ID stored for user:', user.id, 'plan:', billingCycle);
          } else {
            console.warn('⚠️ No subscription ID found in order items');
          }
          break;
        }

        case 'subscription.activated':
        case 'subscription.updated': {
          const subscription = eventData;
          const subscriptionId = subscription.id || subscription.subscription;
          
          if (!subscriptionId) {
            console.error('❌ No subscription ID found');
            continue;
          }

          // Get userId from buyerReference (set during session creation)
          // buyerReference is available on the subscription object
          const userId = subscription.buyerReference || subscription.account?.buyerReference;
          
          let user = null;
          
          // First try to find by buyerReference (most reliable)
          if (userId) {
            user = await db.user.findUnique({
              where: { id: userId }
            });
            console.log('Found user by buyerReference:', userId);
          }
          
          // Fallback: find by subscription ID (from order.completed event)
          if (!user) {
            user = await db.user.findFirst({
              where: { subscriptionId: subscriptionId }
            });
            console.log('Found user by subscriptionId:', subscriptionId);
          }

          if (user) {
            const billingCycle = getBillingCycle(subscription);
            
            let subscriptionEndsAt: Date | null = null;
            if (subscription.nextChargeDateValue) {
              subscriptionEndsAt = new Date(subscription.nextChargeDateValue);
            } else if (subscription.next) {
              subscriptionEndsAt = new Date(subscription.next);
            } else if (subscription.endDate) {
              subscriptionEndsAt = new Date(subscription.endDate);
            } else {
              subscriptionEndsAt = calculateSubscriptionEndDate(billingCycle);
            }

            let newStatus: string;
            if (subscription.state === 'active' || subscription.active === true) {
              newStatus = 'active';
            } else if (subscription.state === 'canceled' || subscription.state === 'deactivated') {
              newStatus = 'canceled';
            } else if (subscriptionEndsAt && subscriptionEndsAt < new Date()) {
              newStatus = 'free';
            } else {
              newStatus = 'inactive';
            }

            await db.user.update({
              where: { id: user.id },
              data: {
                subscriptionStatus: newStatus,
                subscriptionPlan: newStatus === 'free' ? 'free' : billingCycle,
                subscriptionEndsAt: subscriptionEndsAt,
                subscriptionId: subscriptionId, // Ensure subscription ID is stored
                ...(newStatus === 'free' ? { characterSlots: 1 } : {}),
              },
            });
            console.log('✅ Subscription updated for user:', user.id, 'status:', newStatus, 'plan:', billingCycle);
          } else {
            console.warn('⚠️ User not found for subscription:', subscriptionId, 'buyerReference:', userId);
          }
          break;
        }

        case 'subscription.canceled':
        case 'subscription.deactivated': {
          const subscription = eventData;
          const subscriptionId = subscription.id || subscription.subscription;

          if (!subscriptionId) {
            console.error('❌ No subscription ID found');
            continue;
          }

          const user = await db.user.findFirst({
            where: { subscriptionId: subscriptionId }
          });

          if (user) {
            let subscriptionEndsAt: Date | null = null;
            
            if (subscription.endValue) {
              subscriptionEndsAt = new Date(subscription.endValue);
            } else if (subscription.end) {
              subscriptionEndsAt = new Date(subscription.end);
            } else if (subscription.nextChargeDateValue) {
              subscriptionEndsAt = new Date(subscription.nextChargeDateValue);
            } else {
              const billingCycle = getBillingCycle(subscription);
              subscriptionEndsAt = calculateSubscriptionEndDate(billingCycle);
            }

            await db.user.update({
              where: { id: user.id },
              data: {
                subscriptionStatus: 'canceled',
                subscriptionEndsAt: subscriptionEndsAt,
              },
            });
            console.log('✅ Subscription canceled for user:', user.id);
          }
          break;
        }

        default:
          console.log('ℹ️ Unhandled webhook event type:', eventType);
      }
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

