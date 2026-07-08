import { NextRequest, NextResponse } from 'next/server';
import { submitReview } from '@/lib/judgeme';

/**
 * POST /api/reviews — submit a customer review.
 *
 * Thin server-side proxy to Judge.me's unauthenticated review endpoint. Kept
 * server-side to avoid a cross-origin browser POST and to centralize input
 * validation; Judge.me owns storage and moderation, so there is no GET here
 * (display is SSR'd from the Judge.me widget — see lib/judgeme.ts).
 */

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_TITLE = 200;
const MAX_BODY = 5000;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const body = (payload ?? {}) as Record<string, unknown>;
  const handle = str(body.handle);
  const name = str(body.name).trim();
  const email = str(body.email).trim();
  const title = str(body.title).trim();
  const reviewBody = str(body.body).trim();
  const externalId = body.externalId != null ? str(body.externalId) : null;
  const rating = Number(body.rating);

  if (!handle || !name || !email || !reviewBody) {
    return NextResponse.json({ error: 'Name, email, and review are required.' }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > MAX_EMAIL) {
    return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
  }
  if (name.length > MAX_NAME || title.length > MAX_TITLE || reviewBody.length > MAX_BODY) {
    return NextResponse.json({ error: 'One or more fields are too long.' }, { status: 400 });
  }

  const result = await submitReview({
    handle,
    externalId,
    name,
    email,
    rating,
    title: title || undefined,
    body: reviewBody,
  });

  if (!result.ok) {
    return NextResponse.json({ error: 'Could not submit review. Please try again.' }, { status: 502 });
  }

  // Judge.me moderates before publishing — the review will not appear instantly.
  return NextResponse.json({ status: 'pending' }, { status: 201 });
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : v == null ? '' : String(v);
}
