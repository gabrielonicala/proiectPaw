import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { canPurchaseStarterKit } from '@/lib/credits';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eligible = await canPurchaseStarterKit(session.user.id);

    return NextResponse.json({
      eligible
    });
  } catch (error) {
    console.error('Error checking starter kit eligibility:', error);
    return NextResponse.json(
      { error: 'Failed to check starter kit eligibility' },
      { status: 500 }
    );
  }
}





