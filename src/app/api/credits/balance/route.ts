import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getUserCredits, isLowOnCredits, processDailyRecharge } from '@/lib/credits';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check and process daily recharge if eligible (fallback if cron didn't run)
    const rechargeResult = await processDailyRecharge(session.user.id);
    
    // Get updated credits after potential recharge
    const credits = await getUserCredits(session.user.id);
    const isLow = await isLowOnCredits(session.user.id);

    return NextResponse.json({
      credits,
      isLow,
      recharged: rechargeResult.recharged || false
    });
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit balance' },
      { status: 500 }
    );
  }
}





