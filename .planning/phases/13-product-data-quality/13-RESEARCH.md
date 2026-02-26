# Phase 13: Product Data Quality - Research

**Researched:** 2026-02-26
**Domain:** Shopify Storefront API data filtering, Next.js product card component
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PRDS-01 | Products with vendor "My Store" display vendor as "Wildenflower" on product cards and detail pages | Code-side display override in `product-card.tsx` and `product-info.tsx` — both already conditionally render `product.vendor`; add a `normalizeVendor()` helper |
| PRDS-02 | Test/placeholder products ("ring", "Generic Tiedye") are hidden from storefront | Client-side filter in `featured-products.tsx` and a shared `isTestProduct()` helper — Shopify query `tag_not` is the API-side option but requires tagging products; code-side filter is more reliable |
| PRDS-03 | Products with no featured image are filtered out of all product grids | `product-card.tsx` already shows a "No image" fallback div; add filter in `featured-products.tsx`, `collection-content.tsx`, and `related-products.tsx` before rendering |
| PRDS-04 | Botanical card corner overlays (`card-corner-topleft.png`, `card-corner-bottomright.png`) appear on product cards | Both images confirmed at `public/assets/images/corners/`; add `position: relative` overlay via `next/image` inside `product-card.tsx` image container |
</phase_requirements>

---

## Summary

Phase 13 makes every product card trustworthy — correct vendor name, no test junk, no broken grey boxes, and a botanical corner polish. All four requirements are pure front-end work: no Shopify Admin changes, no new dependencies, no schema migrations.

The data layer is already solid. `ShopifyProduct` has `vendor`, `images.edges`, and `title` fields — everything needed is already fetched in `PRODUCT_FRAGMENT`. The fixes are display transforms and array filters inserted at the component layer, not at the API layer.

PRDS-01 (vendor rename) and PRDS-03 (imageless filter) are two-line changes in multiple places. PRDS-02 (test product hiding) requires a shared predicate function and application to three product-rendering call sites. PRDS-04 (corner overlays) is a CSS overlay pattern — two absolutely-positioned `next/image` elements inside the existing card's `relative aspect-square` container.

**Primary recommendation:** Introduce `lib/product-filters.ts` with `normalizeVendor()` and `isTestProduct()` helpers, apply them across all product-rendering surfaces, add `hasProductImage()` guard, then add corner overlays to `product-card.tsx`.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next/image | Built-in (Next.js 16.1.1) | Optimized image rendering with overlay support | Already used everywhere in this project |
| TypeScript | Project standard | Type-safe helper functions | All files use `.tsx`/`.ts` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| No new libraries needed | — | All work is filter logic + CSS positioning | Phase scope is display transforms only |

**Installation:**
No new packages required.

---

## Architecture Patterns

### Recommended Project Structure

New file to create:
```
lib/
└── product-filters.ts       # normalizeVendor(), isTestProduct(), hasProductImage()
```

Files to modify:
```
components/
├── product-card.tsx          # PRDS-01 (vendor display), PRDS-03 (guard), PRDS-04 (corners)
├── product-info.tsx          # PRDS-01 (vendor display on detail page)
├── featured-products.tsx     # PRDS-02 + PRDS-03 (filter before render)
├── collection-content.tsx    # PRDS-02 + PRDS-03 (filter in filteredProducts useMemo)
└── related-products.tsx      # PRDS-02 + PRDS-03 (filter after API fetch)
```

### Pattern 1: Vendor Normalization Helper

**What:** A pure function that maps known incorrect vendor strings to their correct display values.
**When to use:** Called in every component that renders `product.vendor`.

```typescript
// lib/product-filters.ts
const VENDOR_OVERRIDES: Record<string, string> = {
  'My Store': 'Wildenflower',
};

export function normalizeVendor(vendor: string): string {
  return VENDOR_OVERRIDES[vendor] ?? vendor;
}
```

Apply in `product-card.tsx`:
```tsx
// Before:
<p className="mt-1 text-sm text-earth/60">{product.vendor}</p>

// After:
<p className="mt-1 text-sm text-earth/60">{normalizeVendor(product.vendor)}</p>
```

Apply in `product-info.tsx`:
```tsx
// Before:
<p className="text-lg text-sage">by {product.vendor}</p>

// After:
<p className="text-lg text-sage">by {normalizeVendor(product.vendor)}</p>
```

Apply in `quick-view-modal.tsx` (line 175 also renders `product.vendor`):
```tsx
{product.vendor && (
  <p ...>{normalizeVendor(product.vendor)}</p>
)}
```

### Pattern 2: Test Product Filter

**What:** A predicate that returns `true` for known test/placeholder products that should be hidden.
**When to use:** Applied as `.filter()` before any product array is passed to `<ProductCard>`.

```typescript
// lib/product-filters.ts

// Exact title matches (case-insensitive) for known test products
const TEST_PRODUCT_TITLES = new Set([
  'ring',
  'generic tiedye',
]);

export function isTestProduct(product: { title: string }): boolean {
  return TEST_PRODUCT_TITLES.has(product.title.toLowerCase().trim());
}

export function filterTestProducts<T extends { title: string }>(products: T[]): T[] {
  return products.filter((p) => !isTestProduct(p));
}
```

**Usage in `featured-products.tsx`:**
```tsx
// After fetching:
const products = data.products.edges
  .map((edge) => edge.node)
  .filter((p) => !isTestProduct(p));
```

**Usage in `collection-content.tsx` (inside `filteredProducts` useMemo):**
```tsx
let products = collection.products.edges
  .map(({ node }) => node)
  .filter((p) => !isTestProduct(p));  // Add this line at the top of the chain
```

**Usage in `related-products.tsx`:**
```tsx
products = response.products.edges
  .map((edge) => edge.node)
  .filter((p) => !isTestProduct(p))
  .filter((p) => p.id !== currentProductId)
  .slice(0, 4);
```

### Pattern 3: Image Guard Filter

**What:** A predicate that returns `false` for products with no images.
**When to use:** Applied alongside the test-product filter — same call sites.

```typescript
// lib/product-filters.ts
export function hasProductImage(product: { images: { edges: unknown[] } }): boolean {
  return product.images.edges.length > 0;
}
```

**Note on "featured image" terminology:** PRDS-03 says "no featured image." In this codebase, `product-card.tsx` uses `product.images.edges[0]?.node` as the first image — there is no separate `featuredImage` field in the current `PRODUCT_FRAGMENT`. The effective "featured image" is the first element of `images.edges`. The guard `product.images.edges.length > 0` is the correct check.

### Pattern 4: Botanical Card Corner Overlays (PRDS-04)

**What:** Two PNG images (`card-corner-topleft.png`, `card-corner-bottomright.png`) absolutely positioned over the product image area.
**When to use:** Inside `product-card.tsx`, within the existing `relative aspect-square` image container, below all other overlay elements.

```tsx
// Inside the <div className="relative aspect-square ..."> in product-card.tsx
// Add AFTER the existing Sale badge, Sold Out badge, and WishlistButton:

{/* Botanical corner overlays */}
<Image
  src="/assets/images/corners/card-corner-topleft.png"
  alt=""
  aria-hidden="true"
  width={60}
  height={60}
  className="absolute top-0 left-0 z-10 pointer-events-none select-none"
/>
<Image
  src="/assets/images/corners/card-corner-bottomright.png"
  alt=""
  aria-hidden="true"
  width={60}
  height={60}
  className="absolute bottom-0 right-0 z-10 pointer-events-none select-none"
/>
```

**Key details:**
- `alt=""` and `aria-hidden="true"` — decorative images, accessibility best practice
- `pointer-events-none select-none` — overlays don't interfere with Quick View button hover or Wishlist button click
- `z-10` — positions above the product image but below z-20 (WishlistButton)
- The existing WishlistButton uses `z-20`, Quick View uses no z-index — corners at z-10 sit between image and wishlist
- Width/height 60px is a starting estimate — actual dimensions depend on the PNG assets; adjust after visual verification

### Anti-Patterns to Avoid

- **Shopify Admin rename as PRDS-01 fix:** State.md already flags this as "not required" — code-side is preferred and avoids admin access dependency.
- **API-side query filter for test products:** The Shopify Storefront API `query` string supports `tag_not` but NOT title exclusion with negation syntax (`-title:"ring"` is not documented). The only supported negation is `tag_not`. Code-side filtering is reliable and avoids tagging all test products in admin.
- **API-side filter for imageless products:** Shopify Storefront API has no `has_image:true` filter parameter. Client-side array filter is the only option.
- **Modifying `quick-view-modal.tsx` vendor display independently:** The quick view also renders `product.vendor` (line 175). It must also use `normalizeVendor()` — don't miss it.
- **Only filtering in `featured-products.tsx`:** Test products and imageless products appear in collection pages (`collection-content.tsx`) and related products (`related-products.tsx`) too. All three call sites must be updated.
- **Wishlist page:** `app/wishlist/page.tsx` also renders `<ProductCard>`. Since wishlisted products come from client-side Zustand store (already-viewed products), filtering test products there is lower priority, but the vendor display fix in `product-card.tsx` covers it automatically.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Vendor display mapping | Complex config system or CMS lookup | Simple `Record<string, string>` constant in `lib/product-filters.ts` | Only one override needed; YAGNI |
| Test product detection | ML or fuzzy matching | Exact `Set` with `.toLowerCase().trim()` | Known finite list of test titles |
| Image overlay | CSS `::before` pseudo-element | `next/image` with `absolute` positioning | Consistent with project's existing image pattern; `next/image` handles optimization |

**Key insight:** Every requirement in this phase is a filter or display transform on data already fetched. No new API calls, no new data shapes, no new state management.

---

## Common Pitfalls

### Pitfall 1: Missing quick-view-modal.tsx vendor fix
**What goes wrong:** Vendor reads "My Store" in the Quick View modal even after product-card and product-info are fixed.
**Why it happens:** `quick-view-modal.tsx` line 173-176 renders `product.vendor` directly, independent of the card and detail page.
**How to avoid:** The `normalizeVendor()` call must be applied in `quick-view-modal.tsx` as well.
**Warning signs:** Product card shows "Wildenflower" but Quick View button opens modal showing "My Store".

### Pitfall 2: collection-content.tsx filteredProducts is a useMemo
**What goes wrong:** Adding a filter outside the `useMemo` causes stale data or doesn't re-run on filter change.
**Why it happens:** `filteredProducts` is computed inside `useMemo` with `[collection, searchQuery, searchParams, ...]` as dependencies. The test/image filter must be the FIRST operation inside that memo, before any other filter logic.
**How to avoid:** Put `.filter((p) => !isTestProduct(p) && hasProductImage(p))` as the first step when initializing `products` inside the `useMemo` callback (line 79 of `collection-content.tsx`).
**Warning signs:** Test products reappear after applying sort or search filters.

### Pitfall 3: Corner image z-index conflict
**What goes wrong:** Corner overlays cover the WishlistButton heart icon or interfere with the Quick View button hover.
**Why it happens:** WishlistButton is already at `z-20`. Quick View button is positioned `absolute bottom-4 left-1/2` without explicit z-index.
**How to avoid:** Use `z-10` for corners (above image, below z-20 wishlist). Keep corners `pointer-events-none` so they don't intercept clicks.
**Warning signs:** Wishlist button becomes unclickable; Quick View hover animation breaks.

### Pitfall 4: Imageless products in "all" collection
**What goes wrong:** Products with no image appear on `/collections/all` but not on category collection pages.
**Why it happens:** The "all" collection uses `getProducts({ first: 250 })` — a separate code path from `getCollectionByHandle`. Both paths feed `collection-content.tsx` which does the client-side filtering, so the fix to `collection-content.tsx` covers both paths. However, `featured-products.tsx` fetches independently with its own `getProducts` call and must also filter.
**How to avoid:** Apply the image guard in BOTH `featured-products.tsx` (RSC, server-side filter) AND `collection-content.tsx` (client-side useMemo filter).

### Pitfall 5: PRDS-02 requires title matching to stay future-proof
**What goes wrong:** New test products added to Shopify admin appear in the storefront until code is manually updated.
**Why it happens:** The test-title `Set` approach is brittle for new test products.
**How to avoid (recommended):** Keep the current title-based approach for known products ("ring", "Generic Tiedye"). Document in a code comment that test products should be tagged in Shopify admin with a `test-product` tag — then the filter can be extended to also filter `tag: 'test-product'` for robustness.
**Warning signs:** New placeholder product ("test", "sample") shows up in grids.

---

## Code Examples

### Complete `lib/product-filters.ts`

```typescript
// Source: codebase analysis — addresses PRDS-01, PRDS-02, PRDS-03
import type { ShopifyProduct } from '@/types/shopify';

// PRDS-01: Vendor display normalization
// Maps known incorrect Shopify vendor values to correct brand display names.
const VENDOR_OVERRIDES: Record<string, string> = {
  'My Store': 'Wildenflower',
};

export function normalizeVendor(vendor: string): string {
  return VENDOR_OVERRIDES[vendor] ?? vendor;
}

// PRDS-02: Test product detection
// Exact title match (case-insensitive) for known placeholder/test products.
// To add robustness: tag test products in Shopify admin with 'test-product'
// and extend this filter to also check product.tags.includes('test-product').
const TEST_PRODUCT_TITLES = new Set([
  'ring',
  'generic tiedye',
]);

export function isTestProduct(product: Pick<ShopifyProduct, 'title'>): boolean {
  return TEST_PRODUCT_TITLES.has(product.title.toLowerCase().trim());
}

// PRDS-03: Image presence guard
// In this codebase, product-card uses images.edges[0] as the featured image.
// There is no separate featuredImage field in the current PRODUCT_FRAGMENT.
export function hasProductImage(
  product: Pick<ShopifyProduct, 'images'>
): boolean {
  return product.images.edges.length > 0;
}

// Combined guard: apply this single filter to hide test and imageless products
export function isShowableProduct(
  product: Pick<ShopifyProduct, 'title' | 'images'>
): boolean {
  return !isTestProduct(product) && hasProductImage(product);
}
```

### featured-products.tsx update (RSC, server component)

```tsx
// Source: codebase analysis
import { isShowableProduct } from '@/lib/product-filters';

// Inside FeaturedProducts():
const products = data.products.edges
  .map((edge) => edge.node)
  .filter(isShowableProduct);   // replaces the products.length === 0 check only
```

### collection-content.tsx filteredProducts useMemo update

```tsx
// Source: codebase analysis — inside the filteredProducts useMemo
import { isShowableProduct } from '@/lib/product-filters';

const filteredProducts = useMemo(() => {
  // First: remove test and imageless products before any other filtering
  let products = collection.products.edges
    .map(({ node }) => node)
    .filter(isShowableProduct);   // <-- ADD THIS

  // Then existing filters (search, price, type, tags, category, sort) follow...
  if (searchQuery.trim()) { ... }
  // etc.
}, [collection, searchQuery, searchParams, ...]);
```

### related-products.tsx update

```tsx
// Source: codebase analysis
import { isShowableProduct } from '@/lib/product-filters';

products = response.products.edges
  .map((edge) => edge.node)
  .filter(isShowableProduct)
  .filter((p) => p.id !== currentProductId)
  .slice(0, 4);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Shopify Admin vendor rename | Code-side `normalizeVendor()` display override | Phase 13 | No admin access required; decoupled from Shopify data |
| Show all fetched products (including test junk) | `isTestProduct()` filter at render time | Phase 13 | Clean storefront without touching Shopify Admin |
| Render "No image" placeholder div | `hasProductImage()` guard filters before render | Phase 13 | No broken grey boxes or fallback text in grids |
| Plain rounded card corners | Botanical PNG corner overlays via `next/image` | Phase 13 | Wildenflower brand identity on every card |

---

## Open Questions

1. **Corner overlay image dimensions**
   - What we know: Files confirmed at `public/assets/images/corners/card-corner-topleft.png` and `card-corner-bottomright.png`. Asset sizes not yet inspected.
   - What's unclear: The natural pixel dimensions of the PNGs — if they're large (e.g., 400x400), using `width={60} height={60}` will crop the image unexpectedly.
   - Recommendation: During implementation, inspect image dimensions with `file` or open in browser. Use `width`/`height` matching the natural size and control display size via Tailwind `w-` class, or use `fill` with `object-contain` inside a sized wrapper. Alternatively, use CSS `width: 60px; height: auto` via `className`.

2. **PRDS-02 future robustness**
   - What we know: "ring" and "Generic Tiedye" are the only named test products in requirements.
   - What's unclear: Whether more test products exist in the Shopify store under different names.
   - Recommendation: During implementation, document the `TEST_PRODUCT_TITLES` set with a comment encouraging the team to also tag test products in Shopify admin with `test-product` tag for long-term maintainability.

3. **Wishlist page vendor display**
   - What we know: `app/wishlist/page.tsx` renders `<ProductCard>` for wishlisted products. `ProductCard` is the component being fixed.
   - What's unclear: Whether wishlist items from Zustand (client-stored `ShopifyProduct` objects) need the filter applied too.
   - Recommendation: The `normalizeVendor()` fix in `product-card.tsx` automatically covers the wishlist page. No separate fix needed. The image/test-product filter does NOT apply to the wishlist page (user intentionally saved the product). This is correct behavior.

---

## Sources

### Primary (HIGH confidence)
- Codebase direct inspection — `components/product-card.tsx`, `components/product-info.tsx`, `components/quick-view-modal.tsx`, `components/featured-products.tsx`, `components/collection-content.tsx`, `components/related-products.tsx`, `lib/shopify-queries.ts`, `lib/shopify-helpers.ts`, `types/shopify.ts`
- `public/assets/images/corners/` — Confirmed both `card-corner-topleft.png` and `card-corner-bottomright.png` exist

### Secondary (MEDIUM confidence)
- [Shopify Storefront API products query — 2025-01](https://shopify.dev/docs/api/storefront/2025-01/queries/products) — Confirmed: no `has_image` filter; `vendor:` filter works but only for inclusion; `tag_not:` is the only exclusion filter; no title negation syntax
- [Shopify Filter products in a collection with the Storefront API](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/products-collections/filter-products) — Confirmed collection-level filter syntax

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; all patterns use existing project conventions
- Architecture: HIGH — direct codebase read; all insertion points and data shapes verified
- Pitfalls: HIGH — identified from actual code structure (useMemo, z-index values, separate code paths for "all" collection)

**Research date:** 2026-02-26
**Valid until:** 2026-03-28 (30 days — codebase is stable, no external API changes expected)
