import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { BirthdayEmail } from '@/components/emails/birthday-email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      firstName,
      discountCode,
      discountPercent,
      expiryDays,
    } = body;

    if (!email || !firstName || !discountCode || !discountPercent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to: email,
      subject: `Happy Birthday, ${firstName}! 🎂 A special gift for you`,
      react: BirthdayEmail({
        firstName,
        discountCode,
        discountPercent,
        expiryDays,
      }),
    });

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id });
    } else {
      throw result.error;
    }
  } catch (error) {
    console.error('Birthday email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
