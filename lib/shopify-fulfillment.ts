/**
 * Mapping for Shopify "fulfillments/create" webhooks → shipping-notification email.
 *
 * Register the topic in Shopify admin (Settings → Notifications → Webhooks) as
 * "Fulfillment creation", JSON. The payload is a Fulfillment object (NOT an
 * Order), so it carries tracking + destination + line items directly. HMAC is
 * verified by the shared `verifyShopifyWebhook` (lib/shopify-webhook.ts) before
 * any of this runs.
 *
 * We only emit an email when we have a recipient AND a usable tracking link,
 * because the email's whole job is "your package shipped, here's tracking".
 * Anything missing → return null so the route acks and Shopify stops retrying.
 */
import { formatMoney, fullName } from './shopify-webhook';

/** Subset of the Shopify Fulfillment webhook payload that we read. */
export interface ShopifyFulfillment {
  order_id?: number;
  name?: string; // e.g. "#1042.1" (order name + fulfillment index)
  email?: string;
  shipment_status?: string | null;
  tracking_company?: string | null;
  tracking_number?: string | null;
  tracking_numbers?: string[];
  tracking_url?: string | null;
  tracking_urls?: string[];
  estimated_delivery_at?: string | null;
  destination?: {
    name?: string;
    first_name?: string;
    last_name?: string;
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    province_code?: string;
    zip?: string;
    country?: string;
    country_code?: string;
  };
  line_items?: Array<{
    title?: string;
    quantity?: number;
    price?: string;
  }>;
}

export interface ShippingEmailData {
  email: string;
  firstName: string;
  orderNumber: string;
  trackingNumber: string;
  trackingUrl: string;
  carrier: string;
  estimatedDelivery?: string;
  items: Array<{ title: string; quantity: number; price: string }>;
  shippingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
  };
}

/** "#1042.1" → "1042"; falls back to order_id; "" if neither present. */
function deriveOrderNumber(f: ShopifyFulfillment): string {
  if (f.name) {
    return f.name.replace(/^#/, '').replace(/\.\d+$/, '');
  }
  return f.order_id != null ? String(f.order_id) : '';
}

/** Format a Shopify ISO timestamp for display; undefined if absent/invalid. */
function formatEstimatedDelivery(iso: string | null | undefined): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Map a fulfillment payload to shipping-notification email props, or null when
 * it lacks the data a shipping email needs (recipient, tracking number, or a
 * tracking URL). Shopify auto-populates `tracking_url` for recognised carriers.
 */
export function mapFulfillmentToShipping(
  f: ShopifyFulfillment,
): ShippingEmailData | null {
  const email = f.email;
  const trackingNumber = f.tracking_number || f.tracking_numbers?.[0] || '';
  const trackingUrl = f.tracking_url || f.tracking_urls?.[0] || '';

  if (!email || !trackingNumber || !trackingUrl) return null;

  const dest = f.destination ?? {};
  const recipientName =
    dest.name || fullName(dest.first_name, dest.last_name) || '';
  const firstName = dest.first_name || recipientName.split(' ')[0] || 'there';

  const items = (f.line_items ?? []).map((item) => ({
    title: item.title ?? 'Item',
    quantity: item.quantity ?? 1,
    price: formatMoney(item.price, 'USD'),
  }));

  return {
    email,
    firstName,
    orderNumber: deriveOrderNumber(f),
    trackingNumber,
    trackingUrl,
    carrier: f.tracking_company || 'the carrier',
    estimatedDelivery: formatEstimatedDelivery(f.estimated_delivery_at),
    items,
    shippingAddress: {
      name: recipientName,
      address1: dest.address1 ?? '',
      address2: dest.address2,
      city: dest.city ?? '',
      province: dest.province || dest.province_code || '',
      zip: dest.zip ?? '',
      country: dest.country || dest.country_code || '',
    },
  };
}
