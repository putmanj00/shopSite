import { NextRequest, NextResponse } from 'next/server';
import { adminApiFetch, isAdminApiConfigured } from '@/lib/shopify-admin';
import { NEWSLETTER_TAG, normalizeEmail, upsertSignupCustomer } from '@/lib/customer-signup';

const FAILURE_MESSAGE = "We couldn't sign you up right now. Please try again in a few minutes.";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }

  const rawEmail = (body as { email?: unknown } | null)?.email;
  if (!rawEmail) {
    return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
  }
  const email = normalizeEmail(rawEmail);
  if (!email) {
    return NextResponse.json(
      { success: false, message: 'Please enter a valid email address' },
      { status: 400 }
    );
  }

  if (!isAdminApiConfigured()) {
    console.error('[newsletter] Shopify Admin API not configured; signup not saved');
    return NextResponse.json({ success: false, message: FAILURE_MESSAGE }, { status: 503 });
  }

  try {
    await upsertSignupCustomer(adminApiFetch, { email, tags: [NEWSLETTER_TAG], subscribe: true });
  } catch (error) {
    // Do not log the email address (PII) — the error message is enough to debug.
    console.error('[newsletter] Shopify customer upsert failed:', (error as Error).message);
    return NextResponse.json({ success: false, message: FAILURE_MESSAGE }, { status: 502 });
  }

  // Same response whether the customer was new or existing (no enumeration).
  return NextResponse.json({ success: true, message: "You're on the list — we'll be in touch." });
}
