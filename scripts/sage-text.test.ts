/**
 * Guard: plain `text-sage` (#7B8B6F) is 3.1:1 on parchment — fails WCAG AA for
 * body text. Text must use `text-sage-ink`; `text-sage` is for icons only.
 * Run: npm run test:sage-text
 *
 * CI fixtures (1 photo, no compare-at price) never render the gallery counter
 * or strike-through price, so the axe e2e missed this; prod @smoke caught it.
 *
 * simple: flags a className holding text-sage + a font-size class (text-xs…3xl);
 * upgrade to a rendered axe check on a multi-image fixture if the CI store gets one.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap(f => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.tsx') ? [p] : [];
  });
}

export function sageTextHits(src: string): string[] {
  const hits: string[] = [];
  for (const m of src.matchAll(/className=\{?[`'"]([^`'"]*)[`'"]/g)) {
    const cls = m[1].split(/\s+/);
    const sage = cls.includes('text-sage');
    const sized = cls.some(c => /^text-(xs|sm|base|lg|xl|[2-9]xl)$/.test(c));
    // A disabled control (cursor-not-allowed) is exempt from WCAG contrast.
    if (sage && sized && !cls.includes('cursor-not-allowed')) hits.push(m[1]);
  }
  return hits;
}

// Self-test of the matcher.
assert.deepEqual(sageTextHits(`<p className="text-center text-sm text-sage">`), ['text-center text-sm text-sage']);
assert.deepEqual(sageTextHits(`<p className="text-sm text-sage-ink">`), []);
assert.deepEqual(sageTextHits(`<svg className="w-5 h-5 text-sage">`), []);

const offenders = ['app', 'components']
  .flatMap(d => walk(d))
  .flatMap(f => sageTextHits(readFileSync(f, 'utf8')).map(c => `${f}: "${c}"`));
if (offenders.length) {
  console.error(`❌ text-sage used for text (use text-sage-ink):\n  ${offenders.join('\n  ')}`);
  process.exit(1);
}
console.log('✅ no low-contrast text-sage text');
