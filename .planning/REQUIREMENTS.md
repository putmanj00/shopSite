# Requirements: Wildenflower — v1.1 UX Cleanup & Navigation

**Defined:** 2026-02-25
**Core Value:** A shopper lands on a beautiful, nature-inspired handmade goods storefront and immediately feels the warmth and authenticity of the Wildenflower brand — while the Shopify integration underneath works reliably.

---

## Milestone v1.0 Requirements (Completed)

See commit history and `.planning/phases/` for completed phase records.

All DESIGN, HEAD, HOME, PROD requirements complete. SUPP-01–03 deferred to v1.2.

---

## v1.1 Requirements

Requirements for UX Cleanup & Navigation milestone. Phases continue numbering from Phase 9 (starting at Phase 10).

### Trust

- [x] **TRST-01**: Shopper sees no fake purchase notification popup anywhere on the site
- [x] **TRST-02**: Shopper sees no fake testimonials with stock headshots (Sarah M., Michael R., Emily L., etc.)
- [x] **TRST-03**: Shopper sees no fabricated stats ("2,500+ Happy Seekers", "4.9 Average Rating", "98% Would Recommend", "50+ Artisan Partners")
- [x] **TRST-04**: Shopper sees no fake Instagram engagement counts (234, 189, 312, etc.) — overlays removed; if photos are Unsplash stock, entire section removed

### Navigation

- [x] **NAV-01**: Shopper visiting `/collections` is automatically redirected to `/collections/all` (301 permanent redirect)
- [x] **NAV-02**: "Wander the Shop" hero CTA links to `/collections/all`, not `/collections`
- [x] **NAV-03**: No stale `href="/collections"` links remain anywhere in the codebase
- [x] **NAV-04**: Top nav shows all 6 categories: Tie-Dye, Leather, Jewelry, Crystals, Artwork, Ceramics — with correct `/collections/[handle]` hrefs
- [x] **NAV-05**: Nav category labels are correct: "Leather" (not "Leather Goods"), "Artwork" (not "Art")

### Products

- [ ] **PRDS-01**: Products from vendor "My Store" display vendor as "Wildenflower" on product cards and detail pages
- [x] **PRDS-02**: Test/placeholder products ("ring", "Generic Tiedye") are hidden from storefront or removed
- [x] **PRDS-03**: Products with no featured image are filtered out of all product grids (not shown as broken cards)
- [ ] **PRDS-04**: Botanical card corner overlays (`card-corner-topleft.png`, `card-corner-bottomright.png`) appear on product cards

### Collections

- [ ] **COLL-01**: `/collections/all` page heading reads "All Treasures" (not "All Products")
- [ ] **COLL-02**: `/collections/all` subtitle reads "Every handmade treasure in one place"
- [ ] **COLL-03**: `/collections/all` has a botanical header image (`botanical-header-small-web.png`) in the title area
- [ ] **COLL-04**: Breadcrumb on `/collections/all` reads "Home > Shop > All Treasures"

### Footer

- [ ] **FOOT-01**: Footer SHOP column lists all 7 entries: All Treasures, Tie-Dye, Leather, Jewelry, Crystals, Artwork, Ceramics
- [ ] **FOOT-02**: Footer contains no links to pages that don't exist (no 404s — Size Guide, Sustainability, Press removed if pages absent)

---

## v1.2 Requirements (Deferred)

### Supporting Pages (from v1.0 Phase 5)

- **SUPP-01**: About page updated — botanical-header-large.png placed at top, cartouche-frame.png and divider-fallen-log.png assets incorporated
- **SUPP-02**: FAQ page updated — botanical-header-faq.png placed at top, fern-expand.png / fern-collapse.png for accordion toggles
- **SUPP-03**: Blog/Field Notes page updated — botanical-header-blog.png placed at top

### Collections Polish (from v1.0 v2 backlog)

- **COLL-EXT-01**: `/collections/all` botanical divider above footer (`divider-fern-mushroom-web.png`)
- **COLL-EXT-02**: Filter labels consistently capitalized and clean

---

## Out of Scope

| Feature | Reason |
|---------|---------|
| Shopify integration changes | E-commerce plumbing works — visual/UX layer only |
| OAuth/auth logic | Fragile, no tests — visual changes only |
| Admin dashboard | Separate project |
| Test coverage | Separate project |
| Vendor fix via Shopify Admin | Documented as manual step option — code fix preferred |
| New pages or features | Cleanup only — not adding new capabilities |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TRST-01 | Phase 10 | Complete |
| TRST-02 | Phase 10 | Complete |
| TRST-03 | Phase 10 | Complete |
| TRST-04 | Phase 10 | Complete |
| NAV-01 | Phase 11 | Complete |
| NAV-02 | Phase 11 | Complete |
| NAV-03 | Phase 11 | Complete |
| NAV-04 | Phase 12 | Complete |
| NAV-05 | Phase 12 | Complete |
| PRDS-01 | Phase 13 | Pending |
| PRDS-02 | Phase 13 | Complete |
| PRDS-03 | Phase 13 | Complete |
| PRDS-04 | Phase 13 | Pending |
| COLL-01 | Phase 14 | Pending |
| COLL-02 | Phase 14 | Pending |
| COLL-03 | Phase 14 | Pending |
| COLL-04 | Phase 14 | Pending |
| FOOT-01 | Phase 15 | Pending |
| FOOT-02 | Phase 15 | Pending |

**Coverage:**
- v1.1 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-25*
*Last updated: 2026-02-25 after roadmap creation — phases corrected to 10–15 (phases 6–9 occupied by v1.0 work)*
