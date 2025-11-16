import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * PUT /api/user/timezone
 * Allows updating timezone ONLY if current timezone is UTC (one-time update for Google OAuth users)
 * After first update, timezone is locked forever
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session as { user: { id: string } }).user.id;
    const { timezone } = await request.json();

    // Validate timezone input
    if (!timezone || typeof timezone !== 'string' || timezone.length === 0) {
      return NextResponse.json(
        { error: 'Valid timezone is required' },
        { status: 400 }
      );
    }

    // Get current user
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { timezone: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // SECURITY: Only allow update if current timezone is UTC
    // This ensures it can only be set once (for Google OAuth users)
    if (user.timezone && user.timezone !== 'UTC') {
      return NextResponse.json(
        { error: 'Timezone has already been set and cannot be changed' },
        { status: 403 }
      );
    }

    // Validate timezone format (basic check - should be IANA timezone string)
    // We'll do a simple validation - timezone should contain letters, numbers, slashes, underscores, hyphens
    if (!/^[A-Za-z0-9_\/\-]+$/.test(timezone)) {
      return NextResponse.json(
        { error: 'Invalid timezone format' },
        { status: 400 }
      );
    }

    // Update timezone (only allowed if currently UTC)
    await db.user.update({
      where: { id: userId },
      data: { timezone }
    });

    return NextResponse.json({
      success: true,
      message: 'Timezone updated successfully',
      timezone
    });

  } catch (error) {
    console.error('Error updating timezone:', error);
    return NextResponse.json(
      { error: 'Failed to update timezone' },
      { status: 500 }
    );
  }
}

