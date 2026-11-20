import { NextRequest, NextResponse } from 'next/server';
import { adminApiFetch, isAdminApiConfigured } from '@/lib/shopify-admin';
import {
  backInStockTag,
  normalizeEmail,
  numericShopifyId,
  upsertSignupCustomer,
} from '@/lib/customer-signup';

const FAILURE_MESSAGE = "We couldn't save your request right now. Please try again in a few minutes.";

/**
 * Records a back-in-stock request as a tag (`back-in-stock:<variant id>`) on a
 * Shopify customer. Marketing consent is NOT changed (transactional request).
 * This route does not send any email; notifying on restock is a separate
 * piece (Shopify Flow / inventory webhook) not built yet.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }

  const { email: rawEmail, variantId } = (body ?? {}) as { email?: unknown; variantId?: unknown };
  const email = normalizeEmail(rawEmail);
  const variantNumericId = numericShopifyId(variantId);
  if (!email || !variantNumericId) {
    return NextResponse.json(
      { success: false, message: 'A valid email and product option are required' },
      { status: 400 }
    );
  }

  if (!isAdminApiConfigured()) {
    console.error('[back-in-stock] Shopify Admin API not configured; request not saved');
    return NextResponse.json({ success: false, message: FAILURE_MESSAGE }, { status: 503 });
  }

  try {
    await upsertSignupCustomer(adminApiFetch, {
      email,
      tags: [backInStockTag(variantNumericId)],
      subscribe: false,
    });
  } catch (error) {
    console.error('[back-in-stock] Shopify customer upsert failed:', (error as Error).message);
    return NextResponse.json({ success: false, message: FAILURE_MESSAGE }, { status: 502 });
  }

  return NextResponse.json({ success: true, message: "You're on the list." });
}
