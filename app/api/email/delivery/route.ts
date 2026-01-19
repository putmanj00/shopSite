import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { DeliveryConfirmationEmail } from '@/components/emails/delivery-confirmation-email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, orderNumber, items } = body;

    if (!email || !firstName || !orderNumber || !items) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to: email,
      subject: `Your order #${orderNumber} has been delivered!`,
      react: DeliveryConfirmationEmail({
        firstName,
        orderNumber,
        items,
      }),
    });

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id });
    } else {
      throw result.error;
    }
  } catch (error) {
    console.error('Delivery confirmation email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
