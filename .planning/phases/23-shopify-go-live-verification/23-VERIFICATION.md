# Phase 23: Shopify Go-Live Verification

**Version:** 1.0
**Runbook pre-filled:** 2026-03-01
**Executed by:** [your name]
**Execution date:** [date]

---

> This document is both a runbook and a results log. Follow each section in order. Check the box and add a screenshot path and notes after each verification step.

---

## SHOP-01: Product Audit

**Where:** Shopify Admin -> Products

**Steps:**
1. Go to Admin -> Products
2. Review each product for:
   - At least one image (not the default grey placeholder)
   - A description (not blank)
   - A price greater than $0
   - Inventory tracked OR "Continue selling when out of stock" enabled
   - Status: "Active" (published to Online Store)
3. Cross-check storefront: visit `https://wildenflower.com/collections/all` -- no broken images, no missing prices

- [ ] Confirmed -- all products have images, descriptions, prices, inventory, and Active status

Screenshot: <!-- e.g., .planning/phases/23-shopify-go-live-verification/screenshots/shop-01-products.png -->
Notes: <!-- Number of products reviewed, any issues found and resolved -->

---

## SHOP-02: Shopify Payments & Test Purchase

**Where:** Shopify Admin -> Settings -> Payments

**Pre-requisite:** Complete SHOP-08 (webhook endpoint deployed and registered) before this step, so the test order triggers a real Resend email.

**Steps:**
1. Admin -> Settings -> Payments
2. If a live payment provider (Shopify Payments / Stripe) is active, note it -- you will reactivate it after testing
3. Click "(for testing) Bogus Gateway" -> Activate
4. Go to `https://wildenflower.com` -> add any product to cart -> proceed to checkout
5. At payment step, enter credit card number `1` (triggers success), any name/expiry/CVV
6. Complete the order
7. In Admin -> Orders: confirm the order appears with status "Paid"
8. Check email inbox for the Resend order confirmation email from `hello@wildenflower.com`
9. Admin -> Settings -> Payments -> Deactivate Bogus Gateway immediately
10. Reactivate the live payment provider if one was active in step 2

- [ ] Confirmed -- test order placed, appears in Admin -> Orders as Paid

- [ ] Confirmed -- Resend order confirmation email received from hello@wildenflower.com

- [ ] Confirmed -- Bogus Gateway deactivated after test

Screenshot: <!-- e.g., .planning/phases/23-shopify-go-live-verification/screenshots/shop-02-order.png -->
Notes: <!-- Order number, email receipt time, any issues -->

---

## SHOP-03: Shipping Zones

**Where:** Shopify Admin -> Settings -> Shipping and delivery

**Steps:**
1. Admin -> Settings -> Shipping and delivery -> Manage rates (under "Shipping" not "Local delivery")
2. Create zone **"Domestic (US)"**:
   - Countries: United States
   - Add rate: Standard -- $5.00
   - Add rate: Expedited -- $15.00
   - Add rate: Free shipping -- condition "Order price is at least $75.00"
3. Create zone **"Canada"**:
   - Countries: Canada
   - Add rate: Standard -- $12.00
   - Add rate: Expedited -- $25.00
   - (No free shipping tier for Canada)
4. Verify: go to storefront -> add a product -> checkout -> enter a US address -> confirm you see "Standard $5.00" and "Expedited $15.00" in shipping options
5. Verify: repeat with a Canadian address -> confirm "Standard $12.00" and "Expedited $25.00"

Note: International shipping (outside US + Canada) is deferred to a future phase.

- [ ] Confirmed -- Domestic (US) zone created with 3 rates (standard $5, expedited $15, free at $75+)

- [ ] Confirmed -- Canada zone created with 2 rates (standard $12, expedited $25)

- [ ] Confirmed -- rates appear correctly at checkout for US and Canadian addresses

Screenshot: <!-- e.g., .planning/phases/23-shopify-go-live-verification/screenshots/shop-03-shipping.png -->
Notes: <!-- Any zones that already existed and were modified vs newly created -->

---

## SHOP-04: Tax Configuration

**Where:** Shopify Admin -> Settings -> Taxes and duties

**Steps:**
1. Admin -> Settings -> Taxes and duties
2. Under "Tax regions", click "United States"
3. Enable **Shopify Tax** (automatic tax calculation by customer address) -- NOT manual rates
4. Under "United States -> Override rates" or "Nexus" settings:
   - Add state: **Kentucky** -> enter your KY sales tax registration ID
   - Add state: **Ohio** -> enter your OH sales tax registration ID
5. Confirm no other state nexus is configured at this time (international and other US states deferred)

Note: Actual KY and OH tax registration IDs must be provided by you -- Claude cannot supply these.

- [ ] Confirmed -- Shopify Tax (automatic) is enabled for United States

- [ ] Confirmed -- Kentucky nexus configured with KY sales tax ID

- [ ] Confirmed -- Ohio nexus configured with OH sales tax ID

Screenshot: <!-- e.g., .planning/phases/23-shopify-go-live-verification/screenshots/shop-04-taxes.png -->
Notes: <!-- KY tax ID last 4 digits (for reference only), OH tax ID last 4 digits -->

---

## SHOP-05: Disable Store Password Page

**Where:** Shopify Admin -> Online Store -> Preferences

**Steps:**
1. Admin -> Online Store -> Preferences
2. Scroll to "Password protection" section
3. Ensure "Restrict access to visitors with the password" is **unchecked / disabled**
4. Save if changed
5. Open a new incognito browser window
6. Visit `https://wildenflower.com`
7. Confirm you see the storefront (hero, products) -- NOT a password entry page

- [ ] Confirmed -- password protection is disabled

- [ ] Confirmed -- incognito visit to wildenflower.com shows storefront, not password gate

Screenshot: <!-- e.g., .planning/phases/23-shopify-go-live-verification/screenshots/shop-05-no-password.png -->
Notes: <!-- Was password protection enabled before? Anything unexpected -->

---

## SHOP-06: Storefront API Token Validation

**Where:** `https://wildenflower.com/api/test-shopify` (existing test route)

**Steps:**
1. In terminal or browser, run:
   ```bash
   curl https://wildenflower.com/api/test-shopify
   ```
2. Confirm response contains `"success": true`
3. Confirm the response includes `products` and `collections` data (not an error)
4. If the response shows an error: Admin -> Apps and sales channels -> Develop apps -> [your app] -> API credentials -> confirm Storefront API scopes include `unauthenticated_read_product_listings` and `unauthenticated_read_collection_listings`

- [ ] Confirmed -- /api/test-shopify returns success: true with products and collections data

Screenshot: <!-- e.g., .planning/phases/23-shopify-go-live-verification/screenshots/shop-06-api.png -->
Notes: <!-- Paste the response summary or any scopes that were missing and fixed -->

---

## SHOP-07: Collection Handle Verification

**Where:** `https://wildenflower.com/api/test-shopify` response + Shopify Admin -> Products -> Collections

**Expected handles (must ALL be present):** `tie-dye`, `leather`, `jewelry`, `crystals`, `artwork`, `ceramics`

**Steps:**
1. Run:
   ```bash
   curl https://wildenflower.com/api/test-shopify | python3 -m json.tool | grep handle
   ```
   (or review the JSON in browser)
2. Confirm all 6 handles appear in the `collections.items[].handle` array
3. For any missing handle: Admin -> Products -> Collections -> open that collection -> scroll to "Search engine listing" -> check the URL handle field matches exactly
4. Visit each collection URL on the storefront to confirm it resolves:
   - `https://wildenflower.com/collections/tie-dye`
   - `https://wildenflower.com/collections/leather`
   - `https://wildenflower.com/collections/jewelry`
   - `https://wildenflower.com/collections/crystals`
   - `https://wildenflower.com/collections/artwork`
   - `https://wildenflower.com/collections/ceramics`

- [ ] Confirmed -- all 6 collection handles present in /api/test-shopify response

- [ ] Confirmed -- all 6 /collections/[handle] URLs resolve on the storefront

Screenshot: <!-- e.g., .planning/phases/23-shopify-go-live-verification/screenshots/shop-07-collections.png -->
Notes: <!-- Any handles that were missing or mismatched and how they were fixed -->

---

## SHOP-08: Order Confirmation Webhook (Resend)

**Where:** Code (deployed in this phase) + Shopify Admin -> Settings -> Notifications -> Webhooks

**Pre-requisites (complete before this section):**
1. `wildenflower.com` domain verified in Resend dashboard (DKIM + SPF DNS records added and verified) -- see Plan 02
2. `SHOPIFY_WEBHOOK_SECRET` env var set in Vercel production environment -- see Plan 02
3. Updated `lib/email.ts` (from address `hello@wildenflower.com`) deployed to production

**Steps:**
1. **Register webhook in Shopify Admin:**
   - Admin -> Settings -> Notifications -> scroll down to "Webhooks" section
   - Click "Create webhook"
   - Event: "Order payment" (this is `orders/paid`)
   - Format: JSON
   - URL: `https://wildenflower.com/api/webhooks/order-created`
   - API version: `2025-04`
   - Save
2. **Copy the webhook signing secret:**
   - On the Webhooks page, at the bottom: "Your webhooks will be signed with [secret]"
   - Copy this value
3. **Set SHOPIFY_WEBHOOK_SECRET in Vercel:**
   - Vercel Dashboard -> shopsite-prod project -> Settings -> Environment Variables
   - Add variable: `SHOPIFY_WEBHOOK_SECRET` = [copied value]
   - Target: Production only
   - Save and trigger a redeploy (or wait for next deploy)
4. **Shopify default order email -- stub content:**
   - Admin -> Settings -> Notifications -> Order confirmation -> Edit
   - Note: On standard Shopify plans the order confirmation email cannot be fully disabled
   - Replace the email body content with a minimal message:
     > "Thank you for your order! A full order confirmation with all your details has been sent to your email separately."
   - Save
5. **Test via bogus gateway purchase (SHOP-02):** The test purchase in SHOP-02 simultaneously validates this webhook. Confirm Resend email received.

- [ ] Confirmed -- webhook registered in Shopify Admin pointing to /api/webhooks/order-created

- [ ] Confirmed -- SHOPIFY_WEBHOOK_SECRET set in Vercel prod env vars

- [ ] Confirmed -- Shopify default order email content replaced with stub message

- [ ] Confirmed -- Resend order confirmation email received after test purchase (from hello@wildenflower.com)

Screenshot: <!-- e.g., .planning/phases/23-shopify-go-live-verification/screenshots/shop-08-webhook.png -->
Notes: <!-- Webhook ID in Shopify Admin, email received time, sender address shown in email client -->

---

## Summary

| Requirement | Status | Notes |
|-------------|--------|-------|
| SHOP-01: Products | - [ ] Pass | |
| SHOP-02: Payments / Test order | - [ ] Pass | |
| SHOP-03: Shipping zones | - [ ] Pass | |
| SHOP-04: Tax configuration | - [ ] Pass | |
| SHOP-05: Password page disabled | - [ ] Pass | |
| SHOP-06: Storefront API token | - [ ] Pass | |
| SHOP-07: Collection handles | - [ ] Pass | |
| SHOP-08: Order email webhook | - [ ] Pass | |

**Phase 23 complete when all 8 rows show Pass.**
