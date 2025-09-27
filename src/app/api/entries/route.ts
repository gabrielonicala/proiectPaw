import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { saveEntryToDatabase, loadEntriesFromDatabase } from '@/lib/server-utils';
import { createErrorResponse } from '@/lib/error-utils';
import { validateUserSession } from '@/lib/auth';

export async function GET() {
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

    const entries = await loadEntriesFromDatabase(userId);
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
