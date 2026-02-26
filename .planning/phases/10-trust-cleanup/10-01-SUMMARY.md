---
phase: 10-trust-cleanup
plan: 01
subsystem: ui
tags: [social-proof, instagram, sustainability, trust, cleanup]

# Dependency graph
requires: []
provides:
  - layout.tsx free of SocialProofToast and RecentPurchasePopup render tree entries
  - instagram-gallery.tsx stubbed as null return with TODO for real API integration
  - sustainability page without fabricated "Our Impact" stats section
affects: [homepage, sustainability]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - app/layout.tsx
    - components/homepage/instagram-gallery.tsx
    - app/sustainability/page.tsx

key-decisions:
  - "Component files (social-proof-toast.tsx, recent-purchase-popup.tsx) preserved on disk — removed only from render tree"
  - "Instagram gallery stubbed with null + TODO comment rather than deleted — preserves integration point for future real API"
  - "Sustainability practices card descriptions retained — only fabricated stat numbers removed"

patterns-established: []

requirements-completed:
  - TRST-01
  - TRST-03
  - TRST-04

# Metrics
duration: 2min
completed: 2026-02-26
---

# Phase 10 Plan 01: Trust Cleanup — Fake Social Proof Removal Summary

**Removed fabricated purchase popups, fake Instagram engagement with stock photos, and invented impact stats from the Wildenflower storefront**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-26T00:09:32Z
- **Completed:** 2026-02-26T00:11:01Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Removed SocialProofToast and RecentPurchasePopup from layout render tree — no fake purchase activity toasts or popups fire on page load
- Stubbed InstagramGallery component to return null — Unsplash stock photos with fabricated like counts no longer shown; component preserved as integration point
- Removed "Our Impact" stats section from sustainability page — 100% Carbon Neutral Shipping, 200+ Artisan Partners, 0 Single-Use Plastics, 15 Countries Represented all gone

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove fake purchase popups from layout.tsx** - `440e21b` (fix)
2. **Task 2: Stub Instagram gallery and remove sustainability stats** - `19ce7b6` (fix)

## Files Created/Modified
- `app/layout.tsx` - Removed SocialProofToast import/JSX and RecentPurchasePopup from cro import/JSX; WelcomePopup and ExitIntentPopup preserved
- `components/homepage/instagram-gallery.tsx` - Replaced 141-line fake gallery with 9-line null stub and TODO comment for real Instagram Basic Display API integration
- `app/sustainability/page.tsx` - Removed the entire "Our Impact" section (lines 99-126) with four fabricated stat numbers

## Decisions Made
- Component files (social-proof-toast.tsx, recent-purchase-popup.tsx) left on disk — removed only from layout render tree per plan specification
- Instagram gallery stubbed with `return null` and TODO block rather than deleted — preserves the component path for future real integration
- Sustainability practices descriptions (qualitative) left intact — only the quantified stat block removed since those numbers were fabricated

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None - all three files edited cleanly, TypeScript compilation confirmed error-free.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Trust cleanup plan 01 complete: fake social proof fully removed from render paths
- Ready for Phase 10 Plan 02 (remaining trust cleanup tasks per ROADMAP)
- No blockers

---
*Phase: 10-trust-cleanup*
*Completed: 2026-02-26*
