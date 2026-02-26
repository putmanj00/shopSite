# Phase 12: Navigation Labels - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Correct the top navigation to accurately present all six product categories (Tie-Dye, Leather, Jewelry, Crystals, Artwork, Ceramics) with exact labels and working `/collections/[handle]` links. Nav structure, interaction behavior, and data sourcing are in scope. Category page content, product grids, and footer nav are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Category data source
- Source nav from Shopify Storefront API using the named menu object (e.g., `main-menu`)
- Fetch at build time (SSG) — nav is baked into the build, not fetched at runtime
- The existing Shopify menu needs cleanup (wrong labels, missing/incorrect items) — updating the admin menu is part of this phase
- If the Shopify API call fails, fall back to a hardcoded list of the 6 known categories (not silently empty)

### Display order
- Primary order is controlled by the Shopify admin menu — whatever order items are in the admin menu is the rendered order
- Fallback hardcoded list uses this curated order: Tie-Dye → Jewelry → Crystals → Leather → Ceramics → Artwork

### Nav link targets
- Verify all 6 known collection handles exist in Shopify at build time: `tie-dye`, `leather`, `jewelry`, `crystals`, `artwork`, `ceramics`
- Only show nav links for collections that are confirmed active in Shopify
- Flag any missing handles as build-time blockers — a broken link (404) is worse than a missing nav item

### Nav structure
- Categories live under a **"Shop" dropdown**, not flat in the top bar
- Top bar pattern: `Home | Shop | About` (clean, restrained, room to grow)
- **Desktop:** Hover opens the dropdown (primary). Click also toggles it (fallback). Fully keyboard navigable: Tab to focus, Enter/Space to open, Escape to close
- **Mobile:** Hamburger menu with an expandable accordion — tap "Shop" to reveal the 6 categories inline

### Label corrections
- "Leather" (not "Leather Goods")
- "Artwork" (not "Art")
- All 6 labels must exactly match: Tie-Dye, Leather, Jewelry, Crystals, Artwork, Ceramics

### Claude's Discretion
- Exact dropdown animation/transition style
- Dropdown width and visual treatment
- Whether to show collection product counts in the dropdown
- How the current header component is structured (researcher investigates)

</decisions>

<specifics>
## Specific Ideas

- Nav should feel like Etsy/major boutique storefronts — hover dropdown under "Shop" is the well-understood e-commerce convention
- Brand is curated and intentional — restrained nav (3 top-level items) reflects that rather than listing everything at once
- Accessibility matters for real users and SEO/compliance: hover for speed, keyboard nav for accessibility

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 12-navigation-labels*
*Context gathered: 2026-02-26*
