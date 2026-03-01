# Requirements: Wildenflower — v1.2 Production Readiness & Go-Live

**Defined:** 2026-02-27
**Core Value:** A shopper lands on a beautiful, nature-inspired handmade goods storefront and immediately feels the warmth and authenticity of the Wildenflower brand — while the Shopify integration underneath works reliably.

---

## Milestone v1.0 Requirements (Completed)

All DESIGN, HEAD, HOME, PROD, SUPP requirements complete. Full records in `.planning/phases/01–05`.

---

## Milestone v1.1 Requirements (Completed)

All TRST, NAV, PRDS, COLL, FOOT, COLL-EXT requirements complete. Full records in `.planning/phases/10–15`.

---

## v1.2 Requirements

Requirements for Production Readiness & Go-Live milestone. Phases continue numbering from Phase 16.

### Development Infrastructure (DEVX)

- [x] **DEVX-01**: Pre-commit hook runs ESLint on staged files before every commit
- [x] **DEVX-02**: Pre-commit hook runs TypeScript type-check before every commit
- [x] **DEVX-03**: Main branch requires PR with passing CI before merge (branch protection rule)

### CI/CD Pipeline (CICD)

- [x] **CICD-01**: GitHub Actions CI runs lint + typecheck + build on every PR against main
- [x] **CICD-02**: GitHub Actions CI runs Playwright E2E tests on every PR (critical user flows)
- [x] **CICD-03**: CI uploads Playwright HTML report as a downloadable artifact on every run
- [x] **CICD-04**: CI runs secrets scan on every PR — blocks merge if secrets detected
- [x] **CICD-05**: CI runs `npm audit` and fails on high/critical severity vulnerabilities
- [x] **CICD-06**: Dependabot configured to open PRs for npm dependency updates weekly
- [x] **CICD-07**: Production deployment requires manual approval via GitHub environment gate

### Playwright E2E Tests (E2E)

- [x] **E2E-01**: Test — homepage loads with hero image, navigation, and product section visible
- [x] **E2E-02**: Test — `/collections/all` page loads with product grid visible
- [ ] **E2E-03**: Test — product detail page loads with image, price, and add-to-cart button
- [ ] **E2E-04**: Test — adding a product to cart updates cart count and opens cart drawer
- [ ] **E2E-05**: Test — checkout button initiates redirect to a Shopify checkout URL
- [ ] **E2E-06**: Test — search returns results for a known product query
- [x] **E2E-07**: Test — category navigation links to correct collection page

### Vercel Environments (VERC)

- [x] **VERC-01**: Dev Vercel project exists and auto-deploys on every merge to main
- [x] **VERC-02**: Prod Vercel project exists with custom domain — deploys via manual promote only
- [x] **VERC-03**: PR preview deployments auto-generate per PR
- [x] **VERC-04**: Dev and prod each have their own scoped environment variables

### Infrastructure as Code (INFRA)

- [x] **INFRA-01**: OpenTofu configuration declares both Vercel projects (dev + prod) as code
- [x] **INFRA-02**: OpenTofu manages non-secret environment variable names and structure per project
- [x] **INFRA-03**: OpenTofu state file is gitignored; setup documented

### Security (SEC)

- [x] **SEC-01**: Security headers on all responses — CSP (allows `*.shopify.com`, `checkout.shopify.com`), HSTS, X-Frame-Options, X-Content-Type-Options
- [x] **SEC-02**: Existing git history scanned for committed secrets — clean confirmed
- [x] **SEC-03**: All `.env*` files verified in `.gitignore`

### Error Monitoring (MON)

- [x] **MON-01**: Sentry `@sentry/nextjs` installed and configured for Next.js 16 App Router (client + server)
- [x] **MON-02**: Sentry only active in `NODE_ENV === 'production'` — not in development
- [x] **MON-03**: Sentry captures unhandled errors via server instrumentation and `global-error.tsx`

### SEO (SEO)

- [ ] **SEO-01**: Product detail pages include JSON-LD Product schema structured data
- [ ] **SEO-02**: All public pages have Open Graph meta tags (title, description, image)
- [ ] **SEO-03**: `sitemap.xml` is generated and includes product and collection pages
- [ ] **SEO-04**: `robots.txt` allows crawling of product/collection pages; blocks `/api/` and `/admin`

### Privacy & Legal (GDPR)

- [ ] **GDPR-01**: Cookie consent banner displayed on first visit — accept/reject, links to Privacy Policy
- [ ] **GDPR-02**: Consent choice persisted in localStorage — banner not shown again after choice made
- [ ] **GDPR-03**: Privacy Policy page published and accessible from footer
- [ ] **GDPR-04**: Terms of Service page published and accessible from footer
- [ ] **GDPR-05**: Refund Policy page published and accessible from footer

### Shopify Go-Live (SHOP)

- [x] **SHOP-01**: All products published in Shopify with images, descriptions, prices, and inventory configured
- [x] **SHOP-02**: Shopify Payments configured; test order placed using bogus gateway and succeeded
- [x] **SHOP-03**: Shipping zones and rates configured for intended delivery regions
- [x] **SHOP-04**: Tax settings configured for applicable markets
- [x] **SHOP-05**: Store password ("coming soon") page disabled
- [x] **SHOP-06**: Storefront API token confirmed valid with correct permissions on production store
- [x] **SHOP-07**: Collection handles in Shopify match URL routes in storefront (`/collections/[handle]`)
- [x] **SHOP-08**: Order confirmation email (Resend) verified to send after a test purchase

---

## Out of Scope

| Feature | Reason |
|---------|---------|
| Jest unit tests | TypeScript + E2E covers this codebase — no business logic to unit test |
| Playwright checkout completion test | Shopify checkout is cross-domain + anti-bot protected — untestable via Playwright |
| Playwright OAuth login test | Auth flow is fragile, cross-domain — skip in v1.2 |
| Paid GDPR consent services (OneTrust, Cookiebot) | Free custom banner is sufficient and compliant for small store |
| Terraform Cloud remote state | Local state acceptable for solo dev two-project setup |
| Admin dashboard real data | Separate project |
| New storefront features | Go-live focus only — new capabilities in v2.0 |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DEVX-01 | Phase 18 | Complete |
| DEVX-02 | Phase 18 | Complete |
| DEVX-03 | Phase 20 | Complete |
| CICD-01 | Phase 20 | Complete |
| CICD-02 | Phase 20 | Complete |
| CICD-03 | Phase 20 | Complete |
| CICD-04 | Phase 20 | Complete |
| CICD-05 | Phase 20 | Complete |
| CICD-06 | Phase 18 | Complete |
| CICD-07 | Phase 20 | Complete |
| E2E-01 | Phase 19 | Complete |
| E2E-02 | Phase 19 | Complete |
| E2E-03 | Phase 19 | Pending |
| E2E-04 | Phase 19 | Pending |
| E2E-05 | Phase 19 | Pending |
| E2E-06 | Phase 19 | Pending |
| E2E-07 | Phase 19 | Complete |
| VERC-01 | Phase 21 | Complete |
| VERC-02 | Phase 21 | Complete |
| VERC-03 | Phase 21 | Complete |
| VERC-04 | Phase 21 | Complete |
| INFRA-01 | Phase 21 | Complete |
| INFRA-02 | Phase 21 | Complete |
| INFRA-03 | Phase 21 | Complete |
| SEC-01 | Phase 18 | Complete |
| SEC-02 | Phase 18 | Complete |
| SEC-03 | Phase 18 | Complete |
| MON-01 | Phase 22 | Complete |
| MON-02 | Phase 22 | Complete |
| MON-03 | Phase 22 | Complete |
| SEO-01 | Phase 17 | Pending |
| SEO-02 | Phase 16 | Pending |
| SEO-03 | Phase 16 | Pending |
| SEO-04 | Phase 16 | Pending |
| GDPR-01 | Phase 17 | Pending |
| GDPR-02 | Phase 17 | Pending |
| GDPR-03 | Phase 16 | Pending |
| GDPR-04 | Phase 16 | Pending |
| GDPR-05 | Phase 16 | Pending |
| SHOP-01 | Phase 23 | Complete |
| SHOP-02 | Phase 23 | Complete |
| SHOP-03 | Phase 23 | Complete |
| SHOP-04 | Phase 23 | Complete |
| SHOP-05 | Phase 23 | Complete |
| SHOP-06 | Phase 23 | Complete |
| SHOP-07 | Phase 23 | Complete |
| SHOP-08 | Phase 23 | Complete |

**Coverage:**
- v1.2 requirements: 47 total
- Mapped to phases: 47
- Unmapped: 0

---
*Requirements defined: 2026-02-27*
*Last updated: 2026-02-27 — traceability table populated after roadmap creation*
