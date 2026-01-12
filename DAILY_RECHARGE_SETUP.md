# Daily Credit Recharge System

## Overview

The daily credit recharge system automatically adds **10 Ink Vials** to every user's account every 24 hours.

## How It Works

### 1. **Automatic Recharge**
- Every user receives 10 Ink Vials every 24 hours
- The recharge is tracked using the `lastDailyRecharge` field in the User model
- If a user has never received a recharge, their account creation date is used as the baseline

### 2. **Dual System**
- **Primary**: Cron job runs daily at midnight UTC (`/api/cron/daily-recharge`)
- **Fallback**: Automatic check when users check their credit balance (`/api/credits/balance`)
  - If 24 hours have passed since last recharge, credits are added automatically
  - This ensures users get recharged even if the cron job fails

### 3. **Tracking**
- Each daily recharge is recorded as a `CreditPurchase` with:
  - `packageName`: "daily-recharge"
  - `price`: 0 (free)
  - `metadata`: Contains recharge timestamp

## Setup

### 1. Run Database Migration

```bash
npx prisma migrate deploy
```

Or for development:
```bash
npx prisma migrate dev
```

This adds the `lastDailyRecharge` field to the User table.

### 2. Vercel Cron Configuration

The `vercel.json` file is already configured with:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-recharge",
      "schedule": "0 0 * * *"
    }
  ]
}
```

This runs the cron job daily at midnight UTC.

### 3. Environment Variables (Optional)

If you want to secure the cron endpoint, add to your `.env`:
```
CRON_SECRET=your-secret-token-here
```

Then the cron endpoint will require authentication (unless called by Vercel Cron, which is automatically allowed).

## API Endpoints

### `/api/cron/daily-recharge` (GET/POST)
- **Purpose**: Process daily recharge for all eligible users
- **Authentication**: Optional (via `CRON_SECRET` env var or Vercel Cron header)
- **Returns**: Statistics about how many users were recharged

### `/api/credits/balance` (GET)
- **Purpose**: Get user's credit balance (with automatic recharge check)
- **Authentication**: Required (user session)
- **Returns**: Credits, isLow flag, and whether a recharge was applied

## Functions

### `processDailyRecharge(userId: string)`
Processes daily recharge for a single user if eligible.

### `processDailyRechargeForAllUsers()`
Processes daily recharge for all eligible users (used by cron job).

### `isEligibleForDailyRecharge(userId: string)`
Checks if a user is eligible for daily recharge (24 hours have passed).

## Testing

### Manual Test
1. Set a user's `lastDailyRecharge` to more than 24 hours ago (or null for new users)
2. Call `/api/credits/balance` for that user
3. Verify credits increased by 10 and `lastDailyRecharge` was updated

### Cron Job Test
1. Call `/api/cron/daily-recharge` manually
2. Check logs for recharge statistics
3. Verify eligible users received credits

## Notes

- The recharge amount is set to **10 Ink Vials** (configurable via `DAILY_RECHARGE_AMOUNT` constant)
- Recharge happens based on UTC time (24-hour intervals)
- The system is idempotent - users won't receive multiple recharges if called multiple times
- Daily recharges are tracked in the `CreditPurchase` table for audit purposes

