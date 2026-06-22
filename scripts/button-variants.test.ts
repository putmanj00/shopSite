/**
 * Focused check for the shared <Button> class builder.
 *
 * Pure class-string assertions (no DOM / React) — mirrors the self-contained
 * tsx style of color-contrast-checker.ts. Run: npm run test:button
 *
 * Guards the behavioral contract that matters for accessibility: the default
 * CTA surface is the AA-passing primary-600 token, never terracotta/primary-500.
 */
import assert from 'node:assert/strict';
import { buttonClasses } from '../components/ui/button-variants';

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

const has = (cls: string, token: string) => cls.split(/\s+/).includes(token);

check('default variant is the AA primary-600 surface', () => {
  const cls = buttonClasses();
  assert.ok(has(cls, 'bg-primary-600'), 'expected bg-primary-600');
  assert.ok(has(cls, 'text-white'), 'expected text-white');
  assert.ok(has(cls, 'hover:bg-primary-700'), 'expected hover:bg-primary-700');
});

check('never emits the failing terracotta / primary-500 surface', () => {
  for (const v of ['primary', 'secondary', 'outline'] as const) {
    const cls = buttonClasses({ variant: v });
    assert.ok(!has(cls, 'bg-terracotta'), `${v} must not use bg-terracotta`);
    assert.ok(!has(cls, 'bg-primary-500'), `${v} must not use bg-primary-500`);
  }
});

check('outline variant uses primary-700 text on a primary-600 border', () => {
  const cls = buttonClasses({ variant: 'outline' });
  assert.ok(has(cls, 'border-primary-600'), 'expected border-primary-600');
  assert.ok(has(cls, 'text-primary-700'), 'expected text-primary-700');
});

check('secondary variant uses the forest surface', () => {
  const cls = buttonClasses({ variant: 'secondary' });
  assert.ok(has(cls, 'bg-forest'), 'expected bg-forest');
  assert.ok(has(cls, 'text-cream'), 'expected text-cream');
});

check('size sm/md/lg emit distinct padding scales', () => {
  assert.ok(has(buttonClasses({ size: 'sm' }), 'text-sm'));
  assert.ok(has(buttonClasses({ size: 'md' }), 'text-base'));
  assert.ok(has(buttonClasses({ size: 'lg' }), 'text-lg'));
  assert.ok(has(buttonClasses({ size: 'sm' }), 'px-3'));
  assert.ok(has(buttonClasses({ size: 'lg' }), 'px-8'));
});

check('fullWidth adds w-full only when set', () => {
  assert.ok(has(buttonClasses({ fullWidth: true }), 'w-full'));
  assert.ok(!has(buttonClasses({ fullWidth: false }), 'w-full'));
});

check('className passthrough is appended', () => {
  const cls = buttonClasses({ className: '!bg-neutral-300 cursor-wait' });
  assert.ok(has(cls, '!bg-neutral-300'));
  assert.ok(has(cls, 'cursor-wait'));
});

check('base always carries focus-visible ring, active + disabled affordances', () => {
  const cls = buttonClasses();
  assert.ok(has(cls, 'focus-visible:ring-2'), 'expected focus-visible:ring-2');
  assert.ok(has(cls, 'focus-visible:ring-primary-600'), 'expected ring color');
  assert.ok(has(cls, 'active:scale-95'), 'expected active:scale-95');
  assert.ok(has(cls, 'disabled:opacity-50'), 'expected disabled:opacity-50');
});

console.log(`\n${failures === 0 ? 'PASS' : 'FAIL'} — ${failures} failing check(s)`);
process.exit(failures === 0 ? 0 : 1);
