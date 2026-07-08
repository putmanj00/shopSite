/**
 * Judge.me integration — Path C (free hybrid).
 *
 * Display: SSR-fetch Judge.me's own pre-rendered widget HTML (public token, by
 * handle), strip its self-hiding <style>, and render it as INERT markup styled
 * by Judge.me's public CSS. We never load Judge.me's core JavaScript.
 *
 * Submit: our own brand-native form posts to Judge.me's unauthenticated review
 * endpoint (proxied server-side by app/api/reviews). Judge.me owns storage,
 * moderation, spam, verification, and review-request emails — free of charge.
 *
 * The widget HTML is an undocumented contract, so every path here fails soft:
 * a fetch/parse failure or a zero-review product yields `html: null`, and the
 * caller renders an honest brand zero-state instead.
 */

const WIDGET_API = 'https://api.judge.me/api/v1/widgets/product_review';
const SUBMIT_API = 'https://judge.me/api/v1/reviews';

// The public token is browser-safe (it ships in NEXT_PUBLIC_*), so it is not a
// secret. It only permits reading public widget HTML and submitting a review
// for moderation — the same actions Judge.me's own storefront widget performs.
function config() {
  return {
    token: process.env.NEXT_PUBLIC_JUDGEME_PUBLIC_TOKEN,
    shop: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
  };
}

export interface ProductReviewWidget {
  /** Reviews Judge.me holds for this product (0 when new or on any failure). */
  reviewCount: number;
  /** Stripped, inert widget HTML — null when there are no reviews to show. */
  html: string | null;
}

const EMPTY: ProductReviewWidget = { reviewCount: 0, html: null };

/**
 * Fetch and prepare the Judge.me review widget for a product handle.
 * Cached with the PDP's ISR window (revalidate=60). Never throws.
 */
export async function getProductReviewWidget(handle: string): Promise<ProductReviewWidget> {
  const { token, shop } = config();
  if (!token || !shop || !handle) return EMPTY;

  try {
    const url =
      `${WIDGET_API}?api_token=${encodeURIComponent(token)}` +
      `&shop_domain=${encodeURIComponent(shop)}` +
      `&handle=${encodeURIComponent(handle)}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return EMPTY;

    const data: unknown = await res.json();
    const raw = extractWidgetHtml(data);
    const reviewCount = parseReviewCount(raw);

    // Zero reviews (or unparseable markup) → let the caller show a brand
    // zero-state rather than Judge.me's default "Be the first to write a review".
    if (reviewCount <= 0 || !raw) return EMPTY;

    return { reviewCount, html: stripHidingStyle(raw) };
  } catch {
    return EMPTY;
  }
}

function extractWidgetHtml(data: unknown): string {
  if (data && typeof data === 'object' && 'widget' in data) {
    const w = (data as { widget: unknown }).widget;
    if (typeof w === 'string') return w;
  }
  return '';
}

/** Read the per-product review count Judge.me embeds on the widget root. */
function parseReviewCount(html: string): number {
  const match = html.match(/data-number-of-reviews=['"](\d+)['"]/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Remove Judge.me's `jdgm-temp-hiding-style` block. That inline <style> sets
 * `.jdgm-rev-widg{ display:none }` and is normally cleared by their core JS
 * once hydrated; since we render inert HTML, we strip it ourselves so the
 * widget is visible.
 */
function stripHidingStyle(html: string): string {
  return html.replace(
    /<style[^>]*jdgm-temp-hiding-style[^>]*>[\s\S]*?<\/style>/gi,
    '',
  );
}

/**
 * Extract the numeric Shopify product id Judge.me keys reviews by, from a
 * Storefront GID (`gid://shopify/Product/NNN`). This is the authoritative
 * source for a submission's product id — independent of the display widget,
 * so a review still attaches to the correct product even when the widget
 * fetch fails. Returns null if the GID is missing or unparseable.
 */
export function externalIdFromGid(gid: string | null | undefined): string | null {
  if (!gid) return null;
  const match = gid.match(/Product\/(\d+)/);
  return match ? match[1] : null;
}

export interface ReviewSubmission {
  handle: string;
  externalId?: string | null;
  name: string;
  email: string;
  rating: number;
  title?: string;
  body: string;
}

/**
 * Submit a review to Judge.me for moderation. Unauthenticated public endpoint;
 * submitted reviews land as pending (not "verified buyer") in the dashboard.
 * Returns transport success only — Judge.me does the moderating.
 */
export async function submitReview(
  input: ReviewSubmission,
): Promise<{ ok: boolean; status: number }> {
  const { token, shop } = config();
  if (!token || !shop) return { ok: false, status: 500 };

  const payload: Record<string, string | number> = {
    api_token: token,
    shop_domain: shop,
    platform: 'shopify',
    name: input.name,
    email: input.email,
    rating: input.rating,
    body: input.body,
  };
  if (input.title) payload.title = input.title;
  if (input.externalId) payload.id = input.externalId;

  try {
    const res = await fetch(SUBMIT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 502 };
  }
}
