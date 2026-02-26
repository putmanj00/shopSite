---
phase: 13-product-data-quality
plan: 02
subsystem: ui
tags: [normalizeVendor, product-card, product-info, quick-view-modal, botanical-corners, vendor-display]

# Dependency graph
requires:
  - phase: 13-01
    provides: normalizeVendor() exported from lib/product-filters.ts

provides:
  - product-card.tsx renders normalizeVendor(product.vendor) — "My Store" shows as "Wildenflower"
  - product-info.tsx renders normalizeVendor(product.vendor) — detail page vendor display corrected
  - quick-view-modal.tsx renders normalizeVendor(product.vendor) — Quick View vendor display corrected
  - product-card.tsx has botanical corner PNG overlays (top-left and bottom-right, z-10, pointer-events-none)
  - "No image" fallback div removed from product-card.tsx (dead code since isShowableProduct filters upstream)

affects: [product-card, product-info, quick-view-modal]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "normalizeVendor(product.vendor) pattern — apply to every component that renders vendor display"
    - "Corner overlay images: alt='' aria-hidden='true' z-10 pointer-events-none select-none — decorative, non-interactive"
    - "Corner z-10 < WishlistButton z-20 — overlays never block interactive UI elements"

key-files:
  created: []
  modified:
    - components/product-card.tsx
    - components/product-info.tsx
    - components/quick-view-modal.tsx

key-decisions:
  - "normalizeVendor import added alongside existing lib/shopify-helpers import in product-card.tsx — no structural change to component"
  - "Corner overlays placed after Quick View button (inside image container), before closing div — pointer-events-none ensures Quick View hover unaffected"
  - "No image fallback removed — dead code; isShowableProduct upstream filter (Plan 01) guarantees all rendered cards have images"

patterns-established:
  - "Vendor normalization: always use normalizeVendor(product.vendor) not product.vendor directly in display"
  - "Decorative overlays: alt='' aria-hidden='true' pointer-events-none select-none — WCAG compliant, non-interactive"

requirements-completed: [PRDS-01, PRDS-04]

# Metrics
duration: 2min
completed: 2026-02-26
---

# Phase 13 Plan 02: Vendor Normalization + Botanical Corner Overlays Summary

**normalizeVendor() applied to product-card, product-info, and quick-view-modal so "My Store" shows as "Wildenflower" everywhere; botanical corner PNG overlays added to every product card image with pointer-events-none z-10 to preserve wishlist/quick-view interactions.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-26T21:45:01Z
- **Completed:** 2026-02-26T21:47:23Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- All three vendor-displaying components now import and call normalizeVendor() — "My Store" maps to "Wildenflower" on cards, detail pages, and Quick View modals
- Botanical corner PNG overlays (card-corner-topleft.png, card-corner-bottomright.png) added to every product card at z-10 with pointer-events-none — brand decoration without blocking interactive elements
- Dead "No image" fallback div removed from product-card.tsx — isShowableProduct filter (Plan 01) guarantees all rendered cards have images

## Task Commits

Each task was committed atomically:

1. **Task 1: Apply normalizeVendor to product-card, product-info, and quick-view-modal** - `cf12ce2` (feat)
2. **Task 2: Add botanical corner overlays and remove "No image" fallback from product-card** - `b7f88fd` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `components/product-card.tsx` — normalizeVendor import + use; No image fallback removed; two corner Image overlays added at z-10 pointer-events-none
- `components/product-info.tsx` — normalizeVendor import + use on "by {vendor}" line
- `components/quick-view-modal.tsx` — normalizeVendor import + use on gold vendor header in QuickViewContent

## Decisions Made

- Corner overlays placed after Quick View button inside image container — pointer-events-none ensures hover still works on Quick View button; z-10 keeps overlays above product image (z-0) but below WishlistButton (z-20)
- No image fallback removed as dead code — Plan 01 established isShowableProduct as upstream guard, so by the time a product reaches ProductCard it is guaranteed to have at least one image

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- PRDS-01 (vendor display) fully satisfied across all three product surfaces
- PRDS-04 (botanical corner overlays) satisfied on product cards
- Plan 03 (remaining PRDS requirements or polish) can proceed
- TypeScript compiles cleanly with no new errors

## Self-Check: PASSED

- components/product-card.tsx: FOUND
- components/product-info.tsx: FOUND
- components/quick-view-modal.tsx: FOUND
- 13-02-SUMMARY.md: FOUND
- Commit cf12ce2 (normalizeVendor): FOUND
- Commit b7f88fd (corner overlays): FOUND

---
*Phase: 13-product-data-quality*
*Completed: 2026-02-26*
