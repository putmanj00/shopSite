import { test, expect } from 'playwright/test';

// From .planning/phases/19-playwright-e2e-tests/test-product.md
const TEST_PRODUCT_HANDLE = 'wildenflower-test-product';
const TEST_PRODUCT_TITLE = 'Wildenflower Test Product';

test.describe('Product detail page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/products/${TEST_PRODUCT_HANDLE}`);
  });

  test('product title heading is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: TEST_PRODUCT_TITLE, level: 1 })
    ).toBeVisible();
  });

  test('product image is visible', async ({ page }) => {
    // Next.js Image component renders an <img> — first image on the page is the product image
    await expect(page.getByRole('img').first()).toBeVisible();
  });

  test('add to cart button is visible and enabled', async ({ page }) => {
    const addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
    await expect(addToCartButton).toBeVisible();
    await expect(addToCartButton).toBeEnabled();
  });
});
