// Paddle configuration
export const PADDLE_CONFIG = {
  vendorId: process.env.PADDLE_VENDOR_ID,
  apiKey: process.env.PADDLE_API_KEY,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.paddle.com' 
    : 'https://sandbox-api.paddle.com'
};

// Tribute subscription plan
export const TRIBUTE_PLAN = {
  priceId: process.env.PADDLE_PRICE_ID || 'pri_01h8xce4x86pq3byesf7a4k0c5' // You'll need to get this from Paddle
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
 * Check if user has premium access (active subscription OR cancelled but still in grace period)
 */
export function hasPremiumAccess(user: { 
  subscriptionPlan?: string | null; 
  subscriptionStatus?: string | null; 
  subscriptionEndsAt?: Date | null 
}): boolean {
  if (user.subscriptionPlan !== 'tribute') {
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
