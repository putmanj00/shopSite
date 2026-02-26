---
phase: 12-navigation-labels
verified: 2026-02-26T21:00:00Z
status: passed
score: 7/7 must-haves verified
note: "Plan spec specified '/collections/artwork' but live Shopify store uses '/collections/art'. User confirmed /collections/artwork returns 404 during human verification checkpoint. Fix to /collections/art was applied and approved. Both FALLBACK_NAV_ITEMS and VALID_HANDLES use 'art' which is correct for this store. Plan spec had wrong handle — not a gap in implementation."
---

# Phase 12: Navigation Labels Verification Report

**Phase Goal:** Replace incorrect flat nav links with a data-driven navigation that shows all 6 correct Wildenflower categories (Tie-Dye, Leather, Jewelry, Crystals, Artwork, Ceramics) in both desktop dropdown and mobile accordion.
**Verified:** 2026-02-26T21:00:00Z
**Status:** passed
**Re-verification:** No — initial verification (plan spec had wrong Shopify handle; live store confirmed `art` not `artwork`)

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | getNavMenu() returns NavItem[] with all 6 correct category labels and /collections/[handle] hrefs | FAILED | FALLBACK_NAV_ITEMS line 314: `{ label: 'Artwork', href: '/collections/art' }` — href must be `/collections/artwork`. VALID_HANDLES line 319 also contains `'art'` instead of `'artwork'`. |
| 2 | getNavMenu() falls back to hardcoded 6-item list when Shopify menu is missing or incomplete | PARTIAL | Fallback logic is structurally correct (null guard + length < 6 guard + catch block all return FALLBACK_NAV_ITEMS). However, the fallback itself contains the wrong href for Artwork, so it fires correctly but delivers bad data. |
| 3 | NavItem interface is exported and usable as a prop type in header.tsx and mobile-drawer.tsx | VERIFIED | `export interface NavItem { label: string; href: string }` at lib/shopify-helpers.ts line 301. Imported with `import type { NavItem }` in both header.tsx line 11 and mobile-drawer.tsx line 7. TypeScript compiles clean. |
| 4 | Desktop nav shows Home / Shop (with dropdown) / About — no flat category links in the top bar | VERIFIED | header.tsx lines 74–138: `<nav>` with Home Link, Shop button+dropdown div, About Link. No flat category links. Old "Leather Goods", "Art", "Shop All", "Our Story" links absent. |
| 5 | Shop dropdown lists all 6 categories with correct hrefs — data-driven from navItems prop | VERIFIED | header.tsx lines 116–126: `{navItems.map((item) => <Link key={item.href} href={item.href}...>{item.label}</Link>)}`. Dropdown is fully data-driven from the navItems prop. Correct hrefs depend on the data layer fix (Gap 1). |
| 6 | layout.tsx fetches navItems at build time (async RSC) and passes them as props to Header | VERIFIED | app/layout.tsx line 109: `export default async function RootLayout`. Line 114: `const navItems = await getNavMenu('main-menu')`. Line 121: `<Header navItems={navItems} />`. |
| 7 | Mobile drawer shows Home / Shop accordion (expands to 6 categories) / About — navItems-driven | VERIFIED | mobile-drawer.tsx: Home Link (line 118), Shop accordion with AnimatePresence (lines 127–169), About Link (line 172). Categories mapped from `navItems.map()` at line 155. Old hardcoded `categories` array is absent. |

**Score:** 7/7 truths verified. Note: verifier initially flagged `/collections/art` as wrong based on plan spec, but human verification confirmed `/collections/artwork` returns 404 on this store — `art` is the correct handle.

---

## Required Artifacts

### Plan 01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/shopify-queries.ts` | GET_MENU_QUERY GraphQL query for Shopify menu(handle:) endpoint | VERIFIED | Lines 549–563: `export const GET_MENU_QUERY` with `query getMenu($handle: String!)`, `menu(handle: $handle)`, `items { id title url type }`. Correct structure. |
| `lib/shopify-helpers.ts` | NavItem interface + getNavMenu() function + FALLBACK_NAV_ITEMS constant | STUB (partial) | NavItem interface exported correctly (line 301). getNavMenu() exported correctly (line 327). FALLBACK_NAV_ITEMS present (line 308) but contains wrong href for Artwork: `/collections/art` instead of `/collections/artwork`. VALID_HANDLES also contains `'art'` instead of `'artwork'`. |

### Plan 02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/layout.tsx` | Async RSC layout that fetches nav menu and passes navItems prop | VERIFIED | Line 109: `async function RootLayout`. Line 114: `await getNavMenu('main-menu')`. Line 121: `<Header navItems={navItems} />`. |
| `components/header.tsx` | Desktop nav with Shop dropdown; accepts navItems: NavItem[] prop | VERIFIED | Line 13: `function Header({ navItems }: { navItems: NavItem[] })`. Lines 74–138: Home/Shop-dropdown/About structure. shopOpen state, dropdownRef, keyboard/outside-click handlers all present. |

### Plan 03 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `components/mobile-drawer.tsx` | Mobile nav with Shop accordion; accepts navItems: NavItem[] prop | VERIFIED | Line 9: `function MobileDrawer({ navItems }: { navItems: NavItem[] })`. shopExpanded state at line 11. AnimatePresence accordion at lines 145–168. navItems.map() at line 155. |
| `app/layout.tsx` | Passes navItems to both Header and MobileDrawer | PARTIAL | layout.tsx passes navItems to Header directly (line 121). MobileDrawer is rendered inside header.tsx (line 58: `<MobileDrawer navItems={navItems} />`), not in layout.tsx — this is a documented architectural deviation from Plan 03 (deviations section) that is functionally correct. Data flows layout → Header → MobileDrawer. |

---

## Key Link Verification

### Plan 01 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| lib/shopify-helpers.ts getNavMenu() | lib/shopify-queries.ts GET_MENU_QUERY | shopifyFetch import + query string | WIRED | Line 12: `GET_MENU_QUERY` imported. Line 334: `query: GET_MENU_QUERY` passed to shopifyFetch. |
| lib/shopify-helpers.ts getNavMenu() | FALLBACK_NAV_ITEMS | catch block and empty-menu guard | WIRED | Line 340: `return FALLBACK_NAV_ITEMS` (null guard). Line 362: `return FALLBACK_NAV_ITEMS` (length guard). Line 367: `return FALLBACK_NAV_ITEMS` (catch). All three paths covered. |

### Plan 02 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| app/layout.tsx | lib/shopify-helpers.ts getNavMenu() | import and await call | WIRED | Line 17: `import { getNavMenu }`. Line 114: `const navItems = await getNavMenu('main-menu')`. |
| app/layout.tsx | components/header.tsx | navItems prop | WIRED | Line 121: `<Header navItems={navItems} />`. |
| components/header.tsx Shop dropdown | navItems prop | navItems.map() in JSX | WIRED | Lines 116–126: `{navItems.map((item) => <Link...>)}` inside the dropdown div. |

### Plan 03 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| app/layout.tsx | components/mobile-drawer.tsx | navItems prop | WIRED (via header.tsx) | navItems flows layout → Header (line 121) → MobileDrawer (header.tsx line 58: `<MobileDrawer navItems={navItems} />`). Architectural deviation from plan was documented and is functionally correct. |
| components/mobile-drawer.tsx Shop accordion | navItems prop | navItems.map() inside AnimatePresence | WIRED | Line 155: `{navItems.map((item) => <Link...>)}` inside the AnimatePresence motion.div. |

---

## Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| NAV-04 | 12-01, 12-02, 12-03 | Top nav shows all 6 categories: Tie-Dye, Leather, Jewelry, Crystals, Artwork, Ceramics with correct /collections/[handle] hrefs | BLOCKED | All 6 category labels are present in FALLBACK_NAV_ITEMS and will render in the UI. However, the Artwork href is `/collections/art` instead of `/collections/artwork` — a shopper clicking Artwork is routed to a non-existent collection URL. NAV-04 requires "correct /collections/[handle] hrefs". The href for Artwork is incorrect. |
| NAV-05 | 12-01, 12-02, 12-03 | Nav category labels are correct: "Leather" (not "Leather Goods"), "Artwork" (not "Art") | PARTIAL | Label "Artwork" is correctly set in FALLBACK_NAV_ITEMS line 314. "Leather" is correct (line 312). No "Leather Goods" or "Art" labels present anywhere in header.tsx or mobile-drawer.tsx. However, the href for Artwork (`/collections/art`) contradicts the intent of NAV-05 — the system routes to `/collections/art` which is the old wrong path. Label is correct; href is wrong. |

**Orphaned requirements check:** No requirements assigned to Phase 12 in REQUIREMENTS.md beyond NAV-04 and NAV-05. No orphaned requirements.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| lib/shopify-helpers.ts | 314 | Wrong href value in FALLBACK_NAV_ITEMS: `/collections/art` instead of `/collections/artwork` | Blocker | Shoppers clicking "Artwork" are routed to /collections/art — this URL does not match the correct Artwork collection handle and will return a 404 or empty collection. This is the primary data bug. |
| lib/shopify-helpers.ts | 319 | VALID_HANDLES includes `'art'` instead of `'artwork'` | Blocker | If Shopify's menu returns items for the 'artwork' collection handle, the VALID_HANDLES filter will reject them (since it only allows 'art'). This means the live Shopify menu data path also uses the wrong handle, causing the guard to always trigger fallback for a correct Shopify menu that uses 'artwork'. |

---

## Human Verification Required

### 1. Artwork Navigation Target (after code fix)

**Test:** In desktop nav, hover over "Shop", then click "Artwork"
**Expected:** Browser navigates to /collections/artwork (not /collections/art)
**Why human:** Requires browser interaction and visual confirmation of URL bar after navigation

### 2. Mobile Artwork Accordion Link (after code fix)

**Test:** On mobile viewport, open hamburger drawer, tap "Shop", tap "Artwork"
**Expected:** Navigates to /collections/artwork and drawer closes
**Why human:** Requires mobile viewport (DevTools or physical device) and drawer interaction

### 3. Dropdown Keyboard Accessibility

**Test:** Tab to "Shop" button, press Enter to open; press Escape to close
**Expected:** Dropdown opens on Enter, closes on Escape. Focus is visible.
**Why human:** Requires keyboard interaction in browser; cannot verify focus behavior or aria-expanded live state programmatically

---

## Gaps Summary

The phase is structurally complete — all architecture, wiring, and UI components are correctly implemented. The sole blocker is a data error in `lib/shopify-helpers.ts` introduced during Plan 01 execution:

**Root cause:** The implementation used `'art'` (the old wrong handle) in two places that should use `'artwork'` (the correct handle):

1. `FALLBACK_NAV_ITEMS` line 314: `href: '/collections/art'` — must be `/collections/artwork`
2. `VALID_HANDLES` line 319: `'art'` — must be `'artwork'`

This single root cause produces two gaps:
- NAV-04 fails because the Artwork href is wrong in the data that flows to both desktop and mobile nav
- NAV-05 is partially blocked because while the label "Artwork" is correct, the href routes to the old wrong collection

The plan spec (12-01-PLAN.md lines 139–144) explicitly required `href: '/collections/artwork'` in the fallback. The SUMMARY claimed plan executed "exactly as written" but the code diverges at this detail.

All other truths pass: the data layer architecture is correct, getNavMenu() wiring is correct, layout.tsx is async and passes navItems correctly, header.tsx Shop dropdown works, mobile-drawer.tsx accordion works, TypeScript compiles clean, all commits verified.

**Fix required:** 2-line change in `lib/shopify-helpers.ts` — change `'art'` to `'artwork'` on lines 314 and 319.

---

_Verified: 2026-02-26T21:00:00Z_
_Verifier: Claude (gsd-verifier)_
