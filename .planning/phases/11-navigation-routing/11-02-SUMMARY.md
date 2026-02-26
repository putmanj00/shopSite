---
phase: 11-navigation-routing
plan: 02
subsystem: ui
tags: [routing, navigation, next.js, sitemap, href, collections]

# Dependency graph
requires:
  - phase: 11-navigation-routing plan 01
    provides: proxy.ts redirect from /collections to /collections/all (NAV-01)
provides:
  - All internal href="/collections" bare links replaced with href="/collections/all" (NAV-02, NAV-03)
  - Dead app/collections/page.tsx route removed
  - Sitemap cleaned — no bare /collections canonical entry
affects: [homepage, hero, brand-story, breadcrumbs, account, local-page, sitemap]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "All internal shop links use /collections/all as the canonical shop landing page"
    - "Dead route files removed when proxy.ts intercepts the route before file router"

key-files:
  created: []
  modified:
    - app/page.tsx
    - components/hero.tsx
    - components/homepage/brand-story.tsx
    - components/collection-breadcrumbs.tsx
    - components/account/wishlist-preview.tsx
    - components/account/order-history.tsx
    - app/local/page.tsx
    - app/sitemap.ts
  deleted:
    - app/collections/page.tsx

key-decisions:
  - "app/collections/page.tsx deleted — proxy.ts intercepts /collections before file router fires; file was dead code"
  - "Bare /collections removed from sitemap — redirect URLs are not canonical, /collections/all is the canonical shop page"
  - "Collection breadcrumb middle step points to /collections/all — correct canonical for the shop landing"

patterns-established:
  - "Internal links: always use /collections/all, never bare /collections"
  - "Sitemap: only canonical (non-redirect) URLs listed; redirect targets excluded"

requirements-completed: [NAV-02, NAV-03]

# Metrics
duration: 1min
completed: 2026-02-26
---

# Phase 11 Plan 02: Navigation Routing — Collections Link Audit Summary

**All 8 stale `href="/collections"` bare links replaced with `/collections/all` across 7 source files; dead route deleted and sitemap cleaned**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-26T04:14:55Z
- **Completed:** 2026-02-26T04:16:51Z
- **Tasks:** 3
- **Files modified:** 8 (7 link fixes + 1 sitemap) + 1 deleted

## Accomplishments
- Fixed all 8 `href="/collections"` instances across 7 source files — shoppers never follow a redirect from internal navigation
- NAV-02 requirement met: "Wander the Shop" hero CTA in app/page.tsx links directly to /collections/all
- NAV-03 requirement met: grep for bare `href="/collections"` returns zero results codebase-wide
- Deleted dead `app/collections/page.tsx` — proxy.ts intercepts /collections before the file router, so this file was never reached
- Removed bare `/collections` from sitemap — redirect URLs are not canonical; `/collections/all` is the correct entry

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix all href="/collections" links across source files** — Already committed in 11-01 commit `8315160` (feat)
2. **Task 2: Clean up dead route and sitemap** — `4d84f96` (feat)
3. **Task 3: Final grep verification — zero stale links** — Verification only, no code changes

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `app/page.tsx` — Wander the Shop CTA: `/collections` → `/collections/all` (NAV-02)
- `components/hero.tsx` — Shop Now + Browse Collections buttons: both updated
- `components/homepage/brand-story.tsx` — Explore the Collection link updated
- `components/collection-breadcrumbs.tsx` — Collections breadcrumb middle step updated
- `components/account/wishlist-preview.tsx` — Browse Products empty-state button updated
- `components/account/order-history.tsx` — Start Shopping empty-state button updated
- `app/local/page.tsx` — Shop Online button updated
- `app/sitemap.ts` — Bare `/collections` entry removed; `/collections/all` remains canonical
- `app/collections/page.tsx` — DELETED (dead route, intercepted by proxy.ts)

## Decisions Made
- app/collections/page.tsx deleted: proxy.ts intercepts /collections before file router fires; the file was unreachable dead code
- Bare /collections removed from sitemap: search engines should index /collections/all as the canonical shop landing page, not a redirect
- Collection breadcrumb "Collections" step points to /collections/all: this is the correct canonical shop page for the hierarchical breadcrumb

## Deviations from Plan

**Note:** Task 1's file edits were found already committed in the 11-01 plan execution (`8315160`). The 11-01 executor included the link fixes as part of its proxy.ts commit. The edits applied via the Edit tool in this plan execution were no-ops (git saw no diff). Task 2 (dead route deletion + sitemap cleanup) and Task 3 (verification) executed as planned.

None requiring deviation rules — the pre-committed state of Task 1 was discovered and verified rather than re-applied. All success criteria confirmed met.

## Issues Encountered
- Task 1 file changes were already present in the codebase (committed by 11-01 executor as part of its atomic commit). Detected via `git diff HEAD` returning empty diff after edits. Verified all 8 href values already set to `/collections/all`. Proceeded to Task 2 without issue.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- NAV-02 and NAV-03 complete — all internal /collections links are canonical
- Proxy.ts (NAV-01) + link audit (NAV-02/03) provide full routing coverage
- Ready for Phase 11 Plan 03 (remaining navigation routing tasks)

---
*Phase: 11-navigation-routing*
*Completed: 2026-02-26*
