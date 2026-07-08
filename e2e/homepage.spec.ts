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

  test('lifetime-repair band is visible and links to the policy', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /We repair it/i })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Read the full promise/i })
    ).toHaveAttribute('href', '/shipping-returns');
  });

  test('Inner Circle signup is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Join the Inner Circle/i })
    ).toBeVisible();
  });
});

test.describe('Shipping & Returns policy', () => {
  test('publishes the lifetime-repair promise and 14-day returns', async ({ page }) => {
    await page.goto('/shipping-returns');
    await expect(
      page.getByRole('heading', { name: /Lifetime Repair/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /14-Day Returns/i })
    ).toBeVisible();
  });
});
