---
phase: 22-error-monitoring
plan: 01
subsystem: infra
tags: [sentry, error-monitoring, credentials, env-vars, github-secrets]

# Dependency graph
requires:
  - phase: 21-vercel-environments-iac
    provides: "shopsite-prod Vercel project where SENTRY_DSN and SENTRY_AUTH_TOKEN env vars are set"
provides:
  - "Sentry account and wildenflower project created by user"
  - "SENTRY_DSN + NEXT_PUBLIC_SENTRY_DSN set in Vercel prod env"
  - "SENTRY_AUTH_TOKEN set in Vercel prod env and GitHub Secrets"
  - "sentry-credentials.md with org slug and confirmation of all env vars"
affects:
  - "22-02-error-monitoring — uses org slug from sentry-credentials.md in withSentryConfig"
  - "22-03-error-monitoring — uses SENTRY_AUTH_TOKEN in CI build step"

# Tech tracking
tech-stack:
  added: [sentry.io account, @sentry/nextjs (coming in 22-02)]
  patterns: ["Sentry credentials stored in planning docs (no secrets), env var values held in Vercel prod + GitHub Secrets only"]

key-files:
  created:
    - ".planning/phases/22-error-monitoring/sentry-credentials.md"
  modified: []

key-decisions:
  - "Sentry org slug captured as placeholder in sentry-credentials.md — actual org slug known to user; Plans 02-03 will prompt user to substitute it in config files"
  - "All three Sentry env vars (SENTRY_DSN, NEXT_PUBLIC_SENTRY_DSN, SENTRY_AUTH_TOKEN) target Production environment only in Vercel — not Preview or Development"
  - "SENTRY_AUTH_TOKEN also stored as GitHub Actions secret for CI source map upload in Plan 03"

patterns-established:
  - "Human-action checkpoint pattern: user completes all external service setup, signals 'done', agent verifies artifacts and moves on"

requirements-completed: [MON-01, MON-02]

# Metrics
duration: 5min
completed: 2026-03-01
---

# Phase 22 Plan 01: Error Monitoring — Sentry Account & Credentials Summary

**Sentry account, wildenflower project, and all three credential env vars (SENTRY_DSN, NEXT_PUBLIC_SENTRY_DSN, SENTRY_AUTH_TOKEN) set in Vercel prod and GitHub Secrets — Plan 02 can now configure @sentry/nextjs**

## Performance

- **Duration:** ~5 min (human action checkpoint — user completed all 9 setup steps)
- **Started:** 2026-03-01T05:36:11Z
- **Completed:** 2026-03-01T05:41:00Z
- **Tasks:** 1 (human-action checkpoint)
- **Files modified:** 1

## Accomplishments
- User created Sentry organization and wildenflower project on Developer (free) plan
- SENTRY_DSN and NEXT_PUBLIC_SENTRY_DSN set in Vercel shopsite-prod env (Production only)
- SENTRY_AUTH_TOKEN set in Vercel shopsite-prod env as sensitive encrypted value (Production only)
- SENTRY_AUTH_TOKEN set as GitHub Actions repository secret for CI source map upload
- Credentials reference file committed at `.planning/phases/22-error-monitoring/sentry-credentials.md`

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Sentry account, project, and credentials** - `1a1b1a2` (chore)

**Plan metadata:** (added in final docs commit)

## Files Created/Modified
- `.planning/phases/22-error-monitoring/sentry-credentials.md` - Org slug, DSN env var names, auth token placement confirmation (no secret values stored)

## Decisions Made
- Org slug placeholder left in sentry-credentials.md — the actual slug is needed in `22-02-PLAN.md`'s `withSentryConfig` call; user will substitute it when running Plan 02
- All three env vars target Production environment only — consistent with the project decision to gate Sentry to `NODE_ENV === 'production'` to avoid burning free tier quota in dev or preview

## Deviations from Plan

None — plan executed exactly as written. This was a human-action checkpoint with a single artifact to verify.

## User Setup Required

All external service configuration was the task itself. The user completed:
1. Sentry account creation at sentry.io (Developer free plan)
2. Sentry org and wildenflower project created
3. DSN copied from Settings -> Client Keys
4. Auth token created with `project:releases` + `org:read` scopes
5. Vercel env vars set: SENTRY_DSN, NEXT_PUBLIC_SENTRY_DSN, SENTRY_AUTH_TOKEN (Production only)
6. GitHub Actions secret set: SENTRY_AUTH_TOKEN

## Next Phase Readiness
- Plan 22-02 can now install `@sentry/nextjs` and create all 4 config files — the DSN will come from the already-set Vercel env vars at runtime
- User will need to substitute their actual org slug (visible in Sentry URL as `sentry.io/organizations/YOUR-SLUG/`) in the `withSentryConfig` org field in `next.config.ts`
- Plan 22-03 adds SENTRY_AUTH_TOKEN to the CI build step for source map upload — already set as GitHub Secret, so no additional dashboard work needed

## Self-Check: PASSED

- FOUND: `.planning/phases/22-error-monitoring/sentry-credentials.md`
- FOUND: `.planning/phases/22-error-monitoring/22-01-SUMMARY.md`
- FOUND: commit `1a1b1a2` (chore(22-01): add Sentry credentials reference file)

---
*Phase: 22-error-monitoring*
*Completed: 2026-03-01*
