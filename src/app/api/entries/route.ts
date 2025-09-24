import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { saveEntryToDatabase, loadEntriesFromDatabase } from '@/lib/server-utils';
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
