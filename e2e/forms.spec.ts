import type { Page, Route } from 'playwright/test';
import { test, expect } from './support/test';
import { TEST_PRODUCT_HANDLE } from './support/shopify-test-product';

// Phase 3D — form states. Every POST is answered by page.route, so no real
// subscriber or review is ever created. Belt and braces: never run against a
// deployed BASE_URL, where a mock that failed to match would hit the live API.
//
// Not covered: BackInStockForm (components/cro/back-in-stock-form.tsx) is not
// mounted on any page yet. Add a spec here when it is.

type Body = Record<string, unknown>;

/** Answer POSTs to `path` with `status`/`json`, recording request bodies. */
async function mockPost(page: Page, path: string, status: number, json: Body) {
  const bodies: Body[] = [];
  await page.route(`**${path}`, (route: Route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    bodies.push(route.request().postDataJSON());
    return route.fulfill({ status, json });
  });
  return bodies;
}

async function abortPost(page: Page, path: string) {
  await page.route(`**${path}`, (route) => route.abort('failed'));
}

test.describe('Forms', { tag: '@full' }, () => {
  test.skip(!!process.env.BASE_URL, 'form specs mock the API; local/CI only');
  // The failure-state tests answer with 4xx/5xx or abort the request on
  // purpose; browsers log those as resource-load errors. One regex: test.use
  // reads a two-element array as a [value, options] tuple.
  test.use({ allowedConsoleErrors: [/Failed to load resource|net::ERR_FAILED/] });

  test.describe('newsletter (homepage)', () => {
    const email = (page: Page) => page.getByLabel('Email address');
    const subscribe = (page: Page) => page.getByRole('button', { name: 'Subscribe' });

    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await email(page).scrollIntoViewIfNeeded();
    });

    test('empty email shows an inline error and sends nothing', async ({ page }) => {
      const bodies = await mockPost(page, '/api/newsletter', 200, { success: true, message: 'x' });
      await subscribe(page).click();
      await expect(page.locator('#newsletter-message[role=alert]')).toHaveText('Please enter your email address');
      expect(bodies).toEqual([]);
    });

    test('success: confirmation shown, field cleared and locked', async ({ page }) => {
      const bodies = await mockPost(page, '/api/newsletter', 200, {
        success: true,
        message: "You're on the list — we'll be in touch.",
      });
      await email(page).fill('fern@example.com');
      await subscribe(page).click();

      await expect(page.getByRole('status').filter({ hasText: "You're on the list" })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Subscribed!' })).toBeDisabled();
      await expect(email(page)).toHaveValue('');
      await expect(email(page)).toBeDisabled();
      expect(bodies).toEqual([{ email: 'fern@example.com' }]);
    });

    test('API failure: server message shown, can retry', async ({ page }) => {
      await mockPost(page, '/api/newsletter', 502, {
        success: false,
        message: 'We could not add you right now. Please try again shortly.',
      });
      await email(page).fill('fern@example.com');
      await subscribe(page).click();

      await expect(page.locator('#newsletter-message[role=alert]')).toHaveText(
        'We could not add you right now. Please try again shortly.',
      );
      await expect(email(page)).toHaveValue('fern@example.com');
      await expect(subscribe(page)).toBeEnabled();
    });

    test('network failure: generic error shown', async ({ page }) => {
      await abortPost(page, '/api/newsletter');
      await email(page).fill('fern@example.com');
      await subscribe(page).click();
      await expect(page.locator('#newsletter-message[role=alert]')).toHaveText('Something went wrong. Please try again.');
    });
  });

  test.describe('review note (PDP)', () => {
    const form = (page: Page) => page.locator('form').filter({ hasText: 'Leave a note' });

    test.beforeEach(async ({ page }) => {
      await page.goto(`/products/${TEST_PRODUCT_HANDLE}`);
      await page.getByRole('button', { name: 'Write a note' }).click();
      await expect(form(page)).toBeVisible();
    });

    async function fillNote(page: Page) {
      await form(page).getByLabel('Name').fill('Fern');
      await form(page).getByLabel('Email').fill('fern@example.com');
      await form(page).getByLabel('Your note').fill('Soft, bright, and the colors held up in the wash.');
    }

    test('no star rating: inline error, nothing sent', async ({ page }) => {
      const bodies = await mockPost(page, '/api/reviews', 201, { status: 'pending' });
      await fillNote(page);
      await form(page).getByRole('button', { name: 'Submit note' }).click();
      await expect(form(page).getByRole('alert')).toHaveText('Please choose a star rating.');
      expect(bodies).toEqual([]);
    });

    test('success: thank-you state replaces the form', async ({ page }) => {
      const bodies = await mockPost(page, '/api/reviews', 201, { status: 'pending' });
      await fillNote(page);
      await form(page).getByRole('radio', { name: /^4 stars/ }).click();
      await form(page).getByRole('button', { name: 'Submit note' }).click();

      await expect(page.getByRole('status').filter({ hasText: 'Thank you for your note.' })).toBeVisible();
      await expect(form(page)).toHaveCount(0);
      expect(bodies).toHaveLength(1);
      expect(bodies[0]).toMatchObject({
        handle: TEST_PRODUCT_HANDLE,
        rating: 4,
        name: 'Fern',
        email: 'fern@example.com',
      });
    });

    test('server validation error: message shown, form kept', async ({ page }) => {
      await mockPost(page, '/api/reviews', 400, { error: 'Please enter a valid email.' });
      await fillNote(page);
      await form(page).getByRole('radio', { name: /^5 stars/ }).click();
      await form(page).getByRole('button', { name: 'Submit note' }).click();

      await expect(form(page).getByRole('alert')).toHaveText('Please enter a valid email.');
      await expect(form(page).getByLabel('Your note')).not.toHaveValue('');
      await expect(form(page).getByRole('button', { name: 'Submit note' })).toBeEnabled();
    });

    test('network failure: generic error shown', async ({ page }) => {
      await abortPost(page, '/api/reviews');
      await fillNote(page);
      await form(page).getByRole('radio', { name: /^5 stars/ }).click();
      await form(page).getByRole('button', { name: 'Submit note' }).click();
      await expect(form(page).getByRole('alert')).toHaveText(
        'Could not submit your note. Please try again.',
      );
    });
  });
});
