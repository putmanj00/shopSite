import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { OrderConfirmationEmail } from '@/components/emails/order-confirmation-email';
import {
  verifyShopifyWebhook,
  isWebhookConfigured,
  mapOrderToEmail,
  type ShopifyOrder,
} from '@/lib/shopify-webhook';
import { alreadyProcessed, markProcessed } from '@/lib/webhook-dedup';

// HMAC verification and raw-body reading require the Node.js runtime.
export const runtime = 'nodejs';

/**
 * Shopify "orders/create" webhook.
 *
 * Register this URL in Shopify admin (Settings → Notifications → Webhooks) for
 * the "Order creation" event with JSON format. Shopify signs each delivery; we
 * verify the signature before doing any work and reply 200 once the
 * confirmation email is sent. Non-2xx replies are retried by Shopify, so we
 * return 500 on a genuine processing failure and 401 on a bad signature
 * (which Shopify should never retry into success).
 */
export async function POST(request: NextRequest) {
  // Read the RAW body — HMAC is computed over the exact bytes Shopify sent.
  const rawBody = await request.text();
  const hmacHeader = request.headers.get('x-shopify-hmac-sha256');
  const webhookId = request.headers.get('x-shopify-webhook-id');

  if (!isWebhookConfigured()) {
    // Fail closed: never process an unverifiable webhook.
    console.error(
      '[webhook orders/create] SHOPIFY_WEBHOOK_SECRET not set — rejecting.',
    );
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
    console.warn('[webhook orders/create] Invalid HMAC signature — rejecting.');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  if (alreadyProcessed(webhookId)) {
    // Already emailed for this delivery — ack the retry without re-sending.
    return NextResponse.json({ received: true, skipped: 'duplicate' });
  }

  let order: ShopifyOrder;
  try {
    order = JSON.parse(rawBody) as ShopifyOrder;
  } catch {
    // Malformed JSON from an authenticated source — ack so Shopify stops
    // retrying a body that will never parse.
    console.error('[webhook orders/create] Body failed to parse as JSON.');
    return NextResponse.json({ received: true, skipped: 'invalid-json' });
  }

  const data = mapOrderToEmail(order);
  if (!data) {
    // Authentic order but missing email/number (e.g. POS draft). Ack — a
    // retry will not add the missing fields.
    console.warn(
      '[webhook orders/create] Order missing email or number — skipping send.',
    );
    return NextResponse.json({ received: true, skipped: 'incomplete-order' });
  }

  try {
    const result = await sendEmail({
      to: data.email,
      subject: `Order Confirmed #${data.orderNumber}`,
      react: OrderConfirmationEmail({
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        items: data.items,
        subtotal: data.subtotal,
        shipping: data.shipping,
        tax: data.tax,
        total: data.total,
        shippingAddress: data.shippingAddress,
        orderStatusUrl: data.orderStatusUrl,
      }),
    });

    if (!result.success) {
      throw result.error ?? new Error('sendEmail returned failure');
    }

    markProcessed(webhookId);
    return NextResponse.json({ received: true, emailId: result.id });
  } catch (error) {
    // Transient send failure — return 500 so Shopify retries delivery.
    console.error('[webhook orders/create] Failed to send confirmation:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
