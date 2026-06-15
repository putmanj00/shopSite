import { existsSync } from 'node:fs';
import path from 'node:path';

// Mirrors the either-or pairs lib/shopify.ts resolves at request time, so the
// suite fails fast with one clear error instead of 7 per-test timeouts.
const REQUIRED_ENV_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['SHOPIFY_STORE_DOMAIN', 'NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN'],
  [
    'SHOPIFY_STOREFRONT_ACCESS_TOKEN',
    'NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN',
  ],
];

export default function requireShopifyEnv(): void {
  const envFile = path.resolve(__dirname, '../../.env.local');
  if (existsSync(envFile)) {
    process.loadEnvFile(envFile);
  }

  const missing = REQUIRED_ENV_PAIRS.filter(
    ([primary, fallback]) => !process.env[primary] && !process.env[fallback],
  ).map(([primary]) => primary);

  if (missing.length > 0) {
    throw new Error(
      [
        `Shopify-backed E2E tests need storefront credentials; missing: ${missing.join(', ')}.`,
        'Copy .env.example to .env.local and fill the Shopify values,',
        'or export them in the shell before running Playwright.',
      ].join('\n'),
    );
  }
}
