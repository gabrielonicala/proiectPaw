import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { sendEmail, createEmailVerificationEmail } from '@/lib/email-resend';
import { env } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {

    const { username, email, password, timezone } = await request.json();

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
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

    // Check if user already exists by email
    const existingUserByEmail = await db.user.findUnique({
      where: { email }
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUserByUsername = await db.user.findUnique({
      where: { username }
    });

    if (existingUserByUsername) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Validate timezone (must be valid IANA timezone string, default to UTC)
    // Only accept timezone on signup - it will be locked after that
    const validTimezone = timezone && typeof timezone === 'string' && timezone.length > 0
      ? timezone
      : 'UTC';

    // Create user with premium plan for testing
    const user = await db.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpiry,
        timezone: validTimezone, // Set once on signup, locked forever
        // New users start with free plan
        subscriptionPlan: 'free',
        subscriptionStatus: 'free',
        characterSlots: 1, // Free plan gets 1 character slot
        subscriptionEndsAt: null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      }
    });

    // Send verification email
    const verificationUrl = `${env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;
    const { html, text } = createEmailVerificationEmail(verificationUrl, username);
    
    const emailResult = await sendEmail({
      to: email,
      subject: 'Verify Your Email - Quillia',
      html,
      text,
    });

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Don't fail the signup if email fails, but log it
    }

    return NextResponse.json(
      { 
        message: 'User created successfully. Please check your email to verify your account.',
        user,
        emailSent: emailResult.success
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
