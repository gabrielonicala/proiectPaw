import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});

// Tribute subscription plan
export const TRIBUTE_PLAN = {
  priceId: process.env.STRIPE_PRICE_ID || 'price_1234567890', // You'll need to create this in Stripe
  amount: 700, // $7.00 in cents
  currency: 'usd',
  interval: 'week',
  name: 'Tribute',
  description: 'Weekly tribute for unlimited adventures'
};

// Check if user has active subscription
export function hasActiveSubscription(user: { subscriptionStatus?: string; subscriptionEndsAt?: Date }): boolean {
  if (!user.subscriptionStatus || user.subscriptionStatus !== 'active') {
    return false;
  }
  
  if (user.subscriptionEndsAt && user.subscriptionEndsAt < new Date()) {
    return false;
  }
  
  return true;
}

// Check if user can access premium features
export function canAccessPremiumFeatures(user: { subscriptionStatus?: string; subscriptionEndsAt?: Date }): boolean {
  return hasActiveSubscription(user);
}
