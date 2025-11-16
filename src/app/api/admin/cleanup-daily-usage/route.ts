import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { cleanupOldDailyUsage } from '@/lib/daily-usage';

/**
 * POST /api/admin/cleanup-daily-usage
 * Cleans up old DailyUsage records (older than 30 days)
 * Can be called periodically via cron job or scheduled task
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add admin authentication check here if needed
    // For now, we'll allow it to be called by any authenticated user
    // In production, you might want to restrict this to admin users only
    
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get retention days from query param or body (default: 30)
    const { searchParams } = new URL(request.url);
    const retentionDays = parseInt(searchParams.get('days') || '30', 10);

    if (isNaN(retentionDays) || retentionDays < 1) {
      return NextResponse.json(
        { error: 'Invalid retention days. Must be a positive number.' },
        { status: 400 }
      );
    }

    // Clean up old records
    const result = await cleanupOldDailyUsage(retentionDays);

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${result.deleted} old daily usage records`,
      deleted: result.deleted,
      retentionDays
    });

  } catch (error) {
    console.error('Error cleaning up daily usage:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup daily usage records' },
      { status: 500 }
    );
  }
}

