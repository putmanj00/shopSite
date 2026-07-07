/**
 * Accessibility Testing Script
 *
 * Uses Playwright and axe-core to run automated WCAG 2.1 AA compliance tests.
 * Run with: npx ts-node scripts/accessibility-test.ts
 *
 * Prerequisites:
 * - npm install @axe-core/playwright playwright
 * - The dev server should be running on localhost:3000
 */

import { chromium, Browser, Page } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

interface A11yResult {
  url: string;
  violations: {
    id: string;
    impact: string;
    description: string;
    nodes: number;
  }[];
  passes: number;
  incomplete: number;
}

// Static content + buyer routes that render without live Shopify product data.
// Dynamic routes (/products/[handle], /collections/[handle], /blog/[slug],
// /legal/[slug]) are NOT listed here yet: they 404 until test products/posts are
// published. Add representative instances once route-discovery (QA plan W1) + the
// published test catalog land, so PDP/collection a11y get real coverage.
const PAGES_TO_TEST = [
  '/',
  '/collections/all',
  '/about',
  '/booth',
  '/our-story',
  '/history',
  '/contact',
  '/faq',
  '/shipping-returns',
  '/local',
  '/login',
  '/register',
  '/blog',
  '/wishlist',
];

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testPage(page: Page, url: string): Promise<A11yResult> {
  const fullUrl = `${BASE_URL}${url}`;
  console.log(`\nTesting: ${fullUrl}`);

  await page.goto(fullUrl, { waitUntil: 'networkidle' });

  const axeResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  return {
    url,
    violations: axeResults.violations.map((v) => ({
      id: v.id,
      impact: v.impact || 'unknown',
      description: v.description,
      nodes: v.nodes.length,
    })),
    passes: axeResults.passes.length,
    incomplete: axeResults.incomplete.length,
  };
}

async function runAccessibilityTests(): Promise<void> {
  console.log('🔍 Starting Accessibility Tests (WCAG 2.1 AA)\n');
  console.log('=' .repeat(60));

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const results: A11yResult[] = [];
    let totalViolations = 0;
    let criticalViolations = 0;

    for (const url of PAGES_TO_TEST) {
      try {
        const result = await testPage(page, url);
        results.push(result);

        const violations = result.violations;
        totalViolations += violations.length;

        const critical = violations.filter(
          (v) => v.impact === 'critical' || v.impact === 'serious'
        );
        criticalViolations += critical.length;

        if (violations.length === 0) {
          console.log(`✅ ${url}: No violations found`);
        } else {
          console.log(`❌ ${url}: ${violations.length} violation(s) found`);
          violations.forEach((v) => {
            const icon = v.impact === 'critical' || v.impact === 'serious' ? '🔴' : '🟡';
            console.log(`   ${icon} [${v.impact}] ${v.id}: ${v.description}`);
          });
        }

        console.log(`   Passes: ${result.passes}, Incomplete: ${result.incomplete}`);
      } catch (error) {
        console.log(`⚠️  ${url}: Could not test - ${error}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary');
    console.log('='.repeat(60));
    console.log(`Pages tested: ${results.length}`);
    console.log(`Total violations: ${totalViolations}`);
    console.log(`Critical/Serious violations: ${criticalViolations}`);

    if (criticalViolations > 0) {
      console.log('\n❌ FAIL: Critical accessibility violations found');
      process.exit(1);
    } else if (totalViolations > 0) {
      console.log('\n⚠️  WARN: Minor accessibility violations found');
      process.exit(0);
    } else {
      console.log('\n✅ PASS: No accessibility violations found');
      process.exit(0);
    }
  } catch (error) {
    console.error('Failed to run accessibility tests:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runAccessibilityTests();
