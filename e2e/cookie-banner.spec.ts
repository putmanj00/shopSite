import { test, expect } from './support/test';

test.describe('Cookie banner', { tag: '@smoke' }, () => {
  // Opt out of the fixture's pre-dismissed consent to see the first-visit state.
  test.use({ cookieConsent: null });

  test('shows on first visit and stays dismissed after Accept', async ({ page }) => {
    await page.goto('/');
    const accept = page.getByRole('button', { name: 'Accept' });
    await expect(accept).toBeVisible();
    await accept.click();
    await expect(accept).toBeHidden();

    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Accept' })).toHaveCount(0);
  });
});
