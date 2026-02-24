# Phase 3: Homepage - Research

**Researched:** 2026-02-24
**Domain:** Next.js component visual migration — Tailwind CSS 4, botanical design system
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Hero section
- **Keep EnhancedHero** — do NOT replace with HeroCard component (user found two stacked heroes "too much")
- Background image: replace current `/images/hero-background.png` with `/assets/images/headers/botanical-header-large.png`
- Main heading (H1): **"Made by hand. Found by heart."** — replace "Embrace Your Wild Beauty"
- Subheading: Claude writes new botanical copy in warm Wildenflower voice — replace psychedelic "Handpicked treasures for the untamed spirit" text
- CTAs: Update labels to Wildenflower voice (e.g. "Wander the Shop" / "Our Story") — Claude's discretion
- Trust badges ("Free Shipping Over $75" etc.): keep as-is, no changes

#### Category section
- Section heading: **"Find Your Wild"** — replace "Trippy Treasures Await"
- Section subheading: Claude writes warm, unhurried Wildenflower copy — replace "Explore our groovy collections of handcrafted wearable art"
- Category card descriptions: Botanical rewrites in Wildenflower voice — replace psychedelic copy ("Psychedelic swirls and festival-ready vibes" etc.)
- Category images: Use botanical assets from `/assets/images/` — Claude assigns appropriate image per category. If no suitable per-category asset exists, a consistent botanical fallback is fine
- Card grid structure (4 columns, hover effects): keep as-is — visual changes only

#### BotanicalDividers
- Insert BotanicalDivider components at 3 placements: after hero section, after category section, after featured products section
- Use different variants for each placement — variety feels organic
- Variant assignment: Claude's discretion (5 available: fern-mushroom, wildflower, vine-trail, mushroom-cluster, fern-spiral)

#### Featured products section
- Section heading changes to **"Freshly Gathered"** — this is the only change to FeaturedProducts
- Product grid structure, card layout, Shopify data fetching: untouched

#### Page background
- Root wrapper `<div className="min-h-screen bg-neutral-50">` → change `bg-neutral-50` to `bg-[#F5EDD6]` (parchment token)
- Remove `bg-zinc-50` override from PersonalizedRecommendations wrapper in page.tsx so parchment shows through

#### Non-scoped sections
- BrandStory, TrustBar, TestimonialCarousel, InstagramGallery, NewsletterSignup: no changes this phase beyond parchment bg inheritance
- These sections will inherit parchment from the root wrapper — that is the full extent of their treatment

### Claude's Discretion
- Exact botanical subheading copy for EnhancedHero
- Exact botanical CTA labels for EnhancedHero
- Exact Wildenflower-voice descriptions for each category card
- Which botanical asset from `/assets/images/` to assign to each category
- BotanicalDivider variant for each of the 3 placements

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HOME-01 | Page background updated from neutral-50 to parchment | Change `bg-neutral-50` to `bg-[#F5EDD6]` on root div in `app/page.tsx`. Remove `bg-zinc-50` from PersonalizedRecommendations wrapper. Parchment token is `#F5EDD6`, confirmed in globals.css `@theme inline`. |
| HOME-02 | EnhancedHero updated with botanical image and Wildenflower copy (NOT HeroCard) | `EnhancedHero` in `components/homepage/enhanced-hero.tsx` accepts `heading`, `subheading`, `ctas`, `backgroundImage` as props — all passed from `app/page.tsx`. All copy changes happen at the call site; no component modification needed. |
| HOME-03 | Category section colors and typography updated to Wildenflower palette | `CategoryCards` component is self-contained in `components/homepage/category-cards.tsx`. Needs: section bg `bg-white` → `bg-parchment` or transparent, heading text → `text-forest`, subheading and card description copy rewritten, category images replaced with botanical assets. CTA color `text-primary-300` → `text-gold`. |
| HOME-04 | BotanicalDivider components added after hero, after categories, after featured products | `BotanicalDivider` is in `components/ui/botanical-divider.tsx` (already built, `'use client'`). Insertion points are in `app/page.tsx`. All 5 divider PNG assets confirmed present in `public/assets/images/dividers/`. |
| HOME-05 | Featured products section heading updated to "Freshly Gathered" | `FeaturedProducts` component in `components/featured-products.tsx` has hardcoded heading "Featured Products". Change to "Freshly Gathered" and update adjacent "View All" link color from `text-blue-600` to Wildenflower token. |
</phase_requirements>

---

## Summary

Phase 3 is a pure visual migration — no new libraries, no new components, no Shopify integration changes. Every requirement maps to a targeted edit in 2–3 files: `app/page.tsx` (layout + BotanicalDivider insertion + parchment background), `components/homepage/enhanced-hero.tsx` props at call site, `components/homepage/category-cards.tsx` (copy + image + color tokens), and `components/featured-products.tsx` (heading only).

The design system is already complete from Phase 1: Tailwind 4 `@theme inline` block in `globals.css` exposes `bg-parchment`, `text-forest`, `text-terracotta`, `text-gold`, `text-ink-brown`, `text-sage`, `text-earth` as utility classes. The botanical divider component and all 5 divider PNG assets are present and confirmed. No installation is needed.

The one structural nuance: `BotanicalDivider` is a `'use client'` component. It can be imported directly into the server-component `page.tsx` — Next.js handles the client boundary automatically when a client component is imported into a server component.

**Primary recommendation:** Plan three tasks — (1) page.tsx: background + BotanicalDividers, (2) EnhancedHero copy + image update, (3) CategoryCards copy + colors + images, then a final single-line FeaturedProducts heading fix.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.1 | App router, page.tsx, server/client components | Already in project |
| Tailwind CSS | 4.x | Utility classes for color/typography | Phase 1 already extended with Wildenflower tokens |
| next/image | (bundled) | Optimized image rendering for botanical assets | Already used throughout |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| BotanicalDivider | (local) | Botanical PNG dividers between sections | All 3 placements in page.tsx |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `bg-[#F5EDD6]` arbitrary value | `bg-parchment` Tailwind token | Both work — `bg-parchment` is cleaner; verify Tailwind 4 `@theme inline` token is recognized in utility classes before assuming |

**Installation:**
```bash
# No new packages needed — everything already installed
```

---

## Architecture Patterns

### Recommended Project Structure
```
app/
└── page.tsx              # HOME-01, HOME-04 — background + divider insertions

components/
├── homepage/
│   ├── enhanced-hero.tsx # HOME-02 — props passed from page.tsx (no file edit needed for copy)
│   └── category-cards.tsx # HOME-03 — copy, colors, images
└── featured-products.tsx  # HOME-05 — heading only
```

### Pattern 1: Props-at-call-site (EnhancedHero)
**What:** All copy and visual props for `EnhancedHero` are passed from `app/page.tsx`. The component accepts `heading`, `subheading`, `ctas`, `backgroundImage`. Zero changes needed to the component file itself.
**When to use:** Whenever a component is already prop-driven — change the caller, not the callee.
**Example:**
```typescript
// In app/page.tsx — change these props only:
<EnhancedHero
  heading="Made by hand. Found by heart."
  subheading="[new botanical copy — Claude's discretion]"
  backgroundImage="/assets/images/headers/botanical-header-large.png"
  ctas={[
    { label: 'Wander the Shop', href: '/collections', variant: 'primary' },
    { label: 'Our Story', href: '#brand-story', variant: 'secondary' },
  ]}
/>
```
Note: The `overlayOpacity` prop defaults to `50`. For a botanical image (not a dark lifestyle photo), a lower overlay (e.g. `30`) may improve legibility — Claude's discretion.

### Pattern 2: Client component in server page
**What:** `BotanicalDivider` is `'use client'`. Importing it into `app/page.tsx` (a server component) is valid — Next.js renders the client subtree on the client without making the whole page a client component.
**When to use:** Any time an existing `'use client'` UI primitive is needed in a server layout.
**Example:**
```typescript
// app/page.tsx (server component) — just import and use:
import { BotanicalDivider } from '@/components/ui/botanical-divider';

// ...
<EnhancedHero ... />
<BotanicalDivider variant="wildflower" />
<CategoryCards />
<BotanicalDivider variant="fern-spiral" />
// ...
<FeaturedProducts />
<BotanicalDivider variant="vine-trail" />
```

### Pattern 3: Inline color token in Tailwind 4
**What:** Tailwind 4 uses `@theme inline` in CSS to expose custom tokens. `bg-parchment`, `text-forest`, `text-terracotta`, `text-gold` etc. are all registered.
**When to use:** All Wildenflower color changes — use semantic tokens not arbitrary hex values where possible.
**Example:**
```typescript
// Category section background:
<section className="bg-parchment py-16 lg:py-24">

// Category heading:
<h2 className="text-3xl font-bold text-forest sm:text-4xl font-heading">
  Find Your Wild
</h2>

// CTA "Explore" link color (was text-primary-300 = psychedelic purple):
<span className="inline-flex items-center text-gold text-sm font-medium ...">
```

### Pattern 4: CategoryCards — static data array edits
**What:** `CategoryCards` uses a hardcoded `categories` array at the top of the file. Image paths and description strings live there. The section background and heading colors are in JSX. All edits are contained to this single file.
**When to use:** All HOME-03 changes happen here.
**Example (structure of changes):**
```typescript
// 1. Update static data array — descriptions and images:
const categories: Category[] = [
  {
    handle: 'tie-dye',
    title: 'Tie-Dye',
    description: '[new botanical copy]',
    image: '/assets/images/headers/botanical-header-small.png', // fallback if no per-category asset
    productCount: 45,
  },
  // ...
];

// 2. Section wrapper — change bg-white:
<section className="bg-parchment py-16 lg:py-24">

// 3. Heading — change text-neutral-900:
<h2 className="text-3xl font-bold text-forest sm:text-4xl font-heading">
  Find Your Wild
</h2>

// 4. Subheading — change text-neutral-600:
<p className="mt-4 text-lg text-ink-brown max-w-2xl mx-auto">
  [new botanical copy]
</p>

// 5. Hover CTA color — change text-primary-300:
<span className="inline-flex items-center text-gold text-sm font-medium ...">

// 6. Hover border — change border-primary-400/50:
<div className="... group-hover:border-gold/50" />
```

### Pattern 5: PersonalizedRecommendations wrapper cleanup
**What:** In `app/page.tsx` the PersonalizedRecommendations wrapper has `className="bg-zinc-50"`. This creates a grey island on the parchment page. Remove the inline bg override so parchment shows through.
**Example:**
```typescript
// Before:
<div className="bg-zinc-50">
  <PersonalizedRecommendations />
</div>

// After:
<div>
  <PersonalizedRecommendations />
</div>
```

### Anti-Patterns to Avoid
- **Editing EnhancedHero component internals for copy changes:** All copy is passed as props from page.tsx — edit only the call site.
- **Using arbitrary hex values when Tailwind tokens exist:** Use `bg-parchment`, `text-forest`, `text-gold` etc. rather than `bg-[#F5EDD6]`.
- **Touching FeaturedProducts product grid or Shopify logic:** Only the `<h2>` text and "View All" link color need changing.
- **Importing BotanicalDivider as default export:** The export is named — `import { BotanicalDivider } from '@/components/ui/botanical-divider'`.
- **Adding BotanicalDividers inside existing section components:** Insert them at the page layout level in `app/page.tsx`, between sections, not inside `CategoryCards` or `FeaturedProducts`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Botanical section dividers | Custom SVG or CSS border | `BotanicalDivider` component + existing PNGs | Component already built, 5 variants confirmed present |
| Image optimization for botanical backgrounds | Raw `<img>` tags | `next/image` with `fill` + `object-cover` | Already pattern used throughout project |
| Wildenflower color tokens | Inline hex values | Tailwind 4 `@theme inline` tokens from globals.css | Phase 1 already set them up — `bg-parchment`, `text-forest`, etc. |

**Key insight:** Every tool needed for this phase already exists in the project. This is assembly work, not construction.

---

## Common Pitfalls

### Pitfall 1: botanical-header-large.png as hero background has no existing overlay tuning
**What goes wrong:** The component's `overlayOpacity` defaults to `50` (50% black overlay). This was calibrated for the psychedelic lifestyle photo. A painterly botanical illustration may read muddy or washed out at the same opacity.
**Why it happens:** Prop defaults weren't adjusted for the new image type.
**How to avoid:** Set `overlayOpacity` to a lower value (e.g. `20`–`30`) when switching to the botanical image. Evaluate visually with dev server.
**Warning signs:** Hero image looks muddy or text is illegible on first render.

### Pitfall 2: BotanicalDivider height is fixed at `h-8` (32px)
**What goes wrong:** The divider renders at 32px height in a `relative` container. On very narrow viewports or between tall sections, the visual rhythm may feel too tight.
**Why it happens:** Component has a fixed `h-8 my-6` class.
**How to avoid:** Accept the defaults. The component was designed for these proportions. Don't override height in this phase — it was accepted in prior phases.
**Warning signs:** Not a problem unless user flags it.

### Pitfall 3: Category images — `/images/category-tiedye.png` and `/images/category-leather.png` paths
**What goes wrong:** Two categories use `/images/` path (old directory) and two use Unsplash URLs. All four need botanical replacements from `/assets/images/`.
**Why it happens:** CategoryCards was built against a mix of local and remote images.
**How to avoid:** Replace all four `image` values in the static `categories` array. Use only local `/assets/images/` paths. For categories without obvious per-category assets, `botanical-header-small.png` or `botanical-header-large.png` is a suitable fallback (user approved).
**Warning signs:** Next.js Image will log a remote hostname error if Unsplash images are removed without updating `next.config.ts` remotePatterns — but since we're REPLACING them with local paths, no config change needed.

### Pitfall 4: `text-primary-300` and `border-primary-400` still reference psychedelic purple
**What goes wrong:** CategoryCard hover states use `text-primary-300` (light purple) and `border-primary-400/50` (purple glow). These survive the copy/text changes and look visually wrong on botanical cards.
**Why it happens:** These are utility classes on the hover animation elements, easy to miss since they only appear on hover.
**How to avoid:** Search `category-cards.tsx` for `primary` and replace: `text-primary-300` → `text-gold`, `border-primary-400/50` → `border-gold/50`.
**Warning signs:** Cards look correct at rest but flash purple on hover.

### Pitfall 5: FeaturedProducts "View All" link still uses `text-blue-600`
**What goes wrong:** The heading change lands correctly but the adjacent "View All →" link stays generic blue.
**Why it happens:** It was never in scope previously.
**How to avoid:** Update `text-blue-600 hover:text-blue-700` to `text-terracotta hover:text-terracotta/80` or similar botanical token in `featured-products.tsx`.
**Warning signs:** Blue link visible next to the "Freshly Gathered" heading.

---

## Code Examples

Verified patterns from codebase inspection:

### HOME-01: Page background + PersonalizedRecommendations wrapper
```typescript
// Source: app/page.tsx (current), lines 76 and 96-98
// Before:
<div className="min-h-screen bg-neutral-50">
  ...
  <div className="bg-zinc-50">
    <PersonalizedRecommendations />
  </div>

// After:
<div className="min-h-screen bg-[#F5EDD6]">
  ...
  <div>
    <PersonalizedRecommendations />
  </div>
```
Note: Using `bg-[#F5EDD6]` is reliable. `bg-parchment` should also work since it's in `@theme inline` — validate with a quick browser check.

### HOME-02: EnhancedHero props in page.tsx
```typescript
// Source: components/homepage/enhanced-hero.tsx — props interface
<EnhancedHero
  heading="Made by hand. Found by heart."
  subheading="[Claude-authored botanical copy]"
  backgroundImage="/assets/images/headers/botanical-header-large.png"
  overlayOpacity={25}
  ctas={[
    { label: 'Wander the Shop', href: '/collections', variant: 'primary' },
    { label: 'Our Story', href: '#brand-story', variant: 'secondary' },
  ]}
/>
```

### HOME-03: CategoryCards heading and section
```typescript
// Source: components/homepage/category-cards.tsx, lines 99-123
// Section wrapper: bg-white → bg-parchment
// Heading text-neutral-900 → text-forest
// Subheading text-neutral-600 → text-ink-brown
// Static array: update description + image fields for all 4 categories
```

### HOME-04: BotanicalDivider insertion in page.tsx
```typescript
// Source: components/ui/botanical-divider.tsx
import { BotanicalDivider } from '@/components/ui/botanical-divider';

// After EnhancedHero:
<BotanicalDivider variant="wildflower" />

// After CategoryCards:
<BotanicalDivider variant="fern-mushroom" />

// After FeaturedProducts:
<BotanicalDivider variant="fern-spiral" />
```
Note: All three variants confirmed present as PNG files in `public/assets/images/dividers/`.

### HOME-05: FeaturedProducts heading
```typescript
// Source: components/featured-products.tsx, line 57
// Before:
<h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
  Featured Products
</h2>
<Link ... className="text-sm font-semibold text-blue-600 ...">

// After:
<h2 className="text-3xl font-bold text-forest md:text-4xl font-heading">
  Freshly Gathered
</h2>
<Link ... className="text-sm font-semibold text-terracotta transition-colors hover:text-terracotta/80 ...">
```

---

## Asset Inventory

### Available botanical assets for CategoryCards
| Category | Recommended Asset | Path |
|----------|-------------------|------|
| Tie-Dye | Botanical header small | `/assets/images/headers/botanical-header-small.png` |
| Mandala Art | Botanical header large (alt) | `/assets/images/headers/botanical-header-large1.png` |
| Jewelry | Splash bloom elements | `/assets/images/splash/splash-bloom-elements.png` |
| Crystals | Botanical header large | `/assets/images/headers/botanical-header-large.png` |

Note: No dedicated per-category product imagery exists. The user explicitly approved using consistent botanical fallbacks if per-category assets don't exist. The above assignments give visual variety using confirmed-existing assets. Claude may adjust these at execution time.

### BotanicalDivider variant assignments (recommended)
| Position | Variant | Rationale |
|----------|---------|-----------|
| After hero | `wildflower` | Light, airy — transitions from full-bleed image to content |
| After categories | `fern-mushroom` | Heavier, earthy — separates a grid section |
| After featured products | `fern-spiral` | Elegant curl — section closer before brand story |

---

## State of the Art

| Old Pattern | Current Pattern | Impact |
|-------------|-----------------|--------|
| `bg-neutral-50` root background | `bg-[#F5EDD6]` (parchment) | Whole page warm-tones |
| Psychedelic purple CTAs (`primary-600`) | Keep for primary CTA on hero — revisit in later phase | Hero CTA remains purple for now (only copy/image change this phase) |
| Hardcoded "Featured Products" heading | "Freshly Gathered" | Brand voice alignment |
| Inline `bg-zinc-50` on PersonalizedRecommendations wrapper | No bg override | Parchment inherits from parent |

**Note on primary-600 buttons:** The `EnhancedHero` primary CTA renders as `bg-primary-600` (psychedelic purple). The user decision scopes this phase to copy and image only for the hero. The button color was not called out as in-scope. Do NOT change the primary CTA button color.

---

## Open Questions

1. **`bg-parchment` vs `bg-[#F5EDD6]` in Tailwind 4**
   - What we know: `--color-parchment: #F5EDD6` is in `@theme inline` in globals.css
   - What's unclear: Whether Next.js 16.1.1 + Tailwind 4 hot reload always picks up `@theme inline` tokens as utility classes without build step
   - Recommendation: Use `bg-[#F5EDD6]` as the safe fallback for the root div (matches existing arbitrary-value pattern). Use `bg-parchment` in component files — it worked in Phase 2 (header).

2. **CategoryCard image aspect ratio with botanical headers**
   - What we know: Cards use `aspect-[3/4]` (portrait). Botanical header images are wide-format landscape.
   - What's unclear: Whether the landscape images will crop acceptably in portrait cards.
   - Recommendation: Use `object-cover` (already in place). The botanical headers have centered subject matter and will crop to the center. Evaluate on dev server — this is a visual call.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — `app/page.tsx`, `components/homepage/enhanced-hero.tsx`, `components/homepage/category-cards.tsx`, `components/featured-products.tsx`, `components/ui/botanical-divider.tsx`, `app/globals.css`
- Filesystem inventory — `public/assets/images/` directory tree, confirmed all 5 divider PNGs present, all botanical header PNGs present

### Secondary (MEDIUM confidence)
- `.planning/phases/03-homepage/03-CONTEXT.md` — user decisions from /gsd:discuss-phase
- `.planning/REQUIREMENTS.md` — HOME-01 through HOME-05 requirement definitions
- `.planning/STATE.md` — Phase 2 completion state, design system decisions log

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies already in project, no new installs
- Architecture: HIGH — all components read directly from filesystem, prop interfaces verified
- Pitfalls: HIGH — identified from direct code inspection (not speculation)
- Asset assignments: MEDIUM — landscape-in-portrait-card crop is a visual judgment, needs dev server validation

**Research date:** 2026-02-24
**Valid until:** 2026-03-25 (stable project, no external dependencies changing)
