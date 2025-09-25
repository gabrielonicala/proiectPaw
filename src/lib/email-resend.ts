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
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@400;700;900&display=swap');
        
        body {
          font-family: 'Press Start 2P', 'Orbitron', monospace;
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
          font-family: 'Press Start 2P', monospace;
          font-size: 32px;
          font-weight: normal;
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 3s ease-in-out infinite;
          margin-bottom: 20px;
          text-shadow: 
            2px 2px 0px rgba(0, 0, 0, 0.8),
            -2px -2px 0px rgba(0, 0, 0, 0.8),
            2px -2px 0px rgba(0, 0, 0, 0.8),
            -2px 2px 0px rgba(0, 0, 0, 0.8);
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .title {
          font-family: 'Press Start 2P', monospace;
          font-size: 20px;
          color: #ffffff;
          margin-bottom: 20px;
          font-weight: normal;
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
          font-family: 'Orbitron', monospace;
          color: #e0e0e0;
          font-size: 14px;
          margin-bottom: 20px;
          font-weight: 400;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
          color: white;
          padding: 18px 40px;
          text-decoration: none;
          border-radius: 8px;
          font-family: 'Press Start 2P', monospace;
          font-weight: normal;
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
          font-family: 'Orbitron', monospace;
          color: #b0b0b0;
          font-size: 12px;
          margin-bottom: 10px;
        }
        .link-text {
          word-break: break-all;
          background: rgba(0, 0, 0, 0.3);
          padding: 15px;
          border-radius: 8px;
          font-family: 'Press Start 2P', monospace;
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
          font-family: 'Orbitron', monospace;
          margin: 5px 0;
        }
        .security-text {
          font-family: 'Orbitron', monospace;
          font-style: italic;
          color: #ff6b6b;
          font-size: 14px;
          margin: 20px 0;
          font-weight: 400;
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
            <div class="logo">🔐 QUILLIA</div>
            <h1 class="title">RESET PASSWORD</h1>
            <p class="security-text">Secure your adventure...</p>
          </div>
          
          <div class="content">
            <p>Hello <strong>${userName || 'adventurer'}</strong>,</p>
            
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
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@400;700;900&display=swap');
        
        body {
          font-family: 'Press Start 2P', 'Orbitron', monospace;
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
          font-family: 'Press Start 2P', monospace;
          font-size: 32px;
          font-weight: normal;
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 3s ease-in-out infinite;
          margin-bottom: 20px;
          text-shadow: 
            2px 2px 0px rgba(0, 0, 0, 0.8),
            -2px -2px 0px rgba(0, 0, 0, 0.8),
            2px -2px 0px rgba(0, 0, 0, 0.8),
            -2px 2px 0px rgba(0, 0, 0, 0.8);
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .title {
          font-family: 'Press Start 2P', monospace;
          font-size: 20px;
          color: #ffffff;
          margin-bottom: 20px;
          font-weight: normal;
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
          font-family: 'Orbitron', monospace;
          color: #e0e0e0;
          font-size: 14px;
          margin-bottom: 20px;
          font-weight: 400;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
          color: white;
          padding: 18px 40px;
          text-decoration: none;
          border-radius: 8px;
          font-family: 'Press Start 2P', monospace;
          font-weight: normal;
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
          font-family: 'Orbitron', monospace;
          color: #b0b0b0;
          font-size: 12px;
          margin-bottom: 10px;
        }
        .link-text {
          word-break: break-all;
          background: rgba(0, 0, 0, 0.3);
          padding: 15px;
          border-radius: 8px;
          font-family: 'Press Start 2P', monospace;
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
          font-family: 'Orbitron', monospace;
          margin: 5px 0;
        }
        .adventure-text {
          font-family: 'Orbitron', monospace;
          font-style: italic;
          color: #4ecdc4;
          font-size: 14px;
          margin: 20px 0;
          font-weight: 400;
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
            <div class="logo">✨ QUILLIA</div>
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