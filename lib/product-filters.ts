import type { ShopifyProduct } from '@/types/shopify';

// PRDS-01: Vendor display normalization
// Maps known incorrect Shopify vendor values to correct brand display names.
const VENDOR_OVERRIDES: Record<string, string> = {
  'My Store': 'Wildenflower',
};

export function normalizeVendor(vendor: string): string {
  return VENDOR_OVERRIDES[vendor] ?? vendor;
}

// PRDS-02: Test product detection
// Exact title match (case-insensitive) for known placeholder/test products.
// To add robustness: tag test products in Shopify admin with 'test-product'
// and extend this filter to also check product.tags.includes('test-product').
const TEST_PRODUCT_TITLES = new Set([
  'ring',
  'generic tiedye',
]);

export function isTestProduct(product: Pick<ShopifyProduct, 'title'>): boolean {
  return TEST_PRODUCT_TITLES.has(product.title.toLowerCase().trim());
}

// PRDS-03: Image presence guard
// product-card uses images.edges[0] as the featured image — there is no separate
// featuredImage field in the current PRODUCT_FRAGMENT.
export function hasProductImage(
  product: Pick<ShopifyProduct, 'images'>
): boolean {
  return product.images.edges.length > 0;
}

// Combined guard: apply this single filter to hide test and imageless products
// from all product grids.
export function isShowableProduct(
  product: Pick<ShopifyProduct, 'title' | 'images'>
): boolean {
  return !isTestProduct(product) && hasProductImage(product);
}
