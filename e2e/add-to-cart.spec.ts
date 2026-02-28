import { test, expect } from 'playwright/test';

// From .planning/phases/19-playwright-e2e-tests/test-product.md
const TEST_PRODUCT_HANDLE = 'wildenflower-test-product';

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

    // Cart count badge only appears when itemCount > 0 AND after Zustand hydrates
    // auto-retry handles both the API latency and the isMounted guard (up to 10s)
    await expect(page.getByTestId('cart-count')).toBeVisible();
    await expect(page.getByTestId('cart-count')).toHaveText('1');

    // Click the cart button to open the drawer
    await page.getByRole('button', { name: 'Open cart' }).click();

    // Drawer heading confirms it opened
    await expect(
      page.getByRole('heading', { name: /Your Gathering/i })
    ).toBeVisible();
  });
});
