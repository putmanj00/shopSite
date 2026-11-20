import { test, expect } from './support/test';

test.describe('Category navigation', { tag: '@smoke' }, () => {
  test('Shop dropdown navigates to a collection page', async ({ page, isMobile }) => {
    // Hover dropdown is the desktop header; phones use the bottom nav/menu.
    test.skip(isMobile, 'desktop-only hover menu');
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
