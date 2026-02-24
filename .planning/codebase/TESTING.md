# Testing Patterns

**Analysis Date:** 2026-02-23

## Test Framework

**Runner:**
- Playwright v1.40.0 (browser automation for E2E and integration testing)
- Not Jest/Vitest/traditional unit test runners; no unit testing framework configured

**Assertion Library:**
- Native Playwright assertions (e.g., `page.waitForSelector()`, `.isDisabled()`, `.click()`)
- Manual assertions in test scripts (if/throw patterns for pass/fail)

**Run Commands:**
```bash
npm run test:ui              # Run UI tests with Playwright
npm run test:routes         # Validate route accessibility
npm run a11y:test          # Accessibility testing with axe-core
npm run contrast:check     # Color contrast checker (pre-build step)
npm run test:all           # Typecheck + lint + UI tests
npm run a11y:all          # All accessibility checks
```

## Test File Organization

**Location:**
- Tests are script-based in `/scripts/` directory, not co-located with source files
- No unit tests or component tests in source tree
- Test scripts executed via npm scripts and `npx ts-node`

**Files:**
- `scripts/ui-tests.ts` - Full UI test suite (workflows, routes, accessibility)
- `scripts/accessibility-test.ts` - WCAG 2.1 AA compliance with axe-core
- `scripts/validate-routes.ts` - Route validation (presumably)
- `scripts/color-contrast-checker.ts` - Brand color accessibility checks

**Structure:**
```
scripts/
├── ui-tests.ts              # Main UI test suite (560+ lines)
├── accessibility-test.ts    # A11y compliance tests (129 lines)
├── validate-routes.ts
├── color-contrast-checker.ts
└── [other utilities]
```

## Test Structure

**Suite Organization:**
Test classes organize related tests (e.g., `UITestRunner` in `ui-tests.ts`):

```typescript
class UITestRunner {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private results: TestResult[] = [];
  private consoleErrors: string[] = [];

  async setup(): Promise<void> { /* ... */ }
  async teardown(): Promise<void> { /* ... */ }

  private async runTest(name: string, testFn: () => Promise<void>): Promise<TestResult> { /* ... */ }

  async testStaticRoutes(): Promise<void> { /* ... */ }
  async testDynamicRoutes(): Promise<void> { /* ... */ }
  async runAllTests(): Promise<void> { /* ... */ }
}

// Run tests
const runner = new UITestRunner();
runner.runAllTests();
```

**Patterns:**

- **Setup/Teardown:** Browser lifecycle managed in `setup()` and `teardown()` methods, called in `runAllTests()`
- **Test Execution:** `runTest()` wrapper method handles try-catch, timing, and result collection
- **Error Handling:** Errors caught and returned as `TestResult` objects with `passed: boolean`, `error?: string`
- **Timing:** Performance measurement with `Date.now()` for each test
- **Console Logging:** Global console error capture via `page.on('console', (msg) => { ... })`

**Test Structure Example:**
```typescript
async testStaticRoutes(): Promise<void> {
  console.log('\n📄 Testing Static Routes...\n');

  for (const route of STATIC_ROUTES) {
    const result = await this.runTest(`GET ${route}`, async () => {
      const response = await this.page!.goto(`${BASE_URL}${route}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      const status = response?.status() || 0;
      if (status >= 400) {
        throw new Error(`HTTP ${status}`);
      }
    });
    this.results.push(result);
  }
}
```

## Mocking

**Framework:** None - real browser navigation used

**Patterns:**
- No API mocking; all tests run against live server (requires `npm run dev` or deployed instance)
- Pre-seeding localStorage to bypass UI flows (e.g., welcome popup):
  ```typescript
  await this.page!.addInitScript(() => {
    localStorage.setItem('welcomePopupShown', 'true');
  });
  ```
- No database mocking; uses live Shopify API or test catalog

**What to Mock:**
- N/A - integration/E2E approach tests real interactions
- Strategy is to test full workflows against actual backend

**What NOT to Mock:**
- External APIs (Shopify) - tests expect live data
- Database queries
- User interactions (all real click/navigation events tested)

## Fixtures and Factories

**Test Data:**
- No factory pattern or fixture files
- Hardcoded test routes and collections:
  ```typescript
  const STATIC_ROUTES = ['/', '/about', '/accessibility', '/account', /* ... */];
  const FALLBACK_DYNAMIC_ROUTES = ['/collections/all', '/collections/tie-dye', /* ... */];
  ```
- Products tested by querying DOM (e.g., `$$('a[href*="/products/"]')`)

**Location:**
- Constants defined at module level in script files
- BASE_URL from environment variable with fallback: `process.env.BASE_URL || 'http://localhost:3000'`

## Coverage

**Requirements:** Not enforced

**Approach:**
- E2E test coverage focused on critical user workflows and accessibility
- No coverage reports generated
- No coverage threshold set

**Test Types:**

**E2E Tests (Primary):**
- Scope: Full user journeys from homepage through checkout
- Approach: Real browser navigation, DOM querying, user interactions
- Examples:
  - `testCheckoutFlow()` - Add to cart through checkout redirect
  - `testSearchWorkflow()` - Search input interaction and submission
  - `testNavigationWorkflow()` - Main nav and footer links
  - `testShopNowFlow()` - Hero button to product listing

**Integration Tests (Secondary):**
- Scope: Route accessibility and page loading
- Approach: HTTP status code validation
- Examples:
  - `testStaticRoutes()` - Verify all pages load (HTTP 200)
  - `testDynamicRoutes()` - Verify collection pages load

**Accessibility Tests:**
- Framework: axe-core v4.9.0 with Playwright integration
- Standard: WCAG 2.1 AA compliance
- Automated violation detection with impact levels (critical, serious, minor)
- File: `scripts/accessibility-test.ts`
- Pages tested: `/`, `/collections/all` (extensible)

**Quality Assurance Tests (Non-test):**
- Color contrast checking (build pre-step)
- Route validation
- Asset verification
- Type checking: `npm run typecheck` (tsc --noEmit)
- Linting: `npm run lint` (eslint)

## Common Patterns

**Async Testing:**
Pattern from `ui-tests.ts`:
```typescript
private async runTest(
  name: string,
  testFn: () => Promise<void>
): Promise<TestResult> {
  const start = Date.now();
  try {
    await testFn();
    const duration = Date.now() - start;
    console.log(`  ✅ ${name} (${duration}ms)`);
    return { name, passed: true, duration };
  } catch (error: unknown) {
    const duration = Date.now() - start;
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`  ❌ ${name}: ${errorMessage}`);
    return { name, passed: false, error: errorMessage, duration };
  }
}
```

**Error Testing:**
Tests expect specific error conditions and throw:
```typescript
const status = response?.status() || 0;
if (status >= 400) {
  throw new Error(`HTTP ${status}`);
}

const shopNowBtn = await this.page!.$('a[href="/collections/all"]');
if (!shopNowBtn) {
  throw new Error(`Hero Shop Now button not found`);
}
```

**Timeout Handling:**
- Long timeouts for slow operations (30 seconds for page navigation)
- Element waits with specific timeouts (5 seconds typical)
- Fallback patterns for optional elements (log warning, not error):
  ```typescript
  try {
    await this.page!.waitForSelector('#main-add-to-cart', { timeout: 3000 });
  } catch (e) {
    console.log(`⚠️  "Add to Cart" button not found, trying next...`);
    await this.page!.goBack();
    continue;
  }
  ```

**DOM Querying:**
Playwright selectors for robust element finding:
```typescript
// Single element
const cartButton = await this.page!.$('[aria-label*="Cart"], [aria-label*="cart"]');

// Multiple elements
const productElements = await this.page!.$$('a[href*="/products/"]');

// Wait for element with state
await this.page!.waitForSelector('button:has-text("Proceed to Checkout")', {
  state: 'visible',
  timeout: 5000
});
```

**User Interaction Patterns:**
```typescript
// Click and wait for navigation
await shopNowBtn.click();
await this.page!.waitForURL('**/collections/all');

// Click and wait for element to appear
await cartButton.click();
await this.page!.waitForTimeout(500);

// Attribute checks
const isDisabled = await addToCartBtn?.isDisabled();
const btnText = await addToCartBtn?.textContent();
const href = await productBtn.getAttribute('href');
```

**Console Error Capture:**
Global error collection during test:
```typescript
this.page.on('console', (msg) => {
  if (msg.type() === 'error') {
    this.consoleErrors.push(`[${new Date().toISOString()}] ${msg.text()}`);
  }
});

// Reported in summary
if (this.consoleErrors.length > 0) {
  console.log(`⚠️  Console Errors Detected: ${this.consoleErrors.length}`);
  this.consoleErrors.slice(0, 5).forEach((err) => {
    console.log(`     • ${err.substring(0, 100)}...`);
  });
}
```

## Test Execution

**Prerequisites:**
- Dev server running: `npm run dev` (localhost:3000 by default)
- Environment variable optional: `BASE_URL=http://localhost:3000` or equivalent

**Exit Codes:**
- `process.exit(0)` - All tests pass
- `process.exit(1)` - Any test fails

**Accessibility Test Exit Logic:**
```typescript
if (criticalViolations > 0) {
  console.log('\n❌ FAIL: Critical accessibility violations found');
  process.exit(1);
} else if (totalViolations > 0) {
  console.log('\n⚠️  WARN: Minor accessibility violations found');
  process.exit(0);  // Warn but pass
} else {
  console.log('\n✅ PASS: No accessibility violations found');
  process.exit(0);
}
```

## CI/CD Integration

**npm scripts integration:**
- `npm run test:all` chains multiple checks: typecheck → lint → UI tests
- `npm run a11y:all` runs contrast check and accessibility tests
- `npm run build` includes `contrast:check` pre-step to validate colors before build

---

*Testing analysis: 2026-02-23*
