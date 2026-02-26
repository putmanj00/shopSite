---
phase: 13-product-data-quality
plan: 01
subsystem: ui
tags: [shopify, product-filtering, typescript, nextjs]

# Dependency graph
requires:
  - phase: 12-navigation-labels
    provides: nav wiring complete; product grids are the next consumer-facing layer
provides:
  - lib/product-filters.ts with normalizeVendor, isTestProduct, hasProductImage, isShowableProduct
  - Test/imageless product filtering on all three product grid entry points
affects:
  - 13-02 (normalizeVendor ready to consume for vendor display on product cards)
  - any future product rendering surface (pattern: import isShowableProduct from @/lib/product-filters)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "isShowableProduct as single-function filter gate applied after .map(edge => edge.node)"
    - "Product filter helpers in lib/product-filters.ts consumed by all product grid components"

key-files:
  created:
    - lib/product-filters.ts
  modified:
    - components/featured-products.tsx
    - components/collection-content.tsx
    - components/related-products.tsx

key-decisions:
  - "isShowableProduct applied before currentProductId filter in related-products (test/imageless guard is upstream)"
  - "isShowableProduct applied as FIRST filter in collection-content useMemo (before search, price, type, tag filters)"
  - "TEST_PRODUCT_TITLES uses Set for O(1) lookup; case-insensitive trim for resilience"

patterns-established:
  - "Product filter gate: .map((edge) => edge.node).filter(isShowableProduct) — use this pattern on any new product rendering surface"
  - "normalizeVendor is exported and ready for Plan 02 to consume on product cards"

requirements-completed: [PRDS-02, PRDS-03]

# Metrics
duration: 2min
completed: 2026-02-26
---

# Phase 13 Plan 01: Product Data Quality — Filter Helpers Summary

**lib/product-filters.ts created with isShowableProduct helper; test products ('ring', 'generic tiedye') and imageless products filtered from homepage grid, collection pages, and related products.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-26T21:41:36Z
- **Completed:** 2026-02-26T21:42:47Z
- **Tasks:** 2
- **Files modified:** 4 (1 created + 3 modified)

## Accomplishments
- Created `lib/product-filters.ts` with four exported helpers: `normalizeVendor`, `isTestProduct`, `hasProductImage`, `isShowableProduct`
- Applied `isShowableProduct` to `featured-products.tsx` (homepage grid)
- Applied `isShowableProduct` as first filter in `collection-content.tsx` useMemo (before all other filters)
- Applied `isShowableProduct` on both fetch paths in `related-products.tsx` (first-fetch + fallback)
- TypeScript compiles cleanly with no errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create lib/product-filters.ts with isShowableProduct helpers** - `bed06cf` (feat)
2. **Task 2: Apply isShowableProduct filter to all three product-rendering components** - `ae59d6f` (feat)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified
- `lib/product-filters.ts` - normalizeVendor, isTestProduct, hasProductImage, isShowableProduct helpers
- `components/featured-products.tsx` - import + .filter(isShowableProduct) after .map()
- `components/collection-content.tsx` - import + .filter(isShowableProduct) as first useMemo step
- `components/related-products.tsx` - import + .filter(isShowableProduct) on both fetch paths

## Decisions Made
- `isShowableProduct` placed before `currentProductId` filter in related-products — the showability guard is upstream of product-specific logic
- In collection-content useMemo, filter applied as the very first step so no other filter logic ever sees test/imageless products
- `TEST_PRODUCT_TITLES` uses a `Set` for O(1) case-insensitive lookup with `.trim()` for resilience

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `normalizeVendor` is exported and ready for Plan 02 to consume on product cards/detail pages
- `isShowableProduct` pattern established — any new product rendering surface should import and apply it
- All three grid entry points filtered; no other product rendering surfaces identified

---
*Phase: 13-product-data-quality*
*Completed: 2026-02-26*
