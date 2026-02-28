import { test, expect } from 'playwright/test';

// From .planning/phases/19-playwright-e2e-tests/test-product.md
const TEST_PRODUCT_HANDLE = 'wildenflower-test-product';

test.describe('Checkout redirect', () => {
  // Clear storage state before test so cart starts empty
  test.use({ storageState: { cookies: [], origins: [] } });

  test('checkout button redirects to Shopify checkout domain', async ({ page }) => {
    // Step 1: Add test product to cart
    await page.goto(`/products/${TEST_PRODUCT_HANDLE}`);
    await page.getByRole('button', { name: 'Add to Cart' }).click();

    // Wait for cart count — confirms add-to-cart completed before proceeding
    await expect(page.getByTestId('cart-count')).toBeVisible();

    // Step 2: Open cart drawer
    await page.getByRole('button', { name: 'Open cart' }).click();
    await expect(
      page.getByRole('heading', { name: /Your Gathering/i })
    ).toBeVisible();

    // Step 3: Click checkout — waitForURL catches the cross-domain redirect
    // window.location.href = cart.checkoutUrl triggers full navigation away from localhost
    await Promise.all([
      page.waitForURL('**/checkout.shopify.com/**', { timeout: 15_000 }),
      page.getByRole('button', { name: 'Proceed to Checkout' }).click(),
    ]);

    // Verify we landed on Shopify checkout domain
    expect(page.url()).toContain('checkout.shopify.com');
  });
});
