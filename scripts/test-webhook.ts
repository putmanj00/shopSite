/**
 * Unit tests for the Shopify webhook helpers (orders/create, fulfillments/create,
 * and the shared idempotency store).
 * Run: npm run test:webhook
 *
 * No test framework in this repo — mirrors the existing tsx script idiom
 * (validate-routes.ts, ui-tests.ts). Exits non-zero on any failure.
 */
import crypto from 'crypto';
import {
  verifyShopifyWebhook,
  isWebhookConfigured,
  mapOrderToEmail,
  type ShopifyOrder,
} from '../lib/shopify-webhook';
import {
  mapFulfillmentToShipping,
  type ShopifyFulfillment,
} from '../lib/shopify-fulfillment';
import { alreadyProcessed, markProcessed, _resetDedup } from '../lib/webhook-dedup';

const SECRET = 'test_webhook_secret_123';

let passed = 0;
let failed = 0;

function check(name: string, cond: boolean) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}`);
  }
}

function sign(body: string, secret = SECRET): string {
  return crypto.createHmac('sha256', secret).update(body, 'utf8').digest('base64');
}

const sampleOrder: ShopifyOrder = {
  email: 'buyer@example.com',
  name: '#1042',
  currency: 'USD',
  subtotal_price: '120.00',
  total_tax: '9.60',
  total_price: '129.60',
  total_shipping_price_set: { shop_money: { amount: '0.00', currency_code: 'USD' } },
  order_status_url: 'https://wildenflower.com/orders/abc/status',
  customer: { first_name: 'Ada', last_name: 'Lovelace' },
  shipping_address: {
    name: 'Ada Lovelace',
    address1: '12 Meadow Ln',
    city: 'Covington',
    province: 'Kentucky',
    zip: '41011',
    country: 'United States',
  },
  line_items: [
    { title: 'Mokume-gane Ring', quantity: 1, price: '120.00', variant_title: 'Size 7' },
  ],
};

const rawBody = JSON.stringify(sampleOrder);

console.log('HMAC verification:');
process.env.SHOPIFY_WEBHOOK_SECRET = SECRET;
check('valid signature passes', verifyShopifyWebhook(rawBody, sign(rawBody)));
check('tampered body fails', !verifyShopifyWebhook(rawBody + ' ', sign(rawBody)));
check('wrong secret fails', !verifyShopifyWebhook(rawBody, sign(rawBody, 'nope')));
check('missing header fails', !verifyShopifyWebhook(rawBody, null));
check('garbage signature fails', !verifyShopifyWebhook(rawBody, 'not-base64-hmac'));
check('isWebhookConfigured true when set', isWebhookConfigured());

console.log('Fail-closed when secret unset:');
delete process.env.SHOPIFY_WEBHOOK_SECRET;
check('verify false with no secret', !verifyShopifyWebhook(rawBody, sign(rawBody)));
check('isWebhookConfigured false', !isWebhookConfigured());
process.env.SHOPIFY_WEBHOOK_SECRET = SECRET;

console.log('Order → email mapping:');
const data = mapOrderToEmail(sampleOrder);
check('maps to non-null', data !== null);
if (data) {
  check('email recipient', data.email === 'buyer@example.com');
  check('order number strips #', data.orderNumber === '1042');
  check('customer name from customer', data.customerName === 'Ada Lovelace');
  check('item count', data.items.length === 1);
  check('item price formatted', data.items[0].price === '$120.00');
  check('variant carried', data.items[0].variantTitle === 'Size 7');
  check('subtotal formatted', data.subtotal === '$120.00');
  check('zero shipping → Free', data.shipping === 'Free');
  check('tax formatted', data.tax === '$9.60');
  check('total formatted', data.total === '$129.60');
  check('shipping address city', data.shippingAddress.city === 'Covington');
  check('order status url carried', data.orderStatusUrl === sampleOrder.order_status_url);
}

console.log('Mapping edge cases:');
check(
  'no email → null',
  mapOrderToEmail({ ...sampleOrder, email: undefined, contact_email: undefined }) === null,
);
check(
  'contact_email fallback',
  mapOrderToEmail({ ...sampleOrder, email: undefined, contact_email: 'c@e.com' })?.email ===
    'c@e.com',
);
check(
  'order_number fallback when no name',
  mapOrderToEmail({ ...sampleOrder, name: undefined, order_number: 1042 })?.orderNumber ===
    '1042',
);
const paidShip = mapOrderToEmail({
  ...sampleOrder,
  total_shipping_price_set: { shop_money: { amount: '7.50', currency_code: 'USD' } },
});
check('non-zero shipping formatted', paidShip?.shipping === '$7.50');

const sampleFulfillment: ShopifyFulfillment = {
  order_id: 9001,
  name: '#1042.1',
  email: 'buyer@example.com',
  tracking_company: 'USPS',
  tracking_number: '9400100000000000000000',
  tracking_url: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=9400100000000000000000',
  estimated_delivery_at: '2026-06-25T17:00:00Z',
  destination: {
    name: 'Ada Lovelace',
    first_name: 'Ada',
    last_name: 'Lovelace',
    address1: '12 Meadow Ln',
    city: 'Covington',
    province: 'Kentucky',
    zip: '41011',
    country: 'United States',
  },
  line_items: [{ title: 'Mokume-gane Ring', quantity: 1, price: '120.00' }],
};

console.log('Fulfillment → shipping email mapping:');
const ship = mapFulfillmentToShipping(sampleFulfillment);
check('maps to non-null', ship !== null);
if (ship) {
  check('recipient email', ship.email === 'buyer@example.com');
  check('order number strips # and .N', ship.orderNumber === '1042');
  check('first name from destination', ship.firstName === 'Ada');
  check('tracking number carried', ship.trackingNumber === sampleFulfillment.tracking_number);
  check('tracking url carried', ship.trackingUrl === sampleFulfillment.tracking_url);
  check('carrier carried', ship.carrier === 'USPS');
  check('estimated delivery formatted', typeof ship.estimatedDelivery === 'string');
  check('item count', ship.items.length === 1);
  check('item price formatted', ship.items[0].price === '$120.00');
  check('shipping address city', ship.shippingAddress.city === 'Covington');
}

console.log('Fulfillment mapping edge cases:');
check(
  'no email → null',
  mapFulfillmentToShipping({ ...sampleFulfillment, email: undefined }) === null,
);
check(
  'no tracking number → null',
  mapFulfillmentToShipping({
    ...sampleFulfillment,
    tracking_number: undefined,
    tracking_numbers: undefined,
  }) === null,
);
check(
  'no tracking url → null',
  mapFulfillmentToShipping({
    ...sampleFulfillment,
    tracking_url: undefined,
    tracking_urls: undefined,
  }) === null,
);
check(
  'tracking_numbers[0] fallback',
  mapFulfillmentToShipping({
    ...sampleFulfillment,
    tracking_number: undefined,
    tracking_numbers: ['TN-FALLBACK'],
  })?.trackingNumber === 'TN-FALLBACK',
);
check(
  'order_id fallback when no name',
  mapFulfillmentToShipping({ ...sampleFulfillment, name: undefined })?.orderNumber === '9001',
);

console.log('Dedup (idempotency store):');
_resetDedup();
check('unseen id → not processed', !alreadyProcessed('wh-1'));
markProcessed('wh-1');
check('marked id → processed', alreadyProcessed('wh-1'));
check('different id → not processed', !alreadyProcessed('wh-2'));
check('null id never deduped (mark)', (markProcessed(null), !alreadyProcessed(null)));
check('null id never deduped (check)', !alreadyProcessed(null));
_resetDedup();
check('reset clears store', !alreadyProcessed('wh-1'));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
