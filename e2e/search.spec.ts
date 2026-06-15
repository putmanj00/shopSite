import { test, expect } from 'playwright/test';
import { TEST_PRODUCT_TITLE } from './support/shopify-test-product';

// Search is a URL param on /collections/all — there is no /search route in this app.

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
