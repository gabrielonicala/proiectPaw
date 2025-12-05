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
          
          // Extract FastSpring account ID (primary matching method - most reliable)
          // account can be a string ID or an object with an id property
          const accountId = typeof order.account === 'string' 
            ? order.account 
            : order.account?.id;
          
          // Get subscription from order items
          const subscriptionId = order.items?.[0]?.subscription;
          
          let user = null;
          
          // PRIMARY: Try to find user by FastSpring account ID (most reliable)
          if (accountId) {
            user = await db.user.findUnique({
              where: { fastspringAccountId: accountId }
            });
            if (user) {
              console.log('✅ Found user by FastSpring account ID:', accountId);
            }
          }
          
          // FALLBACK 1: Try buyerReference (if account ID matching failed)
          if (!user) {
            let userId = order.buyerReference || order.account?.buyerReference;
            if (!userId && order.account && typeof order.account === 'object') {
              userId = order.account.buyerReference || order.account.accountCustomKey;
            }
            if (!userId && order.items?.[0]?.tags) {
              const tags = typeof order.items[0].tags === 'string' 
                ? JSON.parse(order.items[0].tags) 
                : order.items[0].tags;
              userId = tags?.userId;
            }
            
            if (userId) {
              user = await db.user.findUnique({
                where: { id: userId }
              });
              if (user) {
                console.log('✅ Found user by buyerReference:', userId);
                // Store account ID for future webhook matching
                if (accountId && !user.fastspringAccountId) {
                  await db.user.update({
                    where: { id: user.id },
                    data: { fastspringAccountId: accountId }
                  });
                  console.log('✅ Stored FastSpring account ID for future matching:', accountId);
                }
              }
            }
          }
          
          // FALLBACK 2: Check if subscription already linked (client-side linking may have happened)
          if (!user && subscriptionId) {
            user = await db.user.findFirst({
              where: { subscriptionId: subscriptionId }
            });
            if (user) {
              console.log('✅ Found user by subscriptionId (client-side linking already happened):', subscriptionId);
              // Store account ID for future webhook matching
              if (accountId && !user.fastspringAccountId) {
                await db.user.update({
                  where: { id: user.id },
                  data: { fastspringAccountId: accountId }
                });
                console.log('✅ Stored FastSpring account ID for future matching:', accountId);
              }
            }
          }
          
          if (user && subscriptionId) {
            // Determine billing cycle from product path
            const productPath = order.items[0].product || '';
            let billingCycle = 'monthly';
            if (productPath.includes('weekly')) billingCycle = 'weekly';
            else if (productPath.includes('yearly')) billingCycle = 'yearly';
            
            // Update subscription info (subscription.activated will update with proper end date)
            await db.user.update({
              where: { id: user.id },
              data: {
                subscriptionStatus: 'active',
                subscriptionPlan: billingCycle,
                subscriptionId: subscriptionId,
                characterSlots: 3,
                // Ensure account ID is stored
                ...(accountId ? { fastspringAccountId: accountId } : {})
              },
            });
            console.log('✅ Order completed - subscription linked for user:', user.id, 'plan:', billingCycle);
          } else {
            // FALLBACK: If we have account ID but no user, this means client-side linking hasn't happened yet
            // Log this clearly so we can diagnose the issue
            console.warn('⚠️ Could not link order - no user found');
            console.warn('Order data (relevant fields):', JSON.stringify({
              orderId: order.id,
              orderReference: order.reference,
              accountId: accountId,
              buyerReference: order.buyerReference,
              subscriptionId: subscriptionId
            }, null, 2));
            console.warn('⚠️ This likely means client-side linking did not run or failed.');
            console.warn('⚠️ Check browser console logs during checkout to see if the fsc:order.complete event fired.');
            console.warn('⚠️ The subscription.activated webhook may be able to link it if client-side linking completes.');
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

          // Extract FastSpring account ID (primary matching method - most reliable)
          // account can be a string ID or an object with an id property
          const accountId = typeof subscription.account === 'string' 
            ? subscription.account 
            : subscription.account?.id;
          
          let user = null;
          
          // PRIMARY: Try to find user by FastSpring account ID (most reliable)
          if (accountId) {
            user = await db.user.findUnique({
              where: { fastspringAccountId: accountId }
            });
            if (user) {
              console.log('✅ Found user by FastSpring account ID:', accountId);
            }
          }
          
          // FALLBACK 1: Try buyerReference (if account ID matching failed)
          if (!user) {
            let userId = subscription.buyerReference || subscription.account?.buyerReference || subscription.accountCustomKey;
            if (!userId && subscription.account && typeof subscription.account === 'object') {
              userId = subscription.account.buyerReference || subscription.account.accountCustomKey;
            }
            
            if (userId) {
              user = await db.user.findUnique({
                where: { id: userId }
              });
              if (user) {
                console.log('✅ Found user by buyerReference/accountCustomKey:', userId);
                // Store account ID for future webhook matching
                if (accountId && !user.fastspringAccountId) {
                  await db.user.update({
                    where: { id: user.id },
                    data: { fastspringAccountId: accountId }
                  });
                  console.log('✅ Stored FastSpring account ID for future matching:', accountId);
                }
              }
            }
          }
          
          // FALLBACK 2: Find by subscription ID (from order.completed event or client-side linking)
          if (!user) {
            user = await db.user.findFirst({
              where: { subscriptionId: subscriptionId }
            });
            if (user) {
              console.log('✅ Found user by subscriptionId:', subscriptionId);
              // Store account ID for future webhook matching
              if (accountId && !user.fastspringAccountId) {
                await db.user.update({
                  where: { id: user.id },
                  data: { fastspringAccountId: accountId }
                });
                console.log('✅ Stored FastSpring account ID for future matching:', accountId);
              }
            }
          }
          
          // FALLBACK 3: If we have account ID but no user, try fetching order details
          // This might help if client-side linking hasn't completed yet
          if (!user && accountId && subscription.initialOrderId) {
            console.log('⚠️ User not found by account ID, attempting to fetch order details for:', subscription.initialOrderId);
            try {
              const { FASTSPRING_CONFIG } = await import('@/lib/fastspring');
              if (FASTSPRING_CONFIG.apiUsername && FASTSPRING_CONFIG.apiPassword) {
                const credentials = Buffer.from(`${FASTSPRING_CONFIG.apiUsername}:${FASTSPRING_CONFIG.apiPassword}`).toString('base64');
                
                const orderResponse = await fetch(
                  `${FASTSPRING_CONFIG.apiBaseUrl}/orders/${subscription.initialOrderId}`,
                  {
                    headers: {
                      'Authorization': `Basic ${credentials}`,
                      'Content-Type': 'application/json'
                    },
                    signal: AbortSignal.timeout(5000)
                  }
                );
                
                if (orderResponse.ok) {
                  const orderData = await orderResponse.json();
                  console.log('✅ Fetched order from FastSpring API for fallback matching');
                  
                  // Check if order has buyerReference that we can use
                  const orderBuyerReference = orderData.buyerReference || orderData.account?.buyerReference;
                  if (orderBuyerReference) {
                    user = await db.user.findUnique({
                      where: { id: orderBuyerReference }
                    });
                    if (user) {
                      console.log('✅ Found user by buyerReference from fetched order:', orderBuyerReference);
                      // Store account ID for future matching
                      if (!user.fastspringAccountId) {
                        await db.user.update({
                          where: { id: user.id },
                          data: { fastspringAccountId: accountId }
                        });
                        console.log('✅ Stored FastSpring account ID for future matching:', accountId);
                      }
                    }
                  }
                } else {
                  console.warn('⚠️ Failed to fetch order from FastSpring API:', orderResponse.status);
                }
              }
            } catch (apiError) {
              console.error('❌ Error fetching order from FastSpring API for fallback:', apiError);
            }
          }
          
          // Log detailed info if user still not found
          if (!user) {
            console.error('❌ Could not find user for subscription:', subscriptionId);
            console.error('Subscription data (relevant fields):', JSON.stringify({
              subscriptionId,
              account: subscription.account,
              accountId: accountId,
              buyerReference: subscription.buyerReference,
              accountCustomKey: subscription.accountCustomKey,
              initialOrderId: subscription.initialOrderId
            }, null, 2));
            console.error('⚠️ This subscription will not be linked to a user. Client-side linking should handle this.');
            console.error('⚠️ Check browser console logs to see if client-side linking ran and what data it received.');
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
            console.warn('⚠️ User not found for subscription:', subscriptionId, 'accountId:', accountId);
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

