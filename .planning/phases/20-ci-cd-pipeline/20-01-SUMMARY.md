---
phase: 20-ci-cd-pipeline
plan: "01"
subsystem: infra
tags: [playwright, github-actions, npm-audit, security, ci-cd, next]

# Dependency graph
requires:
  - phase: 19-playwright-e2e-tests
    provides: playwright.config.ts with chromium project and e2e/ spec files

provides:
  - npm audit exits 0 for prod dependencies (next upgraded to 16.1.6)
  - playwright.config.ts with chromium, firefox, and webkit projects for CI matrix
  - Conditional reporter (list+html in CI, list locally)
  - reuseExistingServer: !process.env.CI for fresh server in CI

affects:
  - 20-02 (CI workflow will reference --project=chromium/firefox/webkit and npm audit --omit=dev)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Playwright multi-browser project matrix (chromium/firefox/webkit) in a single config"
    - "Conditional reporter array for CI vs local: process.env.CI ? [['list'],['html']] : 'list'"
    - "npm audit --audit-level=high --omit=dev for CI prod-only vulnerability gate"

key-files:
  created: []
  modified:
    - playwright.config.ts
    - package.json
    - package-lock.json

key-decisions:
  - "npm audit --audit-level=high --omit=dev is the correct flag set for CI — excludes devDep vulns (minimatch via @typescript-eslint), focuses on prod vulns only"
  - "Upgraded next@16.1.1 to next@16.1.6 to fix 3 high-severity DoS vulnerabilities (GHSA-9g9p-9gw9-jx7f, GHSA-h25m-26qc-wcjf, GHSA-5f7q-jpqc-wp7h)"
  - "reuseExistingServer: !process.env.CI ensures CI starts a fresh dev server — avoids stale server confusion (Pitfall 2 from research)"
  - "HTML reporter uses open: 'never' to prevent browser launching in CI runners"

patterns-established:
  - "Pattern 1: CI-conditional config — use process.env.CI to branch reporter/server behavior in playwright.config.ts"
  - "Pattern 2: audit --omit=dev — prod vulnerability gate excludes devDependencies that are never bundled"

requirements-completed: [CICD-02, CICD-05]

# Metrics
duration: 2min
completed: 2026-02-28
---

# Phase 20 Plan 01: CI Prerequisites (npm audit + multi-browser Playwright) Summary

**next@16.1.6 upgrade clears 3 high-severity DoS CVEs; playwright.config.ts extended to chromium/firefox/webkit with CI-appropriate reporter and fresh server semantics**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-28T18:18:47Z
- **Completed:** 2026-02-28T18:20:47Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Resolved 3 high-severity next.js vulnerabilities by upgrading from 16.1.1 to 16.1.6; `npm audit --audit-level=high --omit=dev` now exits 0
- Extended playwright.config.ts with firefox and webkit projects so the CI browser matrix can run `--project=chromium|firefox|webkit`
- Configured conditional reporter (list + HTML in CI, list locally) to produce the uploadable Playwright report artifact Plan 02 needs
- Set `reuseExistingServer: !process.env.CI` to guarantee a fresh dev server start in CI runners

## Task Commits

Each task was committed atomically:

1. **Task 1: Resolve npm audit blockers for CI** - `5b38b7c` (chore)
2. **Task 2: Update playwright.config.ts for multi-browser CI matrix** - `cda79cb` (feat)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified
- `playwright.config.ts` - Added firefox and webkit projects; conditional reporter; reuseExistingServer: !process.env.CI
- `package.json` - next upgraded from 16.1.1 to 16.1.6
- `package-lock.json` - Lock file updated to reflect next@16.1.6 and its transitive deps

## Decisions Made
- `npm audit --audit-level=high --omit=dev` is the right flag combination for CI — minimatch vulnerability is via @typescript-eslint (devDep, excluded), next.js vulnerability is a prod dep (included, fixed)
- Upgraded next@16.1.1 → next@16.1.6 (3 high-severity DoS CVEs resolved; build confirmed passing post-upgrade)
- `reuseExistingServer: !process.env.CI` over a boolean `false` — this is the idiomatic Playwright pattern and works correctly both in CI and local dev

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Found 3 high-severity vulns, not 2 as documented in plan**
- **Found during:** Task 1 (npm audit)
- **Issue:** Plan context noted 2 known high-severity vulns (GHSA-9g9p-9gw9-jx7f, GHSA-h25m-26qc-wcjf). Audit found a third: GHSA-5f7q-jpqc-wp7h (Unbounded Memory Consumption via PPR Resume Endpoint). All three are in next@16.1.1 and fixed in 16.1.6.
- **Fix:** Upgraded next@16.1.6 as planned; all three CVEs resolved in a single upgrade
- **Files modified:** package.json, package-lock.json
- **Verification:** `npm audit --audit-level=high --omit=dev` exits 0; `npm run build` succeeds
- **Committed in:** 5b38b7c (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — third CVE not in plan docs, same fix applied)
**Impact on plan:** No scope change. The upgrade was already planned; a third CVE simply reinforced the decision. No extra work required.

## Issues Encountered
None — both tasks executed cleanly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `npm audit --audit-level=high --omit=dev` exits 0 — the CI `audit` job will pass on first run
- playwright.config.ts declares chromium, firefox, and webkit — CI workflow can reference `--project=${{ matrix.browser }}`
- HTML report generation configured — CI artifact upload (Plan 02, CICD-03) will have a report to upload
- Plan 02 can now write the `.github/workflows/ci.yml` with confidence both prerequisites are satisfied

## Self-Check: PASSED

- FOUND: .planning/phases/20-ci-cd-pipeline/20-01-SUMMARY.md
- FOUND: playwright.config.ts
- FOUND: package.json
- FOUND commit: 5b38b7c (Task 1)
- FOUND commit: cda79cb (Task 2)

---
*Phase: 20-ci-cd-pipeline*
*Completed: 2026-02-28*
