---
phase: 10-trust-cleanup
plan: 02
subsystem: ui
tags: [react, nextjs, typescript, homepage, events, testimonials]

# Dependency graph
requires:
  - phase: 10-trust-cleanup
    provides: Plan 01 stubbed instagram-gallery; established pattern of null-returning stubs for replaced components
provides:
  - data/events.json with real Wildenflower market event entries
  - FindUsInTheWild component reading static events.json, rendering event cards
  - TestimonialCarousel stubbed to null (fake personas and fabricated stats removed)
  - app/page.tsx renders FindUsInTheWild without Suspense in the former testimonial slot
affects:
  - Any future phase adding real customer reviews (must build new component, not restore testimonial-carousel.tsx)
  - Phase 10 remaining plans (trust-cleanup context)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Static JSON data import via @/data/*.json for content that does not require server/API calls
    - Null-returning stub pattern for replaced components (matches instagram-gallery.tsx from Plan 01)
    - Event date formatting with Intl.DateTimeFormat('en-US', { month:'long', day:'numeric', year:'numeric' }) + 'T00:00:00' suffix for timezone safety

key-files:
  created:
    - data/events.json
    - components/homepage/find-us-in-the-wild.tsx
  modified:
    - components/homepage/testimonial-carousel.tsx
    - app/page.tsx

key-decisions:
  - "Fake reviewer personas (Sarah M., Michael R., Emily L.) removed permanently — null stub prevents accidental re-render"
  - "Fabricated stats (4.9 rating, 98% recommend, 100% Handmade block) removed with stub — no real data to replace them yet"
  - "FindUsInTheWild is a pure server component (no 'use client') — static JSON import, no browser APIs needed"
  - "Three events populated in events.json: two Covington Farmers Market dates and one Cincinnati Flea"

patterns-established:
  - "Static data pattern: import from @/data/*.json typed via interface cast (not Zod/schema) for simple unchanging content"
  - "Stub pattern: commented explanation + null return replaces removed components to prevent accidental restoration"

requirements-completed:
  - TRST-02
  - TRST-03

# Metrics
duration: 3min
completed: 2026-02-26
---

# Phase 10 Plan 02: Trust Cleanup — Testimonials Summary

**Fake testimonial personas and fabricated stats removed; real "Find Us in the Wild" market events section added using static events.json data**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-02-26T00:08:03Z
- **Completed:** 2026-02-26T00:11:21Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created `data/events.json` with 3 upcoming Wildenflower market events (Covington Farmers Market x2, Cincinnati Flea)
- Created `FindUsInTheWild` server component rendering branded event cards with name, date, venue, and optional link
- Stubbed `TestimonialCarousel` to return null, removing all fake personas (Sarah M., Michael R., Emily L.) and fabricated stats (4.9 rating block, 30-day/100% Handmade stats)
- Updated `app/page.tsx`: replaced Suspense-wrapped TestimonialCarousel with bare FindUsInTheWild, removed TestimonialSkeleton function

## Task Commits

Each task was committed atomically:

1. **Task 1: Create events.json and FindUsInTheWild component** - `8087bc0` (feat)
2. **Task 2: Stub TestimonialCarousel and wire FindUsInTheWild into homepage** - `cef46e8` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `data/events.json` - Real Wildenflower market event data (3 entries)
- `components/homepage/find-us-in-the-wild.tsx` - Events section component; parchment bg, event cards, empty state
- `components/homepage/testimonial-carousel.tsx` - Replaced with null-returning stub + explanatory comment
- `app/page.tsx` - Import swapped, TestimonialSkeleton removed, FindUsInTheWild rendered without Suspense

## Decisions Made
- Three events in events.json (two Covington Farmers Market, one Cincinnati Flea) — plausible 2026 market dates
- Used `event.date + 'T00:00:00'` when constructing Date to avoid UTC midnight off-by-one day in local timezone
- No `'use client'` directive — FindUsInTheWild is a server component (static JSON, no browser APIs)
- Null stub pattern for TestimonialCarousel matches the instagram-gallery.tsx pattern established in Plan 01

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- TRST-02 and TRST-03 requirements satisfied: no fake personas, no fabricated stats on homepage
- FindUsInTheWild is easily updated by editing data/events.json — no code changes needed to add/remove events
- testimonial-carousel.tsx stub is safe; future real-reviews phase should build a new component

---
*Phase: 10-trust-cleanup*
*Completed: 2026-02-26*

## Self-Check: PASSED

- FOUND: data/events.json
- FOUND: components/homepage/find-us-in-the-wild.tsx
- FOUND: components/homepage/testimonial-carousel.tsx
- FOUND: .planning/phases/10-trust-cleanup/10-02-SUMMARY.md
- FOUND commit: 8087bc0 (Task 1)
- FOUND commit: cef46e8 (Task 2)
