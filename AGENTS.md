# Wildenflower shopSite — Agent Instructions

## Brand Identity — Field journal frame
Canonical vocabulary lives in `../CONTEXT.md` (glossary); these rules derive from it.
Frame: a naturalist's field journal — sunlit, alive, wild-gathered. Every product is an
entry found in the field and catalogued with care. The site is the journal, not the
entries: chrome stays quiet, product photography carries the color.

Kept from the old brand: name Wildenflower, tagline "Made by Hand. Found by Heart.",
line-art poppy logo. Everything else below is the 2026-06 overhaul.

Two registers (every surface belongs to exactly one):
- **Open Field** (light): parchment #F5EDD6 base — browse/read/buy surfaces
  (catalog, PDP body, cart). Quiet parchment chrome.
- **Deep Woods** (dark): deep forest #1E3B30 — brand-moment surfaces (hero,
  premium-tier collection, crystals). Never black. No ad-hoc saturated accents
  outside this register.

Colors: parchment #F5EDD6, forest #1E3B30, terracotta #C8642A, gold #C9A642, sage #7B8B6F,
        earth #3B2F2F, dustyRose #D08B7A, inkBrown #5C4033, cream #FFFDF5.
Fonts: Cormorant (display/headings), Lora (body). NOT Playfair Display (rejected 2026-06-11).
**Catalog label** meta style: ALL CAPS, letter-spaced, thin gold rule (#C9A642) —
eyebrows, category cards, PDP meta. Every piece is one of a kind, so it is catalogued like one.

Voice: maker story — made by the makers' own hands; process is part of the product.
Tie-dye is presented as craft, not counterculture. Crystals as color/light, never metaphysical.
Premium tier (mokume-gane / damascus / titanium, ~$120) gets gallery-weight presentation.

Avoid lanes (local-shop collisions, researched 2026-06-11):
- NO "wunderkammer" / "cabinet of curiosities" (HAIL Cincinnati owns it)
- NO occult/arcana framing (Hierophany & Hedge owns it)
- NO "trippy/cosmic/groovy/seekers" language (Wunderlust Covington owns it)
- NO purple (#7C3AED). NO blue-600. NO "boho", "festival brand", "tie-dye shop".

## Categories (5 at launch, hardcoded in category-cards.tsx)
Tie-Dye (tie-dye), Leather (leather), Jewelry (jewelry),
Crystals (crystals), Artwork (artwork).
Ceramics (ceramics) DEFERRED 2026-06-14 (C2) — not a launch line; zero corpus
support. Re-add (back to 6) when the line exists: category-cards.tsx,
components/footer.tsx, app/local/page.tsx, and lib/shopify-helpers.ts
(FALLBACK_NAV_ITEMS + VALID_HANDLES + bump the `items.length < 5` threshold to 6).
NO Mandala Art — that handle doesn't exist in Shopify.

## Architecture
Next.js 16.1.1 App Router / TypeScript / Tailwind CSS v4 / Shopify Storefront API (GraphQL) / Vercel.
React 19, Zustand for cart/wishlist state.
Auth: OAuth2 + PKCE via Shopify Customer Account API — DO NOT touch app/api/auth/.
ISR target: revalidate=60 for products, revalidate=300 for collections.

## Key Files
- app/globals.css — botanical CSS variables
- tailwind.config.ts — botanical token extensions
- components/ui/botanical-*.tsx — botanical primitives (already built)
- components/homepage/ — homepage section components
- components/cart-drawer.tsx — cart UI (terracotta themed)
- app/products/[handle]/page.tsx — product detail with existing JSON-LD
- app/sitemap.ts — dynamic sitemap (already implemented)
- ROADMAP.md — GSD phase tracking

## SEO Requirements
Every page: unique title/description via generateMetadata(), JSON-LD, canonical, og:image.
Products: Product schema (already done). Collections: BreadcrumbList schema (to add).
Homepage/About: LocalBusiness + Organization schema (to add).
FAQ: FAQPage schema (to add).

## Content Rules
NO fake testimonials, NO stock headshots, NO fabricated stats (no "2,500+", "50+ artisans", "98% recommend").
Product descriptions: BLUF format (core facts first sentence).
Crystal products: describe color, light, formation, and provenance — NO metaphysical
properties section (avoid-lane: occult framing belongs to Hierophany & Hedge).

## Do Not Touch
- app/api/auth/ — OAuth flow is fragile, no tests
- Shopify API integration in lib/shopify.ts
- Cart mutations in lib/shopify/mutations/
