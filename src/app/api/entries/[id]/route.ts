import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { deleteEntryFromDatabase } from '@/lib/server-utils';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    await deleteEntryFromDatabase(id, (session as { user: { id: string } }).user.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
