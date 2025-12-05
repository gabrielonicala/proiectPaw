import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * Mark that a user has started checkout
 * This creates a temporary database record that webhooks can use to link account IDs
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session as { user: { id: string } }).user.id;
    
    // Delete any existing pending checkout for this user
    await db.pendingCheckout.deleteMany({
      where: { userId }
    });
    
    // Create new pending checkout record
    await db.pendingCheckout.create({
      data: { userId }
    });
    
    console.log('✅ Checkout started for user:', userId);
    
    return NextResponse.json({ 
      success: true,
      message: 'Checkout started'
    });

  } catch (error) {
    console.error('Error in checkout start:', error);
    return NextResponse.json(
      { error: 'Failed to start checkout' },
      { status: 500 }
    );
  }
}

