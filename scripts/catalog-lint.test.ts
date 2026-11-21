/**
 * Guard for the catalog lint rules (lib/catalog-lint.ts).
 * Run: npm run test:catalog-lint
 */
import assert from 'node:assert/strict';
import {
  duplicateTitleHandles,
  isLive,
  lintCollections,
  lintProduct,
  summarizeIssues,
  LAUNCH_COLLECTIONS,
  type LintProduct,
} from '../lib/catalog-lint';

let passed = 0;
const test = (name: string, fn: () => void) => {
  fn();
  passed++;
  console.log(`✅ ${name}`);
};

const good: LintProduct = {
  handle: 'meadow-spiral-tee',
  title: 'Meadow Spiral Tee',
  status: 'ACTIVE',
  vendor: 'Wildenflower',
  tags: [],
  description:
    'Hand-folded spiral, dyed in small batches with fiber-reactive dyes, then rinsed and washed twice so the color holds.',
  images: [{ alt: 'front' }, { alt: 'back' }, { alt: 'detail' }],
  prices: [48],
  weights: [6],
  collections: ['tie-dye'],
  metafields: { entry_no: '219', edition: 'One of One', technique: 'Spiral', maker: 'Fern' },
  onSiteChannel: true,
};
const p = (over: Partial<LintProduct>): LintProduct => ({ ...good, ...over });
const messages = (x: LintProduct) => lintProduct(x).map((i) => `${i.severity}:${i.message}`);
const has = (x: LintProduct, severity: string, re: RegExp) =>
  messages(x).some((m) => m.startsWith(severity + ':') && re.test(m));

test('complete product has no issues', () => assert.deepEqual(messages(good), []));

test('live = active AND on the site channel', () => {
  assert.equal(isLive(good), true);
  assert.equal(isLive(p({ status: 'DRAFT' })), false);
  assert.equal(isLive(p({ onSiteChannel: false })), false);
});

test('active but unpublished is an error', () =>
  assert.ok(has(p({ onSiteChannel: false }), 'error', /not published/)));

test('images: none = error, <3 = warn, missing alt = warn', () => {
  assert.ok(has(p({ images: [] }), 'error', /no images/));
  assert.ok(has(p({ images: [{ alt: 'a' }] }), 'warn', /1 image\(s\) — want ≥3/));
  assert.ok(has(p({ images: [{ alt: 'a' }, { alt: '' }, { alt: null }] }), 'warn', /2 image\(s\) missing alt/));
});

test('description: empty / placeholder = error, short = warn', () => {
  assert.ok(has(p({ description: '  ' }), 'error', /no description/));
  assert.ok(has(p({ description: 'Lorem ipsum dolor sit amet '.repeat(5) }), 'error', /placeholder/));
  assert.ok(has(p({ description: 'Nice tee.' }), 'warn', /short/));
});

test('price: $0 or NaN variant = error; no variants = error', () => {
  assert.ok(has(p({ prices: [48, 0] }), 'error', /\$0/));
  assert.ok(has(p({ prices: [Number('')] }), 'error', /\$0/)); // Number('') = 0
  assert.ok(has(p({ prices: [Number('abc')] }), 'error', /\$0/)); // NaN
  assert.ok(has(p({ prices: [] }), 'error', /no variants/));
});

test('weight: shipped variant with 0 / missing weight = error; non-shipping variant skipped', () => {
  assert.ok(has(p({ weights: [6, 0] }), 'error', /no shipping weight/));
  assert.ok(has(p({ weights: [Number('')] }), 'error', /no shipping weight/));
  assert.ok(has(p({ weights: [Number('abc')] }), 'error', /no shipping weight/));
  assert.deepEqual(messages(p({ weights: [null] })), []); // requiresShipping false
});

test('no collection = warn', () => assert.ok(has(p({ collections: [] }), 'warn', /not in any collection/)));

test('missing / blank required metafields listed', () => {
  const m = messages(p({ metafields: { entry_no: '219', edition: ' ', technique: null } }));
  assert.ok(m.includes('warn:missing metafields: custom.edition, custom.technique, custom.maker'), m.join('\n'));
});

test('optional gathered metafield is not required', () => assert.deepEqual(messages(p({ metafields: { ...good.metafields, gathered: null } })), []));

test('vendor: known-wrong values and anything not Wildenflower warn', () => {
  assert.ok(has(p({ vendor: 'My Store' }), 'warn', /site displays "Wildenflower"/));
  assert.ok(has(p({ vendor: 'Artisan Collective' }), 'warn', /site displays "Wildenflower"/));
  assert.ok(has(p({ vendor: 'Someone Else' }), 'warn', /expected "Wildenflower"/));
});

test('test products: only flagged when live, nothing else checked', () => {
  assert.deepEqual(messages(p({ title: 'Ring', status: 'DRAFT', images: [] })), []);
  assert.ok(has(p({ title: 'Generic TieDye' }), 'error', /LIVE/));
  assert.ok(has(p({ tags: ['test-product'] }), 'error', /LIVE/));
});

test('collections: missing / unpublished launch categories and empty ones', () => {
  const all = LAUNCH_COLLECTIONS.map((h) => ({ handle: h, title: h, onSiteChannel: true }));
  const live = LAUNCH_COLLECTIONS.map((h) => p({ handle: `x-${h}`, collections: [h] }));
  assert.deepEqual(lintCollections(all, live), []);

  const f = lintCollections(
    [...all.filter((c) => c.handle !== 'artwork' && c.handle !== 'leather'), { handle: 'leather', title: 'Leather', onSiteChannel: false }],
    live,
  ).map((x) => `${x.handle}:${x.message}`);
  assert.ok(f.some((m) => m.startsWith('artwork:') && /does not exist/.test(m)), f.join('\n'));
  assert.ok(f.some((m) => m.startsWith('leather:') && /not published/.test(m)), f.join('\n'));

  const drafts = live.map((x) => ({ ...x, status: 'DRAFT' }));
  assert.equal(lintCollections(all, drafts).filter((x) => /no live products/.test(x.message)).length, LAUNCH_COLLECTIONS.length);
});

test('duplicate titles (incl. trailing number) flagged; archived/test ignored', () => {
  const d = duplicateTitleHandles([
    p({ handle: 'a', title: 'Coastline Print' }),
    p({ handle: 'a-1', title: 'Coastline Print 1' }),
    p({ handle: 'b', title: 'Vase' }),
    p({ handle: 'b-old', title: 'Vase', status: 'ARCHIVED' }),
    p({ handle: 'r1', title: 'Ring' }),
    p({ handle: 'r2', title: 'Ring' }),
  ]);
  assert.deepEqual([...d].sort(), ['a', 'a-1']);
});

test('summary groups messages across numbers/quoted values, errors first', () => {
  const s = summarizeIssues([
    lintProduct(p({ images: [{ alt: 'a' }] })),
    lintProduct(p({ images: [{ alt: 'a' }, { alt: 'b' }] })),
    lintProduct(p({ images: [], vendor: 'My Store' })),
    lintProduct(p({ vendor: 'Artisan Collective' })),
  ]);
  assert.equal(s[0].severity, 'error');
  assert.equal(s.find((x) => x.message.startsWith('N image(s) — want'))?.count, 2);
  assert.equal(s.find((x) => x.message.startsWith('vendor is'))?.count, 2);
});

console.log(`catalog-lint: ${passed} tests passed`);
