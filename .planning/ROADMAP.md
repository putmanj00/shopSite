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
- [ ] **Phase 4: Product Detail** - Apply botanical typography and BotanicalHeader to product pages
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
**Plans**: TBD

### Phase 5: Supporting Pages
**Goal**: About, FAQ, and Blog pages are botanically dressed — each has its header image and the relevant botanical assets placed within the existing layout
**Depends on**: Phase 1
**Requirements**: SUPP-01, SUPP-02, SUPP-03
**Success Criteria** (what must be TRUE):
  1. About page shows botanical-header-large.png at the top; cartouche-frame.png and divider-fallen-log.png assets are visible within the existing layout
  2. FAQ page shows botanical-header-faq.png at the top; accordion expand/collapse icons use fern-expand.png and fern-collapse.png
  3. Blog/Field Notes page shows botanical-header-blog.png at the top
  4. All existing content and structure on each page is preserved — only botanical visuals are added
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Design Foundation | 3/3 | Complete | 2026-02-24 |
| 2. Header | 1/1 | Complete   | 2026-02-24 |
| 3. Homepage | 4/4 | Complete   | 2026-02-24 |
| 4. Product Detail | 0/TBD | Not started | - |
| 5. Supporting Pages | 0/TBD | Not started | - |
