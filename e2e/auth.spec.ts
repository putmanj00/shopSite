import { test, expect } from './support/test';

// Phase 3C — customer-account auth journeys.
//
// Tier 1: the OAuth/PKCE handshake at request level. We assert the redirect
//         to Shopify, never follow it.
// Tier 2: account UI against mocked /api/auth/customer/me + customer data.
// Tier 3: a real one-time-code login stays manual per release.
//
// CI note: the e2e job sets a placeholder SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID so
// the authorize route can build its URL; nothing here exchanges a real code.

const HOSTILE_TEXT = 'Call 555-0100 to verify your account';

test.describe('auth — PKCE handshake (Tier 1)', () => {
  test('authorize redirects to Shopify with state + S256 challenge and sets PKCE cookies', async ({
    request,
  }) => {
    const res = await request.get('/api/auth/customer/authorize?returnTo=/account', {
      maxRedirects: 0,
    });
    expect(res.status()).toBeGreaterThanOrEqual(300);
    expect(res.status()).toBeLessThan(400);

    const location = new URL(res.headers()['location']);
    expect(location.pathname).not.toBe('/login'); // fell into the error path otherwise
    const params = location.searchParams;
    expect(params.get('response_type')).toBe('code');
    expect(params.get('code_challenge_method')).toBe('S256');
    expect(params.get('code_challenge')).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(params.get('state')).toMatch(/^[A-Za-z0-9_-]{16,}$/);
    expect(params.get('nonce')).toBeTruthy();
    expect(params.get('redirect_uri')).toMatch(/\/api\/auth\/customer\/callback$/);

    const cookieNames = res
      .headersArray()
      .filter((h) => h.name.toLowerCase() === 'set-cookie')
      .map((h) => h.value.split('=')[0]);
    expect(cookieNames).toEqual(
      expect.arrayContaining(['ca_state', 'ca_code_verifier', 'ca_return_to']),
    );
  });

  const callbackCases: ReadonlyArray<[string, string, string]> = [
    ['missing code + state', '', 'missing_params'],
    ['wrong state', '?code=fake-code&state=not-the-stored-state', 'invalid_state'],
    [
      'provider error with hostile description',
      `?error=access_denied&error_description=${encodeURIComponent(HOSTILE_TEXT)}`,
      'login_cancelled',
    ],
  ];

  for (const [label, query, code] of callbackCases) {
    test(`callback: ${label} → /login?error=${code}, no session cookie`, async ({ request }) => {
      const res = await request.get(`/api/auth/customer/callback${query}`, { maxRedirects: 0 });
      expect(res.status()).toBeGreaterThanOrEqual(300);
      expect(res.status()).toBeLessThan(400);

      const location = new URL(res.headers()['location']);
      expect(location.pathname).toBe('/login');
      expect(location.searchParams.get('error')).toBe(code);
      expect(location.search).not.toContain('555');

      const setCookies = res
        .headersArray()
        .filter((h) => h.name.toLowerCase() === 'set-cookie')
        .map((h) => h.value);
      expect(setCookies.some((c) => c.startsWith('ca_access_token='))).toBe(false);
    });
  }
});

test.describe('auth — login error copy', () => {
  test('known code shows its fixed message and does not auto-redirect', async ({ page }) => {
    await page.goto('/login?error=invalid_state');
    // Next's route announcer is also role=alert in prod builds — filter to ours.
    await expect(page.getByRole('alert').filter({ hasText: /sign-in session expired/i })).toBeVisible();
    await expect(page).toHaveURL(/\/login\?error=invalid_state/);
  });

  test('arbitrary error text is never rendered', async ({ page }) => {
    await page.goto(`/login?error=${encodeURIComponent(HOSTILE_TEXT)}`);
    await expect(page.getByRole('alert').filter({ hasText: /couldn.t sign you in/i })).toBeVisible();
    await expect(page.getByText(HOSTILE_TEXT)).toHaveCount(0);
  });
});

test.describe('auth — account page (Tier 2, mocked)', () => {
  test('logged out: /account sends the visitor to sign-in with returnTo=/account', async ({
    page,
  }) => {
    await page.route('**/api/auth/customer/me', (route) =>
      route.fulfill({ json: { authenticated: false, customer: null } }),
    );
    // Stop at our authorize endpoint instead of leaving for Shopify.
    const authorize = page.waitForRequest('**/api/auth/customer/authorize**');
    await page.route('**/api/auth/customer/authorize**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/html', body: '<p>authorize stub</p>' }),
    );

    await page.goto('/account');
    const req = await authorize;
    expect(new URL(req.url()).searchParams.get('returnTo')).toBe('/account');
  });

  test('logged in: profile, orders and addresses render from the API', async ({ page }) => {
    await page.route('**/api/auth/customer/me', (route) =>
      route.fulfill({
        json: {
          authenticated: true,
          customer: {
            id: 'gid://shopify/Customer/1',
            email: 'fern@example.com',
            firstName: 'Fern',
            lastName: 'Gully',
            displayName: 'Fern Gully',
          },
        },
      }),
    );
    await page.route('**/api/customer/orders**', (route) =>
      route.fulfill({
        json: {
          orders: [
            {
              id: 'gid://shopify/Order/1001',
              number: 1001,
              processedAt: '2026-10-01T12:00:00Z',
              financialStatus: 'PAID',
              fulfillments: { nodes: [] },
              totalPrice: { amount: '48.00', currencyCode: 'USD' },
              lineItems: {
                nodes: [
                  {
                    title: 'Meadow Spiral Tee',
                    quantity: 1,
                    image: null,
                    price: { amount: '48.00', currencyCode: 'USD' },
                    variantTitle: 'M',
                    productId: null,
                  },
                ],
              },
            },
          ],
        },
      }),
    );
    await page.route('**/api/customer/addresses', (route) =>
      route.fulfill({
        json: {
          defaultAddressId: 'gid://shopify/CustomerAddress/1',
          addresses: [
            {
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
            },
          ],
        },
      }),
    );

    await page.goto('/account');
    await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible();
    await expect(page.getByText('Welcome back, Fern!')).toBeVisible();

    await page.getByRole('button', { name: 'Orders' }).click();
    await expect(page.getByText('Order #1001')).toBeVisible();

    await page.getByRole('button', { name: 'Addresses' }).click();
    await expect(page.getByText('12 Hollow Rd')).toBeVisible();
    await expect(page.getByText(/Covington, KY 41011/)).toBeVisible();
  });
});
