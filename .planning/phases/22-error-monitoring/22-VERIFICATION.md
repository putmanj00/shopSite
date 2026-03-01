---
phase: 22-error-monitoring
verified: 2026-03-01T12:00:00Z
status: human_needed
score: 3/3 success criteria verified
re_verification:
  previous_status: gaps_found
  previous_score: 2/3
  gaps_closed:
    - "SENTRY_DSN and SENTRY_AUTH_TOKEN removed from .env — local dev server will no longer send events to Sentry"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Confirm Sentry dashboard wildenflower project received both server and client test events from production deployment"
    expected: "Two issues visible: 'Sentry server test — delete this route after verifying dashboard' and 'Sentry client test — delete this page after verifying dashboard' with readable TypeScript stack traces"
    why_human: "Production Sentry dashboard state cannot be verified programmatically from local codebase. User confirmed 'That works!' per Plan 04 summary but no screenshot or event ID was captured for audit trail."
  - test: "Run npm run dev, browse for 60 seconds, then confirm Sentry dashboard shows zero new development-origin events"
    expected: "No events with environment: 'development' appear in Sentry dashboard after SENTRY_DSN removal from .env"
    why_human: "Requires running dev server and checking external dashboard — cannot verify programmatically. Fix is in place (SENTRY_DSN absent from .env); dev-noise suppression relies on SDK self-disabling when DSN is undefined."
---

# Phase 22: Error Monitoring Verification Report

**Phase Goal:** Instrument the Next.js storefront with Sentry error monitoring so all unhandled server and client exceptions are captured in the Sentry dashboard with readable TypeScript stack traces, with zero noise from development environments.
**Verified:** 2026-03-01
**Status:** human_needed
**Re-verification:** Yes — after gap closure (SENTRY_DSN removed from .env)

---

## Re-Verification Summary

**Previous status:** gaps_found (2/3 success criteria verified)
**Current status:** human_needed (3/3 automated checks pass)

**Gap closed:** `.env` contained a real `SENTRY_DSN` value, activating server-side Sentry in local development. That value has been removed. The file now contains only Shopify and base URL vars — no `SENTRY_DSN`, no `SENTRY_AUTH_TOKEN`.

**No regressions found.** All artifacts verified in the initial pass remain intact and correctly wired.

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Sentry dashboard shows wildenflower project receiving events — test error in production results in visible issue within 60 seconds | ? HUMAN VERIFIED | Plan 04 summary records user confirmed "That works!" — both client and server test events appeared. Human-confirmed, not programmatically verifiable. |
| 2 | Running dev server locally (NODE_ENV=development) does not send any events to Sentry | VERIFIED (fix confirmed) | `.env` no longer contains `SENTRY_DSN` or `SENTRY_AUTH_TOKEN`. `sentry.server.config.ts` and `sentry.edge.config.ts` read `process.env.SENTRY_DSN` which is now `undefined` locally — SDK self-disables. `instrumentation-client.ts` uses `NEXT_PUBLIC_SENTRY_DSN` (never in `.env`) — unchanged and correct. Human confirmation still needed to observe zero dashboard events. |
| 3 | Unhandled server-side and client-side errors both appear in Sentry with readable TypeScript source | ? HUMAN VERIFIED | Plan 04 summary: user confirmed both event types visible in dashboard with readable traces. Source map upload wired in CI. Human-confirmed, not programmatically verifiable. |

**Score:** 3/3 truths have supporting evidence (2 are human-confirmed, 1 gap fully closed)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `instrumentation.ts` | Server + edge Sentry registration via Next.js instrumentation hook | VERIFIED | Exports `register()` with runtime-conditional dynamic imports and `onRequestError = Sentry.captureRequestError` |
| `instrumentation-client.ts` | Browser-side Sentry.init using NEXT_PUBLIC_SENTRY_DSN | VERIFIED | Uses `process.env.NEXT_PUBLIC_SENTRY_DSN` — correctly undefined in dev (never in `.env`) |
| `sentry.server.config.ts` | Server Sentry.init with SENTRY_DSN (self-disables when undefined) | VERIFIED | `dsn: process.env.SENTRY_DSN` — now correctly undefined locally as `.env` no longer defines it; comment on line 4 accurately documents the self-disable behavior |
| `sentry.edge.config.ts` | Edge runtime Sentry.init with SENTRY_DSN | VERIFIED | Same as sentry.server.config.ts — self-disable mechanism now functions as intended |
| `next.config.ts` | withSentryConfig outermost wrapper with tunnel route and source map upload | VERIFIED | `withSentryConfig(withMDX(nextConfig), ...)` at line 86; `org: 'wildenflower'`; `tunnelRoute: '/monitoring'`; `deleteSourcemapsAfterUpload: true` |
| `app/error.tsx` | Segment-level error boundary with explicit Sentry capture | VERIFIED | `Sentry.captureException(error)` in `useEffect` at line 14; no placeholder patterns |
| `app/global-error.tsx` | Root-level error boundary with explicit Sentry capture | VERIFIED | `Sentry.captureException(error)` in `useEffect` at line 26; no placeholder patterns |
| `.github/workflows/ci.yml` | SENTRY_AUTH_TOKEN in quality job Build step env | VERIFIED | `SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}` at line 40 |
| `app/sentry-test/page.tsx` | DELETED after dashboard verification | VERIFIED | Directory `app/sentry-test/` does not exist |
| `app/api/sentry-example-api/route.ts` | DELETED after dashboard verification | VERIFIED | Directory `app/api/sentry-example-api/` does not exist |
| `.planning/phases/22-error-monitoring/sentry-credentials.md` | Org slug and credential confirmation | VERIFIED | Exists; `Vercel env set: yes`, `GitHub secret set: yes`; org slug placeholder in doc is minor inconsistency — actual slug `'wildenflower'` correct in `next.config.ts` |
| `.env` | Must NOT contain SENTRY_DSN or SENTRY_AUTH_TOKEN | VERIFIED | File contains only Shopify and base URL vars. No `SENTRY_DSN`. No `SENTRY_AUTH_TOKEN`. Gap fully resolved. |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `instrumentation.ts` | `sentry.server.config.ts` | `await import('./sentry.server.config')` inside `register()` when `NEXT_RUNTIME === 'nodejs'` | WIRED | Pattern confirmed at lines 4-6 |
| `instrumentation.ts` | `sentry.edge.config.ts` | `await import('./sentry.edge.config')` inside `register()` when `NEXT_RUNTIME === 'edge'` | WIRED | Pattern confirmed at lines 7-9 |
| `next.config.ts` | `@sentry/nextjs` | `withSentryConfig(withMDX(nextConfig), sentryOptions)` | WIRED | Import at line 3; wrapper at line 86 |
| `next.config.ts` | Sentry tunnel | `tunnelRoute: '/monitoring'` creates Next.js rewrite | WIRED | Confirmed at line 93 |
| `.github/workflows/ci.yml` | Sentry source map upload | `SENTRY_AUTH_TOKEN` in Build step env | WIRED | Confirmed at line 40 |
| `app/error.tsx` | `@sentry/nextjs` | `Sentry.captureException(error)` in `useEffect` | WIRED | Import at line 4; call at line 14 |
| `app/global-error.tsx` | `@sentry/nextjs` | `Sentry.captureException(error)` in `useEffect` | WIRED | Import at line 5; call at line 26 |
| `.env` DSN env var | `sentry.server.config.ts` + `sentry.edge.config.ts` | `process.env.SENTRY_DSN` reads undefined locally | CORRECT | Previously BROKEN — now resolved. DSN absent from `.env`; SDK self-disables in dev as designed. |

---

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|-------------|---------------|-------------|--------|----------|
| MON-01 | 22-01, 22-02, 22-04 | `@sentry/nextjs` installed and configured for Next.js 16 App Router (client + server) | SATISFIED | Package installed (`^10.40.0` in `package.json`); four config files wired; `withSentryConfig` in `next.config.ts` |
| MON-02 | 22-01, 22-02, 22-03, 22-04 | Sentry only active in `NODE_ENV === 'production'` — not in development | SATISFIED | `.env` no longer contains `SENTRY_DSN`. Server/edge Sentry receives `undefined` DSN locally and self-disables. Client Sentry uses `NEXT_PUBLIC_SENTRY_DSN` (also absent from `.env`). Both suppressed in dev. Human test to confirm zero dashboard noise still recommended. |
| MON-03 | 22-02, 22-03, 22-04 | Sentry captures unhandled errors via server instrumentation and `global-error.tsx` | SATISFIED (human-confirmed) | `onRequestError = Sentry.captureRequestError` in `instrumentation.ts`; `Sentry.captureException(error)` in both error boundaries; user confirmed production events in dashboard |

**Orphaned requirements check:** No requirements mapped to Phase 22 in REQUIREMENTS.md beyond MON-01, MON-02, MON-03. All three accounted for and satisfied.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `sentry-credentials.md` | 2 | `Org slug: YOUR_ORG_SLUG` — placeholder not updated in doc | INFO | Documentation inconsistency only; actual slug `'wildenflower'` is correct in `next.config.ts` |
| `.env.example` | 30 | `SENTRY_DSN=your_sentry_dsn` | INFO | Correct — placeholder value with no real DSN. This is the intended pattern for .env.example files. Not a concern. |

No blockers. No warnings. The previous BLOCKER (`SENTRY_DSN` with real value in `.env`) is resolved.

---

### Human Verification Required

#### 1. Production Sentry Dashboard Confirmation

**Test:** Log into sentry.io, navigate to the wildenflower project Issues view, confirm two issues exist from the Phase 22 test events.
**Expected:** Issues present with readable TypeScript file paths in stack traces (not minified chunk references). User already confirmed this verbally — capturing here for audit trail.
**Why human:** External dashboard state cannot be verified programmatically.

#### 2. Dev Server Zero-Noise Confirmation (Post-Fix)

**Test:** Run `npm run dev`, browse to the homepage and several pages for 60 seconds, then check Sentry dashboard Issues view filtered to the last 10 minutes.
**Expected:** Zero new issues appear from localhost or with `environment: 'development'`.
**Why human:** Requires running dev server and checking external dashboard. The fix is in place — SENTRY_DSN is absent from `.env` — but actual dashboard state can only be confirmed by observation.

---

## Commit Audit

All plan-documented commit hashes verified in git history:

| Commit | Plan | Description |
|--------|------|-------------|
| `1a1b1a2` | 22-01 | chore(22-01): add Sentry credentials reference file |
| `3f1cb08` | 22-02 | feat(22-02): install @sentry/nextjs and create four SDK config files |
| `d7694c8` | 22-02 | feat(22-02): wrap next.config.ts with withSentryConfig outermost |
| `2438b9d` | (user, undocumented) | ci: updating monitoring — substituted real org slug 'wildenflower' |
| `4d36c9a` | 22-03 | feat(22-03): wire Sentry.captureException into both error boundaries |
| `6afa95d` | 22-03 | feat(22-03): add temporary Sentry test page and patch CI for source map upload |
| `f2b1c94` | 22-04 | chore(22): remove temporary Sentry test routes after dashboard verification |
| `5416acb` | 22-04 | docs(22-04): complete Phase 22 error monitoring plan — Sentry production verified |

The `.env` gap fix was made directly to the gitignored local file — no commit expected or required for a gitignored file change.

---

_Verified: 2026-03-01_
_Verifier: Claude (gsd-verifier)_
_Re-verification: Yes — gap closure confirmed_
