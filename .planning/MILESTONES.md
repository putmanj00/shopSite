# Milestones

## v1.1 UX Cleanup & Navigation (Shipped: 2026-02-26)

**Phases:** 10–15 | **Plans:** 16 formal plans
**Timeline:** 2026-02-25 → 2026-02-26 (2 days)

**Delivered:** Removed all fake social proof and fixed navigation confusion — every shopper path now leads cleanly to real products with correct category labels and accurate product data.

**Key accomplishments:**
- All fake social proof removed: purchase popups, fake testimonials, fabricated stats ("2,500+ Happy Seekers"), fake Instagram engagement
- Navigation routing fixed: /collections → 301 → /collections/all; all 8 stale hrefs corrected
- Navigation labels corrected: 6 categories (Tie-Dye, Leather, Jewelry, Crystals, Artwork, Ceramics) in header + mobile drawer
- Product data quality: vendor normalization, test products hidden, imageless products filtered, botanical corner overlays
- Collections page: "All Treasures" heading, subtitle, BotanicalHeader, correct breadcrumb
- Footer: 7-entry SHOP column, all dead links removed

**Archives:**
- `.planning/milestones/v1.1-ROADMAP.md`
- `.planning/milestones/v1.1-REQUIREMENTS.md`
- `.planning/milestones/v1.1-MILESTONE-AUDIT.md`

---

## v1.0 Visual Migration (Shipped: 2026-02-26)

**Phases:** 1–9 | **Plans:** 14 formal plans (phases 6–9 informal)
**Timeline:** 2026-02-24 → 2026-02-26 (3 days)
**Files changed:** 235 | **LOC:** +11,678 / −1,250 TypeScript/TSX

**Delivered:** Complete botanical visual identity migration from wildenflowerShop (React Native) into shopSite (Next.js 16) — every public page now renders in Playfair Display/Lora fonts with the Wildenflower palette.

**Key accomplishments:**
- Botanical design system live: Playfair Display/Lora fonts, parchment/terracotta/forest/gold Tailwind @theme tokens, global color defaults
- Header fully branded: forest green nav, Wildenflower logo mark, terracotta cart/wishlist badges
- Homepage migrated: parchment background, BotanicalHeader hero ("Made by hand. Found by heart."), "Find Your Wild" category section, BotanicalDividers, "Freshly Gathered" product grid
- Product detail pages: BotanicalHeader at top, full component sweep (product-info, add-to-cart, variant-selector, accordion, sticky cart, reviews)
- Supporting pages: About with fallen-log divider, FAQ fully rebuilt with fern-icon accordion, Blog with botanical header
- Copy/brand cleanup + cart UX enhancements + SEO (JSON-LD) + performance audit (phases 6–9)

**Archives:**
- `.planning/milestones/v1.0-ROADMAP.md`
- `.planning/milestones/v1.0-REQUIREMENTS.md`

---

