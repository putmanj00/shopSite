---
phase: 22-error-monitoring
plan: 03
subsystem: infra
tags: [sentry, error-monitoring, error-boundary, ci, source-maps]

# Dependency graph
requires:
  - phase: 22-02
    provides: "@sentry/nextjs installed, four SDK config files, withSentryConfig wrapper"
provides:
  - "Both error boundaries (app/error.tsx + app/global-error.tsx) call Sentry.captureException(error) in useEffect"
  - "Temporary /sentry-test page with client-side unhandled rejection"
  - "Temporary /sentry-test GET route that throws uncaught server error"
  - "CI quality job Build step exposes SENTRY_AUTH_TOKEN for source map upload"
affects: [22-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Error boundary pattern: import @sentry/nextjs, call Sentry.captureException(error) in useEffect — makes React-handled errors visible to Sentry"
    - "CI source map upload: SENTRY_AUTH_TOKEN in quality job Build step env enables withSentryConfig upload during npm run build"

key-files:
  created:
    - app/sentry-test/page.tsx
    - app/sentry-test/route.ts
  modified:
    - app/error.tsx
    - app/global-error.tsx
    - .github/workflows/ci.yml

key-decisions:
  - "Both error boundaries use Sentry.captureException in useEffect — Next.js error boundaries intercept rendering errors before Sentry's global handler, so explicit capture is required"
  - "SENTRY_AUTH_TOKEN added to quality job Build step only — deploy-prod job uses vercel build --prod which pulls Vercel env vars (including SENTRY_AUTH_TOKEN set in Plan 01)"
  - "Sentry test files are explicitly TEMPORARY — Plan 04 deletes them after dashboard verification"

patterns-established:
  - "Error boundary capture: useEffect(() => { Sentry.captureException(error); }, [error]) — required pattern for all Next.js error boundaries"

requirements-completed: [MON-02, MON-03]

# Metrics
duration: 2min
completed: 2026-03-01
---

# Phase 22 Plan 03: Error Boundaries + CI Source Map Upload Summary

**Sentry.captureException wired into both Next.js error boundaries with temporary /sentry-test verification page and SENTRY_AUTH_TOKEN added to CI Build step for source map upload**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-01T05:47:58Z
- **Completed:** 2026-03-01T05:49:32Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Both app/error.tsx and app/global-error.tsx now import @sentry/nextjs and call Sentry.captureException(error) in useEffect — rendering errors previously invisible to Sentry will now appear in the dashboard
- Temporary /sentry-test page fires a client-side unhandled promise rejection on load for dashboard verification
- Temporary /sentry-test GET route throws an uncaught server error for server-side capture verification
- CI quality job Build step has SENTRY_AUTH_TOKEN — withSentryConfig will upload source maps on every CI build, enabling readable TypeScript stack traces in Sentry

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire captureException into both error boundaries** - `4d36c9a` (feat)
2. **Task 2: Create temporary Sentry test page + patch CI workflow** - `6afa95d` (feat)

## Files Created/Modified
- `app/error.tsx` - Added @sentry/nextjs import; replaced console.error with Sentry.captureException(error)
- `app/global-error.tsx` - Added @sentry/nextjs import; replaced console.error + commented Sentry.captureException with single Sentry.captureException(error)
- `app/sentry-test/page.tsx` - TEMPORARY: client-side page that fires unhandled promise rejection on load
- `app/sentry-test/route.ts` - TEMPORARY: GET handler that throws uncaught server error
- `.github/workflows/ci.yml` - Added SENTRY_AUTH_TOKEN to quality job Build step env block

## Decisions Made
- Error boundaries use explicit captureException in useEffect because Next.js error boundaries "handle" errors from React's perspective, preventing Sentry's global unhandled error handler from firing. Without explicit capture, errors triggering the fallback UI would be invisible in the dashboard.
- SENTRY_AUTH_TOKEN added only to the quality job Build step (not deploy-prod) because deploy-prod uses `vercel build --prod` which automatically pulls Vercel environment variables, including SENTRY_AUTH_TOKEN set in Plan 01.
- Test files marked TEMPORARY with explicit deletion note — Plan 04 deletes them after confirming dashboard events.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required for this plan. (Sentry credentials were configured in Plans 01-02.)

## Next Phase Readiness
- Plan 04 can now navigate to /sentry-test to trigger test events and verify they appear in the Sentry dashboard
- After dashboard verification, Plan 04 deletes app/sentry-test/ directory
- All typecheck, lint, and gitleaks pre-commit hooks pass

---
*Phase: 22-error-monitoring*
*Completed: 2026-03-01*
