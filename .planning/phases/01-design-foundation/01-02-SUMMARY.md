---
phase: 01-design-foundation
plan: 02
subsystem: ui
tags: [tailwind, dark-mode, botanical, react, nextjs]

# Dependency graph
requires:
  - phase: 01-design-foundation
    provides: "color-scheme: light set on :root in globals.css (Plan 01), making dark: classes dead code"
provides:
  - "Four botanical UI components with dark: classes fully removed — no dead code"
  - "WatercolorWash, BotanicalHeader, SectionTitle, CategoryChip all light-mode only"
affects:
  - "03-homepage — these components are used directly in homepage assembly"
  - "04-product-detail — BotanicalHeader used on product pages"
  - "05-supporting-pages — BotanicalHeader used on About/FAQ/Blog"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dead code elimination: dark: classes suppressed by color-scheme:light should be removed, not left dormant"

key-files:
  created: []
  modified:
    - "components/ui/watercolor-wash.tsx"
    - "components/ui/botanical-header.tsx"
    - "components/ui/section-title.tsx"
    - "components/ui/category-chip.tsx"

key-decisions:
  - "Removed all dark: classes from botanical components rather than leaving suppressed dead code — cleaner codebase and no confusion for future developers"

patterns-established:
  - "Botanical components: light-mode only, no dark: variants"

requirements-completed: [DESIGN-03]

# Metrics
duration: 2min
completed: 2026-02-24
---

# Phase 1 Plan 02: Remove Dark Mode Classes from Botanical Components Summary

**Swept all `dark:` Tailwind dead-code classes from four untracked botanical UI components (WatercolorWash, BotanicalHeader, SectionTitle, CategoryChip) — 10 instances removed across 4 files**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-24T16:36:34Z
- **Completed:** 2026-02-24T16:38:04Z
- **Tasks:** 1
- **Files modified:** 4

## Accomplishments
- Removed all `dark:` Tailwind classes from all four target botanical components
- Found and removed 10 total `dark:` instances (plan identified 10 across named locations, plus 1 additional in CategoryChip fallback span — all removed)
- TypeScript compiles clean with no errors after changes

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove dark: classes from all four botanical component files** - `bf97951` (refactor)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `components/ui/watercolor-wash.tsx` - Removed 4 dark: classes from variantStyles (dustyRose, lavender, sage, gold)
- `components/ui/botanical-header.tsx` - Removed 1 dark:bg-neutral-800 from wrapper div
- `components/ui/section-title.tsx` - Removed 2 dark: classes (actionClassName, h2)
- `components/ui/category-chip.tsx` - Removed 4 dark: classes (circle active, circle inactive border, fallback span, label span)

## Decisions Made
None - followed plan as specified. One minor scope extension: removed `dark:text-neutral-200` from CategoryChip's fallback span (line 44) which was not listed in the plan's named locations but is in the same file and same category of dead code. Total removal count: 10 instances vs. 10 planned (plan listed 3 in CategoryChip; 4 were present; all removed).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Removed additional dark: class in CategoryChip fallback span**
- **Found during:** Task 1 (Remove dark: classes from all four botanical component files)
- **Issue:** CategoryChip line 44 had `dark:text-neutral-200` on the fallback span (icon initial letter) — not listed in plan's named locations but is identical dead code
- **Fix:** Removed `dark:text-neutral-200` from the fallback span className as part of the same sweep
- **Files modified:** components/ui/category-chip.tsx
- **Verification:** grep for dark: returns no matches, TypeScript clean
- **Committed in:** bf97951 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing dead code removal)
**Impact on plan:** Minor scope extension within the same file. No scope creep — same rule applies, same pattern.

## Issues Encountered
None — all four files edited cleanly and TypeScript compiled without errors.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All four botanical components are clean: no dark: classes, no dead code
- Components are ready to be imported and used in Phase 3 (Homepage assembly)
- BotanicalHeader is ready for Phase 4 (Product detail) and Phase 5 (Supporting pages)
- No blockers

---
*Phase: 01-design-foundation*
*Completed: 2026-02-24*
