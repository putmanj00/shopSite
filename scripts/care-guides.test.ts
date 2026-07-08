/**
 * Focused guard for the care-guides route wiring (dead-link regression).
 *
 * Pure logic assertions (no DOM / server) — mirrors the self-contained tsx
 * style of product-entry.test.ts. Run: npm run test:care
 *
 * Guards the contract that a category `careInfoUrl` points at the REAL
 * /care-guides route (plural) and at an anchor the page actually renders.
 * The bug this fixes was `/care-guide#leather` (singular → 404); this test
 * fails if that typo — or a link to a nonexistent anchor — comes back.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { categoryFilterConfigs } from '../lib/category-filters';

const CARE_ROUTE = '/care-guides';

// Anchor ids the page defines, read straight from source so the two can't drift.
const pageSrc = readFileSync(join(__dirname, '../app/care-guides/page.tsx'), 'utf8');
const pageAnchorIds = new Set(
  Array.from(pageSrc.matchAll(/id="([\w-]+)"/g)).map((m) => m[1])
);

let passed = 0;

// 1. Every careInfoUrl points at the plural /care-guides route (no singular 404).
for (const [handle, config] of Object.entries(categoryFilterConfigs)) {
  const url = config.careInfoUrl;
  if (!url) continue;
  assert.ok(
    url.startsWith(`${CARE_ROUTE}#`) || url === CARE_ROUTE,
    `careInfoUrl for "${handle}" must target ${CARE_ROUTE}, got "${url}"`,
  );
  assert.ok(
    !/\/care-guide(#|$)/.test(url),
    `careInfoUrl for "${handle}" uses the dead singular /care-guide: "${url}"`,
  );

  // 2. Any anchor referenced must exist on the care-guides page.
  const hashIndex = url.indexOf('#');
  if (hashIndex !== -1) {
    const anchor = url.slice(hashIndex + 1);
    assert.ok(
      pageAnchorIds.has(anchor),
      `careInfoUrl for "${handle}" targets #${anchor}, which the care-guides page does not render`,
    );
  }
  passed++;
}

// 3. Sanity: the leather link (the one we fixed) is present and correct.
assert.equal(categoryFilterConfigs.leather?.careInfoUrl, `${CARE_ROUTE}#leather`);
assert.ok(pageAnchorIds.has('leather'));
assert.ok(pageAnchorIds.has('tie-dye'));
assert.ok(pageAnchorIds.has('jewelry'));
passed++;

console.log(`✅ care-guides link wiring: ${passed} assertions passed`);
