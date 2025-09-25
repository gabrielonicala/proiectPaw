// Server-side environment configuration
// This file should only be imported on the server side

// Environment configuration with secure defaults
export const env = {
  // Database - require in production, allow fallback for development
  DATABASE_URL: process.env.DATABASE_URL,
  
  // Authentication - require in production
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  
  // Email - require in production
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'Quillia <noreply@resend.dev>',
  
  // SMTP Configuration for Namecheap email
  SMTP_USERNAME: process.env.SMTP_USERNAME,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || 'Quillia <contact@quillia.app>',
  
  // AI Services - optional but recommended
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  RUNWAY_API_KEY: process.env.RUNWAY_API_KEY,
  REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
  
  // Rate limiting configuration - optional
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  
  // Rate limiting settings (requests per time window)
  RATE_LIMIT_AI_GENERATION: parseInt(process.env.RATE_LIMIT_AI_GENERATION || '20'), // per hour
  RATE_LIMIT_AUTH: parseInt(process.env.RATE_LIMIT_AUTH || '5'), // per 15 minutes
  RATE_LIMIT_GENERAL: parseInt(process.env.RATE_LIMIT_GENERAL || '100'), // per hour
};

// Environment validation for production
if (typeof window === 'undefined') {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Check for required environment variables in production
  if (isProduction) {
    const requiredVars = [
      'NEXTAUTH_SECRET',
      'RESEND_API_KEY',
      'DATABASE_URL'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables in production:', missingVars);
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }
  
  // Log environment status
  console.log('Environment loaded:', {
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: env.DATABASE_URL ? 'Found' : 'Missing',
    NEXTAUTH_URL: env.NEXTAUTH_URL ? 'Found' : 'Missing',
    NEXTAUTH_SECRET: env.NEXTAUTH_SECRET ? 'Found' : 'Missing',
    RESEND_API_KEY: env.RESEND_API_KEY ? 'Found' : 'Missing',
    OPENAI_API_KEY: env.OPENAI_API_KEY ? 'Found' : 'Missing',
  });
}
