import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, createPasswordResetEmail } from '@/lib/email-resend';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create a test email
    const testUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=test-token-123`;
    const { html, text } = createPasswordResetEmail(testUrl, 'Test User');
    
    const result = await sendEmail({
      to: email,
      subject: 'Test Email - Quillia',
      html,
      text,
    });

    if (result.success) {
      return NextResponse.json(
        { message: 'Test email sent successfully!', messageId: result.messageId },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send test email', details: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
