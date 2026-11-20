// Default anchor is a permanent fixture on the CI development store
// (wildenflower-ci.myshopify.com), which is what CI's Storefront token reads.
// It is never edited for merchandising, so catalog work on the real store
// cannot break CI. Fixture set: ci-simple-product, ci-variant-product,
// ci-sold-out-product, ci-one-of-one, ci-small-run.
//
// Running against the real store (local .env.local, or BASE_URL=<prod> with
// --grep @smoke)? Point these at a real published product via
// E2E_TEST_PRODUCT_HANDLE / E2E_TEST_PRODUCT_TITLE.
export const TEST_PRODUCT_HANDLE =
  process.env.E2E_TEST_PRODUCT_HANDLE || 'ci-simple-product';

export const TEST_PRODUCT_TITLE =
  process.env.E2E_TEST_PRODUCT_TITLE || 'CI Simple Product';
