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

## Build & test
- Next.js 16 App Router / TypeScript / Tailwind v4 / Shopify Storefront API / Vercel.
- Local: `npm run typecheck`, `npm run lint`, `npm run test:ui`, `npm run test:e2e`
  (Playwright), `npm run test:webhook`. `npm run build` runs `contrast:check` first.
- Hooks: lefthook pre-commit runs `eslint --fix`, `tsc --noEmit`, **gitleaks** (secret
  scan), and `npm audit`. commit-msg enforces Conventional Commits
  (`feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert`, scope optional).
- CI: `.github/workflows/ci.yml`.
- New behavior ships with focused tests proving the smallest changed contract. An untested
  change to an **existing** contract is **P0**; missing tests on **new** code are **P1**.

## Review guidelines (Codex code review)

Flag only serious issues. Use these priorities.

### P0 — block-worthy
- **Secret / token leakage.** Shopify Storefront / Customer-Account tokens, Resend
  `RESEND_API_KEY`, or any env secret reaching a log line, error body, client bundle, or
  commit. (gitleaks runs pre-commit; review still flags secrets in code or logs.)
- **Webhook signature regressions.** `lib/shopify-webhook.ts` HMAC verification must stay
  timing-safe and **fail closed** on a missing/invalid signature. Flag any short-circuit to
  accept.
- **Auth regressions.** The OAuth2 + PKCE Shopify Customer Account flow under `app/api/auth/`
  is fragile and untested — flag changes that weaken or bypass it (do-not-touch surface).
- **Correctness regression with no test.** A cart-mutation, price, or checkout behavior
  change to an existing contract that no test covers.
- **Prompt-injection sinks.** External/untrusted text routed into a tool, shell, or eval as
  instructions instead of data.

### P1 — should fix
- **Brand / slop violations.** The `.claude/skills/slop-detector` gate is authoritative: no
  purple (#7C3AED), no blue-600, no "boho / festival / tie-dye shop", no occult/metaphysical
  framing, no fabricated testimonials, stats, or stock headshots. Flag off-brand copy or color.
- **Missing tests / docs** for new routes, components, config keys, or schema.
- **No-silent-shortcuts violation.** Partial, stubbed, or deferred work presented as complete.

### Prescriptive changes (migrations, "fixes")
Simulate executing the remedy on this repo before endorsing — trace the real path. A
Tailwind-token rename or Shopify-handle change must not break existing call sites (e.g.
`VALID_HANDLES`, `FALLBACK_NAV_ITEMS`, the `items.length < 5` nav-fallback threshold).

## Code review (Codex)

Pull requests are reviewed by **Codex cloud code review** (OpenAI), which reads this
`AGENTS.md`. Trigger per PR with a `@codex review` comment (or enable Automatic reviews in
the repo's Codex cloud settings); `@codex fix it` spawns a fix task. It is a cloud surface
billed against OpenAI's Code Review usage meter and complements — does not replace — the
local gates (lefthook pre-commit, `ci.yml`), which remain authoritative for merge.
