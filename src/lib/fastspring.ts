// FastSpring configuration
export const FASTSPRING_CONFIG = {
  // FastSpring checkout base URL (test or live)
  checkoutBaseUrl: process.env.FASTSPRING_CHECKOUT_URL || 'https://quillia.test.onfastspring.com',
  webhookSecret: process.env.FASTSPRING_WEBHOOK_SECRET
};

// Tribute subscription plans - product paths configured in FastSpring dashboard
export const TRIBUTE_PLAN = {
  weekly: {
    productPath: 'quillia-weekly-tribute',
    amount: 4.00,
    interval: 'week'
  },
  monthly: {
    productPath: 'quillia-monthly-tribute',
    amount: 12.00,
    interval: 'month'
  },
  yearly: {
    productPath: 'quillia-yearly-tribute',
    amount: 108.00,
    interval: 'year'
  }
};

/**
 * Get checkout URL for a subscription plan
 */
export function getCheckoutUrl(billingCycle: 'weekly' | 'monthly' | 'yearly'): string {
  const plan = TRIBUTE_PLAN[billingCycle];
  return `${FASTSPRING_CONFIG.checkoutBaseUrl}/${plan.productPath}`;
}

/**
 * Check if user has an active subscription
 */
export function hasActiveSubscription(user: { subscriptionStatus?: string | null; subscriptionEndsAt?: Date | null }): boolean {
  return user.subscriptionStatus === 'active' && 
         !!user.subscriptionEndsAt && 
         user.subscriptionEndsAt > new Date();
}

/**
 * Check if user can access premium features
 */
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
 */
export function hasPremiumAccess(user: { 
  subscriptionPlan?: string | null; 
  subscriptionStatus?: string | null; 
  subscriptionEndsAt?: Date | null 
}): boolean {
  if (user.subscriptionStatus === 'free') {
    return false;
  }
  
  if (user.subscriptionStatus === 'active' && !isPaidPlan(user.subscriptionPlan)) {
    return false;
  }
  
  if (!isPaidPlan(user.subscriptionPlan)) {
    return false;
  }
  
  if (user.subscriptionStatus === 'active') {
    return true;
  }
  
  if (user.subscriptionStatus === 'canceled' && 
      user.subscriptionEndsAt && 
      user.subscriptionEndsAt > new Date()) {
    return true;
  }
  
  return false;
}


