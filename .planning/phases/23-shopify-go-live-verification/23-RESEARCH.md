# Phase 23: Shopify Go-Live Verification - Research

**Researched:** 2026-03-01
**Domain:** Shopify Admin configuration verification + Shopify webhook (orders/paid) + Resend custom domain
**Confidence:** HIGH (webhook code), MEDIUM (admin checklist steps — browser-based, can't auto-verify)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Shipping Regions (SHOP-03)**
- US + Canada at go-live; international to be added in a future phase after US + Canada are working
- Use flat rates (not carrier-calculated)
- US rates: $5 standard / $15 expedited; free shipping on orders $75+
- Canada rates: $12 standard / $25 expedited; no free shipping tier for Canada
- Configure as two shipping zones: "Domestic (US)" and "Canada"

**Tax Configuration (SHOP-04)**
- Collect sales tax in Kentucky and Ohio (nexus in both states)
- Use Shopify Tax (automatic calculation by address) — not manual rates
- No other markets to configure at go-live

**Order Confirmation Email Webhook (SHOP-08)**
- Build a new Shopify webhook at `/api/webhooks/order-created` — do NOT reuse or replace the existing `/api/email/order-confirmation` endpoint
- Shopify fires `orders/paid` webhook → new endpoint handles Shopify's native order payload → sends Resend email
- Replace Shopify's default order confirmation email (disable it) — customer receives only the Resend-branded email
- Update the Resend `from` address to `hello@wildenflower.com` (requires verifying wildenflower.com domain in Resend)
- Webhook endpoint must verify Shopify HMAC signature before processing
- SHOP-08 is the only code-writing task in this phase; all other SHOP-XX items are Shopify Admin configuration

**Verification Artifact**
- Produce `23-VERIFICATION.md` in the phase directory
- Format: runbook + results log combined — each SHOP-XX item includes:
  1. What to do and where to go in Shopify Admin (instructions)
  2. `- [ ] Confirmed` checkbox
  3. `Screenshot:` placeholder for file path
  4. `Notes:` line for free-text evidence
- The planner should pre-fill the runbook instructions; the executor fills in the checkboxes/screenshots

### Claude's Discretion
- HMAC signature verification implementation details for the webhook
- Exact GraphQL fields extracted from Shopify's order payload to populate the email template
- Resend domain verification steps (documented as a prerequisite, not automated)
- Order of verification steps within the runbook

### Deferred Ideas (OUT OF SCOPE)
- International shipping zones — after US + Canada go-live is verified
- Carrier-calculated rates (USPS/UPS/FedEx live) — future phase if flat rates prove insufficient
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SHOP-01 | All products published in Shopify with images, descriptions, prices, and inventory configured | Runbook: Admin → Products checklist; visual audit via /collections/all |
| SHOP-02 | Shopify Payments configured; test order placed using bogus gateway and succeeded | Runbook: bogus gateway activation steps; confirmed in Admin → Orders |
| SHOP-03 | Shipping zones and rates configured for intended delivery regions | Runbook: two zones (Domestic US / Canada) with flat rates as decided |
| SHOP-04 | Tax settings configured for applicable markets | Runbook: Shopify Tax + KY + OH nexus registration steps |
| SHOP-05 | Store password ("coming soon") page disabled | Runbook: Online Store → Preferences → disable password |
| SHOP-06 | Storefront API token confirmed valid with correct permissions on production store | Existing `/api/test-shopify` route is the verification tool |
| SHOP-07 | Collection handles in Shopify match URL routes in storefront (`/collections/[handle]`) | Known handles from code: tie-dye, leather, jewelry, crystals, artwork, ceramics |
| SHOP-08 | Order confirmation email (Resend) verified to send after a test purchase | New file: `app/api/webhooks/order-created/route.ts`; HMAC + Resend email |
</phase_requirements>

---

## Summary

Phase 23 is a mixed phase: seven items (SHOP-01 through SHOP-07) are pure Shopify Admin configuration checks documented in a runbook, and one item (SHOP-08) is code. The runbook format is a prerequisite for all items — the planner should produce `23-VERIFICATION.md` as a pre-filled runbook that a non-technical founder can execute. The code task (SHOP-08) builds a new Next.js App Router route at `app/api/webhooks/order-created/route.ts` that receives Shopify's `orders/paid` webhook, verifies its HMAC signature, and sends a Resend-branded order confirmation email.

One critical constraint to flag: **Shopify's default order confirmation email cannot be disabled on standard (non-Plus) plans.** The CONTEXT.md decision to "replace Shopify's default order confirmation email (disable it)" is not achievable on standard plans. The practical workaround is to replace the _content_ of the default Shopify email with a minimal "Thank you" redirect message, and deliver the full branded confirmation via Resend. Alternatively, the Shopify default email can be modified to strip all order detail content. The planner should note this limitation in the plan and choose the workaround approach.

The webhook code itself uses Node.js built-in `crypto` (no new dependencies), reads the raw body via `await request.text()` (Next.js App Router supports this natively without disabling a body parser), and reuses the existing `sendEmail()` helper and `OrderConfirmationEmail` component. The only new secret is `SHOPIFY_WEBHOOK_SECRET` which comes from Shopify Admin → Settings → Notifications → Webhooks (shared secret shown at the bottom of the webhooks list).

**Primary recommendation:** Build SHOP-08 first (the webhook endpoint must be deployed to production before it can be registered in Shopify Admin and tested), then execute the runbook items in order, ending with the test purchase that validates SHOP-02 and SHOP-08 simultaneously.

---

## Standard Stack

### Core — No New Dependencies Required

| Library / API | Version | Purpose | Why Standard |
|---------------|---------|---------|--------------|
| Node.js `crypto` | built-in | HMAC-SHA256 signature verification | Built into Node; no install; `timingSafeEqual` prevents timing attacks |
| Next.js App Router `NextRequest` | 16.1.1 | Raw body access via `request.text()` | No body parser to disable — App Router uses Web API `Request` natively |
| Resend SDK | already installed | Send branded order confirmation email | Already wired via `lib/email.ts` and `sendEmail()` |
| `@shopify/storefront-api-client` | 1.0.9 | SHOP-06/07: Storefront API token validation | Already installed; `getCollections()` returns handles for SHOP-07 check |

**Installation:** No new packages. All code uses existing dependencies or Node.js built-ins.

---

## Architecture Patterns

### SHOP-08: Webhook Endpoint Structure

```
app/
└── api/
    └── webhooks/
        └── order-created/
            └── route.ts    ← new file (SHOP-08)
```

The existing files to reuse (no modifications):
- `lib/email.ts` — `sendEmail()` helper
- `components/emails/order-confirmation-email.tsx` — `OrderConfirmationEmail` component
- `lib/email.ts` — `from` address **must be updated** to `hello@wildenflower.com` (currently `onboarding@resend.dev`)

### Pattern 1: Shopify Webhook HMAC Verification (Next.js App Router)

**What:** Verify every incoming Shopify webhook request using HMAC-SHA256. Shopify sends the signature in the `X-Shopify-Hmac-SHA256` header as a base64-encoded string.

**Key insight for App Router:** Unlike Pages Router API routes, App Router route handlers receive a standard Web `Request`. There is no automatic body parsing to disable. Call `await request.text()` directly to get the raw body string — this is the value used for HMAC computation.

**When to use:** On every POST to the webhook endpoint, before any processing.

```typescript
// Source: Shopify official docs (shopify.dev/docs/apps/build/webhooks/subscribe/https)
// + Next.js App Router docs (nextjs.org/docs/app/getting-started/route-handlers)
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function verifyShopifyWebhook(rawBody: string, hmacHeader: string, secret: string): boolean {
  const digest = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');

  // timingSafeEqual prevents timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(hmacHeader)
  );
}

export async function POST(request: NextRequest) {
  const hmacHeader = request.headers.get('x-shopify-hmac-sha256');
  if (!hmacHeader) {
    return NextResponse.json({ error: 'Missing HMAC header' }, { status: 401 });
  }

  // Raw body — MUST be read before any JSON parsing
  const rawBody = await request.text();

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[webhook] SHOPIFY_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  if (!verifyShopifyWebhook(rawBody, hmacHeader, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Safe to parse after verification
  const order = JSON.parse(rawBody);
  // ... process order
}
```

### Pattern 2: Mapping Shopify orders/paid Payload to Email Props

The `orders/paid` webhook payload contains all fields needed to populate `OrderConfirmationEmail`. The mapping is:

```typescript
// Source: Shopify webhook payload reference (inventivehq.com, verified against official schema)
// orders/paid payload field → OrderConfirmationEmail prop

const order = JSON.parse(rawBody);

// Customer name: order.customer.first_name + order.customer.last_name
const customerName = `${order.customer?.first_name ?? ''} ${order.customer?.last_name ?? ''}`.trim();

// Order number: order.order_number (integer, e.g. 1234 → display as "#1234")
const orderNumber = String(order.order_number);

// Line items: order.line_items[]
const items = order.line_items.map((item: ShopifyLineItem) => ({
  title: item.title,
  quantity: item.quantity,
  price: `$${parseFloat(item.price).toFixed(2)}`,
  // Note: line_items do NOT include image URLs in the REST webhook payload
  // imageUrl is omitted (the email component handles missing imageUrl gracefully)
  variantTitle: item.variant_title ?? undefined,
}));

// Shipping address: order.shipping_address
const shippingAddress = {
  name: `${order.shipping_address.first_name} ${order.shipping_address.last_name}`,
  address1: order.shipping_address.address1,
  address2: order.shipping_address.address2 ?? undefined,
  city: order.shipping_address.city,
  province: order.shipping_address.province,
  zip: order.shipping_address.zip,
  country: order.shipping_address.country,
};

// Totals
const subtotal  = `$${parseFloat(order.subtotal_price).toFixed(2)}`;
const tax       = `$${parseFloat(order.total_tax).toFixed(2)}`;
const total     = `$${parseFloat(order.total_price).toFixed(2)}`;

// Shipping cost: order.shipping_lines[0].price
const shippingCost = order.shipping_lines?.[0]?.price
  ? `$${parseFloat(order.shipping_lines[0].price).toFixed(2)}`
  : 'Free';

// Order status URL: order.order_status_url
const orderStatusUrl = order.order_status_url ?? undefined;

// Customer email: order.email (or order.contact_email)
const customerEmail = order.email || order.contact_email;
```

**Important:** The REST webhook payload does NOT include product image URLs in `line_items`. The `OrderConfirmationEmail` component already handles `imageUrl?: undefined` gracefully (the image block is conditionally rendered).

### Pattern 3: Storefront API Token Validation (SHOP-06 + SHOP-07)

The existing `/api/test-shopify` route already does this. For phase verification:

1. Hit `https://wildenflower.com/api/test-shopify` in browser or curl
2. Confirm JSON response with `success: true` and collections list
3. Cross-check the collection `handle` values in the response against the 6 expected handles in code: `tie-dye`, `leather`, `jewelry`, `crystals`, `artwork`, `ceramics`

```typescript
// Source: app/api/test-shopify/route.ts (existing)
// lib/shopify-helpers.ts VALID_HANDLES set (existing)
const VALID_HANDLES = ['tie-dye', 'leather', 'jewelry', 'crystals', 'artwork', 'ceramics'];
```

### Pattern 4: Resend from Address Update

In `lib/email.ts`, the `from` field currently reads:
```typescript
from: 'Wildenflower <onboarding@resend.dev>', // Default Resend test domain
```

It must be updated to:
```typescript
from: 'Wildenflower <hello@wildenflower.com>',
```

This requires wildenflower.com to be verified in the Resend dashboard **before deployment**. If the domain is not yet verified, Resend will reject sends from that address.

### Anti-Patterns to Avoid

- **Do not use `request.json()`** before HMAC verification — this consumes the body stream. Use `request.text()` first, then `JSON.parse()` after verification.
- **Do not use string equality (`===`) to compare HMAC values** — use `crypto.timingSafeEqual()` to prevent timing attacks.
- **Do not register the webhook URL in Shopify Admin pointing to localhost** — it must point to the production URL (`https://wildenflower.com/api/webhooks/order-created`). Deploy the endpoint first.
- **Do not apply `export const dynamic = 'force-static'`** to the webhook route — it must be a dynamic (runtime) route.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HMAC signature verification | Custom crypto logic | Node.js built-in `crypto.createHmac` + `timingSafeEqual` | Built-in is correct and timing-safe; custom implementations often miss timing attack vector |
| Order email sending | New email service client | `sendEmail()` from `lib/email.ts` | Already wired to Resend, handles mock mode, returns structured result |
| Email template | New HTML template | `OrderConfirmationEmail` from `components/emails/order-confirmation-email.tsx` | Already built; already handles all props including optional imageUrl |
| Storefront API validation | New test endpoint | Existing `/api/test-shopify` route | Already returns product + collection data with handles |
| Shopify Admin API access | Raw fetch | `adminApiFetch()` from `lib/shopify-admin.ts` | Already handles auth, token refresh, GraphQL errors |

**Key insight:** SHOP-08 is almost entirely wiring. The email template, send helper, and Storefront API test route all exist. The only new code is the webhook endpoint itself and the `from` address update.

---

## Common Pitfalls

### Pitfall 1: Shopify Default Order Email Cannot Be Disabled on Standard Plans

**What goes wrong:** CONTEXT.md says to "disable" Shopify's default order confirmation email. On standard Shopify plans, this is not possible. Shopify requires sending the order confirmation by law in most countries.

**Why it happens:** Shopify Plus grants full notification suppression; standard plans do not.

**How to avoid:** Choose one of two workarounds:
1. **Minimal content replacement (recommended):** Edit the default Shopify order confirmation email template (Admin → Settings → Notifications → Order confirmation) to contain only: "Thank you for your order — a full confirmation has been sent to your email separately." This way both emails send, but Shopify's is a stub.
2. **Third-party app suppression:** Use an app like Omnisend or Klaviyo to suppress Shopify's email — overkill for this use case.

**Warning signs:** If you attempt to toggle off the order confirmation notification and cannot find a toggle, it's because the toggle doesn't exist on standard plans.

### Pitfall 2: Raw Body Already Consumed Before HMAC Check

**What goes wrong:** Calling `await request.json()` before HMAC verification consumes the body stream. Subsequent calls to `request.text()` return an empty string, causing HMAC to always fail.

**Why it happens:** Web API `Request` body is a readable stream — it can only be consumed once.

**How to avoid:** Always call `await request.text()` first. Parse JSON with `JSON.parse(rawBody)` after verification.

**Warning signs:** HMAC verification consistently fails even with correct secret; logging `rawBody` shows empty string.

### Pitfall 3: Webhook Registered Before Endpoint Is Deployed

**What goes wrong:** Registering the webhook URL in Shopify Admin before the production endpoint exists causes Shopify to fire failed requests. After several failures Shopify may auto-disable the webhook subscription.

**Why it happens:** Shopify tests the endpoint at registration time and continues to mark the webhook as failing if it consistently returns non-2xx.

**How to avoid:** Deploy `app/api/webhooks/order-created/route.ts` to production first, confirm the URL returns 401 (correct — Shopify's test payload won't have a valid HMAC but a 401 is better than a 404), then register in Admin.

**Warning signs:** Shopify Admin shows "Failed" status on the webhook subscription.

### Pitfall 4: Resend Domain Not Verified Before Updating `from` Address

**What goes wrong:** Updating `lib/email.ts` to use `hello@wildenflower.com` before the domain is verified in Resend causes all email sends to fail with a domain-not-verified error.

**Why it happens:** Resend rejects sends from unverified domains.

**How to avoid:** Verify wildenflower.com in Resend dashboard first (add DKIM + SPF DNS records, click "Verify DNS Records"). DNS propagation can take up to 48 hours. Only update the `from` address after verification shows "Verified" in the dashboard.

**Warning signs:** Resend API returns error about domain verification; emails not delivered.

### Pitfall 5: Shopify Webhook Secret vs. Storefront API Token Confusion

**What goes wrong:** Using the Storefront API access token as `SHOPIFY_WEBHOOK_SECRET`.

**Why it happens:** Both are "Shopify secrets" but they are different things for different purposes.

**How to avoid:** The webhook signing secret is found at Admin → Settings → Notifications → Webhooks → (shared secret, shown at bottom of the list). It is NOT the Storefront API token.

**Warning signs:** HMAC verification always fails in production even when code is correct.

### Pitfall 6: Bogus Gateway Test Purchase Blocks Real Orders

**What goes wrong:** Leaving the bogus gateway activated after testing prevents real customers from paying.

**Why it happens:** While bogus gateway is active, real payment processors may be deactivated.

**How to avoid:** Immediately deactivate the bogus gateway after the test purchase succeeds. The VERIFICATION.md checklist should include this as a step immediately following the test order.

---

## Code Examples

Verified patterns from official sources and project codebase:

### Complete Webhook Handler Skeleton

```typescript
// Source: Shopify docs (shopify.dev/docs/apps/build/webhooks/subscribe/https)
// + existing project patterns from app/api/email/order-confirmation/route.ts
// File: app/api/webhooks/order-created/route.ts

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';
import { OrderConfirmationEmail } from '@/components/emails/order-confirmation-email';

// Disable caching for this dynamic route
export const dynamic = 'force-dynamic';

function verifyShopifyHmac(rawBody: string, hmacHeader: string, secret: string): boolean {
  try {
    const digest = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('base64');

    return crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(hmacHeader)
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  // 1. Read raw body FIRST (before any JSON parsing)
  const rawBody = await request.text();

  // 2. Extract and verify HMAC
  const hmacHeader = request.headers.get('x-shopify-hmac-sha256');
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  if (!hmacHeader || !secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!verifyShopifyHmac(rawBody, hmacHeader, secret)) {
    console.error('[order-created webhook] HMAC verification failed');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. Parse payload (safe now that signature is verified)
  let order;
  try {
    order = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // 4. Extract fields for email
  const customerEmail = order.email || order.contact_email;
  const customerName = [order.customer?.first_name, order.customer?.last_name]
    .filter(Boolean).join(' ') || 'Valued Customer';
  const orderNumber = String(order.order_number);

  const items = (order.line_items ?? []).map((item: {
    title: string;
    quantity: number;
    price: string;
    variant_title?: string;
  }) => ({
    title: item.title,
    quantity: item.quantity,
    price: `$${parseFloat(item.price).toFixed(2)}`,
    variantTitle: item.variant_title ?? undefined,
    // imageUrl omitted — not present in REST webhook payload
  }));

  const shippingAddress = {
    name: [order.shipping_address?.first_name, order.shipping_address?.last_name]
      .filter(Boolean).join(' '),
    address1: order.shipping_address?.address1 ?? '',
    address2: order.shipping_address?.address2 ?? undefined,
    city: order.shipping_address?.city ?? '',
    province: order.shipping_address?.province ?? '',
    zip: order.shipping_address?.zip ?? '',
    country: order.shipping_address?.country ?? '',
  };

  // 5. Send email
  if (!customerEmail) {
    console.error('[order-created webhook] No customer email in payload');
    return NextResponse.json({ received: true }); // Still 200 — Shopify doesn't retry on missing email
  }

  const result = await sendEmail({
    to: customerEmail,
    subject: `Order Confirmed #${orderNumber}`,
    react: OrderConfirmationEmail({
      orderNumber,
      customerName,
      items,
      subtotal: `$${parseFloat(order.subtotal_price ?? '0').toFixed(2)}`,
      shipping: order.shipping_lines?.[0]?.price
        ? `$${parseFloat(order.shipping_lines[0].price).toFixed(2)}`
        : 'Free',
      tax: `$${parseFloat(order.total_tax ?? '0').toFixed(2)}`,
      total: `$${parseFloat(order.total_price ?? '0').toFixed(2)}`,
      shippingAddress,
      orderStatusUrl: order.order_status_url ?? undefined,
    }),
  });

  if (!result.success) {
    console.error('[order-created webhook] Email send failed:', result.error);
    // Return 200 anyway — if we return 5xx, Shopify will retry, causing duplicate emails
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
```

### Bogus Gateway Test Purchase (Shopify Admin)

```
Admin → Settings → Payments
→ Deactivate any live payment provider (if present)
→ Click "(for testing) Bogus Gateway" → Activate
→ Go to storefront → Add item to cart → Checkout
→ At payment: enter credit card number "1" (succeeds)
→ Complete order
→ Check Admin → Orders → confirm order appears with status "paid"
→ Check email for Resend confirmation
→ Admin → Settings → Payments → Deactivate Bogus Gateway
```

### Webhook Registration in Shopify Admin

```
Admin → Settings → Notifications → scroll to "Webhooks"
→ Create webhook
  Event: "Order payment" (= orders/paid)
  Format: JSON
  URL: https://wildenflower.com/api/webhooks/order-created
  API version: 2025-04 (match lib/shopify.ts apiVersion)
→ Save
→ Note the "Your webhooks will be signed with..." shared secret at bottom of page
→ Copy secret → set as SHOPIFY_WEBHOOK_SECRET in Vercel prod env vars
```

### Storefront API Validation (SHOP-06 + SHOP-07)

```bash
# Validate Storefront API token and retrieve collection handles
curl https://wildenflower.com/api/test-shopify

# Expected response:
# { "success": true, "data": { "products": {...}, "collections": { "items": [
#   { "handle": "tie-dye", ... },
#   { "handle": "leather", ... },
#   ...
# ]}}}

# Cross-check handles against VALID_HANDLES in lib/shopify-helpers.ts:
# tie-dye, leather, jewelry, crystals, artwork, ceramics
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router `bodyParser: false` + `raw-body` npm package | App Router `await request.text()` (native Web API) | Next.js 13 App Router | No extra dependency; no config needed |
| Shopify webhook secret from OAuth app client secret | Dedicated webhook signing secret in Admin → Notifications | Shopify 2023+ | Separate secret; found in Admin not in app credentials |
| `from: 'onboarding@resend.dev'` | `from: 'hello@wildenflower.com'` | This phase | Requires domain verification in Resend first |

**Deprecated/outdated:**
- `export const config = { api: { bodyParser: false } }` — Pages Router syntax only; not applicable in App Router
- `raw-body` npm package — not needed in App Router; use `request.text()` directly

---

## Open Questions

1. **Can Shopify's default order confirmation email actually be suppressed?**
   - What we know: On standard Shopify plans, the order confirmation email toggle does not exist — it cannot be disabled
   - What's unclear: Whether Wildenflower is on standard or Plus
   - Recommendation: Plan for the "stub content" workaround (replace Shopify's email content with a minimal "your full confirmation is on its way" message). If Plus, add a note that full suppression is possible.

2. **Has wildenflower.com been verified in Resend yet?**
   - What we know: `lib/email.ts` currently uses `onboarding@resend.dev` — not yet updated
   - What's unclear: Whether the DNS records have already been added
   - Recommendation: Make Resend domain verification a prerequisite task (Wave 0) before updating the `from` address. DNS propagation can take up to 48 hours — start this early.

3. **What Shopify API version should the webhook be registered with?**
   - What we know: `lib/shopify.ts` uses `apiVersion: '2025-04'`; `lib/shopify-admin.ts` uses `'2026-01'`
   - What's unclear: Shopify Admin webhook registration offers version selection
   - Recommendation: Register with `2025-04` to match the Storefront API client version already in use. The payload schema for `orders/paid` is stable across versions.

---

## Shopify Admin Runbook Reference

### SHOP-01: Product Audit Checklist
**Where:** Admin → Products
**Check for each product:**
- [ ] Has at least one image (not the placeholder grey square)
- [ ] Has a description (not blank)
- [ ] Has a price > $0
- [ ] Has inventory tracked or set to "Continue selling when out of stock"
- [ ] Status: "Active" (published to Online Store)
**Storefront cross-check:** Visit `/collections/all` — confirm no broken images appear

### SHOP-02: Test Purchase via Bogus Gateway
**Where:** Admin → Settings → Payments
1. Deactivate any live payment processor
2. Activate "(for testing) Bogus Gateway"
3. Go to storefront → add any product → checkout
4. Payment: use card number `1` (success), `2` (failure), `3` (exception)
5. Confirm order in Admin → Orders with status "Paid"
6. Confirm Resend email received
7. Deactivate Bogus Gateway immediately

### SHOP-03: Shipping Zones
**Where:** Admin → Settings → Shipping and delivery
- Create zone "Domestic (US)" → countries: United States
  - Rate: Standard — $5.00
  - Rate: Expedited — $15.00
  - Rate: Free — condition "Order price is at least $75"
- Create zone "Canada" → countries: Canada
  - Rate: Standard — $12.00
  - Rate: Expedited — $25.00

### SHOP-04: Tax Configuration
**Where:** Admin → Settings → Taxes and duties
- Enable Shopify Tax (automatic)
- United States → Regional settings → Add state: Kentucky → enter KY sales tax ID
- United States → Regional settings → Add state: Ohio → enter OH sales tax ID

### SHOP-05: Disable Password Page
**Where:** Admin → Online Store → Preferences
- Under "Password protection" — toggle off / leave "Password page" unchecked
- Visit `https://wildenflower.com` in incognito — should see storefront, not password gate

### SHOP-06: Storefront API Token
**Where:** Admin → Apps and sales channels → Develop apps → [app name] → API credentials
- Confirm Storefront API scopes include `unauthenticated_read_product_listings`, `unauthenticated_read_collection_listings`
- Cross-check: hit `https://wildenflower.com/api/test-shopify` → must return `success: true`

### SHOP-07: Collection Handles
**Where:** Admin → Products → Collections
- For each collection, click to open → check URL slug (handle) in the "Search engine listing" section
- Required handles: `tie-dye`, `leather`, `jewelry`, `crystals`, `artwork`, `ceramics`
- Cross-check: `https://wildenflower.com/api/test-shopify` returns `collections.items[].handle` — verify all 6 are present

### SHOP-08: Order Confirmation Webhook
**Where:** Code (new file) + Admin → Settings → Notifications → Webhooks
**Prerequisites:**
1. Verify `wildenflower.com` domain in Resend dashboard (DKIM + SPF records)
2. Deploy new webhook endpoint to production
3. Register webhook in Admin (orders/paid → `https://wildenflower.com/api/webhooks/order-created`)
4. Copy webhook shared secret → set `SHOPIFY_WEBHOOK_SECRET` in Vercel prod env vars
5. Update `lib/email.ts` `from` to `hello@wildenflower.com`
6. Redeploy
7. Place test order (bogus gateway) → confirm Resend email arrives

---

## Sources

### Primary (HIGH confidence)
- [Shopify webhook HMAC docs](https://shopify.dev/docs/apps/build/webhooks/subscribe/https) — HMAC header name, algorithm, verification steps
- [Next.js App Router docs](https://nextjs.org/docs/app/getting-started/route-handlers) — no body parser needed; `request.text()` works natively; version 16.1.6 confirmed
- [Resend domain docs](https://resend.com/docs/dashboard/domains/introduction) — DKIM + SPF required for custom domain; verification steps

### Secondary (MEDIUM confidence)
- [Shopify orders/paid payload](https://inventivehq.com/blog/shopify-webhooks-guide) — comprehensive payload example; verified field names match official schema structure from Shopify REST API docs
- [Shopify Admin webhook creation](https://hookdeck.com/webhooks/platforms/how-create-shopify-webhooks-with-shopify-admin-dashboard-tutorial) — step-by-step Admin UI steps; webhook secret location confirmed
- [Shopify bogus gateway](https://help.shopify.com/en/manual/checkout-settings/test-orders) — test order process; card number `1` for success confirmed from official help docs

### Tertiary (LOW confidence — flag for validation)
- [Shopify standard plan order email cannot be disabled](https://community.shopify.com/c/technical-q-a/how-can-i-disable-quot-order-confirmation-quot-email/m-p/1452582) — multiple community sources agree; Shopify Plus exception confirmed by multiple sources; **validate against current Shopify plan level**
- [Shopify Tax nexus by state](https://help.shopify.com/en/manual/taxes/us/us-tax-setup) — KY and OH nexus configuration steps; actual tax IDs must be provided by merchant

---

## Metadata

**Confidence breakdown:**
- Webhook code patterns: HIGH — Next.js App Router raw body handling verified from official docs; HMAC algorithm verified from Shopify official docs
- Shopify Admin checklist steps: MEDIUM — UI navigation steps verified from Help Center and hookdeck tutorial; actual UI may vary by Shopify version
- Resend domain verification: HIGH — official Resend docs confirm DKIM + SPF required; DNS propagation timing is MEDIUM
- Default email suppression limitation: MEDIUM — multiple community sources agree, but plan tier not confirmed

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (Shopify Admin UI is stable; Next.js 16 App Router patterns are stable)
