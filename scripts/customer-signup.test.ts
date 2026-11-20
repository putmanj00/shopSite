/**
 * Upsert decision for newsletter / back-in-stock signups (lib/customer-signup.ts).
 *
 * Admin API is a scripted fake — no network, no customers created anywhere.
 * Self-contained tsx style of the other scripts/*.test.ts files.
 * Run: npm run test:signup
 */
import assert from 'node:assert/strict';
import {
  type AdminFetch,
  CONSENT_UPDATE,
  CUSTOMER_CREATE,
  CUSTOMER_LOOKUP,
  TAGS_ADD,
  backInStockTag,
  normalizeEmail,
  numericShopifyId,
  upsertSignupCustomer,
} from '../lib/customer-signup';

type Call = { query: string; variables?: Record<string, unknown> };

/** Fake fetcher: each response is consumed in order; records every call. */
function fakeAdmin(responses: unknown[]) {
  const calls: Call[] = [];
  const fetch: AdminFetch = async <T,>(args: Call) => {
    calls.push(args);
    if (responses.length === 0) throw new Error('unexpected extra Admin call');
    const next = responses.shift();
    if (next instanceof Error) throw next;
    return next as T;
  };
  return { fetch, calls };
}

const SUB = { marketingState: 'SUBSCRIBED', marketingOptInLevel: 'SINGLE_OPT_IN' };
const NONE = { customerByIdentifier: null };
const FOUND = { customerByIdentifier: { id: 'gid://shopify/Customer/7' } };
const OK_TAGS = { tagsAdd: { userErrors: [] } };
const OK_CONSENT = { customerEmailMarketingConsentUpdate: { userErrors: [] } };
const OK_CREATE = { customerCreate: { customer: { id: 'gid://shopify/Customer/9' }, userErrors: [] } };

let passed = 0;
async function test(name: string, fn: () => Promise<void> | void) {
  await fn();
  passed++;
  console.log(`  ok  ${name}`);
}

(async () => {
  await test('normalizeEmail', () => {
    assert.equal(normalizeEmail('  a@b.co '), 'a@b.co');
    assert.equal(normalizeEmail('nope'), null);
    assert.equal(normalizeEmail('a b@c.co'), null);
    assert.equal(normalizeEmail(42), null);
    assert.equal(normalizeEmail(`${'a'.repeat(250)}@b.co`), null);
  });

  await test('numericShopifyId', () => {
    assert.equal(numericShopifyId('gid://shopify/ProductVariant/123'), '123');
    assert.equal(numericShopifyId('456'), '456');
    assert.equal(numericShopifyId('gid://shopify/ProductVariant/1 OR x'), null);
    assert.equal(numericShopifyId('../../x'), null);
    assert.equal(numericShopifyId(undefined), null);
    assert.equal(backInStockTag('123'), 'back-in-stock:123');
  });

  await test('new newsletter customer → create with consent + tag, lookup by variable', async () => {
    const { fetch, calls } = fakeAdmin([NONE, OK_CREATE]);
    await upsertSignupCustomer(fetch, { email: 'a@b.co', tags: ['newsletter'], subscribe: true });
    assert.deepEqual(calls.map((c) => c.query), [CUSTOMER_LOOKUP, CUSTOMER_CREATE]);
    assert.deepEqual(calls[0].variables, { email: 'a@b.co' });
    assert.deepEqual(calls[1].variables, {
      input: { email: 'a@b.co', tags: ['newsletter'], emailMarketingConsent: SUB },
    });
  });

  await test('existing newsletter customer → tagsAdd + consent update, no create', async () => {
    const { fetch, calls } = fakeAdmin([FOUND, OK_TAGS, OK_CONSENT]);
    await upsertSignupCustomer(fetch, { email: 'a@b.co', tags: ['newsletter'], subscribe: true });
    assert.deepEqual(calls.map((c) => c.query), [CUSTOMER_LOOKUP, TAGS_ADD, CONSENT_UPDATE]);
    assert.deepEqual(calls[1].variables, { id: 'gid://shopify/Customer/7', tags: ['newsletter'] });
    assert.deepEqual(calls[2].variables, {
      input: { customerId: 'gid://shopify/Customer/7', emailMarketingConsent: SUB },
    });
  });

  await test('back-in-stock new customer → create WITHOUT consent', async () => {
    const { fetch, calls } = fakeAdmin([NONE, OK_CREATE]);
    await upsertSignupCustomer(fetch, { email: 'a@b.co', tags: ['back-in-stock:1'], subscribe: false });
    assert.deepEqual(calls[1].variables, { input: { email: 'a@b.co', tags: ['back-in-stock:1'] } });
  });

  await test('back-in-stock existing customer → tagsAdd only, consent untouched', async () => {
    const { fetch, calls } = fakeAdmin([FOUND, OK_TAGS]);
    await upsertSignupCustomer(fetch, { email: 'a@b.co', tags: ['back-in-stock:1'], subscribe: false });
    assert.deepEqual(calls.map((c) => c.query), [CUSTOMER_LOOKUP, TAGS_ADD]);
  });

  await test('create race (email taken) → re-lookup then update', async () => {
    const taken = { customerCreate: { customer: null, userErrors: [{ field: ['email'], message: 'Email has already been taken' }] } };
    const { fetch, calls } = fakeAdmin([NONE, taken, FOUND, OK_TAGS, OK_CONSENT]);
    await upsertSignupCustomer(fetch, { email: 'a@b.co', tags: ['newsletter'], subscribe: true });
    assert.deepEqual(calls.map((c) => c.query), [CUSTOMER_LOOKUP, CUSTOMER_CREATE, CUSTOMER_LOOKUP, TAGS_ADD, CONSENT_UPDATE]);
  });

  await test('create userError with no customer on re-lookup → throws', async () => {
    const bad = { customerCreate: { customer: null, userErrors: [{ field: ['email'], message: 'Email is invalid' }] } };
    const { fetch } = fakeAdmin([NONE, bad, NONE]);
    await assert.rejects(
      upsertSignupCustomer(fetch, { email: 'a@b.co', tags: ['newsletter'], subscribe: true }),
      /customerCreate failed: Email is invalid/
    );
  });

  await test('tagsAdd / consent userErrors → throws', async () => {
    const badTags = { tagsAdd: { userErrors: [{ message: 'nope' }] } };
    await assert.rejects(
      upsertSignupCustomer(fakeAdmin([FOUND, badTags]).fetch, { email: 'a@b.co', tags: ['t'], subscribe: true }),
      /tagsAdd failed/
    );
    const badConsent = { customerEmailMarketingConsentUpdate: { userErrors: [{ message: 'no' }] } };
    await assert.rejects(
      upsertSignupCustomer(fakeAdmin([FOUND, OK_TAGS, badConsent]).fetch, { email: 'a@b.co', tags: ['t'], subscribe: true }),
      /customerEmailMarketingConsentUpdate failed/
    );
  });

  await test('Admin transport error propagates (route turns it into 502)', async () => {
    await assert.rejects(
      upsertSignupCustomer(fakeAdmin([new Error('Admin API request failed: HTTP 403')]).fetch, {
        email: 'a@b.co', tags: ['t'], subscribe: true,
      }),
      /HTTP 403/
    );
  });

  console.log(`customer-signup: ${passed} passed`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
