import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { cleanupExpiredSubscriptions } from '@/lib/character-access';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session as { user: { id: string } }).user.id;
    
    console.log('🧪 Manual cleanup test triggered by user:', userId);
    
    // Get user's current state before cleanup
    const userBefore = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        characterSlots: true,
        activeCharacterId: true
      }
    });
    
    console.log('📊 User state BEFORE cleanup:', userBefore);
    
    // Run cleanup
    await cleanupExpiredSubscriptions();
    
    // Get user's state after cleanup
    const userAfter = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        characterSlots: true,
        activeCharacterId: true
      }
    });
    
    console.log('📊 User state AFTER cleanup:', userAfter);
    
    return NextResponse.json({ 
      success: true,
      before: userBefore,
      after: userAfter,
      message: 'Cleanup test completed - check server logs for details'
    });

  } catch (error) {
    console.error('Error during cleanup test:', error);
    return NextResponse.json(
      { error: 'Failed to run cleanup test' },
      { status: 500 }
    );
  }
}















