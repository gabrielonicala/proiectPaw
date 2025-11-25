import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getSubscriptionLimits } from '@/lib/subscription-limits';
import { validateUserSession } from '@/lib/auth';
import { getDailyUsageWithLimits, cleanupOldDailyUsage } from '@/lib/daily-usage';

// Simple in-memory cache to track last cleanup time (prevents running cleanup on every request)
let lastCleanupTime: number = 0;
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session as { user: { id: string } }).user.id;
    
    // Validate that the user still exists in the database
    const userExists = await validateUserSession(userId);
    if (!userExists) {
      return NextResponse.json({ 
        error: 'Your account has been deleted. You will be signed out automatically.',
        code: 'USER_ACCOUNT_DELETED',
        autoLogout: true
      }, { status: 401 });
    }

    // Get user with timezone and subscription info
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        timezone: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userTimezone = user.timezone || 'UTC';

    // Run cleanup periodically (once per day) to prevent table growth
    // This runs in the background and doesn't block the response
    const now = Date.now();
    if (now - lastCleanupTime > CLEANUP_INTERVAL) {
      lastCleanupTime = now;
      // Run cleanup asynchronously (don't await - let it run in background)
      cleanupOldDailyUsage(30).catch(err => {
        console.error('Error during automatic daily usage cleanup:', err);
      });
    }

    // Get daily usage from DailyUsage table (not counting entries)
    // Pass full user object to check premium access properly
    const usageData = await getDailyUsageWithLimits(userId, userTimezone, {
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEndsAt: user.subscriptionEndsAt,
    });

    // Get subscription limits for plan info
    const subscriptionLimits = await getSubscriptionLimits(userId);

    return NextResponse.json({
      usage: {
        chapters: {
          used: usageData.chapters,
          limit: usageData.chaptersLimit,
          remaining: Math.max(0, usageData.chaptersLimit - usageData.chapters),
        },
        scenes: {
          used: usageData.scenes,
          limit: usageData.scenesLimit,
          remaining: Math.max(0, usageData.scenesLimit - usageData.scenes),
        },
      },
      limits: {
        plan: subscriptionLimits.plan,
        dailyChapters: usageData.chaptersLimit,
        dailyScenes: usageData.scenesLimit,
      },
      nextResetAt: usageData.nextResetAt, // For countdown timer
    });

  } catch (error) {
    console.error('Error fetching daily usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
