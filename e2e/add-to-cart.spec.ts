import { test, expect } from 'playwright/test';
import {
  TEST_PRODUCT_HANDLE,
  TEST_PRODUCT_TITLE,
} from './support/shopify-test-product';

const PHONE_VIEWPORT = { width: 390, height: 664 };

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

test.describe('Cart drawer on a phone-sized screen', () => {
  // Real customer flow on mobile: add an item, then view and remove it.
  test.use({
    storageState: { cookies: [], origins: [] },
    viewport: PHONE_VIEWPORT,
  });

  test('added item, its Remove control, and checkout stay visible and usable', async ({
    page,
  }) => {
    await page.goto(`/products/${TEST_PRODUCT_HANDLE}`);
    await page.getByRole('button', { name: 'Add to Cart' }).click();

    await expect(
      page.getByRole('heading', { name: /Your Gathering/i })
    ).toBeVisible();

    // Field-journal line-item plate (S6): the entry title reads in the catalog
    // voice. Scope to the drawer — the PDP behind it shows the same title.
    const drawer = page.getByTestId('cart-drawer');
    await expect(
      drawer.getByText(new RegExp(TEST_PRODUCT_TITLE, 'i')).first()
    ).toBeVisible();

    // Zero-metafield fallback: the seed catalog has no `custom.entry_no` yet
    // (SHOP-01 pending), so the "Entry №" eyebrow must be absent — never a bare
    // "№" or "Entry" with nothing after it. Once metafields land it appears.
    await expect(drawer.getByTestId('cart-entry-no')).toHaveCount(0);

    // Regression guard (drawer items pane collapsing to 0 height behind the
    // tall pinned footer on short viewports): the Remove control and the
    // checkout CTA must both be visible at the same time on a phone.
    const remove = page.getByRole('button', { name: /^Remove$/ });
    await expect(remove).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Proceed to Checkout/i })
    ).toBeVisible();

    // ...and Remove must be actually clickable — Playwright's click enforces
    // actionability (visible, stable, not obscured by another element), so this
    // fails if the footer overlaps the item row again.
    await remove.click();
    await expect(page.getByText(/basket is empty/i)).toBeVisible();
    await expect(page.getByTestId('cart-count')).toHaveCount(0);
  });
});
