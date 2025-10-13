import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

// Validate webhook secret
const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
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

        if (userId) {
          // Update user subscription status
          await db.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: 'active',
              subscriptionPlan: 'tribute',
              subscriptionId: subscription.id,
              subscriptionEndsAt: new Date(subscription.next_billed_at),
              characterSlots: 3, // Tribute plan gets 3 character slots
            },
          });
          console.log('✅ Subscription created for user:', userId);
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
          
          // If no valid next_billed_at, calculate 7 days from now for weekly subscription
          if (!subscriptionEndsAt && subscription.status === 'active') {
            subscriptionEndsAt = new Date();
            subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 7);
          }

          await db.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: subscription.status === 'active' ? 'active' : 'inactive',
              subscriptionEndsAt: subscriptionEndsAt,
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
          
          // If still no valid date, set to 7 days from now (end of current period)
          if (!subscriptionEndsAt) {
            subscriptionEndsAt = new Date();
            subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 7);
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
          // Calculate next billing date (7 days from now for weekly subscription)
          const nextBillingDate = new Date();
          nextBillingDate.setDate(nextBillingDate.getDate() + 7);
          
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
          const nextBillingDate = new Date();
          nextBillingDate.setDate(nextBillingDate.getDate() + 7);
          
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
          const nextBillingDate = new Date();
          nextBillingDate.setDate(nextBillingDate.getDate() + 7);
          
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
