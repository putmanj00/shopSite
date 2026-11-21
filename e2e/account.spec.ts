import { test, expect } from './support/test';
import type { Page, Route } from 'playwright/test';

// Customer account: address book + orders + sign-out against a mocked
// /api/customer/*. These cover UI behaviour and the request payloads the UI
// sends. They CANNOT catch Customer Account API schema mismatches — that is
// scripts/customer-address.test.ts (contract test against a schema snapshot).
// Route-level 401s run against the real Next routes (no session cookie).

const ME = {
  authenticated: true,
  customer: {
    id: 'gid://shopify/Customer/1',
    email: 'fern@example.com',
    firstName: 'Fern',
    lastName: 'Gully',
    displayName: 'Fern Gully',
  },
};

type Addr = {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string | null;
  city: string;
  province: string;
  zoneCode: string;
  country: string;
  territoryCode: string;
  zip: string;
  phoneNumber: string | null;
};

const HOME: Addr = {
  id: 'gid://shopify/CustomerAddress/1',
  firstName: 'Fern',
  lastName: 'Gully',
  address1: '12 Hollow Rd',
  address2: null,
  city: 'Covington',
  province: 'Kentucky',
  zoneCode: 'KY',
  country: 'United States',
  territoryCode: 'US',
  zip: '41011',
  phoneNumber: null,
};

const WORK: Addr = {
  ...HOME,
  id: 'gid://shopify/CustomerAddress/2',
  address1: '400 Market St',
  city: 'Louisville',
  zip: '40202',
};

/** Stateful fake of /api/customer/addresses; records every POST body. */
async function mockAddressApi(page: Page, initial: Addr[], defaultId: string | null) {
  const state = { addresses: [...initial], defaultId, posts: [] as Record<string, unknown>[] };
  let nextId = 10;
  await page.route('**/api/customer/addresses', async (route: Route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: { addresses: state.addresses, defaultAddressId: state.defaultId } });
    }
    const body = route.request().postDataJSON() as Record<string, unknown>;
    state.posts.push(body);
    const form = (body.address ?? {}) as Record<string, string>;
    const asAddr = (id: string): Addr => ({
      id,
      firstName: form.firstName,
      lastName: form.lastName,
      address1: form.address1,
      address2: form.address2 || null,
      city: form.city,
      province: form.province,
      zoneCode: form.province.length === 2 ? form.province.toUpperCase() : 'KY',
      country: 'United States',
      territoryCode: 'US',
      zip: form.zip,
      phoneNumber: form.phone || null,
    });
    switch (body.action) {
      case 'create': {
        const a = asAddr(`gid://shopify/CustomerAddress/${nextId++}`);
        state.addresses.push(a);
        return route.fulfill({ json: { address: a } });
      }
      case 'update': {
        const a = asAddr(body.addressId as string);
        state.addresses = state.addresses.map((x) => (x.id === a.id ? a : x));
        return route.fulfill({ json: { address: a } });
      }
      case 'delete':
        state.addresses = state.addresses.filter((x) => x.id !== body.addressId);
        return route.fulfill({ json: { deletedAddressId: body.addressId } });
      case 'setDefault':
        state.defaultId = body.addressId as string;
        return route.fulfill({ json: { defaultAddressId: body.addressId } });
      default:
        return route.fulfill({ status: 400, json: { error: 'Invalid action' } });
    }
  });
  return state;
}

async function signedIn(page: Page, orders: unknown[] = []) {
  await page.route('**/api/auth/customer/me', (route) => route.fulfill({ json: ME }));
  await page.route('**/api/customer/orders**', (route) =>
    route.fulfill({ json: { orders, hasNextPage: false } }),
  );
}

/** One address card: the smallest block holding the street line and its buttons. */
function addressCard(page: Page, street: string) {
  return page
    .locator('div')
    .filter({ hasText: street })
    .filter({ has: page.getByRole('button', { name: 'Delete' }) })
    .last();
}

/** The address book's error box (not Next's empty route-announcer alert). */
function addressAlert(page: Page) {
  return page.getByRole('alert').filter({ hasText: /\S/ });
}

async function openAddresses(page: Page) {
  await page.goto('/account');
  await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible();
  await page.getByRole('button', { name: 'Addresses' }).click();
  await expect(page.getByRole('heading', { name: 'Saved Addresses' })).toBeVisible();
}

test.describe('account — address book (mocked API)', () => {
  test('add an address: form posts the fields the server maps, list refreshes', async ({ page }) => {
    await signedIn(page);
    const api = await mockAddressApi(page, [], null);
    await openAddresses(page);
    await expect(page.getByText('No addresses saved')).toBeVisible();

    await page.getByRole('button', { name: 'Add Address' }).click();
    await page.getByLabel('First Name *').fill('Fern');
    await page.getByLabel('Last Name *').fill('Gully');
    await page.getByLabel('Address Line 1 *').fill('12 Hollow Rd');
    await page.getByLabel('City *').fill('Covington');
    await page.getByLabel('State / Province *').fill('KY');
    await page.getByLabel('ZIP / Postal Code *').fill('41011');
    await page.getByLabel('Phone Number').fill('(859) 555-0100');
    await page.getByRole('button', { name: 'Add Address' }).click();

    await expect(page.getByText('12 Hollow Rd')).toBeVisible();
    await expect(page.getByText(/Covington, KY 41011/)).toBeVisible();
    await expect(page.getByText('1 address saved')).toBeVisible();
    expect(api.posts).toHaveLength(1);
    expect(api.posts[0]).toMatchObject({
      action: 'create',
      address: {
        firstName: 'Fern',
        address1: '12 Hollow Rd',
        province: 'KY',
        country: 'United States',
        zip: '41011',
        phone: '(859) 555-0100',
      },
    });
  });

  test('edit prefills from the saved address and posts update with its id', async ({ page }) => {
    await signedIn(page);
    const api = await mockAddressApi(page, [HOME], HOME.id);
    await openAddresses(page);

    await addressCard(page, '12 Hollow Rd').getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('heading', { name: 'Edit Address' })).toBeVisible();
    // zoneCode KY prefills as the state name the mapper accepts.
    await expect(page.getByLabel('State / Province *')).toHaveValue('Kentucky');
    await page.getByLabel('Address Line 1 *').fill('14 Hollow Rd');
    await page.getByRole('button', { name: 'Update Address' }).click();

    await expect(page.getByText('14 Hollow Rd')).toBeVisible();
    expect(api.posts[0]).toMatchObject({ action: 'update', addressId: HOME.id });
  });

  test('delete asks for confirmation and removes the card', async ({ page }) => {
    await signedIn(page);
    const api = await mockAddressApi(page, [HOME, WORK], HOME.id);
    await openAddresses(page);
    page.once('dialog', (d) => d.accept());

    await addressCard(page, '400 Market St').getByRole('button', { name: 'Delete' }).click();

    await expect(page.getByText('400 Market St')).toHaveCount(0);
    await expect(page.getByText('1 address saved')).toBeVisible();
    expect(api.posts[0]).toEqual({ action: 'delete', addressId: WORK.id });
  });

  test('set as default moves the Default badge', async ({ page }) => {
    await signedIn(page);
    const api = await mockAddressApi(page, [HOME, WORK], HOME.id);
    await openAddresses(page);

    await addressCard(page, '400 Market St').getByRole('button', { name: 'Set as default' }).click();
    await expect(addressCard(page, '400 Market St').getByText('Default Address')).toBeVisible();
    await expect(addressCard(page, '12 Hollow Rd').getByText('Default Address')).toHaveCount(0);
    await expect(addressCard(page, '12 Hollow Rd').getByRole('button', { name: 'Set as default' })).toBeVisible();
    expect(api.posts[0]).toEqual({ action: 'setDefault', addressId: WORK.id });
  });
});

test.describe('account — address book error states', () => {
  test.use({ allowedConsoleErrors: [/Failed to load resource|status of (400|401|500)/] });

  test('server validation message is shown and the form stays open', async ({ page }) => {
    await signedIn(page);
    await page.route('**/api/customer/addresses', (route) =>
      route.request().method() === 'GET'
        ? route.fulfill({ json: { addresses: [], defaultAddressId: null } })
        : route.fulfill({ status: 400, json: { error: 'Enter a valid US state (e.g. KY or Kentucky).' } }),
    );
    await openAddresses(page);
    await page.getByRole('button', { name: 'Add Address' }).click();
    await page.getByLabel('First Name *').fill('Fern');
    await page.getByLabel('Last Name *').fill('Gully');
    await page.getByLabel('Address Line 1 *').fill('12 Hollow Rd');
    await page.getByLabel('City *').fill('Covington');
    await page.getByLabel('State / Province *').fill('Narnia');
    await page.getByLabel('ZIP / Postal Code *').fill('41011');
    await page.getByRole('button', { name: 'Add Address' }).click();

    await expect(addressAlert(page)).toHaveText('Enter a valid US state (e.g. KY or Kentucky).');
    await expect(page.getByRole('heading', { name: 'Add New Address' })).toBeVisible();
  });

  test('server failure on load shows the API message', async ({ page }) => {
    await signedIn(page);
    await page.route('**/api/customer/addresses', (route) =>
      route.fulfill({ status: 500, json: { error: "We couldn't load your addresses. Please try again." } }),
    );
    await openAddresses(page);
    await expect(addressAlert(page)).toHaveText("We couldn't load your addresses. Please try again.");
  });

  test('401 from the address API sends the shopper to sign in', async ({ page }) => {
    // The real server clears the session on 401, so /me turns unauthenticated
    // too; otherwise /login would bounce a "signed-in" shopper back to /account.
    let sessionExpired = false;
    await page.route('**/api/auth/customer/me', (route) =>
      route.fulfill({ json: sessionExpired ? { authenticated: false, customer: null } : ME }),
    );
    await page.route('**/api/customer/orders**', (route) =>
      route.fulfill({ json: { orders: [], hasNextPage: false } }),
    );
    await page.route('**/api/customer/addresses', (route) => {
      sessionExpired = true;
      return route.fulfill({ status: 401, json: { error: 'Your session has expired. Please sign in again.' } });
    });
    await page.route('**/api/auth/customer/authorize**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<p>authorize stub</p>' }),
    );
    const toLogin = page.waitForURL(/\/login\?returnTo=(%2F|\/)account/);
    await openAddresses(page);
    await toLogin;
  });
});

test.describe('account — orders + sign-out (mocked API)', () => {
  test('orders: empty state', async ({ page }) => {
    await signedIn(page, []);
    await mockAddressApi(page, [], null);
    await page.goto('/account');
    await page.getByRole('button', { name: 'Orders' }).click();
    await expect(page.getByText('No orders yet')).toBeVisible();
  });

  test('orders: list shows number, shipment status and tracking link', async ({ page }) => {
    await signedIn(page, [
      {
        id: 'gid://shopify/Order/1002',
        number: 1002,
        processedAt: '2026-10-02T12:00:00Z',
        financialStatus: 'PAID',
        fulfillments: {
          nodes: [
            {
              status: 'SUCCESS',
              latestShipmentStatus: 'IN_TRANSIT',
              trackingInformation: [{ number: '9400TEST', url: 'https://tools.usps.com/x?n=9400TEST' }],
            },
          ],
        },
        totalPrice: { amount: '62.00', currencyCode: 'USD' },
        lineItems: {
          nodes: [
            { title: 'Meadow Spiral Tee', quantity: 1, image: null, price: null, variantTitle: 'M', productId: null },
          ],
        },
      },
    ]);
    await mockAddressApi(page, [], null);
    await page.goto('/account');
    await page.getByRole('button', { name: 'Orders' }).click();
    await expect(page.getByText('Order #1002')).toBeVisible();
    await expect(page.getByText(/IN TRANSIT/i)).toBeVisible();
    await page.getByText('Order #1002').click();
    await expect(page.getByRole('link', { name: /9400TEST/ })).toHaveAttribute('href', /usps/);
  });

  test('sign out goes to the logout endpoint', async ({ page }) => {
    await signedIn(page);
    await mockAddressApi(page, [], null);
    const logout = page.waitForRequest('**/api/auth/customer/logout');
    await page.route('**/api/auth/customer/logout', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<p>logged out</p>' }),
    );
    await page.goto('/account');
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await logout;
  });
});

test.describe('account — API routes require a session', () => {
  for (const [method, path] of [
    ['GET', '/api/customer/addresses'],
    ['POST', '/api/customer/addresses'],
    ['GET', '/api/customer/orders'],
  ] as const) {
    test(`${method} ${path} → 401 when signed out`, async ({ request }) => {
      const res =
        method === 'GET'
          ? await request.get(path)
          : await request.post(path, { data: { action: 'create', address: {} } });
      expect(res.status()).toBe(401);
    });
  }
});
