---
phase: 04-product-detail
plan: 02
subsystem: product-components
tags: [restyling, palette-sweep, botanical-colors, product-detail]
dependency_graph:
  requires: [04-01]
  provides: [PROD-01]
  affects: [product-info, add-to-cart-button, variant-selector, product-accordion, sticky-add-to-cart, review-list, review-form, image-gallery, size-guide-modal]
tech_stack:
  added: []
  patterns: [botanical-palette-substitution, gray-to-inkBrown-sweep, blue-to-terracotta-sweep]
key_files:
  modified:
    - components/product-info.tsx
    - components/add-to-cart-button.tsx
    - components/variant-selector.tsx
    - components/product-accordion.tsx
    - components/sticky-add-to-cart.tsx
    - components/reviews/review-list.tsx
    - components/reviews/review-form.tsx
    - components/image-gallery.tsx
    - components/size-guide-modal.tsx
decisions:
  - "[04-02]: Sticky cart success state changed from bg-green-600 to bg-sage — botanical success state; green-600 was Cosmic-adjacent and out of palette"
  - "[04-02]: review-form sign-in prompt changed from bg-gray-50 to bg-parchment — consistent with locked 'white card on parchment' rule"
  - "[04-02]: size-guide-modal table alternating rows use bg-parchment/40 instead of bg-neutral-50 — consistent stripe pattern within white modal"
  - "[04-02]: image-gallery empty state bg-gray-200 replaced with bg-parchment — no gray backgrounds on visible elements"
metrics:
  duration: 6 min
  completed: 2026-02-24
  tasks_completed: 2
  files_modified: 9
---

# Phase 4 Plan 02: Product Component Palette Sweep Summary

Replaced all gray/blue/primary-* color classes across nine product detail components with the Wildenflower botanical palette (inkBrown, terracotta, sage, gold, forest, earth, parchment). Zero primary-* colors remain in any modified component file.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Restyle product-info, add-to-cart-button, and variant-selector | ee915dc | components/product-info.tsx, components/add-to-cart-button.tsx, components/variant-selector.tsx |
| 2 | Restyle accordion, sticky cart, and review components; investigate gallery/form/modal | 58f29b6 | components/product-accordion.tsx, components/sticky-add-to-cart.tsx, components/reviews/review-list.tsx, components/reviews/review-form.tsx, components/image-gallery.tsx, components/size-guide-modal.tsx |

## What Was Built

**components/product-info.tsx**
- Title h1: `text-gray-900` → `text-ink-brown`
- Vendor line: `text-gray-600` → `text-sage`
- Price borders: `border-gray-200` → `border-gold/30`
- Price value: `text-gray-900` → `text-terracotta`
- Compare-at price: `text-gray-500` → `text-sage`
- Category label: `text-gray-700` → `text-ink-brown`
- Category value: `text-gray-600` → `text-earth`
- Tag pills: `bg-gray-100 text-gray-700` → `bg-parchment text-ink-brown border border-gold/30`
- Wishlist hover: `hover:!bg-gray-50` → `hover:!bg-parchment`
- Size guide link: `text-primary-600` → `text-forest`

**components/add-to-cart-button.tsx**
- Available: `bg-blue-600 hover:bg-blue-700` → `bg-terracotta hover:bg-terracotta/90`
- Loading: `bg-blue-400` → `bg-terracotta/60`
- Disabled: kept `bg-gray-300 text-gray-500` (semantic)

**components/variant-selector.tsx**
- Selected: `border-blue-600 bg-blue-600 text-white` → `border-2 border-forest bg-forest/10 text-forest`
- Unselected: `border-gray-300 text-gray-900` → `border border-gold/40 text-ink-brown hover:border-forest hover:text-forest`
- Unavailable: `border-gray-200 bg-gray-100 text-gray-400` → `border border-gold/20 bg-parchment text-sage`
- Label: `text-gray-900` → `text-ink-brown`

**components/product-accordion.tsx**
- Container: `divide-neutral-200 border-neutral-200` → `divide-gold/20 border-gold/20`
- Heading: `text-neutral-900` → `text-ink-brown`
- Chevron: `text-neutral-500` → `text-sage`
- Content: `text-neutral-600` → `text-earth`
- Focus ring: `focus-visible:ring-primary-500` → `focus-visible:ring-forest`

**components/sticky-add-to-cart.tsx**
- Border: `border-neutral-200` → `border-gold/30`
- Title: `text-neutral-900` → `text-ink-brown`
- Price: `text-neutral-900` → `text-terracotta`
- Compare price: `text-neutral-500` → `text-sage`
- CTA available: `bg-primary-600 hover:bg-primary-700 active:bg-primary-800` → `bg-terracotta hover:bg-terracotta/90 active:bg-terracotta/80`
- CTA success: `bg-green-600` → `bg-sage`
- Focus ring: `focus-visible:ring-primary-500` → `focus-visible:ring-forest`

**components/reviews/review-list.tsx** (9 gray-* and 3 blue-* classes replaced)
- All `text-gray-900` → `text-ink-brown`
- All `text-gray-700`/`text-gray-600` → `text-earth`
- All `text-gray-500`/`text-gray-400` → `text-sage`
- Stats panel: `bg-gray-50` → `bg-white`
- Filter hover: `hover:bg-gray-100` / `bg-gray-100` → `hover:bg-parchment` / `bg-parchment`
- Progress bar track: `bg-gray-200` → `bg-gold/20`
- Filter ring: `ring-gray-300` → `ring-gold/40`
- Review border: `border-gray-100` → `border-gold/20`
- Photo border: `border-gray-200` → `border-gold/30`
- Avatar: `bg-blue-100 text-blue-700` → `bg-forest/10 text-forest`
- Links: `text-blue-600 hover:text-blue-800` → `text-forest hover:text-forest/80`
- Checkbox: `text-blue-600 focus:ring-blue-500` → `text-forest focus:ring-forest`
- Sort select: `focus:border-blue-500 focus:ring-blue-500` → `focus:border-forest focus:ring-forest`
- Empty state: `bg-gray-50` → `bg-white`

**components/reviews/review-form.tsx** (fully restyled)
- Sign-in prompt: `bg-gray-50` → `bg-parchment`, `text-gray-600` → `text-earth`
- Sign-in button: `bg-blue-600 hover:bg-blue-700` → `bg-terracotta hover:bg-terracotta/90`
- Form border: `border-gray-200` → `border-gold/30`
- Labels: `text-gray-900` / `text-gray-700` → `text-ink-brown`
- Input borders: `border-gray-300 focus:border-blue-500 focus:ring-blue-500` → `border-gold/40 focus:border-forest focus:ring-forest`
- Photo border: `border-gray-200` → `border-gold/30`
- Upload dashed border: `border-gray-300 hover:border-gray-400` → `border-gold/40 hover:border-gold/70`
- Upload icon: `text-gray-400` → `text-sage`
- Helper text: `text-gray-500` → `text-sage`
- Submit button: `bg-blue-600 hover:bg-blue-700 focus:ring-blue-500` → `bg-terracotta hover:bg-terracotta/90 focus:ring-terracotta`

**components/image-gallery.tsx** (investigation — had gray/blue classes)
- Empty state: `bg-gray-200` → `bg-parchment`, `text-gray-400` → `text-sage`
- Selected thumbnail: `ring-2 ring-blue-500` → `ring-2 ring-forest`
- Unselected thumbnail: `ring-gray-200 hover:ring-gray-400` → `ring-gold/30 hover:ring-gold/60`
- Image counter: `text-gray-500` → `text-sage`

**components/size-guide-modal.tsx** (investigation — had neutral-* and primary-* classes)
- Header border: `border-neutral-200` → `border-gold/30`
- Title: `text-neutral-900` → `text-ink-brown`
- Close button hover: `hover:bg-neutral-100` → `hover:bg-parchment`
- Close icon: `text-neutral-500` → `text-sage`
- Focus ring: `focus-visible:ring-primary-500` → `focus-visible:ring-forest`
- How to Measure bg: `bg-neutral-50` → `bg-parchment`
- How to Measure heading: `text-neutral-900` → `text-ink-brown`
- How to Measure body: `text-neutral-600` → `text-earth`
- Contact text: `text-neutral-600` → `text-earth`
- Contact link: `text-primary-600 hover:text-primary-700` → `text-forest hover:text-forest/80`
- Table header rows: `bg-neutral-100` → `bg-parchment`, `text-neutral-900` → `text-ink-brown`
- Table body: `divide-neutral-200` → `divide-gold/20`, striped `bg-neutral-50` → `bg-parchment/40`
- Table cell text: added `text-earth` throughout
- General guide icon: `text-neutral-400` → `text-sage`, body `text-neutral-600` → `text-earth`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Coverage] review-form.tsx had blue/gray classes (investigation found changes needed)**
- Found during: Task 2
- Issue: review-form.tsx had `bg-blue-600` submit button, `bg-gray-50` sign-in prompt, `text-gray-700`/`text-gray-900` labels, `focus:border-blue-500` input focus, `border-gray-200` photo border
- Fix: Full palette sweep matching the plan's investigate-and-update instruction
- Files modified: components/reviews/review-form.tsx
- Commit: 58f29b6

**2. [Rule 2 - Missing Coverage] image-gallery.tsx had gray/blue classes (investigation found changes needed)**
- Found during: Task 2
- Issue: `ring-2 ring-blue-500` selected thumbnail, `ring-gray-200`/`ring-gray-400` unselected, `bg-gray-200` empty state, `text-gray-400`/`text-gray-500`
- Fix: Forest ring for selected, gold/30 for unselected, parchment empty state
- Files modified: components/image-gallery.tsx
- Commit: 58f29b6

**3. [Rule 2 - Missing Coverage] size-guide-modal.tsx had neutral-* and primary-* classes (investigation found changes needed)**
- Found during: Task 2
- Issue: Extensive `neutral-*` throughout (neutral-900, neutral-600, neutral-500, neutral-200, neutral-100, neutral-50) plus `primary-500`/`primary-600`/`primary-700` focus rings and contact link
- Fix: Full neutral-* → botanical palette sweep; primary-* → forest
- Files modified: components/size-guide-modal.tsx
- Commit: 58f29b6

All three "investigate" files had visible gray/blue/primary/neutral classes and were fully restyled. The plan's instruction ("if classes present, replace them; if clean, make no changes") was followed — all three required changes.

## Verification Results

- TypeScript: no errors across all modified files
- `bg-primary-*` grep across all modified components: empty (zero survivors)
- `bg-terracotta` confirmed in add-to-cart-button.tsx and sticky-add-to-cart.tsx
- `border-forest` confirmed in variant-selector.tsx
- `divide-gold` + `text-ink-brown` confirmed in product-accordion.tsx
- `text-ink-brown` confirmed in review-list.tsx
- No `text-gray-900` or `text-gray-700` in review-list.tsx

## Self-Check: PASSED

Files exist:
- components/product-info.tsx: FOUND
- components/add-to-cart-button.tsx: FOUND
- components/variant-selector.tsx: FOUND
- components/product-accordion.tsx: FOUND
- components/sticky-add-to-cart.tsx: FOUND
- components/reviews/review-list.tsx: FOUND
- components/reviews/review-form.tsx: FOUND
- components/image-gallery.tsx: FOUND
- components/size-guide-modal.tsx: FOUND

Commits:
- ee915dc: FOUND (Task 1)
- 58f29b6: FOUND (Task 2)
