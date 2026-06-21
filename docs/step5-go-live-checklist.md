# Step 5 — Go-Live Checklist

Code for the order-confirmation pipeline is shipped (webhook + signed-payload
verification + Resend sender). The items below are the **admin / production**
steps only James can do. Do them in order; the webhook fails closed until the
secret and sender are configured, so nothing leaks if a step is skipped.

## 1. Resend — verify the sending domain

The sender is no longer the Resend sandbox (`onboarding@resend.dev` only
delivered to the account owner). Live sends use `EMAIL_FROM`.

- [ ] In Resend → **Domains**, add `wildenflower.com` and add the DNS records
      it shows (SPF + DKIM, optionally DMARC) at the domain registrar.
- [ ] Wait for Resend to mark the domain **Verified**.
- [ ] Pick the from-address (default `Wildenflower <orders@wildenflower.com>`).
      Override only if you want a different mailbox via `EMAIL_FROM`.

## 2. Vercel — environment variables (Production + Preview)

- [ ] `RESEND_API_KEY` — a real key (starts `re_`, not `re_mock`). Without a
      real key the app stays in mock mode and only logs emails.
- [ ] `EMAIL_FROM` — e.g. `Wildenflower <orders@wildenflower.com>` (must be on
      the verified domain). Optional; defaults to that value.
- [ ] `SHOPIFY_WEBHOOK_SECRET` — the signing secret from step 3. **Required** —
      the webhook returns 500 and processes nothing until this is set.
- [ ] `NEXT_PUBLIC_BASE_URL` — `https://wildenflower.com` (email links).
- [ ] Redeploy after setting vars (Vercel bakes env at build).

## 3. Shopify — register the webhook

Admin → **Settings → Notifications → Webhooks** (or via Admin API):

- [ ] Event: **Order creation** · Format: **JSON**
- [ ] URL: `https://wildenflower.com/api/webhooks/orders-create`
- [ ] Copy the **webhook signing secret** Shopify shows → set it as
      `SHOPIFY_WEBHOOK_SECRET` in Vercel (step 2) and redeploy.

> Note: a webhook created in **admin** uses the secret shown on that page. A
> webhook created via the **Admin API** is signed with the app's API secret
> instead — use whichever matches how you registered it.

### 3b. Shopify — register the shipping webhook (optional, for "your order shipped" emails)

Same page, same signing secret (one `SHOPIFY_WEBHOOK_SECRET` covers all topics):

- [ ] Event: **Fulfillment creation** · Format: **JSON**
- [ ] URL: `https://wildenflower.com/api/webhooks/fulfillments-create`

The shipping email only sends when the fulfillment carries a recipient email,
a tracking number, and a tracking URL (Shopify auto-fills the URL for
recognised carriers). Fulfillments without tracking are acked and skipped.

## 4. Test order (end-to-end)

- [ ] Place a real low-value test order through live checkout.
- [ ] Confirm the confirmation email arrives at the buyer address.
- [ ] In Shopify webhook logs, confirm a **200** response (not 401/500).
  - 401 → secret mismatch between Shopify and Vercel.
  - 500 → secret missing in Vercel, or Resend send failed (check Vercel logs).
- [ ] Refund/cancel the test order.

## Scope notes / follow-ons (not in Step 5)

- **orders/create** (confirmation) and **fulfillments/create** (shipping
  notification) are wired. **Delivery confirmation** (`fulfillments/update` with
  `shipment_status === 'delivered'`) is deferred: its template needs per-product
  PDP links + a review route + a `/care-guides` page that don't exist yet
  (fulfillment line items carry no product handle). Build once those exist.
- Webhooks are **deduplicated best-effort** on `X-Shopify-Webhook-Id`
  (`lib/webhook-dedup.ts`): an id is recorded only after a successful send, so a
  retry after a 500 still reprocesses, while a retry after success is skipped.
  Store is **in-memory per-instance** — a duplicate is still possible if a retry
  lands on a different/cold Vercel instance. Upgrade to a shared store (Vercel
  KV / Upstash) only if duplicate emails are observed.
- Email templates are de-purpled (PR #24). Shipping/delivery templates use the
  terracotta/cream brand palette.
- `app/api/email/*` routes still exist for manual/triggered sends; the webhook
  sends directly via `lib/email.ts` (no internal HTTP hop).

## Local verification

```bash
npm run test:webhook   # HMAC verify + order/fulfillment mapping + dedup tests
npm run typecheck
npm run lint
```
