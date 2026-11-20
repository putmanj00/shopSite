import type { Page } from 'playwright/test';
import { test, expect } from './support/test';
import { TEST_PRODUCT_HANDLE, TEST_PRODUCT_TITLE } from './support/shopify-test-product';

// Phase 3D — SEO head tags on key pages + Product JSON-LD on the PDP.
// Read-only, so @smoke-safe. The canonical HOST comes from NEXT_PUBLIC_BASE_URL
// (deploy config), so only the path is asserted here.

async function expectHead(page: Page, path: string, canonicalPath: string) {
  await page.goto(path);

  const title = await page.title();
  expect(title.match(/Wildenflower/g)?.length, `brand repeated in "${title}"`).toBe(1);
  expect(title).not.toMatch(/shopSite/i);

  const description = await page.locator('meta[name="description"]').getAttribute('content');
  expect(description?.trim().length ?? 0, 'meta description').toBeGreaterThan(0);

  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveCount(1);
  const href = (await canonical.getAttribute('href')) ?? '';
  const url = new URL(href); // throws if not absolute
  expect(url.pathname.replace(/\/$/, '') || '/').toBe(canonicalPath);
  expect(url.search, 'canonical carries no query').toBe('');
}

test.describe('SEO head tags', { tag: '@smoke' }, () => {
  test('homepage', async ({ page }) => {
    await expectHead(page, '/', '/');
  });

  test('all-products collection', async ({ page }) => {
    await expectHead(page, '/collections/all?sort=price-asc', '/collections/all');
  });

  test('product detail page', async ({ page }) => {
    await expectHead(page, `/products/${TEST_PRODUCT_HANDLE}`, `/products/${TEST_PRODUCT_HANDLE}`);
  });

  test('care guides (static page)', async ({ page }) => {
    await expectHead(page, '/care-guides', '/care-guides');
  });
});

test.describe('Product JSON-LD', { tag: '@smoke' }, () => {
  test('PDP carries a Product with name, price, availability and image', async ({ page }) => {
    await page.goto(`/products/${TEST_PRODUCT_HANDLE}`);

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const nodes = blocks.flatMap((text) => {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [parsed];
    });
    const product = nodes.find((n) => n['@type'] === 'Product');
    expect(product, 'a Product JSON-LD block').toBeTruthy();

    expect(product.name).toBe(TEST_PRODUCT_TITLE);
    expect(Array.isArray(product.image) && product.image.length, 'image list').toBeTruthy();
    expect(product.image[0]).toMatch(/^https:\/\//);

    const offer = product.offers;
    expect(offer, 'offers').toBeTruthy();
    expect(Number(offer.lowPrice ?? offer.price)).toBeGreaterThan(0);
    expect(offer.priceCurrency).toMatch(/^[A-Z]{3}$/);
    expect(offer.availability).toMatch(/^https:\/\/schema\.org\/(InStock|OutOfStock)$/);
  });
});
