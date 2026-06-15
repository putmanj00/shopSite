import crypto from 'crypto';

/**
 * Shopify webhook helpers — HMAC verification + payload mapping.
 *
 * Webhooks are registered against the Shopify "orders/create" topic and POST a
 * raw JSON order body signed with the shared webhook secret. The signature
 * (base64 HMAC-SHA256 of the *raw* request bytes) arrives in the
 * `X-Shopify-Hmac-Sha256` header. We MUST verify against the raw body, not a
 * re-serialized parse, or the digest will not match.
 */

/**
 * Verify a Shopify webhook signature.
 *
 * Fails closed: returns false when the secret is unset or the header is
 * missing, so an unsigned request is never treated as authentic.
 */
export function verifyShopifyWebhook(
  rawBody: string,
  hmacHeader: string | null | undefined,
): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret || !hmacHeader) {
    return false;
  }

  const digest = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');

  const a = Buffer.from(digest);
  const b = Buffer.from(hmacHeader);

  // timingSafeEqual throws on length mismatch — guard first.
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

/** True when the webhook secret is configured. */
export function isWebhookConfigured(): boolean {
  return !!process.env.SHOPIFY_WEBHOOK_SECRET;
}

// --- Shopify orders/create payload (subset we read) -------------------------

interface ShopifyMoney {
  amount?: string;
  currency_code?: string;
}

interface ShopifyMoneySet {
  shop_money?: ShopifyMoney;
}

interface ShopifyLineItem {
  title?: string;
  quantity?: number;
  price?: string;
  variant_title?: string | null;
}

interface ShopifyAddress {
  name?: string;
  first_name?: string;
  last_name?: string;
  address1?: string;
  address2?: string | null;
  city?: string;
  province?: string;
  province_code?: string;
  zip?: string;
  country?: string;
  country_code?: string;
}

export interface ShopifyOrder {
  email?: string;
  contact_email?: string;
  name?: string;
  order_number?: number;
  currency?: string;
  subtotal_price?: string;
  total_tax?: string;
  total_price?: string;
  total_shipping_price_set?: ShopifyMoneySet;
  order_status_url?: string;
  customer?: { first_name?: string; last_name?: string };
  shipping_address?: ShopifyAddress;
  billing_address?: ShopifyAddress;
  line_items?: ShopifyLineItem[];
}

export interface OrderEmailData {
  email: string;
  orderNumber: string;
  customerName: string;
  items: Array<{
    title: string;
    quantity: number;
    price: string;
    variantTitle?: string;
  }>;
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  shippingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
  };
  orderStatusUrl?: string;
}

/** Format a Shopify money string ("29.99") for display ("$29.99"). */
function formatMoney(amount: string | undefined, currency: string): string {
  const value = Number(amount);
  if (!amount || Number.isNaN(value)) {
    return '$0.00';
  }
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(value);
  } catch {
    // Unknown currency code — fall back to a plain dollar format.
    return `$${value.toFixed(2)}`;
  }
}

function fullName(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' ').trim();
}

/**
 * Map a Shopify orders/create payload to the props the order-confirmation
 * email expects. Returns null when the order lacks the minimum fields needed
 * to send a useful confirmation (recipient email + an order identifier).
 */
export function mapOrderToEmail(order: ShopifyOrder): OrderEmailData | null {
  const email = order.email || order.contact_email;
  const orderNumber =
    (order.name && order.name.replace(/^#/, '')) ||
    (order.order_number != null ? String(order.order_number) : '');

  if (!email || !orderNumber) {
    return null;
  }

  const currency = order.currency || 'USD';
  const addr = order.shipping_address || order.billing_address || {};

  const customerName =
    fullName(order.customer?.first_name, order.customer?.last_name) ||
    fullName(addr.first_name, addr.last_name) ||
    addr.name ||
    'there';

  const items = (order.line_items || []).map((li) => ({
    title: li.title || 'Item',
    quantity: li.quantity ?? 1,
    price: formatMoney(li.price, currency),
    ...(li.variant_title ? { variantTitle: li.variant_title } : {}),
  }));

  const shippingAmount = order.total_shipping_price_set?.shop_money?.amount;
  const shipping =
    !shippingAmount || Number(shippingAmount) === 0
      ? 'Free'
      : formatMoney(shippingAmount, currency);

  return {
    email,
    orderNumber,
    customerName,
    items,
    subtotal: formatMoney(order.subtotal_price, currency),
    shipping,
    tax: formatMoney(order.total_tax, currency),
    total: formatMoney(order.total_price, currency),
    shippingAddress: {
      name: addr.name || customerName,
      address1: addr.address1 || '',
      ...(addr.address2 ? { address2: addr.address2 } : {}),
      city: addr.city || '',
      province: addr.province || addr.province_code || '',
      zip: addr.zip || '',
      country: addr.country || addr.country_code || '',
    },
    ...(order.order_status_url ? { orderStatusUrl: order.order_status_url } : {}),
  };
}
