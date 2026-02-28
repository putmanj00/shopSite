import { test, expect } from 'playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero heading is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Made by hand\. Found by heart\./i, level: 1 })
    ).toBeVisible();
  });

  test('main navigation is visible', async ({ page }) => {
    await expect(
      page.getByRole('navigation', { name: 'Main navigation' })
    ).toBeVisible();
  });

  test('featured products section is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Freshly Gathered/i })
    ).toBeVisible();
  });
});
