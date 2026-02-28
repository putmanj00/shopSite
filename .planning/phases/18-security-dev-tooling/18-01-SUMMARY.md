---
phase: 18-security-dev-tooling
plan: "01"
subsystem: infra
tags: [security, csp, hsts, headers, next.js]

# Dependency graph
requires: []
provides:
  - HTTP security headers (CSP-Report-Only, HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy) applied to all Next.js routes
affects:
  - 19-playwright-e2e-tests
  - 20-ci-cd-pipeline

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Security headers defined in next.config.ts via async headers() and applied globally with source: '/(.*)'."
    - "CSP_ENFORCE flag pattern — start in Report-Only mode, flip to enforcing after production validation."
    - "isDev guard for unsafe-eval — development-only CSP directive to support Next.js HMR."

key-files:
  created: []
  modified:
    - next.config.ts

key-decisions:
  - "CSP deployed in Report-Only mode (Content-Security-Policy-Report-Only) to avoid breaking checkout before violations are confirmed zero in production."
  - "CSP whitelists *.shopify.com, *.myshopify.com, checkout.shopify.com for Shopify checkout redirect compatibility."
  - "X-Frame-Options set to DENY (not SAMEORIGIN) — no framing needed at all for this storefront."
  - "HSTS max-age set to 63072000 (2 years) with includeSubDomains and preload — ready for HSTS preload list submission."

patterns-established:
  - "CSP_ENFORCE flag: set false in development/Report-Only phase, flip to true after production validation."
  - "isDev conditional: process.env.NODE_ENV === 'development' guards unsafe-eval for HMR support."

requirements-completed: [SEC-01]

# Metrics
duration: 2min
completed: 2026-02-28
---

# Phase 18 Plan 01: Security Headers Summary

**CSP-Report-Only, HSTS (2yr), X-Frame-Options DENY, nosniff, and Referrer-Policy applied to all Next.js routes via next.config.ts headers(), with Shopify checkout domain whitelist**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-28T02:41:44Z
- **Completed:** 2026-02-28T02:43:30Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Added five security headers to all HTTP responses via Next.js headers() API
- CSP whitelists all Shopify and Google Analytics domains required by existing integrations
- CSP_ENFORCE flag makes the Report-Only-to-enforcing transition a single boolean flip
- Build verified: npm run build compiles all 116 static pages successfully with new headers config

## Task Commits

Each task was committed atomically:

1. **Task 1: Add security headers to next.config.ts** - `d0392f5` (feat)
2. **Task 2: Verify build succeeds with new headers config** - verification only, no file changes

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `next.config.ts` - Added CSP_ENFORCE flag, cspValue array, securityHeaders array, async headers() function; preserved existing pageExtensions, images config, withMDX wrapping

## Decisions Made
- CSP in Report-Only mode initially — must confirm zero violations in production before switching to enforcing via CSP_ENFORCE = true
- checkout.shopify.com whitelisted in both connect-src and form-action to avoid breaking Shopify checkout redirect
- X-Frame-Options DENY chosen over SAMEORIGIN — storefront has no legitimate framing use case
- HSTS set to 2 years with preload directive — aggressive but appropriate for a production storefront

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Build produced no TypeScript or config errors. Pre-existing Shopify Admin API GraphQL warnings (ordersCount, totalSpent field not existing on Customer type) are unrelated to this plan and fall back to mock data as designed.

## User Setup Required

None - no external service configuration required. The CSP_ENFORCE flag in next.config.ts is the only knob to turn once production violations are confirmed zero.

## Next Phase Readiness
- SEC-01 satisfied: all five required headers present and build verified
- Before switching CSP to enforcing mode: deploy to production, open DevTools console, run through full user session including checkout, confirm zero CSP violations, then flip CSP_ENFORCE = true
- Phase 18-02 (lefthook + gitleaks) and 18-03 (Dependabot) have no dependency on this plan — can proceed immediately

---
*Phase: 18-security-dev-tooling*
*Completed: 2026-02-28*

## Self-Check: PASSED

- `next.config.ts` — FOUND
- `.planning/phases/18-security-dev-tooling/18-01-SUMMARY.md` — FOUND
- Commit `d0392f5` — FOUND
