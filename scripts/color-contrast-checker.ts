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

// Design system colors from globals.css
const colors = {
  // Primary: Deep Indigo
  'primary-50': '#eef2f7',
  'primary-100': '#d5dfe9',
  'primary-200': '#b3c4d6',
  'primary-300': '#8ba4bf',
  'primary-400': '#5c7a9a',
  'primary-500': '#2e4a62',
  'primary-600': '#263d51',
  'primary-700': '#1e3040',
  'primary-800': '#16232f',
  'primary-900': '#0e161e',

  // Secondary: Warm Terracotta
  'secondary-50': '#fdf5f3',
  'secondary-100': '#fae8e2',
  'secondary-200': '#f4cec1',
  'secondary-300': '#eab199',
  'secondary-400': '#d99478',
  'secondary-500': '#c4785e',
  'secondary-600': '#a3604a',
  'secondary-700': '#824a3a',
  'secondary-800': '#61362b',
  'secondary-900': '#40241c',

  // Accent: Vibrant Coral
  'accent-50': '#fef4f2',
  'accent-100': '#fce5e0',
  'accent-200': '#f9c7bd',
  'accent-300': '#f4a191',
  'accent-400': '#ea8472',
  'accent-500': '#e07a5f',
  'accent-600': '#c45a40',
  'accent-700': '#a34532',
  'accent-800': '#823526',
  'accent-900': '#61261b',

  // Neutrals (WCAG AA compliant)
  'neutral-50': '#fdfcfa',
  'neutral-100': '#f9f7f4',
  'neutral-200': '#f2ede6',
  'neutral-300': '#e5ddd2',
  'neutral-400': '#8a7e6d',  // Darkened for 3:1 UI component contrast
  'neutral-500': '#746959',
  'neutral-600': '#5c5347',  // Darkened to meet 4.5:1 for muted text
  'neutral-700': '#4a4238',
  'neutral-800': '#3a332c',
  'neutral-900': '#2d2822',

  // Semantic (WCAG AA compliant)
  success: '#2e7d32',
  warning: '#b45309',  // Darkened for 4.5:1 contrast
  error: '#d32f2f',
  info: '#0369a1',     // Darkened for 4.5:1 contrast

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
  // Primary text on backgrounds
  {
    name: 'Body text on light background',
    foreground: 'neutral-900',
    background: 'neutral-50',
    usage: 'Default body text',
  },
  {
    name: 'Muted text on light background',
    foreground: 'neutral-600',
    background: 'neutral-50',
    usage: 'Secondary/muted text',
  },
  {
    name: 'Primary button text',
    foreground: 'white',
    background: 'primary-500',
    usage: 'Primary CTA buttons',
  },
  {
    name: 'Primary button text (hover)',
    foreground: 'white',
    background: 'primary-600',
    usage: 'Primary CTA buttons on hover',
  },
  {
    name: 'Secondary button text',
    foreground: 'white',
    background: 'secondary-600',
    usage: 'Secondary buttons (use -600 for white text)',
  },
  {
    name: 'Accent button text',
    foreground: 'white',
    background: 'accent-700',
    usage: 'Accent/sale buttons (use -700 for white text)',
  },

  // Footer colors
  {
    name: 'Footer heading text',
    foreground: 'neutral-300',
    background: 'primary-900',
    usage: 'Footer section headings',
  },
  {
    name: 'Footer link text',
    foreground: 'neutral-400',
    background: 'primary-900',
    usage: 'Footer navigation links',
  },
  {
    name: 'Footer brand text',
    foreground: 'white',
    background: 'primary-900',
    usage: 'Footer brand name',
  },

  // Dark mode
  {
    name: 'Dark mode body text',
    foreground: 'neutral-100',
    background: 'neutral-900',
    usage: 'Body text in dark mode',
  },
  {
    name: 'Dark mode muted text',
    foreground: 'neutral-300',
    background: 'neutral-900',
    usage: 'Muted text in dark mode (use neutral-300 minimum)',
  },

  // Status colors
  {
    name: 'Success text on light',
    foreground: 'success',
    background: 'white',
    usage: 'Success messages',
  },
  {
    name: 'Error text on light',
    foreground: 'error',
    background: 'white',
    usage: 'Error messages',
  },
  {
    name: 'Warning text on light',
    foreground: 'warning',
    background: 'white',
    usage: 'Warning messages',
  },
  {
    name: 'Info text on light',
    foreground: 'info',
    background: 'white',
    usage: 'Info messages',
  },

  // UI Components (3:1 minimum)
  {
    name: 'Focus ring on light',
    foreground: 'primary-500',
    background: 'white',
    usage: 'Focus indicator',
    isUIComponent: true,
  },
  {
    name: 'Input border',
    foreground: 'neutral-400',
    background: 'white',
    usage: 'Form input borders',
    isUIComponent: true,
  },

  // Large text (3:1 minimum)
  {
    name: 'Hero heading on light',
    foreground: 'primary-700',
    background: 'neutral-50',
    usage: 'Large hero headings',
    isLargeText: true,
  },
];

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

  let passCount = 0;
  let failCount = 0;
  const failures: string[] = [];

  for (const combo of colorCombinations) {
    const fgHex = getColorValue(combo.foreground);
    const bgHex = getColorValue(combo.background);
    const ratio = getContrastRatio(fgHex, bgHex);
    const required = getRequiredRatio(combo.isLargeText, combo.isUIComponent);
    const passes = ratio >= required;

    const icon = passes ? '✅' : '❌';
    const status = passes ? 'PASS' : 'FAIL';
    const type = combo.isLargeText ? '(large text)' : combo.isUIComponent ? '(UI component)' : '(normal text)';

    console.log(`\n${icon} ${combo.name} ${type}`);
    console.log(`   ${combo.foreground} on ${combo.background}`);
    console.log(`   Contrast: ${formatRatio(ratio)} (required: ${formatRatio(required)})`);
    console.log(`   Usage: ${combo.usage}`);
    console.log(`   Status: ${status}`);

    if (passes) {
      passCount++;
    } else {
      failCount++;
      failures.push(`${combo.name}: ${formatRatio(ratio)} (need ${formatRatio(required)})`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 Summary');
  console.log('='.repeat(70));
  console.log(`Total combinations checked: ${colorCombinations.length}`);
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);

  if (failCount > 0) {
    console.log('\n❌ FAIL: The following color combinations do not meet WCAG 2.1 AA:');
    failures.forEach((f) => console.log(`   - ${f}`));
    process.exit(1);
  } else {
    console.log('\n✅ PASS: All color combinations meet WCAG 2.1 AA contrast requirements');
    process.exit(0);
  }
}

// Run the checker
checkContrast();
