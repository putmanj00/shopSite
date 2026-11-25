/**
 * Catalog sync (lib/catalog-sync.ts): CSV parsing, row validation, plan diff, and
 * the apply sequence against a scripted fake Admin API — no network, no store.
 *
 * Contract: EVERY call the fake receives is validated (document + variables)
 * against scripts/fixtures/shopify-admin.graphql, a pruned real Admin 2026-01
 * schema, so a field/argument/input-type mistake fails here, not on the store.
 *
 * Self-contained tsx style of the other scripts/*.test.ts files.
 * Run: npm run test:catalog-sync
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- assertions poke into untyped GraphQL variable payloads */
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  buildSchema,
  getVariableValues,
  Kind,
  parse,
  validate,
  type OperationDefinitionNode,
} from 'graphql';
import {
  ADD_MEDIA_MUTATION,
  CONTEXT_QUERY,
  FILE_UPDATE_MUTATION,
  LIVE_PRODUCT_QUERY,
  METAFIELDS_SET_MUTATION,
  PRODUCT_SET_MUTATION,
  PUBLISH_MUTATION,
  STAGED_UPLOAD_MUTATION,
  altIndex,
  applyPlan,
  descriptionToHtml,
  fetchLive,
  loadContext,
  localDirSource,
  parseCsv,
  planProduct,
  readTable,
  toCatalogRow,
  validateCatalog,
  validateRow,
  type AdminFetch,
  type CatalogRow,
  type ImageFile,
  type LiveProduct,
  type SyncContext,
} from '../lib/catalog-sync';
import { DOCUMENTS } from './admin-schema-snapshot';

const schema = buildSchema(
  readFileSync(path.join(__dirname, 'fixtures/shopify-admin.graphql'), 'utf8')
);

function contract(query: string, variables: Record<string, unknown> = {}) {
  const ast = parse(query);
  const errors = validate(schema, ast).map(e => e.message);
  assert.deepEqual(errors, [], `document must validate against the Admin schema:\n${query}`);
  const op = ast.definitions.find(
    d => d.kind === Kind.OPERATION_DEFINITION
  ) as OperationDefinitionNode;
  const res = getVariableValues(schema, op.variableDefinitions ?? [], variables);
  const vErrors = 'errors' in res && res.errors ? res.errors.map(e => e.message) : [];
  assert.deepEqual(
    vErrors,
    [],
    `variables must coerce to the schema input types:\n${JSON.stringify(variables)}`
  );
}

type Call = { query: string; variables?: Record<string, unknown> };
/** Scripted fake: responses consumed in order; every call contract-checked + recorded. */
function fakeAdmin(responses: unknown[]) {
  const calls: Call[] = [];
  const fetch: AdminFetch = async <T>(args: Call) => {
    contract(args.query, args.variables);
    calls.push(args);
    if (responses.length === 0) throw new Error(`unexpected extra Admin call:\n${args.query}`);
    const next = responses.shift();
    if (typeof next === 'function') return next(args) as T;
    return next as T;
  };
  return { fetch, calls };
}

let passed = 0;
async function test(name: string, fn: () => Promise<void> | void) {
  await fn();
  passed++;
  console.log(`  ok  ${name}`);
}

const img = (name: string, sha: string): ImageFile => ({
  name,
  mime: 'image/jpeg',
  size: 1234,
  sha,
  read: async () => new Uint8Array([1, 2, 3]),
});
const IMAGES = [
  img('01.jpg', 'aaaaaaaaaaaa'),
  img('02.jpg', 'bbbbbbbbbbbb'),
  img('03.jpg', 'cccccccccccc'),
];
const ALTS = new Map([
  ['01.jpg', 'Front of the hoodie'],
  ['02.jpg', 'Back'],
  ['03.jpg', 'Detail of the spiral'],
]);
const DESC =
  'A spiral tie-dye hoodie, dyed by hand in small batches.\n\nHeavyweight organic cotton, pre-shrunk & soft.';

const REC: Record<string, string> = {
  handle: 'spiral-hoodie',
  title: 'Spiral Hoodie',
  description: DESC,
  price: '65',
  weight_oz: '18.5',
  inventory: '2|1|0',
  sizes: 'S|M|L',
  collections: 'tie-dye',
  entry_no: '12',
  maker: 'James',
  gathered: 'June 2026, Alexandria KY',
  technique: 'Spiral fold',
  edition: 'small_run',
};
const row = (over: Record<string, string> = {}): CatalogRow => {
  const p = toCatalogRow({ ...REC, ...over });
  assert.deepEqual(p.errors, []);
  return p.row;
};

const CTX: SyncContext = {
  publicationId: 'gid://shopify/Publication/1',
  locationId: 'gid://shopify/Location/9',
  collectionIds: new Map([
    ['tie-dye', 'gid://shopify/Collection/10'],
    ['leather', 'gid://shopify/Collection/11'],
  ]),
  metaTypes: {
    entry_no: 'number_integer',
    edition: 'single_line_text_field',
    technique: 'single_line_text_field',
    maker: 'single_line_text_field',
    gathered: 'single_line_text_field',
  },
};

/** A live product that matches REC exactly, with all three images already synced. */
function liveMatching(): LiveProduct {
  const v = (id: number, size: string, weight = { value: 18.5, unit: 'OUNCES' }) => ({
    id: `gid://shopify/ProductVariant/${id}`,
    price: '65.00',
    selectedOptions: [{ name: 'Size', value: size }],
    inventoryItem: { measurement: { weight } },
  });
  return {
    id: 'gid://shopify/Product/5',
    handle: 'spiral-hoodie',
    title: 'Spiral Hoodie',
    descriptionHtml: descriptionToHtml(DESC),
    vendor: 'Wildenflower',
    status: 'DRAFT',
    publishedOnPublication: true,
    options: [{ name: 'Size' }],
    variants: { nodes: [v(1, 'S'), v(2, 'M'), v(3, 'L')] },
    collections: { nodes: [{ id: 'gid://shopify/Collection/10', handle: 'tie-dye' }] },
    media: {
      nodes: [
        { id: 'gid://shopify/MediaImage/101', alt: 'Front of the hoodie' },
        { id: 'gid://shopify/MediaImage/102', alt: 'Back' },
        { id: 'gid://shopify/MediaImage/103', alt: 'Detail of the spiral' },
      ],
    },
    syncMedia: {
      value: JSON.stringify({
        aaaaaaaaaaaa: 'gid://shopify/MediaImage/101',
        bbbbbbbbbbbb: 'gid://shopify/MediaImage/102',
        cccccccccccc: 'gid://shopify/MediaImage/103',
      }),
    },
    entry_no: { value: '12' },
    maker: { value: 'James' },
    gathered: { value: 'June 2026, Alexandria KY' },
    technique: { value: 'Spiral fold' },
    edition: { value: 'small_run' },
  };
}

const OK = { userErrors: [] };

(async () => {
  await test('every document validates against the Admin schema snapshot', () => {
    for (const d of DOCUMENTS)
      assert.deepEqual(
        validate(schema, parse(d)).map(e => e.message),
        [],
        d
      );
  });

  await test('parseCsv: quotes, commas, newlines, escaped quotes, CRLF, BOM, blank rows', () => {
    const csv = '﻿a,b,c\r\n"x, y","line1\nline2","say ""hi"""\r\n\r\n1,,3';
    assert.deepEqual(parseCsv(csv), [
      ['a', 'b', 'c'],
      ['x, y', 'line1\nline2', 'say "hi"'],
      ['1', '', '3'],
    ]);
    assert.throws(() => parseCsv('a\n"open'), /unterminated/);
    assert.deepEqual(readTable(' Handle ,Title\nh,T\n'), [{ handle: 'h', title: 'T' }]);
  });

  await test('toCatalogRow: sizes, per-size inventory, defaults, errors', () => {
    const r = row();
    assert.deepEqual(r.sizes, ['S', 'M', 'L']);
    assert.deepEqual(r.inventory, [2, 1, 0]);
    assert.equal(r.vendor, 'Wildenflower');
    assert.equal(r.price, 65);
    assert.deepEqual(toCatalogRow({ ...REC, inventory: '3' }).row.inventory, [3, 3, 3]);
    const ooo = toCatalogRow({ ...REC, sizes: '', inventory: '', edition: 'one_of_one' });
    assert.deepEqual([ooo.errors, ooo.row.inventory], [[], [1]]);
    assert.match(toCatalogRow({ ...REC, inventory: '' }).errors.join(), /inventory is required/);
    assert.match(
      toCatalogRow({ ...REC, inventory: '1|2' }).errors.join(),
      /2 values but there are 3 sizes/
    );
    assert.match(toCatalogRow({ ...REC, inventory: '1|x|2' }).errors.join(), /whole numbers/);
    assert.match(
      toCatalogRow({ ...REC, price: 'abc' }).errors.join(),
      /price "abc" is not a number/
    );
    assert.equal(toCatalogRow({ ...REC, price: '$40.50' }).row.price, 40.5);
  });

  await test('validateRow: valid row has no errors; lint warnings pass through', () => {
    assert.deepEqual(validateRow(row(), IMAGES, ALTS), []);
    const short = validateRow(row({ description: 'Nice hoodie, hand dyed.' }), IMAGES, ALTS);
    assert.deepEqual(
      short.map(i => i.severity),
      ['warn']
    );
    assert.match(short[0].message, /description is short/);
  });

  await test('validateRow: photo, edition, handle, price, weight, entry rules are errors', () => {
    const errs = (r: CatalogRow, imgs = IMAGES, alts: Map<string, string> | undefined = ALTS) =>
      validateRow(r, imgs, alts)
        .filter(i => i.severity === 'error')
        .map(i => i.message)
        .join(' | ');
    assert.match(errs(row(), IMAGES.slice(0, 2)), /2 image\(s\).*need ≥3/);
    assert.match(
      errs(
        row(),
        IMAGES,
        new Map([
          ['01.jpg', 'x'],
          ['02.jpg', ' '],
        ])
      ),
      /no alt text in alt.csv for: 02.jpg, 03.jpg/
    );
    assert.match(
      errs(row(), IMAGES, new Map([...ALTS, ['09.jpg', 'ghost']])),
      /names 09.jpg but there is no such image/
    );
    assert.match(errs(row({ edition: 'limited' })), /edition "limited" must be one of/);
    assert.match(errs(row({ handle: 'Spiral Hoodie' })), /lowercase-words-with-dashes/);
    assert.match(errs(row({ price: '0' })), /price \$0/);
    assert.match(errs(row({ weight_oz: '0' })), /no shipping weight/);
    assert.match(
      errs(row({ entry_no: '№ 12' })),
      /entry_no "№ 12" must be a positive whole number/
    );
    assert.match(errs(row({ edition: 'one_of_one' })), /one_of_one with several sizes/);
    assert.match(errs(row({ sizes: 'S|S', inventory: '1' })), /duplicate size/);
  });

  await test('validateCatalog: duplicate handles and entry numbers', () => {
    const out = validateCatalog([row(), row(), row({ handle: 'other' })]);
    assert.match(out.get('spiral-hoodie')!.join(), /appears 2 times/);
    assert.match(out.get('other')!.join(), /entry_no 12 already used by spiral-hoodie/);
  });

  await test('altIndex + localDirSource: sorted images, content hash, alt lookup', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'catalog-sync-'));
    try {
      mkdirSync(path.join(dir, 'h'));
      writeFileSync(path.join(dir, 'h', '02.jpg'), 'two');
      writeFileSync(path.join(dir, 'h', '01.JPG'), 'one');
      writeFileSync(path.join(dir, 'h', 'notes.txt'), 'skip me');
      const files = await localDirSource(dir).list('h');
      assert.deepEqual(
        files.map(f => [f.name, f.mime, f.size]),
        [
          ['01.JPG', 'image/jpeg', 3],
          ['02.jpg', 'image/jpeg', 3],
        ]
      );
      assert.match(files[0].sha, /^[0-9a-f]{12}$/);
      assert.notEqual(files[0].sha, files[1].sha);
      assert.deepEqual(await localDirSource(dir).list('missing'), []);
      const idx = altIndex(readTable('handle,file,alt\nh,01.JPG,"A, B"\n,x,y'));
      assert.equal(idx.get('h')!.get('01.JPG'), 'A, B');
      assert.equal(idx.size, 1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  await test('descriptionToHtml escapes and paragraphs', () => {
    assert.equal(
      descriptionToHtml(' a <b> & c\nd\n\n e '),
      '<p>a &lt;b&gt; &amp; c<br>d</p><p>e</p>'
    );
  });

  await test('loadContext: channel, primary location, collections, definition types', async () => {
    const { fetch } = fakeAdmin([
      {
        publications: {
          nodes: [
            { id: 'P0', name: 'Online Store' },
            { id: 'P1', name: 'My Store Headless' },
          ],
        },
        locations: {
          nodes: [
            { id: 'L0', isPrimary: false },
            { id: 'L1', isPrimary: true },
          ],
        },
        collections: { nodes: [{ id: 'C1', handle: 'tie-dye' }] },
        metafieldDefinitions: {
          nodes: [{ key: 'entry_no', type: { name: 'single_line_text_field' } }],
        },
      },
    ]);
    const ctx = await loadContext(fetch, 'My Store Headless');
    assert.equal(ctx.publicationId, 'P1');
    assert.equal(ctx.locationId, 'L1');
    assert.equal(ctx.collectionIds.get('tie-dye'), 'C1');
    assert.equal(ctx.metaTypes.entry_no, 'single_line_text_field'); // store definition wins
    assert.equal(ctx.metaTypes.maker, 'single_line_text_field');
    const bad = fakeAdmin([
      {
        publications: { nodes: [] },
        locations: { nodes: [] },
        collections: { nodes: [] },
        metafieldDefinitions: { nodes: [] },
      },
    ]);
    await assert.rejects(loadContext(bad.fetch, 'Nope'), /Sales channel "Nope" not found/);
    const defs = (uniq: Record<string, boolean>) => ({
      publications: { nodes: [{ id: 'P1', name: 'X' }] },
      locations: { nodes: [{ id: 'L1', isPrimary: true }] },
      collections: { nodes: [] },
      metafieldDefinitions: {
        nodes: Object.entries(uniq).map(([key, enabled]) => ({
          key,
          type: { name: 'single_line_text_field' },
          capabilities: { uniqueValues: { enabled } },
        })),
      },
    });
    // entry_no unique = correct; edition unique = the prod misconfig found 2026-11-22.
    const okUnique = fakeAdmin([defs({ entry_no: true, edition: false })]);
    await loadContext(okUnique.fetch, 'X');
    const badUnique = fakeAdmin([defs({ entry_no: true, edition: true, maker: true })]);
    await assert.rejects(
      loadContext(badUnique.fetch, 'X'),
      /custom\.edition, custom\.maker has "Unique values" on/
    );
  });

  await test('fetchLive: staged (DRAFT) publication on site channel counts as published', async () => {
    const { fetch, calls } = fakeAdmin([{ productByIdentifier: null }]);
    assert.equal(await fetchLive(fetch, 'spiral-hoodie', CTX), null);
    assert.deepEqual(calls[0].variables, { handle: 'spiral-hoodie' });
    assert.equal(calls[0].query, LIVE_PRODUCT_QUERY);
    const raw = (pubIds: string[]) => {
      const { publishedOnPublication: _drop, ...rest } = liveMatching();
      void _drop;
      return {
        productByIdentifier: {
          ...rest,
          resourcePublicationsV2: { nodes: pubIds.map(id => ({ publication: { id } })) },
        },
      };
    };
    const staged = fakeAdmin([raw(['gid://shopify/Publication/0', CTX.publicationId])]);
    const live = (await fetchLive(staged.fetch, 'spiral-hoodie', CTX))!;
    assert.equal(live.publishedOnPublication, true);
    assert.equal('resourcePublicationsV2' in live, false);
    assert.equal(
      planProduct(row(), IMAGES, ALTS, live, CTX, { activate: false }).action,
      'unchanged'
    );
    const other = fakeAdmin([raw(['gid://shopify/Publication/0'])]);
    assert.equal(
      (await fetchLive(other.fetch, 'spiral-hoodie', CTX))!.publishedOnPublication,
      false
    );
  });

  await test('plan create: DRAFT, inventory per size, typed metafields, uploads, publish', () => {
    const p = planProduct(row(), IMAGES, ALTS, null, CTX, { activate: false });
    assert.equal(p.action, 'create');
    const input = p.productSet!.input as Record<string, any>;
    assert.equal(p.productSet!.identifier, undefined);
    assert.equal(input.status, 'DRAFT');
    assert.equal(input.handle, 'spiral-hoodie');
    assert.equal(input.vendor, 'Wildenflower');
    assert.deepEqual(input.collections, ['gid://shopify/Collection/10']);
    assert.deepEqual(input.productOptions, [
      { name: 'Size', position: 1, values: [{ name: 'S' }, { name: 'M' }, { name: 'L' }] },
    ]);
    assert.deepEqual(
      input.variants.map((v: any) => [
        v.optionValues[0].name,
        v.price,
        v.inventoryQuantities[0].quantity,
      ]),
      [
        ['S', '65.00', 2],
        ['M', '65.00', 1],
        ['L', '65.00', 0],
      ]
    );
    assert.deepEqual(input.variants[0].inventoryItem, {
      tracked: true,
      requiresShipping: true,
      measurement: { weight: { value: 18.5, unit: 'OUNCES' } },
    });
    assert.deepEqual(
      input.metafields.find((m: any) => m.key === 'entry_no'),
      {
        namespace: 'custom',
        key: 'entry_no',
        type: 'number_integer',
        value: '12',
      }
    );
    assert.equal(input.metafields.length, 5);
    assert.deepEqual(
      p.uploads.map(u => [u.file.name, u.alt]),
      [...ALTS]
    );
    assert.equal(p.publish, true);
    contract(PRODUCT_SET_MUTATION, { input, identifier: null });
    assert.equal(
      planProduct(row(), IMAGES, ALTS, null, CTX, { activate: true }).productSet!.input.status,
      'ACTIVE'
    );
  });

  await test('plan create without sizes: one Default Title variant', () => {
    const r = row({ sizes: '', inventory: '', edition: 'one_of_one' });
    const input = planProduct(r, IMAGES, ALTS, null, CTX, { activate: false }).productSet!
      .input as Record<string, any>;
    assert.deepEqual(input.productOptions, [
      { name: 'Title', position: 1, values: [{ name: 'Default Title' }] },
    ]);
    assert.equal(input.variants.length, 1);
    assert.equal(input.variants[0].inventoryQuantities[0].quantity, 1);
    contract(PRODUCT_SET_MUTATION, { input, identifier: null });
  });

  await test('plan unchanged: matching live product → no writes at all', async () => {
    const p = planProduct(row(), IMAGES, ALTS, liveMatching(), CTX, { activate: false });
    assert.deepEqual(
      [p.action, p.changes, p.notes, p.productSet, p.uploads, p.altUpdates, p.publish],
      ['unchanged', [], [], null, [], [], false]
    );
    const { fetch, calls } = fakeAdmin([]);
    await applyPlan(fetch, p, CTX, 'gid://shopify/Product/5');
    assert.equal(calls.length, 0);
  });

  await test('plan update: diffs, keeps CSV-removed size, never re-sets stock or status', () => {
    const live = liveMatching();
    live.variants.nodes[1].price = '60.00';
    live.variants.nodes[2].inventoryItem = {
      measurement: { weight: { value: 524.47, unit: 'GRAMS' } },
    }; // ≈18.5 oz
    live.media.nodes[1].alt = 'old alt';
    live.media.nodes.push({ id: 'gid://shopify/MediaImage/999', alt: 'added in admin' });
    live.collections.nodes.push({ id: 'gid://shopify/Collection/11', handle: 'leather' });
    live.entry_no = { value: '11' };
    const r = row({ sizes: 'S|M|XL', inventory: '2|1|4', title: 'Spiral Hoodie II' });
    const p = planProduct(r, IMAGES, ALTS, live, CTX, { activate: false });
    assert.equal(p.action, 'update');
    assert.deepEqual(p.changes, [
      'title "Spiral Hoodie" → "Spiral Hoodie II"',
      'M price $60.00 → $65.00',
      'add size XL (inventory 4)',
      'custom.entry_no "11" → "12"',
      'alt text on 02.jpg',
    ]);
    assert.deepEqual(p.notes, [
      'size(s) L on Shopify but not in CSV — kept',
      'also in collection(s) leather — kept',
      '1 image(s) on Shopify not uploaded by sync — kept',
    ]);
    const input = p.productSet!.input as Record<string, any>;
    assert.deepEqual(p.productSet!.identifier, { id: 'gid://shopify/Product/5' });
    assert.equal(input.status, undefined, 'status untouched without --activate');
    assert.deepEqual(
      input.variants.map((v: any) => [
        v.id ?? null,
        v.optionValues[0].name,
        !!v.inventoryQuantities,
      ]),
      [
        ['gid://shopify/ProductVariant/1', 'S', false],
        ['gid://shopify/ProductVariant/2', 'M', false],
        [null, 'XL', true],
        ['gid://shopify/ProductVariant/3', 'L', false], // kept: productSet would delete an omitted variant
      ]
    );
    assert.deepEqual(
      input.productOptions[0].values.map((v: any) => v.name),
      ['S', 'M', 'XL', 'L']
    );
    assert.deepEqual(input.collections, [
      'gid://shopify/Collection/10',
      'gid://shopify/Collection/11',
    ]);
    assert.deepEqual(p.altUpdates, [
      { id: 'gid://shopify/MediaImage/102', alt: 'Back', name: '02.jpg' },
    ]);
    assert.equal(p.uploads.length, 0);
    contract(PRODUCT_SET_MUTATION, { input, identifier: p.productSet!.identifier });
  });

  await test('plan update: --activate flips status; archived stays archived otherwise', () => {
    const live = liveMatching();
    live.status = 'ARCHIVED';
    const kept = planProduct(row(), IMAGES, ALTS, live, CTX, { activate: false });
    assert.deepEqual(
      [kept.action, kept.notes],
      ['unchanged', ['product is ARCHIVED on Shopify — left archived']]
    );
    const on = planProduct(row(), IMAGES, ALTS, live, CTX, { activate: true });
    assert.deepEqual(on.changes, ['status ARCHIVED → ACTIVE']);
    assert.equal(on.productSet!.input.status, 'ACTIVE');
  });

  await test('plan: archived product the sync never made (old seed) is refused unless adopted', () => {
    const live = liveMatching();
    live.status = 'ARCHIVED';
    live.syncMedia = null;
    const refused = planProduct(row(), IMAGES, ALTS, live, CTX, { activate: true });
    assert.equal(refused.action, 'error');
    assert.equal(refused.productSet, null);
    assert.equal(refused.uploads.length, 0);
    assert.match(refused.notes.join(' '), /--adopt spiral-hoodie/);
    const adopted = planProduct(row(), IMAGES, ALTS, live, CTX, { activate: false, adopt: true });
    assert.equal(adopted.action, 'update');
    // A DRAFT/ACTIVE product without sync media (hand-made in admin) is not affected.
    const draft = liveMatching();
    draft.syncMedia = null;
    assert.equal(planProduct(row(), IMAGES, ALTS, draft, CTX, { activate: false }).action, 'update');
  });

  await test('plan: replaced photo uploads; synced photo removed locally is reported, kept', () => {
    const p = planProduct(
      row(),
      [IMAGES[0], IMAGES[1], img('03.jpg', 'dddddddddddd')],
      ALTS,
      liveMatching(),
      CTX,
      { activate: false }
    );
    assert.deepEqual(
      p.uploads.map(u => [u.file.name, u.alt]),
      [['03.jpg', 'Detail of the spiral']]
    );
    assert.ok(
      p.notes.includes(
        '1 synced image(s) no longer in catalog/images — kept on Shopify (remove in admin)'
      )
    );
  });

  await test('plan error: unknown collection, variant layout mismatch', () => {
    const a = planProduct(row({ collections: 'tie-dye|ghosts' }), IMAGES, ALTS, null, CTX, {
      activate: false,
    });
    assert.deepEqual([a.action, a.productSet], ['error', null]);
    assert.match(a.notes[0], /not on the store: ghosts/);
    const b = planProduct(row({ sizes: '', inventory: '1' }), IMAGES, ALTS, liveMatching(), CTX, {
      activate: false,
    });
    assert.equal(b.action, 'error');
    assert.match(b.notes[0], /live options are \[Size\], CSV wants Title/);
  });

  await test('apply create: productSet → per image stage/upload/attach/map → publish', async () => {
    const plan = planProduct(row(), IMAGES, ALTS, null, CTX, { activate: false });
    const uploaded: string[] = [];
    const target = (n: number) => ({
      stagedUploadsCreate: {
        stagedTargets: [
          {
            url: 'https://up.example',
            resourceUrl: `https://res/${n}`,
            parameters: [{ name: 'key', value: `k${n}` }],
          },
        ],
        ...OK,
      },
    });
    const media = (ids: number[]) => ({
      productUpdate: {
        product: { media: { nodes: ids.map(i => ({ id: `gid://shopify/MediaImage/${i}` })) } },
        ...OK,
      },
    });
    const { fetch, calls } = fakeAdmin([
      { productSet: { product: { id: 'gid://shopify/Product/77' }, ...OK } },
      target(1),
      media([201]),
      { metafieldsSet: OK },
      target(2),
      media([201, 202]),
      { metafieldsSet: OK },
      target(3),
      media([201, 202, 203]),
      { metafieldsSet: OK },
      { publishablePublish: OK },
    ]);
    const id = await applyPlan(fetch, plan, CTX, null, async (f, t) => {
      uploaded.push(`${f.name}→${t.url}`);
    });
    assert.equal(id, 'gid://shopify/Product/77');
    assert.deepEqual(uploaded, [
      '01.jpg→https://up.example',
      '02.jpg→https://up.example',
      '03.jpg→https://up.example',
    ]);
    assert.deepEqual(
      calls.map(c => c.query),
      [
        PRODUCT_SET_MUTATION,
        STAGED_UPLOAD_MUTATION,
        ADD_MEDIA_MUTATION,
        METAFIELDS_SET_MUTATION,
        STAGED_UPLOAD_MUTATION,
        ADD_MEDIA_MUTATION,
        METAFIELDS_SET_MUTATION,
        STAGED_UPLOAD_MUTATION,
        ADD_MEDIA_MUTATION,
        METAFIELDS_SET_MUTATION,
        PUBLISH_MUTATION,
      ]
    );
    assert.deepEqual(calls[2].variables, {
      product: { id: 'gid://shopify/Product/77' },
      media: [
        { originalSource: 'https://res/1', alt: 'Front of the hoodie', mediaContentType: 'IMAGE' },
      ],
    });
    const lastMap = (calls[9].variables as any).metafields[0];
    assert.equal(lastMap.namespace, 'wildenflower_sync');
    assert.equal(lastMap.type, 'json');
    assert.deepEqual(JSON.parse(lastMap.value), {
      aaaaaaaaaaaa: 'gid://shopify/MediaImage/201',
      bbbbbbbbbbbb: 'gid://shopify/MediaImage/202',
      cccccccccccc: 'gid://shopify/MediaImage/203',
    });
    assert.deepEqual(calls[10].variables, {
      id: 'gid://shopify/Product/77',
      input: [{ publicationId: CTX.publicationId }],
    });
  });

  await test('apply update: hand-added media is not mistaken for the new upload; alt via fileUpdate', async () => {
    const live = liveMatching();
    live.media.nodes.push({ id: 'gid://shopify/MediaImage/999', alt: 'admin' });
    live.media.nodes[0].alt = 'stale';
    const plan = planProduct(
      row(),
      [...IMAGES, img('04.jpg', 'eeeeeeeeeeee')],
      new Map([...ALTS, ['04.jpg', 'Tag']]),
      live,
      CTX,
      { activate: false }
    );
    assert.equal(plan.productSet, null, 'no product fields changed');
    const { fetch, calls } = fakeAdmin([
      {
        stagedUploadsCreate: {
          stagedTargets: [{ url: 'u', resourceUrl: 'r', parameters: [] }],
          ...OK,
        },
      },
      {
        productUpdate: {
          product: {
            media: {
              nodes: [101, 102, 103, 999, 300].map(i => ({ id: `gid://shopify/MediaImage/${i}` })),
            },
          },
          ...OK,
        },
      },
      { metafieldsSet: OK },
      { fileUpdate: OK },
    ]);
    await applyPlan(fetch, plan, CTX, live.id, async () => {});
    assert.equal(
      JSON.parse((calls[2].variables as any).metafields[0].value).eeeeeeeeeeee,
      'gid://shopify/MediaImage/300'
    );
    assert.deepEqual(calls[3].variables, {
      files: [{ id: 'gid://shopify/MediaImage/101', alt: 'Front of the hoodie' }],
    });
  });

  await test('apply: userErrors stop the product with the message', async () => {
    const plan = planProduct(row(), IMAGES, ALTS, null, CTX, { activate: false });
    const { fetch } = fakeAdmin([
      {
        productSet: { product: null, userErrors: [{ field: ['handle'], message: 'Handle taken' }] },
      },
    ]);
    await assert.rejects(
      applyPlan(fetch, plan, CTX, null, async () => {}),
      /productSet spiral-hoodie: handle: Handle taken/
    );
  });

  await test('context query document is what loadContext sends', async () => {
    const { fetch, calls } = fakeAdmin([
      {
        publications: { nodes: [{ id: 'P', name: 'X' }] },
        locations: { nodes: [{ id: 'L', isPrimary: true }] },
        collections: { nodes: [] },
        metafieldDefinitions: { nodes: [] },
      },
    ]);
    await loadContext(fetch, 'X');
    assert.equal(calls[0].query, CONTEXT_QUERY);
    contract(FILE_UPDATE_MUTATION, { files: [{ id: 'gid://shopify/MediaImage/1', alt: 'a' }] });
  });

  console.log(`catalog-sync: ${passed} passed`);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
