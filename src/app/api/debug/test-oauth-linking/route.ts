import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all users and their linked accounts
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        emailVerified: true,
        subscriptionPlan: true,
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
            type: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified,
        subscriptionPlan: user.subscriptionPlan,
        linkedAccounts: user.accounts.map(account => ({
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          type: account.type,
        }))
      }))
    });

  } catch (error) {
    console.error('Error fetching user account data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user account data' },
      { status: 500 }
    );
  }
}
