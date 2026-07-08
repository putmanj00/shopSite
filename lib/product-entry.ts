// Entry model — normalizes the `custom` product metafields (S3) into a clean,
// UI-safe shape. The Storefront `metafields(identifiers:)` read returns a sparse
// array with null slots for unset keys, so every field here is nullable and the
// UI must render sanely when the whole entry is empty (zero-metafield fallback:
// the seed catalog has no metafields yet — SHOP-01 data entry is pending).
//
// Governance (enforced by convention — Shopify has NO metafield uniqueness):
// single counter, never renumber, gaps are fine. Numbering starts honest-low
// (№ 1, № 2 for the two seed products) per James gate 2 (2026-07-07).

import type { ShopifyProduct, ShopifyMetafield } from '@/types/shopify';

export type Edition = 'one_of_one' | 'small_run';

export interface ProductEntry {
  /** The journal entry number, e.g. 219. null when unset or non-positive/invalid. */
  entryNo: number | null;
  /** Technique named in the title's spirit, shown italic on cards. */
  technique: string | null;
  maker: string | null;
  /** Free-text "gathered" line, e.g. "June 2026, Alexandria KY". */
  gathered: string | null;
  /** Edition class. Drives PDP pickers + sold-state copy. null → treat as small-run. */
  edition: Edition | null;
}

const EMPTY_ENTRY: ProductEntry = {
  entryNo: null,
  technique: null,
  maker: null,
  gathered: null,
  edition: null,
};

/** Trim to a non-empty string, or null. */
function clean(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Look up a metafield value by key from the sparse identifiers array. */
function valueForKey(
  metafields: (ShopifyMetafield | null)[] | undefined,
  key: string
): string | null {
  if (!metafields) return null;
  const match = metafields.find((m) => m != null && m.key === key);
  return clean(match?.value);
}

/** Parse a positive integer entry number; null on missing/invalid/non-positive. */
function parseEntryNo(raw: string | null): number | null {
  if (raw == null) return null;
  // Tolerate values entered as "№ 219", "219", "#219" in Shopify admin.
  const digits = raw.replace(/[^0-9]/g, '');
  if (digits.length === 0) return null;
  const n = Number.parseInt(digits, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Normalize an edition value to a known class, or null (→ treated as small-run). */
function parseEdition(raw: string | null): Edition | null {
  if (raw == null) return null;
  const key = raw.toLowerCase().replace(/[\s-]+/g, '_');
  if (key === 'one_of_one' || key === 'one_of_a_kind') return 'one_of_one';
  if (key === 'small_run' || key === 'small_batch') return 'small_run';
  return null;
}

/** Normalize a product's `custom` metafields into a ProductEntry. Never throws. */
export function parseEntry(product: ShopifyProduct): ProductEntry {
  const mf = product.metafields;
  if (!mf) return EMPTY_ENTRY;
  return {
    entryNo: parseEntryNo(valueForKey(mf, 'entry_no')),
    technique: valueForKey(mf, 'technique'),
    maker: valueForKey(mf, 'maker'),
    gathered: valueForKey(mf, 'gathered'),
    edition: parseEdition(valueForKey(mf, 'edition')),
  };
}

/** "№ 219" for display. Empty string when unset, so callers can render nothing. */
export function formatEntryNo(entryNo: number | null): string {
  return entryNo == null ? '' : `№ ${entryNo}`;
}

/**
 * Read just the entry number from a raw sparse metafields array. Cart lines
 * carry a lighter `merchandise.product` than {@link ShopifyProduct} (no
 * priceRange/variants/etc.), so they can't go through {@link parseEntry}; the
 * cart drawer only needs the entry № anyway. Same null-tolerance as parseEntry:
 * missing/blank/invalid/non-positive → null → callers render nothing.
 */
export function entryNoFromMetafields(
  metafields: (ShopifyMetafield | null)[] | undefined
): number | null {
  return parseEntryNo(valueForKey(metafields, 'entry_no'));
}

/**
 * A one-of-one is definitively marked so in Shopify. Unmarked/unknown editions
 * are treated as small-run — the conservative default (keeps pickers + the
 * "returns to the field" language rather than wrongly locking a piece as unique).
 */
export function isOneOfOne(entry: ProductEntry): boolean {
  return entry.edition === 'one_of_one';
}

/**
 * Honest sold-out copy. Shopify only tells us a variant is unavailable — never
 * that a restock is planned. So "returns to the field" (a restock promise) is
 * used ONLY when the edition is explicitly small-run. A one-of-one is gone for
 * good. An unknown/unclassified edition (incl. the zero-metafield fallback) gets
 * neutral "Sold out" — we don't invent availability we weren't told about.
 */
export function soldStateLabel(entry: ProductEntry): string {
  if (entry.edition === 'one_of_one') return 'Sold — one of one';
  if (entry.edition === 'small_run') return 'Returns to the field soon';
  return 'Sold out';
}
