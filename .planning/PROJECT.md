# Wildenflower — shopSite Visual Migration

## What This Is

Wildenflower is a handmade goods storefront built on Next.js 16 with deep Shopify Storefront API integration. The codebase (shopSite) has solid e-commerce infrastructure — OAuth auth, cart, collections, product pages, account management, email, and search. The goal of this project is to migrate the warm botanical visual identity from a separate React Native prototype (wildenflowerShop) into this web codebase, one page at a time, with visual approval at each step.

## Core Value

A shopper lands on a beautiful, nature-inspired handmade goods storefront and immediately feels the warmth and authenticity of the Wildenflower brand — while the Shopify integration underneath works reliably.

## Requirements

### Validated

<!-- Existing capabilities confirmed in codebase -->

- ✓ Product browsing — Shopify Storefront GraphQL, collection pages with filtering/sorting — existing
- ✓ Product detail pages — images, variants, reviews, recommendations — existing
- ✓ Shopping cart — Zustand persistent store, Shopify cart mutations, drawer UI — existing
- ✓ Customer auth — OAuth2 + PKCE via Shopify Customer Account API, httpOnly cookies — existing
- ✓ Account dashboard — address book, order history, profile management — existing
- ✓ Search — predictive search via Shopify API, filter by category/price — existing
- ✓ Email — transactional email via Resend (order confirmation, welcome, etc.) — existing
- ✓ Admin panel — protected dashboard (currently uses mock data) — existing
- ✓ Wishlist — persistent via Zustand/localStorage — existing
- ✓ Currency selector — CurrencyProvider in layout — existing
- ✓ PWA icons — 192x192 and 512x512 icons present — existing
- ✓ Botanical assets — all wildenflowerShop images copied to public/assets/images/ — existing

### Active

<!-- Visual migration goals -->

- [ ] Design system established — Tailwind tokens for Wildenflower colors (parchment, terracotta, gold, sage, forest), Playfair Display + Lora fonts, botanical component primitives
- [ ] Homepage migrated — BotanicalHeader, HeroCard with tagline, category chips, BotanicalDivider sections, Freshly Gathered product grid
- [ ] Header / nav migrated — Wildenflower brand mark, warm botanical styling, consistent with new design system
- [ ] Collections page migrated — parchment background, botanical dividers, product cards with botanical feel
- [ ] Product card migrated — card-corner overlays, maker badge aesthetic, warm typography
- [ ] Product detail page migrated — botanical visual treatment
- [ ] Supporting pages migrated — About, FAQ, Blog with botanical headers and dividers

### Out of Scope

- Shopify integration changes — the e-commerce plumbing works, we're only changing visual layer
- Admin dashboard real data — mock data is a known issue but not part of this migration
- Test coverage gaps — documented in CONCERNS.md, separate project
- Security hardening of admin auth — separate project
- New features / pages — we're migrating what exists, not adding new capabilities

## Context

**Two repos:**
- `shopSite` (this repo) — Next.js 16 + Shopify Storefront API. Strong integration, generic visuals. The keeper.
- `wildenflowerShop` at `/Users/jamesputman/SRC/wildenflowerShop` — React Native + Expo. Polished botanical visual identity: Playfair Display/Lora fonts, parchment/terracotta/gold/sage/forest color palette, hand-illustrated botanical assets (dividers, headers, category icons). The aesthetic donor.

**Assets already in place:** All wildenflowerShop botanical images are in `public/assets/images/`. Untracked botanical UI components exist in `components/ui/` (BotanicalDivider, BotanicalHeader, CategoryChip, HeroCard, SectionTitle, WatercolorWash) — these need review and integration.

**Brand:** Wildenflower. Tagline: "Made by hand. Found by heart." Voice: warm, poetic, unhurried. Never corporate.

**Working approach:** One page at a time. Each page change is reviewed visually before moving on. The dev server (`npm run dev`) is the review mechanism.

## Constraints

- **Tech Stack**: Next.js 16 App Router, React 19, Tailwind CSS 4 — no framework changes
- **Shopify**: All e-commerce logic must remain intact — auth, cart mutations, product queries unchanged
- **OAuth**: The auth flow (`app/api/auth/customer/`) is fragile (no tests, complex cookie state) — visual changes only, no logic changes to auth routes
- **Fonts**: Playfair Display and Lora are Google Fonts — load via `next/font` or `@next/font/google`
- **Assets**: Botanical images are already in `public/assets/images/`, use relative paths from there

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep shopSite, not wildenflowerShop | shopSite has better Shopify integration (OAuth, cart, account) | — Pending |
| Page-by-page migration with visual approval | Prevents "one shot" failures, user controls quality | — Pending |
| Tailwind CSS for design tokens | Already in use, extend theme rather than replace | — Pending |
| Untracked botanical components in components/ui/ | Already partially built from previous attempt — review and use | — Pending |

## Current Milestone: v1.1 — UX Cleanup & Navigation

**Goal:** Remove deceptive content and navigation confusion so every shopper path leads cleanly to real products.

**Target features:**
- Remove all fake social proof (purchase popups, fake testimonials, fabricated stats, fake engagement counts)
- Kill the duplicate `/collections` page; redirect to `/collections/all`; fix all stale links
- Fix nav and footer category labels — all 6 categories present and correct everywhere
- Clean up product data — vendor names, test products, imageless product filtering
- Polish `/collections/all` page heading, subtitle, and botanical header
- Footer cleanup — remove dead links, align SHOP column with 6-category system

**Phase 5 (SUPP-01–03) deferred to v1.2 — UX cleanup is higher priority.**

---
*Last updated: 2026-02-25 after milestone v1.1 initialized*
