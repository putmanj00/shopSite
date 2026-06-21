/**
 * Best-effort idempotency for Shopify webhooks.
 *
 * Shopify stamps every delivery with a stable `X-Shopify-Webhook-Id` that does
 * NOT change across retries of the same event. We record an id only AFTER the
 * work for that delivery succeeds, so a retry that follows a genuine 500 still
 * gets reprocessed (the id was never marked). A retry that follows a success is
 * recognised and skipped, preventing a duplicate email.
 *
 * # simple: per-instance in-memory store. On Vercel each serverless instance
 * has its own Map and cold starts wipe it, so a duplicate is still possible if
 * a retry lands on a different/recycled instance. This catches the dominant
 * case (fast retry into a still-warm instance) at zero infra cost. Upgrade to a
 * shared store (Vercel KV / Upstash Redis) if duplicate confirmations are ever
 * observed in production. Runnable check: scripts/test-webhook.ts ("Dedup").
 */

// Covers Shopify's retry window (retries taper over ~48h, but the same warm
// instance only needs a short memory; 1h bounds growth while catching bursts).
const TTL_MS = 60 * 60 * 1000;

// Only sweep once the map is non-trivially large — keeps the common path O(1).
const SWEEP_THRESHOLD = 500;

// webhookId -> expiry timestamp (ms).
const processed = new Map<string, number>();

function sweep(now: number): void {
  if (processed.size < SWEEP_THRESHOLD) return;
  for (const [id, expiry] of processed) {
    if (expiry <= now) processed.delete(id);
  }
}

/**
 * True if this webhook id was already processed successfully and is still
 * within the dedup window. A missing id (header absent) can't be deduped, so
 * we let it through.
 */
export function alreadyProcessed(webhookId: string | null | undefined): boolean {
  if (!webhookId) return false;
  const expiry = processed.get(webhookId);
  if (expiry === undefined) return false;
  if (expiry <= Date.now()) {
    processed.delete(webhookId);
    return false;
  }
  return true;
}

/** Record a webhook id as successfully processed. No-op when id is absent. */
export function markProcessed(webhookId: string | null | undefined): void {
  if (!webhookId) return;
  const now = Date.now();
  sweep(now);
  processed.set(webhookId, now + TTL_MS);
}

/** Test-only: clear the store between cases. */
export function _resetDedup(): void {
  processed.clear();
}
