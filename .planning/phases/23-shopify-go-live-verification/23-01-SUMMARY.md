---
phase: 23-shopify-go-live-verification
plan: 01
subsystem: api
tags: [shopify, webhook, resend, email, hmac, typescript]

# Dependency graph
requires:
  - phase: 22-error-monitoring
    provides: production Sentry monitoring — verifies system health before go-live
  - phase: earlier
    provides: lib/email.ts sendEmail() with Resend, components/emails/order-confirmation-email.tsx

provides:
  - Shopify orders/paid webhook handler at app/api/webhooks/order-created/route.ts
  - HMAC-verified, timing-safe POST endpoint that fires Resend order confirmation email
  - Updated lib/email.ts from address to hello@wildenflower.com
  - Pre-filled 23-VERIFICATION.md runbook for all 8 SHOP-XX requirements

affects:
  - 23-02 (Plan 02: Vercel env vars + Resend domain verification — depends on this code being deployed)
  - 23-03 (Plan 03: executor follows 23-VERIFICATION.md runbook produced here)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Shopify webhook HMAC verification: request.text() first, then crypto.timingSafeEqual — never request.json()"
    - "Return 200 on email send failure to prevent Shopify duplicate-email retry behavior"
    - "export const dynamic = 'force-dynamic' required on all webhook route handlers"

key-files:
  created:
    - app/api/webhooks/order-created/route.ts
    - .planning/phases/23-shopify-go-live-verification/23-VERIFICATION.md
  modified:
    - lib/email.ts

key-decisions:
  - "Return 200 even when Resend email send fails — returning 5xx causes Shopify to retry the webhook, producing duplicate emails"
  - "Use crypto.timingSafeEqual not === for HMAC comparison — prevents timing attacks that could allow forgery"
  - "Read raw body with request.text() before any JSON.parse — consuming the stream early breaks HMAC verification"
  - "from address changed to hello@wildenflower.com now in code; domain must be verified in Resend before deploy (Plan 02 prerequisite)"
  - "imageUrl omitted from order line items — Shopify REST webhook payload does not include product image URLs"

patterns-established:
  - "Webhook handler pattern: read raw body -> verify HMAC -> parse JSON -> extract fields -> send email -> always return 200"
  - "ShopifyOrderPayload and ShopifyLineItem interfaces defined inline for type safety without external dependency"

requirements-completed: [SHOP-08, SHOP-01, SHOP-02, SHOP-03, SHOP-04, SHOP-05, SHOP-06, SHOP-07]

# Metrics
duration: 3min
completed: 2026-03-01
---

# Phase 23 Plan 01: Shopify Go-Live Verification Summary

**Shopify orders/paid webhook with timing-safe HMAC verification, Resend email dispatch, and pre-filled 8-section verification runbook**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-01T17:23:24Z
- **Completed:** 2026-03-01T17:26:01Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Webhook endpoint at `app/api/webhooks/order-created/route.ts` — handles Shopify `orders/paid` events with HMAC verification and Resend email dispatch
- `lib/email.ts` from address updated from `onboarding@resend.dev` to `hello@wildenflower.com`
- `23-VERIFICATION.md` pre-filled runbook (255 lines) with step-by-step instructions, checkboxes, screenshot placeholders, and notes fields for all 8 SHOP-XX requirements

## Task Commits

Each task was committed atomically:

1. **Task 1: Create webhook endpoint** - `d797c60` (feat)
2. **Task 2: Update email from address + create verification runbook** - `817609e` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `app/api/webhooks/order-created/route.ts` - Shopify orders/paid POST handler with HMAC verification and Resend email
- `lib/email.ts` - from address updated to hello@wildenflower.com
- `.planning/phases/23-shopify-go-live-verification/23-VERIFICATION.md` - Pre-filled go-live runbook for SHOP-01 through SHOP-08

## Decisions Made
- Return 200 even on Resend email failure — returning 5xx causes Shopify to retry, producing duplicate confirmation emails
- `crypto.timingSafeEqual` instead of `===` for HMAC comparison — prevents timing attacks
- `request.text()` called before any JSON parsing — consuming the body stream first would break HMAC verification
- `from: 'Wildenflower <hello@wildenflower.com>'` set in code now; domain must be verified in Resend before production deploy (Plan 02 human prerequisite)
- `imageUrl` omitted from line items mapping — Shopify REST webhook payload does not include product image URLs
- `export const dynamic = 'force-dynamic'` required — webhook handlers must never be statically cached

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

Before this webhook is functional in production, two external service steps are required (documented in Plan 02):
- Verify `wildenflower.com` domain in Resend dashboard (DKIM + SPF DNS records)
- Set `SHOPIFY_WEBHOOK_SECRET` env var in Vercel production environment (obtained after registering webhook in Shopify Admin)

See `23-VERIFICATION.md` SHOP-08 section for step-by-step instructions.

## Next Phase Readiness
- Plan 01 code work is complete and committed
- Plan 02 (human: Vercel env vars + Resend domain verification) is unblocked
- Plan 03 (human: execute 23-VERIFICATION.md runbook) can begin after Plan 02 prerequisites are met
- `23-VERIFICATION.md` is the single source of truth for the human executor in Plan 03

## Self-Check: PASSED

- app/api/webhooks/order-created/route.ts: FOUND
- lib/email.ts: FOUND
- .planning/phases/23-shopify-go-live-verification/23-VERIFICATION.md: FOUND
- .planning/phases/23-shopify-go-live-verification/23-01-SUMMARY.md: FOUND
- Commit d797c60: FOUND
- Commit 817609e: FOUND

---
*Phase: 23-shopify-go-live-verification*
*Completed: 2026-03-01*
