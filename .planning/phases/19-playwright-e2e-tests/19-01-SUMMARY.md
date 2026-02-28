---
phase: 19-playwright-e2e-tests
plan: 01
subsystem: testing
tags: [playwright, e2e, chromium, typescript, next.js]

# Dependency graph
requires:
  - phase: 18-security-dev-tooling
    provides: lefthook pre-commit hooks (typecheck, eslint, gitleaks) that all tests must pass through
provides:
  - Playwright Chromium E2E infrastructure with webServer config
  - 5 passing structural E2E tests across 3 spec files (E2E-01, E2E-02, E2E-07)
  - data-testid attributes on cart-count badge and product-grid
affects:
  - 19-playwright-e2e-tests (plan 02 will add product-detail and checkout tests)
  - 20-ci-cd-pipeline (CI job will run test:e2e against these spec files)

# Tech tracking
tech-stack:
  added:
    - "playwright@1.57.0 (already in devDependencies, browser binaries now installed)"
  patterns:
    - "webServer uses 'next dev --webpack' to avoid Turbopack panic in multi-lockfile workspace"
    - "All spec imports use 'playwright/test' (not '@playwright/test') — package is 'playwright'"
    - "reuseExistingServer: true — Playwright reuses running dev server if available"
    - "Structural tests only — no Shopify product/order fixture dependency"

key-files:
  created:
    - playwright.config.ts
    - e2e/homepage.spec.ts
    - e2e/collections.spec.ts
    - e2e/category-nav.spec.ts
  modified:
    - package.json
    - components/header.tsx
    - components/collection-content.tsx

key-decisions:
  - "webServer command uses 'next dev --webpack' not 'npm run dev' — avoids Turbopack panic caused by multiple lockfiles in workspace root"
  - "Structural tests use role-based selectors (getByRole) not text selectors — resilient to copy changes"
  - "Category nav test uses .hover() to trigger onMouseEnter dropdown — more reliable than .click() in headless Chromium"

patterns-established:
  - "spec files import from 'playwright/test' — never '@playwright/test'"
  - "All E2E tests run via npm run test:e2e; UI mode via npm run test:e2e:ui"

requirements-completed: [E2E-01, E2E-02, E2E-07]

# Metrics
duration: 4min
completed: 2026-02-28
---

# Phase 19 Plan 01: Playwright E2E Infrastructure Summary

**Playwright Chromium E2E infrastructure with 5 passing structural tests for homepage hero, main nav, featured products, collection product grid, and Shop dropdown navigation.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-28T14:34:12Z
- **Completed:** 2026-02-28T14:38:10Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Installed Playwright Chromium browser binaries and created `playwright.config.ts` with webServer config pointing to `next dev --webpack`
- Added `test:e2e` and `test:e2e:ui` scripts to `package.json`
- Added `data-testid="cart-count"` and `data-testid="product-grid"` to existing components with no logic changes
- Wrote 5 structural E2E tests across 3 spec files — all passing with zero failures against the live dev server

## Task Commits

Each task was committed atomically:

1. **Task 1: Install browser binaries, create config, add npm script** - `2a36444` (chore)
2. **Task 2: Add data-testid attributes to header and collection-content** - `812f8e2` (feat)
3. **Task 3: Write structural E2E tests** - `5b67397` (feat)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified
- `playwright.config.ts` — Playwright config with Chromium project, webServer, 30s test timeout, 10s expect timeout
- `e2e/homepage.spec.ts` — E2E-01: 3 tests for hero h1, main navigation, Freshly Gathered section
- `e2e/collections.spec.ts` — E2E-02: 1 test confirming /collections/all has at least one product h3
- `e2e/category-nav.spec.ts` — E2E-07: 1 test confirming Shop dropdown click navigates to /collections/* URL
- `package.json` — Added test:e2e and test:e2e:ui scripts
- `components/header.tsx` — Added data-testid="cart-count" to cart badge span
- `components/collection-content.tsx` — Added data-testid="product-grid" to grid container div

## Decisions Made
- webServer command uses `next dev --webpack` not `npm run dev` — the default Turbopack mode panics on this workspace because `pnpm-lock.yaml` exists at `/Users/jamesputman/` (parent directory), causing Next.js to detect multiple lockfiles and send Turbopack into a range-bounds panic. webpack mode starts cleanly.
- Role-based selectors (getByRole) preferred over text/CSS selectors — resilient to minor copy changes.
- Category nav test uses `.hover()` to open dropdown — the Shop menu triggers on `onMouseEnter`, making `.hover()` more reliable than `.click()` in headless Chromium.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Replaced 'npm run dev' with 'next dev --webpack' in webServer command**
- **Found during:** Task 3 (first test run)
- **Issue:** Playwright's webServer tried to start the dev server and Turbopack panicked with "range end index 19810 out of range for slice of length 1146" — a Turbopack bug triggered by detecting multiple lockfiles (project `package-lock.json` + parent `pnpm-lock.yaml`).
- **Fix:** Changed `playwright.config.ts` `webServer.command` from `'npm run dev'` to `'next dev --webpack'` to bypass Turbopack. The `--webpack` flag is the correct Next.js 16 flag (not `--no-turbopack` which is invalid).
- **Files modified:** `playwright.config.ts`
- **Verification:** All 5 tests passed after the fix
- **Committed in:** `5b67397` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential — tests could not run without this fix. No scope creep.

## Issues Encountered
- Turbopack multi-lockfile workspace panic — resolved by using `next dev --webpack` in webServer config (see Deviations above).

## User Setup Required
None - no external service configuration required. Tests run fully locally against `next dev --webpack`.

## Next Phase Readiness
- Playwright infrastructure fully operational — `npm run test:e2e` exits 0 with 5 passing tests
- Plan 19-02 (product detail + checkout tests) can add spec files directly to `e2e/` with the same `playwright/test` import pattern
- Phase 20 (CI/CD) can reference `npm run test:e2e` in GitHub Actions jobs — the `next dev --webpack` webServer approach works headlessly

---
*Phase: 19-playwright-e2e-tests*
*Completed: 2026-02-28*
