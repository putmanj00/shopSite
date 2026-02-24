# Phase 4: Product Detail - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Apply Wildenflower botanical typography, colors, and BotanicalHeader image to the existing product detail page. No structural changes, no new features — visual brand migration only. Scope is PROD-01 (typography + colors) and PROD-02 (BotanicalHeader at top).

</domain>

<decisions>
## Implementation Decisions

### BotanicalHeader variant & placement
- Use the **small variant** (botanical-header-small.png) — compact, doesn't dwarf product content, brand stamp feel
- BotanicalHeader goes **above breadcrumbs** — brand identity leads, navigation follows
- Breadcrumb bar becomes **bg-parchment** (no white) — flows naturally after the header, no jarring white interruption
- Main product content area changes from bg-gray-50 to **bg-parchment** — consistent with homepage and rest of site

### Card & section backgrounds
- **Keep white cards** (`bg-white rounded-lg shadow-sm`) on the parchment background — layered "paper on linen" look, clean and readable
- Update text colors in accordion/reviews sections from gray-900/gray-700 to **inkBrown/earth palette** — consistent with the rest of the site

### Add to Cart button & product info styling
- Add to Cart button: **terracotta fill** (`bg-terracotta`) with white text — warm, action-forward, matches primary accent used throughout
- Product title: **Playfair Display, inkBrown** — heading font for the product name
- Product price: **Lora, terracotta** — body font with terracotta accent, warm and readable
- Variant selector selected/active states: **forest border + forest text** — clear botanical active state

### Related products heading
- "You May Also Like" — **restyle only**: Playfair Display + inkBrown text
- No wording change — familiar phrase kept, just correct font and color applied

### Claude's Discretion
- Exact Tailwind class choices within the palette (e.g., `text-inkBrown` vs `text-earth`)
- Hover states on variant selectors and secondary interactive elements
- Breadcrumb text color (inkBrown or sage — whichever reads best on parchment)
- Shadow/border adjustments on white cards against parchment

</decisions>

<specifics>
## Specific Ideas

- No specific references given — open to standard Wildenflower palette approaches
- Consistency priority: product detail should feel like a continuation of the homepage (same parchment bg, same font stack, same terracotta accent)

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-product-detail*
*Context gathered: 2026-02-24*
