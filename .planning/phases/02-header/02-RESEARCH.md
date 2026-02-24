# Phase 2: Header - Research

**Researched:** 2026-02-24
**Domain:** Next.js header component, Tailwind CSS 4 theming, Next.js Image component
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Use `logo-full.png` (`/assets/images/logo/logo-full.png`) in the nav bar, replacing the broken `/images/wildenflower-full.png` path
- Always use the same logo file — no adaptive color switching based on background
- Keep the existing Image component and link wrapper structure
- Header background: forest green `#1E3B30` (Tailwind token: `bg-forest`)
- Bottom border: 1px solid gold `#C9A642` (Tailwind token: `border-gold`), replacing current `border-neutral-200`
- Remove `bg-neutral-50`
- Link text: parchment `#F5EDD6` (Tailwind token: `text-parchment`)
- Link hover: gold `#C9A642` (Tailwind token: `hover:text-gold`)
- Replace current `text-neutral-700 hover:text-primary-600`
- SVG icons: parchment color (`text-parchment`), replacing `text-neutral-700`
- Hover background: subtle semi-transparent white/parchment lightening (`hover:bg-white/10` or similar), replacing `hover:bg-neutral-100`
- Cart count badge and wishlist count badge: keep functional, update colors to fit palette

### Claude's Discretion
- Exact hover background opacity/tint value for icon buttons
- Cart/wishlist badge background color (currently `bg-primary-500` / `bg-secondary-500` — update to terracotta or gold)
- Logo container dimensions — keep close to current `h-10 w-56` unless logo-full.png proportions require adjustment

### Deferred Ideas (OUT OF SCOPE)
- Phase 3 hero image: User provided a botanical landscape illustration (wide format, mushrooms/ferns/flowers, center medallion with "Wildenflower" text) to replace the current `/images/hero-background.png` hero background. Use this image as the Phase 3 `EnhancedHero` background.
- Hero image creation note: The attached image is AI-generated. For a production-quality version matching the quality of what it replaces, user will need a high-resolution botanical illustration at ~1920×1080px minimum, saved as PNG or WebP.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HEAD-01 | Logo image swapped to Wildenflower logo mark (`public/assets/images/logo/logo-full.png`) replacing current text/placeholder logo | Logo file confirmed at path; Next.js Image fill pattern documented; container dimensions need adjustment for square logo |
| HEAD-02 | Header background, nav link colors, and interactive states updated to Wildenflower palette — no layout or structural changes | All Tailwind 4 color tokens confirmed active from Phase 1; exact class names and scoping documented |
</phase_requirements>

---

## Summary

Phase 2 is a targeted visual edit of a single file: `components/header.tsx`. It has two jobs — swap the broken logo path to the correct `logo-full.png`, and replace the psychedelic color palette (neutral grays, primary purple, secondary magenta) with the Wildenflower botanical palette (forest background, parchment text, gold accents).

Phase 1 already delivered all the Tailwind 4 color tokens needed. The botanical palette (`forest`, `parchment`, `gold`, `terracotta`) is live in `globals.css` under `@theme inline`. The utility classes `bg-forest`, `text-parchment`, `text-gold`, `border-gold`, `bg-terracotta` are all available now with no additional configuration.

One critical constraint to be aware of: `logo-full.png` is a 600x600 pixel square image, while the current container is `h-10 w-56` (40x224px — a wide rectangle). Using `object-contain object-left` on a square image inside a wide rectangle will leave significant empty space on the right. The logo container dimensions need adjustment. Since the user's discretion allows dimension changes, the best approach is to use a square or near-square container (`h-10 w-10` or `h-12 w-12`) rather than the wide `w-56`.

**Primary recommendation:** Edit `components/header.tsx` in one task — update the 8 color class changes plus the logo path/dimensions. Also update `components/currency-selector.tsx` for the 3 color classes visible on the forest background. No new files needed, no new packages needed.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | 4.x | Utility class styling | Already installed; Phase 1 tokens active |
| Next.js Image | 16.1.1 | Optimized image rendering | Already in use; keep existing pattern |

### Supporting

No additional libraries needed. This phase is pure class-name edits on existing components.

### Alternatives Considered

None applicable — all decisions are locked. No library choices remain.

**Installation:**

No packages to install. All dependencies present from Phase 1.

---

## Architecture Patterns

### No Structural Changes

The CONTEXT.md constraint is: "no layout or structural changes." The task is class-name replacement inside `components/header.tsx` and minor color fixes in `components/currency-selector.tsx`. Do not refactor, extract, or reorganize.

### Tailwind 4 Token Usage Pattern

Phase 1 established the token system in `globals.css` using `@theme inline`. In Tailwind 4, these tokens become utility classes directly:

```
--color-forest: #1E3B30      →  bg-forest, text-forest, border-forest
--color-parchment: #F5EDD6   →  bg-parchment, text-parchment, border-parchment
--color-gold: #C9A642        →  bg-gold, text-gold, border-gold
--color-terracotta: #C8642A  →  bg-terracotta, text-terracotta, border-terracotta
```

**Critical distinction:** These are single-value tokens, NOT scale tokens. Use `bg-forest` not `bg-forest-500`. Use `text-gold` not `text-gold-500`. The old psychedelic `--color-gold-500: #EAB308` is a DIFFERENT color (yellow) and must not be used.

### Logo Image Container Pattern

The current pattern uses `fill` mode inside a sized container:

```tsx
// Current (broken path, wrong dimensions for square logo)
<div className="relative h-10 w-56">
  <Image src="/images/wildenflower-full.png" alt="Wildenflower" fill className="object-contain object-left" priority />
</div>

// Correct (right path, square container for 600x600 logo)
<div className="relative h-10 w-10">
  <Image src="/assets/images/logo/logo-full.png" alt="Wildenflower" fill className="object-contain" priority />
</div>
```

Keep `fill` + sized container pattern (not `width`/`height` props) — consistent with current code and works with Next.js Image optimization.

### Icon Button Hover Treatment on Dark Background

On a dark (`bg-forest`) background, `hover:bg-neutral-100` would flash a harsh light patch. The correct botanical approach uses semi-transparent white:

```tsx
// Remove: hover:bg-neutral-100
// Use:    hover:bg-white/10
```

`hover:bg-white/10` is a standard Tailwind 4 utility (white at 10% opacity) — no custom class needed.

### Anti-Patterns to Avoid

- **Using `bg-gold-500` instead of `bg-gold`:** `bg-gold-500` refers to the psychedelic "Golden Hour" yellow (#EAB308), not the Wildenflower gold (#C9A642). Always use bare `bg-gold`.
- **Changing CurrencySelector logic:** The dropdown must stay functional. Only update color classes on the trigger button and dropdown items — do not touch event handlers or state.
- **Changing `sticky top-0 z-30`:** These are structural layout classes, not palette classes. Leave them alone.
- **Removing `isMounted` guards:** The cart/wishlist badge visibility uses `isMounted` to prevent hydration mismatches. Leave this pattern intact.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Semi-transparent hover overlay | Custom CSS class | `hover:bg-white/10` | Built into Tailwind 4 arbitrary value system |
| Badge color choices | New CSS variable | `bg-terracotta` or `bg-gold` | Phase 1 tokens already defined |
| Logo path resolution | Path aliasing | Direct string `/assets/images/logo/logo-full.png` | Matches Next.js public/ serving convention |

**Key insight:** Everything in this phase is a find-and-replace of class names within a single component. No new abstractions are needed.

---

## Common Pitfalls

### Pitfall 1: Wrong Tailwind Color Scale Reference

**What goes wrong:** Developer writes `bg-forest-500` or `text-parchment-100` — Tailwind generates no class, silently falls back to default.
**Why it happens:** Tailwind 4 scale tokens (like `--color-gold-500`) also exist in globals.css for the OLD psychedelic palette. Botanical tokens are single-value, not scale.
**How to avoid:** Botanical tokens always use bare names: `bg-forest`, `text-parchment`, `text-gold`, `border-gold`, `bg-terracotta`.
**Warning signs:** Color doesn't change despite class being applied. DevTools shows `background-color: initial`.

### Pitfall 2: Logo Container Aspect Ratio Mismatch

**What goes wrong:** Keeping `w-56` with a 600x600 square logo — the logo renders tiny in the center-left of a wide empty box.
**Why it happens:** `object-contain` preserves aspect ratio. A square image in a 40x224px box renders as a 40x40 square with 184px of empty space on the right.
**How to avoid:** Change to square container (`h-10 w-10` or `h-12 w-12`) matching the logo's 1:1 aspect ratio.
**Warning signs:** Logo appears small with lots of empty space to its right.

### Pitfall 3: Currency Selector Invisible on Forest Background

**What goes wrong:** `CurrencySelector` uses `text-gray-700` for its trigger button text. On a forest green (`#1E3B30`) background, gray-700 (#374151) is nearly invisible — dark text on dark background.
**Why it happens:** CurrencySelector was designed for a light background header. It's not scoped — it inherits the header's background.
**How to avoid:** Update CurrencySelector trigger text to `text-parchment` and its hover from `hover:bg-gray-100` to `hover:bg-white/10`. The dropdown panel (white background, dark text) is fine as-is since it floats above the header.
**Warning signs:** Currency selector text is barely legible on the forest header.

### Pitfall 4: Focus Ring Color Inconsistency

**What goes wrong:** `globals.css` sets `--focus-ring-color: var(--color-primary-600)` which is Cosmic Purple (#7C3AED). Focus indicators on the dark forest header flash purple — inconsistent with botanical palette.
**Why it happens:** Phase 1 didn't update the focus ring semantic variable.
**How to avoid:** This is a known limitation from Phase 1. For Phase 2 scope, do not change globals.css focus ring (out of scope, architectural). Accept it for now.
**Warning signs:** N/A — this is a known limitation, not an error.

---

## Code Examples

Verified from live codebase inspection:

### Complete Header Color Changes

```tsx
// Source: /Users/jamesputman/SRC/shopSite/components/header.tsx (current)
// BEFORE → AFTER class changes (header element):
// bg-neutral-50 border-neutral-200  →  bg-forest border-gold

// Nav links:
// text-neutral-700 hover:text-primary-600  →  text-parchment hover:text-gold

// SVG icon color:
// text-neutral-700 (all three icons)  →  text-parchment

// Icon button hover:
// hover:bg-neutral-100  →  hover:bg-white/10

// Cart badge:
// bg-primary-500  →  bg-terracotta  (or bg-gold — Claude's discretion)

// Wishlist badge:
// bg-secondary-500  →  bg-terracotta  (or bg-gold — Claude's discretion)

// Sign In link (text, hover):
// text-neutral-700 hover:text-primary-600  →  text-parchment hover:text-gold
```

### Logo Container Fix

```tsx
// Source: /Users/jamesputman/SRC/shopSite/components/header.tsx (current)
// logo-full.png is 600x600 (square). Change:
// BEFORE: className="relative h-10 w-56"
//         src="/images/wildenflower-full.png"
//         className="object-contain object-left"
// AFTER:  className="relative h-10 w-10"  (or h-12 w-12 if logo too small)
//         src="/assets/images/logo/logo-full.png"
//         className="object-contain"
```

### CurrencySelector Color Fix

```tsx
// Source: /Users/jamesputman/SRC/shopSite/components/currency-selector.tsx (current)
// Trigger button:
// BEFORE: text-gray-700 hover:text-gray-900 hover:bg-gray-100
// AFTER:  text-parchment hover:text-white hover:bg-white/10

// Chevron icon:
// BEFORE: text-gray-400
// AFTER:  text-parchment/60  (or text-parchment/70)

// Dropdown panel stays as-is (white bg, dark text — fine for floated dropdown)
```

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| Tailwind CSS v3 `extend.colors` in `tailwind.config.js` | Tailwind CSS v4 `@theme inline` in CSS file | Phase 1 already migrated — no config file needed |
| `next/image` with explicit `width`/`height` | `next/image` with `fill` + sized parent | Both valid in Next.js 16; current code uses fill pattern — keep it |

**Deprecated/outdated:**
- `/images/wildenflower-full.png`: Path does not exist — file is broken placeholder. Replaced by `/assets/images/logo/logo-full.png`.
- `bg-neutral-50` on header: From old psychedelic theme. Replaced by `bg-forest`.

---

## Open Questions

1. **Badge color: terracotta vs gold**
   - What we know: User said "Claude's discretion" on badge colors; both `bg-terracotta` (#C8642A) and `bg-gold` (#C9A642) are valid botanical tokens
   - What's unclear: Which reads better as a notification badge on forest background
   - Recommendation: Use `bg-terracotta` for both badges — terracotta is warmer and more vibrant than gold at small sizes, giving better contrast on forest green. Gold is better for borders/accents.

2. **Logo size at h-10 w-10 (40x40px)**
   - What we know: logo-full.png is 600x600, high resolution
   - What's unclear: Whether 40x40px is visually large enough, or if h-12 w-12 (48x48px) feels better
   - Recommendation: Start with `h-10 w-10` (matches current height) — adjust visually during implementation if needed. The user said "keep close to current `h-10 w-56`" — so h-10 is correct height.

---

## Sources

### Primary (HIGH confidence)
- Direct file inspection: `/Users/jamesputman/SRC/shopSite/components/header.tsx` — full component source read
- Direct file inspection: `/Users/jamesputman/SRC/shopSite/app/globals.css` — confirmed all `@theme inline` token names
- Direct file inspection: `/Users/jamesputman/SRC/shopSite/components/currency-selector.tsx` — full component source read
- Direct file inspection: `/Users/jamesputman/SRC/shopSite/public/assets/images/logo/logo-full.png` — confirmed 600x600 square dimensions
- Direct file inspection: `/Users/jamesputman/SRC/shopSite/.planning/phases/02-header/02-CONTEXT.md` — user decisions

### Secondary (MEDIUM confidence)
- `/Users/jamesputman/SRC/shopSite/package.json` — confirmed Tailwind CSS 4.x, Next.js 16.1.1

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all libraries confirmed from Phase 1 and direct inspection
- Architecture: HIGH — single file edit; all token names verified from live globals.css
- Pitfalls: HIGH — all pitfalls derived from direct code inspection (wrong token names, logo dimensions, currency selector contrast)

**Research date:** 2026-02-24
**Valid until:** 2026-03-24 (stable — no fast-moving dependencies involved)
