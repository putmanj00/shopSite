import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { PostPurchaseEmail } from '@/components/emails/post-purchase-email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      firstName,
      purchasedProductTitle,
      purchasedProductType,
      careTips,
      relatedProducts,
    } = body;

    if (!email || !firstName || !purchasedProductTitle || !purchasedProductType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to: email,
      subject: `Tips for your ${purchasedProductTitle} + products you might love`,
      react: PostPurchaseEmail({
        firstName,
        purchasedProductTitle,
        purchasedProductType,
        careTips: careTips || [],
        relatedProducts: relatedProducts || [],
      }),
    });

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id });
    } else {
      throw result.error;
    }
  } catch (error) {
    console.error('Post-purchase email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
