import { NextRequest, NextResponse } from 'next/server';
import { checkGeneralRateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting test endpoint
    const identifier = getClientIdentifier(request);
    const rateLimitResult = await checkGeneralRateLimit(identifier, 'test-rate-limit');
    
    return NextResponse.json({
      success: rateLimitResult.success,
      limit: rateLimitResult.limit,
      remaining: rateLimitResult.remaining,
      reset: rateLimitResult.reset,
      identifier: identifier.replace(/^.*:/, '***:') // Mask sensitive parts
    }, {
      headers: {
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.reset instanceof Date ? rateLimitResult.reset.toISOString() : new Date(rateLimitResult.reset).toISOString(),
      }
    });
  } catch (error) {
    console.error('Rate limit test error:', error);
    return NextResponse.json(
      { error: 'Rate limit test failed' },
      { status: 500 }
    );
  }
}
