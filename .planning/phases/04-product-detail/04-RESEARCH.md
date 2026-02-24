# Phase 4: Product Detail - Research

**Researched:** 2026-02-24
**Domain:** Next.js App Router page + React component restyling — no new libraries needed
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### BotanicalHeader variant & placement
- Use the **small variant** (botanical-header-small.png) — compact, doesn't dwarf product content, brand stamp feel
- BotanicalHeader goes **above breadcrumbs** — brand identity leads, navigation follows
- Breadcrumb bar becomes **bg-parchment** (no white) — flows naturally after the header, no jarring white interruption
- Main product content area changes from bg-gray-50 to **bg-parchment** — consistent with homepage and rest of site

#### Card & section backgrounds
- **Keep white cards** (`bg-white rounded-lg shadow-sm`) on the parchment background — layered "paper on linen" look, clean and readable
- Update text colors in accordion/reviews sections from gray-900/gray-700 to **inkBrown/earth palette** — consistent with the rest of the site

#### Add to Cart button & product info styling
- Add to Cart button: **terracotta fill** (`bg-terracotta`) with white text — warm, action-forward, matches primary accent used throughout
- Product title: **Playfair Display, inkBrown** — heading font for the product name
- Product price: **Lora, terracotta** — body font with terracotta accent, warm and readable
- Variant selector selected/active states: **forest border + forest text** — clear botanical active state

#### Related products heading
- "You May Also Like" — **restyle only**: Playfair Display + inkBrown text
- No wording change — familiar phrase kept, just correct font and color applied

### Claude's Discretion
- Exact Tailwind class choices within the palette (e.g., `text-inkBrown` vs `text-earth`)
- Hover states on variant selectors and secondary interactive elements
- Breadcrumb text color (inkBrown or sage — whichever reads best on parchment)
- Shadow/border adjustments on white cards against parchment

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROD-01 | Product detail page typography and colors updated to inherit from Wildenflower design tokens | Tokens confirmed live in globals.css @theme inline block. Tailwind classes `bg-parchment`, `text-ink-brown`, `text-terracotta`, `text-forest`, `font-playfair`, `font-lora` all available. Component-by-component audit complete below. |
| PROD-02 | BotanicalHeader (small or large variant) placed at top of product detail page | `BotanicalHeader` component confirmed at `components/ui/botanical-header.tsx`. `small` variant maps to `/assets/images/headers/botanical-header-small.png` which exists in `public/`. Server component import into `app/products/[handle]/page.tsx` is safe — BotanicalHeader is `'use client'` but that is fine to use in a server component as a child. |
</phase_requirements>

---

## Summary

Phase 4 is a targeted restyling of the product detail page — no structural changes, no new dependencies, no logic modifications. The design foundation (Phase 1) already provides every token needed: `bg-parchment`, `text-ink-brown`, `text-terracotta`, `text-forest`, `bg-terracotta`, `font-playfair`, `font-lora` are all registered in `globals.css` under `@theme inline` and resolved via Tailwind 4's CSS variable system.

The product detail surface spans six files: the page shell (`app/products/[handle]/page.tsx`), plus five components (`product-info.tsx`, `add-to-cart-button.tsx`, `variant-selector.tsx`, `product-accordion.tsx`, `review-list.tsx`). Each contains explicit gray/blue color classes that need surgical replacement. The `sticky-add-to-cart.tsx` component also uses `bg-primary-600` for the add-to-cart state and needs updating for consistency.

The BotanicalHeader component is already built and production-ready. The `small` variant asset (`botanical-header-small.png`) is confirmed present in `public/assets/images/headers/`. Inserting it above the breadcrumb bar in the page shell requires two lines of code — one import, one JSX element — and no props beyond `variant="small"`.

**Primary recommendation:** Two plans suffice — Plan 1: page shell + BotanicalHeader + breadcrumb/background changes; Plan 2: component-level typography and color updates across product-info, add-to-cart-button, variant-selector, product-accordion, review-list, and sticky-add-to-cart.

---

## Standard Stack

### Core (no new installs needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS 4 | 4.x (in use) | Utility classes for all color/font changes | Already configured with botanical tokens |
| Next.js App Router | 16.1.1 (in use) | Server component page shell | Already in use |
| `components/ui/botanical-header.tsx` | (project-local) | BotanicalHeader image — small variant | Already built and tested in Phase 3 pattern |

### Supporting (already present, no install)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next/image` | (bundled) | Already used inside BotanicalHeader | No action needed |
| React 19 | (in use) | Client components for interactive product UI | No action needed |

**Installation:**
```bash
# No new packages required
```

---

## Architecture Patterns

### Recommended Project Structure (unchanged)

```
app/products/[handle]/
└── page.tsx              # Server component — shell changes here (BotanicalHeader, bg, breadcrumb wrapper)

components/
├── product-info.tsx       # Client — title, price, variant, add-to-cart wiring
├── add-to-cart-button.tsx # Client — CTA button color change
├── variant-selector.tsx   # Client — selected state colors
├── product-accordion.tsx  # Client — accordion text colors
├── sticky-add-to-cart.tsx # Client — mobile CTA color change
└── reviews/
    └── review-list.tsx    # Client — review section text colors

components/ui/
└── botanical-header.tsx   # Already complete — import and use
```

### Pattern 1: BotanicalHeader insertion in page shell

**What:** Import `BotanicalHeader` (server-safe, client component used as child) at the top of the product page fragment, before the breadcrumb `div`.
**When to use:** PROD-02 requirement.
**Example:**

```tsx
// app/products/[handle]/page.tsx
import { BotanicalHeader } from '@/components/ui/botanical-header';

// In JSX, replacing current opening:
return (
  <>
    {/* ...structured data, tracker... */}

    {/* Botanical Brand Header — above breadcrumbs */}
    <BotanicalHeader variant="small" />

    <div className="min-h-screen bg-parchment">
      {/* Breadcrumbs — parchment bg, no white bar */}
      <div className="bg-parchment border-b border-gold/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs product={product} />
        </div>
      </div>
      {/* ...rest of content... */}
    </div>
  </>
);
```

### Pattern 2: Color token substitution in client components

**What:** Direct Tailwind class swap — gray/blue → botanical palette. No logic changes.
**When to use:** PROD-01 requirement across all five components.

Key substitutions established by prior phases:

| Old class | New class | Notes |
|-----------|-----------|-------|
| `text-gray-900` | `text-ink-brown` | Primary text (headings, strong) |
| `text-gray-700` / `text-gray-600` | `text-earth` or `text-ink-brown` | Secondary/body text |
| `text-gray-500` | `text-sage` | Muted/meta text |
| `bg-gray-50` | `bg-parchment` | Page/section backgrounds |
| `bg-gray-100` | `bg-parchment` or `bg-white` | Depends on context |
| `bg-blue-600` | `bg-terracotta` | Primary CTA button |
| `bg-blue-400` (loading) | `bg-terracotta/70` | Loading state of CTA |
| `hover:bg-blue-700` | `hover:bg-terracotta/90` | CTA hover |
| `border-blue-600` (selected) | `border-forest` | Variant selected border |
| `bg-blue-600 text-white` (selected) | `border-forest bg-forest/10 text-forest` | Variant selected (outlined look) |
| `bg-primary-600` | `bg-terracotta` | StickyAddToCart button |
| `text-neutral-900` | `text-ink-brown` | StickyAddToCart product title |
| `border-gray-200` | `border-gold/30` | Dividers on parchment |
| `divide-neutral-200` | `divide-gold/20` | Accordion dividers |

### Pattern 3: Breadcrumb restyling (visual only, no logic)

```tsx
// components/breadcrumbs.tsx — only class changes needed
<nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
  <Link href="/" className="text-sage hover:text-ink-brown transition-colors">Home</Link>
  <span className="text-sage">/</span>
  {/* ... */}
  <span className="text-ink-brown font-medium line-clamp-1">{product.title}</span>
</nav>
```

### Anti-Patterns to Avoid

- **Touching Shopify query logic or cart store:** `useCartStore`, `addToCart`, `getProductByHandle`, `getAllProductsHandles` — untouched
- **Modifying `generateStaticParams` or `generateMetadata`:** pure SEO/data logic — untouched
- **Changing variant selection logic in VariantSelector:** `handleOptionChange`, `isOptionAvailable` — untouched
- **Changing review fetch logic in ReviewList:** `fetchReviews`, `handleHelpful` — untouched
- **Removing `bg-white` from cards:** decision locked — keep white cards on parchment

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Botanical header image | Custom img element | `BotanicalHeader` component | Already handles aspect ratio, fill, priority, sizes, responsive max-width |
| Color tokens | Hardcoded hex values | Tailwind `bg-terracotta`, `text-ink-brown`, etc. | Tokens defined in `globals.css` @theme — guaranteed consistency |

**Key insight:** Every visual element needed already exists as a token or component. This phase is purely class substitution and one JSX insertion.

---

## Common Pitfalls

### Pitfall 1: Variant selector selected state — blue fill vs. botanical outline

**What goes wrong:** The current selected state is `bg-blue-600 text-white` (solid fill). Simply swapping to `bg-forest text-white` works but loses the "paper on linen" layering aesthetic.
**Why it happens:** Direct color swap without considering visual intent.
**How to avoid:** Use `border-2 border-forest bg-forest/10 text-forest` for selected — an outlined chip on parchment. Unselected stays `border-gold/40 bg-white text-ink-brown hover:border-forest`.
**Warning signs:** If selected variant chips look heavy/loud against parchment background.

### Pitfall 2: `text-gray-900` surviving in ReviewList

**What goes wrong:** ReviewList is long (~240 lines) with many `text-gray-900` and `text-gray-600` instances scattered across rating stats, review cards, filter buttons, and the sort select. Easy to miss one.
**Why it happens:** Dense component with many repeated class patterns.
**How to avoid:** Systematic search-and-replace pass — grep for `gray-` in the file before declaring done.
**Warning signs:** Gray text visible in reviews section against parchment when dev server is running.

### Pitfall 3: StickyAddToCart `bg-primary-600` — the mobile CTA

**What goes wrong:** `sticky-add-to-cart.tsx` uses `bg-primary-600 hover:bg-primary-700 active:bg-primary-800` (Cosmic Purple) for the mobile sticky button. It is out of viewport during desktop review but will be visible on mobile — easy to forget.
**Why it happens:** StickyAddToCart is mobile-only (`lg:hidden`) so it doesn't show during typical desktop verification.
**How to avoid:** Include sticky-add-to-cart in the plan's component list explicitly. Test at mobile viewport width.
**Warning signs:** Purple button visible in mobile simulation of Chrome DevTools.

### Pitfall 4: `bg-gray-50` in `review-list.tsx` rating stats block

**What goes wrong:** The rating stats panel uses `bg-gray-50 p-6 rounded-lg` as a container background. On a parchment page, this creates a nested slightly-warm-gray box which clashes.
**Why it happens:** The inner panel has its own background that won't inherit from the outer parchment change.
**How to avoid:** Change `bg-gray-50` to `bg-white` (keeps the "white card on parchment" layered look, consistent with locked decision to keep white cards).

### Pitfall 5: BotanicalHeader is `'use client'` — don't call hooks in page

**What goes wrong:** BotanicalHeader has `'use client'` directive. If someone adds hooks to the page shell (server component), it breaks.
**Why it happens:** Confusion about import direction.
**How to avoid:** Import BotanicalHeader into the server page as a leaf component. No hooks needed — just `<BotanicalHeader variant="small" />`. This is the same pattern used on the homepage.

---

## Code Examples

### Page shell with BotanicalHeader inserted (PROD-02)

```tsx
// app/products/[handle]/page.tsx — simplified diff
import { BotanicalHeader } from '@/components/ui/botanical-header';

// return:
return (
  <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <RecentlyViewedTracker product={product} />

    {/* PROD-02: Botanical brand stamp above breadcrumbs */}
    <BotanicalHeader variant="small" />

    {/* PROD-01: parchment bg replaces bg-gray-50 */}
    <div className="min-h-screen bg-parchment">
      {/* Breadcrumbs — parchment instead of white */}
      <div className="bg-parchment border-b border-gold/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs product={product} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <ImageGallery product={product} />
          <ProductInfo product={product} />
        </div>

        {/* Keep white cards on parchment — "paper on linen" */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6 lg:p-8">
          <ProductAccordion sections={getProductAccordionSections({...})} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8 mt-12">
          <ReviewList productId={product.handle} />
        </div>

        {/* PROD-01: Related products heading — Playfair + inkBrown */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-ink-brown mb-6">
            You May Also Like
          </h2>
          <Suspense fallback={...}>
            <RelatedProducts ... />
          </Suspense>
        </div>
      </div>
    </div>
  </>
);
```

### ProductInfo key class changes (PROD-01)

```tsx
// components/product-info.tsx — key changes only

// Title: font-bold already triggers Playfair via globals.css h1 rule
<h1 className="text-3xl sm:text-4xl font-bold text-ink-brown mb-2">

// Vendor line
<p className="text-lg text-sage">by {product.vendor}</p>

// Price border
<div className="border-t border-b border-gold/30 py-4">

// Price value: Lora is body font (already set on body); terracotta color
<span className="text-3xl font-bold text-terracotta">

// Category/tags section border
<div className="border-t border-gold/30 pt-6 space-y-3">

// Category label
<span className="font-semibold text-ink-brown">Category:</span>
<span className="text-earth">{product.productType}</span>

// Tags
<span className="bg-parchment text-ink-brown px-3 py-1 rounded-full text-xs border border-gold/30">
```

### AddToCartButton class changes (PROD-01)

```tsx
// components/add-to-cart-button.tsx
// Available → terracotta fill
'bg-terracotta text-white hover:bg-terracotta/90 active:scale-95'
// Loading → terracotta muted
'bg-terracotta/60 text-white cursor-wait'
// Unavailable → keep gray (semantic)
'bg-gray-300 text-gray-500 cursor-not-allowed'
```

### VariantSelector class changes (PROD-01)

```tsx
// components/variant-selector.tsx — selected state
isSelected
  ? 'border-2 border-forest bg-forest/10 text-forest'
  : isAvailable
    ? 'border border-gold/40 bg-white text-ink-brown hover:border-forest hover:text-forest'
    : 'border border-gold/20 bg-parchment text-sage cursor-not-allowed line-through'
```

### ProductAccordion class changes (PROD-01)

```tsx
// components/product-accordion.tsx
// Dividers
'divide-y divide-gold/20 border-t border-b border-gold/20'
// Button text
<span className="text-base font-semibold text-ink-brown">
// Chevron icon
className={`w-5 h-5 text-sage transition-transform duration-200 ...`}
// Content text
'prose prose-sm max-w-none text-earth'
```

### StickyAddToCart class changes (PROD-01)

```tsx
// components/sticky-add-to-cart.tsx
// Container border
'bg-white border-t border-gold/30 shadow-lg'
// Product title
<p className="text-sm font-medium text-ink-brown truncate">
// Price
<span className="text-lg font-bold text-ink-brown">
// CTA button
showSuccess
  ? 'bg-sage'
  : selectedVariant.availableForSale
    ? 'bg-terracotta hover:bg-terracotta/90 active:bg-terracotta/80'
    : 'bg-neutral-400 cursor-not-allowed'
```

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| Tailwind v3 `tailwind.config.js` theme extension | Tailwind 4 `@theme inline` in `globals.css` | Already migrated in Phase 1 |
| `next/font` with CSS variable forwarding | Phase 1 complete — `--font-playfair` and `--font-lora` registered | h1-h6 auto-get Playfair via globals.css rule |

**Key insight about globals.css h1-h6 rule:** Because globals.css already sets `h1, h2, h3, h4, h5, h6 { font-family: var(--font-playfair), Georgia, serif; font-weight: 700; }`, any `<h1>` or `<h2>` element on the product page will automatically use Playfair Display. The `font-bold` Tailwind class on those elements already triggers this. No `font-playfair` class needs to be added explicitly to heading elements — only to non-heading elements that should display in Playfair.

---

## Open Questions

1. **ImageGallery component styling**
   - What we know: `ImageGallery` is used in the product page but was not audited
   - What's unclear: Whether it contains explicit gray/blue classes that would be visible (thumbnail borders, navigation arrows, etc.)
   - Recommendation: Read `components/image-gallery.tsx` during Plan 1 execution; include in scope if gray colors are visible. It is likely thumbnail border colors and navigation — minor if present.

2. **WishlistButton styling on parchment**
   - What we know: WishlistButton uses `!bg-white hover:!bg-gray-50 !text-gray-400 hover:!text-red-500` via overrides in ProductInfo
   - What's unclear: Whether `hover:!bg-gray-50` on parchment looks jarring (gray flash on hover)
   - Recommendation: During discretion — change `hover:!bg-gray-50` to `hover:!bg-parchment` for smooth hover on parchment. Simple one-word swap.

3. **ReviewForm component inside ReviewList**
   - What we know: ReviewList renders `<ReviewForm>` — this was not audited
   - What's unclear: ReviewForm's own color classes
   - Recommendation: Read `components/reviews/review-form.tsx` during Plan 2 execution. Submit button likely uses blue/primary — needs terracotta. Form inputs already inherit from globals.css.

4. **SizeGuideModal colors**
   - What we know: SizeGuideModal is rendered conditionally from ProductInfo
   - What's unclear: Modal content styling
   - Recommendation: Read `components/size-guide-modal.tsx` during Plan 2. Modal overlay and content likely use gray backgrounds — low priority since it's conditional and infrequently visible.

---

## File Inventory (complete list of files to touch)

**Plan 1 — Page shell + BotanicalHeader:**
- `app/products/[handle]/page.tsx` — BotanicalHeader import, bg-gray-50 → bg-parchment, breadcrumb wrapper bg change, "You May Also Like" heading color, border-b color
- `components/breadcrumbs.tsx` — link text colors gray → sage/inkBrown

**Plan 2 — Component typography & colors:**
- `components/product-info.tsx` — title, price, vendor, borders, tags, meta colors
- `components/add-to-cart-button.tsx` — CTA button bg-blue → bg-terracotta
- `components/variant-selector.tsx` — selected state border-blue → border-forest
- `components/product-accordion.tsx` — dividers, text colors
- `components/sticky-add-to-cart.tsx` — bg-primary-600 → bg-terracotta
- `components/reviews/review-list.tsx` — all gray color classes, bg-gray-50 stats panel
- *Investigate during plan:* `components/image-gallery.tsx`, `components/reviews/review-form.tsx`, `components/size-guide-modal.tsx`

---

## Sources

### Primary (HIGH confidence)

- Codebase direct read — `app/products/[handle]/page.tsx` — complete page structure audited
- Codebase direct read — `app/globals.css` — confirmed all botanical tokens in `@theme inline`: `--color-parchment`, `--color-terracotta`, `--color-gold`, `--color-sage`, `--color-forest`, `--color-ink-brown`, `--color-earth`; fonts `--font-playfair`, `--font-lora`; globals.css h1-h6 rule
- Codebase direct read — `components/ui/botanical-header.tsx` — component API confirmed: `variant?: 'large' | 'small' | 'faq' | 'blog'`
- Codebase direct read — all six target components (product-info, add-to-cart-button, variant-selector, product-accordion, review-list, sticky-add-to-cart)
- Filesystem check — `public/assets/images/headers/botanical-header-small.png` confirmed present

### Secondary (MEDIUM confidence)

- Phase 1–3 accumulated decisions in STATE.md — pattern `bg-parchment + text-forest + text-ink-brown + text-gold` established as site section pattern

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; all tokens confirmed live in codebase
- Architecture: HIGH — six files audited with exact class inventories; clear before/after mapping
- Pitfalls: HIGH — each pitfall derived from direct code inspection, not inference

**Research date:** 2026-02-24
**Valid until:** 2026-03-25 (stable — no external dependencies, all internal code)
