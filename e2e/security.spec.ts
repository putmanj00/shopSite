import { test, expect } from './support/test';

// Security regression guards (launch-readiness review 2026-11-15).
// Request-level: no browser page needed, no dependency on the Shopify catalog.
//
// These surfaces were deleted because each was reachable by anonymous visitors:
//   - /admin/*            session cookie was a fixed, forgeable string
//   - /api/test-*         leaked shop/owner/config details
//   - /api/email/*        unauthenticated send-as-the-shop mail relay
// If any of them comes back, these tests fail.

const REMOVED_GET_PATHS = [
  '/admin',
  '/admin/login',
  '/admin/customers',
  '/admin/inventory',
  '/admin/sales',
  '/admin/settings',
  '/api/test-admin',
  '/api/test-customer-auth',
  '/api/test-shopify',
];

const REMOVED_EMAIL_ROUTES = [
  'abandoned-cart',
  'birthday',
  'delivery',
  'loyalty-upgrade',
  'new-collection',
  'order-confirmation',
  'post-purchase',
  'shipping',
  'welcome',
  'winback',
];

test.describe('Removed internal surfaces stay removed', { tag: '@full' }, () => {
  for (const path of REMOVED_GET_PATHS) {
    test(`GET ${path} is not served`, async ({ request }) => {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status()).toBe(404);
    });
  }

  test('the old forgeable admin cookie grants nothing', async ({ request }) => {
    const res = await request.get('/admin/customers', {
      maxRedirects: 0,
      headers: { Cookie: 'shop_admin_session=authenticated_admin_user' },
    });
    expect(res.status()).toBe(404);
  });

  test('POST /api/admin/login is not served', async ({ request }) => {
    const res = await request.post('/api/admin/login', {
      data: { password: 'admin123' },
    });
    expect(res.status()).toBe(404);
  });

  for (const name of REMOVED_EMAIL_ROUTES) {
    test(`POST /api/email/${name} cannot send mail`, async ({ request }) => {
      const res = await request.post(`/api/email/${name}`, {
        data: { email: 'nobody@example.com', firstName: 'Test' },
      });
      expect(res.status()).toBe(404);
    });
  }
});

test.describe('Customer login redirect target', { tag: '@full' }, () => {
  // The exhaustive accept/reject matrix lives in scripts/safe-return-to.test.ts.
  // This asserts the route is actually wired to it: whatever the authorize
  // endpoint does (redirect to Shopify, or to /login on missing config), an
  // off-site returnTo must never be stored or echoed as a destination.
  for (const hostile of ['https://evil.example/x', '//evil.example/x']) {
    test(`authorize never stores off-site returnTo (${hostile})`, async ({ request }) => {
      const res = await request.get(
        `/api/auth/customer/authorize?returnTo=${encodeURIComponent(hostile)}`,
        { maxRedirects: 0 }
      );
      const setCookies = res
        .headersArray()
        .filter((h) => h.name.toLowerCase() === 'set-cookie')
        .map((h) => decodeURIComponent(h.value));
      for (const cookie of setCookies) {
        expect(cookie).not.toContain('evil.example');
      }
      const returnCookie = setCookies.find((c) => c.startsWith('ca_return_to='));
      if (returnCookie) {
        expect(returnCookie).toMatch(/^ca_return_to=\/account(;|$)/);
      }
    });
  }
});

test.describe('Security headers', { tag: '@full' }, () => {
  test('baseline headers are present on the homepage', async ({ request }) => {
    const res = await request.get('/');
    const headers = res.headers();
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['strict-transport-security']).toContain('max-age=');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toContain('camera=()');
  });
});
