// FastSpring configuration
export const FASTSPRING_CONFIG = {
  // FastSpring API base URL (same for sandbox and production)
  apiBaseUrl: 'https://api.fastspring.com',
  // FastSpring API credentials
  apiUsername: process.env.FASTSPRING_API_USERNAME,
  apiPassword: process.env.FASTSPRING_API_PASSWORD,
  storeId: process.env.FASTSPRING_STORE_ID,
  // FastSpring checkout base URL (test or live)
  checkoutBaseUrl: process.env.FASTSPRING_CHECKOUT_URL || 'https://quillia.test.onfastspring.com',
  // FastSpring storefront subdomain for JavaScript API
  storefront: process.env.FASTSPRING_STOREFRONT || 'quillia.test.onfastspring.com',
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
 * Create a FastSpring checkout session with buyerReference (userId)
 * This ensures webhooks can match the subscription to the correct user
 */
export async function createCheckoutSession(
  billingCycle: 'weekly' | 'monthly' | 'yearly',
  userId: string,
  userEmail: string,
  countryCode?: string // Optional: ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB')
): Promise<{ sessionId: string; checkoutUrl: string }> {
  // Validate all required credentials
  if (!FASTSPRING_CONFIG.apiUsername || !FASTSPRING_CONFIG.apiPassword || !FASTSPRING_CONFIG.storeId) {
    const missing = [];
    if (!FASTSPRING_CONFIG.apiUsername) missing.push('FASTSPRING_API_USERNAME');
    if (!FASTSPRING_CONFIG.apiPassword) missing.push('FASTSPRING_API_PASSWORD');
    if (!FASTSPRING_CONFIG.storeId) missing.push('FASTSPRING_STORE_ID');
    throw new Error(`FastSpring API credentials are not configured. Missing: ${missing.join(', ')}`);
  }

  // Ensure storeId is not empty
  const storeId = (FASTSPRING_CONFIG.storeId || '').trim();
  if (!storeId) {
    console.error('FASTSPRING_STORE_ID is empty or undefined. Current value:', FASTSPRING_CONFIG.storeId);
    throw new Error('FASTSPRING_STORE_ID is empty or invalid. Please check your .env file.');
  }
  
  console.log('Using FastSpring store ID:', storeId.substring(0, 10) + '...'); // Log first 10 chars for debugging

  const plan = TRIBUTE_PLAN[billingCycle];
  
  // Create Basic Auth header
  const credentials = Buffer.from(`${FASTSPRING_CONFIG.apiUsername}:${FASTSPRING_CONFIG.apiPassword}`).toString('base64');
  
  // Create session with buyerReference
  // Include country if provided to enable automatic tax calculation
  // Note: For Sessions API, we use accountCustomKey to identify the customer
  // The account field is for existing FastSpring customer accounts, not the store ID
  const sessionData: any = {
    items: [
      {
        product: plan.productPath,
        quantity: 1
      }
    ],
    buyerReference: userId, // This will be included in webhook payloads
    accountCustomKey: userId // Use userId as custom key to identify the customer
  };
  
  // Include contact info for tax calculation (required by FastSpring)
  // FastSpring requires either 'account' (existing customer) or 'contact' (new customer)
  // We use 'contact' since we're creating a new checkout session
  const contact: any = {
    email: userEmail || 'customer@example.com' // Required field
  };
  
  // Include country for accurate tax calculation
  // FastSpring can auto-detect from IP, but providing it explicitly is more accurate
  if (countryCode) {
    contact.country = countryCode;
    console.log('✅ Adding country to contact for tax calculation:', countryCode);
  } else {
    // If country not detected (e.g., localhost), FastSpring will auto-detect from user's IP at checkout
    // This is fine for production, but local testing won't show taxes until deployed
    console.log('⚠️ No country code detected - FastSpring will auto-detect from user IP at checkout');
    console.log('   Note: Local testing (localhost) cannot detect country. Taxes will work in production.');
  }
  
  // Add contact to session data (required by FastSpring)
  sessionData.contact = contact;
  
  // Debug log
  console.log('Creating FastSpring session:', {
    product: plan.productPath,
    buyerReference: userId,
    accountCustomKey: userId,
    hasContact: !!sessionData.contact,
    contactEmail: sessionData.contact.email,
    contactCountry: sessionData.contact.country || 'not set'
  });

  // Debug: Log the session data being sent (without sensitive info)
  console.log('FastSpring session data:', {
    product: sessionData.items[0].product,
    buyerReference: sessionData.buyerReference,
    accountCustomKey: sessionData.accountCustomKey,
    hasContact: !!sessionData.contact,
    contactEmail: sessionData.contact?.email,
    contactCountry: sessionData.contact?.country
  });

  const requestBody = JSON.stringify(sessionData);
  console.log('Request body length:', requestBody.length);
  console.log('Request body (first 200 chars):', requestBody.substring(0, 200));

  const response = await fetch(`${FASTSPRING_CONFIG.apiBaseUrl}/sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    body: requestBody
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('FastSpring API error:', errorText);
    console.error('Request payload:', JSON.stringify(sessionData, null, 2));
    throw new Error(`FastSpring API error: ${response.status} - ${errorText}`);
  }

  const session = await response.json();
  
  if (!session.id) {
    throw new Error('FastSpring session creation failed: missing session ID');
  }

  // Construct checkout URL from session ID
  // Format: https://{storefront}/session/{sessionId}
  const storefront = FASTSPRING_CONFIG.checkoutBaseUrl.replace('https://', '').replace('http://', '');
  const checkoutUrl = `https://${storefront}/session/${session.id}`;

  return {
    sessionId: session.id,
    checkoutUrl: checkoutUrl
  };
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


