import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connectivity
    await db.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - startTime;
    
    // Check environment variables
    const envStatus = {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
    };
    
    const allRequiredEnvVars = Object.values(envStatus).every(Boolean);
    
    // Get basic system info
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
    
    const healthStatus = {
      status: 'healthy',
      checks: {
        database: {
          status: 'healthy',
          latency: `${dbLatency}ms`,
        },
        environment: {
          status: allRequiredEnvVars ? 'healthy' : 'degraded',
          variables: envStatus,
        },
        system: systemInfo,
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
    
    return NextResponse.json(healthStatus, { 
      status: allRequiredEnvVars ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    
  } catch (error) {
    const errorResponse = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Database connection failed',
        },
      },
    };
    
    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  }
}

// Allow HEAD requests for simple health checks
export async function HEAD() {
  try {
    await db.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
