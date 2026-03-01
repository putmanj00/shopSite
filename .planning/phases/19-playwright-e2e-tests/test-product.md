# Test Product — E2E Test Reference

Purpose: Stable Shopify product for E2E-03, E2E-04, E2E-05, E2E-06 test suites.

## Details

| Field | Value |
|-------|-------|
| Handle | `wildenflower-test-product` |
| Title | `Wildenflower Test Product` |
| Storefront URL | `/products/wildenflower-test-product` |

## Usage in Tests

```typescript
const TEST_PRODUCT_HANDLE = 'wildenflower-test-product';
const TEST_PRODUCT_TITLE = 'Wildenflower Test Product';
```

## Notes
- Do not delete this product — it is the target for automated E2E tests
- Do not rename it — the search test (E2E-06) searches by exact title
- Keep at least 1 unit in stock — the add-to-cart test requires the button to be enabled
