import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { cleanupExpiredSubscriptions } from '@/lib/character-access';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, allow any authenticated user to run cleanup
    // In production, you might want to restrict this to admin users only
    console.log('🧹 Manual subscription cleanup triggered by user:', (session as { user: { id: string } }).user.id);
    
    await cleanupExpiredSubscriptions();
    
    return NextResponse.json({ 
      success: true,
      message: 'Subscription cleanup completed successfully'
    });

  } catch (error) {
    console.error('Error during manual subscription cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup subscriptions' },
      { status: 500 }
    );
  }
}
















