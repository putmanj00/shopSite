import { NextRequest, NextResponse } from 'next/server';
import { markReviewHelpful } from '@/lib/reviews-db';

export async function POST(request: NextRequest) {
  try {
    const { reviewId } = await request.json();

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    await markReviewHelpful(reviewId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark helpful error:', error);
    return NextResponse.json({ error: 'Failed to mark review as helpful' }, { status: 500 });
  }
}
