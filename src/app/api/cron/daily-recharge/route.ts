import { NextRequest, NextResponse } from 'next/server';
import { processDailyRechargeForAllUsers } from '@/lib/credits';

/**
 * POST /api/cron/daily-recharge
 * 
 * Cron job endpoint to process daily recharge for all eligible users.
 * This should be called once per day (e.g., via Vercel Cron or external cron service).
 * 
 * Security: You can add authentication here if needed (e.g., check for a secret token)
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication/authorization check
    // For example, check for a secret token in headers or query params
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Also allow Vercel Cron requests (they include a special header)
      const vercelCron = request.headers.get('x-vercel-cron');
      if (!vercelCron) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    console.log('🔄 Starting daily recharge process for all users...');
    
    const result = await processDailyRechargeForAllUsers();

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Failed to process daily recharge',
          ...result
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Daily recharge completed: ${result.rechargedUsers}/${result.totalUsers} users recharged`,
      ...result
    });

  } catch (error) {
    console.error('Error in daily recharge cron job:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Also support POST for external cron services
export async function POST(request: NextRequest) {
  return GET(request);
}

