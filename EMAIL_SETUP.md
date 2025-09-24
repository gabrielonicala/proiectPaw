# Email Setup Guide for Quillia

This guide will help you set up email functionality for password reset in your Quillia app.

## Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. **Update your `.env.local` file**:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   SMTP_FROM=Quillia <your-email@gmail.com>
   ```

## Option 2: Other Email Providers

### Outlook/Hotmail
```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo
```
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Custom SMTP Server
```
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Option 3: Email Services (Production)

For production, consider using dedicated email services:

### SendGrid
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get your API key
3. Update the email service to use SendGrid API

### Resend
1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Update the email service to use Resend API

### Nodemailer with SendGrid
```bash
npm install @sendgrid/mail
```

## Testing

1. Update your `.env.local` with valid email credentials
2. Restart your development server
3. Go to `/auth/forgot-password`
4. Enter a valid email address
5. Check your email for the password reset link

## Troubleshooting

- **"Invalid login"**: Check your email and password
- **"Connection timeout"**: Check your SMTP settings
- **"Authentication failed"**: Make sure you're using an app password for Gmail
- **Emails not received**: Check spam folder

## Security Notes

- Never commit your `.env.local` file to version control
- Use app passwords instead of your main password
- Consider using environment variables in production
- The email service gracefully handles failures without revealing errors to users
