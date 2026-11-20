import type { Page } from 'playwright/test';
import { test, expect } from './support/test';

// Phase 3B browse journeys. Collection membership, titles and prices below
// are the permanent fixtures on the CI development store
// (wildenflower-ci.myshopify.com); see e2e/support/shopify-test-product.ts.
// The real store has different products, so fixture-bound specs are @full.

const ALL_TITLES = [
  'CI Simple Product', // $20
  'CI Sold Out Product', // $25
  'CI Variant Product', // $30
  'CI Small Run', // $40
  'CI One of One', // $120
];

const COLLECTIONS: ReadonlyArray<readonly [handle: string, title: string]> = [
  ['tie-dye', 'CI Small Run'],
  ['leather', 'CI One of One'],
  ['artwork', 'CI One of One'],
  ['jewelry', 'CI Variant Product'],
  ['frontpage', 'CI Simple Product'],
];

// Product cards render their title as an h3 inside the card's product link
// (components/product-card.tsx); the filter panel has its own h3s.
const cardTitles = (page: Page) =>
  page.getByRole('main').locator('a[href^="/products/"] h3');

async function expectCardTitles(page: Page, expected: string[]) {
  await expect(cardTitles(page)).toHaveText(expected);
}

test.describe('Browse: collections, sort, search, filter', { tag: '@full' }, () => {
  test.skip(!!process.env.BASE_URL, 'asserts CI dev-store fixtures');

  for (const [handle, title] of COLLECTIONS) {
    test(`collection ${handle} lists only ${title}`, async ({ page }) => {
      await page.goto(`/collections/${handle}`);
      await expectCardTitles(page, [title]);
      // Card links through to the product page.
      await cardTitles(page).first().click();
      await expect(page).toHaveURL(/\/products\/ci-/);
      await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
    });
  }

  test('sort control reorders /collections/all by price', async ({ page }) => {
    await page.goto('/collections/all');
    await expect(cardTitles(page)).toHaveCount(ALL_TITLES.length);

    await page.getByLabel(/sort/i).selectOption('price-asc');
    await expect(page).toHaveURL(/[?&]sort=price-asc/);
    await expectCardTitles(page, ALL_TITLES);

    await page.getByLabel(/sort/i).selectOption('price-desc');
    await expect(page).toHaveURL(/[?&]sort=price-desc/);
    await expectCardTitles(page, [...ALL_TITLES].reverse());
  });

  test('sort by name via URL', async ({ page }) => {
    await page.goto('/collections/all?sort=title-asc');
    await expectCardTitles(page, [...ALL_TITLES].sort((a, b) => a.localeCompare(b)));
  });

  test('price filter via URL keeps only products in range', async ({ page }) => {
    await page.goto('/collections/all?sort=price-asc&minPrice=26&maxPrice=100');
    await expectCardTitles(page, ['CI Variant Product', 'CI Small Run']);
  });

  test('search box narrows results; no-match shows empty state that clears', async ({ page }) => {
    await page.goto('/collections/all');
    await expect(cardTitles(page)).toHaveCount(ALL_TITLES.length);

    const search = page.getByRole('main').getByRole('searchbox').first();
    // WebKit can take the fill before React hydrates the controlled input and
    // drop it; re-fill until the filter applies.
    await expect(async () => {
      await search.fill('variant');
      await expect(cardTitles(page)).toHaveText(['CI Variant Product'], { timeout: 2_000 });
    }).toPass();

    await search.fill('zzz-no-such-thing');
    // Submit closes the predictive-search dropdown, which on phones otherwise
    // covers the empty state (Shopify's fuzzy predictive search still suggests
    // a product here even though the grid filter matches nothing).
    await search.press('Enter');
    await expect(page.getByText('No products found')).toBeVisible();
    await expect(cardTitles(page)).toHaveCount(0);

    await page.getByRole('button', { name: 'Clear all filters' }).click();
    await expect(cardTitles(page)).toHaveCount(ALL_TITLES.length);
  });
});

test.describe('Not found', { tag: '@smoke' }, () => {
  // The 404 document itself is logged by the browser as a failed resource.
  test.use({ allowedConsoleErrors: [/status of 404/] });

  test('unknown product handle returns a 404 page', async ({ page }) => {
    const res = await page.goto('/products/no-such-product-e2e');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  });

  test('unknown route returns a 404 page', async ({ page }) => {
    const res = await page.goto('/no-such-page-e2e');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  });
});

test.describe('Internal links', { tag: '@smoke' }, () => {
  // Read-only GETs, so safe against prod. Note: on Vercel the firewall answers
  // removed routes with 403 before the app, so a 403 here is still a failure.
  test('every same-origin link on key pages resolves', async ({ page, request, baseURL }) => {
    test.setTimeout(180_000); // ~25 pages; `next dev` compiles each on first hit
    const origin = new URL(baseURL!).origin;
    // Collection pages carry category-specific filter-panel links (size/care
    // guides) that the homepage does not; /size-guide 404'd from there.
    const sources = ['/', '/collections/all', '/collections/tie-dye', '/collections/jewelry', '/collections/leather'];
    const hrefs: string[] = [];
    for (const source of sources) {
      await page.goto(source);
      // Let client fetches (auth check) finish: leaving mid-request makes the
      // app log "Auth check error: Load failed" in Firefox/WebKit.
      await page.waitForLoadState('networkidle');
      hrefs.push(
        ...(await page
          .locator('a[href]')
          .evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href))),
      );
    }
    const paths = [
      ...new Set(
        hrefs
          .map((h) => new URL(h))
          .filter((u) => u.origin === origin && !u.pathname.startsWith('/api/'))
          .map((u) => u.pathname + u.search),
      ),
    ].sort();
    expect(paths.length, 'key pages have internal links').toBeGreaterThan(10);

    const broken: string[] = [];
    for (const path of paths) {
      const res = await request.get(path, { maxRedirects: 5 });
      if (res.status() >= 400) broken.push(`${res.status()} ${path}`);
    }
    expect(broken, `checked ${paths.length} links`).toEqual([]);
  });
});
