import AxeBuilder from '@axe-core/playwright';
import type { Page } from 'playwright/test';
import { test, expect } from './support/test';
import { TEST_PRODUCT_HANDLE } from './support/shopify-test-product';

// Phase 3D — automated accessibility scan (axe-core, WCAG 2.1 A/AA rules).
// Fails on serious/critical violations only. Read-only pages, so @smoke-safe.
//
// KNOWN_VIOLATIONS: violations we have seen and accepted for now, keyed by axe
// rule id, each with a reason. A known rule is skipped everywhere; keep the
// list short and fix entries rather than grow it.
const KNOWN_VIOLATIONS: Readonly<Record<string, string>> = {};

const BLOCKING_IMPACTS = new Set(['serious', 'critical']);

async function expectNoSeriousViolations(page: Page, label: string) {
  // axe samples computed colors once; a CSS transition mid-flight (e.g. the
  // add-to-cart button going disabled → enabled after hydration) gives random
  // contrast readings. Let finite animations/transitions settle first.
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        // Infinite loops (marquee, pulse) never finish — only wait on finite ones.
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const blocking = results.violations
    .filter((v) => BLOCKING_IMPACTS.has(v.impact ?? ''))
    .filter((v) => !(v.id in KNOWN_VIOLATIONS));

  const report = blocking.map(
    (v) =>
      `${v.impact} ${v.id}: ${v.help}\n` +
      v.nodes
        .slice(0, 5)
        .map((n) => `    ${n.target.join(' ')}  ${n.any[0]?.message ?? ''}`.trimEnd())
        .join('\n'),
  );
  expect(report, `${label}: serious/critical axe violations`).toEqual([]);
}

test.describe('Accessibility (axe)', { tag: '@smoke' }, () => {
  test('homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectNoSeriousViolations(page, 'home');
  });

  test('all-products collection', async ({ page }) => {
    await page.goto('/collections/all');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectNoSeriousViolations(page, '/collections/all');
  });

  test('product detail page', async ({ page }) => {
    await page.goto(`/products/${TEST_PRODUCT_HANDLE}`);
    await expect(page.locator('#main-add-to-cart')).toBeVisible();
    await expectNoSeriousViolations(page, 'PDP');
  });

  test('cart drawer open (empty)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open cart' }).first().click();
    await expect(page.getByTestId('cart-drawer')).toHaveAttribute('data-state', 'open');
    await expectNoSeriousViolations(page, 'cart drawer');
  });

  // Logged out, /account redirects straight to Shopify sign-in (not our page),
  // so scan the signed-in view with the account APIs mocked.
  test('account page (signed in, mocked)', async ({ page }) => {
    await page.route('**/api/auth/customer/me', (route) =>
      route.fulfill({
        json: {
          authenticated: true,
          customer: {
            id: 'gid://shopify/Customer/1',
            email: 'fern@example.com',
            firstName: 'Fern',
            lastName: 'Gully',
            displayName: 'Fern Gully',
          },
        },
      }),
    );
    await page.route('**/api/customer/orders**', (route) => route.fulfill({ json: { orders: [] } }));
    await page.route('**/api/customer/addresses', (route) =>
      route.fulfill({ json: { defaultAddressId: null, addresses: [] } }),
    );

    await page.goto('/account');
    await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible();
    await expectNoSeriousViolations(page, '/account');
  });
});
