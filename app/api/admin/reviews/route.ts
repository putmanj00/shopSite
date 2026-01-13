import { NextRequest, NextResponse } from 'next/server';
import { getAllReviews, updateReviewStatus, deleteReview } from '@/lib/reviews-db';
import { verifyAdmin } from '@/lib/admin-auth';

// Middleware-like check function
async function checkAuth() {
  const isAuth = await verifyAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const authError = await checkAuth();
  if (authError) return authError;

  const reviews = await getAllReviews();
  return NextResponse.json(reviews);
}

export async function PATCH(request: NextRequest) {
  const authError = await checkAuth();
  if (authError) return authError;

  try {
    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ error: 'Missing Required Fields' }, { status: 400 });

    await updateReviewStatus(id, status);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await checkAuth();
  if (authError) return authError;

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await deleteReview(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
