/**
 * Color Contrast Checker Script
 *
 * Validates that color combinations in the design system meet WCAG 2.1 AA requirements.
 * Run with: npx ts-node scripts/color-contrast-checker.ts
 *
 * WCAG 2.1 AA Requirements:
 * - Normal text (< 18pt or < 14pt bold): 4.5:1 contrast ratio
 * - Large text (≥ 18pt or ≥ 14pt bold): 3:1 contrast ratio
 * - UI components and graphics: 3:1 contrast ratio
 */

// Design system colors — mirrored from app/globals.css (Open Field / field-journal palette).
// Keep in sync with the `--color-*` custom properties there.
const colors = {
  // Primary: Terracotta scale (--color-primary-*)
  'primary-50': '#fdf5f0',
  'primary-100': '#fae8db',
  'primary-200': '#f3ccb0',
  'primary-300': '#e6a97a',
  'primary-400': '#d98a4f',
  'primary-500': '#C8642A',
  'primary-600': '#b05523',
  'primary-700': '#8f441c',
  'primary-800': '#6e3415',
  'primary-900': '#4d250f',

  // Neutrals (warm stone, --color-neutral-*)
  'neutral-50': '#FDF8F3',
  'neutral-100': '#faf5ef',
  'neutral-200': '#f5ede4',
  'neutral-300': '#e7ddd1',
  'neutral-400': '#a8a29e',
  'neutral-500': '#78716C',
  'neutral-600': '#57534e',
  'neutral-700': '#44403c',
  'neutral-800': '#292524',
  'neutral-900': '#1C1917',

  // Named brand tokens (--color-*)
  parchment: '#F5EDD6',   // page background (--background)
  cream: '#FFFDF5',       // card surfaces
  terracotta: '#C8642A',  // links / primary accent
  gold: '#C9A642',        // dividers / decorative accent
  sage: '#7B8B6F',        // muted botanical detail
  forest: '#1E3B30',      // Deep Woods dark surfaces (never pure black)
  'dusty-rose': '#D08B7A',
  'gold-ink': '#786222',  // gold as text on light grounds (--color-gold-ink, ≥4.6:1 on parchment/cream)
  'ink-brown': '#5C4033', // body text (--foreground)
  earth: '#3B2F2F',

  // Semantic (--color-success/warning/error/info)
  success: '#4d6b43',
  warning: '#b05523',
  error: '#dc2626',
  info: '#1E3B30',

  // Common
  white: '#ffffff',
  black: '#000000',
};

// Common color combinations used in the design system
const colorCombinations: Array<{
  name: string;
  foreground: string;
  background: string;
  usage: string;
  isLargeText?: boolean;
  isUIComponent?: boolean;
}> = [
  // Body / text on the parchment page + cream cards
  {
    name: 'Body text on parchment',
    foreground: 'ink-brown',
    background: 'parchment',
    usage: 'Default body text (--foreground on --background)',
  },
  {
    name: 'Body text on cream card',
    foreground: 'ink-brown',
    background: 'cream',
    usage: 'Body text inside cards',
  },
  {
    name: 'Muted text on muted background',
    foreground: 'neutral-600',
    background: 'neutral-100',
    usage: 'Secondary/muted text (--foreground-muted on --background-muted)',
  },
  {
    name: 'Inline link on parchment',
    foreground: 'primary-700',
    background: 'parchment',
    usage: 'Inline links / accent text (darkened to primary-700)',
  },

  // Buttons (text-white in code)
  {
    name: 'Primary button text (primary-600)',
    foreground: 'white',
    background: 'primary-600',
    usage: 'bg-primary-600 — the shared <Button> CTA surface (all buttons)',
  },
  {
    name: 'Badge text on terracotta',
    foreground: 'white',
    background: 'primary-600',
    usage: 'Small count/sale/tag pills (header cart count, blog tags, sale badge, active pagination) — recolored to bg-primary-600 in S7 so white labels clear AA',
  },
  {
    name: 'Forest button text',
    foreground: 'white',
    background: 'forest',
    usage: 'Deep Woods / dark CTA buttons',
  },

  // Deep Woods (forest) dark surfaces — footer, hero overlay, dark sections
  {
    name: 'Heading on forest surface',
    foreground: 'cream',
    background: 'forest',
    usage: 'Headings on dark forest sections',
  },
  {
    name: 'Body on forest surface',
    foreground: 'neutral-200',
    background: 'forest',
    usage: 'Body copy on dark forest sections',
  },
  {
    name: 'Gold accent on forest',
    foreground: 'gold',
    background: 'forest',
    usage: 'Decorative gold headings/rules on dark (large only)',
    isLargeText: true,
  },

  // Status colors on cards
  {
    name: 'Success text on cream',
    foreground: 'success',
    background: 'cream',
    usage: 'Success messages',
  },
  {
    name: 'Error text on cream',
    foreground: 'error',
    background: 'cream',
    usage: 'Error messages',
  },
  {
    name: 'Warning text on cream',
    foreground: 'warning',
    background: 'cream',
    usage: 'Warning messages',
  },
  {
    name: 'Info text on cream',
    foreground: 'info',
    background: 'cream',
    usage: 'Info messages',
  },

  // UI Components (3:1 minimum)
  {
    name: 'Focus ring on parchment',
    foreground: 'primary-600',
    background: 'parchment',
    usage: 'Focus indicator (--focus-ring-color)',
    isUIComponent: true,
  },
  // NOTE (S7): "Input border on cream" (neutral-400) was removed — no element in
  // app/ or components/ ever used `border-neutral-400`; it was a phantom row. Real
  // brand inputs use a decorative gold hairline (`border-gold/30`) and are identified
  // by their cream/white fill on the parchment page + a visible label + a
  // `focus:ring-terracotta` focus indicator, so the resting border is exempt under
  // WCAG 1.4.11 (not the sole means of identifying the field). Off-brand
  // `border-gray-300` inputs on account/admin/CRO pages are outside the Open-Field
  // design-system palette this checker covers and are tracked as separate cleanup.
  //
  // NOTE (S7): decorative gold dividers/rules (the `.catalog-label` bottom rule,
  // section `border-gold/xx` hairlines) are purely decorative and WCAG-exempt, so
  // they are not asserted. The row below instead asserts the real light-ground gold
  // TEXT token (`gold-ink`) that eyebrow labels must use — a tripwire so any gold
  // label on a light ground stays at AA.
  {
    name: 'Gold label text on parchment',
    foreground: 'gold-ink',
    background: 'parchment',
    usage: 'Eyebrow/label gold text on light grounds — must use --color-gold-ink (NOT raw text-gold, which is dark-ground only)',
  },

  // Large text (3:1 minimum)
  {
    name: 'Hero heading on parchment',
    foreground: 'forest',
    background: 'parchment',
    usage: 'Large hero / section headings',
    isLargeText: true,
  },
];

/**
 * Known brand-contrast debt, accepted PENDING DESIGN TRIAGE (James).
 *
 * EMPTY as of S7 (2026-07-08): all three prior debts were retired for real —
 *   - Badge pills recolored bg-terracotta → bg-primary-600 (white labels now 5.04:1);
 *   - the phantom neutral-400 input-border row was removed (nothing used it; real
 *     decorative hairlines are WCAG 1.4.11-exempt);
 *   - the gold-on-parchment row was repurposed to assert the real light-ground text
 *     token (gold-ink) and the two real `text-gold`-on-light usages were fixed.
 * The build now runs with CONTRAST_STRICT=1, so this map must stay empty — any new
 * pairing added here would silently un-gate the build. Fix the color, don't except it.
 */
const ACCEPTED_EXCEPTIONS: Record<string, string> = {};

/**
 * Parses a hex color string to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Calculates relative luminance of a color
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);

  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates contrast ratio between two colors
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Gets the hex value for a color name
 */
function getColorValue(colorName: string): string {
  const color = colors[colorName as keyof typeof colors];
  if (!color) {
    throw new Error(`Unknown color: ${colorName}`);
  }
  return color;
}

/**
 * Formats contrast ratio for display
 */
function formatRatio(ratio: number): string {
  return ratio.toFixed(2) + ':1';
}

/**
 * Gets the required contrast ratio based on usage
 */
function getRequiredRatio(isLargeText?: boolean, isUIComponent?: boolean): number {
  if (isLargeText || isUIComponent) {
    return 3.0; // WCAG AA for large text and UI components
  }
  return 4.5; // WCAG AA for normal text
}

/**
 * Main contrast checking function
 */
function checkContrast(): void {
  console.log('🎨 Color Contrast Checker (WCAG 2.1 AA)\n');
  console.log('='.repeat(70));

  const strict = process.env.CONTRAST_STRICT === '1';

  let passCount = 0;
  const regressions: string[] = [];        // unexpected failures — break the build
  const acceptedFails: string[] = [];       // known brand debt — warn only (unless strict)

  for (const combo of colorCombinations) {
    const fgHex = getColorValue(combo.foreground);
    const bgHex = getColorValue(combo.background);
    const ratio = getContrastRatio(fgHex, bgHex);
    const required = getRequiredRatio(combo.isLargeText, combo.isUIComponent);
    const passes = ratio >= required;
    const accepted = combo.name in ACCEPTED_EXCEPTIONS;

    const icon = passes ? '✅' : accepted ? '⚠️ ' : '❌';
    const status = passes ? 'PASS' : accepted ? 'KNOWN EXCEPTION' : 'FAIL';
    const type = combo.isLargeText ? '(large text)' : combo.isUIComponent ? '(UI component)' : '(normal text)';

    console.log(`\n${icon} ${combo.name} ${type}`);
    console.log(`   ${combo.foreground} on ${combo.background}`);
    console.log(`   Contrast: ${formatRatio(ratio)} (required: ${formatRatio(required)})`);
    console.log(`   Usage: ${combo.usage}`);
    console.log(`   Status: ${status}`);
    if (!passes && accepted) {
      console.log(`   Triage: ${ACCEPTED_EXCEPTIONS[combo.name]}`);
    }

    if (passes) {
      passCount++;
    } else if (accepted) {
      acceptedFails.push(`${combo.name}: ${formatRatio(ratio)} (need ${formatRatio(required)})`);
    } else {
      regressions.push(`${combo.name}: ${formatRatio(ratio)} (need ${formatRatio(required)})`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 Summary');
  console.log('='.repeat(70));
  console.log(`Total combinations checked: ${colorCombinations.length}`);
  console.log(`Passed: ${passCount}`);
  console.log(`Known exceptions (brand debt, pending triage): ${acceptedFails.length}`);
  console.log(`Regressions: ${regressions.length}`);

  if (acceptedFails.length > 0) {
    console.log('\n⚠️  KNOWN EXCEPTIONS — accepted brand-contrast debt (see ACCEPTED_EXCEPTIONS):');
    acceptedFails.forEach((f) => console.log(`   - ${f}`));
    if (!strict) {
      console.log('   (warn-only; run CONTRAST_STRICT=1 to enforce these too)');
    }
  }

  const hardFails = regressions.length + (strict ? acceptedFails.length : 0);
  if (regressions.length > 0) {
    console.log('\n❌ REGRESSION: unexpected WCAG 2.1 AA failures (not in the accepted list):');
    regressions.forEach((f) => console.log(`   - ${f}`));
  }

  if (hardFails > 0) {
    console.log(`\n❌ FAIL: ${hardFails} contrast failure(s) must be resolved.`);
    process.exit(1);
  }
  console.log('\n✅ PASS: no contrast regressions (known brand exceptions excluded).');
  process.exit(0);
}

// Run the checker
checkContrast();
