import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { AbandonedCartEmail } from '@/components/emails/abandoned-cart-email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      firstName,
      cartItems,
      cartTotal,
      cartUrl,
      emailNumber,
      discountCode,
      discountPercent,
    } = body;

    if (!email || !firstName || !cartItems || !cartTotal || !cartUrl || !emailNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (![1, 2, 3].includes(emailNumber)) {
      return NextResponse.json(
        { error: 'emailNumber must be 1, 2, or 3' },
        { status: 400 }
      );
    }

    const subjects = {
      1: 'Did you forget something?',
      2: 'Your cart is waiting for you',
      3: `${firstName}, here's 10% off to complete your order`,
    };

    const result = await sendEmail({
      to: email,
      subject: subjects[emailNumber as 1 | 2 | 3],
      react: AbandonedCartEmail({
        firstName,
        cartItems,
        cartTotal,
        cartUrl,
        emailNumber: emailNumber as 1 | 2 | 3,
        discountCode,
        discountPercent,
      }),
    });

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id });
    } else {
      throw result.error;
    }
  } catch (error) {
    console.error('Abandoned cart email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
