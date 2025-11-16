import { Resend } from 'resend';
import { env } from './env';

// Helper function to escape HTML to prevent XSS
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

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
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          line-height: 1.6;
          color: #ffffff;
          margin: 0;
          padding: 0;
          background: #000000;
          min-height: 100vh;
        }
        .background {
          position: relative;
          background: #000000;
          min-height: 100vh;
          overflow: hidden;
        }
        .squares {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .square {
          position: absolute;
          width: 20px;
          height: 20px;
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
        }
        .square:nth-child(1) { background: #ff6b6b; top: 10%; left: 10%; animation-delay: 0s; }
        .square:nth-child(2) { background: #4ecdc4; top: 20%; left: 80%; animation-delay: 1s; }
        .square:nth-child(3) { background: #45b7d1; top: 60%; left: 20%; animation-delay: 2s; }
        .square:nth-child(4) { background: #96ceb4; top: 80%; left: 70%; animation-delay: 3s; }
        .square:nth-child(5) { background: #feca57; top: 30%; left: 50%; animation-delay: 4s; }
        .square:nth-child(6) { background: #ff9ff3; top: 70%; left: 90%; animation-delay: 5s; }
        .square:nth-child(7) { background: #54a0ff; top: 40%; left: 5%; animation-delay: 1.5s; }
        .square:nth-child(8) { background: #5f27cd; top: 90%; left: 30%; animation-delay: 2.5s; }
        .square:nth-child(9) { background: #00d2d3; top: 15%; left: 60%; animation-delay: 3.5s; }
        .square:nth-child(10) { background: #ff9f43; top: 50%; left: 85%; animation-delay: 4.5s; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .container {
          position: relative;
          z-index: 10;
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          text-align: center;
        }
        .header {
          margin-bottom: 40px;
        }
        .logo {
          margin-bottom: 20px;
        }
        .logo img {
          width: 120px;
          height: auto;
          max-width: 100%;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        .title {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          font-size: 20px;
          color: #ffffff;
          margin-bottom: 20px;
          font-weight: bold;
          text-shadow: 
            1px 1px 0px rgba(0, 0, 0, 0.8),
            -1px -1px 0px rgba(0, 0, 0, 0.8),
            1px -1px 0px rgba(0, 0, 0, 0.8),
            -1px 1px 0px rgba(0, 0, 0, 0.8);
        }
        .content {
          margin-bottom: 40px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          padding: 30px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .content p {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          color: #e0e0e0;
          font-size: 14px;
          margin-bottom: 20px;
          font-weight: normal;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
          color: white;
          padding: 18px 40px;
          text-decoration: none;
          border-radius: 8px;
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          font-weight: bold;
          font-size: 12px;
          text-align: center;
          margin: 30px 0;
          box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4);
        }
        .link-box {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .link-box p {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          color: #b0b0b0;
          font-size: 12px;
          margin-bottom: 10px;
        }
        .link-text {
          word-break: break-all;
          background: rgba(0, 0, 0, 0.3);
          padding: 15px;
          border-radius: 8px;
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          color: #4ecdc4;
          font-size: 8px;
          border: 1px solid rgba(78, 205, 196, 0.3);
        }
        .warning {
          background: rgba(255, 193, 7, 0.1);
          border: 1px solid rgba(255, 193, 7, 0.3);
          border-radius: 10px;
          padding: 20px;
          margin: 30px 0;
          color: #ffc107;
        }
        .warning strong {
          color: #ffeb3b;
        }
        .footer {
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 12px;
          color: #888;
          text-align: center;
        }
        .footer p {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          margin: 5px 0;
        }
        .security-text {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          font-style: italic;
          color: #ff6b6b;
          font-size: 14px;
          margin: 20px 0;
          font-weight: normal;
        }
      </style>
    </head>
    <body>
      <div class="background">
        <div class="squares">
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
        </div>
        
        <div class="container">
          <div class="header">
            <div class="logo">
              <img src="https://quillia.app/logo.png" alt="Quillia" />
            </div>
            <h1 class="title">RESET PASSWORD</h1>
            <p class="security-text">Secure your adventure...</p>
          </div>
          
          <div class="content">
            <p>Hello <strong>adventurer</strong>!</p>
            
            <p>We received a request to reset your password for your Quillia account. If you made this request, click the button below to create a new password and secure your adventure:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">🔑 RESET PASSWORD</a>
            </div>
            
            <div class="link-box">
              <p>Or copy and paste this secure link into your browser:</p>
              <div class="link-text">${resetUrl}</div>
            </div>
            
            <div class="warning">
              <strong>⚡ Important:</strong> This link will expire in 1 hour for security reasons. If you didn't request this password reset, you can safely ignore this email.
            </div>
          </div>
          
          <div class="footer">
            <p>This email was sent from Quillia - Transform Your Days Into Adventures</p>
            <p>Keep your adventure secure! 🛡️</p>
          </div>
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

export function createEmailVerificationEmail(verificationUrl: string, userName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - Quillia</title>
      <style>
        body {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          line-height: 1.6;
          color: #ffffff;
          margin: 0;
          padding: 0;
          background: #000000;
          min-height: 100vh;
        }
        .background {
          position: relative;
          background: #000000;
          min-height: 100vh;
          overflow: hidden;
        }
        .squares {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .square {
          position: absolute;
          width: 20px;
          height: 20px;
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
        }
        .square:nth-child(1) { background: #ff6b6b; top: 10%; left: 10%; animation-delay: 0s; }
        .square:nth-child(2) { background: #4ecdc4; top: 20%; left: 80%; animation-delay: 1s; }
        .square:nth-child(3) { background: #45b7d1; top: 60%; left: 20%; animation-delay: 2s; }
        .square:nth-child(4) { background: #96ceb4; top: 80%; left: 70%; animation-delay: 3s; }
        .square:nth-child(5) { background: #feca57; top: 30%; left: 50%; animation-delay: 4s; }
        .square:nth-child(6) { background: #ff9ff3; top: 70%; left: 90%; animation-delay: 5s; }
        .square:nth-child(7) { background: #54a0ff; top: 40%; left: 5%; animation-delay: 1.5s; }
        .square:nth-child(8) { background: #5f27cd; top: 90%; left: 30%; animation-delay: 2.5s; }
        .square:nth-child(9) { background: #00d2d3; top: 15%; left: 60%; animation-delay: 3.5s; }
        .square:nth-child(10) { background: #ff9f43; top: 50%; left: 85%; animation-delay: 4.5s; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .container {
          position: relative;
          z-index: 10;
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          text-align: center;
        }
        .header {
          margin-bottom: 40px;
        }
        .logo {
          margin-bottom: 20px;
        }
        .logo img {
          width: 120px;
          height: auto;
          max-width: 100%;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        .title {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          font-size: 20px;
          color: #ffffff;
          margin-bottom: 20px;
          font-weight: bold;
          text-shadow: 
            1px 1px 0px rgba(0, 0, 0, 0.8),
            -1px -1px 0px rgba(0, 0, 0, 0.8),
            1px -1px 0px rgba(0, 0, 0, 0.8),
            -1px 1px 0px rgba(0, 0, 0, 0.8);
        }
        .content {
          margin-bottom: 40px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          padding: 30px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .content p {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          color: #e0e0e0;
          font-size: 14px;
          margin-bottom: 20px;
          font-weight: normal;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
          color: white;
          padding: 18px 40px;
          text-decoration: none;
          border-radius: 8px;
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          font-weight: bold;
          font-size: 12px;
          text-align: center;
          margin: 30px 0;
          box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4);
        }
        .link-box {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .link-box p {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          color: #b0b0b0;
          font-size: 12px;
          margin-bottom: 10px;
        }
        .link-text {
          word-break: break-all;
          background: rgba(0, 0, 0, 0.3);
          padding: 15px;
          border-radius: 8px;
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          color: #4ecdc4;
          font-size: 8px;
          border: 1px solid rgba(78, 205, 196, 0.3);
        }
        .warning {
          background: rgba(255, 193, 7, 0.1);
          border: 1px solid rgba(255, 193, 7, 0.3);
          border-radius: 10px;
          padding: 20px;
          margin: 30px 0;
          color: #ffc107;
        }
        .warning strong {
          color: #ffeb3b;
        }
        .footer {
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 12px;
          color: #888;
          text-align: center;
        }
        .footer p {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          margin: 5px 0;
        }
        .adventure-text {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          font-style: italic;
          color: #4ecdc4;
          font-size: 14px;
          margin: 20px 0;
          font-weight: normal;
        }
      </style>
    </head>
    <body>
      <div class="background">
        <div class="squares">
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
        </div>
        
        <div class="container">
          <div class="header">
            <div class="logo">
              <img src="https://quillia.app/logo.png" alt="Quillia" />
            </div>
            <h1 class="title">WELCOME ADVENTURER</h1>
            <p class="adventure-text">Your quest begins now...</p>
          </div>
          
          <div class="content">
            <p>Hello <strong>${userName || 'brave soul'}</strong>,</p>
            
            <p>Welcome to Quillia! We're thrilled to have you join our community of adventurers. Your magical journal awaits, ready to transform your everyday experiences into epic tales.</p>
            
            <p>To complete your registration and unlock your adventure, please verify your email address:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">🚀 BEGIN ADVENTURE</a>
            </div>
            
            <div class="link-box">
              <p>Or copy and paste this magical link into your browser:</p>
              <div class="link-text">${verificationUrl}</div>
            </div>
            
            <div class="warning">
              <strong>⚡ Important:</strong> This verification link will expire in 24 hours. If you didn't create an account with Quillia, you can safely ignore this email.
            </div>
          </div>
          
          <div class="footer">
            <p>This email was sent from Quillia - Transform Your Days Into Adventures</p>
            <p>Ready to embark on your journey? Your adventure awaits! ✨</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to Quillia!

Hello ${userName || 'there'},

Welcome to Quillia! We're excited to have you join our community of adventurers. To complete your registration and start your journey, please verify your email address by clicking the link below:

${verificationUrl}

This verification link will expire in 24 hours. If you didn't create an account with Quillia, you can safely ignore this email.

---
Quillia - Transform Your Day Into Adventure
  `;

  return { html, text };
}

export function createContactFormSubmissionEmail(
  name: string,
  email: string,
  subject: string,
  message: string,
  type: string
) {
  const inquiryTypeLabels: Record<string, string> = {
    general: 'General Inquiry',
    support: 'Technical Support',
    privacy: 'Privacy Concern',
    feature: 'Feature Request',
    bug: 'Bug Report',
    business: 'Business Inquiry',
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Form Submission - Quillia</title>
      <style>
        body {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          line-height: 1.6;
          color: #ffffff;
          margin: 0;
          padding: 0;
          background: #000000;
          min-height: 100vh;
        }
        .background {
          position: relative;
          background: #000000;
          min-height: 100vh;
          overflow: hidden;
        }
        .squares {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .square {
          position: absolute;
          width: 20px;
          height: 20px;
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
        }
        .square:nth-child(1) { background: #ff6b6b; top: 10%; left: 10%; animation-delay: 0s; }
        .square:nth-child(2) { background: #4ecdc4; top: 20%; left: 80%; animation-delay: 1s; }
        .square:nth-child(3) { background: #45b7d1; top: 60%; left: 20%; animation-delay: 2s; }
        .square:nth-child(4) { background: #96ceb4; top: 80%; left: 70%; animation-delay: 3s; }
        .square:nth-child(5) { background: #feca57; top: 30%; left: 50%; animation-delay: 4s; }
        .square:nth-child(6) { background: #ff9ff3; top: 70%; left: 90%; animation-delay: 5s; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .container {
          position: relative;
          z-index: 10;
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          text-align: center;
        }
        .header {
          margin-bottom: 40px;
        }
        .logo {
          margin-bottom: 20px;
        }
        .logo img {
          width: 120px;
          height: auto;
          max-width: 100%;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        .title {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          font-size: 20px;
          color: #ffffff;
          margin-bottom: 20px;
          font-weight: bold;
          text-shadow: 
            1px 1px 0px rgba(0, 0, 0, 0.8),
            -1px -1px 0px rgba(0, 0, 0, 0.8),
            1px -1px 0px rgba(0, 0, 0, 0.8),
            -1px 1px 0px rgba(0, 0, 0, 0.8);
        }
        .subtitle {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          font-style: italic;
          color: #4ecdc4;
          font-size: 14px;
          margin: 20px 0;
          font-weight: normal;
        }
        .content {
          margin-bottom: 40px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          padding: 30px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-align: left;
        }
        .field {
          margin-bottom: 20px;
        }
        .field-label {
          font-weight: bold;
          color: #4ecdc4;
          font-size: 12px;
          text-transform: uppercase;
          margin-bottom: 8px;
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
        }
        .field-value {
          color: #e0e0e0;
          font-size: 14px;
          background: rgba(0, 0, 0, 0.3);
          padding: 15px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          word-wrap: break-word;
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
        }
        .message-box {
          white-space: pre-wrap;
          min-height: 100px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 12px;
          color: #888;
          text-align: center;
        }
        .footer p {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="background">
        <div class="squares">
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
        </div>
        
        <div class="container">
          <div class="header">
            <div class="logo">
              <img src="https://quillia.app/logo.png" alt="Quillia" />
            </div>
            <h1 class="title">NEW CONTACT FORM SUBMISSION</h1>
            <p class="subtitle">A new message awaits your response...</p>
          </div>
          
          <div class="content">
            <div class="field">
              <div class="field-label">From:</div>
              <div class="field-value">${escapeHtml(name)} (${escapeHtml(email)})</div>
            </div>
            
            <div class="field">
              <div class="field-label">Inquiry Type:</div>
              <div class="field-value">${escapeHtml(inquiryTypeLabels[type] || type)}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Subject:</div>
              <div class="field-value">${escapeHtml(subject)}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Message:</div>
              <div class="field-value message-box">${escapeHtml(message)}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>This email was sent from the Quillia contact form</p>
            <p>Reply to: ${escapeHtml(email)}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New Contact Form Submission - Quillia

From: ${name} (${email})
Inquiry Type: ${inquiryTypeLabels[type] || type}
Subject: ${subject}

Message:
${message}

---
Reply to: ${email}
This email was sent from the Quillia contact form
  `;

  return { html, text };
}

export function createContactFormConfirmationEmail(name: string, subject: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>We Received Your Message - Quillia</title>
      <style>
        body {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          line-height: 1.6;
          color: #ffffff;
          margin: 0;
          padding: 0;
          background: #000000;
          min-height: 100vh;
        }
        .background {
          position: relative;
          background: #000000;
          min-height: 100vh;
          overflow: hidden;
        }
        .squares {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .square {
          position: absolute;
          width: 20px;
          height: 20px;
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
        }
        .square:nth-child(1) { background: #ff6b6b; top: 10%; left: 10%; animation-delay: 0s; }
        .square:nth-child(2) { background: #4ecdc4; top: 20%; left: 80%; animation-delay: 1s; }
        .square:nth-child(3) { background: #45b7d1; top: 60%; left: 20%; animation-delay: 2s; }
        .square:nth-child(4) { background: #96ceb4; top: 80%; left: 70%; animation-delay: 3s; }
        .square:nth-child(5) { background: #feca57; top: 30%; left: 50%; animation-delay: 4s; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .container {
          position: relative;
          z-index: 10;
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          text-align: center;
        }
        .header {
          margin-bottom: 40px;
        }
        .logo {
          margin-bottom: 20px;
        }
        .logo img {
          width: 120px;
          height: auto;
          max-width: 100%;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        .title {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          font-size: 20px;
          color: #ffffff;
          margin-bottom: 20px;
          font-weight: bold;
          text-shadow: 
            1px 1px 0px rgba(0, 0, 0, 0.8),
            -1px -1px 0px rgba(0, 0, 0, 0.8),
            1px -1px 0px rgba(0, 0, 0, 0.8),
            -1px 1px 0px rgba(0, 0, 0, 0.8);
        }
        .content {
          margin-bottom: 40px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          padding: 30px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .content p {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          color: #e0e0e0;
          font-size: 14px;
          margin-bottom: 20px;
          font-weight: normal;
        }
        .subject-box {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .subject-box p {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          color: #b0b0b0;
          font-size: 12px;
          margin-bottom: 10px;
        }
        .subject-text {
          word-break: break-word;
          background: rgba(0, 0, 0, 0.3);
          padding: 15px;
          border-radius: 8px;
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          color: #4ecdc4;
          font-size: 14px;
          border: 1px solid rgba(78, 205, 196, 0.3);
        }
        .footer {
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 12px;
          color: #888;
          text-align: center;
        }
        .footer p {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          margin: 5px 0;
        }
        .adventure-text {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          font-style: italic;
          color: #4ecdc4;
          font-size: 14px;
          margin: 20px 0;
          font-weight: normal;
        }
      </style>
    </head>
    <body>
      <div class="background">
        <div class="squares">
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
        </div>
        
        <div class="container">
          <div class="header">
            <div class="logo">
              <img src="https://quillia.app/logo.png" alt="Quillia" />
            </div>
            <h1 class="title">MESSAGE RECEIVED</h1>
            <p class="adventure-text">Your quest continues...</p>
          </div>
          
          <div class="content">
            <p>Hello <strong>${escapeHtml(name || 'adventurer')}</strong>,</p>
            
            <p>Thank you for reaching out to us! We've successfully received your message and our team will get back to you as soon as possible.</p>
            
            <div class="subject-box">
              <p>Your message subject:</p>
              <div class="subject-text">${escapeHtml(subject)}</div>
            </div>
            
            <p>We typically respond within 24-48 hours. If your inquiry is urgent, please don't hesitate to reach out again.</p>
            
            <p>In the meantime, continue your adventure and transform your days into epic tales!</p>
          </div>
          
          <div class="footer">
            <p>This email was sent from Quillia - Transform Your Days Into Adventures</p>
            <p>We're here to help you on your journey! ✨</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Message Received - Quillia

Hello ${name || 'adventurer'},

Thank you for reaching out to us! We've successfully received your message and our team will get back to you as soon as possible.

Your message subject: ${subject}

We typically respond within 24-48 hours. If your inquiry is urgent, please don't hesitate to reach out again.

In the meantime, continue your adventure and transform your days into epic tales!

---
Quillia - Transform Your Days Into Adventures
We're here to help you on your journey! ✨
  `;

  return { html, text };
}

export function createAccountDeletionConfirmationEmail(userName: string, userEmail: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Deleted - Quillia</title>
      <style>
        body {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          line-height: 1.6;
          color: #ffffff;
          margin: 0;
          padding: 0;
          background: #000000;
          min-height: 100vh;
        }
        .background {
          position: relative;
          background: #000000;
          min-height: 100vh;
          overflow: hidden;
        }
        .squares {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .square {
          position: absolute;
          width: 20px;
          height: 20px;
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
        }
        .square:nth-child(1) { background: #ff6b6b; top: 10%; left: 10%; animation-delay: 0s; }
        .square:nth-child(2) { background: #4ecdc4; top: 20%; left: 80%; animation-delay: 1s; }
        .square:nth-child(3) { background: #45b7d1; top: 60%; left: 20%; animation-delay: 2s; }
        .square:nth-child(4) { background: #96ceb4; top: 80%; left: 70%; animation-delay: 3s; }
        .square:nth-child(5) { background: #feca57; top: 30%; left: 50%; animation-delay: 4s; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .container {
          position: relative;
          z-index: 10;
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          text-align: center;
        }
        .header {
          margin-bottom: 40px;
        }
        .logo {
          margin-bottom: 20px;
        }
        .logo img {
          width: 120px;
          height: auto;
          max-width: 100%;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        .title {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          font-size: 20px;
          color: #ffffff;
          margin-bottom: 20px;
          font-weight: bold;
          text-shadow: 
            1px 1px 0px rgba(0, 0, 0, 0.8),
            -1px -1px 0px rgba(0, 0, 0, 0.8),
            1px -1px 0px rgba(0, 0, 0, 0.8),
            -1px 1px 0px rgba(0, 0, 0, 0.8);
        }
        .subtitle {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          font-style: italic;
          color: #888;
          font-size: 14px;
          margin: 20px 0;
          font-weight: normal;
        }
        .content {
          margin-bottom: 40px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          padding: 30px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .content p {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          color: #e0e0e0;
          font-size: 14px;
          margin-bottom: 20px;
          font-weight: normal;
        }
        .warning-box {
          background: rgba(239, 68, 68, 0.1);
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .warning-box p {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          color: #ff6b6b;
          font-size: 12px;
          margin-bottom: 10px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 12px;
          color: #888;
          text-align: center;
        }
        .footer p {
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="background">
        <div class="squares">
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
          <div class="square"></div>
        </div>
        
        <div class="container">
          <div class="header">
            <div class="logo">
              <img src="https://quillia.app/logo.png" alt="Quillia" />
            </div>
            <h1 class="title">ACCOUNT DELETED</h1>
            <p class="subtitle">Your account has been permanently removed</p>
          </div>
          
          <div class="content">
            <p>Hello <strong>${escapeHtml(userName || 'adventurer')}</strong>,</p>
            
            <p>This email confirms that your Quillia account associated with <strong>${escapeHtml(userEmail)}</strong> has been permanently deleted.</p>
            
            <div class="warning-box">
              <p><strong>⚠️ What was deleted:</strong></p>
              <p>• Your account and all user data</p>
              <p>• All your characters and their progress</p>
              <p>• All your journal entries and adventures</p>
              <p>• All your achievements and statistics</p>
            </div>
            
            <p><strong>This action cannot be undone.</strong> All data associated with your account has been permanently removed from our systems.</p>
            
            <p>If you did not request this deletion, please contact us immediately at <a href="mailto:contact@quillia.app" style="color: #4ecdc4;">contact@quillia.app</a>.</p>
            
            <p>Thank you for being part of the Quillia community. We wish you the best on your future adventures.</p>
          </div>
          
          <div class="footer">
            <p>This email was sent from Quillia - Transform Your Days Into Adventures</p>
            <p>If you have any questions, please contact us at contact@quillia.app</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Account Deleted - Quillia

Hello ${userName || 'adventurer'},

This email confirms that your Quillia account associated with ${userEmail} has been permanently deleted.

⚠️ What was deleted:
• Your account and all user data
• All your characters and their progress
• All your journal entries and adventures
• All your achievements and statistics

This action cannot be undone. All data associated with your account has been permanently removed from our systems.

If you did not request this deletion, please contact us immediately at contact@quillia.app.

Thank you for being part of the Quillia community. We wish you the best on your future adventures.

---
Quillia - Transform Your Days Into Adventures
If you have any questions, please contact us at contact@quillia.app
  `;

  return { html, text };
}