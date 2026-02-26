---
phase: 12-navigation-labels
plan: 01
subsystem: api
tags: [shopify, graphql, navigation, typescript]

# Dependency graph
requires: []
provides:
  - GET_MENU_QUERY GraphQL query for Shopify menu(handle:) endpoint in lib/shopify-queries.ts
  - NavItem interface { label: string; href: string } exported from lib/shopify-helpers.ts
  - getNavMenu(handle) server-side function returning NavItem[] with fallback logic
  - FALLBACK_NAV_ITEMS with all 6 canonical categories in locked order
affects:
  - 12-02 (header nav — imports NavItem, calls getNavMenu)
  - 12-03 (mobile drawer — imports NavItem, calls getNavMenu)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "getNavMenu() pattern: shopifyFetch with inline response type, warn+fallback on missing/incomplete menu"
    - "VALID_HANDLES Set filter: guards against non-category Shopify menu items (Home, About, etc.)"
    - "items.length < 6 guard: returns FALLBACK_NAV_ITEMS if Shopify menu is incomplete"

key-files:
  created: []
  modified:
    - lib/shopify-queries.ts
    - lib/shopify-helpers.ts

key-decisions:
  - "FALLBACK_NAV_ITEMS is const (not exported) — only NavItem and getNavMenu are the public API"
  - "Fallback order locked: Tie-Dye, Jewelry, Crystals, Leather, Ceramics, Artwork"
  - "items.length < 6 threshold — any partial menu triggers fallback (protects against missing Crystals/Ceramics)"
  - "VALID_HANDLES filter — filters non-category items (Home, About) from Shopify menu response"

patterns-established:
  - "NavItem interface as the data contract between Shopify data layer and UI nav components"
  - "Inline generic type on shopifyFetch<{menu: ... | null}> — no separate response type needed for simple queries"

requirements-completed: [NAV-04, NAV-05]

# Metrics
duration: 1min
completed: 2026-02-26
---

# Phase 12 Plan 01: Navigation Labels — Data Layer Summary

**GET_MENU_QUERY + NavItem interface + getNavMenu() with 6-category hardcoded fallback — nav data contract complete**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-26T20:00:15Z
- **Completed:** 2026-02-26T20:01:36Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added `GET_MENU_QUERY` GraphQL constant to `lib/shopify-queries.ts` — queries Shopify `menu(handle:)` with items (id, title, url, type)
- Exported `NavItem` interface `{ label: string; href: string }` from `lib/shopify-helpers.ts` — data contract for header and mobile drawer
- Exported `getNavMenu(handle)` — fetches Shopify menu, filters COLLECTION-type items, validates 6 expected categories, falls back to hardcoded list on any failure
- Added `FALLBACK_NAV_ITEMS` (const, not exported) with all 6 exact canonical labels in locked order

## Task Commits

Each task was committed atomically:

1. **Task 1: Add GET_MENU_QUERY to shopify-queries.ts** - `3ff907c` (feat)
2. **Task 2: Add NavItem interface and getNavMenu() to shopify-helpers.ts** - `86d3c35` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `lib/shopify-queries.ts` - Appended GET_MENU_QUERY constant (menu handle/title/items query)
- `lib/shopify-helpers.ts` - Added GET_MENU_QUERY import, NavItem interface, FALLBACK_NAV_ITEMS, VALID_HANDLES, getNavMenu()

## Decisions Made
- FALLBACK_NAV_ITEMS is `const` (not exported) — only `NavItem` and `getNavMenu` form the public API surface
- Fallback order is locked: Tie-Dye, Jewelry, Crystals, Leather, Ceramics, Artwork
- `items.length < 6` threshold triggers fallback — protects against partial Shopify menu (e.g., missing Crystals or Ceramics)
- `VALID_HANDLES` Set filters non-category items (Home links, About links) from Shopify menu response
- Inline generic type used on `shopifyFetch<{menu: ... | null}>` — no separate response type needed for this simple query

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Data layer complete — `NavItem` and `getNavMenu()` ready to import in header (12-02) and mobile drawer (12-03)
- TypeScript compiles clean with no errors introduced
- No blockers

---
*Phase: 12-navigation-labels*
*Completed: 2026-02-26*

## Self-Check: PASSED

- FOUND: lib/shopify-queries.ts
- FOUND: lib/shopify-helpers.ts
- FOUND: .planning/phases/12-navigation-labels/12-01-SUMMARY.md
- FOUND: commit 3ff907c (Task 1)
- FOUND: commit 86d3c35 (Task 2)
