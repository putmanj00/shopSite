import { test, expect } from 'playwright/test';

// From .planning/phases/19-playwright-e2e-tests/test-product.md
// NOTE: Search is a URL param on /collections/all — there is NO /search route in this app
const TEST_PRODUCT_TITLE = 'Wildenflower Test Product';

test.describe('Search', () => {
  test('search returns results for known product query', async ({ page }) => {
    // Navigate directly to the filtered URL — client-side filtering handles the rest
    await page.goto(`/collections/all?search=${encodeURIComponent(TEST_PRODUCT_TITLE)}`);

    // CollectionContent filters client-side on mount; expect auto-retries handle hydration
    await expect(
      page.getByRole('heading', { name: TEST_PRODUCT_TITLE, level: 3 })
    ).toBeVisible();
  });
});
