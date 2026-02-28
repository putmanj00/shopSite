---
phase: 20-ci-cd-pipeline
plan: "02"
subsystem: infra
tags: [github-actions, ci-cd, playwright, gitleaks, npm-audit, yaml]

# Dependency graph
requires:
  - phase: 20-ci-cd-pipeline-plan-01
    provides: playwright.config.ts with chromium/firefox/webkit projects; npm audit exits 0

provides:
  - .github/workflows/ci.yml with five named CI jobs
  - quality job: lint + typecheck + build with Shopify env vars from secrets
  - e2e job: 3-browser matrix with artifact upload per browser
  - secrets job: full-history gitleaks scan (fetch-depth 0)
  - audit job: npm audit --audit-level=high --omit=dev
  - deploy-prod stub: environment production gate fires only on push to main

affects:
  - 20-03 (branch protection rules will reference exact job names from this workflow)
  - 21 (Vercel deploy hook replaces the echo stub in deploy-prod)

# Tech tracking
tech-stack:
  added:
    - gitleaks/gitleaks-action@v2 (secrets scanning in CI)
    - actions/checkout@v4
    - actions/setup-node@v4
    - actions/upload-artifact@v4
  patterns:
    - "Five-job parallel CI: quality|secrets|audit run in parallel; e2e needs quality; deploy-prod needs all four"
    - "Browser matrix strategy with fail-fast: false — one browser failure does not cancel others"
    - "Artifact uploaded if: ${{ !cancelled() }} — captures report even when tests fail"
    - "fetch-depth: 0 on secrets checkout — required for full history gitleaks scan (shallow clone = false negatives)"
    - "environment: production in deploy-prod — creates GitHub manual approval gate for prod deploys"

key-files:
  created:
    - .github/workflows/ci.yml
  modified: []

key-decisions:
  - "All five jobs in single workflow file — distinct named status checks in GitHub PR UI, not separate workflows"
  - "No Playwright browser cache — Playwright docs advise against it (restore time ≈ download time)"
  - "NEXT_PUBLIC_BASE_URL hardcoded to https://wildenflower.com in quality job (not a secret — public URL)"
  - "NEXT_PUBLIC_BASE_URL set to http://localhost:3000 in e2e job — matches playwright.config.ts baseURL"
  - "No GITLEAKS_LICENSE needed for personal repo — gitleaks-action@v2 works without a commercial license"
  - "deploy-prod fires only on push to main (if condition) — draft PRs get CI checks but no deployment"

patterns-established:
  - "Pattern 1: Job naming convention — exact job names (quality, e2e, etc.) referenced by branch protection in Plan 03"
  - "Pattern 2: Secrets comment block at top of workflow — documents required GitHub Secrets inline for future maintainers"

requirements-completed: [CICD-01, CICD-02, CICD-03, CICD-04, CICD-05, CICD-07]

# Metrics
duration: 1min
completed: 2026-02-28
---

# Phase 20 Plan 02: GitHub Actions CI Workflow Summary

**Single .github/workflows/ci.yml with five named jobs: quality (lint/typecheck/build), E2E 3-browser matrix with artifact upload, gitleaks secrets scan, npm audit, and manual-gated production deploy stub**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-28T18:23:21Z
- **Completed:** 2026-02-28T18:24:19Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Created `.github/workflows/ci.yml` with all five named jobs that will appear as distinct status checks on GitHub PRs
- E2E job uses a 3-browser matrix (chromium/firefox/webkit) with `fail-fast: false` so one browser failure does not cancel others; each browser uploads a separate named artifact
- Secrets job uses `fetch-depth: 0` (full history clone) to prevent false negatives in gitleaks scan
- deploy-prod job references `environment: production` — the GitHub Environment required reviewer gate (Plan 03) attaches here

## Task Commits

Each task was committed atomically:

1. **Task 1: Create GitHub Actions CI workflow** - `18db473` (feat)
2. **Task 2: Validate YAML and verify secrets comment** - (no file changes; validation passed, comment was included in Task 1 write)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified
- `.github/workflows/ci.yml` - Complete CI/CD workflow with five named jobs, browser matrix, gitleaks scan, audit gate, and production deploy stub

## Decisions Made
- All five jobs in a single workflow file — simpler to maintain, produces distinct named status checks
- No Playwright browser caching — Playwright documentation explicitly warns against it (restore time equals download time for browser binaries)
- `NEXT_PUBLIC_BASE_URL` is hardcoded (`https://wildenflower.com`) in quality job, not a secret — it is a public URL
- `NEXT_PUBLIC_BASE_URL` is `http://localhost:3000` in e2e job — matches the `baseURL` in `playwright.config.ts`
- No GITLEAKS_LICENSE required — gitleaks-action@v2 works on personal repos without a commercial license
- Secrets comment block included at top of file — documents the three required GitHub Secrets for future maintainers

## Deviations from Plan

None - plan executed exactly as written. The secrets comment block was included in the initial file write (Task 1) rather than as a separate Task 2 edit, since both tasks modify the same file and the comment was part of the planned content.

## Issues Encountered
None — YAML validates cleanly, all five jobs and dependency graph verified correct.

## User Setup Required

Before the workflow will pass, the following GitHub Secrets must be configured in the repository (Settings → Secrets and Variables → Actions → Repository secrets):

- `SHOPIFY_STORE_DOMAIN` — e.g. wildenflower.myshopify.com
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` — public Storefront API token
- `SHOPIFY_SHOP_ID` — numeric Shopify shop ID

These are required by the `quality` and `e2e` jobs. Without them the build step will fail.

## Next Phase Readiness
- `.github/workflows/ci.yml` is committed and ready — pushing any branch will trigger the workflow
- Job names are fixed: branch protection rules in Plan 03 must reference these exact names: `Quality (lint / typecheck / build)`, `E2E (chromium)`, `E2E (firefox)`, `E2E (webkit)`, `Secrets Scan`, `npm audit`
- The `environment: production` field in deploy-prod is the hook point for Plan 03's GitHub Environment configuration with required reviewers
- Phase 21 (Vercel) will replace the `echo` stub in deploy-prod with an actual Vercel deployment step

## Self-Check: PASSED

- FOUND: .github/workflows/ci.yml
- FOUND commit: 18db473 (feat - CI workflow)
- YAML validates: python3 yaml.safe_load passes
- All 5 jobs present: quality, e2e, secrets, audit, deploy-prod
- e2e has needs: quality and matrix.browser: [chromium, firefox, webkit]
- secrets has fetch-depth: 0
- audit uses --omit=dev
- deploy-prod has environment: production and push-to-main condition
- Artifact upload uses name: playwright-report-${{ matrix.browser }}

---
*Phase: 20-ci-cd-pipeline*
*Completed: 2026-02-28*
