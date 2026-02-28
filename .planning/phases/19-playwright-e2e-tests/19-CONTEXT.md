# Phase 19: Playwright E2E Tests - Context

**Gathered:** 2026-02-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Write automated Playwright tests for the 7 critical user flows: homepage render, /collections/all product grid, product detail page (PDP), add-to-cart (cart count + drawer), checkout redirect (Shopify URL), search results for a known query, and category nav link resolution. Tests must be catalog-agnostic and runnable locally and in CI.

Flows beyond these 7, test infrastructure (CI pipeline), and visual regression testing are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Selector strategy
- **Primary:** `page.getByRole()` ARIA role-based selectors — mimics how real users find elements, enforces accessibility
- **Secondary:** `data-testid` attributes when no unique role or text exists — this phase adds `data-testid` attributes to existing components as needed
- **Avoid:** CSS class selectors (e.g., `.btn-primary > span`), XPath — too brittle, break on refactors

### Data strategy
- Create a dedicated **"Test Product"** in Shopify Wildenflower admin — PDP, cart, and search tests target it by title (e.g., `getByRole('heading', { name: 'Test Product' })`)
- No Shopify API mocking — tests run against the real dev server
- Search test uses the Test Product's title as the known query
- Checkout redirect test uses dynamic data (timestamp-based) to avoid session collisions

### Test depth
- **Smoke tests only** — critical path, happy path per suite; not thorough/exhaustive
- **Atomic tests** — one concern per test; many small tests over one "super test"
- **Web-first assertions** (`expect(locator).toBeVisible()`, `.toHaveText()`) that auto-retry until timeout — reduces flakiness
- No edge case or error state coverage in this phase

### Browser coverage
- **Local:** Chromium headless only — keeps fast feedback on local hardware
- **CI (Phase 20):** Chromium + Firefox + WebKit — cross-browser bugs caught in pipeline
- **Mobile emulation:** Periodic WebKit Mobile Safari project check — not part of the default local run

### Claude's Discretion
- Playwright config file structure (playwright.config.ts)
- Test file organization (one file per suite, or grouped)
- Exact timeout values
- Reporter format for local runs (list vs dot)

</decisions>

<specifics>
## Specific Ideas

- Run `npx playwright test` locally = Chromium headless only (fast on 2017 Intel Mac)
- Headed mode (`--headed`) used only when actively debugging a failure
- Test Product in Shopify admin should have a clearly QA-purpose name to avoid accidental deletion
- Checkout redirect test only checks that the redirected URL starts with the Shopify checkout domain — does not complete the purchase

</specifics>

<deferred>
## Deferred Ideas

- CI cross-browser test run — Phase 20 (CI/CD Pipeline)
- Visual regression / screenshot diffing — add to backlog
- Parallel test sharding — add to backlog

</deferred>

---

*Phase: 19-playwright-e2e-tests*
*Context gathered: 2026-02-27*
