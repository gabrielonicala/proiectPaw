import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/username and password are required' },
        { status: 400 }
      );
    }

    // Find user by email or username
    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    // Check email verification
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'EMAIL_NOT_VERIFIED' },
        { status: 401 }
      );
    }

    // All checks passed
    return NextResponse.json(
      { success: true, message: 'Credentials are valid' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Verification check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
