import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ 
        error: 'No session found',
        debug: {
          hasSession: false,
          sessionData: null
        }
      }, { status: 401 });
    }

    const userId = (session as { user: { id: string } })?.user?.id;
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'No user ID in session',
        debug: {
          hasSession: true,
          hasUserId: false,
          sessionData: session
        }
      }, { status: 401 });
    }

    // Check if user exists in database
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        characterSlots: true
      }
    });

    const characterCount = await db.character.count({
      where: { userId }
    });

    return NextResponse.json({
      status: 'success',
      debug: {
        hasSession: true,
        hasUserId: true,
        userId: userId,
        userExists: !!user,
        userData: user,
        characterCount: characterCount,
        sessionData: {
          user: session.user,
          expires: (session as any).expires
        }
      }
    });

  } catch (error) {
    console.error('Error in user session debug:', error);
    return NextResponse.json({
      error: 'Internal server error',
      debug: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
}
