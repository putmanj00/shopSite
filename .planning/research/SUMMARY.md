# Research Summary — v1.2 Production Readiness

**Synthesized:** 2026-02-27
**Sources:** FEATURES.md (full); STACK.md, ARCHITECTURE.md, PITFALLS.md incomplete (rate-limited)

---

## Stack Additions Needed

| Tool | Package | Purpose | Free? |
|------|---------|---------|-------|
| Sentry | `@sentry/nextjs` (latest) | Error monitoring, App Router support | ✓ Free tier (5k errors/mo) |
| Playwright | Already installed | E2E test runner | ✓ |
| Husky | `husky` | Pre-commit hooks | ✓ |
| lint-staged | `lint-staged` | Staged file linting | ✓ |
| OpenTofu | CLI install | IaC for Vercel config | ✓ Open source |
| Vercel Terraform provider | `vercel/vercel` | OpenTofu Vercel resources | ✓ |
| Gitleaks / GitHub Secret Scanning | Native GitHub (or `gitleaks` action) | Secrets detection in CI | ✓ |
| cookieconsent (orestbida) OR custom | `vanilla-cookieconsent` or custom | GDPR consent banner | ✓ |

**Do NOT add:** Jest (TypeScript + E2E replaces unit tests for this codebase), paid GDPR services, Terraform Cloud for state.

---

## Key Findings

### CI/CD: No Unit Tests Needed
The codebase has no meaningful business logic to unit test — it's Shopify API plumbing. TypeScript strict mode + `next build` + Playwright E2E covers the real failure modes. Adding Jest would add maintenance cost without catching real bugs. Correct CI stance: lint + typecheck + build + 5–8 Playwright flows.

### Playwright: Shopify Checkout Is Untestable E2E
Shopify's checkout runs on a different domain with anti-bot protection. Tests can verify the checkout URL is generated correctly and the redirect is initiated — but cannot test payment entry or order completion. Test checkout via Shopify's manual bogus gateway test, not Playwright.

### GDPR: Build Custom Banner
Headless storefronts don't get Shopify's built-in GDPR banner. Must build own. A ~100-line React component storing consent in localStorage is sufficient and compliant for a small store. Vercel Analytics is already cookie-free — no consent required for it.

### OpenTofu: Local State Acceptable for Solo Dev
Terraform Cloud adds account dependency. For a two-project Vercel setup, local `terraform.tfstate` (gitignored) is viable. Manage: project config, non-secret env var names, custom domain. Leave secrets out of IaC files.

### Sentry: Disable in Dev
Enable Sentry only in `NODE_ENV === 'production'`. Free tier is 5k errors/month — easily exhausted by development noise. Three config files + `next.config.ts` wrapper. Use `tracesSampleRate: 0.1` for performance monitoring.

### Shopify Go-Live: Headless-Specific Items
Standard checklists miss headless-specific items: API token permissions, cart→checkout URL generation test, collection handle audit, store password removal. Test order using Shopify bogus gateway is required before disabling test mode.

---

## Feature Priority

### P1 — Required for Launch
1. Shopify go-live checklist (products, payments, shipping, taxes, test order)
2. Sentry error monitoring (you need visibility from first real user)
3. GDPR cookie consent banner (legal requirement for EU)
4. Legal pages (Privacy Policy, Terms, Refund — required by Shopify)
5. GitHub Actions CI pipeline (gate on PRs)
6. Playwright E2E: 5–8 critical flows (homepage, collection, PDP, add-to-cart, checkout redirect, search)

### P2 — Add Before or Soon After Launch
7. Pre-commit hooks (Husky + lint-staged)
8. OpenTofu Vercel IaC (dev/prod environment split)
9. Security headers (CSP, HSTS, X-Frame-Options)
10. Dependabot (5-min GitHub config)
11. SEO verification (JSON-LD, OG tags, sitemap, robots.txt)

### P3 — Future
- Auth E2E tests (OAuth flow is fragile, cross-domain)
- Performance budgets in CI (Lighthouse CI)
- Unit tests (only if business logic grows)

---

## Feature Dependencies

```
Legal Pages → Cookie Consent Banner (must link to policy)
Playwright tests → CI E2E job (needs test files to exist)
Shopify test order → Shopify go-live (hard prerequisite)
Sentry → Production deployment (disable in dev)
```

---

## Watch Out For

1. **CSP + Shopify checkout**: Content Security Policy must allow `checkout.shopify.com` and `*.myshopify.com` or checkout redirect breaks
2. **Vercel env vars in CI**: `NEXT_PUBLIC_*` vars must be injected at build time in GitHub Actions or next build fails
3. **Sentry in dev**: Will burn free tier quota. Gate on `NODE_ENV === 'production'`
4. **Store password**: Shopify stores have a "coming soon" password page enabled by default — must be disabled before go-live
5. **OAuth redirect URIs**: Adding a second Vercel project (dev) means adding its URL to the Shopify Customer Account API allowed redirect URIs
6. **OpenTofu state**: `terraform.tfstate` must be in `.gitignore` — it may contain sensitive infrastructure data
