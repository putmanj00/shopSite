import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { WinbackEmail } from '@/components/emails/winback-email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      firstName,
      daysSinceLastPurchase,
      lastPurchaseTitle,
      discountCode,
      discountPercent,
      featuredProducts,
    } = body;

    if (!email || !firstName || !daysSinceLastPurchase || !discountCode || !discountPercent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to: email,
      subject: `We miss you, ${firstName}! Here's ${discountPercent}% off`,
      react: WinbackEmail({
        firstName,
        daysSinceLastPurchase,
        lastPurchaseTitle,
        discountCode,
        discountPercent,
        featuredProducts: featuredProducts || [],
      }),
    });

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id });
    } else {
      throw result.error;
    }
  } catch (error) {
    console.error('Winback email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
