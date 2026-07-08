import { test, expect } from 'playwright/test';

test.describe('Care Guides route', () => {
  test('care-guides page renders with a page-level h1', async ({ page }) => {
    await page.goto('/care-guides');
    await expect(
      page.getByRole('heading', { name: /Caring for Your Pieces/i, level: 1 })
    ).toBeVisible();
  });

  // Guards the dead-link regression fixed alongside this route: the leather
  // collection's careInfoUrl points at /care-guides#leather, so all three
  // section anchors must resolve to a real element on the page.
  for (const anchor of ['leather', 'tie-dye', 'jewelry']) {
    test(`#${anchor} anchor resolves to a visible section`, async ({ page }) => {
      await page.goto(`/care-guides#${anchor}`);
      await expect(page.locator(`#${anchor}`)).toBeVisible();
    });
  }
});
