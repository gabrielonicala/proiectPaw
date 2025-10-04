import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, type } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Basic rate limiting check (you can enhance this with Redis or similar)
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    // Log the contact form submission (in production, you'd send this to your email service)
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      type,
      message: message.substring(0, 100) + '...', // Log only first 100 chars
      ip: clientIP,
      timestamp: new Date().toISOString()
    });

    // In a real application, you would:
    // 1. Send email using your email service (Resend, SendGrid, etc.)
    // 2. Store the message in your database
    // 3. Send confirmation email to the user
    
    // For now, we'll just return success
    return NextResponse.json(
      { 
        success: true, 
        message: 'Your message has been received. We\'ll get back to you soon!' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
