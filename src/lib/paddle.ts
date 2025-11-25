// Paddle configuration
export const PADDLE_CONFIG = {
  vendorId: process.env.PADDLE_VENDOR_ID,
  apiKey: process.env.PADDLE_API_KEY,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.paddle.com' 
    : 'https://sandbox-api.paddle.com'
};

// Tribute subscription plans - different price IDs for different billing cycles
export const TRIBUTE_PLAN = {
  weekly: {
    priceId: process.env.PADDLE_PRICE_ID_WEEKLY || 'pri_weekly',
    amount: 399, // $4.00 in cents
    interval: 'week'
  },
  monthly: {
    priceId: process.env.PADDLE_PRICE_ID_MONTHLY || 'pri_monthly',
    amount: 1199, // $12.00 in cents
    interval: 'month'
  },
  yearly: {
    priceId: process.env.PADDLE_PRICE_ID_YEARLY || 'pri_yearly',
    amount: 10799, // $108.00 in cents
    interval: 'year'
  }
};

export function hasActiveSubscription(user: { subscriptionStatus?: string | null; subscriptionEndsAt?: Date | null }): boolean {
  return user.subscriptionStatus === 'active' && 
         !!user.subscriptionEndsAt && 
         user.subscriptionEndsAt > new Date();
}

export function canAccessPremiumFeatures(user: { subscriptionStatus?: string | null; subscriptionEndsAt?: Date | null }): boolean {
  return hasActiveSubscription(user);
}

/**
 * Check if a subscription plan is a paid plan
 */
export function isPaidPlan(plan: string | null | undefined): boolean {
  return plan === 'weekly' || plan === 'monthly' || plan === 'yearly';
}

/**
 * Check if user has premium access (active subscription OR cancelled but still in grace period)
 * Also validates subscription state - invalid states return false
 */
export function hasPremiumAccess(user: { 
  subscriptionPlan?: string | null; 
  subscriptionStatus?: string | null; 
  subscriptionEndsAt?: Date | null 
}): boolean {
  // Free users never have premium access
  if (user.subscriptionStatus === 'free') {
    return false;
  }
  
  // Validate state: if status is active, plan must be paid
  // If plan is free, status should be 'free' (invalid state = no premium access)
  if (user.subscriptionStatus === 'active' && !isPaidPlan(user.subscriptionPlan)) {
    // Invalid state: active status with free plan - treat as no premium access
    return false;
  }
  
  // Must have a paid plan to have premium access
  if (!isPaidPlan(user.subscriptionPlan)) {
    return false;
  }
  
  // Active subscription
  if (user.subscriptionStatus === 'active') {
    return true;
  }
  
  // Cancelled but still in grace period
  if (user.subscriptionStatus === 'canceled' && 
      user.subscriptionEndsAt && 
      user.subscriptionEndsAt > new Date()) {
    return true;
  }
  
  return false;
}
