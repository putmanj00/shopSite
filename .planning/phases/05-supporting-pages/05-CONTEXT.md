# Phase 5: Supporting Pages - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Add botanical header images and specified botanical assets to About, FAQ, and Blog/Field Notes pages. For FAQ, build a real FAQ accordion (replacing the ComingSoon placeholder) using the wildenflowerShop FAQ as inspiration. Existing content and page structure are preserved — only botanical visuals and the FAQ accordion are added. No component-level color/typography sweep.

</domain>

<decisions>
## Implementation Decisions

### Header image treatment
- Use the existing `BotanicalHeader` component (same as product pages) on all three pages
- Page-specific images from `public/assets/images/headers/`:
  - About → `botanical-header-large-about.png`
  - FAQ → `botanical-header-faq.png`
  - Blog → `botanical-header-blog.png`
- Position: very top of page body (first thing after site nav), above all existing page content
- Consistent treatment across all three pages — no per-page variation

### About page asset placement
- `divider-fallen-log.png` placed between the MissionValues and Sustainability sections
- `cartouche-frame.png` — skipped for this phase (not used)

### FAQ page — full accordion build
- Replace the `ComingSoon` placeholder with a real FAQ page
- Structure mirrors wildenflowerShop FAQ (`app/(tabs)/faq.tsx`):
  - BotanicalHeader at top
  - Page title "Questions" + subtitle ("Everything you might want to know...")
  - Category filter chips: All / Getting Started / Shipping / Makers / Returns
  - Accordion list using FAQ content from wildenflowerShop mock-data (7 items)
  - "Still curious?" contact section at bottom, framed with `faq-contact-border.png`
- Accordion expand/collapse icons: `fern-expand.png` and `fern-collapse.png` from `public/assets/images/icons/ui/`

### Blog page
- Add BotanicalHeader (`botanical-header-blog.png`) above the existing ComingSoon placeholder
- No other changes to the Blog page

### Typography & color scope
- No component-level color/typography sweep on any of the three pages
- Trust Phase 1 globals (parchment background, Playfair Display headings, Lora body) to apply site-wide
- Do not touch individual component backgrounds even if they show white/grey

### Claude's Discretion
- Exact Tailwind classes for the FAQ accordion styling (parchment alternating rows, border radius, etc.)
- Accordion animation/transition approach for web (CSS transition vs. Radix UI)
- FAQ accordion single-open vs. multi-open behavior
- Exact sizing and styling of the fern icons within the accordion row

</decisions>

<specifics>
## Specific Ideas

- FAQ should closely mirror the wildenflowerShop `app/(tabs)/faq.tsx` — use that file as the design reference
- FAQ content (7 items, 4 categories) comes from wildenflowerShop `data/mock-data.ts` `faqItems` export
- `faq-contact-border.png` already exists at `public/assets/images/faq/faq-contact-border.png`
- Fern icons already exist at `public/assets/images/icons/ui/fern-expand.png` and `fern-collapse.png`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-supporting-pages*
*Context gathered: 2026-02-24*
