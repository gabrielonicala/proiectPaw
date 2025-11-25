import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import Stripe from 'stripe';

// Validate webhook secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret) {
  console.error('❌ STRIPE_WEBHOOK_SECRET is not set');
  throw new Error('Stripe webhook secret is not configured');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ Missing Stripe signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret!);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Process the webhook event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (userId) {
          // Update user subscription status and character slots
          await db.user.update({
            where: { id: userId },
            data: {
              subscriptionStatus: 'active',
              subscriptionPlan: 'monthly', // Default to monthly for Stripe (legacy)
              subscriptionId: session.subscription as string,
              subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              characterSlots: 3, // Paid plans get 3 character slots
            },
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as Stripe.Invoice & { subscription: string }).subscription;

        if (subscriptionId) {
          // Update subscription end date
          await db.user.updateMany({
            where: { subscriptionId },
            data: {
              subscriptionStatus: 'active',
              subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as Stripe.Invoice & { subscription: string }).subscription;

        if (subscriptionId) {
          // Mark subscription as past due
          await db.user.updateMany({
            where: { subscriptionId },
            data: {
              subscriptionStatus: 'past_due',
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;

        // Mark subscription as free (subscription deleted = back to free)
        await db.user.updateMany({
          where: { subscriptionId },
          data: {
            subscriptionStatus: 'free',
            subscriptionPlan: 'free',
            characterSlots: 1, // Reset to free plan (1 character slot)
          },
        });
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
