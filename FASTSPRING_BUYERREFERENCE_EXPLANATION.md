# FastSpring `buyerReference` Explanation

## What is `buyerReference`?

`buyerReference` is a **custom identifier** that you can set when creating a FastSpring checkout session. It's designed to link FastSpring orders/subscriptions to your internal user IDs.

## How It's Supposed to Work

1. **During Checkout**: You set `account.buyerReference` to your user's ID when creating the checkout session
   ```javascript
   fastspring.builder.push({
     account: {
       buyerReference: user.id  // e.g., "clx123abc456"
     },
     products: [...]
   });
   ```

2. **In Webhooks**: FastSpring should include this `buyerReference` in webhook payloads so you can match events to users
   ```json
   {
     "subscription": {
       "id": "i-9emff7T0eFgq12DsZ6ng",
       "account": {
         "buyerReference": "clx123abc456"  // ← Should be here
       }
     }
   }
   ```

3. **Your Code**: You use it to find the user in your database
   ```typescript
   const userId = subscription.account.buyerReference;
   const user = await db.user.findUnique({ where: { id: userId } });
   ```

## The Problem You're Experiencing

Looking at your webhook logs, the `subscription.activated` event shows:
```json
{
  "account": "1tA6rzIRRAa4TYnrktHFuA",  // ← Just an ID string, not an object
  "buyerReference": undefined          // ← Missing!
}
```

**Why this happens:**
1. FastSpring sometimes doesn't propagate `buyerReference` to all webhook events
2. The `account` field is often just an ID string instead of an object with `buyerReference`
3. This is a known limitation/inconsistency in FastSpring's API

## Why Client-Side Linking Works Better

Instead of relying on `buyerReference` in webhooks (which is unreliable), we:

1. **Set `buyerReference` during checkout** (for FastSpring's records)
2. **Link immediately after checkout** using the active user session:
   - When `fsc:order.complete` fires in the browser, we have the user's session
   - We call `/api/fastspring/subscription/link` with the `subscriptionId`
   - The API uses the session to get the user ID (no matching needed!)
   - This happens **before** webhooks arrive, so the subscription is already linked

3. **Webhooks become secondary** - they just update subscription status, not link it

## Current Flow

```
User clicks "Start Tribute"
  ↓
Checkout opens with buyerReference set
  ↓
User completes payment
  ↓
fsc:order.complete event fires (client-side)
  ↓
Client calls /api/fastspring/subscription/link (uses active session)
  ↓
Subscription linked to user ✅
  ↓
Webhook arrives later (subscription.activated)
  ↓
Webhook finds subscription already linked, just updates status ✅
```

## Summary

- **`buyerReference`**: A custom field to link FastSpring to your users
- **Problem**: FastSpring doesn't always include it in webhooks
- **Solution**: Client-side linking using the active session (more reliable)
- **Webhooks**: Still useful for status updates, but not for initial linking

The client-side linking approach is actually **more reliable** than relying on `buyerReference` in webhooks because:
- ✅ No dependency on FastSpring's webhook payload structure
- ✅ Works immediately (no waiting for webhooks)
- ✅ Uses the authenticated session (guaranteed to be correct)
- ✅ Handles race conditions better


