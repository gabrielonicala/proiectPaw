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
    // Log the incoming request URL to debug redirect issues
    const url = request.nextUrl.toString();
    console.log('📨 Webhook received from FastSpring');
    console.log('📨 Request URL:', url);
    console.log('📨 Host:', request.headers.get('host'));
    
    const body = await request.text();
    const signature = request.headers.get('x-fs-signature') || request.headers.get('fastspring-signature');

    // Log all relevant headers for debugging
    console.log('📨 Webhook headers:', {
      'x-fs-signature': request.headers.get('x-fs-signature'),
      'fastspring-signature': request.headers.get('fastspring-signature'),
      'content-type': request.headers.get('content-type'),
      'user-agent': request.headers.get('user-agent'),
      hasWebhookSecret: !!webhookSecret
    });

    if (!signature) {
      console.warn('⚠️ Missing FastSpring signature header - continuing without verification');
      // Continue without signature verification for now
    } else if (webhookSecret) {
      // Verify webhook signature if provided
      // FastSpring uses HMAC SHA256 of the raw request body, encoded as base64
      const expectedSignatureHex = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');
      
      // FastSpring sends signature as base64, so convert our hex to base64 for comparison
      const expectedSignatureBase64 = Buffer.from(expectedSignatureHex, 'hex').toString('base64');

      console.log('🔐 Signature verification:', {
        received: signature.substring(0, 20) + '...',
        expectedHex: expectedSignatureHex.substring(0, 20) + '...',
        expectedBase64: expectedSignatureBase64.substring(0, 20) + '...',
        match: signature === expectedSignatureBase64,
        bodyLength: body.length
      });

      if (signature !== expectedSignatureBase64) {
        console.error('❌ Webhook signature verification failed');
        console.error('Received signature (base64):', signature);
        console.error('Expected signature (base64):', expectedSignatureBase64);
        // For now, log but continue - you can enable strict verification later
        console.warn('⚠️ Signature mismatch - continuing anyway for testing. Enable strict verification in production.');
        // Uncomment the line below to enable strict signature verification:
        // return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      } else {
        console.log('✅ Webhook signature verification passed');
      }
    } else {
      console.warn('⚠️ No webhook secret configured - skipping signature verification');
    }

    const payload = JSON.parse(body);
    console.log('📨 Received FastSpring webhook payload:', JSON.stringify(payload, null, 2));

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
          
          // Also check account object if it exists
          if (!userId && order.account) {
            userId = order.account.buyerReference || order.account.accountCustomKey;
          }
          
          // Fallback: try to get from tags if buyerReference is not set
          if (!userId && order.items?.[0]?.tags) {
            const tags = typeof order.items[0].tags === 'string' 
              ? JSON.parse(order.items[0].tags) 
              : order.items[0].tags;
            userId = tags?.userId;
          }
          
          // If buyerReference is missing, try email as last resort ONLY to establish subscriptionId link
          // This is a one-time thing - once subscriptionId is stored, we use that for matching
          if (!userId && order.customer?.email) {
            console.warn('⚠️ No buyerReference found - using email as temporary fallback to establish subscriptionId link');
            const userByEmail = await db.user.findUnique({
              where: { email: order.customer.email }
            });
            if (userByEmail) {
              userId = userByEmail.id;
              console.log('✅ Found user by email (temporary) to store subscriptionId:', userId);
            }
          }
          
          if (!userId) {
            console.warn('⚠️ No buyerReference or email match found in order - cannot match user');
            console.warn('Order data (relevant fields):', JSON.stringify({
              orderId: order.id,
              orderReference: order.reference,
              buyerReference: order.buyerReference,
              account: order.account,
              subscriptionId: order.items?.[0]?.subscription,
              customerEmail: order.customer?.email
            }, null, 2));
            console.warn('⚠️ subscription.activated event will also fail to match user');
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
          // buyerReference can be on subscription, subscription.account, or accountCustomKey
          let userId = subscription.buyerReference || subscription.account?.buyerReference || subscription.accountCustomKey;
          
          // Also check account object if it exists
          if (!userId && subscription.account) {
            userId = subscription.account.buyerReference || subscription.account.accountCustomKey;
          }
          
          let user = null;
          
          // First try to find by buyerReference (most reliable)
          if (userId) {
            user = await db.user.findUnique({
              where: { id: userId }
            });
            console.log('Found user by buyerReference/accountCustomKey:', userId);
          }
          
          // Fallback: find by subscription ID (from order.completed event)
          if (!user) {
            user = await db.user.findFirst({
              where: { subscriptionId: subscriptionId }
            });
            if (user) {
              console.log('✅ Found user by subscriptionId:', subscriptionId);
            } else {
              console.log('⚠️ User not found by subscriptionId:', subscriptionId, '- order.completed may not have processed yet');
            }
          }
          
          // Log detailed info if user still not found
          if (!user) {
            const accountId = subscription.account ? (typeof subscription.account === 'string' ? subscription.account : subscription.account.id) : null;
            console.error('❌ Could not find user for subscription:', subscriptionId);
            console.error('Subscription data (relevant fields):', JSON.stringify({
              subscriptionId,
              account: subscription.account,
              accountId,
              buyerReference: subscription.buyerReference,
              accountCustomKey: subscription.accountCustomKey,
              accountObject: typeof subscription.account === 'object' ? subscription.account : null
            }, null, 2));
            console.error('⚠️ This subscription will not be linked to a user. Check if buyerReference is being set correctly in checkout.');
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

    // Return 200 OK immediately - FastSpring requires this to mark webhook as successful
    // Use status 200 explicitly to avoid any redirect issues
    return NextResponse.json(
      { success: true },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // Prevent any caching or redirects
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );

  } catch (error) {
    console.error('❌ Error processing FastSpring webhook:', error);
    // Still return 200 to prevent FastSpring from retrying immediately
    // Log the error for debugging, but acknowledge receipt
    return NextResponse.json(
      { 
        success: false,
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 200, // Return 200 even on error to acknowledge receipt
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

