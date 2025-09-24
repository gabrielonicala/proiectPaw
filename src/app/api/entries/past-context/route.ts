import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { loadEntriesFromDatabase } from '@/lib/server-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '3');

    const entries = await loadEntriesFromDatabase((session as { user: { id: string } }).user.id);
    const pastContext = entries.slice(0, limit).map(entry => entry.originalText);

    return NextResponse.json({ pastContext });
  } catch (error) {
    console.error('Error fetching past context:', error);
    return NextResponse.json({ error: 'Failed to fetch past context' }, { status: 500 });
  }
}
