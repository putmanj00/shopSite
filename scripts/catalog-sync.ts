/**
 * Catalog sync — push catalog/products.csv + catalog/images/ to Shopify (launch plan §6b).
 *
 *   set -a; . ~/.config/wildenflower-admin.env; set +a
 *   npm run catalog:sync                          # DRY RUN (default): per-product diff vs live
 *   npm run catalog:sync -- --only <handle>       # one product
 *   npm run catalog:sync -- --apply --confirm-store <store>.myshopify.com
 *   npm run catalog:sync -- --apply --activate --confirm-store …   # create/flip to ACTIVE
 *   npm run catalog:sync -- --adopt <handle>[,<handle>]   # take over an old ARCHIVED product
 *
 * --apply writes; it needs --confirm-store equal to SHOPIFY_STORE_DOMAIN so a stale
 * env file can't write to the wrong store. Prod --apply is James-gated per run.
 * New products are DRAFT unless --activate (launch gate: payment test mode).
 * Nothing is ever deleted — see lib/catalog-sync.ts for the re-run rules.
 *
 * Exit: 0 ok · 1 invalid rows (nothing written) or a product failed to apply · 2 setup error.
 */
import { readFileSync, existsSync } from 'node:fs';
import { adminApiFetch } from '../lib/shopify-admin';
import {
  altIndex,
  applyPlan,
  fetchLive,
  loadContext,
  localDirSource,
  planProduct,
  readTable,
  toCatalogRow,
  validateCatalog,
  validateRow,
  type AdminFetch,
  type ProductPlan,
} from '../lib/catalog-sync';

// lib/shopify-admin logs token/scope lines via console.log; keep stdout = report only.
console.log = (...args: unknown[]) => console.error(...args);

const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(name);
const arg = (name: string) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const out = (s = '') => process.stdout.write(s + '\n');

const ICON: Record<ProductPlan['action'], string> = {
  create: '✚ create   ',
  update: '✎ update   ',
  unchanged: '= unchanged',
  error: '✖ skipped  ',
};

async function main() {
  const csvPath = arg('--csv') ?? 'catalog/products.csv';
  const altPath = arg('--alt') ?? 'catalog/alt.csv';
  const imagesDir = arg('--images') ?? 'catalog/images';
  const channel = arg('--channel') ?? 'My Store Headless';
  const only = arg('--only');
  const apply = flag('--apply');
  const activate = flag('--activate');
  const adopt = new Set((arg('--adopt') ?? '').split(',').filter(Boolean));

  if (flag('--prune')) {
    // simple: no prune; upgrade to a confirm-gated prune if James wants CSV removals to delete on Shopify
    throw new Error(
      '--prune is not implemented: sync never deletes. Remove sizes/images/collections in Shopify admin.'
    );
  }
  const store = (process.env.SHOPIFY_STORE_DOMAIN ?? '').replace(/^https?:\/\//, '');
  if (apply && arg('--confirm-store') !== store) {
    throw new Error(
      `--apply needs --confirm-store ${store || '<SHOPIFY_STORE_DOMAIN>'} (the store this env points at)`
    );
  }
  if (!existsSync(csvPath)) throw new Error(`${csvPath} not found`);

  const parsed = readTable(readFileSync(csvPath, 'utf8')).map(toCatalogRow);
  const alts = altIndex(existsSync(altPath) ? readTable(readFileSync(altPath, 'utf8')) : []);
  const source = localDirSource(imagesDir);
  const crossRow = validateCatalog(parsed.map(p => p.row));
  const selected = parsed.filter(p => !only || p.row.handle === only);
  if (only && selected.length === 0)
    throw new Error(`--only ${only}: no such handle in ${csvPath}`);
  if (selected.length === 0) {
    out(`${csvPath} has no products yet — nothing to sync. See catalog/README.md.`);
    return;
  }

  // 1. Validate everything before touching the store.
  const rows = await Promise.all(
    selected.map(async ({ row, errors }) => {
      const images = await source.list(row.handle);
      const issues = [
        ...errors.map(message => ({ severity: 'error' as const, message })),
        ...(crossRow.get(row.handle) ?? []).map(message => ({
          severity: 'error' as const,
          message,
        })),
        ...validateRow(row, images, alts.get(row.handle)),
      ];
      return { row, images, issues };
    })
  );
  const invalid = rows.filter(r => r.issues.some(i => i.severity === 'error'));

  out(
    `# Catalog sync — ${apply ? 'APPLY' : 'DRY RUN'} → ${store} (channel "${channel}")${activate ? ' --activate' : ''}`
  );
  out();
  for (const r of rows) {
    for (const i of r.issues)
      out(`${i.severity === 'error' ? '✖' : '⚠'} ${r.row.handle || '(no handle)'}: ${i.message}`);
  }
  if (invalid.length) {
    out();
    out(
      `${invalid.length} invalid product(s) — fix products.csv / alt.csv / images, nothing was ${apply ? 'written' : 'planned'}.`
    );
    process.exitCode = 1;
    return;
  }

  // 2. Plan against live (read-only queries).
  const fetch: AdminFetch = adminApiFetch;
  const ctx = await loadContext(fetch, channel);
  const plans: { plan: ProductPlan; liveId: string | null }[] = [];
  for (const r of rows) {
    const live = await fetchLive(fetch, r.row.handle, ctx);
    plans.push({
      plan: planProduct(r.row, r.images, alts.get(r.row.handle), live, ctx, {
        activate,
        adopt: adopt.has(r.row.handle),
      }),
      liveId: live?.id ?? null,
    });
  }
  for (const { plan } of plans) {
    out(`${ICON[plan.action]}  ${plan.handle}`);
    for (const c of plan.changes) out(`      - ${c}`);
    for (const n of plan.notes) out(`      · ${n}`);
  }
  const count = (a: ProductPlan['action']) => plans.filter(p => p.plan.action === a).length;
  out();
  out(
    `${count('create')} create · ${count('update')} update · ${count('unchanged')} unchanged · ${count('error')} skipped`
  );
  if (count('error')) process.exitCode = 1;
  if (!apply) {
    out('Dry run — nothing written. Re-run with --apply --confirm-store <store> to write.');
    return;
  }

  // 3. Apply, one product at a time; a failure stops that product only.
  out();
  let failed = 0;
  for (const { plan, liveId } of plans) {
    if (plan.action === 'unchanged' || plan.action === 'error') continue;
    try {
      const id = await applyPlan(fetch, plan, ctx, liveId);
      out(`✓ ${plan.handle} (${id})`);
    } catch (e) {
      failed++;
      out(`✖ ${plan.handle}: ${e instanceof Error ? e.message : e}`);
    }
  }
  if (failed) {
    out(`${failed} product(s) failed — fix and re-run (safe: already-applied parts are skipped).`);
    process.exitCode = 1;
  } else out('Done. Run `npm run catalog:lint` to see what is still missing.');
}

main().catch(e => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 2;
});
