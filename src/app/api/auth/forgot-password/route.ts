import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail, createPasswordResetEmail } from '@/lib/email-resend';
import { env } from '@/lib/env';
import crypto from 'crypto';
import { checkAuthRateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for password reset attempts
    const identifier = getClientIdentifier(request);
    const rateLimitResult = await checkAuthRateLimit(identifier, 'forgot-password');
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: 'Too many password reset attempts. Please try again later.',
          resetTime: rateLimitResult.reset
        }, 
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'If an account with that email exists, we\'ve sent a password reset link.' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await db.user.update({
      where: { email },
      data: {
        // We'll need to add these fields to the schema
        resetToken,
        resetTokenExpiry,
      }
    });

    // Create reset URL
    const resetUrl = `${env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    console.log('Reset URL:', resetUrl);
    
    // Create email content
    const { html, text } = createPasswordResetEmail(resetUrl, user.name || 'User');
    
    // Send email
    const emailResult = await sendEmail({
      to: email,
      subject: 'Reset Your Password - Quillia',
      html,
      text,
    });

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      // Still return success to user for security (don't reveal if email failed)
    }

    return NextResponse.json(
      { message: 'If an account with that email exists, we\'ve sent a password reset link.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
