import { test, expect } from 'playwright/test';
import { TEST_PRODUCT_HANDLE } from './support/shopify-test-product';

test.describe('Checkout redirect', () => {
  // Clear storage state before test so cart starts empty
  test.use({ storageState: { cookies: [], origins: [] } });

  test('checkout button redirects to Shopify checkout domain', async ({ page }) => {
    // Step 1: Add test product to cart
    await page.goto(`/products/${TEST_PRODUCT_HANDLE}`);
    await page.getByRole('button', { name: 'Add to Cart' }).click();

    // Cart store sets isOpen: true on addItem — drawer opens automatically
    // Wait for drawer heading as the signal that the API call completed and drawer is open
    await expect(
      page.getByRole('heading', { name: /Your Gathering/i })
    ).toBeVisible();

    // Step 3: Click checkout — waitForURL catches the cross-domain redirect
    // window.location.href = cart.checkoutUrl triggers full navigation away from localhost
    // Shopify serves checkout from either {store}.myshopify.com/checkouts|cart/c/... (classic)
    // or shop.app/checkout/... (Shop Pay universal redirect, store-config dependent)
    const checkoutUrl = /(myshopify\.com\/(cart\/c|checkouts)\/|shop\.app\/checkout)/;
    await Promise.all([
      page.waitForURL(checkoutUrl, { timeout: 15_000 }),
      page.getByRole('button', { name: 'Proceed to Checkout' }).click(),
    ]);

    // Verify we landed on a Shopify-controlled checkout domain
    expect(page.url()).toMatch(checkoutUrl);
  });
});
