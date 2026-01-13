import { NextRequest, NextResponse } from 'next/server';
import { getReviewsByProduct, addReview, calculateReviewStats } from '@/lib/reviews-db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const handle = searchParams.get('handle');

  if (!handle) {
    return NextResponse.json({ error: 'Product handle is required' }, { status: 400 });
  }

  try {
    const reviews = await getReviewsByProduct(handle);
    const stats = calculateReviewStats(reviews);
    return NextResponse.json({ reviews, stats });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userId, userName, rating, title, content } = body;

    // Basic validation
    if (!productId || !userId || !rating || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newReview = await addReview({
      productId,
      userId,
      userName: userName || 'Anonymous', // Fallback
      rating,
      title,
      content,
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
