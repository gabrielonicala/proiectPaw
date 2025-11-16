import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { saveEntryToDatabase, loadEntriesFromDatabase } from '@/lib/server-utils';
import { createErrorResponse } from '@/lib/error-utils';
import { validateUserSession } from '@/lib/auth';
import { canCreateEntry, incrementDailyUsage } from '@/lib/daily-usage';
import { db } from '@/lib/db';

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

    // Parse query parameters for optional filtering
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const characterIdParam = searchParams.get('characterId');

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;
    const characterId = characterIdParam || undefined;

    // Validate dates if provided
    if (startDate && isNaN(startDate.getTime())) {
      return NextResponse.json({ error: 'Invalid startDate format' }, { status: 400 });
    }
    if (endDate && isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Invalid endDate format' }, { status: 400 });
    }

    const entries = await loadEntriesFromDatabase(userId, {
      startDate,
      endDate,
      characterId,
    });
    return NextResponse.json({ entries });
  } catch (error) {
    // If it's a "User account deleted" error, return a special response for auto-logout
    if (error instanceof Error && error.message === 'USER_ACCOUNT_DELETED') {
      return NextResponse.json({ 
        error: 'Your account has been deleted. You will be signed out automatically.',
        code: 'USER_ACCOUNT_DELETED',
        autoLogout: true
      }, { status: 401 });
    }
    
    const errorResponse = createErrorResponse(error, 'GET /api/entries', 500);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { originalText, reimaginedText, imageUrl, videoUrl, outputType, characterId, pastContext } = body;

    if (!originalText || !outputType || !characterId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user with timezone and subscription plan
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        timezone: true,
        subscriptionPlan: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userTimezone = user.timezone || 'UTC';
    const subscriptionPlan = user.subscriptionPlan || 'free';

    // Check if user can create this type of entry (using new DailyUsage system)
    const type = outputType === 'text' ? 'chapters' : 'scenes';
    const canCreate = await canCreateEntry(userId, type, userTimezone, subscriptionPlan);

    if (!canCreate.allowed) {
      return NextResponse.json(
        { 
          error: `Daily limit reached. You've used all ${canCreate.limit} ${type} for today.`,
          limitReached: true,
          remaining: canCreate.remaining,
          limit: canCreate.limit
        },
        { status: 403 }
      );
    }

    // Create the entry
    const entry = await saveEntryToDatabase({
      userId,
      originalText,
      reimaginedText,
      imageUrl,
      videoUrl,
      outputType,
      characterId,
      pastContext,
    });

    // Increment daily usage counter (this is the key - tracks independently of entries)
    await incrementDailyUsage(userId, type, userTimezone);

    return NextResponse.json({ entry });
  } catch (error) {
    // If it's a "User account deleted" error, return a special response for auto-logout
    if (error instanceof Error && error.message === 'USER_ACCOUNT_DELETED') {
      return NextResponse.json({ 
        error: 'Your account has been deleted. You will be signed out automatically.',
        code: 'USER_ACCOUNT_DELETED',
        autoLogout: true
      }, { status: 401 });
    }
    
    const errorResponse = createErrorResponse(error, 'POST /api/entries', 500);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
