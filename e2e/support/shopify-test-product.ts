// Default anchor is a real, published, in-stock product on the Shopify
// Storefront the CI token reads. CI does not set the E2E_TEST_PRODUCT_* env
// vars, so these defaults must point at a product that actually exists — a
// stale/deleted handle here makes every product-backed spec fail in CI while
// passing locally (where .env.local overrides). Override via env to retarget.
export const TEST_PRODUCT_HANDLE =
  process.env.E2E_TEST_PRODUCT_HANDLE || 'shibori-indigo-scarf-2';

export const TEST_PRODUCT_TITLE =
  process.env.E2E_TEST_PRODUCT_TITLE || 'Shibori Indigo Scarf';
