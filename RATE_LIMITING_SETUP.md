# Rate Limiting Setup

This document explains the rate limiting implementation in the Quillia app.

## Overview

Rate limiting has been implemented to protect against spam, abuse, and excessive API usage. The system uses different rate limits for different types of endpoints based on their resource intensity and security requirements.

## Rate Limiting Configuration

### Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Upstash Redis (optional - for production)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Rate limiting settings (requests per time window)
RATE_LIMIT_AI_GENERATION=10    # AI generation requests per hour
RATE_LIMIT_AUTH=5              # Authentication requests per 15 minutes
RATE_LIMIT_GENERAL=100         # General API requests per hour
```

### Rate Limit Types

1. **AI Generation Rate Limit** (10 requests/hour)
   - Story generation (`/api/generate-story`)
   - Image generation (`/api/generate-image`, `/api/generate-image-sd`, etc.)
   - Video generation (`/api/generate-video`)
   - These are the most expensive operations

2. **Authentication Rate Limit** (5 requests/15 minutes)
   - User signup (`/api/auth/signup`)
   - Password reset (`/api/auth/forgot-password`, `/api/auth/reset-password`)
   - These protect against brute force attacks

3. **General API Rate Limit** (100 requests/hour)
   - Entry creation (`/api/entries`)
   - Character creation (`/api/characters`)
   - Other general API operations

## Implementation Details

### Storage Backend

- **Production**: Uses Upstash Redis for distributed rate limiting
- **Development**: Falls back to in-memory storage (resets on server restart)

### Rate Limiting Strategy

- **Sliding Window**: Uses sliding window algorithm for more accurate rate limiting
- **User-based**: Authenticated users are rate limited by user ID
- **IP-based**: Unauthenticated requests are rate limited by IP address
- **Fail Open**: If rate limiting service fails, requests are allowed through

### Response Headers

When rate limited, the API returns:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: When the rate limit resets
- `Retry-After`: Seconds to wait before retrying

## Setting Up Upstash Redis (Optional)

For production deployment, it's recommended to use Upstash Redis:

1. Sign up at [upstash.com](https://upstash.com)
2. Create a Redis database
3. Copy the REST URL and token
4. Add them to your environment variables

Without Redis, the app will use in-memory rate limiting which works fine for development and small deployments.

## Customizing Rate Limits

You can adjust the rate limits by modifying the environment variables:

```bash
# More restrictive for high-traffic apps
RATE_LIMIT_AI_GENERATION=5
RATE_LIMIT_AUTH=3
RATE_LIMIT_GENERAL=50

# More permissive for internal apps
RATE_LIMIT_AI_GENERATION=50
RATE_LIMIT_AUTH=20
RATE_LIMIT_GENERAL=500
```

## Monitoring

Rate limit violations are logged to the console with details about:
- Endpoint that was rate limited
- User/IP that exceeded the limit
- Current usage statistics

## Security Considerations

- Rate limits are applied before authentication to prevent brute force attacks
- Different limits for different endpoint types prevent resource exhaustion
- IP-based limiting for unauthenticated requests
- User-based limiting for authenticated requests
- Graceful degradation when rate limiting service is unavailable
