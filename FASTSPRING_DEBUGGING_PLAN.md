# FastSpring Subscription Linking - Debugging Plan

## Current Problem
- Client-side linking is not working
- Subscriptions end up orphaned (not linked to users)
- `buyerReference` is not appearing in webhooks

## Investigation Steps for Tomorrow

### 1. Verify Client-Side Linking is Actually Running
**Check browser console logs:**
- Look for `🔔 FastSpring order.complete event received` logs
- Check if `subscriptionId` is being extracted correctly
- Verify the API call to `/api/fastspring/subscription/link` is being made
- Check the response from the link API

**Questions to answer:**
- Is the `fsc:order.complete` event firing at all?
- What does the event payload structure actually look like?
- Is the `subscriptionId` present in the event?
- Is the API call succeeding or failing?

### 2. Check API Endpoint Logs
**Verify the link endpoint is receiving requests:**
- Check Vercel logs for `/api/fastspring/subscription/link`
- Look for the `✅ Subscription linked via client-side API` log
- Check for any errors in the link endpoint

**Questions to answer:**
- Is the endpoint being called?
- Is the session valid?
- Is the subscriptionId being received?
- Is the database update succeeding?

### 3. Investigate FastSpring Account/BuyerReference Options

**Option A: Try different ways to set buyerReference**
- Current: `account.buyerReference`
- Try: `account.accountCustomKey` (alternative field)
- Try: Setting it on the account object differently
- Try: Using FastSpring's account creation API first, then checkout

**Option B: Use FastSpring Account API**
- Create/update account via API before checkout
- Set `buyerReference` via API: `PUT /accounts/{accountId}`
- Then use that account in checkout

**Option C: Use FastSpring Tags**
- Set custom tags on products/orders
- Include userId in tags
- Extract from tags in webhooks

### 4. Webhook Fallback Strategy

**If client-side linking fails, enhance webhook matching:**

**Option A: Use initialOrderId to fetch order details**
- In `subscription.activated`, use `initialOrderId`
- Fetch order from FastSpring API
- Order might have `buyerReference` even if subscription doesn't

**Option B: Store temporary mapping**
- When checkout completes, store `orderId -> userId` mapping temporarily
- In webhook, use `initialOrderId` to look up user
- Clean up mapping after subscription is linked

**Option C: Use account ID to email lookup**
- Get account details from FastSpring API using account ID
- Match account email to user email
- Only as last resort (user mentioned email matching issues)

### 5. FastSpring Documentation Review
- Check FastSpring docs for `buyerReference` best practices
- Look for known issues or workarounds
- Check FastSpring support/community for similar issues
- Verify we're using the correct API version

### 6. Alternative Approaches

**Option A: Pre-create FastSpring Account**
1. When user signs up, create FastSpring account via API
2. Set `buyerReference` via API
3. Store FastSpring account ID in user record
4. Use account ID in checkout instead of `buyerReference`

**Option B: Use Order Reference**
1. Generate unique order reference with userId: `order-{userId}-{timestamp}`
2. Set as `orderReference` in checkout
3. In webhook, parse userId from order reference
4. Match to user

**Option C: Hybrid Approach**
1. Try client-side linking (primary)
2. If fails, webhook uses `initialOrderId` to fetch order
3. Order should have `buyerReference` if set correctly
4. Fallback to account email matching (last resort)

## Priority Order for Tomorrow

1. **First**: Check browser console and API logs to see why client-side linking is failing
   - This will tell us if it's an event issue, API issue, or database issue

2. **Second**: If client-side is broken, try the `initialOrderId` webhook fallback
   - Fetch order from FastSpring API using `initialOrderId`
   - Order might have `buyerReference` even if subscription doesn't

3. **Third**: If buyerReference still not working, try FastSpring Account API
   - Pre-create account with `buyerReference` set
   - Use account ID in checkout

4. **Fourth**: Consider order reference approach
   - Embed userId in order reference
   - Parse in webhook

## Key Files to Check Tomorrow

1. `src/components/TributePage.tsx` - Client-side event handler
2. `src/app/api/fastspring/subscription/link/route.ts` - Link endpoint
3. `src/app/api/fastspring/webhook/route.ts` - Webhook handler
4. Browser console logs during checkout
5. Vercel function logs for both endpoints

## Questions to Answer

1. Is the `fsc:order.complete` event firing?
2. What does the event payload structure look like?
3. Is `subscriptionId` in the event?
4. Is the link API being called?
5. Is the link API succeeding?
6. What does FastSpring API return when we fetch the order by `initialOrderId`?
7. Does the order have `buyerReference` even if subscription doesn't?

## Potential Quick Wins

1. **Add more defensive logging** - Log every step of the process
2. **Add retry logic** - If client-side linking fails, retry a few times
3. **Add webhook retry** - If webhook can't find user, fetch order and retry
4. **Store order-to-user mapping** - Temporary cache to help webhooks match

## Notes

- The user mentioned email matching is problematic (different emails in checkout vs account)
- Client-side linking should work but isn't - need to find why
- `buyerReference` is the "proper" way but FastSpring isn't propagating it
- Need a reliable fallback that doesn't depend on email matching


