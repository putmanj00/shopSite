import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { ShippingNotificationEmail } from '@/components/emails/shipping-notification-email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      firstName,
      orderNumber,
      trackingNumber,
      trackingUrl,
      carrier,
      estimatedDelivery,
      items,
      shippingAddress,
    } = body;

    if (!email || !firstName || !orderNumber || !trackingNumber || !trackingUrl || !carrier || !items || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to: email,
      subject: `Your order #${orderNumber} has shipped!`,
      react: ShippingNotificationEmail({
        firstName,
        orderNumber,
        trackingNumber,
        trackingUrl,
        carrier,
        estimatedDelivery,
        items,
        shippingAddress,
      }),
    });

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id });
    } else {
      throw result.error;
    }
  } catch (error) {
    console.error('Shipping notification email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
