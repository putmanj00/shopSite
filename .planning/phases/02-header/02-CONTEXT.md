# Phase 2: Header - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Apply the Wildenflower logo and botanical palette to the sticky nav bar (`components/header.tsx`). This phase is purely visual — nav links, navigation structure, Shopify cart/auth/wishlist integrations, and layout are unchanged.

</domain>

<decisions>
## Implementation Decisions

### Logo
- Use `logo-full.png` (`/assets/images/logo/logo-full.png`) in the nav bar, replacing the broken `/images/wildenflower-full.png` path
- Always use the same logo file — no adaptive color switching based on background
- Keep the existing Image component and link wrapper structure

### Header background
- Background color: forest green `#1E3B30` (Tailwind token: `bg-forest`)
- Bottom border: 1px solid gold `#C9A642` (Tailwind token: `border-gold`), replacing current `border-neutral-200`
- Remove `bg-neutral-50`

### Nav link colors
- Link text: parchment `#F5EDD6` (Tailwind token: `text-parchment`)
- Link hover: gold `#C9A642` (Tailwind token: `hover:text-gold`)
- Replace current `text-neutral-700 hover:text-primary-600`

### Icon button treatment
- SVG icons: parchment color (`text-parchment`), replacing `text-neutral-700`
- Hover background: subtle semi-transparent white/parchment lightening (`hover:bg-white/10` or similar), replacing `hover:bg-neutral-100`
- Cart count badge and wishlist count badge: keep functional, update colors to fit palette (Claude's discretion on exact badge colors)

### Claude's Discretion
- Exact hover background opacity/tint value for icon buttons
- Cart/wishlist badge background color (currently `bg-primary-500` / `bg-secondary-500` — update to terracotta or gold)
- Logo container dimensions — keep close to current `h-10 w-56` unless logo-full.png proportions require adjustment

</decisions>

<specifics>
## Specific Ideas

- No images above the nav bar — the header stays as a slim, sticky nav strip
- The botanical landscape illustration the user shared (mushrooms, ferns, "Wildenflower" medallion) is NOT for this phase — it's the Phase 3 hero background

</specifics>

<deferred>
## Deferred Ideas

- **Phase 3 hero image**: User provided a botanical landscape illustration (wide format, mushrooms/ferns/flowers, center medallion with "Wildenflower" text) to replace the current `/images/hero-background.png` hero background. Use this image as the Phase 3 `EnhancedHero` background.
- **Hero image creation note**: The attached image is AI-generated. For a production-quality version matching the quality of what it replaces, user will need a high-resolution botanical illustration at ~1920×1080px minimum, saved as PNG or WebP. The composition should be the same wide panoramic landscape format.

</deferred>

---

*Phase: 02-header*
*Context gathered: 2026-02-24*
