# Roadmap: Wildenflower Visual Migration

## Overview

This roadmap migrates the warm botanical visual identity from the wildenflowerShop prototype into the shopSite Next.js codebase. The work proceeds in dependency order: design foundation first (tokens, fonts, globals), then header (inherits tokens), then homepage (inherits both), then product detail and supporting pages (inherit foundation). Each phase delivers a visually reviewable result — open the dev server, inspect the page, approve before moving on.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Design Foundation** - Establish Wildenflower color tokens, fonts, globals, and metadata
- [x] **Phase 2: Header** - Swap logo and apply botanical palette to header/nav (completed 2026-02-24)
- [x] **Phase 3: Homepage** - Migrate hero, categories, dividers, and product grid heading (completed 2026-02-24)
- [x] **Phase 4: Product Detail** - Apply botanical typography and BotanicalHeader to product pages (completed 2026-02-24)
- [ ] **Phase 5: Supporting Pages** - Migrate About, FAQ, and Blog/Field Notes with botanical assets

## Phase Details

### Phase 1: Design Foundation
**Goal**: The Wildenflower design system is live — every page inherits the correct colors, fonts, and brand voice without any page-level changes
**Depends on**: Nothing (first phase)
**Requirements**: DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04, DESIGN-05
**Success Criteria** (what must be TRUE):
  1. Every page background renders as parchment (#F5EDD6) with inkBrown/earth text — visible at any URL
  2. Headings across the site render in Playfair Display bold; body text renders in Lora regular — no Righteous, Nunito, or Sacramento fonts remain
  3. Browser tab theme color shows forest green (#1E3B30) on mobile
  4. Page `<title>` and meta description use Wildenflower brand language ("Made by hand. Found by heart.") — no "psychedelic/tie-dye/trippy" language remains
  5. Tailwind theme tokens (parchment, terracotta, gold, sage, forest, dustyRose, inkBrown, earth) are available and usable in any component class
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Botanical tokens, fonts, globals, metadata, viewport (layout.tsx + globals.css + manifest.json)
- [x] 01-02-PLAN.md — Dark mode sweep: remove all dark: classes from 4 botanical component files
- [x] 01-03-PLAN.md — Visual verification checkpoint (human approve before Phase 2)

### Phase 2: Header
**Goal**: The site header identifies as Wildenflower — logo, colors, and nav styling reflect the botanical palette
**Depends on**: Phase 1
**Requirements**: HEAD-01, HEAD-02
**Success Criteria** (what must be TRUE):
  1. Wildenflower logo mark (or full logo) renders in the header — no text placeholder or prior logo visible
  2. Header background, nav link colors, and hover/active states use the Wildenflower palette (no purple/psychedelic remnants)
  3. Header layout and navigation structure is unchanged — all existing nav links still work
**Plans**: 1 plan

Plans:
- [x] 02-01-PLAN.md — Botanical palette + logo swap on header.tsx and currency-selector.tsx, with visual verification checkpoint (completed 2026-02-24)

### Phase 3: Homepage
**Goal**: The homepage feels like Wildenflower — parchment background, botanical hero image and copy, warm botanical category section, BotanicalDividers between sections, and "Freshly Gathered" product grid heading
**Depends on**: Phase 2
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, HOME-05
**Success Criteria** (what must be TRUE):
  1. Homepage background is parchment — the neutral-50 grey background is gone
  2. The hero section (EnhancedHero) shows botanical-header-large.png with "Made by hand. Found by heart." heading and Wildenflower voice CTAs
  3. Category section heading reads "Find Your Wild" with Wildenflower palette colors, botanical copy, and botanical images — no prior color scheme or psychedelic language visible
  4. BotanicalDivider renders visibly after the hero, after categories, and after featured products
  5. Featured products section heading reads "Freshly Gathered" with terracotta View All link
**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md — Page layout: parchment background, EnhancedHero botanical props, 3 BotanicalDivider insertions, FeaturedProducts heading (completed 2026-02-24)
- [x] 03-02-PLAN.md — CategoryCards: Wildenflower copy, parchment bg, botanical images, gold hover states (completed 2026-02-24)
- [x] 03-03-PLAN.md — Visual verification checkpoint — user approved all five criteria (completed 2026-02-24)
- [x] 03-04-PLAN.md — Gap closure: removed Cosmic Purple word-coloring and CTA button color from EnhancedHero; HOME-02 fully closed (completed 2026-02-24)

### Phase 4: Product Detail
**Goal**: Product pages feel botanically branded — typography, colors, and header image match the Wildenflower identity
**Depends on**: Phase 1
**Requirements**: PROD-01, PROD-02
**Success Criteria** (what must be TRUE):
  1. Product detail page typography (headings, prices, descriptions) renders in Playfair Display and Lora with Wildenflower palette colors — no generic font stack or grey/white color scheme
  2. BotanicalHeader image (small or large variant) is visible at the top of product detail pages
  3. All product detail functionality (add to cart, variant selection, image gallery) continues to work
**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md — BotanicalHeader insertion + parchment page shell + breadcrumb restyling (page.tsx + breadcrumbs.tsx)
- [x] 04-02-PLAN.md — Component color/typography sweep: product-info, add-to-cart-button, variant-selector, accordion, sticky cart, reviews
- [x] 04-03-PLAN.md — Visual verification checkpoint (human approve before Phase 5)

### Phase 5: Supporting Pages
**Goal**: About, FAQ, and Blog pages are botanically dressed — each has its header image and the relevant botanical assets placed within the existing layout
**Depends on**: Phase 1
**Requirements**: SUPP-01, SUPP-02, SUPP-03
**Success Criteria** (what must be TRUE):
  1. About page shows botanical-header-large.png at the top; cartouche-frame.png and divider-fallen-log.png assets are visible within the existing layout
  2. FAQ page shows botanical-header-faq.png at the top; accordion expand/collapse icons use fern-expand.png and fern-collapse.png
  3. Blog/Field Notes page shows botanical-header-blog.png at the top
  4. All existing content and structure on each page is preserved — only botanical visuals are added
**Plans**: 3 plans

Plans:
- [x] 05-01-PLAN.md — About page: BotanicalHeader (about variant) + divider-fallen-log between MissionValues and Sustainability (completed 2026-02-24)
- [x] 05-02-PLAN.md — FAQ page: full accordion build replacing ComingSoon (data file + accordion component + page content + page rewrite) (completed 2026-02-24)
- [x] 05-03-PLAN.md — Blog page: BotanicalHeader (blog variant) above ComingSoon placeholder (completed 2026-02-24)

- [x] **Phase 6: Copy & Brand Cleanup** — Remove purple remnants, fix cart CTAs, eliminate psychedelic copy, fix category list, update AGENTS.md (completed 2026-02-24)
- [x] **Phase 7: Cart & Conversion UX** — Free shipping bar, trust signals, brand-consistent cart styling (completed 2026-02-24)
- [x] **Phase 8: SEO Enhancement** — ISR, expanded JSON-LD (LocalBusiness, BreadcrumbList, FAQPage), local SEO page, NAP footer (completed 2026-02-24)
- [x] **Phase 9: Performance & Dependency Audit** — Image priority fix, next.config domain cleanup, Wikimedia removed (completed 2026-02-24)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Design Foundation | 3/3 | Complete | 2026-02-24 |
| 2. Header | 1/1 | Complete   | 2026-02-24 |
| 3. Homepage | 4/4 | Complete   | 2026-02-24 |
| 4. Product Detail | 3/3 | Complete   | 2026-02-24 |
| 5. Supporting Pages | 3/3 | Complete | 2026-02-24 |
| 6. Copy & Brand Cleanup | — | Complete | 2026-02-24 |
| 7. Cart & Conversion UX | — | Complete | 2026-02-24 |
| 8. SEO Enhancement | — | Complete | 2026-02-24 |
| 9. Performance & Deps | — | Complete | 2026-02-24 |

---

## Milestone v1.1: UX Cleanup & Navigation

**Milestone Goal:** Remove deceptive content and navigation confusion so every shopper path leads cleanly to real products. CRITICAL trust issues (fake social proof) are resolved first, then routing integrity, then label accuracy, product data quality, collections polish, and footer cleanup.

**Phase summary:**
- [x] **Phase 10: Trust Cleanup** - Remove all fake social proof (purchase popups, testimonials, fabricated stats, fake engagement) (completed 2026-02-26)
- [ ] **Phase 11: Navigation Routing** - Fix /collections redirect, hero CTA link, and all stale /collections hrefs
- [ ] **Phase 12: Navigation Labels** - Correct all 6 category labels and hrefs in top nav
- [ ] **Phase 13: Product Data Quality** - Fix vendor names, hide test products, filter imageless products, add card corner overlays
- [ ] **Phase 14: Collections Polish** - Update /collections/all heading, subtitle, botanical header, and breadcrumb
- [ ] **Phase 15: Footer Cleanup** - Align SHOP column with 6-category system, remove dead links

### Phase 10: Trust Cleanup
**Goal**: Every shopper encounters only real content — no fabricated purchase activity, fake reviews, invented statistics, or false engagement numbers anywhere on the site
**Depends on**: Phase 9 (v1.0 complete)
**Requirements**: TRST-01, TRST-02, TRST-03, TRST-04
**Success Criteria** (what must be TRUE):
  1. No purchase notification popup ("Someone just bought...") appears on any page visit, including homepage on first load
  2. No testimonials section displays stock-photo reviewer headshots or names (Sarah M., Michael R., Emily L., or similar fabricated personas)
  3. No stats block shows fabricated numbers ("2,500+ Happy Seekers", "4.9 Average Rating", "98% Would Recommend", "50+ Artisan Partners") anywhere on the site
  4. No Instagram-style gallery shows fake engagement counts (likes/comments overlaid on photos); if photos are Unsplash stock, the entire section is removed
**Plans**: 4 plans

Plans:
- [ ] 10-01-PLAN.md — Remove fake purchase popups from layout.tsx, stub Instagram gallery, remove sustainability fabricated stats
- [ ] 10-02-PLAN.md — Create FindUsInTheWild events section and data/events.json, stub TestimonialCarousel, update homepage page.tsx
- [ ] 10-03-PLAN.md — Update welcome popup copy, botanical image, and delayed trigger timing
- [ ] 10-04-PLAN.md — Visual verification checkpoint (human approve all four TRST requirements)

### Phase 11: Navigation Routing
**Goal**: Every internal link that previously pointed at /collections now resolves correctly — shoppers are never dropped on a broken or duplicate page
**Depends on**: Phase 10
**Requirements**: NAV-01, NAV-02, NAV-03
**Success Criteria** (what must be TRUE):
  1. Visiting /collections in a browser (any method) results in a 301 redirect to /collections/all — the /collections route itself returns no content
  2. The "Wander the Shop" CTA button on the hero navigates to /collections/all, not /collections
  3. A codebase search for href="/collections" (exact, no handle suffix) returns zero results
**Plans**: 3 plans

Plans:
- [ ] 11-01-PLAN.md — Create proxy.ts: 301 redirect from /collections to /collections/all with query string preservation (NAV-01)
- [ ] 11-02-PLAN.md — Link audit sweep: fix all 8 stale href=/collections instances, delete dead route, clean sitemap (NAV-02, NAV-03)
- [ ] 11-03-PLAN.md — Visual verification checkpoint (human approve all three NAV requirements)

### Phase 12: Navigation Labels
**Goal**: The top navigation accurately presents all six product categories with correct names and working links — shoppers can reach any category directly from the header
**Depends on**: Phase 11
**Requirements**: NAV-04, NAV-05
**Success Criteria** (what must be TRUE):
  1. Top nav dropdown or category list shows exactly 6 categories: Tie-Dye, Leather, Jewelry, Crystals, Artwork, Ceramics — no categories missing or duplicated
  2. Each category link resolves to the correct /collections/[handle] URL (e.g., /collections/leather, /collections/artwork)
  3. Category labels read "Leather" (not "Leather Goods") and "Artwork" (not "Art") — exact label match
**Plans**: TBD

### Phase 13: Product Data Quality
**Goal**: Every product card shown to shoppers presents real, complete product data — correct vendor attribution, no test placeholders, no broken image states, and botanical corner overlays on cards
**Depends on**: Phase 12
**Requirements**: PRDS-01, PRDS-02, PRDS-03, PRDS-04
**Success Criteria** (what must be TRUE):
  1. Products with vendor "My Store" display "Wildenflower" as the vendor on both product cards and product detail pages
  2. Test and placeholder products (e.g., products named "ring" or "Generic Tiedye") do not appear in any product grid or collection page
  3. Products with no featured image are absent from all product grids — no broken image placeholders, grey boxes, or fallback icons are visible
  4. Product cards display botanical corner overlays (card-corner-topleft.png at top-left, card-corner-bottomright.png at bottom-right) as decorative accents
**Plans**: TBD

### Phase 14: Collections Polish
**Goal**: The /collections/all page presents itself with Wildenflower brand voice — correct heading, subtitle, botanical header image, and breadcrumb that tells shoppers exactly where they are
**Depends on**: Phase 13
**Requirements**: COLL-01, COLL-02, COLL-03, COLL-04
**Success Criteria** (what must be TRUE):
  1. The /collections/all page heading reads "All Treasures" — not "All Products" or any generic label
  2. A subtitle below the heading reads "Every handmade treasure in one place"
  3. A botanical header image (botanical-header-small-web.png) is visible in the title area above or alongside the heading
  4. The breadcrumb trail reads "Home > Shop > All Treasures" with correct link targets
**Plans**: TBD

### Phase 15: Footer Cleanup
**Goal**: The footer SHOP column is a complete and accurate directory of the store — all six categories present, all links functional, no links pointing to pages that return 404
**Depends on**: Phase 14
**Requirements**: FOOT-01, FOOT-02
**Success Criteria** (what must be TRUE):
  1. Footer SHOP column lists exactly 7 entries in order: All Treasures, Tie-Dye, Leather, Jewelry, Crystals, Artwork, Ceramics — each linking to its correct /collections/[handle] URL
  2. Every link in the footer resolves to a page that exists — no Size Guide, Sustainability, Press, or other dead links remain; clicking any footer link does not result in a 404
**Plans**: TBD

## v1.1 Progress

**Execution Order:**
Phases execute in numeric order: 10 → 11 → 12 → 13 → 14 → 15

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 10. Trust Cleanup | 3/4 | Complete    | 2026-02-26 | - |
| 11. Navigation Routing | 2/3 | In Progress|  | - |
| 12. Navigation Labels | v1.1 | 0/TBD | Not started | - |
| 13. Product Data Quality | v1.1 | 0/TBD | Not started | - |
| 14. Collections Polish | v1.1 | 0/TBD | Not started | - |
| 15. Footer Cleanup | v1.1 | 0/TBD | Not started | - |
