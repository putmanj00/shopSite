# Phase 23: Shopify Go-Live Verification - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Confirm every Shopify prerequisite for accepting real orders — products, payments, shipping, taxes, API access, and a successful test purchase. This phase also builds the Shopify → Resend order confirmation webhook (SHOP-08). Output is a filled-in VERIFICATION.md that serves as both a runbook and a results log. No new storefront UI features.

</domain>

<decisions>
## Implementation Decisions

### Shipping Regions (SHOP-03)
- US + Canada at go-live; international to be added in a future phase after US + Canada are working
- Use flat rates (not carrier-calculated)
- **US rates:** $5 standard / $15 expedited; free shipping on orders $75+
- **Canada rates:** $12 standard / $25 expedited; no free shipping tier for Canada
- Configure as two shipping zones: "Domestic (US)" and "Canada"

### Tax Configuration (SHOP-04)
- Collect sales tax in Kentucky and Ohio (nexus in both states)
- Use Shopify Tax (automatic calculation by address) — not manual rates
- No other markets to configure at go-live

### Order Confirmation Email Webhook (SHOP-08)
- Build a new Shopify webhook at `/api/webhooks/order-created` — do NOT reuse or replace the existing `/api/email/order-confirmation` endpoint
- Shopify fires `orders/paid` webhook → new endpoint handles Shopify's native order payload → sends Resend email
- Replace Shopify's default order confirmation email (disable it) — customer receives only the Resend-branded email
- Update the Resend `from` address to `hello@wildenflower.com` (requires verifying wildenflower.com domain in Resend)
- Webhook endpoint must verify Shopify HMAC signature before processing
- SHOP-08 is the only code-writing task in this phase; all other SHOP-XX items are Shopify Admin configuration

### Verification Artifact
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

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/api/email/order-confirmation/route.ts`: Existing endpoint for manual order email trigger — keep as-is for testing; new webhook handler is a separate file
- `components/emails/order-confirmation-email.tsx`: React Email component — webhook handler should reuse this directly
- `lib/email.ts`: `sendEmail()` helper wraps Resend — webhook handler should call this
- `app/api/test-shopify/route.ts`: Existing Storefront API test route — useful model for checking API connectivity

### Established Patterns
- API routes use `NextRequest` / `NextResponse` pattern
- Email sending goes through `sendEmail()` in `lib/email.ts`
- Env vars follow `SHOPIFY_*` and `RESEND_*` naming

### Integration Points
- New file: `app/api/webhooks/order-created/route.ts`
- Needs new env var: `SHOPIFY_WEBHOOK_SECRET` (for HMAC verification)
- Resend `from` address in `lib/email.ts` needs updating to `hello@wildenflower.com`
- Shopify Admin: register the webhook URL pointing to production domain + `/api/webhooks/order-created`

</code_context>

<specifics>
## Specific Ideas

- International shipping to be added in a future phase once US + Canada is confirmed working — note this explicitly in the runbook
- The `VERIFICATION.md` should be designed so a non-technical founder can fill it in by following the runbook steps in Shopify Admin

</specifics>

<deferred>
## Deferred Ideas

- International shipping zones — after US + Canada go-live is verified
- Carrier-calculated rates (USPS/UPS/FedEx live) — future phase if flat rates prove insufficient

</deferred>

---

*Phase: 23-shopify-go-live-verification*
*Context gathered: 2026-03-01*
