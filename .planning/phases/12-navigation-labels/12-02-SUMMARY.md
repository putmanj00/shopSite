---
phase: 12-navigation-labels
plan: 02
subsystem: ui
tags: [navigation, header, dropdown, accessibility, typescript, react-server-component]

# Dependency graph
requires:
  - 12-01 (NavItem interface + getNavMenu() from lib/shopify-helpers.ts)
provides:
  - Async RootLayout RSC that fetches nav menu at build time
  - Desktop nav: Home | Shop (dropdown) | About replacing flat category links
  - Accessible Shop dropdown with keyboard nav (Escape, outside click) and ARIA attributes
affects:
  - 12-03 (mobile drawer — will receive navItems prop from layout.tsx)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Async RSC layout pattern: await data fetch before return, pass as prop to client components"
    - "Controlled dropdown with useRef + mousedown outside-click detection"
    - "onMouseEnter/Leave for hover + onClick toggle for click — dual-trigger dropdown"

key-files:
  created: []
  modified:
    - app/layout.tsx
    - components/header.tsx

key-decisions:
  - "header.tsx stays 'use client' — receives navItems as prop from async RSC layout (not fetching itself)"
  - "MobileDrawer left without navItems prop in this plan — Plan 03 adds it to avoid premature TS error"
  - "Dropdown uses both hover and click triggers — desktop convention (hover) + touch-fallback (click)"

patterns-established:
  - "Async RSC layout → prop drilling to client component pattern for server-fetched nav data"
  - "useRef + mousedown listener for outside-click dropdown close (not blur-based)"

requirements-completed: [NAV-04, NAV-05]

# Metrics
duration: 2min
completed: 2026-02-26
---

# Phase 12 Plan 02: Navigation Labels — Desktop Nav Refactor Summary

**Async RSC layout fetches navItems at build time; header.tsx Shop dropdown replaces flat category link bar with accessible Home | Shop (dropdown) | About**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-26T20:03:55Z
- **Completed:** 2026-02-26T20:05:13Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Converted `app/layout.tsx` `RootLayout` from sync to `async function` — added `getNavMenu` import and `const navItems = await getNavMenu('main-menu')` as first line in function body
- Passes `navItems={navItems}` prop to `<Header>` — layout is the sole data-fetching point for nav; header receives it as a prop
- Refactored `components/header.tsx` to accept `navItems: NavItem[]` prop (required)
- Added `shopOpen` boolean state and `dropdownRef` (`useRef<HTMLDivElement>`) to header
- Added Escape key + outside mousedown useEffect to close dropdown on interaction
- Replaced the flat `<div className="hidden lg:flex ...">` containing "Shop All", "Leather Goods", "Jewelry", "Tie-Dye", "Art", "Our Story" links with a `<nav>` containing: Home link | Shop button+dropdown | About link
- Shop dropdown maps `navItems.map()` to `<Link role="menuitem">` entries with `onClick` close
- Full ARIA: `aria-expanded={shopOpen}`, `aria-haspopup="true"`, `aria-controls="shop-dropdown"`, `role="menu"`, `aria-label="Shop categories"` on the dropdown panel
- Dual trigger: `onMouseEnter`/`onMouseLeave` on container div + `onClick` toggle on button
- All right-side header icons (CurrencySelector, Wishlist, Account, Cart), MobileDrawer, and Logo left unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Make layout.tsx async and pass navItems to Header** - `838983f` (feat)
2. **Task 2: Refactor header.tsx with Shop dropdown** - `457c5ec` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `app/layout.tsx` — Added `getNavMenu` import, `async` keyword, `navItems` fetch, `navItems` prop on `<Header>`
- `components/header.tsx` — Added `NavItem` type import, `navItems` prop, `shopOpen`/`dropdownRef`, Escape/outside-click effect, replaced flat nav with Shop dropdown

## Decisions Made

- `header.tsx` remains a `'use client'` component — it receives `navItems` as a prop from the async RSC layout rather than fetching data itself. This follows the RSC/client component boundary correctly.
- `MobileDrawer` left without `navItems` prop in this plan — adding it now would cause a TypeScript error until Plan 03 updates MobileDrawer's prop signature. Layout will pass it in Plan 03.
- Dropdown uses both hover (onMouseEnter/Leave) and click (onClick toggle) triggers — standard desktop nav pattern for e-commerce (hover for mouse users, click as fallback).
- `useRef + mousedown` listener used for outside-click detection — more reliable than blur-based approach for complex focusable content.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. TypeScript compiled clean with no errors.

## User Setup Required

None.

## Next Phase Readiness

- Desktop nav complete — Home | Shop (dropdown with all 6 categories) | About now live in header
- `layout.tsx` already passes `navItems` — Plan 03 (mobile drawer) just needs to accept the prop and render it
- TypeScript compiles clean, no blockers

---
*Phase: 12-navigation-labels*
*Completed: 2026-02-26*

## Self-Check: PASSED

- FOUND: app/layout.tsx
- FOUND: components/header.tsx
- FOUND: .planning/phases/12-navigation-labels/12-02-SUMMARY.md
- FOUND: commit 838983f (Task 1)
- FOUND: commit 457c5ec (Task 2)
