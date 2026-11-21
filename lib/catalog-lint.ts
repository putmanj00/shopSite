/**
 * Catalog lint — pure checks over Admin API product/collection data.
 *
 * No I/O here: scripts/catalog-lint.ts fetches and renders; this module only
 * decides what is wrong, so it can be unit-tested (scripts/catalog-lint.test.ts).
 *
 * Severity:
 *   error — breaks or embarrasses a live page (blocks "ready to activate")
 *   warn  — should fix before launch, page still works
 */
import { isTestProduct, normalizeVendor } from './product-filters';

export const REQUIRED_METAFIELDS = ['entry_no', 'edition', 'technique', 'maker'] as const;
export const OPTIONAL_METAFIELDS = ['gathered'] as const;
export const MIN_IMAGES = 3;
export const MIN_DESCRIPTION_CHARS = 80;
/** Launch categories — hardcoded in components/homepage/category-cards.tsx. */
export const LAUNCH_COLLECTIONS = ['tie-dye', 'leather', 'jewelry', 'crystals', 'artwork'] as const;

const PLACEHOLDER_DESCRIPTION = /lorem ipsum|placeholder|\btodo\b|\btbd\b|coming soon|description here/i;

export type Severity = 'error' | 'warn';
export interface Issue {
  severity: Severity;
  message: string;
}

export interface LintProduct {
  handle: string;
  title: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | string;
  vendor: string;
  tags: string[];
  description: string; // plain text
  images: { alt: string | null }[];
  prices: number[]; // one per variant
  // One per variant: packed shipping weight (any unit), or null when the
  // variant does not require shipping. Checkout rates are calculated from it.
  weights: (number | null)[];
  collections: string[]; // handles
  metafields: Record<string, string | null | undefined>;
  onSiteChannel: boolean; // published to the storefront's sales channel
}

export interface LintCollection {
  handle: string;
  title: string;
  onSiteChannel: boolean;
}

export function isTestLike(p: Pick<LintProduct, 'title' | 'tags'>): boolean {
  return isTestProduct(p) || p.tags.some((t) => t.toLowerCase() === 'test-product');
}

/** Shoppers can see it: active AND on the storefront channel. */
export function isLive(p: Pick<LintProduct, 'status' | 'onSiteChannel'>): boolean {
  return p.status === 'ACTIVE' && p.onSiteChannel;
}

export function lintProduct(p: LintProduct): Issue[] {
  const issues: Issue[] = [];
  const err = (message: string) => issues.push({ severity: 'error', message });
  const warn = (message: string) => issues.push({ severity: 'warn', message });

  if (isTestLike(p)) {
    if (isLive(p)) err('test/placeholder product is LIVE on the site — archive or unpublish it');
    return issues; // nothing else matters for a test product
  }

  if (p.status === 'ACTIVE' && !p.onSiteChannel) {
    err('active but not published to the site channel — invisible to shoppers');
  }

  if (p.images.length === 0) err('no images (product is hidden from grids without one)');
  else if (p.images.length < MIN_IMAGES) warn(`${p.images.length} image(s) — want ≥${MIN_IMAGES}`);
  const missingAlt = p.images.filter((i) => !i.alt || !i.alt.trim()).length;
  if (missingAlt > 0) warn(`${missingAlt} image(s) missing alt text`);

  const desc = p.description.trim();
  if (!desc) err('no description');
  else if (PLACEHOLDER_DESCRIPTION.test(desc)) err('description looks like placeholder text');
  else if (desc.length < MIN_DESCRIPTION_CHARS)
    warn(`description is short (${desc.length} chars, want ≥${MIN_DESCRIPTION_CHARS})`);

  if (p.prices.length === 0) err('no variants');
  else if (p.prices.some((x) => !(x > 0))) err('a variant has price $0 or missing');
  if (p.weights.some((w) => w !== null && !(w > 0)))
    err('a variant has no shipping weight — checkout would quote the wrong shipping rate');

  if (p.collections.length === 0) warn('not in any collection — only reachable from search / All');

  const missingMeta = REQUIRED_METAFIELDS.filter((k) => !p.metafields[k]?.toString().trim());
  if (missingMeta.length > 0) warn(`missing metafields: ${missingMeta.map((k) => `custom.${k}`).join(', ')}`);

  if (normalizeVendor(p.vendor) !== p.vendor) {
    warn(`vendor is "${p.vendor}" (site displays "${normalizeVendor(p.vendor)}") — set it to Wildenflower`);
  } else if (p.vendor !== 'Wildenflower') {
    warn(`vendor is "${p.vendor}", expected "Wildenflower"`);
  }

  return issues;
}

export interface CollectionFinding {
  handle: string;
  message: string;
}

export function lintCollections(
  collections: LintCollection[],
  products: LintProduct[],
): CollectionFinding[] {
  const findings: CollectionFinding[] = [];
  const byHandle = new Map(collections.map((c) => [c.handle, c]));

  for (const handle of LAUNCH_COLLECTIONS) {
    const c = byHandle.get(handle);
    if (!c) findings.push({ handle, message: 'launch category collection does not exist — homepage card 404s' });
    else if (!c.onSiteChannel) findings.push({ handle, message: 'launch category not published to the site channel' });
  }

  for (const c of collections) {
    const live = products.filter((p) => isLive(p) && !isTestLike(p) && p.collections.includes(c.handle));
    if (live.length === 0) findings.push({ handle: c.handle, message: 'no live products — page renders empty' });
  }
  return findings;
}

/** Handles of non-archived products whose title another non-archived product shares. */
export function duplicateTitleHandles(products: LintProduct[]): Set<string> {
  const byTitle = new Map<string, string[]>();
  for (const p of products) {
    if (p.status === 'ARCHIVED' || isTestLike(p)) continue;
    const key = p.title.trim().toLowerCase().replace(/\s+\d+$/, ''); // "Print 1" ≈ "Print"
    byTitle.set(key, [...(byTitle.get(key) ?? []), p.handle]);
  }
  return new Set([...byTitle.values()].filter((hs) => hs.length > 1).flat());
}

/** Issue messages with numbers stripped, counted — the report's "most common" summary. */
export function summarizeIssues(issueLists: Issue[][]): { message: string; severity: Severity; count: number }[] {
  const counts = new Map<string, { severity: Severity; count: number }>();
  for (const list of issueLists) {
    for (const i of list) {
      const message = i.message.replace(/"[^"]*"/g, '"…"').replace(/\d+/g, 'N');
      const prev = counts.get(message);
      counts.set(message, { severity: i.severity, count: (prev?.count ?? 0) + 1 });
    }
  }
  return [...counts.entries()]
    .map(([message, v]) => ({ message, ...v }))
    .sort((a, b) => (a.severity === b.severity ? b.count - a.count : a.severity === 'error' ? -1 : 1));
}
