# Requirements: Wildenflower Visual Migration

**Defined:** 2026-02-23
**Core Value:** A shopper lands on a beautiful, nature-inspired handmade goods storefront that immediately communicates warmth and authenticity — while the Shopify integration underneath works reliably.

## v1 Requirements

### Design Foundation

- [ ] **DESIGN-01**: Tailwind CSS theme extended with Wildenflower color tokens: parchment (#F5EDD6), terracotta (#C8642A), gold (#C9A642), sage (#7B8B6F), forest (#1E3B30), dustyRose (#D08B7A), inkBrown (#5C4033), earth (#3B2F2F)
- [ ] **DESIGN-02**: Playfair Display (700 bold, heading) and Lora (400 regular, body) loaded via next/font/google, replacing Righteous, Nunito, and Sacramento font variables in layout.tsx
- [ ] **DESIGN-03**: globals.css updated — default page background parchment, default text inkBrown/earth
- [ ] **DESIGN-04**: Layout metadata updated — remove "psychedelic/tie-dye/trippy" language, use Wildenflower botanical brand voice ("Made by hand. Found by heart." tagline, handmade goods copy)
- [ ] **DESIGN-05**: Viewport theme color updated from Cosmic Purple (#7C3AED) to forest (#1E3B30)

### Header

- [ ] **HEAD-01**: Logo image swapped to Wildenflower logo mark (public/assets/images/logo/logo-full.png or logo-mark.png) replacing current text/placeholder logo
- [ ] **HEAD-02**: Header background, nav link colors, and interactive states updated to Wildenflower palette — no layout or structural changes

### Homepage

- [ ] **HOME-01**: Page background updated from neutral-50 to parchment
- [ ] **HOME-02**: EnhancedHero replaced with HeroCard component using "Made by hand. Found by heart." tagline and forest background (no other homepage sections moved)
- [ ] **HOME-03**: Category section colors and typography updated to Wildenflower palette (no icon changes, no reordering)
- [ ] **HOME-04**: BotanicalDivider components added between homepage sections (after hero, after categories, after featured products)
- [ ] **HOME-05**: Featured products section heading updated to "Freshly Gathered"

### Product Detail

- [ ] **PROD-01**: Product detail page typography and colors updated to inherit from Wildenflower design tokens
- [ ] **PROD-02**: BotanicalHeader (small or large variant) placed at top of product detail page

### Supporting Pages

- [ ] **SUPP-01**: About page updated — botanical-header-large.png placed at top, cartouche-frame.png and divider-fallen-log.png assets incorporated in existing layout
- [ ] **SUPP-02**: FAQ page updated — botanical-header-faq.png placed at top, fern-expand.png / fern-collapse.png used for accordion toggle icons
- [ ] **SUPP-03**: Blog/Field Notes page updated — botanical-header-blog.png placed at top

## v2 Requirements

### Product Cards (deferred — decide after foundation is established)

- **CARD-01**: Card corner ornament overlays (card-corner-topleft.png, card-corner-bottomright.png) on product cards
- **CARD-02**: MakerBadge aesthetic on product cards (maker avatar initial + name)

### Collections Page (deferred — inherits design foundation automatically)

- **COLL-01**: Collections page specific botanical treatment (filter/sort controls, active state styling)
- **COLL-02**: BotanicalHeader at top of collection pages

### Category Chips (deferred — decide after foundation)

- **CHIP-01**: Category section updated to display botanical chip icons from public/assets/images/icons/categories/

### UX / Layout Improvements (deferred — separate project)

- **UX-01**: Full page layout review and component placement decisions
- **UX-02**: CategoryRow redesign with wildenflowerShop-style horizontal oval scroll
- **UX-03**: Testimonial section with botanical framing
- **UX-04**: Instagram gallery section with botanical borders

## Out of Scope

| Feature | Reason |
|---------|---------|
| Shopify integration changes | E-commerce plumbing works — visual layer only |
| Component restructuring / reordering | Per user: keep shopSite structure, just swap assets/fonts/colors |
| Admin dashboard real data | Separate project — known tech debt |
| Test coverage | Separate project — documented in CONCERNS.md |
| Security hardening | Separate project — admin auth and OAuth concerns |
| New features / pages | Migrating what exists only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DESIGN-01 | Phase 1 | Pending |
| DESIGN-02 | Phase 1 | Pending |
| DESIGN-03 | Phase 1 | Pending |
| DESIGN-04 | Phase 1 | Pending |
| DESIGN-05 | Phase 1 | Pending |
| HEAD-01 | Phase 2 | Pending |
| HEAD-02 | Phase 2 | Pending |
| HOME-01 | Phase 3 | Pending |
| HOME-02 | Phase 3 | Pending |
| HOME-03 | Phase 3 | Pending |
| HOME-04 | Phase 3 | Pending |
| HOME-05 | Phase 3 | Pending |
| PROD-01 | Phase 4 | Pending |
| PROD-02 | Phase 4 | Pending |
| SUPP-01 | Phase 5 | Pending |
| SUPP-02 | Phase 5 | Pending |
| SUPP-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-23*
*Last updated: 2026-02-23 after initial definition*
