import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { saveEntryToDatabase, loadEntriesFromDatabase } from '@/lib/server-utils';
import { checkGeneralRateLimit, getClientIdentifier, getUserIdentifier } from '@/lib/rate-limit';
import { createErrorResponse } from '@/lib/error-utils';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entries = await loadEntriesFromDatabase((session as { user: { id: string } }).user.id);
    return NextResponse.json({ entries });
  } catch (error) {
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

    // Rate limiting for entry creation
    const identifier = getUserIdentifier(session.user.id);
    const rateLimitResult = await checkGeneralRateLimit(identifier, 'create-entry');
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: 'Too many entry creation requests. Please try again later.',
          resetTime: rateLimitResult.reset
        }, 
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset instanceof Date ? rateLimitResult.reset.toISOString() : new Date(rateLimitResult.reset).toISOString(),
            'Retry-After': Math.ceil(((rateLimitResult.reset instanceof Date ? rateLimitResult.reset.getTime() : rateLimitResult.reset) - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const body = await request.json();
    const { originalText, reimaginedText, imageUrl, videoUrl, outputType, characterId, pastContext } = body;

    if (!originalText || !outputType || !characterId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const entry = await saveEntryToDatabase({
      userId: (session as { user: { id: string } }).user.id,
      originalText,
      reimaginedText,
      imageUrl,
      videoUrl,
      outputType,
      characterId,
      pastContext,
    });

    return NextResponse.json({ entry });
  } catch (error) {
    const errorResponse = createErrorResponse(error, 'POST /api/entries', 500);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
