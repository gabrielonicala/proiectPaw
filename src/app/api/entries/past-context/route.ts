import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { loadEntriesFromDatabase } from '@/lib/server-utils';
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
    const limit = parseInt(searchParams.get('limit') || '3');

    const entries = await loadEntriesFromDatabase(userId);
    const pastContext = entries.slice(0, limit).map(entry => entry.originalText);

    return NextResponse.json({ pastContext });
  } catch (error) {
    // If it's a "User account deleted" error, return a special response for auto-logout
    if (error instanceof Error && error.message === 'USER_ACCOUNT_DELETED') {
      return NextResponse.json({ 
        error: 'Your account has been deleted. You will be signed out automatically.',
        code: 'USER_ACCOUNT_DELETED',
        autoLogout: true
      }, { status: 401 });
    }
    
    console.error('Error fetching past context:', error);
    return NextResponse.json({ error: 'Failed to fetch past context' }, { status: 500 });
  }
}
