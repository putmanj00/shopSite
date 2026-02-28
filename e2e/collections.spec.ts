import { test, expect } from 'playwright/test';

test.describe('/collections/all', () => {
  test('product grid is visible with at least one product', async ({ page }) => {
    await page.goto('/collections/all');
    // Wait for at least one product heading — auto-retry handles Shopify API latency
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible();
  });
});
