import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { OrderConfirmationEmail } from '@/components/emails/order-confirmation-email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      orderNumber,
      customerName,
      items,
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress,
      orderStatusUrl,
    } = body;

    if (!email || !orderNumber || !customerName || !items || !total || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to: email,
      subject: `Order Confirmed #${orderNumber}`,
      react: OrderConfirmationEmail({
        orderNumber,
        customerName,
        items,
        subtotal: subtotal || '$0.00',
        shipping: shipping || 'Free',
        tax: tax || '$0.00',
        total,
        shippingAddress,
        orderStatusUrl,
      }),
    });

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id });
    } else {
      throw result.error;
    }
  } catch (error) {
    console.error('Order confirmation email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
