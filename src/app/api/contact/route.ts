import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, createContactFormSubmissionEmail, createContactFormConfirmationEmail } from '@/lib/email-resend';
import { env } from '@/lib/env';

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
    
    // Log the contact form submission
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      type,
      message: message.substring(0, 100) + '...', // Log only first 100 chars
      ip: clientIP,
      timestamp: new Date().toISOString()
    });

    // Validate CONTACT_EMAIL is set
    if (!env.CONTACT_EMAIL) {
      console.error('ERROR: CONTACT_EMAIL is not set in environment variables');
      return NextResponse.json(
        { error: 'Contact email not configured' },
        { status: 500 }
      );
    }

    // Extract email address from formatted string if needed (e.g., "Contact <email@domain.com>" -> "email@domain.com")
    let contactEmail = env.CONTACT_EMAIL.trim();
    if (contactEmail.includes('<') && contactEmail.includes('>')) {
      const match = contactEmail.match(/<([^>]+)>/);
      if (match && match[1]) {
        contactEmail = match[1].trim();
        console.log('Extracted email from formatted string:', contactEmail);
      }
    }

    // Validate extracted email format
    if (!emailRegex.test(contactEmail)) {
      console.error('ERROR: CONTACT_EMAIL is not a valid email address:', contactEmail);
      return NextResponse.json(
        { error: 'Contact email configuration is invalid' },
        { status: 500 }
      );
    }

    // Send email to team with the contact form submission
    const { html: submissionHtml, text: submissionText } = createContactFormSubmissionEmail(
      name,
      email,
      subject,
      message,
      type || 'general'
    );

    console.log('Sending team email to:', contactEmail);
    const teamEmailResult = await sendEmail({
      to: contactEmail,
      subject: `New Contact Form: ${subject}`,
      html: submissionHtml,
      text: submissionText,
    });

    if (!teamEmailResult.success) {
      console.error('Failed to send contact form submission email:', teamEmailResult.error);
      // Don't fail the request if email fails, but log it
    }

    // Send confirmation email to the user
    const { html: confirmationHtml, text: confirmationText } = createContactFormConfirmationEmail(
      name,
      subject
    );

    const userEmailResult = await sendEmail({
      to: email,
      subject: 'We Received Your Message - Quillia',
      html: confirmationHtml,
      text: confirmationText,
    });

    if (!userEmailResult.success) {
      console.error('Failed to send confirmation email:', userEmailResult.error);
      // Don't fail the request if email fails, but log it
    }

    // In the future, you could also:
    // - Store the message in your database for tracking
    // - Add more sophisticated rate limiting
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Your message has been received. We\'ll get back to you soon!',
        emailSent: teamEmailResult.success && userEmailResult.success
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
