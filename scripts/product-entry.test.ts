/**
 * Focused check for the entry-model normalizer (lib/product-entry.ts, S3).
 *
 * Pure logic assertions (no DOM / React) — mirrors the self-contained tsx style
 * of button-variants.test.ts. Run: npm run test:entry
 *
 * Guards the contract that matters for the funnel: products with NO metafields
 * (the current seed catalog — SHOP-01 data entry pending) must normalize to an
 * empty-but-valid entry so the PLP/PDP render sanely; and admin-entered values
 * ("№ 219", "One of One") must parse to the canonical shape.
 */
import assert from 'node:assert/strict';
import type { ShopifyProduct, ShopifyMetafield } from '../types/shopify';
import {
  parseEntry,
  formatEntryNo,
  isOneOfOne,
} from '../lib/product-entry';

let failures = 0;
function check(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (err) {
    failures += 1;
    console.error(`❌ ${name}\n   ${(err as Error).message}`);
  }
}

// Minimal product factory — parseEntry only reads `metafields`.
function product(
  metafields?: (ShopifyMetafield | null)[]
): ShopifyProduct {
  return { metafields } as ShopifyProduct;
}
function mf(key: string, value: string, type = 'single_line_text_field'): ShopifyMetafield {
  return { namespace: 'custom', key, value, type };
}

check('zero-metafield product → all-null entry (fallback path)', () => {
  const e = parseEntry(product(undefined));
  assert.equal(e.entryNo, null);
  assert.equal(e.technique, null);
  assert.equal(e.maker, null);
  assert.equal(e.gathered, null);
  assert.equal(e.edition, null);
  assert.equal(isOneOfOne(e), false);
});

check('sparse metafields array (null slots for unset keys) is tolerated', () => {
  const e = parseEntry(product([mf('entry_no', '219'), null, null, null, null]));
  assert.equal(e.entryNo, 219);
  assert.equal(e.technique, null);
});

check('full entry normalizes every field', () => {
  const e = parseEntry(
    product([
      mf('entry_no', '219', 'number_integer'),
      mf('technique', 'ice-dye over split-fold'),
      mf('maker', 'Karen — dye vats'),
      mf('gathered', 'June 2026, Alexandria KY'),
      mf('edition', 'one_of_one'),
    ])
  );
  assert.equal(e.entryNo, 219);
  assert.equal(e.technique, 'ice-dye over split-fold');
  assert.equal(e.maker, 'Karen — dye vats');
  assert.equal(e.gathered, 'June 2026, Alexandria KY');
  assert.equal(e.edition, 'one_of_one');
  assert.equal(isOneOfOne(e), true);
});

check('entry_no tolerates admin formats and rejects invalid', () => {
  assert.equal(parseEntry(product([mf('entry_no', '№ 219')])).entryNo, 219);
  assert.equal(parseEntry(product([mf('entry_no', '#7')])).entryNo, 7);
  assert.equal(parseEntry(product([mf('entry_no', '0')])).entryNo, null);
  assert.equal(parseEntry(product([mf('entry_no', 'abc')])).entryNo, null);
  assert.equal(parseEntry(product([mf('entry_no', '  ')])).entryNo, null);
});

check('edition normalizes spacing/case; unknown → null (treated small-run)', () => {
  assert.equal(parseEntry(product([mf('edition', 'One of One')])).edition, 'one_of_one');
  assert.equal(parseEntry(product([mf('edition', 'one of one')])).edition, 'one_of_one');
  assert.equal(parseEntry(product([mf('edition', 'Small Run')])).edition, 'small_run');
  assert.equal(parseEntry(product([mf('edition', 'small-run')])).edition, 'small_run');
  const weird = parseEntry(product([mf('edition', 'limited')]));
  assert.equal(weird.edition, null);
  assert.equal(isOneOfOne(weird), false); // unknown is NOT locked as unique
});

check('blank text values collapse to null', () => {
  const e = parseEntry(product([mf('technique', '   '), mf('maker', '')]));
  assert.equal(e.technique, null);
  assert.equal(e.maker, null);
});

check('formatEntryNo renders № prefix or empty string', () => {
  assert.equal(formatEntryNo(219), '№ 219');
  assert.equal(formatEntryNo(null), '');
});

console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'} — ${failures} failing check(s)`);
process.exit(failures === 0 ? 0 : 1);
