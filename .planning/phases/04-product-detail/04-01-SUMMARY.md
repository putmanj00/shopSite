---
phase: 04-product-detail
plan: 01
subsystem: ui
tags: [botanical-header, parchment, breadcrumbs, product-detail, tailwind]

# Dependency graph
requires:
  - phase: 01-design-foundation
    provides: parchment/sage/inkBrown/gold Tailwind tokens
  - phase: 03-homepage
    provides: BotanicalHeader component and small variant asset
provides:
  - Product detail page shell with parchment canvas
  - BotanicalHeader small variant rendered above product breadcrumbs
  - Breadcrumb component restyled to sage/inkBrown palette
  - "You May Also Like" heading in inkBrown/Playfair
affects:
  - 04-product-detail (plan 02 builds on the parchment canvas this plan establishes)
  - 05-supporting-pages (same BotanicalHeader insertion pattern)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - BotanicalHeader small variant insertion: place OUTSIDE and ABOVE the min-h-screen wrapper, not inside it
    - Parchment canvas pattern: bg-parchment on min-h-screen wrapper, white cards (bg-white rounded-lg shadow-sm) stay white
    - Breadcrumb palette pattern: text-sage for links + separators, text-ink-brown for current item

key-files:
  created: []
  modified:
    - app/products/[handle]/page.tsx
    - components/breadcrumbs.tsx

key-decisions:
  - "BotanicalHeader inserted outside/above the min-h-screen wrapper — same pattern as homepage BotanicalDividers"
  - "White card wrappers (accordion, reviews) preserved — paper-on-linen look locked in phase 3 decisions"
  - "Breadcrumb bar: bg-parchment border-b border-gold/30 for seamless flow from BotanicalHeader"

patterns-established:
  - "Product page BotanicalHeader insertion: above min-h-screen wrapper, inside the fragment, after RecentlyViewedTracker"
  - "Breadcrumb restyling: text-sage for links/separators, text-ink-brown for current item (no logic changes)"

requirements-completed: [PROD-01, PROD-02]

# Metrics
duration: 1min
completed: 2026-02-24
---

# Phase 4 Plan 01: Product Detail — Botanical Header + Parchment Canvas Summary

**BotanicalHeader small variant inserted above product detail page, parchment canvas established, breadcrumbs restyled to sage/inkBrown palette**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-02-24T21:34:34Z
- **Completed:** 2026-02-24T21:35:42Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- BotanicalHeader variant="small" inserted above the product page breadcrumb/content area
- Product page main wrapper converted from bg-gray-50 to bg-parchment
- Breadcrumb bar converted from bg-white border-b to bg-parchment border-b border-gold/30 (seamless flow from header)
- "You May Also Like" h2 changed from text-gray-900 to text-ink-brown (triggers Playfair via globals.css h2 bold rule)
- All breadcrumb link and separator gray classes replaced with sage/inkBrown palette

## Task Commits

Each task was committed atomically:

1. **Task 1: Insert BotanicalHeader + convert page shell to parchment canvas** - `d4215bc` (feat)
2. **Task 2: Restyle breadcrumb link colors to sage/inkBrown palette** - `aa76c34` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `app/products/[handle]/page.tsx` - BotanicalHeader import + JSX insertion, bg-gray-50 → bg-parchment, bg-white border-b → bg-parchment border-b border-gold/30, text-gray-900 h2 → text-ink-brown
- `components/breadcrumbs.tsx` - All text-gray-* classes replaced: links text-sage hover:text-ink-brown, separators text-sage, current item text-ink-brown

## Decisions Made
- BotanicalHeader placed outside and above the min-h-screen wrapper (same pattern as homepage BotanicalDividers) — ensures it renders at full width without being clipped by the content container
- White card wrappers (bg-white rounded-lg shadow-sm on accordion and reviews) deliberately preserved — the "paper on linen" locked decision from Phase 3 stays intact
- Breadcrumb bar uses bg-parchment border-b border-gold/30 rather than any white — eliminates the white band that would break continuity between BotanicalHeader and page content

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Parchment canvas is established on the product page shell
- BotanicalHeader small variant is rendering above breadcrumbs
- Plan 02 (component restyling — ProductInfo, ImageGallery, accordion typography) can build directly on this parchment foundation
- No blockers

---
*Phase: 04-product-detail*
*Completed: 2026-02-24*

## Self-Check: PASSED

- FOUND: app/products/[handle]/page.tsx
- FOUND: components/breadcrumbs.tsx
- FOUND: .planning/phases/04-product-detail/04-01-SUMMARY.md
- FOUND commit d4215bc: feat(04-01): insert BotanicalHeader + convert product page shell to parchment canvas
- FOUND commit aa76c34: feat(04-01): restyle breadcrumb link colors to sage/inkBrown palette
