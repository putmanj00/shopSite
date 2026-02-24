# Phase 1: Design Foundation - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the Wildenflower design system at the infrastructure level: Tailwind color tokens, Google Fonts loaded via next/font, CSS global defaults for background and text, brand metadata, and viewport theme color. Every subsequent phase inherits from this. No page-level component or layout changes.

</domain>

<decisions>
## Implementation Decisions

### Typography — font loading
- Load Playfair Display weight **700 only** via `next/font/google`
- Load Lora weights **400 regular + 400 italic** via `next/font/google`
- Apply font variables as `className` on the `<html>` element in layout.tsx (standard next/font pattern)
- Declare Tailwind font-family utilities: `font-playfair` and `font-lora` mapping to the CSS variables

### Typography — application
- Global heading reset in globals.css: `h1, h2, h3, h4, h5, h6 { font-family: var(--font-playfair) }`
- Lora set as body default: `body { font-family: var(--font-lora) }`
- Existing psychedelic fonts (Righteous, Nunito, Sacramento) removed completely from layout.tsx — no dead code left

### Dark mode
- Suppress dark mode entirely: add `color-scheme: light` to `:root` in globals.css
- Full site sweep: remove all `dark:` Tailwind utility classes across all component files in this phase

### Metadata
- Title: `Wildenflower | Tie-Dye, Leather Goods, Jewelry & Art`
- Meta description: Write a Wildenflower brand description capturing the full product mix (tie-dye, leather goods, jewelry, art) with warm handmade voice — "Made by hand. Found by heart."
- Include basic Open Graph tags: `og:title`, `og:description`, `og:type`

### Claude's Discretion
- Exact wording of the meta description (within the brand voice and product mix guidance above)
- Whether to use `display: swap` or `display: optional` for font loading strategy
- Prose/body CSS defaults beyond font-family (line-height, font-size baseline)

</decisions>

<specifics>
## Specific Ideas

- Title uses the existing format the user confirmed: `Wildenflower | Tie-Dye, Leather Goods, Jewelry & Art`
- The "Made by hand. Found by heart." tagline should appear in the meta description
- Parchment (#F5EDD6) as page background + inkBrown (#5C4033) as default text are the CSS reset targets

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-design-foundation*
*Context gathered: 2026-02-24*
