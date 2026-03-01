# Roadmap: Wildenflower Visual Migration

## Overview

This roadmap migrates the warm botanical visual identity from the wildenflowerShop prototype into the shopSite Next.js codebase. The work proceeds in dependency order: design foundation first (tokens, fonts, globals), then header (inherits tokens), then homepage (inherits both), then product detail and supporting pages (inherit foundation). Each phase delivers a visually reviewable result — open the dev server, inspect the page, approve before moving on.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Design Foundation** - Establish Wildenflower color tokens, fonts, globals, and metadata
- [x] **Phase 2: Header** - Swap logo and apply botanical palette to header/nav (completed 2026-02-24)
- [x] **Phase 3: Homepage** - Migrate hero, categories, dividers, and product grid heading (completed 2026-02-24)
- [x] **Phase 4: Product Detail** - Apply botanical typography and BotanicalHeader to product pages (completed 2026-02-24)
- [x] **Phase 5: Supporting Pages** - Migrate About, FAQ, and Blog/Field Notes with botanical assets (completed 2026-02-26)

## Phase Details

### Phase 1: Design Foundation
**Goal**: The Wildenflower design system is live — every page inherits the correct colors, fonts, and brand voice without any page-level changes
**Depends on**: Nothing (first phase)
**Requirements**: DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04, DESIGN-05
**Success Criteria** (what must be TRUE):
  1. Every page background renders as parchment (#F5EDD6) with inkBrown/earth text — visible at any URL
  2. Headings across the site render in Playfair Display bold; body text renders in Lora regular — no Righteous, Nunito, or Sacramento fonts remain
  3. Browser tab theme color shows forest green (#1E3B30) on mobile
  4. Page `<title>` and meta description use Wildenflower brand language ("Made by hand. Found by heart.") — no "psychedelic/tie-dye/trippy" language remains
  5. Tailwind theme tokens (parchment, terracotta, gold, sage, forest, dustyRose, inkBrown, earth) are available and usable in any component class
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Botanical tokens, fonts, globals, metadata, viewport (layout.tsx + globals.css + manifest.json)
- [x] 01-02-PLAN.md — Dark mode sweep: remove all dark: classes from 4 botanical component files
- [x] 01-03-PLAN.md — Visual verification checkpoint (human approve before Phase 2)

### Phase 2: Header
**Goal**: The site header identifies as Wildenflower — logo, colors, and nav styling reflect the botanical palette
**Depends on**: Phase 1
**Requirements**: HEAD-01, HEAD-02
**Success Criteria** (what must be TRUE):
  1. Wildenflower logo mark (or full logo) renders in the header — no text placeholder or prior logo visible
  2. Header background, nav link colors, and hover/active states use the Wildenflower palette (no purple/psychedelic remnants)
  3. Header layout and navigation structure is unchanged — all existing nav links still work
**Plans**: 1 plan

Plans:
- [x] 02-01-PLAN.md — Botanical palette + logo swap on header.tsx and currency-selector.tsx, with visual verification checkpoint (completed 2026-02-24)

### Phase 3: Homepage
**Goal**: The homepage feels like Wildenflower — parchment background, botanical hero image and copy, warm botanical category section, BotanicalDividers between sections, and "Freshly Gathered" product grid heading
**Depends on**: Phase 2
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, HOME-05
**Success Criteria** (what must be TRUE):
  1. Homepage background is parchment — the neutral-50 grey background is gone
  2. The hero section (EnhancedHero) shows botanical-header-large.png with "Made by hand. Found by heart." heading and Wildenflower voice CTAs
  3. Category section heading reads "Find Your Wild" with Wildenflower palette colors, botanical copy, and botanical images — no prior color scheme or psychedelic language visible
  4. BotanicalDivider renders visibly after the hero, after categories, and after featured products
  5. Featured products section heading reads "Freshly Gathered" with terracotta View All link
**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md — Page layout: parchment background, EnhancedHero botanical props, 3 BotanicalDivider insertions, FeaturedProducts heading (completed 2026-02-24)
- [x] 03-02-PLAN.md — CategoryCards: Wildenflower copy, parchment bg, botanical images, gold hover states (completed 2026-02-24)
- [x] 03-03-PLAN.md — Visual verification checkpoint — user approved all five criteria (completed 2026-02-24)
- [x] 03-04-PLAN.md — Gap closure: removed Cosmic Purple word-coloring and CTA button color from EnhancedHero; HOME-02 fully closed (completed 2026-02-24)

### Phase 4: Product Detail
**Goal**: Product pages feel botanically branded — typography, colors, and header image match the Wildenflower identity
**Depends on**: Phase 1
**Requirements**: PROD-01, PROD-02
**Success Criteria** (what must be TRUE):
  1. Product detail page typography (headings, prices, descriptions) renders in Playfair Display and Lora with Wildenflower palette colors — no generic font stack or grey/white color scheme
  2. BotanicalHeader image (small or large variant) is visible at the top of product detail pages
  3. All product detail functionality (add to cart, variant selection, image gallery) continues to work
**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md — BotanicalHeader insertion + parchment page shell + breadcrumb restyling (page.tsx + breadcrumbs.tsx)
- [x] 04-02-PLAN.md — Component color/typography sweep: product-info, add-to-cart-button, variant-selector, accordion, sticky cart, reviews
- [x] 04-03-PLAN.md — Visual verification checkpoint (human approve before Phase 5)

### Phase 5: Supporting Pages
**Goal**: About, FAQ, and Blog pages are botanically dressed — each has its header image and the relevant botanical assets placed within the existing layout
**Depends on**: Phase 1
**Requirements**: SUPP-01, SUPP-02, SUPP-03
**Success Criteria** (what must be TRUE):
  1. About page shows botanical-header-large.png at the top; cartouche-frame.png and divider-fallen-log.png assets are visible within the existing layout
  2. FAQ page shows botanical-header-faq.png at the top; accordion expand/collapse icons use fern-expand.png and fern-collapse.png
  3. Blog/Field Notes page shows botanical-header-blog.png at the top
  4. All existing content and structure on each page is preserved — only botanical visuals are added
**Plans**: 3 plans

Plans:
- [x] 05-01-PLAN.md — About page: BotanicalHeader (about variant) + divider-fallen-log between MissionValues and Sustainability (completed 2026-02-24)
- [x] 05-02-PLAN.md — FAQ page: full accordion build replacing ComingSoon (data file + accordion component + page content + page rewrite) (completed 2026-02-24)
- [x] 05-03-PLAN.md — Blog page: BotanicalHeader (blog variant) above ComingSoon placeholder (completed 2026-02-24)

- [x] **Phase 6: Copy & Brand Cleanup** — Remove purple remnants, fix cart CTAs, eliminate psychedelic copy, fix category list, update AGENTS.md (completed 2026-02-24)
- [x] **Phase 7: Cart & Conversion UX** — Free shipping bar, trust signals, brand-consistent cart styling (completed 2026-02-24)
- [x] **Phase 8: SEO Enhancement** — ISR, expanded JSON-LD (LocalBusiness, BreadcrumbList, FAQPage), local SEO page, NAP footer (completed 2026-02-24)
- [x] **Phase 9: Performance & Dependency Audit** — Image priority fix, next.config domain cleanup, Wikimedia removed (completed 2026-02-24)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Design Foundation | 3/3 | Complete | 2026-02-24 |
| 2. Header | 1/1 | Complete   | 2026-02-24 |
| 3. Homepage | 4/4 | Complete   | 2026-02-24 |
| 4. Product Detail | 3/3 | Complete   | 2026-02-24 |
| 5. Supporting Pages | 3/3 | Complete   | 2026-02-26 |
| 6. Copy & Brand Cleanup | — | Complete | 2026-02-24 |
| 7. Cart & Conversion UX | — | Complete | 2026-02-24 |
| 8. SEO Enhancement | — | Complete | 2026-02-24 |
| 9. Performance & Deps | — | Complete | 2026-02-24 |

---

## Milestone v1.1: UX Cleanup & Navigation

**Milestone Goal:** Remove deceptive content and navigation confusion so every shopper path leads cleanly to real products. CRITICAL trust issues (fake social proof) are resolved first, then routing integrity, then label accuracy, product data quality, collections polish, and footer cleanup.

**Phase summary:**
- [x] **Phase 10: Trust Cleanup** - Remove all fake social proof (purchase popups, testimonials, fabricated stats, fake engagement) (completed 2026-02-26)
- [x] **Phase 11: Navigation Routing** - Fix /collections redirect, hero CTA link, and all stale /collections hrefs (completed 2026-02-26)
- [x] **Phase 12: Navigation Labels** - Correct all 6 category labels and hrefs in top nav (completed 2026-02-26)
- [x] **Phase 13: Product Data Quality** - Fix vendor names, hide test products, filter imageless products (completed 2026-02-26)
- [x] **Phase 14: Collections Polish** - Update /collections/all heading, subtitle, botanical header, and breadcrumb (completed 2026-02-26)
- [x] **Phase 15: Footer Cleanup** - Align SHOP column with 6-category system, remove dead links (completed 2026-02-26)

### Phase 10: Trust Cleanup
**Goal**: Every shopper encounters only real content — no fabricated purchase activity, fake reviews, invented statistics, or false engagement numbers anywhere on the site
**Depends on**: Phase 9 (v1.0 complete)
**Requirements**: TRST-01, TRST-02, TRST-03, TRST-04
**Success Criteria** (what must be TRUE):
  1. No purchase notification popup ("Someone just bought...") appears on any page visit, including homepage on first load
  2. No testimonials section displays stock-photo reviewer headshots or names (Sarah M., Michael R., Emily L., or similar fabricated personas)
  3. No stats block shows fabricated numbers ("2,500+ Happy Seekers", "4.9 Average Rating", "98% Would Recommend", "50+ Artisan Partners") anywhere on the site
  4. No Instagram-style gallery shows fake engagement counts (likes/comments overlaid on photos); if photos are Unsplash stock, the entire section is removed
**Plans**: 4 plans

Plans:
- [x] 10-01-PLAN.md — Remove fake purchase popups from layout.tsx, stub Instagram gallery, remove sustainability fabricated stats
- [x] 10-02-PLAN.md — Create FindUsInTheWild events section and data/events.json, stub TestimonialCarousel, update homepage page.tsx
- [x] 10-03-PLAN.md — Update welcome popup copy, botanical image, and delayed trigger timing
- [x] 10-04-PLAN.md — Visual verification checkpoint (human approve all four TRST requirements)

### Phase 11: Navigation Routing
**Goal**: Every internal link that previously pointed at /collections now resolves correctly — shoppers are never dropped on a broken or duplicate page
**Depends on**: Phase 10
**Requirements**: NAV-01, NAV-02, NAV-03
**Success Criteria** (what must be TRUE):
  1. Visiting /collections in a browser (any method) results in a 301 redirect to /collections/all — the /collections route itself returns no content
  2. The "Wander the Shop" CTA button on the hero navigates to /collections/all, not /collections
  3. A codebase search for href="/collections" (exact, no handle suffix) returns zero results
**Plans**: 3 plans

Plans:
- [x] 11-01-PLAN.md — Create proxy.ts: 301 redirect from /collections to /collections/all with query string preservation (NAV-01)
- [x] 11-02-PLAN.md — Link audit sweep: fix all 8 stale href=/collections instances, delete dead route, clean sitemap (NAV-02, NAV-03)
- [x] 11-03-PLAN.md — Visual verification checkpoint (human approve all three NAV requirements)

### Phase 12: Navigation Labels
**Goal**: The top navigation accurately presents all six product categories with correct names and working links — shoppers can reach any category directly from the header
**Depends on**: Phase 11
**Requirements**: NAV-04, NAV-05
**Success Criteria** (what must be TRUE):
  1. Top nav dropdown or category list shows exactly 6 categories: Tie-Dye, Leather, Jewelry, Crystals, Artwork, Ceramics — no categories missing or duplicated
  2. Each category link resolves to the correct /collections/[handle] URL (e.g., /collections/leather, /collections/artwork)
  3. Category labels read "Leather" (not "Leather Goods") and "Artwork" (not "Art") — exact label match
**Plans**: 3 plans

Plans:
- [ ] 12-01-PLAN.md — Shopify menu query + NavItem interface + getNavMenu() helper with 6-item fallback (lib/shopify-queries.ts, lib/shopify-helpers.ts)
- [ ] 12-02-PLAN.md — async layout.tsx + header.tsx Shop dropdown: Home | Shop (hover/keyboard dropdown) | About (app/layout.tsx, components/header.tsx)
- [ ] 12-03-PLAN.md — mobile-drawer.tsx Shop accordion + layout.tsx MobileDrawer wiring + visual verification checkpoint

### Phase 13: Product Data Quality
**Goal**: Every product card shown to shoppers presents real, complete product data — correct vendor attribution, no test placeholders, no broken image states
**Depends on**: Phase 12
**Requirements**: PRDS-01, PRDS-02, PRDS-03, PRDS-04
**Success Criteria** (what must be TRUE):
  1. Products with vendor "My Store" display "Wildenflower" as the vendor on both product cards and product detail pages
  2. Test and placeholder products (e.g., products named "ring" or "Generic Tiedye") do not appear in any product grid or collection page
  3. Products with no featured image are absent from all product grids — no broken image placeholders, grey boxes, or fallback icons are visible
**Plans**: 3 plans

Plans:
- [x] 13-01-PLAN.md — Create lib/product-filters.ts helpers; apply isShowableProduct filter to featured-products, collection-content, related-products (PRDS-02, PRDS-03)
- [x] 13-02-PLAN.md — Apply normalizeVendor to product-card, product-info, quick-view-modal; add botanical corner overlays to product-card (PRDS-01, PRDS-04)
- [x] 13-03-PLAN.md — Visual verification checkpoint (human approve all four PRDS requirements)

### Phase 14: Collections Polish
**Goal**: The /collections/all page presents itself with Wildenflower brand voice — correct heading, subtitle, botanical header image, and breadcrumb that tells shoppers exactly where they are
**Depends on**: Phase 13
**Requirements**: COLL-01, COLL-02, COLL-03, COLL-04
**Success Criteria** (what must be TRUE):
  1. The /collections/all page heading reads "All Treasures" — not "All Products" or any generic label
  2. A subtitle below the heading reads "Every handmade treasure in one place"
  3. A botanical header image (botanical-header-small-web.png) is visible in the title area above or alongside the heading
  4. The breadcrumb trail reads "Home > Shop > All Treasures" with correct link targets
**Plans**: 1 plan

Plans:
- [x] 14-01-PLAN.md — Update collections page for "all" to map to All Treasures, inject subtitle, replace layout with BotanicalHeader and custom breadcrumbs (COLL-01, COLL-02, COLL-03, COLL-04)

### Phase 15: Footer Cleanup
**Goal**: The footer SHOP column is a complete and accurate directory of the store — all six categories present, all links functional, no links pointing to pages that return 404
**Depends on**: Phase 14
**Requirements**: FOOT-01, FOOT-02
**Success Criteria** (what must be TRUE):
  1. Footer SHOP column lists exactly 7 entries in order: All Treasures, Tie-Dye, Leather, Jewelry, Crystals, Artwork, Ceramics — each linking to its correct /collections/[handle] URL
  2. Every link in the footer resolves to a page that exists — no Size Guide, Sustainability, Press, or other dead links remain; clicking any footer link does not result in a 404
**Plans**: 1 plan

Plans:
- [x] 15-01-PLAN.md — Clean up footer links block fixing accurate arrays, execute `git rm` over unused boilerplate pages (FOOT-01, FOOT-02)

## v1.1 Progress

**Execution Order:**
Phases execute in numeric order: 10 → 11 → 12 → 13 → 14 → 15

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 10. Trust Cleanup | v1.1 | 4/4 | Complete | 2026-02-26 |
| 11. Navigation Routing | v1.1 | Complete    | 2026-02-26 | 2026-02-26 |
| 12. Navigation Labels | 3/3 | Complete    | 2026-02-26 | - |
| 13. Product Data Quality | 3/3 | Complete    | 2026-02-26 | - |
| 14. Collections Polish | 1/1 | Complete | 2026-02-26 |
| 15. Footer Cleanup | 1/1 | Complete | 2026-02-26 |

---

## Milestone v1.2: Production Readiness & Go-Live

**Milestone Goal:** The store has a hardened CI/CD pipeline, secure and monitored deployments, legal compliance in place, and every Shopify prerequisite satisfied to begin accepting real orders.

**Phase summary:**
- [ ] **Phase 16: Legal Pages & SEO Metadata** - Publish Privacy Policy, Terms, Refund Policy; add Open Graph tags, sitemap, robots.txt
- [x] **Phase 17: Cookie Consent & Product Schema** - GDPR cookie consent banner; JSON-LD Product schema on product pages (completed 2026-02-27)
- [x] **Phase 18: Security & Dev Tooling** - Security headers (CSP/HSTS/X-Frame), git history secrets scan, pre-commit hooks, Dependabot (completed 2026-02-28)
- [x] **Phase 19: Playwright E2E Tests** - Write all 7 critical-path test suites (homepage, collections, PDP, cart, checkout redirect, search, category nav) (completed 2026-02-28)
- [x] **Phase 20: CI/CD Pipeline** - GitHub Actions: lint + typecheck + build + E2E + secrets scan + audit; branch protection on main (completed 2026-02-28)
- [x] **Phase 21: Vercel Environments & IaC** - Dev/prod Vercel project split; OpenTofu declares both projects and env var structure (completed 2026-03-01)
- [ ] **Phase 22: Error Monitoring** - Sentry integrated for Next.js 16 App Router; production-only; server + client capture
- [ ] **Phase 23: Shopify Go-Live Verification** - Complete Shopify admin checklist: products, payments, shipping, taxes, test order, domain, API token

## Phase Details — v1.2

### Phase 16: Legal Pages & SEO Metadata [DONE]
**Goal**: Every shopper can find legal policies from the footer, and every public page is correctly described to search engines and social platforms
**Depends on**: Phase 15 (v1.1 complete)
**Requirements**: GDPR-03, GDPR-04, GDPR-05, SEO-02, SEO-03, SEO-04
**Success Criteria** (what must be TRUE):
  1. Footer contains working links to Privacy Policy, Terms of Service, and Refund Policy — each link resolves to a published page with appropriate content
  2. Every public page (homepage, collections, product pages, about, FAQ) has Open Graph meta tags — sharing on social platforms shows a title, description, and image
  3. `/sitemap.xml` is accessible and includes URLs for product and collection pages
  4. `/robots.txt` is accessible, allows crawling of `/`, `/products/`, and `/collections/`, and blocks `/api/` and `/admin`
**Plans**: 3 plans

- [x] Create Privacy, Terms, and Refund policies (branded MDX) (GDPR-03, GDPR-04, GDPR-05)
- [x] Dynamic `/legal/[slug]` route with LegalLayout (GDPR-03, GDPR-04, GDPR-05)
- [x] Redirect `/privacy` and `/terms` to `/legal/*` (GDPR-03)
- [x] Root OG metadata (SEO-02)
- [x] Correct brand name bug in metadata (SEO-02)
- [x] Update sitemap.ts with updatedAt and revalidate (SEO-03)
- [x] Update robots.ts for /admin/ disallow (SEO-04)

Plans:
- [x] 16-01-PLAN.md — MDX infrastructure, @tailwindcss/typography, LegalLayout component (GDPR-03, GDPR-04, GDPR-05)
- [x] 16-02-PLAN.md — Legal MDX content, /legal/[slug] route, footer links, redirect old pages (GDPR-03, GDPR-04, GDPR-05)
- [x] 16-03-PLAN.md — OG image in layout.tsx, product brand name fix, robots.ts /admin/, sitemap updatedAt (SEO-02, SEO-03, SEO-04)

### Phase 17: Cookie Consent & Product Schema
**Goal**: Every first-time visitor is informed of cookie usage before analytics cookies are set, and product pages provide structured data that search engines can read
**Depends on**: Phase 16 (Privacy Policy URL must exist before banner can link to it)
**Requirements**: GDPR-01, GDPR-02, SEO-01
**Success Criteria** (what must be TRUE):
  1. A cookie consent banner appears on first visit — it shows accept and reject options and includes a link to the Privacy Policy page
  2. After a visitor makes a choice (accept or reject), the banner does not reappear on subsequent page loads or browser sessions
  3. Product detail pages include a valid JSON-LD `Product` schema block — a structured data validator (e.g., Google Rich Results Test) confirms it parses correctly with name, price, and availability
**Plans**: TBD

### Phase 18: Security & Dev Tooling
**Goal**: All responses include hardened security headers, no secrets exist in git history, and every commit is automatically linted and type-checked before it lands
**Depends on**: Phase 15 (v1.1 complete — no hard dependency on 16/17)
**Requirements**: SEC-01, SEC-02, SEC-03, DEVX-01, DEVX-02, CICD-06
**Success Criteria** (what must be TRUE):
  1. A browser security headers check (e.g., securityheaders.com) on the deployed site shows CSP, HSTS, X-Frame-Options, and X-Content-Type-Options all present
  2. Running a git history secrets scan (gitleaks or equivalent) against the full repo returns zero findings
  3. All `.env*` files are confirmed absent from git history and present in `.gitignore`
  4. Attempting to commit a file with an ESLint error or TypeScript type error is blocked by the pre-commit hook — the commit does not complete
  5. Dependabot is configured and visible in GitHub — the dependency graph shows npm ecosystem enabled
**Plans**: TBD

### Phase 19: Playwright E2E Tests
**Goal**: The seven critical user flows that represent real business risk are covered by automated tests that can run in CI
**Depends on**: Phase 15 (v1.1 complete — tests run against the finished storefront)
**Requirements**: E2E-01, E2E-02, E2E-03, E2E-04, E2E-05, E2E-06, E2E-07
**Success Criteria** (what must be TRUE):
  1. Running `npx playwright test` locally completes all 7 test suites with zero failures against the dev server
  2. The test suite covers: homepage render, /collections/all product grid, product detail page (image + price + add-to-cart button), add-to-cart (cart count update + drawer open), checkout redirect (URL starts with Shopify checkout domain), search results for a known query, and category nav link resolution
  3. No test relies on hardcoded product titles or IDs that would break if Shopify catalog changes — tests use structural selectors or data-testid attributes
**Plans**: 4 plans

Plans:
- [ ] 19-01-PLAN.md — Playwright config, browser binaries, data-testid additions, structural tests: homepage (E2E-01), collections (E2E-02), category-nav (E2E-07)
- [ ] 19-02-PLAN.md — Human checkpoint: create Test Product in Shopify admin, record handle + title in test-product.md
- [ ] 19-03-PLAN.md — Product-dependent read-only tests: PDP (E2E-03), search (E2E-06)
- [ ] 19-04-PLAN.md — Cart-mutating tests: add-to-cart (E2E-04), checkout redirect (E2E-05)

### Phase 20: CI/CD Pipeline
**Goal**: Every pull request against main is automatically validated — no broken build, lint error, type error, E2E failure, or detected secret can merge without being caught
**Depends on**: Phase 19 (Playwright tests must exist before the E2E CI job can run)
**Requirements**: CICD-01, CICD-02, CICD-03, CICD-04, CICD-05, CICD-07, DEVX-03
**Success Criteria** (what must be TRUE):
  1. Opening a PR against main triggers a GitHub Actions workflow — the workflow runs lint, typecheck, and build as visible CI checks
  2. The CI workflow runs Playwright E2E tests — a PR with a failing test shows a failed check and cannot be merged
  3. A successful CI run uploads a downloadable Playwright HTML report as a GitHub Actions artifact
  4. A PR that introduces a `.env` file with a secret pattern triggers the secrets scan job and fails the check
  5. The main branch has a branch protection rule requiring at least one passing CI check before merge — direct push to main is blocked
  6. Production deployment requires a manual approval step via a GitHub environment gate — it does not deploy automatically
**Plans**: 3 plans

Plans:
- [ ] 20-01-PLAN.md — npm audit pre-flight + playwright.config.ts multi-browser update (CICD-02, CICD-05)
- [ ] 20-02-PLAN.md — GitHub Actions CI workflow: quality, E2E matrix, secrets scan, audit, deploy-prod (CICD-01, CICD-02, CICD-03, CICD-04, CICD-05, CICD-07)
- [ ] 20-03-PLAN.md — Push to trigger first CI run, configure production environment and branch protection (CICD-07, DEVX-03)

### Phase 21: Vercel Environments & IaC
**Goal**: Dev and prod run as independent Vercel projects with their own environment variables, and the project configuration is declared in version-controlled OpenTofu code
**Depends on**: Phase 20 (CI pipeline is in place before environment split is formalized)
**Requirements**: VERC-01, VERC-02, VERC-03, VERC-04, INFRA-01, INFRA-02, INFRA-03
**Success Criteria** (what must be TRUE):
  1. Two distinct Vercel projects exist — one auto-deploys on merge to main (dev); the other deploys only via manual promote (prod) and has the custom domain attached
  2. PRs auto-generate a Vercel preview deployment URL — the URL is accessible and reflects the PR's changes
  3. Dev and prod each have their own scoped environment variables — a variable set in dev does not appear in prod and vice versa
  4. An `infra/` directory at the project root contains OpenTofu `.tf` files that declare both Vercel projects — running `tofu plan` produces no errors and shows the expected resources
  5. `terraform.tfstate` is present in `.gitignore` and absent from git history
**Plans**: 3 plans

Plans:
- [x] 21-01-PLAN.md — OpenTofu IaC foundation: infra/ directory, two vercel_project resources, gitignore state (INFRA-01, INFRA-03, VERC-01, VERC-02, VERC-03)
- [x] 21-02-PLAN.md — tofu apply: create both Vercel projects, scoped env vars per project (VERC-04, INFRA-02)
- [ ] 21-03-PLAN.md — Wire CI deploy-prod job to Vercel CLI, verify preview deployments and prod gate (VERC-01, VERC-02, VERC-03)

### Phase 22: Error Monitoring
**Goal**: Unhandled errors in production are automatically captured in Sentry with full stack traces — no silent failures reach real users undetected
**Depends on**: Phase 21 (production Vercel project must exist — Sentry is production-only)
**Requirements**: MON-01, MON-02, MON-03
**Success Criteria** (what must be TRUE):
  1. The Sentry dashboard shows the Wildenflower project receiving events — triggering a test error in production results in a visible issue in Sentry within 60 seconds
  2. Running the dev server locally (`NODE_ENV=development`) does not send any events to Sentry — the Sentry dashboard shows no development-origin errors
  3. An unhandled server-side error (e.g., a thrown exception in a route handler) and an unhandled client-side error (e.g., an uncaught promise rejection) both appear in Sentry with readable TypeScript source in the stack trace
**Plans**: TBD

### Phase 23: Shopify Go-Live Verification
**Goal**: Every Shopify prerequisite for accepting real orders is confirmed complete — products, payments, shipping, taxes, API access, and a successful test purchase are all verified
**Depends on**: Phase 16 (legal pages must be published — Shopify requires them), Phase 22 (monitoring active before first real traffic)
**Requirements**: SHOP-01, SHOP-02, SHOP-03, SHOP-04, SHOP-05, SHOP-06, SHOP-07, SHOP-08
**Success Criteria** (what must be TRUE):
  1. All products visible on the storefront have images, descriptions, prices, and inventory — no product shows a broken image or missing price
  2. A test order placed via Shopify's bogus gateway completes successfully — the order appears in Shopify Admin and triggers the Resend order confirmation email
  3. Shipping rates are configured for all intended delivery regions — a customer in each target region can reach the checkout and see a shipping option
  4. The store password ("coming soon") page is disabled — an unauthenticated visitor reaching the store URL sees the storefront, not a password gate
  5. The Storefront API token is confirmed valid on the production store and collection handles in Shopify match the `/collections/[handle]` routes in the storefront
**Plans**: TBD

## v1.2 Progress

**Execution Order:**
Phases execute in numeric order: 16 → 17 → 18 → 19 → 20 → 21 → 22 → 23
(Phases 16, 18, and 19 have no interdependency — they can begin in parallel)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 16. Legal Pages & SEO Metadata | v1.2 | 0/TBD | Not started | - |
| 17. Cookie Consent & Product Schema | v1.2 | Complete    | 2026-02-27 | - |
| 18. Security & Dev Tooling | 3/3 | Complete    | 2026-02-28 | - |
| 19. Playwright E2E Tests | 4/4 | Complete    | 2026-02-28 | - |
| 20. CI/CD Pipeline | 3/3 | Complete    | 2026-02-28 | - |
| 21. Vercel Environments & IaC | 3/3 | Complete   | 2026-03-01 | - |
| 22. Error Monitoring | v1.2 | 0/TBD | Not started | - |
| 23. Shopify Go-Live Verification | v1.2 | 0/TBD | Not started | - |
