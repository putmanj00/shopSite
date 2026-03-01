# Wildenflower — shopSite

## What This Is

Wildenflower is a handmade goods storefront built on Next.js 16 with deep Shopify Storefront API integration. The codebase has solid e-commerce infrastructure — OAuth auth, cart, collections, product pages, account management, email, and search — and a complete botanical visual identity (Playfair Display/Lora fonts, parchment/terracotta/gold palette, hand-illustrated assets). The v1.2 focus is production readiness: CI/CD pipeline, testing, security hardening, Vercel dev/prod environments, monitoring, SEO, and Shopify go-live verification so the store can begin accepting real orders.

## Core Value

A shopper lands on a beautiful, nature-inspired handmade goods storefront and immediately feels the warmth and authenticity of the Wildenflower brand — while the Shopify integration underneath works reliably.

## Requirements

### Validated

<!-- Shipped and confirmed valuable -->

- ✓ Product browsing — Shopify Storefront GraphQL, collection pages with filtering/sorting — v1.0
- ✓ Product detail pages — images, variants, reviews, recommendations — v1.0
- ✓ Shopping cart — Zustand persistent store, Shopify cart mutations, drawer UI — v1.0
- ✓ Customer auth — OAuth2 + PKCE via Shopify Customer Account API, httpOnly cookies — v1.0
- ✓ Account dashboard — address book, order history, profile management — v1.0
- ✓ Search — predictive search via Shopify API, filter by category/price — v1.0
- ✓ Email — transactional email via Resend (order confirmation, welcome, etc.) — v1.0
- ✓ Wishlist — persistent via Zustand/localStorage — v1.0
- ✓ Botanical design system — Tailwind tokens, Playfair Display/Lora fonts, botanical component primitives — v1.0
- ✓ Homepage migrated — BotanicalHeader, HeroCard, category section, BotanicalDividers, Freshly Gathered grid — v1.0
- ✓ Header / nav migrated — Wildenflower brand mark, botanical palette, desktop dropdown + mobile accordion — v1.1
- ✓ Collections page polished — "All Treasures" heading, botanical header, breadcrumb, botanical divider — v1.1
- ✓ Product cards — vendor normalization, imageless product filtering, botanical feel — v1.1
- ✓ Product detail page — botanical typography and BotanicalHeader — v1.0
- ✓ Supporting pages — About, FAQ, Blog with botanical headers and dividers — v1.1
- ✓ Navigation routing — /collections → /collections/all redirect, all stale links fixed — v1.1
- ✓ Navigation labels — 6 correct categories in header and footer everywhere — v1.1
- ✓ Trust cleanup — fake social proof, fake testimonials, fabricated stats all removed — v1.1
- ✓ Footer cleanup — dead links removed, SHOP column aligned with 6-category system — v1.1
- ✓ Security headers — CSP (Report-Only), HSTS, X-Frame-Options, X-Content-Type-Options — v1.2
- ✓ Pre-commit hooks — lefthook ESLint + tsc on every commit — v1.2
- ✓ Playwright E2E tests — 7 critical-path suites (homepage, collections, PDP, cart, checkout, search, category nav) — v1.2
- ✓ GitHub Actions CI/CD — lint + typecheck + build + E2E + secrets scan + audit on every PR — v1.2
- ✓ Vercel dev/prod environments — two projects, PR previews, OpenTofu IaC — v1.2
- ✓ Sentry error monitoring — production-only, server + client capture with TypeScript source maps — v1.2
- ✓ Legal pages — Privacy Policy, Terms of Service, Refund Policy via MDX at /legal/[slug] — v1.2
- ✓ Open Graph metadata + sitemap + robots.txt — v1.2
- ✓ JSON-LD Product schema + cookie consent banner — v1.2

### Active

<!-- v1.2 remaining goals -->

- [ ] Shopify go-live — products published, Shopify Payments configured, shipping/taxes set, test purchase completed (Phase 23)

### Out of Scope

- Admin dashboard real data — mock data is a known issue but not part of this milestone
- Admin auth security hardening — separate project
- New storefront features — reviews, bundles, gift notes, etc. — deferred to v2.0
- Mobile app — web-first, mobile later
- Paid monitoring or tooling — all tooling must have a usable free tier

## Context

**Two repos:**
- `shopSite` (this repo) — Next.js 16 + Shopify Storefront API. Keeper. Visual migration complete.
- `wildenflowerShop` at `/Users/jamesputman/SRC/wildenflowerShop` — React Native source of visual identity. Migration complete.

**Brand:** Wildenflower. Tagline: "Made by hand. Found by heart." Voice: warm, poetic, unhurried. Never corporate.

**Vercel:** Project currently deployed on Vercel hobby tier with a single environment. v1.2 adds a dev/prod split using two projects.

**GitHub:** Source is on GitHub. GitHub Actions CI/CD. Free tier (2,000 min/month) is sufficient for this store's volume.

## Constraints

- **Tech Stack**: Next.js 16 App Router, React 19, Tailwind CSS 4 — no framework changes
- **Shopify**: All e-commerce logic must remain intact — auth, cart mutations, product queries unchanged
- **OAuth**: The auth flow (`app/api/auth/customer/`) is fragile (no tests, complex cookie state) — no logic changes to auth routes in v1.2
- **Free tools only**: All CI/CD, monitoring, and IaC tooling must have a usable free tier
- **Fonts**: Playfair Display and Lora are Google Fonts — load via `next/font`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep shopSite, not wildenflowerShop | shopSite has better Shopify integration (OAuth, cart, account) | ✓ Good |
| Page-by-page migration with visual approval | Prevents "one shot" failures, user controls quality | ✓ Good |
| Tailwind CSS for design tokens | Already in use, extend theme rather than replace | ✓ Good |
| OpenTofu over Terraform | Free, open-source, fully compatible with Terraform providers; Terraform moved to BSL license | ✓ Good |
| PR-based trunk deployment | All work via PRs to main; main → dev; manual → prod | ✓ Good |
| Two Vercel projects for dev/prod | Clean environment isolation on free hobby tier | ✓ Good |
| Sentry production-only gating | Avoids burning free tier quota in dev; NODE_ENV===production check | ✓ Good |
| CSP Report-Only mode | Deploy permissive first, flip CSP_ENFORCE=true after confirming zero violations | — Pending |

## Current Milestone: v1.2 — Production Readiness & Go-Live

**Goal:** The store has a hardened CI/CD pipeline, secure and monitored deployments, and every Shopify prerequisite in place to begin accepting real orders.

**Target features:**
- CI/CD pipeline via GitHub Actions (lint + unit tests + Playwright + security scan + test artifacts)
- Pre-commit hooks (Husky + lint-staged)
- Vercel dev/prod environments with IaC (OpenTofu)
- Security headers, secrets scanning, Dependabot
- Sentry error monitoring (free tier)
- SEO verification — JSON-LD, OG tags, sitemap, robots.txt
- GDPR cookie consent banner
- Legal pages (Privacy Policy, Terms of Service, Refund Policy)
- Shopify go-live checklist — products, payment, shipping, taxes, test purchase

---
*Last updated: 2026-03-01 after v1.0 and v1.1 milestones archived; v1.2 in progress*
