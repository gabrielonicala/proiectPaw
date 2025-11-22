import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  // Add request ID to headers for tracing
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);
  
  // Log the incoming request
  logger.apiRequest(
    request.method,
    request.nextUrl.pathname,
    undefined, // userId - will be available in API routes
    requestId
  );
  
  // Note: Page view tracking is now handled by PageViewTracker component
  // which calls /api/analytics/track. This is because middleware runs
  // on Edge Runtime which doesn't support Prisma/Node.js database connections.
  
  // Create response with request ID header
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  // Add request ID to response headers
  response.headers.set('x-request-id', requestId);
  
  // Log response when it's ready
  response.headers.set('x-response-time', `${Date.now() - startTime}ms`);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
