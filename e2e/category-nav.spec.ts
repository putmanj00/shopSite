import { test, expect } from 'playwright/test';

test.describe('Category navigation', () => {
  test('Shop dropdown navigates to a collection page', async ({ page }) => {
    await page.goto('/');

    // Hover triggers onMouseEnter dropdown — more reliable than click in headless mode
    await page.getByRole('button', { name: 'Shop' }).hover();

    // Wait for at least one menu item to be visible before capturing href
    const firstMenuItem = page.getByRole('menuitem').first();
    await expect(firstMenuItem).toBeVisible();

    const href = await firstMenuItem.getAttribute('href');
    await firstMenuItem.click();

    // URL should match the nav item's href — escape regex special chars in href
    await expect(page).toHaveURL(
      new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    );
  });
});
