import { test, expect } from './support/test';
import { TEST_PRODUCT_HANDLE } from './support/shopify-test-product';

test.describe('Checkout redirect', { tag: '@full' }, () => {
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

    // Step 3: Click checkout. window.location.href = cart.checkoutUrl navigates
    // away from the app. Shopify serves checkout from either
    // {store}.myshopify.com/checkouts|cart/c/... (classic) or shop.app/checkout/...
    // (Shop Pay universal redirect, store-config dependent).
    //
    // Assert the navigation REQUEST, not the final URL: the CI development
    // store is always password-protected, so Shopify bounces the checkout on
    // to /password. The handoff to the checkout URL is the app's contract.
    const checkoutUrl = /(myshopify\.com\/(cart\/c|checkouts)\/|shop\.app\/checkout)/;
    const [checkoutRequest] = await Promise.all([
      page.waitForRequest(
        (req) => req.isNavigationRequest() && checkoutUrl.test(req.url()),
        { timeout: 15_000 },
      ),
      page.getByRole('button', { name: 'Proceed to Checkout' }).click(),
    ]);

    expect(checkoutRequest.url()).toMatch(checkoutUrl);
  });
});
