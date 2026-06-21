import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { ShippingNotificationEmail } from '@/components/emails/shipping-notification-email';
import { verifyShopifyWebhook, isWebhookConfigured } from '@/lib/shopify-webhook';
import {
  mapFulfillmentToShipping,
  type ShopifyFulfillment,
} from '@/lib/shopify-fulfillment';
import { alreadyProcessed, markProcessed } from '@/lib/webhook-dedup';

// HMAC verification and raw-body reading require the Node.js runtime.
export const runtime = 'nodejs';

/**
 * Shopify "fulfillments/create" webhook → shipping-notification email.
 *
 * Register this URL in Shopify admin (Settings → Notifications → Webhooks) for
 * the "Fulfillment creation" event with JSON format. Same security posture as
 * orders/create: verify the signature before any work, fail closed when the
 * secret is unset, 401 on bad signature, 500 on a transient send failure so
 * Shopify retries. Deduplicated on X-Shopify-Webhook-Id so a retry after a
 * successful send does not re-email the buyer.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const hmacHeader = request.headers.get('x-shopify-hmac-sha256');
  const webhookId = request.headers.get('x-shopify-webhook-id');

  if (!isWebhookConfigured()) {
    console.error(
      '[webhook fulfillments/create] SHOPIFY_WEBHOOK_SECRET not set — rejecting.',
    );
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
    console.warn('[webhook fulfillments/create] Invalid HMAC signature — rejecting.');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  if (alreadyProcessed(webhookId)) {
    // Already emailed for this delivery — ack the retry without re-sending.
    return NextResponse.json({ received: true, skipped: 'duplicate' });
  }

  let fulfillment: ShopifyFulfillment;
  try {
    fulfillment = JSON.parse(rawBody) as ShopifyFulfillment;
  } catch {
    console.error('[webhook fulfillments/create] Body failed to parse as JSON.');
    return NextResponse.json({ received: true, skipped: 'invalid-json' });
  }

  const data = mapFulfillmentToShipping(fulfillment);
  if (!data) {
    // Authentic fulfillment but missing recipient or tracking — a retry won't
    // add those fields, so ack to stop retries.
    console.warn(
      '[webhook fulfillments/create] Missing email or tracking — skipping send.',
    );
    return NextResponse.json({ received: true, skipped: 'no-tracking-or-recipient' });
  }

  try {
    const result = await sendEmail({
      to: data.email,
      subject: `Your order #${data.orderNumber} has shipped`,
      react: ShippingNotificationEmail({
        firstName: data.firstName,
        orderNumber: data.orderNumber,
        trackingNumber: data.trackingNumber,
        trackingUrl: data.trackingUrl,
        carrier: data.carrier,
        estimatedDelivery: data.estimatedDelivery,
        items: data.items,
        shippingAddress: data.shippingAddress,
      }),
    });

    if (!result.success) {
      throw result.error ?? new Error('sendEmail returned failure');
    }

    markProcessed(webhookId);
    return NextResponse.json({ received: true, emailId: result.id });
  } catch (error) {
    // Transient send failure — return 500 so Shopify retries delivery.
    console.error('[webhook fulfillments/create] Failed to send notification:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
