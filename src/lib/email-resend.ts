import { Resend } from 'resend';
import { env } from './env';

// Initialize Resend
console.log('RESEND_API_KEY: Found');
if (env.RESEND_API_KEY) {
  console.log('API Key value:', `${env.RESEND_API_KEY.substring(0, 10)}...`);
}

const resend = new Resend(env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Quillia <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent via Resend:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function createPasswordResetEmail(resetUrl: string, userName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - Quillia</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
          background: white;
          border-radius: 10px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 10px;
        }
        .title {
          font-size: 24px;
          color: #333;
          margin-bottom: 20px;
        }
        .content {
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
        }
        .button:hover {
          opacity: 0.9;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          font-size: 14px;
          color: #666;
          text-align: center;
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
          color: #856404;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">✨ Quillia</div>
          <h1 class="title">Reset Your Password</h1>
        </div>
        
        <div class="content">
          <p>Hello ${userName || 'there'},</p>
          
          <p>We received a request to reset your password for your Quillia account. If you made this request, click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset My Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">
            ${resetUrl}
          </p>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons. If you didn't request this password reset, you can safely ignore this email.
          </div>
        </div>
        
        <div class="footer">
          <p>This email was sent from Quillia - Transform Your Day Into Adventure</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Reset Your Password - Quillia

Hello ${userName || 'there'},

We received a request to reset your password for your Quillia account. If you made this request, click the link below to reset your password:

${resetUrl}

This link will expire in 1 hour for security reasons. If you didn't request this password reset, you can safely ignore this email.

---
Quillia - Transform Your Day Into Adventure
  `;

  return { html, text };
}
