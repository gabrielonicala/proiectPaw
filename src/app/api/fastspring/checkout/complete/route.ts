import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * Log that a user has completed checkout
 * This provides server-side logging for checkout completion events
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session as { user: { id: string } }).user.id;
    const body = await request.json().catch(() => ({}));
    const { packageKey, purchaseType } = body;
    
    console.log('✅ Checkout finished for user:', userId);
    if (packageKey) {
      console.log(`   Package: ${packageKey}`);
    }
    if (purchaseType) {
      console.log(`   Type: ${purchaseType}`);
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Checkout completion logged'
    });

  } catch (error) {
    console.error('Error logging checkout completion:', error);
    return NextResponse.json(
      { error: 'Failed to log checkout completion' },
      { status: 500 }
    );
  }
}

