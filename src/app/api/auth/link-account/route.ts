import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Get OAuth data from temporary store
    if (!global.tempOAuthData) {
      return NextResponse.json(
        { error: 'No OAuth data found' },
        { status: 404 }
      );
    }

    const oauthData = global.tempOAuthData.get(token);
    if (!oauthData) {
      return NextResponse.json(
        { error: 'OAuth data expired or not found' },
        { status: 404 }
      );
    }

    // Check if token is expired (10 minutes)
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    if (oauthData.timestamp < tenMinutesAgo) {
      global.tempOAuthData.delete(token);
      return NextResponse.json(
        { error: 'OAuth data expired' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      email: oauthData.email,
      provider: oauthData.provider
    });

  } catch (error) {
    console.error('Error fetching OAuth data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    // Validate input
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Get OAuth data from temporary store
    if (!global.tempOAuthData) {
      return NextResponse.json(
        { error: 'No OAuth data found' },
        { status: 404 }
      );
    }

    const oauthData = global.tempOAuthData.get(token);
    if (!oauthData) {
      return NextResponse.json(
        { error: 'OAuth data expired or not found' },
        { status: 404 }
      );
    }

    // Check if token is expired (10 minutes)
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    if (oauthData.timestamp < tenMinutesAgo) {
      global.tempOAuthData.delete(token);
      return NextResponse.json(
        { error: 'OAuth data expired' },
        { status: 410 }
      );
    }

    // Find the existing user
    const existingUser = await db.user.findUnique({
      where: { email: oauthData.email }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      );
    }

    if (!existingUser.password) {
      return NextResponse.json(
        { error: 'This account cannot be linked (no password set)' },
        { status: 400 }
      );
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!existingUser.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email address before linking accounts' },
        { status: 400 }
      );
    }

    // Check if OAuth account is already linked
    const existingAccount = await db.account.findFirst({
      where: {
        userId: existingUser.id,
        provider: oauthData.provider,
      }
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: 'This account is already linked to a Google account' },
        { status: 400 }
      );
    }

    // Link the OAuth account to the existing user
    await db.account.create({
      data: {
        userId: existingUser.id,
        type: oauthData.type,
        provider: oauthData.provider,
        providerAccountId: oauthData.providerAccountId,
        access_token: oauthData.access_token,
        refresh_token: oauthData.refresh_token,
        expires_at: oauthData.expires_at,
        token_type: oauthData.token_type,
        scope: oauthData.scope,
        id_token: oauthData.id_token,
        session_state: oauthData.session_state,
      }
    });

    // Clean up the temporary token
    global.tempOAuthData.delete(token);

    return NextResponse.json({
      success: true,
      message: 'Account successfully linked! You can now sign in with Google.',
      redirectTo: '/auth/signin'
    });

  } catch (error) {
    console.error('Account linking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
