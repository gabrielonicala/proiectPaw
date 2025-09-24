import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from './env';

// Create Redis client if credentials are available, otherwise use in-memory fallback
const redis = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN && 
  !env.UPSTASH_REDIS_REST_URL.includes('your-redis-instance')
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// In-memory fallback for development
const memoryStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiters for different endpoint types
export const rateLimiters = {
  // AI generation endpoints (expensive operations) - now subscription-aware
  aiGeneration: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(env.RATE_LIMIT_AI_GENERATION, '1 h'),
    analytics: true,
    prefix: 'quillia:ai',
    // Fallback for when Redis is not available
    ...(redis ? {} : {
      async exec(identifier: string) {
        const key = `ai:${identifier}`;
        const now = Date.now();
        const windowMs = 60 * 60 * 1000; // 1 hour
        
        const current = memoryStore.get(key);
        if (!current || now > current.resetTime) {
          memoryStore.set(key, { count: 1, resetTime: now + windowMs });
          return { success: true, limit: env.RATE_LIMIT_AI_GENERATION, remaining: env.RATE_LIMIT_AI_GENERATION - 1, reset: new Date(now + windowMs) };
        }
        
        if (current.count >= env.RATE_LIMIT_AI_GENERATION) {
          return { success: false, limit: env.RATE_LIMIT_AI_GENERATION, remaining: 0, reset: new Date(current.resetTime) };
        }
        
        current.count++;
        return { success: true, limit: env.RATE_LIMIT_AI_GENERATION, remaining: env.RATE_LIMIT_AI_GENERATION - current.count, reset: new Date(current.resetTime) };
      }
    })
  }),

  // Authentication endpoints (sensitive operations)
  auth: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(env.RATE_LIMIT_AUTH, '15 m'),
    analytics: true,
    prefix: 'quillia:auth',
    // Fallback for when Redis is not available
    ...(redis ? {} : {
      async exec(identifier: string) {
        const key = `auth:${identifier}`;
        const now = Date.now();
        const windowMs = 15 * 60 * 1000; // 15 minutes
        
        const current = memoryStore.get(key);
        if (!current || now > current.resetTime) {
          memoryStore.set(key, { count: 1, resetTime: now + windowMs });
          return { success: true, limit: env.RATE_LIMIT_AUTH, remaining: env.RATE_LIMIT_AUTH - 1, reset: new Date(now + windowMs) };
        }
        
        if (current.count >= env.RATE_LIMIT_AUTH) {
          return { success: false, limit: env.RATE_LIMIT_AUTH, remaining: 0, reset: new Date(current.resetTime) };
        }
        
        current.count++;
        return { success: true, limit: env.RATE_LIMIT_AUTH, remaining: env.RATE_LIMIT_AUTH - current.count, reset: new Date(current.resetTime) };
      }
    })
  }),

  // General API endpoints
  general: new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(env.RATE_LIMIT_GENERAL, '1 h'),
    analytics: true,
    prefix: 'quillia:general',
    // Fallback for when Redis is not available
    ...(redis ? {} : {
      async exec(identifier: string) {
        const key = `general:${identifier}`;
        const now = Date.now();
        const windowMs = 60 * 60 * 1000; // 1 hour
        
        const current = memoryStore.get(key);
        if (!current || now > current.resetTime) {
          memoryStore.set(key, { count: 1, resetTime: now + windowMs });
          return { success: true, limit: env.RATE_LIMIT_GENERAL, remaining: env.RATE_LIMIT_GENERAL - 1, reset: new Date(now + windowMs) };
        }
        
        if (current.count >= env.RATE_LIMIT_GENERAL) {
          return { success: false, limit: env.RATE_LIMIT_GENERAL, remaining: 0, reset: new Date(current.resetTime) };
        }
        
        current.count++;
        return { success: true, limit: env.RATE_LIMIT_GENERAL, remaining: env.RATE_LIMIT_GENERAL - current.count, reset: new Date(current.resetTime) };
      }
    })
  })
};

// Helper function to get client identifier
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (for production)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
  
  // For development, use a more permissive identifier
  if (process.env.NODE_ENV === 'development') {
    return `dev:${ip}`;
  }
  
  return ip;
}

// Helper function to get user-based identifier (for authenticated requests)
export function getUserIdentifier(userId: string): string {
  return `user:${userId}`;
}

// Rate limiting middleware wrapper
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string,
  endpoint: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
  try {
    const result = await limiter.limit(identifier);
    
    if (!result.success) {
      console.warn(`Rate limit exceeded for ${endpoint}:`, {
        identifier,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset
      });
    }
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: new Date(result.reset)
    };
  } catch (error) {
    console.error(`Rate limiting error for ${endpoint}:`, error);
    // In case of error, allow the request (fail open)
    return {
      success: true,
      limit: 1000,
      remaining: 999,
      reset: new Date(Date.now() + 3600000)
    };
  }
}

// Convenience functions for different endpoint types
export async function checkAIRateLimit(identifier: string, endpoint: string) {
  return checkRateLimit(rateLimiters.aiGeneration, identifier, endpoint);
}

export async function checkAuthRateLimit(identifier: string, endpoint: string) {
  return checkRateLimit(rateLimiters.auth, identifier, endpoint);
}

export async function checkGeneralRateLimit(identifier: string, endpoint: string) {
  return checkRateLimit(rateLimiters.general, identifier, endpoint);
}

// Subscription-aware rate limiting
export async function checkSubscriptionAwareRateLimit(
  userId: string,
  endpoint: string,
  subscriptionPlan: string = 'free'
): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
  // For AI generation endpoints, we now rely on subscription limits instead of generic rate limits
  // The subscription limits are more granular and user-friendly
  if (endpoint.includes('generate-')) {
    // Return a permissive rate limit since subscription limits handle the real restrictions
    return {
      success: true,
      limit: subscriptionPlan === 'tribute' ? 50 : 20, // Higher limits for tribute users
      remaining: subscriptionPlan === 'tribute' ? 49 : 19,
      reset: new Date(Date.now() + 3600000) // 1 hour from now
    };
  }

  // For other endpoints, use the standard rate limiting
  const identifier = getUserIdentifier(userId);
  return checkRateLimit(rateLimiters.general, identifier, endpoint);
}
