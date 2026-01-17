import { NextRequest, NextResponse } from 'next/server';
import { getReviewsByProduct, addReview, calculateReviewStats } from '@/lib/reviews-db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const handle = searchParams.get('handle');
  const sort = searchParams.get('sort') || 'newest';
  const rating = searchParams.get('rating'); // '5', '4', etc.
  const withPhotos = searchParams.get('withPhotos') === 'true';

  if (!handle) {
    return NextResponse.json({ error: 'Product handle is required' }, { status: 400 });
  }

  try {
    let reviews = await getReviewsByProduct(handle);
    const stats = calculateReviewStats(reviews);

    // Apply Filters
    if (rating) {
        const ratingNum = parseInt(rating);
        if (!isNaN(ratingNum)) {
            reviews = reviews.filter(r => Math.round(r.rating) === ratingNum);
        }
    }

    if (withPhotos) {
        reviews = reviews.filter(r => r.photos && r.photos.length > 0);
    }

    // Apply Sorting
    reviews.sort((a, b) => {
        switch (sort) {
            case 'highest':
                return b.rating - a.rating;
            case 'lowest':
                return a.rating - b.rating;
            case 'newest':
            default:
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });

    return NextResponse.json({ reviews, stats });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userId, userName, rating, title, content, photos } = body;

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
      photos: photos || [], // URL strings
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
