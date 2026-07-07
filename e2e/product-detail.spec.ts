import { test, expect } from 'playwright/test';
import {
  TEST_PRODUCT_HANDLE,
  TEST_PRODUCT_TITLE,
} from './support/shopify-test-product';

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

  test('reviews section renders with a working submit form', async ({ page }) => {
    // Reviews heading is always present (Judge.me widget when reviews exist,
    // honest brand zero-state otherwise).
    await expect(
      page.getByRole('heading', { name: 'Reviews', level: 2 })
    ).toBeVisible();

    // The brand-native "Write a note" form opens and exposes a rating control.
    const openForm = page.getByRole('button', { name: 'Write a note' });
    await expect(openForm).toBeVisible();
    await openForm.click();

    await expect(page.getByRole('radiogroup', { name: 'Star rating' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit note' })).toBeVisible();
  });
});
