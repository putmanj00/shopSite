---
phase: 12-navigation-labels
plan: 03
subsystem: ui
tags: [navigation, mobile, accordion, framer-motion, typescript, accessibility]

# Dependency graph
requires:
  - 12-02 (navItems prop flowing from async RSC layout through Header)
provides:
  - MobileDrawer with Shop accordion (AnimatePresence height animation)
  - Mobile nav: Home | Shop (tap to expand 6 categories) | About
  - navItems prop wired through header.tsx to MobileDrawer
affects:
  - Visual verification (Task 2 — awaiting human approval)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "AnimatePresence height:0→auto accordion for mobile nav category expand/collapse"
    - "Prop forwarding: RSC layout → Header (client) → MobileDrawer (client) for server-fetched data"

key-files:
  created: []
  modified:
    - components/mobile-drawer.tsx
    - components/header.tsx

key-decisions:
  - "MobileDrawer receives navItems via header.tsx prop forwarding — MobileDrawer is rendered inside Header, not layout.tsx directly"
  - "shopExpanded state in MobileDrawer controls Shop accordion independently from isOpen drawer state"
  - "AnimatePresence height 0→auto transition with overflow-hidden for smooth category reveal"

patterns-established:
  - "Client component prop chain: async RSC (layout) → client prop (Header) → nested client component (MobileDrawer)"

requirements-completed: [NAV-04, NAV-05]

# Metrics
duration: 1min
completed: 2026-02-26
---

# Phase 12 Plan 03: Navigation Labels — Mobile Drawer Accordion Summary

**MobileDrawer refactored to accept navItems prop; Shop accordion with AnimatePresence replaces hardcoded broken categories array**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-02-26T20:07:31Z
- **Completed:** 2026-02-26T20:08:xx Z (Task 1 only; Task 2 = human-verify checkpoint)
- **Tasks:** 1 of 2 complete (Task 2 awaits human verification)
- **Files modified:** 2

## Accomplishments

- Removed hardcoded `categories` array from mobile-drawer.tsx (had wrong labels: "Leather Goods", "Art", and was missing Crystals/Ceramics)
- Added `import type { NavItem } from '@/lib/shopify-helpers'` to mobile-drawer.tsx
- Changed function signature from `MobileDrawer()` to `MobileDrawer({ navItems }: { navItems: NavItem[] })`
- Added `shopExpanded` boolean state for the Shop accordion
- Replaced flat categories list with structured `Home | Shop (accordion) | About` primary nav
- Shop button has `aria-expanded={shopExpanded}` and chevron that rotates 180° when open
- `AnimatePresence` wraps Shop category list — animates `height: 0 → 'auto'` and `opacity: 0 → 1` on expand, reverses on collapse
- Category links in accordion: indented (`pl-4`), `text-base text-parchment/90`, map from `navItems` prop
- All unchanged: hamburger button, outer AnimatePresence, dark overlay, sliding drawer structure, close button, divider, secondary nav (Contact Us, FAQ, Sign In)
- Updated `header.tsx` line 58: `<MobileDrawer navItems={navItems} />` — forwards navItems received from async RSC layout

## Task Commits

Each task was committed atomically:

1. **Task 1: Refactor mobile-drawer.tsx with Shop accordion** - `bc43e88` (feat)
2. **Task 2: Human verify** - awaiting checkpoint approval

**Plan metadata:** (docs commit follows after checkpoint approval)

## Files Created/Modified

- `components/mobile-drawer.tsx` — Removed `categories` array; added `NavItem` import, `navItems` prop, `shopExpanded` state, Shop accordion with AnimatePresence, Home/About links
- `components/header.tsx` — Updated `<MobileDrawer />` → `<MobileDrawer navItems={navItems} />` (1 line change)

## Decisions Made

- MobileDrawer is rendered inside `header.tsx`, not `layout.tsx` directly — so navItems flows: `layout.tsx → Header → MobileDrawer` (prop chain through two client components). Layout.tsx passes navItems to Header; Header forwards it to MobileDrawer.
- `shopExpanded` state is separate from `isOpen` (drawer open/close) — accordion can be open/closed independently of drawer visibility.
- `AnimatePresence` inside the drawer for accordion (nested within the outer `AnimatePresence` for the drawer itself) — framer-motion handles nested correctly.

## Deviations from Plan

**1. [Rule 1 - Architecture clarification] navItems wired via header.tsx, not layout.tsx**
- **Found during:** Task 1
- **Issue:** Plan described wiring navItems in `layout.tsx` to `<MobileDrawer>`, but MobileDrawer is actually rendered inside `header.tsx` (not layout.tsx). The layout renders `<Header navItems={navItems} />` which internally renders `<MobileDrawer />`.
- **Fix:** Updated `header.tsx` to forward `navItems={navItems}` to `<MobileDrawer>` — data path is identical, just one hop further. Layout.tsx already passes navItems to Header; Header now forwards to MobileDrawer. No change to layout.tsx needed.
- **Files modified:** components/header.tsx (1 line)
- **Commit:** bc43e88

## Issues Encountered

None. TypeScript compiled clean on first attempt.

## User Setup Required

None.

## Next Phase Readiness

- Task 2 (human-verify checkpoint) is pending — developer needs to visually confirm desktop dropdown and mobile accordion in browser
- Once approved, Phase 12 Navigation Labels is complete (NAV-01 through NAV-05 all satisfied)

---
*Phase: 12-navigation-labels*
*Completed: 2026-02-26 (Task 1); Task 2 awaiting human approval*

## Self-Check: PASSED

- FOUND: components/mobile-drawer.tsx
- FOUND: components/header.tsx
- FOUND: .planning/phases/12-navigation-labels/12-03-SUMMARY.md
- FOUND: commit bc43e88 (Task 1)
