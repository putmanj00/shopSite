# Wildenflower shopSite — Agent Instructions

## Brand Identity
Colors: parchment #F5EDD6, forest #1E3B30, terracotta #C8642A, gold #C9A642, sage #7B8B6F,
        earth #3B2F2F, dustyRose #D08B7A, inkBrown #5C4033, cream #FFFDF5.
Fonts: Playfair Display (headings), Lora (body).
NO purple (#7C3AED). NO blue-600. NO "trippy/cosmic/groovy/seekers" language.
Tagline: "Made by Hand. Found by Heart."
Voice: warm, earthy, authentic, handmade. "farmer's market" not "music festival."

## Categories (6 total, hardcoded in category-cards.tsx)
Tie-Dye (tie-dye), Leather (leather), Jewelry (jewelry),
Crystals (crystals), Artwork (artwork), Ceramics (ceramics).
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
Crystal products include metaphysical properties section.

## Do Not Touch
- app/api/auth/ — OAuth flow is fragile, no tests
- Shopify API integration in lib/shopify.ts
- Cart mutations in lib/shopify/mutations/
