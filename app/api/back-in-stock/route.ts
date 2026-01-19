import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, productId, productTitle, variantId, variantTitle } = body;

    if (!email || !productId) {
      return NextResponse.json(
        { error: 'Email and product ID are required' },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Store subscription in database
    // 2. Set up webhook/cron to check inventory
    // 3. Send email when product is back in stock

    console.log('Back in stock subscription:', {
      email,
      productId,
      productTitle,
      variantId,
      variantTitle,
      subscribedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription created successfully',
    });
  } catch (error) {
    console.error('Back in stock subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
