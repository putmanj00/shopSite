/**
 * Catalog sync — repo CSV + local photos → Shopify Admin API (launch plan §6b).
 *
 * Pure planning + an executor that takes an injected Admin fetcher, so the whole
 * thing is unit-testable without a network (scripts/catalog-sync.test.ts).
 * scripts/catalog-sync.ts is the thin CLI around it.
 *
 * Rules that keep a re-run safe:
 *   - idempotent by handle: create when missing, otherwise update only what differs
 *   - never deletes: CSV-removed sizes, collections, images are KEPT and reported
 *   - inventory is set only when a variant is created (a re-run must not restock
 *     a sold one-of-one)
 *   - status is set only on create (DRAFT unless --activate), or to ACTIVE with --activate
 *   - uploaded images are tracked by content hash in a product metafield
 *     (wildenflower_sync.media = {"<sha12>": "<MediaImage gid>"}) so a re-run
 *     neither duplicates photos nor touches ones added by hand in admin
 */
import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import {
  lintProduct,
  MIN_IMAGES,
  REQUIRED_METAFIELDS,
  OPTIONAL_METAFIELDS,
  type Issue,
} from './catalog-lint';

export type AdminFetch = <T>(args: {
  query: string;
  variables?: Record<string, unknown>;
}) => Promise<T>;

export const META_KEYS = [...REQUIRED_METAFIELDS, ...OPTIONAL_METAFIELDS] as const;
export type MetaKey = (typeof META_KEYS)[number];
export const EDITIONS = ['one_of_one', 'small_run'] as const;
export const SYNC_NAMESPACE = 'wildenflower_sync';
export const SYNC_MEDIA_KEY = 'media';
/** Types used when the store has no definition for a key (prod has all five, 2026-11-22). */
export const DEFAULT_META_TYPES: Record<MetaKey, string> = {
  entry_no: 'number_integer',
  edition: 'single_line_text_field',
  technique: 'single_line_text_field',
  maker: 'single_line_text_field',
  gathered: 'single_line_text_field',
};
const HANDLE_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE_RE = /\.(jpe?g|png|webp)$/i;

// ─── CSV ────────────────────────────────────────────────────────────────────

/** RFC 4180-ish: quoted fields may hold commas, newlines and "" escapes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"' && field === '') quoted = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (quoted) throw new Error('CSV: unterminated quoted field');
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter(r => r.some(f => f.trim() !== ''));
}

/** Header-keyed records. Lower-cases + trims header names. */
export function readTable(text: string): Record<string, string>[] {
  const [header, ...body] = parseCsv(text);
  if (!header) return [];
  const keys = header.map(h => h.trim().toLowerCase());
  return body.map(r => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? '').trim()])));
}

// ─── Rows ───────────────────────────────────────────────────────────────────

export interface CatalogRow {
  handle: string;
  title: string;
  description: string;
  price: number;
  weightOz: number;
  vendor: string;
  collections: string[];
  /** Empty → one default variant ("Title" option). Else one variant per size. */
  sizes: string[];
  /** One per variant; used only when the variant is first created. */
  inventory: number[];
  metafields: Partial<Record<MetaKey, string>>;
}

export interface RowParse {
  row: CatalogRow;
  errors: string[];
}

const list = (v: string | undefined) =>
  (v ?? '')
    .split('|')
    .map(s => s.trim())
    .filter(Boolean);

/** One products.csv record → CatalogRow + any parse errors (never throws). */
export function toCatalogRow(rec: Record<string, string>): RowParse {
  const errors: string[] = [];
  const num = (key: string) => {
    const raw = (rec[key] ?? '').replace(/^\$/, '');
    const n = raw === '' ? NaN : Number(raw);
    if (!Number.isFinite(n)) errors.push(`${key} "${rec[key] ?? ''}" is not a number`);
    return n;
  };
  const sizes = list(rec.sizes);
  const variantCount = Math.max(sizes.length, 1);
  const edition = (rec.edition ?? '').trim();
  const invRaw = list(rec.inventory);
  let inventory: number[];
  if (invRaw.length === 0) {
    inventory = Array(variantCount).fill(edition === 'one_of_one' ? 1 : NaN);
    if (edition !== 'one_of_one')
      errors.push('inventory is required (blank only allowed for one_of_one → 1)');
  } else if (invRaw.length === 1) inventory = Array(variantCount).fill(Number(invRaw[0]));
  else if (invRaw.length === variantCount) inventory = invRaw.map(Number);
  else {
    inventory = [];
    errors.push(`inventory has ${invRaw.length} values but there are ${variantCount} sizes`);
  }
  if (inventory.some(n => !Number.isInteger(n) || n < 0) && invRaw.length > 0)
    errors.push(`inventory "${rec.inventory}" must be whole numbers ≥ 0`);

  const metafields: Partial<Record<MetaKey, string>> = {};
  for (const k of META_KEYS) if (rec[k]) metafields[k] = rec[k];

  return {
    row: {
      handle: rec.handle ?? '',
      title: rec.title ?? '',
      description: rec.description ?? '',
      price: num('price'),
      weightOz: num('weight_oz'),
      vendor: rec.vendor || 'Wildenflower',
      collections: list(rec.collections),
      sizes,
      inventory,
      metafields,
    },
    errors,
  };
}

/** alt.csv (handle,file,alt) → handle → file name → alt text. */
export function altIndex(recs: Record<string, string>[]): Map<string, Map<string, string>> {
  const idx = new Map<string, Map<string, string>>();
  for (const r of recs) {
    if (!r.handle || !r.file) continue;
    if (!idx.has(r.handle)) idx.set(r.handle, new Map());
    idx.get(r.handle)!.set(r.file, r.alt ?? '');
  }
  return idx;
}

// ─── Images ─────────────────────────────────────────────────────────────────

export interface ImageFile {
  name: string; // e.g. "01.jpg"
  mime: string;
  size: number;
  sha: string; // first 12 hex of sha256 — identity across re-runs
  read(): Promise<Uint8Array>;
}

/**
 * Where product photos come from. One implementation today.
 * simple: local dir only (catalog/images/<handle>/NN.jpg, gitignored); upgrade to a
 * Drive-backed ImageSource if phone photos move to a shared Drive folder (James, later).
 */
export interface ImageSource {
  list(handle: string): Promise<ImageFile[]>;
}

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export function localDirSource(root: string): ImageSource {
  return {
    async list(handle) {
      const dir = path.join(root, handle);
      let names: string[];
      try {
        names = (await readdir(dir)).filter(n => IMAGE_RE.test(n)).sort();
      } catch {
        return [];
      }
      return Promise.all(
        names.map(async name => {
          const file = path.join(dir, name);
          const bytes = await readFile(file);
          return {
            name,
            mime: MIME[path.extname(name).toLowerCase()],
            size: (await stat(file)).size,
            sha: createHash('sha256').update(bytes).digest('hex').slice(0, 12),
            read: async () => new Uint8Array(bytes),
          };
        })
      );
    },
  };
}

// ─── Validation (shared rules with catalog lint) ────────────────────────────

/**
 * Errors block the whole run. Reuses lintProduct so sync and lint agree, then
 * escalates the photo rules (lint warns; sync refuses: ≥3 images, alt on every one).
 */
export function validateRow(
  row: CatalogRow,
  images: ImageFile[],
  alts: Map<string, string> | undefined
): Issue[] {
  const altFor = (n: string) => alts?.get(n)?.trim() || null;
  const lint = lintProduct({
    handle: row.handle,
    title: row.title,
    status: 'DRAFT',
    vendor: row.vendor,
    tags: [],
    description: row.description,
    images: images.map(i => ({ alt: altFor(i.name) })),
    prices: Array(Math.max(row.sizes.length, 1)).fill(row.price),
    weights: Array(Math.max(row.sizes.length, 1)).fill(row.weightOz),
    collections: row.collections,
    metafields: row.metafields,
    onSiteChannel: true,
  });
  const issues: Issue[] = lint.filter(i => !/image|alt text/.test(i.message));
  const err = (message: string) => issues.push({ severity: 'error', message });

  if (!HANDLE_RE.test(row.handle))
    err(`handle "${row.handle}" must be lowercase-words-with-dashes`);
  if (!row.title.trim()) err('title is empty');
  if (images.length < MIN_IMAGES)
    err(`${images.length} image(s) in catalog/images/${row.handle}/ — need ≥${MIN_IMAGES}`);
  const noAlt = images.filter(i => !altFor(i.name)).map(i => i.name);
  if (noAlt.length) err(`no alt text in alt.csv for: ${noAlt.join(', ')}`);
  for (const f of alts?.keys() ?? [])
    if (!images.some(i => i.name === f)) err(`alt.csv names ${f} but there is no such image`);
  const ed = row.metafields.edition;
  if (!ed || !(EDITIONS as readonly string[]).includes(ed))
    err(`edition "${ed ?? ''}" must be one of ${EDITIONS.join(', ')}`);
  if (row.metafields.entry_no && !/^[1-9]\d*$/.test(row.metafields.entry_no))
    err(`entry_no "${row.metafields.entry_no}" must be a positive whole number`);
  if (ed === 'one_of_one' && row.sizes.length > 1)
    err('one_of_one with several sizes — pick one or use small_run');
  if (new Set(row.sizes).size !== row.sizes.length) err('duplicate size');
  return issues;
}

/** Cross-row rules: unique handle, unique entry number (no Shopify uniqueness). */
export function validateCatalog(rows: CatalogRow[]): Map<string, string[]> {
  const out = new Map<string, string[]>();
  const add = (h: string, m: string) => out.set(h, [...(out.get(h) ?? []), m]);
  const seen = new Map<string, number>();
  const entries = new Map<string, string>();
  rows.forEach(r => {
    seen.set(r.handle, (seen.get(r.handle) ?? 0) + 1);
    const e = r.metafields.entry_no;
    if (e) {
      if (entries.has(e)) add(r.handle, `entry_no ${e} already used by ${entries.get(e)}`);
      else entries.set(e, r.handle);
    }
  });
  for (const [h, n] of seen) if (n > 1) add(h, `handle appears ${n} times in products.csv`);
  return out;
}

// ─── Live state ─────────────────────────────────────────────────────────────

export const CONTEXT_QUERY = `
  query CatalogSyncContext {
    publications(first: 25) { nodes { id name } }
    locations(first: 10) { nodes { id isPrimary } }
    collections(first: 250) { nodes { id handle } }
    metafieldDefinitions(first: 50, ownerType: PRODUCT, namespace: "custom") {
      nodes { key type { name } capabilities { uniqueValues { enabled } } }
    }
  }`;

export interface SyncContext {
  publicationId: string;
  locationId: string;
  collectionIds: Map<string, string>; // handle → gid
  metaTypes: Record<MetaKey, string>;
}

interface ContextData {
  publications: { nodes: { id: string; name: string }[] };
  locations: { nodes: { id: string; isPrimary: boolean }[] };
  collections: { nodes: { id: string; handle: string }[] };
  metafieldDefinitions: {
    nodes: {
      key: string;
      type: { name: string };
      capabilities?: { uniqueValues?: { enabled: boolean } | null } | null;
    }[];
  };
}

export async function loadContext(fetch: AdminFetch, channel: string): Promise<SyncContext> {
  const d = await fetch<ContextData>({ query: CONTEXT_QUERY });
  const pub = d.publications.nodes.find(p => p.name === channel);
  if (!pub)
    throw new Error(
      `Sales channel "${channel}" not found. Available: ${d.publications.nodes.map(p => p.name).join(', ')}`
    );
  const loc = d.locations.nodes.find(l => l.isPrimary) ?? d.locations.nodes[0];
  if (!loc) throw new Error('No inventory location on the store');
  const metaTypes = { ...DEFAULT_META_TYPES };
  for (const def of d.metafieldDefinitions.nodes)
    if ((META_KEYS as readonly string[]).includes(def.key))
      metaTypes[def.key as MetaKey] = def.type.name;
  // Only entry_no is a per-product identity. "Unique values" on a shared field makes
  // the 2nd product with the same value fail (prod edition had it on, fixed 2026-11-22).
  const badUnique = d.metafieldDefinitions.nodes
    .filter(def => def.key !== 'entry_no' && (META_KEYS as readonly string[]).includes(def.key))
    .filter(def => def.capabilities?.uniqueValues?.enabled)
    .map(def => `custom.${def.key}`);
  if (badUnique.length)
    throw new Error(
      `${badUnique.join(', ')} has "Unique values" on, so only one product could use each value. ` +
        'Turn it off: Settings → Custom data → Products → the field → untick Unique values.'
    );
  return {
    publicationId: pub.id,
    locationId: loc.id,
    collectionIds: new Map(d.collections.nodes.map(c => [c.handle, c.id])),
    metaTypes,
  };
}

export const LIVE_PRODUCT_QUERY = `
  query CatalogSyncProduct($handle: String!) {
    productByIdentifier(identifier: { handle: $handle }) {
      id handle title descriptionHtml vendor status
      resourcePublicationsV2(first: 25, onlyPublished: false) { nodes { publication { id } } }
      options { name }
      variants(first: 100) {
        nodes {
          id price
          selectedOptions { name value }
          inventoryItem { measurement { weight { value unit } } }
        }
      }
      collections(first: 50) { nodes { id handle } }
      media(first: 100) { nodes { id ... on MediaImage { alt } } }
      syncMedia: metafield(namespace: "${SYNC_NAMESPACE}", key: "${SYNC_MEDIA_KEY}") { value }
      ${META_KEYS.map(k => `${k}: metafield(namespace: "custom", key: "${k}") { value }`).join('\n      ')}
    }
  }`;

export interface LiveProduct {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  vendor: string;
  status: string;
  /**
   * On the site channel, published OR staged. A DRAFT product publishes as staged
   * (isPublished=false) and Product.publishedOnPublication stays false until it's
   * ACTIVE, so that field would re-publish on every run (found on prod 2026-11-22).
   */
  publishedOnPublication: boolean;
  options: { name: string }[];
  variants: {
    nodes: {
      id: string;
      price: string;
      selectedOptions: { name: string; value: string }[];
      inventoryItem: {
        measurement: { weight: { value: number; unit: string } | null } | null;
      } | null;
    }[];
  };
  collections: { nodes: { id: string; handle: string }[] };
  media: { nodes: { id: string; alt?: string | null }[] };
  syncMedia: { value: string } | null;
  [meta: string]: unknown;
}

export async function fetchLive(
  fetch: AdminFetch,
  handle: string,
  ctx: SyncContext
): Promise<LiveProduct | null> {
  type Raw = Omit<LiveProduct, 'publishedOnPublication'> & {
    resourcePublicationsV2: { nodes: { publication: { id: string } }[] };
  };
  const d = await fetch<{ productByIdentifier: Raw | null }>({
    query: LIVE_PRODUCT_QUERY,
    variables: { handle },
  });
  const p = d.productByIdentifier;
  if (!p) return null;
  const { resourcePublicationsV2, ...rest } = p;
  return {
    ...rest,
    publishedOnPublication: resourcePublicationsV2.nodes.some(
      n => n.publication.id === ctx.publicationId
    ),
  } as LiveProduct;
}

// ─── Planning ───────────────────────────────────────────────────────────────

export interface PlanOptions {
  activate: boolean;
  /** Take over an archived product this sync never created (`--adopt <handle>`). */
  adopt?: boolean;
}

export interface ProductPlan {
  handle: string;
  action: 'create' | 'update' | 'unchanged' | 'error';
  changes: string[]; // what --apply will do
  notes: string[]; // kept / left alone, for the human
  productSet: { input: Record<string, unknown>; identifier?: Record<string, unknown> } | null;
  uploads: { file: ImageFile; alt: string }[];
  altUpdates: { id: string; alt: string; name: string }[];
  publish: boolean;
  mediaMap: Record<string, string>; // sha → media gid, as known before apply
  liveMediaIds: string[]; // every media id on the product before apply (incl. hand-added)
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Plain-text description → HTML: blank line = paragraph, single newline = <br>. */
export function descriptionToHtml(text: string): string {
  return text
    .trim()
    .split(/\n\s*\n/)
    .map(p => `<p>${esc(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

const OZ_PER: Record<string, number> = {
  OUNCES: 1,
  POUNDS: 16,
  GRAMS: 1 / 28.349523125,
  KILOGRAMS: 35.27396195,
};
const toOz = (w: { value: number; unit: string } | null | undefined) =>
  w ? w.value * (OZ_PER[w.unit] ?? NaN) : null;
const money = (n: number) => n.toFixed(2);
const sameHtml = (a: string, b: string) => a.replace(/\s+/g, '') === b.replace(/\s+/g, '');

function parseMediaMap(live: LiveProduct | null): Record<string, string> {
  if (!live?.syncMedia?.value) return {};
  try {
    const m = JSON.parse(live.syncMedia.value);
    return m && typeof m === 'object' && !Array.isArray(m) ? m : {};
  } catch {
    return {};
  }
}

export function planProduct(
  row: CatalogRow,
  images: ImageFile[],
  alts: Map<string, string> | undefined,
  live: LiveProduct | null,
  ctx: SyncContext,
  opts: PlanOptions
): ProductPlan {
  const plan: ProductPlan = {
    handle: row.handle,
    action: live ? 'update' : 'create',
    changes: [],
    notes: [],
    productSet: null,
    uploads: [],
    altUpdates: [],
    publish: false,
    mediaMap: parseMediaMap(live),
    liveMediaIds: live?.media.nodes.map(m => m.id) ?? [],
  };
  const fail = (m: string) => {
    plan.action = 'error';
    plan.changes = [];
    plan.notes.push(m);
    return plan;
  };

  // Archived + never synced = an old seed/test product. Updating it would revive
  // it with its old photos, sizes and collections still attached.
  if (live?.status === 'ARCHIVED' && !live.syncMedia?.value && !opts.adopt)
    return fail(
      `handle "${row.handle}" belongs to an old ARCHIVED product ("${live.title}") this sync never made — ` +
        `pick a different handle, or pass --adopt ${row.handle} to take it over (keeps its old photos/sizes)`
    );

  const missingCols = row.collections.filter(h => !ctx.collectionIds.has(h));
  if (missingCols.length)
    return fail(
      `collection(s) not on the store: ${missingCols.join(', ')} (create them in admin first)`
    );

  const optionName = row.sizes.length ? 'Size' : 'Title';
  const wanted = row.sizes.length ? row.sizes : ['Default Title'];
  const liveOption = live?.options[0]?.name;
  if (live && (live.options.length !== 1 || liveOption !== optionName))
    return fail(
      `live options are [${live.options.map(o => o.name).join(', ')}], CSV wants ${optionName} — change variant layout in admin`
    );

  const liveVariants = new Map(
    (live?.variants.nodes ?? []).map(v => [v.selectedOptions[0]?.value ?? '', v])
  );
  const html = descriptionToHtml(row.description);
  const metafields = META_KEYS.filter(k => row.metafields[k]).map(k => ({
    namespace: 'custom',
    key: k,
    type: ctx.metaTypes[k],
    value: row.metafields[k]!,
  }));
  const csvColIds = row.collections.map(h => ctx.collectionIds.get(h)!);
  const liveColIds = live?.collections.nodes.map(c => c.id) ?? [];
  const weight = { value: row.weightOz, unit: 'OUNCES' };

  // Variants: CSV sizes first (in CSV order), then live-only ones kept as-is.
  const variants: Record<string, unknown>[] = wanted.map((name, i) => {
    const lv = liveVariants.get(name);
    return {
      ...(lv ? { id: lv.id } : {}),
      optionValues: [{ optionName, name }],
      price: money(row.price),
      inventoryPolicy: 'DENY',
      inventoryItem: { tracked: true, requiresShipping: true, measurement: { weight } },
      ...(lv
        ? {}
        : {
            inventoryQuantities: [
              { locationId: ctx.locationId, name: 'available', quantity: row.inventory[i] },
            ],
          }),
    };
  });
  const liveOnly = [...liveVariants.keys()].filter(v => !wanted.includes(v));
  for (const name of liveOnly)
    variants.push({ id: liveVariants.get(name)!.id, optionValues: [{ optionName, name }] });

  const input: Record<string, unknown> = {
    handle: row.handle,
    title: row.title,
    descriptionHtml: html,
    vendor: row.vendor,
    productOptions: [
      { name: optionName, position: 1, values: [...wanted, ...liveOnly].map(name => ({ name })) },
    ],
    variants,
    metafields,
    collections: [...new Set([...liveColIds, ...csvColIds])],
  };

  if (!live) {
    input.status = opts.activate ? 'ACTIVE' : 'DRAFT';
    plan.productSet = { input };
    plan.changes.push(
      `create ${input.status} — ${wanted.length} variant(s) @ $${money(row.price)}, ${row.weightOz} oz, ` +
        `collections ${row.collections.join(', ') || '(none)'}, ${metafields.length} metafield(s)`
    );
  } else {
    const c = plan.changes;
    if (live.title !== row.title) c.push(`title "${live.title}" → "${row.title}"`);
    if (!sameHtml(live.descriptionHtml ?? '', html)) c.push('description changed');
    if (live.vendor !== row.vendor) c.push(`vendor "${live.vendor}" → "${row.vendor}"`);
    wanted.forEach((name, i) => {
      const lv = liveVariants.get(name);
      if (!lv)
        return c.push(`add ${optionName.toLowerCase()} ${name} (inventory ${row.inventory[i]})`);
      const label = row.sizes.length ? `${name} ` : '';
      if (Number(lv.price) !== Number(money(row.price)))
        c.push(`${label}price $${lv.price} → $${money(row.price)}`);
      const oz = toOz(lv.inventoryItem?.measurement?.weight);
      if (oz === null || Math.abs(oz - row.weightOz) > 0.01)
        c.push(
          `${label}weight ${oz === null ? 'none' : oz.toFixed(2) + ' oz'} → ${row.weightOz} oz`
        );
    });
    for (const m of metafields) {
      const cur = (live[m.key] as { value: string } | null)?.value ?? '';
      if (cur !== m.value) c.push(`custom.${m.key} "${cur}" → "${m.value}"`);
    }
    for (const h of row.collections)
      if (!live.collections.nodes.some(x => x.handle === h)) c.push(`add to collection ${h}`);
    if (opts.activate && live.status !== 'ACTIVE') {
      input.status = 'ACTIVE';
      c.push(`status ${live.status} → ACTIVE`);
    }
    if (c.length) plan.productSet = { input, identifier: { id: live.id } };

    if (liveOnly.length)
      plan.notes.push(`size(s) ${liveOnly.join(', ')} on Shopify but not in CSV — kept`);
    const extraCols = live.collections.nodes
      .filter(x => !row.collections.includes(x.handle))
      .map(x => x.handle);
    if (extraCols.length) plan.notes.push(`also in collection(s) ${extraCols.join(', ')} — kept`);
    if (live.status === 'ARCHIVED' && !opts.activate)
      plan.notes.push('product is ARCHIVED on Shopify — left archived');
  }

  // Images: matched by content hash, not file name, so renames are free.
  const liveMediaIds = new Set(live?.media.nodes.map(m => m.id) ?? []);
  const liveAlt = new Map(live?.media.nodes.map(m => [m.id, m.alt ?? '']) ?? []);
  for (const file of images) {
    const alt = alts?.get(file.name)?.trim() ?? '';
    const id = plan.mediaMap[file.sha];
    if (id && liveMediaIds.has(id)) {
      if ((liveAlt.get(id) ?? '') !== alt) plan.altUpdates.push({ id, alt, name: file.name });
    } else plan.uploads.push({ file, alt });
  }
  if (plan.uploads.length)
    plan.changes.push(
      `upload ${plan.uploads.length} image(s): ${plan.uploads.map(u => u.file.name).join(', ')}`
    );
  if (plan.altUpdates.length)
    plan.changes.push(`alt text on ${plan.altUpdates.map(a => a.name).join(', ')}`);
  const managed = new Set(Object.values(plan.mediaMap));
  const unmanaged = [...liveMediaIds].filter(id => !managed.has(id)).length;
  if (unmanaged) plan.notes.push(`${unmanaged} image(s) on Shopify not uploaded by sync — kept`);
  const localShas = new Set(images.map(i => i.sha));
  const gone = Object.entries(plan.mediaMap).filter(
    ([sha, id]) => !localShas.has(sha) && liveMediaIds.has(id)
  ).length;
  if (gone)
    plan.notes.push(
      `${gone} synced image(s) no longer in catalog/images — kept on Shopify (remove in admin)`
    );

  if (!live || !live.publishedOnPublication) {
    plan.publish = true;
    plan.changes.push('publish to site channel');
  }
  if (live && plan.changes.length === 0) plan.action = 'unchanged';
  return plan;
}

// ─── Apply ──────────────────────────────────────────────────────────────────

export const PRODUCT_SET_MUTATION = `
  mutation CatalogSyncProductSet($input: ProductSetInput!, $identifier: ProductSetIdentifiers) {
    productSet(input: $input, identifier: $identifier, synchronous: true) {
      product { id }
      userErrors { field message }
    }
  }`;

export const STAGED_UPLOAD_MUTATION = `
  mutation CatalogSyncStage($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets { url resourceUrl parameters { name value } }
      userErrors { field message }
    }
  }`;

/** productUpdate's `media` arg appends (productCreateMedia is deprecated in 2026-01). */
export const ADD_MEDIA_MUTATION = `
  mutation CatalogSyncAddMedia($product: ProductUpdateInput!, $media: [CreateMediaInput!]!) {
    productUpdate(product: $product, media: $media) {
      product { media(first: 250) { nodes { id } } }
      userErrors { field message }
    }
  }`;

export const FILE_UPDATE_MUTATION = `
  mutation CatalogSyncAlt($files: [FileUpdateInput!]!) {
    fileUpdate(files: $files) {
      userErrors { field message }
    }
  }`;

export const METAFIELDS_SET_MUTATION = `
  mutation CatalogSyncMediaMap($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      userErrors { field message }
    }
  }`;

export const PUBLISH_MUTATION = `
  mutation CatalogSyncPublish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      userErrors { field message }
    }
  }`;

export interface StagedTarget {
  url: string;
  resourceUrl: string;
  parameters: { name: string; value: string }[];
}
export type Uploader = (file: ImageFile, target: StagedTarget) => Promise<void>;

/** Real uploader: multipart POST of the bytes to the staged target. */
export const httpUploader: Uploader = async (file, target) => {
  const form = new FormData();
  for (const p of target.parameters) form.append(p.name, p.value);
  form.append(
    'file',
    new Blob([new Uint8Array(await file.read())], { type: file.mime }),
    file.name
  );
  const res = await fetch(target.url, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`staged upload of ${file.name} failed: HTTP ${res.status}`);
};

type UserErrors = { userErrors: { field?: string[] | null; message: string }[] };
function check(op: string, payload: UserErrors | null | undefined) {
  if (!payload) throw new Error(`${op}: empty response`);
  if (payload.userErrors.length)
    throw new Error(
      `${op}: ${payload.userErrors
        .map(e => (e.field?.length ? `${e.field.join('.')}: ${e.message}` : e.message))
        .join('; ')}`
    );
}

export function mediaMapMetafield(productId: string, map: Record<string, string>) {
  return {
    ownerId: productId,
    namespace: SYNC_NAMESPACE,
    key: SYNC_MEDIA_KEY,
    type: 'json',
    value: JSON.stringify(map),
  };
}

/** Execute one plan. Returns the product gid. Throws on the first userError. */
export async function applyPlan(
  fetch: AdminFetch,
  plan: ProductPlan,
  ctx: SyncContext,
  liveId: string | null,
  upload: Uploader = httpUploader
): Promise<string> {
  if (plan.action === 'error' || plan.action === 'unchanged') return liveId ?? '';
  let productId = liveId;

  if (plan.productSet) {
    const r = await fetch<{ productSet: UserErrors & { product: { id: string } | null } }>({
      query: PRODUCT_SET_MUTATION,
      variables: { input: plan.productSet.input, identifier: plan.productSet.identifier ?? null },
    });
    check(`productSet ${plan.handle}`, r.productSet);
    productId = r.productSet.product!.id;
  }
  if (!productId) throw new Error(`${plan.handle}: no product id`);

  const map = { ...plan.mediaMap };
  const seen = new Set(plan.liveMediaIds);
  for (const { file, alt } of plan.uploads) {
    const s = await fetch<{ stagedUploadsCreate: UserErrors & { stagedTargets: StagedTarget[] } }>({
      query: STAGED_UPLOAD_MUTATION,
      variables: {
        input: [
          {
            resource: 'IMAGE',
            filename: file.name,
            mimeType: file.mime,
            httpMethod: 'POST',
            fileSize: String(file.size),
          },
        ],
      },
    });
    check(`stagedUploadsCreate ${file.name}`, s.stagedUploadsCreate);
    const target = s.stagedUploadsCreate.stagedTargets[0];
    await upload(file, target);
    // One image per call so the new media id is unambiguous (the only id not seen before).
    const m = await fetch<{
      productUpdate: UserErrors & { product: { media: { nodes: { id: string }[] } } | null };
    }>({
      query: ADD_MEDIA_MUTATION,
      variables: {
        product: { id: productId },
        media: [{ originalSource: target.resourceUrl, alt, mediaContentType: 'IMAGE' }],
      },
    });
    check(`productUpdate media ${file.name}`, m.productUpdate);
    const fresh = m.productUpdate.product!.media.nodes.map(n => n.id).filter(id => !seen.has(id));
    if (fresh.length !== 1)
      throw new Error(`${plan.handle}: could not identify uploaded media for ${file.name}`);
    map[file.sha] = fresh[0];
    seen.add(fresh[0]);
    // Persist after every image: a crash mid-product must not re-upload on re-run.
    const w = await fetch<{ metafieldsSet: UserErrors }>({
      query: METAFIELDS_SET_MUTATION,
      variables: { metafields: [mediaMapMetafield(productId, map)] },
    });
    check('metafieldsSet media map', w.metafieldsSet);
  }

  if (plan.altUpdates.length) {
    const f = await fetch<{ fileUpdate: UserErrors }>({
      query: FILE_UPDATE_MUTATION,
      variables: { files: plan.altUpdates.map(({ id, alt }) => ({ id, alt })) },
    });
    check(`fileUpdate ${plan.handle}`, f.fileUpdate);
  }

  if (plan.publish) {
    const p = await fetch<{ publishablePublish: UserErrors }>({
      query: PUBLISH_MUTATION,
      variables: { id: productId, input: [{ publicationId: ctx.publicationId }] },
    });
    check(`publishablePublish ${plan.handle}`, p.publishablePublish);
  }
  return productId;
}
