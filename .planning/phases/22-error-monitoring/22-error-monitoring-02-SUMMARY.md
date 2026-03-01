---
phase: 22-error-monitoring
plan: 02
subsystem: infra
tags: [sentry, error-monitoring, nextjs-instrumentation, source-maps, csp-tunnel]

# Dependency graph
requires:
  - phase: 22-error-monitoring-01
    provides: "Sentry account, wildenflower project, SENTRY_DSN + NEXT_PUBLIC_SENTRY_DSN + SENTRY_AUTH_TOKEN set in Vercel prod and GitHub Secrets"
provides:
  - "@sentry/nextjs installed in node_modules"
  - "instrumentation.ts: server + edge Sentry registration via Next.js hook with onRequestError"
  - "instrumentation-client.ts: browser-side Sentry.init using NEXT_PUBLIC_SENTRY_DSN"
  - "sentry.server.config.ts: server Sentry.init with SENTRY_DSN (self-disables when undefined)"
  - "sentry.edge.config.ts: edge runtime Sentry.init with SENTRY_DSN"
  - "next.config.ts: withSentryConfig outermost wrapper with tunnelRoute: '/monitoring' and source map upload"
affects:
  - "22-03-error-monitoring — CI build step adds SENTRY_AUTH_TOKEN for source map upload"
  - "22-04-error-monitoring — error boundaries and captureException calls use this SDK wiring"

# Tech tracking
tech-stack:
  added: ["@sentry/nextjs"]
  patterns:
    - "DSN-gating via undefined env var: SDK self-disables in dev when SENTRY_DSN is not set — no enabled: flag needed"
    - "tunnelRoute: '/monitoring' pattern: same-origin tunnel avoids ad-blocker interference without CSP changes"
    - "withSentryConfig(withMDX(nextConfig)) wrapper order: Sentry outermost so it can intercept MDX webpack modifications for correct source map upload"

key-files:
  created:
    - "instrumentation.ts"
    - "instrumentation-client.ts"
    - "sentry.server.config.ts"
    - "sentry.edge.config.ts"
  modified:
    - "next.config.ts"
    - "test-shopify.ts"
    - "package.json"
    - "package-lock.json"

key-decisions:
  - "Org slug left as YOUR_ORG_SLUG placeholder in next.config.ts — user must substitute actual slug (visible in sentry.io/organizations/YOUR-SLUG/) before first production deploy"
  - "tunnelRoute: '/monitoring' chosen — same-origin so no CSP connect-src addition needed for Sentry's *.sentry.io domains"
  - "tracesSampleRate: 0.1 (10%) on all three runtimes — conservative start to preserve free tier quota"
  - "Session replay omitted — not needed for v1.2 scope"
  - "widenClientFileUpload: true — broader client source map coverage for better stack traces"

patterns-established:
  - "Sentry four-file SDK pattern: instrumentation.ts (hook), instrumentation-client.ts (browser), sentry.server.config.ts, sentry.edge.config.ts"
  - "Pre-existing typecheck errors block commits — fix with minimal cast before staging"

requirements-completed: [MON-01, MON-02]

# Metrics
duration: 4min
completed: 2026-03-01
---

# Phase 22 Plan 02: Error Monitoring — SDK Install & Config Summary

**@sentry/nextjs installed with four DSN-gated config files and withSentryConfig outermost wrapper in next.config.ts — full SDK wiring for server, edge, and browser error capture**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-01T05:41:06Z
- **Completed:** 2026-03-01T05:45:00Z
- **Tasks:** 2
- **Files modified:** 8 (4 created, 4 modified)

## Accomplishments
- `@sentry/nextjs` installed (182 packages added to node_modules)
- Four Sentry SDK config files created at project root with consistent DSN-gating pattern (undefined DSN in dev = SDK self-disables)
- `next.config.ts` updated with `withSentryConfig(withMDX(nextConfig), ...)` as outermost wrapper — includes `tunnelRoute: '/monitoring'`, `deleteSourcemapsAfterUpload: true`, `widenClientFileUpload: true`
- All existing `next.config.ts` content preserved exactly (CSP, HSTS, image patterns)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install @sentry/nextjs and create four SDK config files** - `3f1cb08` (feat)
2. **Task 2: Wrap next.config.ts with withSentryConfig** - `d7694c8` (feat)

**Plan metadata:** (added in final docs commit)

## Files Created/Modified
- `instrumentation.ts` - Server + edge Sentry registration via Next.js instrumentation hook; exports `onRequestError = Sentry.captureRequestError` for automatic Server Component/API route/middleware error capture
- `instrumentation-client.ts` - Browser-side `Sentry.init()` using `NEXT_PUBLIC_SENTRY_DSN`; `tracesSampleRate: 0.1`
- `sentry.server.config.ts` - Server `Sentry.init()` using `SENTRY_DSN`; self-disables when DSN undefined (dev)
- `sentry.edge.config.ts` - Edge runtime `Sentry.init()` using `SENTRY_DSN`; same pattern as server config
- `next.config.ts` - Added `withSentryConfig` import and outermost wrapper with tunnel route and source map options
- `test-shopify.ts` - Cast `prodData` to fix pre-existing typecheck error that was blocking commit (Rule 3)
- `package.json` / `package-lock.json` - `@sentry/nextjs` dependency added

## Decisions Made
- Org slug placeholder (`YOUR_ORG_SLUG`) left in `next.config.ts` — the actual slug is user-specific and not stored in planning docs; user must substitute before deploying to production
- `tunnelRoute: '/monitoring'` chosen — tunnel is same-origin so no CSP `connect-src` changes needed (Sentry's `*.sentry.io` requests proxied through `/monitoring`)
- `tracesSampleRate: 0.1` on all runtimes — 10% to protect free tier quota; can increase later
- Session replay omitted — not in v1.2 scope

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed pre-existing typecheck error in test-shopify.ts**
- **Found during:** Task 1 (commit stage — pre-commit hook runs typecheck)
- **Issue:** `test-shopify.ts:19` had pre-existing `TS18046: 'prodData' is of type 'unknown'` — was blocking commit via lefthook pre-commit typecheck hook
- **Fix:** Cast `shopifyFetch` return value: `as { products: { edges: unknown[] } }` on line 19
- **Files modified:** `test-shopify.ts`
- **Verification:** `npm run typecheck` exits 0 — confirmed clean after fix; confirmed error was pre-existing (stash/test cycle)
- **Committed in:** `3f1cb08` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Minimal — pre-existing error in test utility file; cast is safe and correct. No scope creep.

## Issues Encountered
- Pre-existing `test-shopify.ts` typecheck error blocked first commit attempt — diagnosed as pre-existing via `git stash && npm run typecheck`, then fixed with minimal type cast

## User Setup Required

**Action required before first production deploy:** Substitute your actual Sentry org slug in `next.config.ts`:

```typescript
// Line 90 in next.config.ts — change:
org: 'YOUR_ORG_SLUG',
// To your actual slug (visible in URL: sentry.io/organizations/YOUR-ACTUAL-SLUG/):
org: 'your-actual-org-slug',
```

The org slug is visible in the Sentry dashboard URL after logging in.

## Next Phase Readiness
- Full SDK wiring complete — `instrumentation.ts` fires on every request, `onRequestError` captures Server Component errors automatically
- No events will reach Sentry until production deploy (DSN undefined in dev = SDK disabled)
- Plan 22-03 adds `SENTRY_AUTH_TOKEN` to CI build step for source map upload — GitHub Secret already set in Plan 01, no dashboard work needed
- Plan 22-04 wires React error boundaries and explicit `captureException` calls in catch blocks

## Self-Check: PASSED

- FOUND: `/Users/jamesputman/SRC/shopSite/instrumentation.ts`
- FOUND: `/Users/jamesputman/SRC/shopSite/instrumentation-client.ts`
- FOUND: `/Users/jamesputman/SRC/shopSite/sentry.server.config.ts`
- FOUND: `/Users/jamesputman/SRC/shopSite/sentry.edge.config.ts`
- FOUND: `/Users/jamesputman/SRC/shopSite/next.config.ts` (contains withSentryConfig)
- FOUND: commit `3f1cb08` (feat(22-02): install @sentry/nextjs and create four SDK config files)
- FOUND: commit `d7694c8` (feat(22-02): wrap next.config.ts with withSentryConfig outermost)

---
*Phase: 22-error-monitoring*
*Completed: 2026-03-01*
