# WILDENFLOWER shopSite — UX Cleanup & Navigation Simplification

**GSD Task Document for Claude Code & Antigravity**
**Repository:** github.com/putmanj00/shopSite
**Date:** February 25, 2026

---

## Problem Statement

The site has three overlapping ways to browse products, creating a confusing user journey with unnecessary duplication:

| Path | URL | What It Shows | Verdict |
|------|-----|---------------|---------|
| Homepage category cards | `/` (scroll down) | 6 botanical illustrated category cards → filtered collections | ✅ **KEEP** |
| /collections page | `/collections` | Same 6 categories but with stock photos, bad descriptions, extra "Home page" card with no image | ❌ **DELETE** |
| /collections/all page | `/collections/all` | Full product grid with filters, search, sort, pagination | ✅ **KEEP** |

The `/collections` page duplicates the homepage category cards but with worse imagery (stock Gucci bag for Leather), one-word descriptions ("crystal", "pottery"), and a broken "Home page" card. It adds a click without adding value.

---

## Task 1: Kill the /collections Page

**Priority:** 🔴 CRITICAL
**Files:** `app/collections/page.tsx`, `next.config.ts`, any component linking to `/collections`

### Steps

- [ ] **Add redirect in next.config.ts:** Add `{ source: '/collections', destination: '/collections/all', permanent: true }` to the redirects array
- [ ] **Update "Wander the Shop" hero CTA:** Change href from `/collections` to `/collections/all`
- [ ] **Verify homepage category card links:** Each card should link to `/collections/[handle]` (e.g., `/collections/tie-dye`), NOT to `/collections`
- [ ] **Global search for stale links:** Search codebase for `href="/collections"` and `to="/collections"` — update all to `/collections/all`. Do NOT break `/collections/all` or `/collections/[handle]` routes
- [ ] **Remove or gut `app/collections/page.tsx`:** Delete the page component if using the next.config redirect, or replace contents with `redirect('/collections/all')`

---

## Task 2: Fix Navigation Labels

**Priority:** 🟡 HIGH
**Files:** Header/Nav component, Footer component, navigation data/constants

The nav, footer, and components use inconsistent category names that don't match the 6-category system.

### Name Corrections

| Location | Current | Change To | Notes |
|----------|---------|-----------|-------|
| Top nav | "Leather Goods" | "Leather" | Match Shopify handle |
| Top nav | "Art" | "Artwork" | Match Shopify handle |
| Top nav | (missing) | Add "Crystals" | One of the biggest categories, not in nav |
| Top nav | (missing) | Add "Ceramics" | 6th category, not in nav |
| Footer SHOP | "Leather Goods" | "Leather" | Must match nav |
| Footer SHOP | "Crystals & Stones" | "Crystals" | Simplified |
| Footer SHOP | (missing) | Add "Artwork" | Not listed |
| Footer SHOP | (missing) | Add "Ceramics" | Not listed |

### Target Nav (left to right)

**Shop All | Tie-Dye | Leather | Jewelry | Crystals | Artwork | Ceramics | Our Story**

If 8 items is too wide, group the 6 categories under a "Shop" dropdown. Keep "Shop All" and "Our Story" as top-level.

### Target Footer SHOP Column

All Treasures, Tie-Dye, Leather, Jewelry, Crystals, Artwork, Ceramics

---

## Task 3: Remove ALL Fake Social Proof

**Priority:** 🔴 CRITICAL
**Files:** Search for notification/toast/popup components, testimonial sections, stats sections

### Steps

- [ ] **Remove fake purchase notification popup:** The `/collections/all` page shows "Someone in New York, NY just purchased Leather Crossbody Bag — 5 months ago". Find and delete this component entirely. Search for: "just purchased", "recently purchased", "social proof", "notification popup"
- [ ] **Remove fake testimonials:** If the homepage still has testimonials with Unsplash stock headshots (Sarah M. Portland, Michael R. Austin, Emily L. Seattle, etc.), delete the entire testimonials section. Do NOT replace with other fake content — remove it completely
- [ ] **Remove fabricated stats:** Delete "4.9 Average Rating", "2,500+ Happy Seekers", "98% Would Recommend", "50+ Artisan Partners" — all fabricated. Only display real numbers
- [ ] **Remove fake Instagram engagement:** The Instagram gallery shows fabricated like counts (234, 189, 312, etc.). Remove the count overlays. If the photos are Unsplash stock, remove the entire section

---

## Task 4: Clean Up Product Data

**Priority:** 🟡 HIGH
**Files:** Product card components, Storefront API queries, Shopify Admin (manual steps)

### 4.1 — Fix Vendor Display Names

| Current Vendor | Appears On | Change To |
|---------------|------------|-----------|
| "My Store" | Your real products (ice dye shirts, crystals, pendants) | "Wildenflower" |
| "Artisan Collective" | Seed/placeholder products (Spiral Tie-Dye Hoodie, Shibori Indigo Scarf, Rainbow Swirl Tee) | Remove these products OR update to "Wildenflower" |

**Fix option A (Shopify Admin):** Products → select all → Edit vendor → "Wildenflower"
**Fix option B (Code):** Update product card component to display "Wildenflower" when vendor is "My Store" or empty

### 4.2 — Remove Test/Placeholder Products

These products are clearly test data — remove from Shopify or hide from storefront:

| Product | Price | Issue |
|---------|-------|-------|
| "ring" | $71.00 | No image, lowercase name, no description |
| "Generic Tiedye" | $125.00 | No image, generic name, placeholder |
| Any product with no image | Various | Upload real photos or hide until photos exist |

### 4.3 — Product Card Improvements

- [ ] **Filter out imageless products:** Update Storefront API query or component to exclude products where `featuredImage` is null
- [ ] **Add botanical card corner overlays:** Position `card-corner-topleft.png` and `card-corner-bottomright.png` as CSS absolute overlays on each product card (matching mobile app)
- [ ] **Consistent price formatting:** All prices as `$XX.00` with consistent font size

---

## Task 5: Polish /collections/all Page

**Priority:** 🟢 MEDIUM
**Files:** `app/collections/all/page.tsx` or `app/collections/[handle]/page.tsx`

- [ ] **Rename page heading:** "All Products" → "All Treasures"
- [ ] **Update subtitle:** "Browse our complete collection of products" → "Every handmade treasure in one place"
- [ ] **Add botanical header:** Use `botanical-header-small-web.png` as subtle background behind page title area
- [ ] **Fix breadcrumb:** "Home > Collections > All Products" → "Home > Shop > All Treasures"
- [ ] **Verify pagination:** Currently shows "Showing 12 of 45 products" — verify all pages load
- [ ] **Clean up filter labels:** Display names should be capitalized and clean ("Blue" not "blue")
- [ ] **Add botanical divider above footer:** `divider-fern-mushroom-web.png` full-width

---

## Task 6: Footer Cleanup

**Priority:** 🟢 MEDIUM
**Files:** Footer component

### Current Issues
- SHOP column lists "Crystals & Stones" (should be "Crystals"), missing Artwork and Ceramics
- SUPPORT lists "Size Guide" — does this page exist? If not, remove the link
- COMPANY lists "Sustainability" and "Press" — do these pages exist? If not, remove
- Bottom bar shows "Wildenflower · Alexandria, KY · Northern Kentucky" — this is good, keep it

### Target Footer

| SHOP | SUPPORT | COMPANY | LEGAL |
|------|---------|---------|-------|
| All Treasures | Contact Us | About Us | Privacy Policy |
| Tie-Dye | Shipping & Returns | Our Story | Terms of Service |
| Leather | FAQ | Blog | Accessibility |
| Jewelry | | | |
| Crystals | | | |
| Artwork | | | |
| Ceramics | | | |

**Rule: Remove any link that goes to a page that doesn't exist. A 404 is worse than a shorter footer.**

---

## Target User Flow (After All Changes)

| User Action | Destination | URL |
|-------------|-------------|-----|
| Clicks "Wander the Shop" hero CTA | Full product grid (all categories) | `/collections/all` |
| Clicks "Shop All" in nav | Full product grid (all categories) | `/collections/all` |
| Clicks a category card on homepage | Filtered product grid for that category | `/collections/[handle]` |
| Clicks a category name in nav | Filtered product grid for that category | `/collections/[handle]` |
| Clicks a category in footer | Filtered product grid for that category | `/collections/[handle]` |
| Visits /collections directly | Redirected automatically | → `/collections/all` |

**Zero duplication. Every path leads to products. No dead-end category pages.**

---

## Execution Order

| Order | Task | Priority | Est. Time |
|-------|------|----------|-----------|
| 1 | Task 3: Remove fake social proof | 🔴 CRITICAL | 30 min |
| 2 | Task 1: Kill /collections, fix routing | 🔴 CRITICAL | 1 hour |
| 3 | Task 2: Fix nav & footer labels | 🟡 HIGH | 1 hour |
| 4 | Task 4: Clean up product data | 🟡 HIGH | 1–2 hours |
| 5 | Task 5: Polish /collections/all | 🟢 MEDIUM | 1–2 hours |
| 6 | Task 6: Footer cleanup | 🟢 MEDIUM | 30 min |

**Total estimated: 5–7 hours of agent work**

---

## Verification Checklist

After all tasks are complete, verify:

- [ ] `/collections` redirects to `/collections/all` (no duplicate category page)
- [ ] "Wander the Shop" button goes to `/collections/all`
- [ ] All 6 categories appear in nav: Tie-Dye, Leather, Jewelry, Crystals, Artwork, Ceramics
- [ ] All 6 categories appear in footer SHOP column
- [ ] No fake purchase notification popup anywhere on the site
- [ ] No fake testimonials with stock headshots
- [ ] No fabricated stats (2,500+ seekers, etc.)
- [ ] No products showing "No image" in any grid
- [ ] Vendor shows "Wildenflower" not "My Store" or "Artisan Collective"
- [ ] No test products visible ("ring", "Generic Tiedye")
- [ ] Page heading says "All Treasures" not "All Products"
- [ ] Footer has no links to nonexistent pages (no 404s)
- [ ] All category links in nav go to correct `/collections/[handle]` URLs
