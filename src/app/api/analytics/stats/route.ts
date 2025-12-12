import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

const ADMIN_EMAILS = ['admin@quillia.app', 'gabrielonicala@gmail.com', 'contact@quillia.app', 'test@gmail.com'];

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get time range from query params (default to 30d)
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '30d';

    // Get date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const last24Hours = new Date(now);
    last24Hours.setHours(last24Hours.getHours() - 24);

    // Determine the filter date based on time range
    let filterDate: Date;
    if (timeRange === '24h') {
      filterDate = last24Hours;
    } else if (timeRange === '7d') {
      filterDate = weekAgo;
    } else {
      filterDate = monthAgo;
    }

    // Get total views
    const totalViews = await db.pageView.count();

    // Get views today
    const viewsToday = await db.pageView.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    // Get views this week
    const viewsThisWeek = await db.pageView.count({
      where: {
        createdAt: {
          gte: weekAgo,
        },
      },
    });

    // Get views this month
    const viewsThisMonth = await db.pageView.count({
      where: {
        createdAt: {
          gte: monthAgo,
        },
      },
    });

    // Get top pages (filtered by time range)
    const topPages = await db.pageView.groupBy({
      by: ['path'],
      where: {
        createdAt: {
          gte: filterDate,
        },
      },
      _count: {
        path: true,
      },
      orderBy: {
        _count: {
          path: 'desc',
        },
      },
      take: 10,
    });

    // Get daily views for the last 7 days using Prisma
    const allViewsLastWeek = await db.pageView.findMany({
      where: {
        createdAt: {
          gte: weekAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Group by date
    const dailyViewsMap = new Map<string, number>();
    allViewsLastWeek.forEach(view => {
      const date = new Date(view.createdAt).toISOString().split('T')[0];
      dailyViewsMap.set(date, (dailyViewsMap.get(date) || 0) + 1);
    });

    const dailyViews = Array.from(dailyViewsMap.entries())
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get hourly views for today using Prisma
    const allViewsToday = await db.pageView.findMany({
      where: {
        createdAt: {
          gte: today,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Group by hour
    const hourlyViewsMap = new Map<number, number>();
    allViewsToday.forEach(view => {
      const hour = new Date(view.createdAt).getHours();
      hourlyViewsMap.set(hour, (hourlyViewsMap.get(hour) || 0) + 1);
    });

    const hourlyViews = Array.from(hourlyViewsMap.entries())
      .map(([hour, views]) => ({ hour, views }))
      .sort((a, b) => a.hour - b.hour);

    // Get views for last 24 hours (by hour)
    const viewsLast24Hours = await db.pageView.findMany({
      where: {
        createdAt: {
          gte: last24Hours,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Group by hour for last 24 hours - use hour+date as key to avoid wrap-around issues
    const hourly24Map = new Map<string, number>();
    viewsLast24Hours.forEach(view => {
      const viewDate = new Date(view.createdAt);
      const key = `${viewDate.toISOString().split('T')[0]}-${viewDate.getHours()}`;
      hourly24Map.set(key, (hourly24Map.get(key) || 0) + 1);
    });
    
    // Fill in all 24 hours in chronological order (from 24h ago to now)
    const hourly24Data: Array<{ hour: number; views: number }> = [];
    for (let i = 23; i >= 0; i--) {
      const hourDate = new Date(now);
      hourDate.setHours(hourDate.getHours() - i);
      const hour = hourDate.getHours();
      const key = `${hourDate.toISOString().split('T')[0]}-${hour}`;
      hourly24Data.push({
        hour,
        views: hourly24Map.get(key) || 0,
      });
    }

    // Get views for last 30 days (by day)
    const viewsLast30Days = await db.pageView.findMany({
      where: {
        createdAt: {
          gte: monthAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Group by date for last 30 days
    const daily30Map = new Map<string, number>();
    viewsLast30Days.forEach(view => {
      const date = new Date(view.createdAt).toISOString().split('T')[0];
      daily30Map.set(date, (daily30Map.get(date) || 0) + 1);
    });

    // Fill in all 30 days (even if no data)
    const daily30Data: Array<{ date: string; views: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      daily30Data.push({
        date: dateStr,
        views: daily30Map.get(dateStr) || 0,
      });
    }

    // Get detailed views for breakdowns (filtered by time range)
    // Using findMany and grouping in JavaScript to avoid Prisma client sync issues
    let detailedViews: Array<{
      deviceType: string | null;
      browser: string | null;
      referrerSource: string | null;
      country: string | null;
    }> = [];
    
    try {
      detailedViews = await db.pageView.findMany({
        where: {
          createdAt: {
            gte: filterDate,
          },
        },
        select: {
          deviceType: true,
          browser: true,
          referrerSource: true,
          country: true,
        },
      });
    } catch (error) {
      // If Prisma client hasn't been regenerated, fields won't exist yet
      // Return empty arrays - data will appear after restarting dev server
      console.warn('New analytics fields not available yet. Restart dev server to regenerate Prisma client.');
    }

    // Group by device type
    const deviceMap = new Map<string, number>();
    detailedViews.forEach(view => {
      if (view.deviceType) {
        deviceMap.set(view.deviceType, (deviceMap.get(view.deviceType) || 0) + 1);
      }
    });
    const deviceBreakdown = Array.from(deviceMap.entries())
      .map(([device, views]) => ({ device, views }))
      .sort((a, b) => b.views - a.views);

    // Group by browser
    const browserMap = new Map<string, number>();
    detailedViews.forEach(view => {
      if (view.browser) {
        browserMap.set(view.browser, (browserMap.get(view.browser) || 0) + 1);
      }
    });
    const browserBreakdown = Array.from(browserMap.entries())
      .map(([browser, views]) => ({ browser, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Group by referrer source
    const referrerMap = new Map<string, number>();
    detailedViews.forEach(view => {
      if (view.referrerSource) {
        referrerMap.set(view.referrerSource, (referrerMap.get(view.referrerSource) || 0) + 1);
      }
    });
    const referrerBreakdown = Array.from(referrerMap.entries())
      .map(([source, views]) => ({ source, views }))
      .sort((a, b) => b.views - a.views);

    // Group by country
    const countryMap = new Map<string, number>();
    detailedViews.forEach(view => {
      if (view.country) {
        countryMap.set(view.country, (countryMap.get(view.country) || 0) + 1);
      }
    });
    const countryBreakdown = Array.from(countryMap.entries())
      .map(([country, views]) => ({ country, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 15);

    return NextResponse.json({
      totalViews,
      viewsToday,
      viewsThisWeek,
      viewsThisMonth,
      timeRange, // Return the active time range
      topPages: topPages.map(p => ({
        path: p.path,
        views: p._count.path,
      })),
      dailyViews,
      hourlyViews,
      hourly24Data,
      daily30Data,
      deviceBreakdown,
      browserBreakdown,
      referrerBreakdown,
      countryBreakdown,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

