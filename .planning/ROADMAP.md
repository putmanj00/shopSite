# Roadmap: Wildenflower shopSite

## Milestones

- ✅ **v1.0 Visual Migration** — Phases 1–9 (shipped 2026-02-26)
- ✅ **v1.1 UX Cleanup & Navigation** — Phases 10–15 (shipped 2026-02-26)
- 🚧 **v1.2 Production Readiness & Go-Live** — Phases 16–23 (in progress)

## Phases

<details>
<summary>✅ v1.0 Visual Migration (Phases 1–9) — SHIPPED 2026-02-26</summary>

- [x] Phase 1: Design Foundation (3/3 plans) — completed 2026-02-24
- [x] Phase 2: Header (1/1 plan) — completed 2026-02-24
- [x] Phase 3: Homepage (4/4 plans) — completed 2026-02-24
- [x] Phase 4: Product Detail (3/3 plans) — completed 2026-02-24
- [x] Phase 5: Supporting Pages (3/3 plans) — completed 2026-02-26
- [x] Phase 6: Copy & Brand Cleanup (inline) — completed 2026-02-24
- [x] Phase 7: Cart & Conversion UX (inline) — completed 2026-02-24
- [x] Phase 8: SEO Enhancement (inline) — completed 2026-02-24
- [x] Phase 9: Performance & Deps (inline) — completed 2026-02-24

Full details: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

</details>

<details>
<summary>✅ v1.1 UX Cleanup & Navigation (Phases 10–15) — SHIPPED 2026-02-26</summary>

- [x] Phase 10: Trust Cleanup (4/4 plans) — completed 2026-02-26
- [x] Phase 11: Navigation Routing (3/3 plans) — completed 2026-02-26
- [x] Phase 12: Navigation Labels (3/3 plans) — completed 2026-02-26
- [x] Phase 13: Product Data Quality (3/3 plans) — completed 2026-02-26
- [x] Phase 14: Collections Polish (1/1 plan) — completed 2026-02-26
- [x] Phase 15: Footer Cleanup (1/1 plan) — completed 2026-02-26

Full details: [milestones/v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md)

</details>

### 🚧 v1.2 Production Readiness & Go-Live (Phases 16–23)

**Milestone Goal:** The store has a hardened CI/CD pipeline, secure and monitored deployments, legal compliance in place, and every Shopify prerequisite satisfied to begin accepting real orders.

**Phase summary:**
- [ ] **Phase 16: Legal Pages & SEO Metadata** - Publish Privacy Policy, Terms, Refund Policy; add Open Graph tags, sitemap, robots.txt
- [x] **Phase 17: Cookie Consent & Product Schema** - GDPR cookie consent banner; JSON-LD Product schema on product pages (completed 2026-02-27)
- [x] **Phase 18: Security & Dev Tooling** - Security headers (CSP/HSTS/X-Frame), git history secrets scan, pre-commit hooks, Dependabot (completed 2026-02-28)
- [x] **Phase 19: Playwright E2E Tests** - Write all 7 critical-path test suites (homepage, collections, PDP, cart, checkout redirect, search, category nav) (completed 2026-02-28)
- [x] **Phase 20: CI/CD Pipeline** - GitHub Actions: lint + typecheck + build + E2E + secrets scan + audit; branch protection on main (completed 2026-02-28)
- [x] **Phase 21: Vercel Environments & IaC** - Dev/prod Vercel project split; OpenTofu declares both projects and env var structure (completed 2026-03-01)
- [x] **Phase 22: Error Monitoring** - Sentry integrated for Next.js 16 App Router; production-only; server + client capture (completed 2026-03-01)
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
**Plans**: 2 plans

Plans:
- [x] 17-01-PLAN.md — Cookie consent banner component with localStorage persistence and Privacy Policy link (GDPR-01, GDPR-02)
- [x] 17-02-PLAN.md — JSON-LD Product schema on product detail pages (SEO-01)

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
**Plans**: 3 plans

Plans:
- [x] 18-01-PLAN.md — Security headers (CSP Report-Only, HSTS, X-Frame-Options, X-Content-Type-Options) in next.config.ts (SEC-01)
- [x] 18-02-PLAN.md — gitleaks secrets scan + .gitignore audit + lefthook pre-commit (ESLint + tsc) + Dependabot (SEC-02, SEC-03, DEVX-01, DEVX-02, CICD-06)
- [x] 18-03-PLAN.md — Human verification checkpoint: securityheaders.com check + confirm pre-commit hook blocks bad commits

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
- [x] 19-01-PLAN.md — Playwright config, browser binaries, data-testid additions, structural tests: homepage (E2E-01), collections (E2E-02), category-nav (E2E-07)
- [x] 19-02-PLAN.md — Human checkpoint: create Test Product in Shopify admin, record handle + title in test-product.md
- [x] 19-03-PLAN.md — Product-dependent read-only tests: PDP (E2E-03), search (E2E-06)
- [x] 19-04-PLAN.md — Cart-mutating tests: add-to-cart (E2E-04), checkout redirect (E2E-05)

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
- [x] 20-01-PLAN.md — npm audit pre-flight + playwright.config.ts multi-browser update (CICD-02, CICD-05)
- [x] 20-02-PLAN.md — GitHub Actions CI workflow: quality, E2E matrix, secrets scan, audit, deploy-prod (CICD-01, CICD-02, CICD-03, CICD-04, CICD-05, CICD-07)
- [x] 20-03-PLAN.md — Push to trigger first CI run, configure production environment and branch protection (CICD-07, DEVX-03)

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
- [x] 21-03-PLAN.md — Wire CI deploy-prod job to Vercel CLI, verify preview deployments and prod gate (VERC-01, VERC-02, VERC-03)

### Phase 22: Error Monitoring
**Goal**: Unhandled errors in production are automatically captured in Sentry with full stack traces — no silent failures reach real users undetected
**Depends on**: Phase 21 (production Vercel project must exist — Sentry is production-only)
**Requirements**: MON-01, MON-02, MON-03
**Success Criteria** (what must be TRUE):
  1. The Sentry dashboard shows the Wildenflower project receiving events — triggering a test error in production results in a visible issue in Sentry within 60 seconds
  2. Running the dev server locally (`NODE_ENV=development`) does not send any events to Sentry — the Sentry dashboard shows no development-origin errors
  3. An unhandled server-side error (e.g., a thrown exception in a route handler) and an unhandled client-side error (e.g., an uncaught promise rejection) both appear in Sentry with readable TypeScript source in the stack trace
**Plans**: 4 plans

Plans:
- [x] 22-01-PLAN.md — Human action: create Sentry account + wildenflower project, set SENTRY_DSN + NEXT_PUBLIC_SENTRY_DSN + SENTRY_AUTH_TOKEN in Vercel prod env and GitHub Secrets (MON-01, MON-02)
- [x] 22-02-PLAN.md — Install @sentry/nextjs, create 4 config files (instrumentation.ts, instrumentation-client.ts, sentry.server.config.ts, sentry.edge.config.ts), wrap next.config.ts with withSentryConfig (MON-01, MON-02)
- [x] 22-03-PLAN.md — Wire captureException into error.tsx + global-error.tsx, create temporary /sentry-test page, add SENTRY_AUTH_TOKEN to CI build step (MON-02, MON-03)
- [x] 22-04-PLAN.md — Human verify: confirm events in Sentry dashboard (server + client), delete /sentry-test routes (MON-01, MON-02, MON-03)

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
**Plans**: 3 plans

Plans:
- [ ] 23-01-PLAN.md — Webhook endpoint (app/api/webhooks/order-created/route.ts), lib/email.ts from address update, pre-filled 23-VERIFICATION.md runbook (SHOP-08, SHOP-01, SHOP-02, SHOP-03, SHOP-04, SHOP-05, SHOP-06, SHOP-07)
- [ ] 23-02-PLAN.md — Human action: verify wildenflower.com in Resend, register Shopify webhook, set SHOPIFY_WEBHOOK_SECRET in Vercel prod (SHOP-08)
- [ ] 23-03-PLAN.md — Human execution of 23-VERIFICATION.md runbook for all SHOP-01 through SHOP-08, commit completed doc (SHOP-01, SHOP-02, SHOP-03, SHOP-04, SHOP-05, SHOP-06, SHOP-07, SHOP-08)

## v1.2 Progress

**Execution Order:**
Phases execute in numeric order: 16 → 17 → 18 → 19 → 20 → 21 → 22 → 23
(Phases 16, 18, and 19 have no interdependency — they can begin in parallel)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 16. Legal Pages & SEO Metadata | v1.2 | 3/3 | Complete | 2026-02-28 |
| 17. Cookie Consent & Product Schema | v1.2 | 2/2 | Complete | 2026-02-27 |
| 18. Security & Dev Tooling | v1.2 | 3/3 | Complete | 2026-02-28 |
| 19. Playwright E2E Tests | v1.2 | 4/4 | Complete | 2026-02-28 |
| 20. CI/CD Pipeline | v1.2 | 3/3 | Complete | 2026-02-28 |
| 21. Vercel Environments & IaC | v1.2 | 3/3 | Complete | 2026-03-01 |
| 22. Error Monitoring | v1.2 | 4/4 | Complete | 2026-03-01 |
| 23. Shopify Go-Live Verification | 1/3 | In Progress|  | - |
