# Google OAuth Verification Setup Guide

## Domain Information
- **Domain**: `quillia.app`
- **Privacy Policy URL**: `https://quillia.app/legal/privacy`

---

## Step b) Update Privacy Policy URL in Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with the Google account that created the OAuth application

2. **Navigate to APIs & Services**
   - Click on the hamburger menu (☰) in the top left
   - Go to **APIs & Services** → **Credentials**

3. **Find Your OAuth 2.0 Client**
   - Look for your OAuth 2.0 Client ID (the one with `GOOGLE_CLIENT_ID` from your `.env`)
   - Click on the client ID to edit it

4. **Update Privacy Policy URL**
   - Scroll down to the **Authorized domains** section
   - In the **Privacy Policy URL** field, enter:
     ```
     https://quillia.app/legal/privacy
     ```
   - Click **Save**

---

## Step c) Verify Domain Ownership

Google requires you to verify that you own `quillia.app`. There are several methods:

### Method 1: HTML File Upload (Recommended - Easiest)

1. **Download the verification file**
   - In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
   - Scroll to the **Domain verification** section
   - Click **Add domain** or **Verify domain**
   - Google will provide you with a verification file (e.g., `google1234567890.html`)

2. **Upload the file to your website**
   - The file needs to be accessible at: `https://quillia.app/google1234567890.html`
   - If you're using Vercel/Next.js, you can:
     - Create a file in the `public/` folder: `public/google1234567890.html`
     - Or create a route: `src/app/google1234567890.html/route.ts` that returns the file content

3. **Verify in Google Cloud Console**
   - Go back to Google Cloud Console
   - Click **Verify** in the domain verification section
   - Google will check if the file is accessible

### Method 2: DNS TXT Record

1. **Get the verification record**
   - In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
   - Click **Add domain** or **Verify domain**
   - Choose **DNS** method
   - Google will provide a TXT record (e.g., `google-site-verification=abc123...`)

2. **Add DNS record**
   - Go to your domain registrar (where you manage `quillia.app`)
   - Add a TXT record:
     - **Name/Host**: `@` or `quillia.app` (or leave blank, depends on your DNS provider)
     - **Type**: `TXT`
     - **Value**: The verification string Google provided
     - **TTL**: 3600 (or default)

3. **Wait for DNS propagation**
   - DNS changes can take a few minutes to several hours
   - You can check if it's live using: https://mxtoolbox.com/TXTLookup.aspx

4. **Verify in Google Cloud Console**
   - Go back to Google Cloud Console
   - Click **Verify** in the domain verification section

### Method 3: Meta Tag (HTML)

1. **Get the meta tag**
   - In Google Cloud Console, choose **HTML tag** method
   - Google will provide a `<meta>` tag like:
     ```html
     <meta name="google-site-verification" content="abc123..." />
     ```

2. **Add to your website**
   - Add this meta tag to your `src/app/layout.tsx` in the `<head>` section
   - Or add it to your root HTML template

3. **Verify in Google Cloud Console**
   - Click **Verify** in Google Cloud Console

---

## After Verification

Once both steps are complete:

1. **Submit for Review Again**
   - Go to **OAuth consent screen**
   - Make sure all required fields are filled:
     - App name
     - User support email
     - Developer contact information
     - Privacy Policy URL (should now be `https://quillia.app/legal/privacy`)
     - Domain verified ✅
   - Click **Save and Continue**
   - Submit for verification

2. **Wait for Review**
   - Google typically reviews within 1-3 business days
   - You'll receive an email when the review is complete

---

## Quick Checklist

- [ ] Privacy Policy URL updated in OAuth client settings: `https://quillia.app/legal/privacy`
- [ ] Domain ownership verified (HTML file, DNS, or meta tag)
- [ ] Privacy Policy page is accessible at `/legal/privacy`
- [ ] All OAuth consent screen fields are completed
- [ ] Application submitted for review

---

## Troubleshooting

**Privacy Policy not accessible?**
- Make sure the page is deployed and accessible
- Check: https://quillia.app/legal/privacy
- Ensure there are no redirects or authentication required

**Domain verification failing?**
- Double-check the file/record is accessible
- Wait a few minutes for DNS propagation (if using DNS method)
- Try a different verification method
- Clear your browser cache

**Still having issues?**
- Check Google's documentation: https://support.google.com/cloud/answer/9110914
- Contact Google Cloud Support if needed

