---
phase: 10-trust-cleanup
plan: 03
subsystem: ui
tags: [react, cro, popup, welcome, botanical]

# Dependency graph
requires:
  - phase: 10-trust-cleanup
    provides: Phase context; botanical asset already present at public/assets/images/headers/botanical-header-small.png
provides:
  - Welcome popup with dual-trigger timing (15s timer + 50% scroll depth)
  - Authentic Wildenflower copy referencing hand-dyed drops, leatherwork, rare mineral finds, local markets
  - Local botanical image replacing Unsplash POS terminal photo
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dual-trigger popup pattern: setTimeout OR scroll depth listener, whichever fires first, with guard flag to prevent double-fire"

key-files:
  created: []
  modified:
    - components/cro/welcome-popup.tsx

key-decisions:
  - "15s delay chosen as midpoint of 10-20s browsing window; 50% scroll depth as engagement signal"
  - "Used HTML entity &apos; for apostrophes in JSX body copy to avoid lint warnings"

patterns-established:
  - "Popup trigger pattern: dual-trigger with `let shown = false` guard, cleanup removes both timer and scroll listener"

requirements-completed: [TRST-01]

# Metrics
duration: 1min
completed: 2026-02-26
---

# Phase 10 Plan 03: Welcome Popup Copy, Image, and Trigger Timing Summary

**Welcome popup updated with authentic Wildenflower copy, local botanical image, and respectful 15s/50%-scroll dual-trigger replacing the 3-second instant fire**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-26T00:09:38Z
- **Completed:** 2026-02-26T00:11:05Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Replaced 3-second instant popup timer with dual trigger: 15-second delay OR 50% scroll depth (whichever comes first), with guard to prevent double-fire and cleanup removing both listeners
- Swapped Unsplash POS terminal image (external dependency, wrong brand) for local `botanical-header-small.png`
- Updated all copy: headline to "Join the Wildenflower Inner Circle", body to reference hand-dyed drops/leatherwork/rare mineral finds/Covington+Cincy markets, CTA to "Claim My Welcome Discount", dismiss to "Maybe later"

## Task Commits

Each task was committed atomically:

1. **Task 1: Update welcome popup — copy, image, and trigger timing** - `a3c2896` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `components/cro/welcome-popup.tsx` - Updated trigger timing (15s+scroll), botanical image, all copy changes

## Decisions Made
- Used 15s as the timer value — midpoint of the 10-20s browsing window cited in the plan's must_haves
- Used `&apos;` HTML entity for the apostrophes in JSX body copy ("we'll") to avoid unescaped entity lint warnings
- No architectural changes required; all changes are self-contained within the single file

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Welcome popup is now brand-authentic: genuine invitation copy, local image, respectful timing
- Ready for any remaining Phase 10 trust-cleanup plans

---
*Phase: 10-trust-cleanup*
*Completed: 2026-02-26*
