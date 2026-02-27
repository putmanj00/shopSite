# Feature Research

**Domain:** Production readiness for a Next.js 16 + Shopify headless storefront
**Researched:** 2026-02-27
**Confidence:** HIGH (CI/CD, Playwright, Sentry), MEDIUM (OpenTofu/Vercel IaC, GDPR), HIGH (Shopify go-live)

---

## Feature Landscape

This research covers six discrete feature areas for the Wildenflower v1.2 production readiness milestone. Each is assessed for: what's table stakes vs. optional, Shopify-specific vs. generic Next.js behavior, and implementation complexity.

---

## 1. GitHub Actions CI/CD Pipeline

### What It Is

A YAML-driven automation system that runs quality checks on every PR and deploys on merge. Lives in `.github/workflows/`.

### Standard Jobs for a Next.js Storefront

| Job | Trigger | Purpose | Table Stakes? |
|-----|---------|---------|---------------|
| `lint` | PR + push | ESLint code quality gate | YES |
| `typecheck` | PR + push | `tsc --noEmit` — catches type errors before runtime | YES |
| `build` | PR + push | Ensures the Next.js build succeeds (catches missing env vars, broken imports) | YES |
| `e2e` | PR + push | Playwright tests for critical user flows | YES for storefront |
| `security-scan` | PR + push | `npm audit` or `trivy` for dependency vulnerabilities | RECOMMENDED |
| `test-artifacts` | on failure | Upload Playwright HTML report as GitHub artifact | YES (useless without this) |

### Standard Triggers

```yaml
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
```

- PRs against `main`: Run all CI jobs. Block merge on failure.
- Push to `main` (after merge): Vercel auto-deploys to dev environment.
- Deployment to prod: Manual promote via Vercel dashboard (not a CI trigger).

### Test Coverage Level for a Small Storefront

For a small handmade goods storefront, unit test coverage is NOT a meaningful metric. The right approach is:

- **No unit tests required**: The codebase has no business logic that isn't Shopify API plumbing. Unit testing Shopify query wrappers adds maintenance cost without catching real bugs.
- **E2E tests are the meaningful coverage**: Critical paths (browse, cart, auth) tested end-to-end catches real failures.
- **Type checking replaces many unit tests**: TypeScript + `tsc --noEmit` in CI catches the class of bugs unit tests would catch.
- **Build job is the smoke test**: A successful `next build` verifies imports, env var shape, and static generation.

Appropriate CI stance: lint + typecheck + build + 5-8 Playwright E2E tests. No Jest, no coverage thresholds.

### Job Dependencies (run order)

```
lint ──┐
       ├──> e2e (needs: lint, typecheck)
typecheck ─┘
build (runs in parallel — verifies build independently)
```

### Shopify-Specific Concerns

- **Secret management**: `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `SHOPIFY_STORE_DOMAIN`, `RESEND_API_KEY` must be stored as GitHub Actions secrets, not in YAML.
- **Test environment**: E2E tests against a dev Shopify store (not prod). Use a Shopify development store with test mode enabled.
- **Build-time env vars**: `NEXT_PUBLIC_*` vars must be present at build time — CI must inject them.

### Complexity

LOW. GitHub Actions is well-documented for Next.js. The project already has `eslint`, `tsc`, and `playwright` as devDependencies. This is wiring existing tools together.

---

## 2. Playwright E2E Tests

### Critical User Flows to Test

These are the flows where a bug causes a real business failure (lost sale, broken checkout, auth failure):

| Flow | Priority | What to Assert | Shopify-Specific? |
|------|----------|---------------|-------------------|
| Homepage loads | P1 | Page renders, hero visible, no console errors | No |
| Collection browsing | P1 | Products appear, category nav works | Yes — Shopify GraphQL |
| Product detail page | P1 | Images load, variant selector works, price correct | Yes |
| Add to cart | P1 | Cart count updates, drawer opens, item visible | Yes — Shopify cart mutation |
| Cart persistence | P2 | Refresh page, cart still has items | Yes — Zustand + localStorage |
| Search | P2 | Query returns results, result links work | Yes — Shopify predictive search |
| Checkout redirect | P1 | "Checkout" button navigates to Shopify checkout URL | Yes — see limitation below |
| Auth login flow | P3 | Login page loads, redirect works | Yes — OAuth PKCE, fragile |

### The Shopify Checkout Testing Limitation (Critical Gotcha)

**Shopify checkout runs on a completely different domain** (e.g., `checkout.shopify.com` or `<store>.myshopify.com/checkouts/`). Playwright tests running against your Next.js storefront domain **cannot follow the checkout redirect** because:

1. Cross-domain redirect leaves your storefront's browsing context.
2. Shopify's checkout page has anti-bot protection that blocks headless browsers.
3. The checkout URL contains a cart token — testing checkout completion would require real payment credentials.

**What you CAN test**: That clicking "Checkout" generates a valid `checkoutUrl` and initiates the redirect (assert `page.url()` starts with Shopify's checkout domain). You cannot test checkout completion.

**What you CANNOT test**: Payment entry, order confirmation, post-checkout state.

### Auth Flow Testing Caveat

The existing OAuth PKCE auth flow (`app/api/auth/customer/`) is explicitly marked as fragile with no existing tests. Playwright login tests against Shopify's Customer Account API login page face the same cross-domain and anti-bot limitations as checkout. Recommendation: **skip auth E2E tests in v1.2**. Test auth-gated pages with a pre-seeded auth cookie state if needed later.

### Test Infrastructure

- Playwright is already installed as a devDependency (`^1.40.0`).
- `@axe-core/playwright` already installed — accessibility assertions can be included.
- Use `playwright.config.ts` at project root.
- Tests live in `e2e/` or `tests/` directory.
- CI uploads `playwright-report/` as artifact on failure using `actions/upload-artifact@v4`.

### Complexity

MEDIUM. Playwright setup is low complexity. The complexity comes from writing stable selectors on a Shopify-driven UI (product data changes). Use data-testid attributes on critical elements to make tests resilient.

---

## 3. OpenTofu for Vercel Infrastructure

### What OpenTofu Manages

OpenTofu is a drop-in open-source replacement for Terraform (forked at Terraform 1.6.x, MPL licensed, Linux Foundation). The Vercel Terraform provider (`vercel/vercel`) works identically with OpenTofu.

### Vercel Resources Available in IaC

| Resource | What It Does | Manage in IaC? |
|----------|-------------|----------------|
| `vercel_project` | Creates/configures a Vercel project (framework, build command, output dir) | YES |
| `vercel_project_environment_variable` | Sets env vars per environment (production/preview/development) | YES — non-secret values |
| `vercel_project_domain` | Assigns custom domain to project | YES |
| `vercel_deployment` | Triggers a deployment | NO — let Vercel Git integration handle |
| `vercel_team` | Manages team membership | NO — not needed on hobby |

### What to Manage vs. Leave Manual

**Manage in IaC (OpenTofu):**
- Project settings (framework = `nextjs`, build command, install command, output directory)
- Environment variable names and non-secret values (e.g., `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`)
- Custom domain assignment
- Two project declarations: `wildenflower-dev` and `wildenflower-prod`

**Leave Manual:**
- Secret values: Shopify access tokens, Resend API key, OAuth secrets — these go in Vercel's encrypted env var UI (or GitHub Secrets for CI). Never in `.tf` files.
- Vercel Git integration connection — done once in Vercel dashboard, not supported by provider.
- Vercel hobby plan billing — not IaC-manageable.
- PR preview environment URLs — generated automatically by Vercel.

### State Management Caveat

OpenTofu state file (`terraform.tfstate`) must be stored remotely (not committed to git — it may contain sensitive data). Free options: Terraform Cloud free tier, or an S3-compatible bucket. For a hobby project, local state in a gitignored file is acceptable initially.

### Two-Project Architecture

The plan calls for two Vercel projects:
1. `wildenflower-dev` — receives auto-deploys from `main` branch merges. PR previews point here.
2. `wildenflower-prod` — manual promote. Custom domain attached here.

Both declared as `vercel_project` resources in OpenTofu. Environment variables scoped separately per project.

### Complexity

MEDIUM. OpenTofu itself is low complexity. The friction is: (1) Vercel API token needed for provider auth, (2) initial state bootstrap (`tofu import` for any existing projects), (3) secret value handling pattern must be decided upfront. This is high value — environment drift between dev/prod is a real problem without IaC.

---

## 4. Sentry Error Monitoring

### How It Works for Next.js 16 App Router

Sentry's Next.js SDK (`@sentry/nextjs`) uses three configuration files plus a webpack plugin:

| File | Runtime | What It Captures |
|------|---------|-----------------|
| `sentry.client.config.ts` | Browser | Unhandled JS errors, React rendering errors, Core Web Vitals, session replays |
| `sentry.server.config.ts` | Node.js (RSC, API routes) | Server-side exceptions, unhandled promise rejections, route handler errors |
| `sentry.edge.config.ts` | Edge runtime (middleware) | Middleware errors if using Next.js Edge runtime |
| `app/global-error.tsx` | Browser (RSC errors) | React error boundary for App Router — replaces `error.tsx` for top-level errors |

The `withSentryConfig()` wrapper in `next.config.ts` injects the webpack plugin for source map upload, so stack traces in Sentry show original TypeScript source instead of minified output.

### Server Components vs. Client Components

| Aspect | Server Components | Client Components |
|--------|-----------------|------------------|
| Error capture | `sentry.server.config.ts` catches unhandled errors | `sentry.client.config.ts` + `global-error.tsx` |
| `setUser()` | Must be called per server component — not propagated | Call once in a client-side provider |
| Performance tracing | Auto-instrumented on route handlers and RSC fetches | Auto-instrumented on client navigation |
| Manual spans | `Sentry.startSpan()` works in both | Same API |

**Key insight**: User context set in a server component does NOT propagate to the client. If you want user-tagged errors on both sides, set user in both runtimes. For Wildenflower's auth (httpOnly cookie-based), setting user on the server side from the session cookie is the correct approach.

### What to Capture

**Essential (configure immediately):**
- All unhandled exceptions (default behavior after install)
- Source maps (requires webpack plugin, enabled by default via wizard)
- Release tracking tied to git commit SHA

**Recommended but optional:**
- Performance tracing: set `tracesSampleRate: 0.1` (10% of transactions) — enough signal for a small store without burning quota
- Session replay: set `replaysOnErrorSampleRate: 1.0` to replay sessions that had errors — highly useful for debugging

**Skip for v1.2:**
- Custom span instrumentation on every Shopify query — too verbose, burns free quota
- Alerts/notifications setup — configure after first errors surface

### Free Tier Limits

Sentry free tier: **5,000 errors/month**, **10,000 performance units/month**, **50 session replays/month**. For a new small store with minimal traffic, these limits are ample. The main risk is over-capturing during development — set `enabled: process.env.NODE_ENV === 'production'` to avoid burning dev quota.

### Existing Setup

The project already has `app/global-error.tsx` — this is where Sentry's `captureException` call goes. Sentry's wizard creates this file; since it already exists, manual integration is straightforward.

### Complexity

LOW. Sentry's `@sentry/nextjs` wizard (`npx @sentry/wizard@latest -i nextjs`) handles 90% of setup automatically. The three config files + `next.config.ts` modification take ~30 minutes. The main decisions are sampling rates and what to capture.

---

## 5. GDPR Cookie Consent

### What Cookies Shopify Sets on a Headless Storefront

Shopify sets cookies in several categories. For a headless storefront (Next.js + Storefront API), the cookie surface is different from a standard Shopify theme:

| Cookie | Category | Consent Required? | Notes |
|--------|----------|------------------|-------|
| `_shopify_y` | Analytics | YES | Shopify's visitor tracking/analytics |
| `_shopify_s` | Analytics | YES | Session-level analytics |
| `_shopify_sa_t`, `_shopify_sa_p` | Marketing/attribution | YES | Source attribution |
| `cart` or `_cart` | Strictly necessary | NO | Cart persistence — essential for shopping |
| `_secure_session_id` | Strictly necessary | NO | Secure session, required for checkout |
| `_shopify_evids` | Analytics | YES | Event tracking |
| OAuth/auth cookies (httpOnly) | Strictly necessary | NO | Your auth implementation uses httpOnly cookies — these are session-essential |

**Critical distinction for headless storefronts**: Standard Shopify themes use Shopify's built-in Cookie Consent API (`Shopify.customerPrivacy`). In a headless Next.js storefront, you manage this yourself — Shopify's built-in banner does NOT appear.

### GDPR Requirements

Under GDPR (EU) and ePrivacy Directive:
1. **Strictly necessary cookies**: No consent required. Cart, session, auth — these can be set immediately.
2. **Analytics cookies** (`_shopify_y`, `_shopify_s`): Consent required before setting.
3. **Marketing/attribution cookies**: Consent required before setting.
4. **Consent must be**: freely given, specific, informed, unambiguous (opt-in, not opt-out).
5. **Consent must be**: recorded (logged with timestamp), revocable.

### Free Implementation Approach

Since no paid tools are allowed, the practical options are:

| Option | Cost | Complexity | Compliance Level |
|--------|------|-----------|-----------------|
| Build custom banner (React component + localStorage) | Free | LOW | Adequate for small store |
| `cookieconsent` by orestbida (vanilla JS, open source MIT) | Free | LOW | Good, widely used |
| `osano/cookieconsent` (open source) | Free | LOW | Good |
| CookieYes Shopify app (injects into Shopify, not headless) | Free tier | N/A | Not applicable — headless |

**Recommendation for headless**: Build a minimal custom React component. Store consent in `localStorage`. The logic is: on first visit, show banner → user accepts/rejects → store choice → conditionally load analytics scripts. This is ~100 lines of code and avoids any third-party dependency.

### What Needs Consent in Practice

For Wildenflower at launch:
- **No consent needed**: Cart cookies, auth session cookies, your `_shopify_*` strictly necessary cookies.
- **Consent needed**: If you load Google Analytics, `_shopify_y`/`_shopify_s` analytics cookies. If no third-party analytics are added, the consent banner is simpler.
- **Vercel Analytics** (`@vercel/analytics` is already installed): Vercel's analytics are cookie-free (privacy-first by design) — no GDPR consent required.

**Practical scope for v1.2**: A banner that (a) informs users of cookie usage, (b) allows accept/reject, (c) stores choice in localStorage, (d) is shown to all EU visitors. Does not need to block Shopify's strictly necessary cookies — those are exempt.

### Legal Pages Dependency

Cookie consent requires a linked Privacy Policy (already in scope as a v1.2 requirement). The banner must link to the Privacy Policy page before it is compliant.

### Complexity

LOW (custom banner for this store's needs). MEDIUM if full consent management with category-level granularity is required. For v1.2, a simple accept/reject banner covering analytics is sufficient and compliant for a small store.

---

## 6. Shopify Go-Live Checklist

### Standard Prerequisites for Any Shopify Store

| Item | Category | Where to Do It | Blocking? |
|------|----------|---------------|-----------|
| Products published (not draft) | Products | Shopify Admin > Products | YES |
| Product images present on all products | Products | Shopify Admin > Products | YES |
| Inventory tracking configured | Products | Per-product settings | YES |
| Shopify Payments verified (not test mode) | Payments | Settings > Payments | YES |
| Test order placed and succeeded | Testing | Use Shopify's bogus gateway | YES |
| Test mode DISABLED before go-live | Payments | Settings > Payments | YES |
| Shipping rates configured for all zones | Shipping | Settings > Shipping and Delivery | YES |
| Tax settings configured per region | Taxes | Settings > Taxes and Duties | YES |
| Custom domain connected | Domain | Settings > Domains | YES |
| SSL certificate active | Domain | Auto-provisioned by Shopify | YES |
| Store password page removed | Access | Online Store > Preferences | YES |
| Legal pages published (Privacy, Terms, Refund) | Legal | Settings > Legal or Pages | YES |
| Email notifications tested | Notifications | Settings > Notifications | Recommended |
| Order confirmation email previewed | Notifications | Settings > Notifications | Recommended |
| Storefront API access token valid | API | Shopify Admin > Apps > Headless | YES |
| All product handles verified in storefront | Integration | Manual QA | YES |

### Headless-Specific Go-Live Items

These are additional items that standard Shopify launch checklists miss because they assume Shopify's built-in theme:

| Item | Why Headless-Specific | Status |
|------|----------------------|--------|
| Storefront API token not expired | Headless channel tokens can expire or be revoked | Verify |
| Cart → Checkout URL generation works | Shopify's cart checkout URL must be generated correctly via Storefront API | Test in staging |
| Product variant IDs match | Variants in GraphQL responses must match what checkout expects | Verify |
| Checkout redirect domain configured | Shopify must know your headless domain for "Continue Shopping" links | Configure |
| Collection handles match URL routes | `/collections/[handle]` must map to real Shopify collection handles | Audit |
| 404 behavior for invalid handles | Graceful error if handle not found in Shopify | Test |
| Metafields/custom data rendering | Any metafields used in UI must be in Storefront API permissions | Verify |

### Shopify Payments Test Mode

**Critical sequence**: Shopify Payments has a "test mode" that must be explicitly disabled before accepting real orders. In test mode, real credit cards are declined. Steps:
1. Settings > Payments > Shopify Payments > Manage.
2. Place a test order using Shopify's bogus gateway card number (`4242 4242 4242 4242`).
3. Verify order appears in Shopify Admin.
4. THEN disable test mode.
5. Place one final live test order (can be refunded) to verify real payment processing.

### Shopify Storefront API Access Token

For a headless storefront, the Storefront API public access token must:
- Have the correct permissions (products, collections, cart, customer account).
- Not be set to expire (or expiry must be managed).
- Be the same token used in production env vars.

The Customer Account API (used for OAuth auth in this project) requires separate configuration — verify the customer account API credentials are for the production store, not a development store.

### Complexity

MEDIUM. The checklist is comprehensive but each item is individually low-complexity. The risk is missing a step — the checklist format exists precisely because of this. The headless-specific items require more attention than a standard Shopify launch.

---

## Feature Dependencies

```
Legal Pages (Privacy Policy)
    └──requires──> Cookie Consent Banner (must link to policy)

Shopify Go-Live
    └──requires──> Storefront API token verified
    └──requires──> Test order completed
    └──requires──> Legal pages published

CI/CD Pipeline
    └──requires──> Playwright tests written (E2E job needs tests)
    └──requires──> GitHub secrets configured (Shopify token, etc.)

OpenTofu Vercel IaC
    └──requires──> Vercel API token (manual step)
    └──requires──> Two Vercel projects created (dev + prod)

Sentry
    └──enhances──> CI/CD (Sentry release can be set at deploy time)
    └──requires──> Production deployment (Sentry free tier — enable only in prod)

Cookie Consent
    └──requires──> Legal Pages (Privacy Policy URL to link to)
    └──conflicts──> Vercel Analytics (no conflict — Vercel Analytics is cookie-free)
```

### Dependency Notes

- **Cookie consent requires legal pages**: GDPR-compliant consent banners must link to a Privacy Policy. Legal pages must ship before or with the consent banner.
- **CI/CD requires Playwright tests**: The E2E job in GitHub Actions needs test files to run. Writing tests is a prerequisite for adding the CI job.
- **Shopify go-live requires a test order**: This is a hard prerequisite — you cannot trust the checkout flow without completing a test transaction.
- **Sentry conflicts with dev environment**: Sentry should be disabled in development to avoid burning the free tier's 5,000 error quota during active development.

---

## MVP Definition

### Launch With (v1.2 — all are required)

- [ ] **GitHub Actions CI** — PRs must be gated. Without this, any commit can break the store.
- [ ] **Playwright E2E (5-8 critical flows)** — Homepage, collection, PDP, add-to-cart, checkout redirect, search.
- [ ] **Sentry integration** — You need error visibility from the first real user. Debugging production with no monitoring is not viable.
- [ ] **GDPR cookie consent banner** — Required before serving EU customers. Non-compliance risk is real even for small stores.
- [ ] **Legal pages** — Privacy Policy, Terms of Service, Refund Policy. Required for Shopify go-live checklist and GDPR.
- [ ] **Shopify go-live checklist completed** — Products published, payments live, test order completed, domain connected.

### Add After Validation (v1.x)

- [ ] **OpenTofu IaC** — Valuable for environment drift prevention, but the store can launch without it. Add when the two-environment setup is stable.
- [ ] **Pre-commit hooks (Husky + lint-staged)** — Developer experience improvement. Not blocking for launch.
- [ ] **Dependabot** — Add to GitHub repo settings in 5 minutes. Automated, low effort.
- [ ] **Security headers (CSP, HSTS)** — Important but not day-one blocking for a store with no user data processing beyond Shopify.

### Future Consideration (v2+)

- [ ] **Performance budgets in CI** — Lighthouse CI scores on PR. Valuable but premature for v1.2.
- [ ] **Visual regression testing** — Screenshot diffs in CI. High maintenance, low priority for a small team.
- [ ] **Unit tests** — Only if business logic grows beyond Shopify API wrappers.

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Shopify go-live checklist | HIGH — enables real sales | LOW | P1 |
| Sentry error monitoring | HIGH — production visibility | LOW | P1 |
| GDPR cookie consent | HIGH — legal compliance | LOW | P1 |
| Legal pages | HIGH — legal requirement | LOW | P1 |
| GitHub Actions CI | MEDIUM — developer confidence | LOW | P1 |
| Playwright E2E (core flows) | MEDIUM — catches regressions | MEDIUM | P1 |
| Pre-commit hooks | LOW — developer experience | LOW | P2 |
| OpenTofu Vercel IaC | MEDIUM — environment drift prevention | MEDIUM | P2 |
| Security headers | MEDIUM — security hardening | LOW | P2 |
| Dependabot | LOW — automated dependency updates | LOW (5 min) | P2 |
| Playwright E2E (auth flows) | LOW — auth is fragile to test | HIGH | P3 |
| Performance budgets in CI | LOW — premature optimization | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Anti-Features (Do Not Build)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Playwright test for checkout completion | Verify full purchase flow | Shopify checkout is cross-domain, anti-bot protected — tests will be brittle/impossible | Test checkout URL generation only; manual test order via Shopify bogus gateway |
| Unit tests for Shopify API wrappers | "More test coverage" | GraphQL query functions have no business logic to test; mocking Shopify API adds maintenance without catching real bugs | TypeScript + E2E tests cover this |
| Playwright tests for OAuth login | Test auth flow | Shopify Customer Account API login page is cross-domain and anti-bot protected; auth flow marked fragile | Skip in v1.2; test auth-gated pages with seeded cookie state later |
| 100% Playwright coverage of all pages | Complete automation | Brittle selectors on content-driven pages break constantly; high maintenance for low value | Cover the 5-8 flows where failure costs money |
| Paid GDPR consent service (OneTrust, Cookiebot) | "Enterprise compliance" | Monthly recurring cost; overkill for a small handmade goods store | Custom React banner or open-source `cookieconsent` library |
| Terraform Cloud for state management | "Proper IaC" | Adds account/service dependency; for a two-project Vercel setup, local state with gitignore is viable | Local state with explicit gitignore; evaluate remote state if team grows |

---

## Shopify-Specific vs. Generic Next.js Identification

### Generic Next.js (same for any Next.js project)
- GitHub Actions workflow structure (lint, typecheck, build jobs)
- Sentry configuration files and webpack plugin
- GDPR consent banner component (React)
- OpenTofu/Terraform resource declarations
- Pre-commit hooks (Husky)

### Shopify-Specific (unique to this stack)
- Playwright cannot test checkout (cross-domain limitation)
- Playwright cannot reliably test OAuth login (anti-bot protection on Shopify login pages)
- Storefront API token management in environment variables
- Go-live checklist has headless-specific items (API permissions, collection handle audit)
- Cookie consent must handle `_shopify_y`, `_shopify_s` analytics cookies
- Headless storefront does NOT get Shopify's built-in GDPR banner — must build own
- Test orders use Shopify's bogus gateway, not a generic payment sandbox

---

## Sources

- [GitHub Actions CI/CD Complete Guide — DevToolbox](https://devtoolbox.dedyn.io/blog/github-actions-cicd-complete-guide)
- [Next.js CI/CD in Action with GitHub Actions — BetterLink Blog](https://eastondev.com/blog/en/posts/dev/20251220-nextjs-cicd-github-actions/)
- [Playwright CI Setup — Official Docs](https://playwright.dev/docs/ci-intro)
- [Playwright E2E Testing Issues with Shopify Login — Shopify Dev Community](https://community.shopify.dev/t/playwright-e2e-testing-issues-with-log-in/1899)
- [Shopify Headless Checkout Domain Limitation — Shopify Community](https://community.shopify.com/t/question-regarding-headless-storefront-and-checkout/188120)
- [Sentry for Next.js — Official Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Next.js Manual Setup — Official Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)
- [Shopify Cookies: Types and Compliance — CookieYes](https://www.cookieyes.com/blog/shopify-cookies/)
- [GDPR Compliance for Shopify Stores 2025 — CookieYes](https://www.cookieyes.com/blog/shopify-gdpr-compliance/)
- [Shopify Customer Privacy API — Shopify Dev](https://shopify.dev/docs/api/customer-privacy)
- [Building Cookie Consent Banner in Next.js (No Libraries)](https://www.buildwithmatija.com/blog/build-cookie-consent-banner-nextjs-15-server-client)
- [cookieconsent by orestbida — GitHub (MIT)](https://github.com/orestbida/cookieconsent)
- [Integrating Terraform with Vercel — Vercel Knowledge Base](https://vercel.com/kb/guide/integrating-terraform-with-vercel)
- [vercel_project Resource — Terraform Registry](https://registry.terraform.io/providers/vercel/vercel/latest/docs/resources/project)
- [vercel_project_environment_variable — Terraform Registry](https://registry.terraform.io/providers/vercel/vercel/latest/docs/resources/project_environment_variable)
- [OpenTofu Official Site](https://opentofu.org/)
- [Shopify Ecommerce Launch Checklist 2026 — Shopify](https://www.shopify.com/blog/shopify-store-launch-checklist)
- [Shopify Launch Checklist — Omnisend](https://www.omnisend.com/blog/shopify-checklist/)
- [Ecommerce Testing Guide 2026 — Shopify](https://www.shopify.com/blog/ecommerce-testing)

---
*Feature research for: Next.js 16 + Shopify headless storefront production readiness*
*Researched: 2026-02-27*
