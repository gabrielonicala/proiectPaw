import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getSubscriptionLimits } from '@/lib/subscription-limits';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limits = await getSubscriptionLimits(session.user.id);
    
    return NextResponse.json(limits);
  } catch (error) {
    console.error('Error fetching subscription limits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription limits' },
      { status: 500 }
    );
  }
}
