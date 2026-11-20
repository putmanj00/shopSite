/**
 * Prod catalog check — launch plan item B (archive seed catalog, create two
 * real-shaped products for an end-to-end check, then revert them).
 *
 *   set -a; . ~/.config/wildenflower-admin.env; set +a
 *   npx tsx scripts/catalog-prod-check.ts snapshot --out products.json
 *   npx tsx scripts/catalog-prod-check.ts archive-all [--apply]
 *   npx tsx scripts/catalog-prod-check.ts seed        [--apply]
 *   npx tsx scripts/catalog-prod-check.ts revert      [--apply]
 *
 * Dry-run by default: prints what it would do. --apply performs mutations.
 * Archives, never deletes. Check products carry CHECK_TAG so archive-all
 * skips them and revert finds only them.
 */
import { writeFileSync } from 'node:fs';
import { adminApiFetch } from '../lib/shopify-admin';

console.log = (...args: unknown[]) => console.error(...args);

const CHECK_TAG = 'e2e-prod-check';
const CHANNEL = 'My Store Headless';
const COLLECTION = 'tie-dye';
const ASSET_BASE = 'https://www.wildenflower.com/assets/images';

const args = process.argv.slice(2);
const cmd = args[0];
const apply = args.includes('--apply');
const outIdx = args.indexOf('--out');
const outPath = outIdx >= 0 ? args[outIdx + 1] : undefined;

interface ProductRow {
  id: string;
  handle: string;
  title: string;
  status: string;
  tags: string[];
}

interface UserError {
  field?: string[] | null;
  message: string;
}

function check(op: string, errors: UserError[] | undefined): void {
  if (errors && errors.length > 0) {
    throw new Error(`${op}: ${errors.map((e) => `${e.field?.join('.') ?? ''} ${e.message}`).join('; ')}`);
  }
}

async function allProducts(): Promise<ProductRow[]> {
  const out: ProductRow[] = [];
  let after: string | null = null;
  do {
    const data: { products: { pageInfo: { hasNextPage: boolean; endCursor: string }; nodes: ProductRow[] } } =
      await adminApiFetch({
        query: `query ($after: String) { products(first: 100, after: $after, sortKey: TITLE) {
          pageInfo { hasNextPage endCursor } nodes { id handle title status tags } } }`,
        variables: { after },
      });
    out.push(...data.products.nodes);
    after = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
  } while (after);
  return out;
}

async function lookupIds(): Promise<{ publicationId: string; collectionId: string }> {
  const data = await adminApiFetch<{
    publications: { nodes: { id: string; name: string }[] };
    collectionByHandle: { id: string } | null;
  }>({
    query: `query ($h: String!) { publications(first: 25) { nodes { id name } } collectionByHandle(handle: $h) { id } }`,
    variables: { h: COLLECTION },
  });
  const pub = data.publications.nodes.find((p) => p.name === CHANNEL);
  if (!pub) throw new Error(`Sales channel "${CHANNEL}" not found`);
  if (!data.collectionByHandle) throw new Error(`Collection "${COLLECTION}" not found`);
  return { publicationId: pub.id, collectionId: data.collectionByHandle.id };
}

async function setStatus(id: string, status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'): Promise<void> {
  const r = await adminApiFetch<{ productUpdate: { userErrors: UserError[] } }>({
    query: `mutation ($p: ProductUpdateInput!) { productUpdate(product: $p) { userErrors { field message } } }`,
    variables: { p: { id, status } },
  });
  check(`productUpdate ${id} → ${status}`, r.productUpdate.userErrors);
}

async function snapshot(): Promise<void> {
  const products = await allProducts();
  const json = JSON.stringify({ takenAt: new Date().toISOString(), count: products.length, products }, null, 2);
  if (outPath) {
    writeFileSync(outPath, json + '\n');
    console.error(`Wrote ${products.length} products to ${outPath}`);
  } else {
    process.stdout.write(json + '\n');
  }
}

async function archiveAll(): Promise<void> {
  const products = await allProducts();
  const targets = products.filter((p) => p.status !== 'ARCHIVED' && !p.tags.includes(CHECK_TAG));
  console.error(`${products.length} products; ${targets.length} to archive${apply ? '' : ' (dry run)'}`);
  for (const p of targets) {
    console.error(`  ${p.status.padEnd(8)} ${p.handle}`);
    if (apply) await setStatus(p.id, 'ARCHIVED');
  }
  if (apply) console.error(`Archived ${targets.length}.`);
}

const images = (paths: string[], what: string) =>
  paths.map((p, i) => ({
    originalSource: `${ASSET_BASE}/${p}`,
    alt: `${what} — view ${i + 1} of ${paths.length}`,
    contentType: 'IMAGE',
  }));

const metafields = (entryNo: number, technique: string, edition: 'one_of_one' | 'small_run') => [
  { namespace: 'custom', key: 'entry_no', type: 'number_integer', value: String(entryNo) },
  { namespace: 'custom', key: 'edition', type: 'single_line_text_field', value: edition },
  { namespace: 'custom', key: 'technique', type: 'single_line_text_field', value: technique },
  { namespace: 'custom', key: 'maker', type: 'single_line_text_field', value: 'Wildenflower Studio' },
  { namespace: 'custom', key: 'gathered', type: 'single_line_text_field', value: 'November 2026' },
];

// P1 = single variant; P2 = two sizes at different prices (multi-line + variant scenarios).
function checkProducts(collectionId: string) {
  return [
    {
      handle: 'e2e-prod-check-bandana',
      title: 'Fern Spiral Bandana',
      descriptionHtml:
        '<p>A cotton bandana folded and bound into a fern spiral, then dyed in moss and marigold. Each fold takes the color a little differently, so no two are alike.</p>',
      vendor: 'Wildenflower',
      productType: 'Bandana',
      tags: [CHECK_TAG],
      status: 'ACTIVE',
      collections: [collectionId],
      files: images(
        ['about/love.jpeg', 'headers/botanical-hero.png', 'empty-states/empty-state-botanical.png'],
        'Fern Spiral Bandana',
      ),
      productOptions: [{ name: 'Title', values: [{ name: 'Default Title' }] }],
      variants: [
        {
          optionValues: [{ optionName: 'Title', name: 'Default Title' }],
          price: '24.00',
          inventoryItem: { tracked: false },
        },
      ],
      metafields: metafields(9001, 'Spiral fold, hand-bound', 'one_of_one'),
    },
    {
      handle: 'e2e-prod-check-tee',
      title: 'Marigold Ripple Tee',
      descriptionHtml:
        '<p>A heavyweight cotton tee crumple-dyed in marigold and rust. The ripple pattern comes from scrunching the fabric by hand before the dye bath.</p>',
      vendor: 'Wildenflower',
      productType: 'Tee',
      tags: [CHECK_TAG],
      status: 'ACTIVE',
      collections: [collectionId],
      files: images(
        ['headers/botanical-hero2.png', 'splash/splash-bloom-elements.png', 'headers/botanical-header-large-about.png'],
        'Marigold Ripple Tee',
      ),
      productOptions: [{ name: 'Size', values: [{ name: 'M' }, { name: 'L' }] }],
      variants: [
        { optionValues: [{ optionName: 'Size', name: 'M' }], price: '38.00', inventoryItem: { tracked: false } },
        { optionValues: [{ optionName: 'Size', name: 'L' }], price: '42.00', inventoryItem: { tracked: false } },
      ],
      metafields: metafields(9002, 'Crumple dye', 'small_run'),
    },
  ];
}

async function seed(): Promise<void> {
  const { publicationId, collectionId } = await lookupIds();
  const existing = new Set((await allProducts()).map((p) => p.handle));
  for (const input of checkProducts(collectionId)) {
    if (existing.has(input.handle)) {
      console.error(`  skip ${input.handle} (exists)`);
      continue;
    }
    console.error(`  create ${input.handle} "${input.title}"${apply ? '' : ' (dry run)'}`);
    if (!apply) continue;
    const r = await adminApiFetch<{ productSet: { product: { id: string } | null; userErrors: UserError[] } }>({
      query: `mutation ($input: ProductSetInput!) { productSet(input: $input, synchronous: true) {
        product { id } userErrors { field message } } }`,
      variables: { input },
    });
    check(`productSet ${input.handle}`, r.productSet.userErrors);
    const id = r.productSet.product!.id;
    const p = await adminApiFetch<{ publishablePublish: { userErrors: UserError[] } }>({
      query: `mutation ($id: ID!, $pub: ID!) { publishablePublish(id: $id, input: [{ publicationId: $pub }]) {
        userErrors { field message } } }`,
      variables: { id, pub: publicationId },
    });
    check(`publish ${input.handle}`, p.publishablePublish.userErrors);
    console.error(`    ✓ ${id} active + published to ${CHANNEL}`);
  }
}

async function revert(): Promise<void> {
  const { publicationId } = await lookupIds();
  const targets = (await allProducts()).filter((p) => p.tags.includes(CHECK_TAG) && p.status !== 'ARCHIVED');
  console.error(`${targets.length} check product(s) to revert${apply ? '' : ' (dry run)'}`);
  for (const t of targets) {
    console.error(`  ${t.handle}: unpublish → DRAFT → ARCHIVED`);
    if (!apply) continue;
    const u = await adminApiFetch<{ publishableUnpublish: { userErrors: UserError[] } }>({
      query: `mutation ($id: ID!, $pub: ID!) { publishableUnpublish(id: $id, input: [{ publicationId: $pub }]) {
        userErrors { field message } } }`,
      variables: { id: t.id, pub: publicationId },
    });
    check(`unpublish ${t.handle}`, u.publishableUnpublish.userErrors);
    await setStatus(t.id, 'DRAFT');
    await setStatus(t.id, 'ARCHIVED');
  }
}

const commands: Record<string, () => Promise<void>> = {
  snapshot,
  'archive-all': archiveAll,
  seed,
  revert,
};

const run = cmd ? commands[cmd] : undefined;
if (!run) {
  console.error(`usage: catalog-prod-check.ts <${Object.keys(commands).join('|')}> [--apply] [--out file]`);
  process.exitCode = 2;
} else {
  run().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  });
}
