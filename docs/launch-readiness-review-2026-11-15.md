# Wildenflower — Launch-Readiness Review, Gap Analysis, and Test/Security Plan

**Date:** 2026-11-15 · **Author:** Claude Code · **Status:** DRAFT for James
**Supersedes for execution:** `docs/qa-e2e-test-plan.md` (2026-06-21, never executed; its
parallel-agent execution model is dropped here in favour of plain sequential PRs).
**Method:** code read of `main` @ `f0b14f9` + read-only probes of `https://www.wildenflower.com`.
Items marked **[live]** were confirmed against production; **[code]** were read in source only.

---

## 1. Review plan (the lenses used)

| Lens | Question | What was examined |
|---|---|---|
| UX/UI | Would a stranger trust this shop and finish a purchase on a phone? | Live pages, placeholder content, dead-end features, forms |
| Security | What can an anonymous visitor do that they should not? | Every `app/api/**/route.ts`, auth libs, cookies, headers, CSP |
| Architecture | Is there surface we maintain that Shopify already does better? | Admin area, email routes, account extras, stubs |
| SDET | If something breaks, do we find out before a customer does? | `e2e/`, `scripts/*test*`, `playwright.config.ts`, CI workflow |

## 2. Findings

### 2.1 Security — fix before any marketing push

| # | Sev | Finding | Evidence |
|---|---|---|---|
| S1 | **Critical** | **Admin login can be bypassed by anyone.** The session cookie is the fixed string `authenticated_admin_user`; sending it by hand opens `/admin/*`. The customers page reads customer names/emails/spend through the Shopify Admin API. | **[live]** forged cookie → admin shell rendered ("Sign Out" present); without cookie → redirect to login. `lib/admin-auth.ts:12` |
| S2 | **Critical** | Fallback admin password is `admin123` if `ADMIN_PASSWORD` is unset; no rate limit or lockout on `/api/admin/login`. | **[code]** `lib/admin-auth.ts:4,16` (whether prod sets the env var was not checked) |
| S3 | **High** | **Ten `/api/email/*` routes are an open mail relay.** No auth: anyone can POST a recipient, name, cart URL and discount code and have it sent from `orders@wildenflower.com`. Phishing in your name, Resend quota burn, domain reputation damage. | **[live]** unauthenticated POST reaches validation (400 on empty body). **[code]** no auth check in any `app/api/email/*/route.ts` |
| S4 | **High** | Diagnostic routes are public: `/api/test-admin` (shop owner email, plan), `/api/test-customer-auth` (shop ID, client ID prefix, env state), `/api/test-shopify`. | **[live]** all return 200 |
| S5 | Medium | Open redirect after login: `returnTo` is stored unvalidated and passed to `new URL(returnTo, …)`, so `returnTo=https://evil.example` sends a freshly logged-in customer off-site. | **[code]** `app/api/auth/customer/authorize/route.ts:7`, `callback/route.ts:46-49` |
| S6 | Medium | No rate limiting on any public POST (`/api/reviews`, `/api/newsletter`, `/api/back-in-stock`, login). Reviews proxy can be used to flood Judge.me. | **[code]** |
| S7 | Medium | CSP is Report-Only and allows `'unsafe-inline'` scripts; no `Permissions-Policy`. HSTS, X-Frame-Options, nosniff are good. | **[live]** response headers; `next.config.ts:16` |
| S8 | Low | Stray debug files at repo root (`test-auth-flow.js`, `test-callback.js`, `test-shopify.ts`, `claudeLog`, `progress.txt`); `images.unsplash.com` still an allowed image host. | **[code]** |
| S9 | Low | Three Dependabot PRs open since July (one is a 23-package npm group). | `gh pr list` (#64, #78, #80) |

What is already right: webhook HMAC verification fails closed, customer OAuth uses PKCE + state +
httpOnly cookies, gitleaks + `npm audit` in hooks and CI, Sentry wired.

### 2.2 UX / content — what a buyer sees today

| # | Finding | Evidence |
|---|---|---|
| U1 | Catalog is still the two seed products (hoodie at $13, scarf at $62). Your photo/description work is the real launch gate. | **[live]** `/api/test-shopify` |
| U2 | About page shows Unsplash stock portraits as the makers, and stock "behind the scenes" photos. | **[code]** `components/about/meet-the-makers.tsx:19-37`, `behind-the-scenes.tsx`, `app/about/page.tsx:23` |
| U3 | Newsletter and back-in-stock forms say "you're on the list" but only `console.log` the address. Every signup is lost. | **[code]** `app/api/newsletter/route.ts:36`, `app/api/back-in-stock/route.ts:20` |
| U4 | Admin "sales" figures are random numbers; account area carries loyalty/referral/birthday/early-access sections with no backend. Each is a promise the shop cannot keep. | **[code]** `lib/admin-data.ts:49-70`, `components/account/*` (account sections not individually verified) |
| U5 | `/thank-you`, `/offline`, `/history`, `/local`, `/wishlist`, `/register` are all publicly reachable; not yet checked for whether each is linked, indexed, or orphaned. | **[live]** 200s |

### 2.3 Test coverage — what exists

9 Playwright specs / ~20 tests, 3 desktop browsers, run in CI on every PR. Covered: homepage
sections, one collection grid, Shop dropdown, URL search, PDP basics, add one item, remove it on a
phone viewport, checkout handoff to Shopify, booth, care guides. Plus pure-logic unit scripts
(button, entry, care, webhook).

## 3. Gap analysis vs. standard practice

| Area | Standard practice | Today | Gap |
|---|---|---|---|
| Test data | Isolated store / fixtures; tests never depend on the live catalog | Specs hard-code `shibori-indigo-scarf-2` on the **production** store | **Your product updates will break CI.** Biggest test risk. |
| Build under test | Production build (`next build && next start`) or the Vercel preview URL | `next dev --webpack` | Dev server hides prod-only bugs (CSP, caching, minification) |
| Devices | Mobile projects first for retail (most traffic) | Desktop Chrome/Firefox/Safari only; two ad-hoc phone viewports | No mobile Safari/Chrome project |
| Link integrity | Crawl every internal link on every PR; external links nightly | `scripts/validate-routes.ts` exists, not in CI | Not enforced |
| Cart flows | Add, add second, quantity up/down, remove one of two, persist across reload, stale cart recovery | Add one, remove one | Multi-item, quantity, persistence, subtotal math untested |
| Login / account | Redirect test + mocked-session UI tests + unit tests on callback | None | Zero auth coverage |
| Negative paths | 404 page, sold-out PDP, empty cart, API failure | None | Zero |
| Security regression | Tests that assert protected routes reject anonymous/forged requests | None | S1–S5 would not have been caught |
| Accessibility | axe scan on every key page in CI | `@axe-core/playwright` installed; separate script, not in CI | Not enforced |
| Runtime errors | Fail the test on any console error / uncaught exception / hydration warning | Not asserted | Silent breakage possible |
| Content quality | Automated catalog lint (images, alt text, description, price, collection) | None | Nothing guards the content you are about to enter |
| Post-deploy | Read-only smoke against prod after each deploy + scheduled synthetic check + uptime alert | None (merge to `main` deploys straight to prod) | No signal after deploy |
| Performance | Lighthouse budget in CI on home/PLP/PDP | Vercel Speed Insights only | No regression gate |
| Checkout completion | One scripted or manual test order per release in Shopify test mode | Stops at handoff | Acceptable — Shopify owns checkout; keep a manual release check |

## 4. Plan

Each phase is one branch + one PR (merge to `main` deploys prod, so nothing lands without your OK).

### Phase 0 — today, no code (≈15 min, James)
1. Vercel → Firewall → custom rule: **deny** paths starting `/admin`, `/api/admin`, `/api/test-`,
   `/api/email/`. Takes effect immediately; webhooks (`/api/webhooks/*`) are unaffected because
   they call `lib/email.ts` directly, not the HTTP routes *(confirm in Phase 1 before deleting)*.
2. Resend dashboard → check recent sends for anything you did not trigger.
3. Vercel logs → search `/admin` and `/api/email` for unfamiliar traffic.

### Phase 1 — security hardening PR
- **Delete the custom admin** (`app/admin`, `app/api/admin`, `lib/admin-auth.ts`, `lib/admin-data.ts`).
  Shopify admin already does inventory/sales/customers with real auth and 2FA. Removing it is
  smaller and safer than fixing it. *(Decision for James — alternative is signed sessions + real auth.)*
- Delete `/api/test-*` routes and the root debug files.
- `/api/email/*`: delete all ten — grep found no caller anywhere in `app/`, `components/`, `lib/`
  (webhooks use `lib/email.ts` directly).
- Validate `returnTo`: accept only paths starting with a single `/`.
- Rate-limit public POSTs (Vercel WAF rate rule is the no-new-dependency option).
- Add `Permissions-Policy`; `robots.ts` disallow `/account`, `/api`; drop the Unsplash image host once U2 is done.
- CSP: collect a week of report-only violations, then enforce (nonce-based scripts as a follow-up).
- Triage Dependabot #64/#78/#80.
- **Tests added with it** (`e2e/security.spec.ts`, request-level): forged admin cookie rejected ·
  test routes 404 · email routes reject anonymous POST · external `returnTo` lands same-origin ·
  security headers present.

### Phase 2 — test foundation PR
- **Separate Shopify dev store for CI** (free via Shopify Partners) seeded with 4–5 permanent fixture
  products: simple, multi-variant, sold-out, one-of-one, small-run. CI secrets point there; prod
  catalog is yours to edit freely. *(James: create store + tokens.)*
- Shared fixture: fail on console errors, uncaught exceptions, hydration warnings; auto-dismiss cookie banner.
- `playwright.config.ts`: run against production build; add `Pixel 7` and `iPhone 14` projects;
  accept `BASE_URL` so the same suite runs against a Vercel preview or prod.
- Tag tests `@smoke` (read-only, safe on prod) vs `@full`.

### Phase 3 — E2E suite PR(s)

| Journey | Assertions |
|---|---|
| **Links** | Crawl from `/`: every internal `<a>` returns <400, no `#`/empty hrefs; header, footer, mobile nav, breadcrumbs, sitemap URLs all resolve; legal pages render |
| **Browse** | Home → collection → PDP; filters and sort change the grid; search finds a fixture product; 404 page for a bad handle |
| **Cart: build** | Add product A → drawer shows A, count 1 → continue shopping → add product B → count 2, both lines, subtotal = A + B |
| **Cart: edit** | Quantity + / − updates line and subtotal; remove A leaves B; remove B shows empty state; reload keeps the cart |
| **Cart: edge** | Sold-out PDP cannot be added; variant must be chosen on multi-variant product; expired cart ID recovers |
| **Checkout** | Proceed to Checkout lands on Shopify checkout with the right line items (stop there; no payment) |
| **Login (tier 1)** | `/account` logged-out → `/login` → redirect to Shopify auth with `state` + `code_challenge`; callback with wrong state → error page |
| **Account (tier 2)** | Mock `/api/auth/customer/me` + orders/addresses → account page renders name, orders, addresses; logout clears session |
| **Login (tier 3, manual)** | Real login with a test customer once per release (Shopify emails a one-time code, so not automatable without inbox plumbing) |
| **Forms** | Review form validation + submit (mocked upstream); newsletter; contact |
| **Accessibility** | axe: zero serious/critical on home, collection, PDP, cart drawer open, care guides, shipping-returns |
| **SEO** | Each page: unique title, description, canonical on wildenflower.com, valid Product JSON-LD with real price/availability |

### Phase 4 — content QA gate (supports your photo/description/maker work)
- `scripts/catalog-lint.ts` (read-only Storefront API, runs against **prod** on demand + nightly):
  every published product has ≥3 images with alt text, description ≥ N words with no placeholder
  text, price > 0, belongs to a collection, has `custom.technique`/`maker`/`edition`; flags empty
  collections. Prints a to-do list you can work down as you upload.
- Maker profiles: replace Unsplash portraits; a test asserts no `unsplash.com` URL remains in `app/`, `components/`.
- Fix U3: send newsletter/back-in-stock addresses somewhere real (Shopify customer with marketing
  consent is the no-new-vendor option) or remove the forms.
- Decide U4: remove unbacked account sections or hide until real.

### Phase 5 — keep it honest after launch
- GitHub Action after each prod deploy: run `@smoke` against `https://www.wildenflower.com`.
- Nightly cron: `@smoke` + external link check + catalog lint; failure opens an issue.
- Uptime monitor (free tier) on `/` and one PDP; Sentry alert rule to your email.
- Lighthouse CI budget on home / collection / PDP (mobile).
- Release checklist: one real test order in Shopify test mode → confirmation email arrives → refund.

## 5. Decisions needed from James
1. Delete custom admin (recommended) vs. rebuild its auth.
2. Create a Shopify dev store for CI (recommended) vs. hidden fixture products on the prod store.
3. Where newsletter emails should go (Shopify customers / Resend audience / other).
4. Keep or remove the unbacked account features.

## 6. Not done in this review
- No fixes applied; nothing committed. This file is untracked.
- `npm audit`, local test run, and Lighthouse were not executed this session.
- Account-area components, `public/sw.js`, `lib/cart-store.ts`, customer addresses/orders routes were not read line by line.
- Whether the five email-like strings on the live admin customers page are real customers or mock rows was deliberately not inspected.
