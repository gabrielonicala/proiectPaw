# Legal Document Questions - Complete Answers

Based on comprehensive codebase analysis of Quillia (fantasy-journal app)

---

## 📄 PRIVACY POLICY QUESTIONS

### A. What Personal Data Your App Collects

**Account Information:**
- ✅ Email address (required, unique)
- ✅ Username (required, unique, min 3 chars, alphanumeric + underscores)
- ✅ Password (encrypted with bcrypt, min 6 chars)
- ✅ Name (optional, from Google OAuth if used)
- ✅ Profile image (optional, from Google OAuth if used)

**Journal Content:**
- ✅ Original journal entry text (user-provided)
- ✅ AI-generated reimagined text/stories (encrypted with AWS KMS)
- ✅ Generated images (URLs stored)
- ✅ Entry metadata (output type, timestamps, experience points, stat analysis)

**Character Data:**
- ✅ Character names, descriptions, themes
- ✅ Character appearances (androgynous/male/female)
- ✅ Pronouns (default or custom)
- ✅ Character avatars (image URLs)
- ✅ Character stats (experience, level, stats JSON)
- ✅ Usage statistics (total adventures, stories created, scenes generated, streaks, word counts, activity patterns)

**Character Memory (AI-Generated):**
- ✅ Character memories (AI-generated)
- ✅ World state (AI-generated)
- ✅ Summary logs (AI-generated)
- ✅ Recent entries (AI-generated)
- ✅ Relationships, locations, goals (AI-generated)

**User Preferences:**
- ✅ Theme selections
- ✅ Music preferences
- ✅ App settings
- ✅ Active character selection
- ✅ Character slots (1 for free, 3 for Tribute plan)

**Subscription Information:**
- ✅ Subscription plan (free/tribute)
- ✅ Subscription status (active/inactive/canceled/past_due)
- ✅ Subscription ID (from Paddle)
- ✅ Subscription end date
- ✅ Payment details (processed by Paddle - we do NOT store payment card details)

**Automatically Collected:**
- ✅ IP address
- ✅ Device information
- ✅ Browser type and version
- ✅ Usage patterns (app interactions, feature usage, session duration)
- ✅ AI processing logs (story/image generation requests for service improvement)
- ✅ Security data (login attempts, authentication logs)
- ✅ Analytics data (stories generated, images created, streaks, usage stats)
- ✅ Session tokens (for authentication)

**Third-Party Data:**
- ✅ Google OAuth: Name and email (if you choose Google authentication)

---

### B. How You Collect That Data

**User Provides Manually:**
- ✅ Account registration (username, email, password)
- ✅ Journal entries (original text input)
- ✅ Character creation (names, descriptions, themes, appearances, pronouns)
- ✅ User preferences (theme selections, settings)

**Third-Party Login:**
- ✅ Google OAuth (automatic username generation, email, name, image)

**Server Logs:**
- ✅ IP address (from request headers)
- ✅ Device information (from user agent)
- ✅ Browser type (from user agent)
- ✅ Authentication events
- ✅ Security events

**Cookies:**
- ✅ Essential cookies (authentication, security - required)
- ✅ Analytics cookies (Vercel Analytics - with consent)
- ✅ Performance cookies (Vercel Speed Insights - with consent)
- ✅ Cookie consent preferences stored in localStorage

**Tracking Scripts:**
- ✅ Vercel Analytics (conditional, requires consent)
- ✅ Vercel Speed Insights (conditional, requires consent)
- ✅ Cookie consent banner implemented

**Database Storage:**
- ✅ All user data stored in PostgreSQL database (Neon)
- ✅ Journal entries encrypted with AWS KMS before storage

---

### C. What You Use It For

**Primary Service Functions:**
- ✅ Authentication (user login, session management)
- ✅ AI Story Generation (OpenAI GPT-4o-mini transforms journal entries into fantasy stories)
- ✅ AI Image Generation (Google Gemini)
- ✅ Character Memory System (maintains continuity, relationships, world state across entries)
- ✅ Personalization (themes, characters, user experience customization)
- ✅ Progress Tracking (character statistics, experience points, levels, achievements)
- ✅ Subscription Management (process payments, manage subscription status)

**Service Improvement:**
- ✅ Analytics (usage patterns, feature interactions, service improvements)
- ✅ Performance monitoring (app speed, performance metrics)
- ✅ Security (login attempts, security monitoring, incident response)

**Communication:**
- ✅ Email verification (Resend)
- ✅ Password reset (Resend)
- ✅ Account notifications (Resend)

**Legal Compliance:**
- ✅ Legal obligations (compliance with applicable laws)
- ✅ Data protection (GDPR, CCPA compliance)

**NOT Used For:**
- ❌ Marketing (no marketing emails found in codebase)
- ❌ Selling data to third parties (explicitly stated in privacy policy)

---

### D. Which Third-Party Services You Use

**AI Service Providers:**
- ✅ OpenAI (GPT-4o-mini for story generation)
- ✅ Google Gemini (image generation)

**Payment Processors:**
- ✅ Paddle (Merchant of Record for subscription payments - primary)

**Authentication Providers:**
- ✅ Google (OAuth authentication via NextAuth)

**Cloud Infrastructure:**
- ✅ Vercel (hosting, deployment)
- ✅ Neon (PostgreSQL database hosting)
- ✅ AWS (KMS for encryption, CloudTrail)

**Email Services:**
- ✅ Resend (email verification, password reset, notifications)

**Analytics & Performance:**
- ✅ Vercel Analytics (conditional, requires cookie consent)
- ✅ Vercel Speed Insights (conditional, requires cookie consent)


**Other Services:**
- ✅ NextAuth (authentication framework)
- ✅ Prisma (database ORM)

---

### E. Whether You Store Data

**Yes, you store user personal data in your own database:**

**Database:**
- ✅ PostgreSQL database hosted on Neon
- ✅ All user data stored locally in your database

**Encryption:**
- ✅ Journal entries encrypted with AWS KMS before storage
- ✅ Passwords hashed with bcrypt
- ✅ Secure transmission via HTTPS/TLS

**Data Retention:**
- ✅ **Active Accounts:** Data retained while account is active
- ✅ **Account Deletion:** Data deleted within 30 days of account termination
- ✅ **Backup Data:** Encrypted backups may be retained for up to 90 days
- ✅ **Legal Requirements:** Some data may be retained longer for legal compliance
- ✅ **Analytics Data:** Aggregated, anonymized data may be retained longer

**Data Location:**
- ✅ Database: Neon (PostgreSQL) - US-based
- ✅ Encryption Keys: AWS KMS (Global)
- ✅ Hosting: Vercel (US-based)

---

### F. Whether Minors Can Use Your App

**Age Restrictions:**
- ✅ **13+ years old** (minimum age requirement)
- ✅ **13-18 years old:** Requires parental or guardian consent
- ✅ **18+ years old:** Full access, no parental consent required

**Current Implementation:**
- ✅ Terms of Service states: "You must be at least 13 years old to use the Service"
- ✅ Privacy Policy states: "We do not knowingly collect personal information from children under 13"
- ⚠️ **Note:** No age verification mechanism found in codebase

**COPPA Compliance:**
- ✅ Compliant (13+ requirement)
- ✅ No collection from children under 13

---

### G. Company Details

**Company Name:**
- ✅ **Ela Opportunity** (app name, used as company name in legal documents)

**Contact Information:**
- ✅ **Email:** contact@quillia.app
- ✅ **Website:** https://quillia.app

**Business Address:**
- ⚠️ **Currently:** [Your Business Address], Romania (placeholder in legal docs)
- ✅ **Country:** Romania (governing law specified in Terms)

**Legal Jurisdiction:**
- ✅ **Governing Law:** Romania
- ✅ **Dispute Resolution:** Courts of Romania
- ✅ **EU Users:** Right to use European Commission's Online Dispute Resolution platform

---

## 📜 TERMS & CONDITIONS QUESTIONS

### Do Users Create Accounts?

**Yes:**
- ✅ Account creation is required to use the service
- ✅ Two authentication methods:
  1. Username/password with email verification
  2. Google OAuth (automatic account creation)

**Account Requirements:**
- ✅ Username (required, min 3 chars, unique)
- ✅ Email (required, unique, verified)
- ✅ Password (required for username/password accounts, min 6 chars)

**Account Features:**
- ✅ Multiple characters per account (1 for free, 3 for Tribute plan)
- ✅ Character switching
- ✅ Progress tracking per character
- ✅ Subscription management

---

### Do You Allow Content Creation or User-Generated Content?

**Yes, extensive user-generated content:**
- ✅ **Journal Entries:** Users write original journal entries
- ✅ **Character Creation:** Users create custom characters (names, descriptions, themes, appearances, pronouns)
- ✅ **AI-Generated Content:** AI transforms user entries into stories and images
- ✅ **Character Customization:** Users customize character avatars, appearances, themes

**Content Ownership:**
- ✅ Users retain ownership of original journal entries
- ✅ Users grant license to use content for service provision
- ✅ AI-generated content (stories, images) created based on user input

**Content Moderation:**
- ✅ Prohibited content listed in Terms (graphic, violent, discriminatory, etc.)
- ✅ Right to remove content that violates Terms
- ✅ Account suspension/termination for violations

---

### Do You Sell Subscriptions or Credits?

**Yes, subscriptions:**
- ✅ **Free Plan:** 1 character slot, basic achievements, basic journaling capabilities
- ✅ **Tribute Plan:** $7.00 USD per week, 3 character slots, premium achievements, increased limits for AI generation, priority support

**Payment Processing:**
- ✅ **Primary:** Paddle (Merchant of Record)
- ✅ Weekly billing cycle for Tribute subscriptions
- ✅ Automatic renewal unless cancelled
- ✅ Payment card details NOT stored (processed by Paddle)

**Subscription Features:**
- ✅ Subscription status tracking (active/inactive/canceled/past_due)
- ✅ Subscription end date tracking
- ✅ Grace period after cancellation (access until end of billing period)
- ✅ Character slot limits based on subscription plan

**Credits:**
- ❌ No credit system found in codebase
- ✅ Usage limits based on subscription plan (daily limits for users, depending on subscription tier)

---

### Refund Policy?

**Current Policy (from Terms):**
- ✅ **"Subscription fees are non-refundable"** (explicitly stated)
- ✅ Cancellation takes effect at end of current billing period
- ✅ User retains access until end of period after cancellation

**Implementation:**
- ✅ Subscription cancellation via API endpoint
- ✅ Cancellation updates status to "canceled"
- ✅ Access maintained until subscriptionEndsAt date
- ⚠️ **No refund mechanism found in codebase**


### Copyright/Licensing Details?

**Current Terms State:**
- ✅ Users retain ownership of original journal entries
- ✅ Users grant license to use content for service provision
- ✅ AI-generated content created based on user input

**AI Service Terms:**
- ⚠️ **Note:** OpenAI and Google Gemini have their own terms that apply to generated content
- ✅ Terms mention: "These services may have their own terms and conditions that apply to the generated content"

**Recommendation:**
- Clarify ownership/licensing of AI-generated content (stories, images)
- Specify if users can use AI-generated content commercially
- Address OpenAI/Google terms regarding generated content

---

### Liability Limitations?

**Yes, extensive liability limitations:**
- ✅ **Limitation of Liability clause** in Terms
- ✅ "TO THE MAXIMUM EXTENT PERMITTED BY LAW, QUILLIA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES"
- ✅ Total liability limited to amount paid in 12 months preceding claim
- ✅ No warranty that service will be error-free, uninterrupted, or free from viruses
- ✅ Force Majeure clause included

**Indemnification:**
- ⚠️ **Note:** Indemnification clause mentioned in section title but content not detailed in current Terms

---

### Do You Allow Account Termination?

**Yes:**
- ✅ Users can terminate accounts by contacting contact@quillia.app
- ✅ Company can terminate/suspend accounts for Terms violations
- ✅ Data deleted within 30 days of account termination
- ✅ Cascade deletion: Characters, journal entries, sessions deleted when user deleted

**Implementation:**
- ✅ Account deletion functionality exists
- ✅ Character deletion with cascade to journal entries
- ✅ Journal entry deletion
- ✅ Auto-logout when account deleted

**Data Deletion:**
- ✅ Data deleted within 30 days
- ✅ Backup data retained for up to 90 days
- ✅ Legal requirements may require longer retention

---

## 📋 SUMMARY FOR LEGAL DOCUMENT GENERATOR

### Quick Reference Checklist:

**Personal Data Collected:**
- Email, username, password, name, profile image
- Journal entries (original + AI-generated, encrypted)
- Character data, memories, stats
- Subscription info, payment data (via Paddle)
- IP address, device info, usage data
- Analytics data (with consent)

**Data Collection Methods:**
- User manual input
- Google OAuth
- Server logs
- Cookies (essential, analytics, performance - with consent)
- Tracking scripts (Vercel Analytics - with consent)

**Data Uses:**
- Authentication, AI generation, personalization
- Payment processing, analytics, service improvement
- Email communication, legal compliance

**Third-Party Services:**
- OpenAI, Google Gemini, Replicate, RunwayML
- Paddle, Stripe
- Google OAuth
- Vercel, Neon, AWS
- Resend
- Upstash Redis

**Data Storage:**
- Yes, PostgreSQL (Neon)
- Encrypted with AWS KMS
- Retained while active, deleted within 30 days of termination
- Backups retained up to 90 days

**Age Restrictions:**
- 13+ (with parental consent for 13-18)

**Company Details:**
- Name: Quillia
- Email: contact@quillia.app
- Website: https://quillia.app
- Country: Romania
- Address: [NEEDS TO BE PROVIDED]

**Account Creation:**
- Yes, required

**User-Generated Content:**
- Yes, extensive (journal entries, characters, customization)

**Subscriptions:**
- Yes, Free and Tribute ($7/week) plans

**Refund Policy:**
- Currently: Non-refundable (explicitly stated)

**Copyright/Licensing:**
- Users own original content
- License granted for service provision
- AI-generated content terms need clarification

**Liability Limitations:**
- Yes, extensive limitations included

**Account Termination:**
- Yes, users can terminate
- Data deleted within 30 days

---

## ⚠️ ACTION ITEMS FOR YOU:

1. **Provide Business Address:** Replace "[Your Business Address], Romania" in legal docs
2. **Consider Refund Policy:** Current policy is "non-refundable" - decide if you want to offer refunds
3. **Clarify AI Content Licensing:** Specify ownership/licensing of AI-generated content
4. **Add Age Verification:** Consider adding age verification mechanism (currently only stated in Terms)
5. **Review Indemnification Clause:** Ensure indemnification section is complete in Terms

---

**Generated:** Based on comprehensive codebase analysis
**Date:** January 2025
**App Name:** Quillia
**Version Analyzed:** Current codebase state

