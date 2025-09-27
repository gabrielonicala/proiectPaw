import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getSubscriptionLimits, USE_SHARED_LIMITS } from '@/lib/subscription-limits';
import { validateUserSession } from '@/lib/auth';

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

    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');

    // Get subscription limits
    const subscriptionLimits = await getSubscriptionLimits(userId);

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Count today's entries by type
    // For tribute users: per-character if USE_SHARED_LIMITS is false, shared if true
    // For free users: always shared across all characters
    const whereClause = subscriptionLimits.isActive && characterId && !USE_SHARED_LIMITS
      ? {
          userId,
          characterId, // Per character for tribute users (when not using shared limits)
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        }
      : {
          userId,
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        };

    const [chapterCount, sceneCount] = await Promise.all([
      db.journalEntry.count({
        where: {
          ...whereClause,
          outputType: 'text',
        },
      }),
      db.journalEntry.count({
        where: {
          ...whereClause,
          outputType: 'image',
        },
      }),
    ]);

    return NextResponse.json({
      usage: {
        chapters: {
          used: chapterCount,
          limit: subscriptionLimits.limits.dailyChapters,
          remaining: Math.max(0, subscriptionLimits.limits.dailyChapters - chapterCount),
        },
        scenes: {
          used: sceneCount,
          limit: subscriptionLimits.limits.dailyScenes,
          remaining: Math.max(0, subscriptionLimits.limits.dailyScenes - sceneCount),
        },
      },
      limits: {
        plan: subscriptionLimits.plan,
        dailyChapters: subscriptionLimits.limits.dailyChapters,
        dailyScenes: subscriptionLimits.limits.dailyScenes,
      },
    });

  } catch (error) {
    console.error('Error fetching daily usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
