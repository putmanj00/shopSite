# Phase 3: Homepage - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Transform the homepage visual identity from psychedelic/bohemian to Wildenflower botanical. Scope: parchment background, botanical hero image + copy, category section rewrite, BotanicalDividers between sections, "Freshly Gathered" product heading. No changes to Shopify integration, cart, auth, or homepage component logic beyond visual presentation.

</domain>

<decisions>
## Implementation Decisions

### Hero section
- **Keep EnhancedHero** — do NOT replace with HeroCard component (user found two stacked heroes "too much")
- Background image: replace current `/images/hero-background.png` with `/assets/images/headers/botanical-header-large.png`
- Main heading (H1): **"Made by hand. Found by heart."** — replace "Embrace Your Wild Beauty"
- Subheading: Claude writes new botanical copy in warm Wildenflower voice — replace psychedelic "Handpicked treasures for the untamed spirit" text
- CTAs: Update labels to Wildenflower voice (e.g. "Wander the Shop" / "Our Story") — Claude's discretion
- Trust badges ("Free Shipping Over $75" etc.): keep as-is, no changes

### Category section
- Section heading: **"Find Your Wild"** — replace "Trippy Treasures Await"
- Section subheading: Claude writes warm, unhurried Wildenflower copy — replace "Explore our groovy collections of handcrafted wearable art"
- Category card descriptions: Botanical rewrites in Wildenflower voice — replace psychedelic copy ("Psychedelic swirls and festival-ready vibes" etc.)
- Category images: Use botanical assets from `/assets/images/` — Claude assigns appropriate image per category. If no suitable per-category asset exists, a consistent botanical fallback is fine
- Card grid structure (4 columns, hover effects): keep as-is — visual changes only

### BotanicalDividers
- Insert BotanicalDivider components at 3 placements: after hero section, after category section, after featured products section
- Use different variants for each placement — variety feels organic
- Variant assignment: Claude's discretion (5 available: fern-mushroom, wildflower, vine-trail, mushroom-cluster, fern-spiral)

### Featured products section
- Section heading changes to **"Freshly Gathered"** — this is the only change to FeaturedProducts
- Product grid structure, card layout, Shopify data fetching: untouched

### Page background
- Root wrapper `<div className="min-h-screen bg-neutral-50">` → change `bg-neutral-50` to `bg-[#F5EDD6]` (parchment token)
- Remove `bg-zinc-50` override from PersonalizedRecommendations wrapper in page.tsx so parchment shows through

### Non-scoped sections
- BrandStory, TrustBar, TestimonialCarousel, InstagramGallery, NewsletterSignup: no changes this phase beyond parchment bg inheritance
- These sections will inherit parchment from the root wrapper — that is the full extent of their treatment

### Claude's Discretion
- Exact botanical subheading copy for EnhancedHero
- Exact botanical CTA labels for EnhancedHero
- Exact Wildenflower-voice descriptions for each category card
- Which botanical asset from `/assets/images/` to assign to each category
- BotanicalDivider variant for each of the 3 placements

</decisions>

<specifics>
## Specific Ideas

- Roadmap success criterion #2 specified HeroCard component — user explicitly chose to keep EnhancedHero instead with botanical image + copy swap. Planner should NOT use HeroCard for the hero.
- Brand voice reference: warm, botanical, unhurried — "Made by hand. Found by heart." is the canonical tagline
- All botanical images already exist in `public/assets/images/` — no new assets needed

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-homepage*
*Context gathered: 2026-02-24*
