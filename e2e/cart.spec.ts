import type { Page, APIRequestContext } from 'playwright/test';
import { test, expect } from './support/test';

// Phase 3A cart journeys. Every product here is a permanent fixture on the CI
// development store (wildenflower-ci.myshopify.com) — see
// e2e/support/shopify-test-product.ts. These specs mutate a real Shopify cart,
// so they are @full only (never run against prod).
const SIMPLE = '/products/ci-simple-product'; // $20, single variant
const VARIANT = '/products/ci-variant-product'; // S / M / L, $30 each
const SOLD_OUT = '/products/ci-sold-out-product'; // $25, not for sale

const CART_STORAGE_KEY = 'shopsite-cart'; // lib/cart-store.ts persist name

async function addFromPdp(page: Page, path: string, size?: string) {
  await page.goto(path);
  if (size) {
    await page.getByRole('button', { name: size, exact: true }).click();
    await expect(page.getByText(`Size: ${size}`)).toBeVisible();
  }
  // The PDP also renders a sticky add-to-cart bar; the main button has an id.
  await page.locator('#main-add-to-cart').click();
  await waitForAdded(page);
}

// The drawer is always mounted off-canvas, so its heading is "visible" before
// any add finishes. Wait for the add's own success signal instead; returning
// early lets the next page.goto abort the in-flight Storefront request.
async function waitForAdded(page: Page) {
  await expect(page.getByText('Added to cart!')).toBeVisible();
  await expect(page.getByTestId('cart-drawer')).toHaveAttribute('data-state', 'open');
}

async function closeDrawer(page: Page) {
  await page.getByRole('button', { name: 'Close cart' }).click();
  await expect(page.getByTestId('cart-drawer')).toHaveAttribute('data-state', 'closed');
}

async function storedCartId(page: Page): Promise<string> {
  const raw = await page.evaluate(
    (key) => window.localStorage.getItem(key),
    CART_STORAGE_KEY,
  );
  const id = raw ? JSON.parse(raw)?.state?.cart?.id : null;
  expect(id, 'cart id persisted to localStorage').toBeTruthy();
  return id as string;
}

// Read the cart straight from the Storefront API so the assertion is about
// what Shopify will check out, not what the drawer renders.
async function fetchCartLines(request: APIRequestContext, cartId: string) {
  const domain =
    process.env.SHOPIFY_STORE_DOMAIN || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token =
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const res = await request.post(`https://${domain}/api/2026-04/graphql.json`, {
    headers: {
      'X-Shopify-Storefront-Access-Token': token ?? '',
      'Content-Type': 'application/json',
    },
    data: {
      query: `query($id: ID!) { cart(id: $id) { lines(first: 10) { edges { node {
        quantity merchandise { ... on ProductVariant { title product { handle } } }
      } } } } }`,
      variables: { id: cartId },
    },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  return (body.data.cart.lines.edges as Array<{
    node: { quantity: number; merchandise: { title: string; product: { handle: string } } };
  }>)
    .map(({ node }) => ({
      handle: node.merchandise.product.handle,
      variant: node.merchandise.title,
      quantity: node.quantity,
    }))
    .sort((a, b) => a.handle.localeCompare(b.handle));
}

const CHECKOUT_URL = /(myshopify\.com\/(cart\/c|checkouts)\/|shop\.app\/checkout)/;

// Leave for Shopify checkout, then return to the site — a shopper going back
// to edit their cart mid-checkout. Returns via a fresh load of our site rather
// than history.back(): the dev store's /password page never settles in
// Chromium, and WebKit's back-forward cache restores stale drawer state.
async function visitCheckoutAndReturn(page: Page) {
  await Promise.all([
    page.waitForRequest((r) => r.isNavigationRequest() && CHECKOUT_URL.test(r.url()), {
      timeout: 15_000,
    }),
    page.getByRole('button', { name: 'Proceed to Checkout' }).click(),
  ]);
  await page.goto('/');
  await page.getByRole('button', { name: 'Open cart' }).first().click();
  await expect(page.getByTestId('cart-drawer')).toHaveAttribute('data-state', 'open');
}

test.describe('Cart journeys', { tag: '@full' }, () => {
  test.skip(!!process.env.BASE_URL, 'mutates a Shopify cart; dev store only');
  test.use({ storageState: { cookies: [], origins: [] } });

  test('build: simple + chosen variant → two lines, $50 subtotal', async ({ page }) => {
    await addFromPdp(page, SIMPLE);
    await closeDrawer(page);
    await addFromPdp(page, VARIANT, 'M');

    const drawer = page.getByTestId('cart-drawer');
    await expect(drawer.getByText('CI Simple Product', { exact: true })).toBeVisible();
    await expect(drawer.getByText('CI Variant Product', { exact: true })).toBeVisible();
    // The variant line shows the size the customer picked, not the default.
    await expect(drawer.getByText(/^M$/)).toBeVisible();
    await expect(drawer.getByTestId('cart-subtotal')).toHaveText('$50.00');
    await expect(page.getByTestId('cart-count')).toHaveText('2');
  });

  test('edit: qty ±, remove one of two, persists on reload, empty state', async ({ page }) => {
    await addFromPdp(page, SIMPLE);
    const drawer = page.getByTestId('cart-drawer');
    const subtotal = drawer.getByTestId('cart-subtotal');

    await drawer.getByRole('button', { name: 'Increase quantity' }).click();
    await expect(subtotal).toHaveText('$40.00');
    await expect(page.getByTestId('cart-count')).toHaveText('2');

    await drawer.getByRole('button', { name: 'Decrease quantity' }).click();
    await expect(subtotal).toHaveText('$20.00');
    await expect(page.getByTestId('cart-count')).toHaveText('1');
    // Quantity 1 is the floor; removal goes through Remove.
    await expect(drawer.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled();

    await closeDrawer(page);
    await addFromPdp(page, VARIANT); // default size
    await expect(subtotal).toHaveText('$50.00');

    // Remove the simple product: its row is the one linking to it.
    const simpleRow = drawer
      .getByTestId('cart-line')
      .filter({ has: page.getByText('CI Simple Product', { exact: true }) });
    await simpleRow.getByRole('button', { name: /^Remove$/ }).click();
    await expect(drawer.getByText('CI Simple Product', { exact: true })).toHaveCount(0);
    await expect(subtotal).toHaveText('$30.00');

    await page.reload();
    await expect(page.getByTestId('cart-count')).toHaveText('1');
    await page.getByRole('button', { name: 'Open cart' }).first().click();
    await expect(drawer.getByText('CI Variant Product', { exact: true })).toBeVisible();

    await drawer.getByRole('button', { name: /^Remove$/ }).click();
    await expect(drawer.getByText(/basket is empty/i)).toBeVisible();
    await expect(page.getByTestId('cart-count')).toHaveCount(0);
  });

  test('edge: sold-out product cannot be added', async ({ page }) => {
    await page.goto(SOLD_OUT);
    const button = page.locator('#main-add-to-cart');
    await expect(button).toBeDisabled();
    await expect(button).toHaveText(/Out of Stock/i);
  });

  test('edge: first variant is preselected, so add never lacks a size', async ({ page }) => {
    // Current contract (components/product-info.tsx): variants[0] is selected
    // on load, so there is no "pick a size first" state to guard.
    await page.goto(VARIANT);
    await expect(page.getByText('Size: S')).toBeVisible();
    await page.locator('#main-add-to-cart').click();
    await waitForAdded(page);
    const drawer = page.getByTestId('cart-drawer');
    await expect(drawer.getByText(/^S$/)).toBeVisible();
    await expect(drawer.getByTestId('cart-subtotal')).toHaveText('$30.00');
  });

  test('edge: expired cart id in storage recovers with a fresh cart', async ({ page }) => {
    // Shopify carts expire; a returning visitor's persisted id then answers
    // "The specified cart does not exist." Adding must still work.
    const staleCart = {
      id: 'gid://shopify/Cart/expired-e2e-fixture?key=deadbeef',
      checkoutUrl: 'https://wildenflower-ci.myshopify.com/cart/c/expired',
      totalQuantity: 0,
      lines: { edges: [] },
      cost: {
        subtotalAmount: { amount: '0.0', currencyCode: 'USD' },
        totalAmount: { amount: '0.0', currencyCode: 'USD' },
      },
    };
    await page.addInitScript(
      ([key, value]) => {
        if (!window.sessionStorage.getItem('e2e-stale-seeded')) {
          window.localStorage.setItem(key, value);
          window.sessionStorage.setItem('e2e-stale-seeded', '1');
        }
      },
      [CART_STORAGE_KEY, JSON.stringify({ state: { cart: staleCart }, version: 0 })] as const,
    );

    await addFromPdp(page, SIMPLE);
    await expect(page.getByText(/Failed to add to cart/i)).toHaveCount(0);
    await expect(page.getByTestId('cart-count')).toHaveText('1');
    expect(await storedCartId(page)).not.toBe(staleCart.id);
  });

  // Once an order is placed, Storefront answers cart(id) with null. The CI
  // store cannot take payment, so stand in for "checked out" by answering the
  // drawer's getCart query with that null.
  test('after purchase: a checked-out cart is cleared on return', async ({ page }) => {
    await addFromPdp(page, SIMPLE);
    await closeDrawer(page);
    await expect(page.getByTestId('cart-count')).toHaveText('1');

    await page.route('**/api/**/graphql.json', async (route) => {
      if (route.request().postData()?.includes('getCart')) {
        return route.fulfill({ json: { data: { cart: null } } });
      }
      return route.fallback();
    });
    await page.goto('/');

    await expect(page.getByTestId('cart-count')).toHaveCount(0);
    await page.getByRole('button', { name: 'Open cart' }).first().click();
    await expect(page.getByTestId('cart-drawer').getByText(/basket is empty/i)).toBeVisible();
  });

  test.describe('refresh failure', () => {
    // The aborted getCart is logged by the browser as a failed resource.
    test.use({ allowedConsoleErrors: [/Failed to load resource|net::ERR_FAILED/] });

    test('keeps the cart (never empty it on a network blip)', async ({ page }) => {
      await addFromPdp(page, SIMPLE);
      await closeDrawer(page);

      await page.route('**/api/**/graphql.json', async (route) => {
        if (route.request().postData()?.includes('getCart')) return route.abort('failed');
        return route.fallback();
      });
      const refreshed = page.waitForRequest((r) => !!r.postData()?.includes('getCart'));
      await page.goto('/');
      await refreshed;

      await expect(page.getByTestId('cart-count')).toHaveText('1');
    });
  });

  test('checkout hands off a Shopify cart holding both lines', async ({ page, request }) => {
    await addFromPdp(page, SIMPLE);
    await closeDrawer(page);
    await addFromPdp(page, VARIANT, 'L');

    const cartId = await storedCartId(page);
    expect(await fetchCartLines(request, cartId)).toEqual([
      { handle: 'ci-simple-product', variant: 'Default Title', quantity: 1 },
      { handle: 'ci-variant-product', variant: 'L', quantity: 1 },
    ]);

    // Same handoff contract as checkout.spec.ts: assert the navigation request
    // (the dev store is password-protected and bounces on to /password).
    const [req] = await Promise.all([
      page.waitForRequest(
        (r) => r.isNavigationRequest() && CHECKOUT_URL.test(r.url()),
        { timeout: 15_000 },
      ),
      page.getByRole('button', { name: 'Proceed to Checkout' }).click(),
    ]);
    expect(req.url()).toMatch(CHECKOUT_URL);
  });

  // Edits made after visiting checkout must reach the cart Shopify checks
  // out (launch plan C7/C8). Assert via the Storefront cart, not Shopify's
  // checkout DOM (bot-protected; the dev store bounces to /password).
  test('edits after returning from checkout reach the Shopify cart', async ({ page, request }) => {
    test.setTimeout(60_000); // two round trips to Shopify checkout
    await addFromPdp(page, SIMPLE);
    await closeDrawer(page);
    await addFromPdp(page, VARIANT, 'L');
    const cartId = await storedCartId(page);
    const drawer = page.getByTestId('cart-drawer');
    const subtotal = drawer.getByTestId('cart-subtotal');

    // C7: remove a line after a checkout visit.
    await visitCheckoutAndReturn(page);
    await drawer
      .getByTestId('cart-line')
      .filter({ has: page.getByText('CI Simple Product', { exact: true }) })
      .getByRole('button', { name: /^Remove$/ })
      .click();
    await expect(subtotal).toHaveText('$30.00');
    expect(await storedCartId(page)).toBe(cartId);
    await expect
      .poll(() => fetchCartLines(request, cartId))
      .toEqual([{ handle: 'ci-variant-product', variant: 'L', quantity: 1 }]);

    // C8: change quantity after another checkout visit.
    await visitCheckoutAndReturn(page);
    await drawer.getByRole('button', { name: 'Increase quantity' }).click();
    await expect(subtotal).toHaveText('$60.00');
    expect(await storedCartId(page)).toBe(cartId);
    await expect
      .poll(() => fetchCartLines(request, cartId))
      .toEqual([{ handle: 'ci-variant-product', variant: 'L', quantity: 2 }]);
  });
});
