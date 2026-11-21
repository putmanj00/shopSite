/**
 * Catalog lint — read-only report of what each product still needs.
 *
 *   set -a; . ~/.config/wildenflower-admin.env; set +a
 *   npm run catalog:lint                       # markdown to stdout
 *   npm run catalog:lint -- --out catalog-report.md
 *   npm run catalog:lint -- --channel "My Store Headless"
 *
 * Uses the Admin API (queries only — no mutations) rather than the Storefront
 * API so DRAFT products being prepared are checked too; Storefront can't see
 * them. Needs read_products. Checks live in lib/catalog-lint.ts.
 *
 * Exit code: 1 if any LIVE product has an error, else 0 (so it can gate later).
 */
import { writeFileSync } from 'node:fs';
import { adminApiFetch } from '../lib/shopify-admin';
import {
  duplicateTitleHandles,
  isLive,
  isTestLike,
  lintCollections,
  lintProduct,
  OPTIONAL_METAFIELDS,
  REQUIRED_METAFIELDS,
  summarizeIssues,
  type Issue,
  type LintCollection,
  type LintProduct,
} from '../lib/catalog-lint';

// lib/shopify-admin logs token/scope lines via console.log; keep stdout = report only.
console.log = (...args: unknown[]) => console.error(...args);

const DEFAULT_CHANNEL = 'My Store Headless';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function findPublicationId(name: string): Promise<string> {
  const data = await adminApiFetch<{ publications: { nodes: { id: string; name: string }[] } }>({
    query: `{ publications(first: 25) { nodes { id name } } }`,
  });
  const pub = data.publications.nodes.find((p) => p.name === name);
  if (!pub) {
    const names = data.publications.nodes.map((p) => p.name).join(', ');
    throw new Error(`Sales channel "${name}" not found. Available: ${names}`);
  }
  return pub.id;
}

const META_FIELDS = [...REQUIRED_METAFIELDS, ...OPTIONAL_METAFIELDS]
  .map((k) => `${k}: metafield(namespace: "custom", key: "${k}") { value }`)
  .join('\n        ');

const PRODUCTS_QUERY = `
  query CatalogLintProducts($after: String, $pub: ID!) {
    products(first: 50, after: $after, sortKey: TITLE) {
      pageInfo { hasNextPage endCursor }
      nodes {
        handle title status vendor tags description
        publishedOnPublication(publicationId: $pub)
        media(first: 25) { nodes { mediaContentType alt } }
        variants(first: 100) { nodes { price inventoryItem { requiresShipping measurement { weight { value } } } } }
        collections(first: 25) { nodes { handle } }
        ${META_FIELDS}
      }
    }
  }`;

interface ProductNode {
  handle: string;
  title: string;
  status: string;
  vendor: string;
  tags: string[];
  description: string;
  publishedOnPublication: boolean;
  media: { nodes: { mediaContentType: string; alt: string | null }[] };
  variants: {
    nodes: {
      price: string;
      inventoryItem: { requiresShipping: boolean; measurement: { weight: { value: number } | null } | null } | null;
    }[];
  };
  collections: { nodes: { handle: string }[] };
  [meta: string]: unknown;
}

async function fetchProducts(pub: string): Promise<LintProduct[]> {
  const out: LintProduct[] = [];
  let after: string | null = null;
  do {
    const data: { products: { pageInfo: { hasNextPage: boolean; endCursor: string }; nodes: ProductNode[] } } =
      await adminApiFetch({ query: PRODUCTS_QUERY, variables: { after, pub } });
    for (const n of data.products.nodes) {
      const metafields: Record<string, string | null> = {};
      for (const k of [...REQUIRED_METAFIELDS, ...OPTIONAL_METAFIELDS]) {
        metafields[k] = (n[k] as { value: string } | null)?.value ?? null;
      }
      out.push({
        handle: n.handle,
        title: n.title,
        status: n.status,
        vendor: n.vendor,
        tags: n.tags,
        description: n.description ?? '',
        images: n.media.nodes.filter((m) => m.mediaContentType === 'IMAGE').map((m) => ({ alt: m.alt })),
        prices: n.variants.nodes.map((v) => Number(v.price)),
        weights: n.variants.nodes.map((v) =>
          v.inventoryItem?.requiresShipping === false ? null : Number(v.inventoryItem?.measurement?.weight?.value ?? 0),
        ),
        collections: n.collections.nodes.map((c) => c.handle),
        metafields,
        onSiteChannel: n.publishedOnPublication,
      });
    }
    after = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
  } while (after);
  return out;
}

async function fetchCollections(pub: string): Promise<LintCollection[]> {
  const data = await adminApiFetch<{
    collections: { nodes: { handle: string; title: string; publishedOnPublication: boolean }[] };
  }>({
    query: `query ($pub: ID!) { collections(first: 100) { nodes { handle title publishedOnPublication(publicationId: $pub) } } }`,
    variables: { pub },
  });
  return data.collections.nodes.map((c) => ({
    handle: c.handle,
    title: c.title,
    onSiteChannel: c.publishedOnPublication,
  }));
}

function bullets(issues: Issue[]): string {
  return issues.map((i) => `  - ${i.severity === 'error' ? '❌' : '⚠️'} ${i.message}`).join('\n');
}

function render(channel: string, products: LintProduct[], collections: LintCollection[]): { md: string; liveErrors: number } {
  const real = products.filter((p) => !isTestLike(p));
  const tests = products.filter(isTestLike);
  const dupes = duplicateTitleHandles(products);
  const rows = real.map((p) => {
    const issues = lintProduct(p);
    if (dupes.has(p.handle)) issues.push({ severity: 'warn', message: 'duplicate title — another product has the same name (seed leftover?)' });
    return { p, issues };
  });
  const live = rows.filter((r) => isLive(r.p));
  const drafts = rows.filter((r) => !isLive(r.p) && r.p.status !== 'ARCHIVED');
  const archived = rows.length - live.length - drafts.length;
  const liveErrors =
    live.reduce((n, r) => n + r.issues.filter((i) => i.severity === 'error').length, 0) +
    tests.filter(isLive).length;

  const section = (title: string, list: typeof rows) => {
    const needs = list.filter((r) => r.issues.length > 0);
    const ok = list.length - needs.length;
    const body = needs
      .map((r) => `- [ ] **${r.p.title}** (\`${r.p.handle}\`, ${r.p.status.toLowerCase()})\n${bullets(r.issues)}`)
      .join('\n');
    return `## ${title} — ${list.length} (${ok} ready, ${needs.length} need work)\n\n${body || '_Nothing to fix._'}\n`;
  };

  const liveTests = tests.filter(isLive);
  const colFindings = lintCollections(collections, products);
  const common = summarizeIssues(rows.filter((r) => r.p.status !== 'ARCHIVED').map((r) => r.issues))
    .map((c) => `| ${c.severity === 'error' ? '❌' : '⚠️'} ${c.message} | ${c.count} |`)
    .join('\n');

  const md = [
    `# Catalog lint — ${new Date().toISOString().slice(0, 10)}`,
    '',
    `Site channel: **${channel}**. Live = active + published there. ❌ = fix before activating; ⚠️ = fix before launch.`,
    `Products: ${products.length} total · ${live.length} live · ${drafts.length} draft/unpublished · ${archived} archived (not checked) · ${tests.length} test/placeholder.`,
    '',
    '## Most common issues',
    '',
    common ? `| Issue | Products |\n|---|---|\n${common}\n` : '_None._\n',
    section('Live on the site', live),
    section('Drafts / not on the site yet', drafts),
    `## Test / placeholder products — ${tests.length}\n\n` +
      (liveTests.length
        ? liveTests.map((p) => `- [ ] ❌ **${p.title}** is LIVE — archive or unpublish`).join('\n')
        : `_None live (${tests.length} hidden)._`) +
      '\n',
    `## Collections — ${collections.length}\n\n` +
      (colFindings.length
        ? colFindings.map((f) => `- [ ] \`${f.handle}\`: ${f.message}`).join('\n')
        : '_All launch categories exist, are published, and have live products._') +
      '\n',
  ].join('\n');

  return { md, liveErrors };
}

async function main() {
  const channel = arg('--channel') ?? DEFAULT_CHANNEL;
  const outPath = arg('--out');
  const pub = await findPublicationId(channel);
  const [products, collections] = await Promise.all([fetchProducts(pub), fetchCollections(pub)]);
  const { md, liveErrors } = render(channel, products, collections);
  if (outPath) {
    writeFileSync(outPath, md);
    console.error(`Wrote ${outPath}`);
  } else {
    process.stdout.write(md);
  }
  if (liveErrors > 0) {
    console.error(`${liveErrors} error(s) on LIVE products.`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 2;
});
