import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await request.json();

    // Validate input
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Username validation
    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    // Check if username already exists (excluding current user)
    const existingUser = await db.user.findFirst({
      where: { 
        username,
        id: { not: (session as { user: { id: string } }).user.id }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 }
      );
    }

    // Update username
    const updatedUser = await db.user.update({
      where: { id: (session as { user: { id: string } }).user.id },
      data: { username },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      }
    });

    return NextResponse.json(
      { 
        message: 'Username updated successfully',
        user: updatedUser 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Change username error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
