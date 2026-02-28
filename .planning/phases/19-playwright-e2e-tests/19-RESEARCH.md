# Phase 19: Playwright E2E Tests - Research

**Researched:** 2026-02-27
**Domain:** Playwright E2E testing for Next.js 16 App Router + Shopify storefront
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Selector strategy**
- Primary: `page.getByRole()` ARIA role-based selectors — mimics how real users find elements, enforces accessibility
- Secondary: `data-testid` attributes when no unique role or text exists — this phase adds `data-testid` attributes to existing components as needed
- Avoid: CSS class selectors (e.g., `.btn-primary > span`), XPath — too brittle, break on refactors

**Data strategy**
- Create a dedicated "Test Product" in Shopify Wildenflower admin — PDP, cart, and search tests target it by title (e.g., `getByRole('heading', { name: 'Test Product' })`)
- No Shopify API mocking — tests run against the real dev server
- Search test uses the Test Product's title as the known query
- Checkout redirect test uses dynamic data (timestamp-based) to avoid session collisions

**Test depth**
- Smoke tests only — critical path, happy path per suite; not thorough/exhaustive
- Atomic tests — one concern per test; many small tests over one "super test"
- Web-first assertions (`expect(locator).toBeVisible()`, `.toHaveText()`) that auto-retry until timeout — reduces flakiness
- No edge case or error state coverage in this phase

**Browser coverage**
- Local: Chromium headless only — keeps fast feedback on local hardware
- CI (Phase 20): Chromium + Firefox + WebKit — cross-browser bugs caught in pipeline
- Mobile emulation: Periodic WebKit Mobile Safari project check — not part of the default local run

### Claude's Discretion
- Playwright config file structure (playwright.config.ts)
- Test file organization (one file per suite, or grouped)
- Exact timeout values
- Reporter format for local runs (list vs dot)

### Deferred Ideas (OUT OF SCOPE)
- CI cross-browser test run — Phase 20 (CI/CD Pipeline)
- Visual regression / screenshot diffing — add to backlog
- Parallel test sharding — add to backlog
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| E2E-01 | Test — homepage loads with hero image, navigation, and product section visible | Hero uses `<h1>` with heading text; nav has `aria-label="Main navigation"`. Use `getByRole` + `toBeVisible`. No `data-testid` needed — rich ARIA structure exists. |
| E2E-02 | Test — `/collections/all` page loads with product grid visible | Products render as `<Link>` cards with `<h3>` product titles. Use `page.locator` to count product cards. May need `data-testid="product-grid"` on the grid container. |
| E2E-03 | Test — product detail page loads with image, price, and add-to-cart button | `ProductInfo` renders `<h1>` with title, price in `<span>`, button with text "Add to Cart" (when in stock). `AddToCartButton` has `id="main-add-to-cart"` — can use `getByRole('button', { name: 'Add to Cart' })`. |
| E2E-04 | Test — adding a product to cart updates cart count and opens cart drawer | Cart button has `aria-label="Open cart"`. Cart count badge is a `<span>` with no testid — needs `data-testid="cart-count"`. Drawer has `<h2>` "Your Gathering". CartDrawer visible when `isOpen` state flips. |
| E2E-05 | Test — checkout button initiates redirect to a Shopify checkout URL | Checkout button text is "Proceed to Checkout". On click: `window.location.href = cart.checkoutUrl`. Test checks `page.url()` starts with Shopify checkout domain after navigation. |
| E2E-06 | Test — search returns results for a known product query | Search is in-page filtering on `/collections/all?search=<query>`. Navigate to URL with search param, then assert product card with Test Product title is visible. No dedicated `/search` route exists. |
| E2E-07 | Test — category navigation links to correct collection page | Nav "Shop" dropdown contains `<Link>` items with `role="menuitem"`. Click a nav item and assert `page.url()` contains the expected `/collections/<handle>`. |
</phase_requirements>

---

## Summary

Playwright 1.57.0 is already installed in the project as the `playwright` devDependency (which includes the full test runner via `playwright/test` — distinct from the separate `@playwright/test` package). The project does NOT yet have browser binaries installed (`~/.cache/ms-playwright/` does not exist), and there is no `playwright.config.ts`. Both must be created in Wave 0 before any tests can run.

The application structure has been fully scanned. Every test flow has identifiable selectors using the existing ARIA structure — with two targeted `data-testid` additions needed: one on the cart count badge (in `header.tsx`) and one on the product grid container (in `collection-content.tsx`). The search flow (E2E-06) does not use a dedicated `/search` route — it uses the collection page with a `?search=` URL parameter and client-side filtering in `CollectionContent`. This means the search test navigates to `/collections/all?search=<Test Product title>` and asserts the product card is visible.

The checkout redirect test (E2E-05) requires special handling: `CartDrawer` sets `window.location.href = cart.checkoutUrl` which triggers a full navigation away from `localhost:3000`. Playwright's `page.waitForURL()` with a pattern like `**/checkout.shopify.com/**` is the correct assertion. The test should NOT wait for the checkout to complete, only verify the URL begins with the Shopify checkout domain.

**Primary recommendation:** Install Chromium browser binaries, create `playwright.config.ts` with `webServer` pointing to `npm run dev`, organize tests as one `.spec.ts` file per user flow in a top-level `e2e/` directory, and add exactly two `data-testid` attributes to existing components.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| playwright | 1.57.0 (already installed) | Test runner + browser automation | Already in devDependencies; includes `playwright/test` export — no separate `@playwright/test` needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @axe-core/playwright | ^4.9.0 (already installed) | Accessibility assertions | Optional: can augment E2E-01 homepage test with `checkA11y()` — not required for smoke tests |
| dotenv | ^17.2.3 (already installed) | Load .env vars in playwright.config.ts | Load `NEXT_PUBLIC_BASE_URL` so config knows correct port |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `playwright` (current) | `@playwright/test` (separate package) | Same functionality; `playwright` already installed, contains the test runner at `playwright/test` |
| `npm run dev` in webServer | `npm run build && npm run start` | `next start` (prod build) is more faithful; `next dev` is faster for iteration — use `dev` locally |

**Installation — browser binaries only (package already installed):**
```bash
npx playwright install chromium
```

**No additional npm packages needed.**

---

## Architecture Patterns

### Recommended Project Structure
```
e2e/
├── homepage.spec.ts          # E2E-01: hero, nav, product section
├── collections.spec.ts       # E2E-02: /collections/all product grid
├── product-detail.spec.ts    # E2E-03: PDP image, price, add-to-cart button
├── add-to-cart.spec.ts       # E2E-04: cart count badge + drawer open
├── checkout.spec.ts          # E2E-05: redirect URL starts with Shopify domain
├── search.spec.ts            # E2E-06: search results for known query
└── category-nav.spec.ts      # E2E-07: nav link resolves to correct collection
playwright.config.ts          # config at project root
```

**Rationale:** One file per requirement makes failures immediately traceable. The seven requirements map cleanly to seven files.

### Pattern 1: playwright.config.ts

**What:** Config at project root. Chromium headless only for local. `webServer` starts `npm run dev` and reuses existing server if already running.

```typescript
// Source: https://playwright.dev/docs/test-configuration
import { defineConfig, devices } from 'playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,           // sequential on 2017 Intel Mac
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',               // Claude's discretion: list is readable locally
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  timeout: 30_000,
  expect: {
    timeout: 10_000,              // generous for Shopify API calls on dev server
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,    // true always — dev server typically already running
    timeout: 120_000,             // Next.js cold start can be slow
  },
});
```

### Pattern 2: Standard Test File Structure

**What:** Each spec file follows the same pattern — import from `playwright/test` (not `@playwright/test`), one `describe` block per user flow, `test.beforeEach` for setup navigation only.

```typescript
// Source: https://playwright.dev/docs/test-assertions
import { test, expect } from 'playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero section is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('main navigation is visible', async ({ page }) => {
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  });
});
```

### Pattern 3: Cart Count via data-testid

**What:** The cart count badge in `header.tsx` currently has no testid. Add `data-testid="cart-count"` to the `<span>` inside the cart button. Then assert in add-to-cart test:

```typescript
// After clicking Add to Cart:
await expect(page.getByTestId('cart-count')).toHaveText('1');
// After opening cart drawer:
await expect(page.getByRole('heading', { name: /Your Gathering/i })).toBeVisible();
```

**Current badge markup** (line 222-224 in header.tsx):
```tsx
{itemCount > 0 && (
  <span className="absolute -top-1 -right-1 w-5 h-5 ...">
    {itemCount > 9 ? '9+' : itemCount}
  </span>
)}
```
Change to: `<span data-testid="cart-count" className="absolute -top-1 -right-1 w-5 h-5 ...">`.

### Pattern 4: Checkout Redirect Test

**What:** The checkout button uses `window.location.href = cart.checkoutUrl`, navigating away from localhost. Playwright intercepts this as a navigation event.

```typescript
test('checkout redirects to Shopify checkout domain', async ({ page }) => {
  // First add the test product to cart
  await page.goto('/products/test-product');   // Test Product handle
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  await expect(page.getByTestId('cart-count')).toBeVisible();

  // Open cart and click checkout
  await page.getByRole('button', { name: 'Open cart' }).click();
  await expect(page.getByRole('heading', { name: /Your Gathering/i })).toBeVisible();

  // Wait for redirect on checkout button click
  const [response] = await Promise.all([
    page.waitForNavigation({ waitUntil: 'commit' }),
    page.getByRole('button', { name: 'Proceed to Checkout' }).click(),
  ]);
  expect(page.url()).toContain('checkout.shopify.com');
});
```

### Pattern 5: Search Test via URL Parameter

**What:** The search functionality in this app is NOT a dedicated `/search` route. It is a URL parameter `?search=` on `/collections/all` that triggers client-side filtering in `CollectionContent`. Navigate directly to the filtered URL.

```typescript
test('search returns results for known product query', async ({ page }) => {
  // Navigate with search param — client-side filter handles it
  await page.goto('/collections/all?search=Test+Product');
  // Assert the Test Product appears in the grid
  await expect(page.getByRole('heading', { name: 'Test Product', level: 3 })).toBeVisible();
});
```

**Important:** The search is client-side, so after navigation the `CollectionContent` component must hydrate before filtering. The `expect(...).toBeVisible()` auto-retry handles this.

### Pattern 6: Category Nav Test

**What:** The "Shop" dropdown in the header uses `role="menu"` and `role="menuitem"`. Hover or click the "Shop" button to reveal dropdown, then click a menu item.

```typescript
test('category nav link resolves to correct collection page', async ({ page }) => {
  await page.goto('/');
  // Hover triggers dropdown (mouseenter) — use hover()
  await page.getByRole('button', { name: 'Shop' }).hover();
  // Click first nav item — nav items are Shopify collection links
  const firstNavItem = page.getByRole('menuitem').first();
  const href = await firstNavItem.getAttribute('href');
  await firstNavItem.click();
  await expect(page).toHaveURL(new RegExp(href!));
});
```

### Anti-Patterns to Avoid

- **CSS class selectors:** `page.locator('.btn-primary > span')` — breaks on any Tailwind refactor. Use `getByRole` or `getByTestId`.
- **Hardcoded product titles from the real catalog:** Never use `getByRole('heading', { name: 'Botanical Print Tote' })` — that product could be renamed or deleted. All product-specific assertions use the dedicated "Test Product".
- **`page.waitForTimeout(2000)`:** Explicit waits hide flakiness. Use `expect(locator).toBeVisible()` which auto-retries up to the expect timeout (10s).
- **`page.waitForSelector('.grid-item')`:** DOM-specific, fragile. Use `getByTestId('product-grid')` or count headings inside the section.
- **Single monolithic test file:** One large spec file makes failures ambiguous. One file per flow.
- **`npm run build && npm run start` for the webServer:** Requires a build step before every test run — too slow for local development. Use `npm run dev`; use the production build only in CI.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Browser automation | Custom fetch + DOM parser | Playwright's `page` API | Real browser, JS execution, CSS rendering |
| Auto-retry on async state | `while(true)` polling | `expect(locator).toBeVisible()` | Playwright retries up to timeout automatically |
| Waiting for page navigation | `await new Promise(resolve => setTimeout...)` | `page.waitForNavigation()` or `page.waitForURL()` | Race conditions, missed navigation events |
| Cross-browser matrix | Multiple test runners | Playwright `projects` in config | Single API, shared test code |
| Network interception for checkout | Custom proxy | `page.route()` (if needed later) | Not needed for smoke tests — checkout redirect test only checks URL |

**Key insight:** Playwright's locator and assertion APIs have sophisticated retry logic built in. Custom waiting and polling are always worse — they create timing-sensitive tests that flake on slow machines (the 2017 Intel Mac mentioned in context).

---

## Common Pitfalls

### Pitfall 1: Zustand Store Hydration Delay

**What goes wrong:** Cart count badge and wishlist badge only render after `isMounted = true` (set via `setTimeout(..., 0)` in header.tsx). If the test checks for the cart badge immediately after clicking "Add to Cart", it may be testing against server-rendered HTML where `isMounted` is still false.

**Why it happens:** The header component guards Zustand-driven UI behind an isMounted check to avoid hydration mismatch. The add-to-cart action is async (Shopify API call). The badge `<span>` is conditionally rendered (`{itemCount > 0 && <span>}`).

**How to avoid:** The cart count badge only appears after `addToCart` completes AND `itemCount > 0`. Use `expect(page.getByTestId('cart-count')).toBeVisible()` with the 10s expect timeout — do not check immediately after clicking. The auto-retry handles the async window.

**Warning signs:** Test passes locally but fails on slow CI — indicates a missing wait.

### Pitfall 2: Missing Browser Binaries

**What goes wrong:** `npx playwright test` throws `Error: browserType.launch: Executable doesn't exist at ...`. Playwright package is installed but browser binaries are separate.

**Why it happens:** The `playwright` npm package does not auto-download browsers. `npx playwright install chromium` must be run explicitly.

**How to avoid:** Wave 0 task runs `npx playwright install chromium` before any tests are written. For CI (Phase 20), the workflow adds `npx playwright install --with-deps chromium`.

**Warning signs:** Error message referencing a path like `~/.cache/ms-playwright/chromium-XXXX/chrome-linux/chrome`.

### Pitfall 3: The Search Route Does Not Exist

**What goes wrong:** Test navigates to `/search?q=Test+Product` expecting a search results page. Gets a 404.

**Why it happens:** This app does not have a `/search` route. Search is implemented as a client-side filter on `/collections/all` via the `?search=` query param in `CollectionContent`.

**How to avoid:** Search test must navigate to `/collections/all?search=Test+Product`. The `CollectionContent` component client-side filters the product list on mount based on URL search params.

**Warning signs:** 404 page rendered in test, or "no products found" message even though the product exists.

### Pitfall 4: Shop Dropdown Requires Hover, Not Just Click

**What goes wrong:** `page.getByRole('button', { name: 'Shop' }).click()` toggles the dropdown but the click event resolves before menu items are visible. Or the dropdown opens but the test immediately tries to click a menu item that hasn't rendered yet.

**Why it happens:** The dropdown uses both `onMouseEnter`/`onMouseLeave` (desktop) and `onClick` (toggle) in header.tsx. In a headless browser `hover()` is more reliable for triggering `onMouseEnter`.

**How to avoid:** Use `await page.getByRole('button', { name: 'Shop' }).hover()` to open the dropdown, then wait for a menu item to be visible before clicking it.

**Warning signs:** Test fails intermittently with "element not found" for menu items.

### Pitfall 5: Checkout Redirect Timing

**What goes wrong:** Playwright test clicks "Proceed to Checkout" and immediately calls `expect(page.url()).toContain(...)` before the navigation resolves, getting `http://localhost:3000/`.

**Why it happens:** `window.location.href = ...` is a synchronous assignment that triggers an async browser navigation. `page.click()` resolves when the click fires, not when navigation completes.

**How to avoid:** Use `page.waitForNavigation({ waitUntil: 'commit' })` wrapped with `Promise.all` alongside the click, OR use `page.waitForURL('**/checkout.shopify.com/**')` after the click.

**Warning signs:** `expect(page.url()).toContain('checkout.shopify.com')` always fails, returning `localhost:3000`.

### Pitfall 6: `import` from `@playwright/test` vs `playwright/test`

**What goes wrong:** Tests fail to import because `@playwright/test` is not installed. The import `from '@playwright/test'` throws `Cannot find module '@playwright/test'`.

**Why it happens:** The project has `playwright` (not `@playwright/test`) in devDependencies. These are different packages. The `playwright` package exposes the test runner at `playwright/test`.

**How to avoid:** All test files must import from `'playwright/test'`, not `'@playwright/test'`. The `playwright.config.ts` must also use `import { defineConfig, devices } from 'playwright/test'`.

**Warning signs:** `Module not found: Can't resolve '@playwright/test'` error.

---

## Code Examples

Verified patterns from official sources and codebase inspection:

### playwright.config.ts (recommended)
```typescript
// Source: https://playwright.dev/docs/test-configuration
import { defineConfig, devices } from 'playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
```

### package.json test script addition
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

### E2E-01: Homepage test (homepage.spec.ts)
```typescript
import { test, expect } from 'playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero heading is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Made by hand. Found by heart./i, level: 1 })
    ).toBeVisible();
  });

  test('main navigation is visible', async ({ page }) => {
    await expect(
      page.getByRole('navigation', { name: 'Main navigation' })
    ).toBeVisible();
  });

  test('featured products section is visible', async ({ page }) => {
    // FeaturedProducts renders h2 "Freshly Gathered"
    await expect(
      page.getByRole('heading', { name: /Freshly Gathered/i })
    ).toBeVisible();
  });
});
```

### E2E-02: Collections test (collections.spec.ts)
```typescript
import { test, expect } from 'playwright/test';

test.describe('/collections/all', () => {
  test('product grid is visible with at least one product', async ({ page }) => {
    await page.goto('/collections/all');
    // CollectionContent renders product cards as <Link> with <h3> product titles
    // Wait for at least one product heading
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible();
  });
});
```

### E2E-04: Add-to-cart test (add-to-cart.spec.ts)
```typescript
import { test, expect } from 'playwright/test';

const TEST_PRODUCT_HANDLE = 'test-product'; // exact Shopify handle for Test Product

test.describe('Add to cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/products/${TEST_PRODUCT_HANDLE}`);
  });

  test('cart count updates and drawer opens', async ({ page }) => {
    // Click Add to Cart
    await page.getByRole('button', { name: 'Add to Cart' }).click();

    // Cart count badge appears (conditional render, auto-retry handles hydration)
    await expect(page.getByTestId('cart-count')).toBeVisible();
    await expect(page.getByTestId('cart-count')).toHaveText('1');

    // Open cart drawer
    await page.getByRole('button', { name: 'Open cart' }).click();

    // Drawer heading confirms it opened
    await expect(
      page.getByRole('heading', { name: /Your Gathering/i })
    ).toBeVisible();
  });
});
```

### E2E-05: Checkout redirect test (checkout.spec.ts)
```typescript
import { test, expect } from 'playwright/test';

const TEST_PRODUCT_HANDLE = 'test-product';

test('checkout redirects to Shopify checkout domain', async ({ page }) => {
  // Add test product to cart first
  await page.goto(`/products/${TEST_PRODUCT_HANDLE}`);
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  await expect(page.getByTestId('cart-count')).toBeVisible();

  // Open cart drawer
  await page.getByRole('button', { name: 'Open cart' }).click();
  await expect(page.getByRole('heading', { name: /Your Gathering/i })).toBeVisible();

  // Checkout — waitForURL catches the cross-domain redirect
  await Promise.all([
    page.waitForURL('**/checkout.shopify.com/**', { timeout: 15_000 }),
    page.getByRole('button', { name: 'Proceed to Checkout' }).click(),
  ]);

  expect(page.url()).toContain('checkout.shopify.com');
});
```

### E2E-06: Search test (search.spec.ts)
```typescript
import { test, expect } from 'playwright/test';

// NOTE: Search is a URL param on /collections/all, NOT a /search route
const TEST_PRODUCT_TITLE = 'Test Product'; // exact title of Test Product in Shopify

test('search returns results for known query', async ({ page }) => {
  await page.goto(`/collections/all?search=${encodeURIComponent(TEST_PRODUCT_TITLE)}`);

  // CollectionContent filters client-side; product card h3 should appear
  await expect(
    page.getByRole('heading', { name: TEST_PRODUCT_TITLE, level: 3 })
  ).toBeVisible();
});
```

### E2E-07: Category nav test (category-nav.spec.ts)
```typescript
import { test, expect } from 'playwright/test';

test('Shop dropdown navigates to a collection page', async ({ page }) => {
  await page.goto('/');

  // Hover opens the dropdown (uses onMouseEnter in header.tsx)
  await page.getByRole('button', { name: 'Shop' }).hover();

  // Wait for dropdown to appear and get first menu item
  const firstMenuItem = page.getByRole('menuitem').first();
  await expect(firstMenuItem).toBeVisible();

  const href = await firstMenuItem.getAttribute('href');
  await firstMenuItem.click();

  // URL should match the nav item's href
  await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});
```

### data-testid additions needed in existing components

**header.tsx** — cart count badge (line ~222):
```tsx
// Before:
<span className="absolute -top-1 -right-1 w-5 h-5 bg-terracotta text-white text-xs font-bold rounded-full flex items-center justify-center">
// After:
<span data-testid="cart-count" className="absolute -top-1 -right-1 w-5 h-5 bg-terracotta text-white text-xs font-bold rounded-full flex items-center justify-center">
```

**collection-content.tsx** — product grid container (optional, for E2E-02 robustness):
```tsx
// Wrap the product grid div with data-testid="product-grid"
<div data-testid="product-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `import from '@playwright/test'` | `import from 'playwright/test'` (when using `playwright` package directly) | Playwright 1.x — both packages exist in parallel | Project uses `playwright` not `@playwright/test`; import path matters |
| `page.waitForSelector('.class')` | `expect(page.locator(...)).toBeVisible()` | Playwright 1.14+ | Auto-retry, more resilient |
| `page.click()` then check URL immediately | `Promise.all([page.waitForNavigation(), page.click()])` or `waitForURL()` | Playwright 1.x | Avoids race conditions on navigation |
| CSS/XPath selectors | `getByRole`, `getByTestId`, `getByLabel` | Playwright 1.18+ | Semantic, refactor-resistant |

**Deprecated/outdated:**
- `page.waitForNavigation()` in new Playwright docs is superseded by `page.waitForURL()` for URL-based waits — both work, `waitForURL` is cleaner for redirect checking.
- `page.$ / page.$$` — legacy jQuery-style selectors. Never use in new tests.

---

## Open Questions

1. **Test Product handle in Shopify**
   - What we know: CONTEXT.md says to create a "Test Product" in Shopify admin with a clearly QA-purpose name
   - What's unclear: The exact Shopify handle (URL slug) of the Test Product is unknown until it is created
   - Recommendation: The planner should create a Wave 0 task instructing the user to create the Test Product in Shopify admin and confirm its handle. Test files should use a named constant `TEST_PRODUCT_HANDLE` at the top of each spec file so it can be updated in one place.

2. **`reuseExistingServer` vs `false` for dev server**
   - What we know: CONTEXT.md specifies local dev server; the 2017 Intel Mac is slow; no CI concern in this phase
   - What's unclear: Whether `reuseExistingServer: true` (always reuse) or `reuseExistingServer: !process.env.CI` (reuse only locally) is preferable
   - Recommendation: Use `reuseExistingServer: true` always in the Phase 19 config. Phase 20 (CI) will revisit with `!process.env.CI`.

3. **Cart state isolation between tests**
   - What we know: Tests use real Shopify API; cart state persists in browser localStorage/Zustand
   - What's unclear: If add-to-cart test runs after checkout test, cart may be non-empty and counts could be wrong
   - Recommendation: Each test that touches cart state should use `storageState` reset or begin by navigating to clear state. The simplest approach: use `test.use({ storageState: { cookies: [], origins: [] } })` in specs that depend on fresh cart state, OR accept that the cart count test only checks "greater than 0" rather than exactly 1.

---

## Sources

### Primary (HIGH confidence)
- https://playwright.dev/docs/test-configuration — webServer, projects, timeout, baseURL structure
- https://playwright.dev/docs/locators — getByRole, getByTestId, getByLabel, getByText API
- https://playwright.dev/docs/test-assertions — toBeVisible, toHaveURL, toHaveText, toHaveCount, auto-retry behavior
- https://playwright.dev/docs/best-practices — selector strategy, flakiness avoidance
- https://nextjs.org/docs/pages/guides/testing/playwright — Next.js official Playwright guide (version 16.1.6)
- Codebase inspection: `components/header.tsx`, `components/cart-drawer.tsx`, `components/add-to-cart-button.tsx`, `components/search-bar.tsx`, `components/collection-content.tsx`, `components/product-card.tsx`, `app/page.tsx`, `app/collections/[handle]/page.tsx`, `app/products/[handle]/page.tsx`, `package.json`

### Secondary (MEDIUM confidence)
- https://playwright.dev/docs/test-webserver — webServer reuseExistingServer behavior (verified against official docs)
- WebSearch: Next.js 15/16 + Playwright 2025 best practices — multiple sources agree on `npm run dev` webServer approach for local tests

### Tertiary (LOW confidence)
- None — all critical claims verified with official docs or codebase inspection

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — playwright 1.57.0 confirmed installed; import path `playwright/test` confirmed via package inspection
- Architecture: HIGH — all seven page structures inspected in codebase; selectors verified against actual component markup
- Pitfalls: HIGH — import path pitfall verified by checking node_modules; search route pitfall verified by directory scan; hydration delay pitfall verified in header.tsx source

**Research date:** 2026-02-27
**Valid until:** 2026-03-29 (30 days — Playwright stable, but check for minor API changes if delayed)
