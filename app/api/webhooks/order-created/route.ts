import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';
import { OrderConfirmationEmail } from '@/components/emails/order-confirmation-email';

// Must be dynamic — never static
export const dynamic = 'force-dynamic';

interface ShopifyLineItem {
  title: string;
  quantity: number;
  price: string;
  variant_title?: string;
}

interface ShopifyOrderPayload {
  email?: string;
  contact_email?: string;
  order_number: number;
  subtotal_price?: string;
  total_tax?: string;
  total_price?: string;
  order_status_url?: string;
  customer?: { first_name?: string; last_name?: string };
  shipping_address?: {
    first_name?: string;
    last_name?: string;
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    zip?: string;
    country?: string;
  };
  line_items?: ShopifyLineItem[];
  shipping_lines?: Array<{ price?: string }>;
}

function verifyShopifyHmac(rawBody: string, hmacHeader: string, secret: string): boolean {
  try {
    const digest = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('base64');
    return crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(hmacHeader)
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  // 1. Read raw body FIRST — must happen before any JSON parsing
  const rawBody = await request.text();

  // 2. Verify HMAC
  const hmacHeader = request.headers.get('x-shopify-hmac-sha256');
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  if (!hmacHeader || !secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!verifyShopifyHmac(rawBody, hmacHeader, secret)) {
    console.error('[order-created webhook] HMAC verification failed');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. Parse payload — safe after signature verified
  let order: ShopifyOrderPayload;
  try {
    order = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // 4. Extract fields
  const customerEmail = order.email || order.contact_email;
  if (!customerEmail) {
    // No email address — log and return 200 (Shopify should not retry for bad data)
    console.error('[order-created webhook] No customer email in payload');
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const customerName = [order.customer?.first_name, order.customer?.last_name]
    .filter(Boolean).join(' ') || 'Valued Customer';
  const orderNumber = String(order.order_number);

  const items = (order.line_items ?? []).map((item) => ({
    title: item.title,
    quantity: item.quantity,
    price: `$${parseFloat(item.price).toFixed(2)}`,
    variantTitle: item.variant_title ?? undefined,
    // imageUrl omitted — REST webhook payload does not include product image URLs
  }));

  const shippingAddress = {
    name: [order.shipping_address?.first_name, order.shipping_address?.last_name]
      .filter(Boolean).join(' '),
    address1: order.shipping_address?.address1 ?? '',
    address2: order.shipping_address?.address2 ?? undefined,
    city: order.shipping_address?.city ?? '',
    province: order.shipping_address?.province ?? '',
    zip: order.shipping_address?.zip ?? '',
    country: order.shipping_address?.country ?? '',
  };

  // 5. Send Resend email
  const result = await sendEmail({
    to: customerEmail,
    subject: `Order Confirmed #${orderNumber}`,
    react: OrderConfirmationEmail({
      orderNumber,
      customerName,
      items,
      subtotal: `$${parseFloat(order.subtotal_price ?? '0').toFixed(2)}`,
      shipping: order.shipping_lines?.[0]?.price
        ? `$${parseFloat(order.shipping_lines[0].price).toFixed(2)}`
        : 'Free',
      tax: `$${parseFloat(order.total_tax ?? '0').toFixed(2)}`,
      total: `$${parseFloat(order.total_price ?? '0').toFixed(2)}`,
      shippingAddress,
      orderStatusUrl: order.order_status_url ?? undefined,
    }),
  });

  if (!result.success) {
    // Log error but return 200 — returning 5xx would cause Shopify to retry, sending duplicate emails
    console.error('[order-created webhook] Email send failed:', result.error);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
