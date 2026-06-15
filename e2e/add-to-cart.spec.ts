import { test, expect } from 'playwright/test';
import { TEST_PRODUCT_HANDLE } from './support/shopify-test-product';

test.describe('Add to cart', () => {
  // Clear storage state before each test so cart starts empty (count = 0)
  // This ensures clicking Add to Cart always produces count = 1
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto(`/products/${TEST_PRODUCT_HANDLE}`);
  });

  test('cart count updates and drawer opens after adding item', async ({ page }) => {
    // Click Add to Cart — triggers Shopify Storefront API call
    await page.getByRole('button', { name: 'Add to Cart' }).click();

    // Cart store sets isOpen: true on addItem — drawer opens automatically
    // Wait for drawer heading to confirm both the API call completed and the drawer opened
    await expect(
      page.getByRole('heading', { name: /Your Gathering/i })
    ).toBeVisible();

    // Cart count badge appears once Zustand hydrates and itemCount > 0
    await expect(page.getByTestId('cart-count')).toBeVisible();
    await expect(page.getByTestId('cart-count')).toHaveText('1');
  });
});
