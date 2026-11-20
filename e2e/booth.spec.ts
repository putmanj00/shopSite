import { test, expect } from './support/test';

test.describe('Booth route', { tag: '@smoke' }, () => {
  test('booth page renders with a page-level h1', async ({ page }) => {
    await page.goto('/booth');
    await expect(
      page.getByRole('heading', { name: /Find Us in the Wild/i, level: 1 })
    ).toBeVisible();
  });

  test('market ribbon links to the booth route', async ({ page }) => {
    await page.goto('/');
    const ribbonLink = page.getByRole('link', { name: 'Booth details' });
    await expect(ribbonLink).toBeVisible();
    await ribbonLink.click();
    await expect(page).toHaveURL(/\/booth$/);
    await expect(
      page.getByRole('heading', { name: /Find Us in the Wild/i, level: 1 })
    ).toBeVisible();
  });

  test('mobile bottom-nav Booth tab navigates to the booth route', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    // The shared fixture pre-dismisses the cookie banner, which would
    // otherwise overlap the bottom nav (e2e/support/test.ts).
    const nav = page.locator('nav[aria-label="Mobile navigation"]');
    await nav.getByRole('link', { name: 'Booth' }).click();
    await expect(page).toHaveURL(/\/booth$/);
  });
});
