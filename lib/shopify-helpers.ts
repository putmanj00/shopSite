// Helper functions for Shopify API operations with error handling

import { shopifyFetch } from './shopify';
import {
  GET_PRODUCTS_QUERY,
  GET_PRODUCT_BY_HANDLE_QUERY,
  GET_COLLECTIONS_QUERY,
  GET_COLLECTION_BY_HANDLE_QUERY,
  GET_ALL_PRODUCTS_HANDLES,
  GET_ALL_COLLECTIONS_HANDLES,
  SEARCH_PRODUCTS_QUERY,
  GET_MENU_QUERY,
} from './shopify-queries';
import type {
  ProductsQueryResponse,
  SearchQueryResponse,
  ProductQueryResponse,
  CollectionsQueryResponse,
  CollectionQueryResponse,
  ShopifyProduct,
  ShopifyCollection,
} from '@/types/shopify';

export interface GetProductsOptions {
  first?: number;
  after?: string;
  query?: string;
  sortKey?:
    | 'TITLE'
    | 'CREATED_AT'
    | 'UPDATED_AT'
    | 'PRICE'
    | 'BEST_SELLING'
    | 'RELEVANCE';
}

/**
 * Fetch products from Shopify with error handling
 */
export async function getProducts(
  options: GetProductsOptions = {}
): Promise<ProductsQueryResponse> {
  try {
    const { first = 20, after, query, sortKey } = options;

    const data = await shopifyFetch<ProductsQueryResponse>({
      query: GET_PRODUCTS_QUERY,
      variables: {
        first,
        after,
        query,
        sortKey,
      },
    });

    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error(
      `Failed to fetch products: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Fetch a single product by handle with error handling
 */
export async function getProductByHandle(
  handle: string
): Promise<ShopifyProduct | null> {
  try {
    if (!handle) {
      throw new Error('Product handle is required');
    }

    const data = await shopifyFetch<ProductQueryResponse>({
      query: GET_PRODUCT_BY_HANDLE_QUERY,
      variables: { handle },
    });

    return data.product;
  } catch (error) {
    console.error(`Error fetching product with handle "${handle}":`, error);
    throw new Error(
      `Failed to fetch product: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export interface GetCollectionsOptions {
  first?: number;
  after?: string;
  sortKey?: 'TITLE' | 'UPDATED_AT' | 'RELEVANCE';
}

/**
 * Fetch collections from Shopify with error handling
 */
export async function getCollections(
  options: GetCollectionsOptions = {}
): Promise<CollectionsQueryResponse> {
  try {
    const { first = 20, after, sortKey } = options;

    const data = await shopifyFetch<CollectionsQueryResponse>({
      query: GET_COLLECTIONS_QUERY,
      variables: {
        first,
        after,
        sortKey,
      },
    });

    return data;
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw new Error(
      `Failed to fetch collections: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export interface GetCollectionByHandleOptions {
  first?: number;
  after?: string;
  sortKey?:
    | 'TITLE'
    | 'CREATED'
    | 'PRICE'
    | 'BEST_SELLING'
    | 'MANUAL'
    | 'COLLECTION_DEFAULT'
    | 'RELEVANCE';
}

/**
 * Fetch a single collection by handle with products
 */
export async function getCollectionByHandle(
  handle: string,
  options: GetCollectionByHandleOptions = {}
): Promise<ShopifyCollection | null> {
  try {
    if (!handle) {
      throw new Error('Collection handle is required');
    }

    const { first = 20, after, sortKey } = options;

    const data = await shopifyFetch<CollectionQueryResponse>({
      query: GET_COLLECTION_BY_HANDLE_QUERY,
      variables: {
        handle,
        first,
        after,
        sortKey,
      },
    });

    return data.collection;
  } catch (error) {
    console.error(`Error fetching collection with handle "${handle}":`, error);
    throw new Error(
      `Failed to fetch collection: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Format Shopify money object to display string
 */
export function formatMoney(money: {
  amount: string;
  currencyCode: string;
}): string {
  const amount = parseFloat(money.amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currencyCode,
  }).format(amount);
}

/**
 * Check if a product is on sale
 */
export function isProductOnSale(product: ShopifyProduct): boolean {
  const minPrice = parseFloat(product.priceRange.minVariantPrice.amount);
  const minComparePrice = parseFloat(
    product.compareAtPriceRange.minVariantPrice.amount
  );

  return minComparePrice > 0 && minComparePrice > minPrice;
}

/**
 * Get the first available variant of a product
 */
export function getFirstAvailableVariant(product: ShopifyProduct) {
  return product.variants.edges.find((edge) => edge.node.availableForSale)
    ?.node;
}

/**
 * Fetch all product handles for SSG
 */
export async function getAllProductsHandles(): Promise<string[]> {
  try {
    const data = await shopifyFetch<ProductsQueryResponse>({
      query: GET_ALL_PRODUCTS_HANDLES,
      variables: { first: 250 },
    });

    return data.products.edges.map((edge) => edge.node.handle);
  } catch (error) {
    console.error('Error fetching product handles:', error);
    return [];
  }
}

/**
 * Fetch all collection handles for SSG
 */
export async function getAllCollectionsHandles(): Promise<string[]> {
  try {
    const data = await shopifyFetch<CollectionsQueryResponse>({
      query: GET_ALL_COLLECTIONS_HANDLES,
      variables: { first: 250 },
    });

    return data.collections.edges.map((edge) => edge.node.handle);
  } catch (error) {
    console.error('Error fetching collection handles:', error);
    return [];
  }
}

/**
 * Fetch all collections with full data
 */
export async function getAllCollections(): Promise<ShopifyCollection[]> {
  try {
    const data = await getCollections({ first: 250 });
    return data.collections.edges.map((edge) => edge.node);
  } catch (error) {
    console.error('Error fetching all collections:', error);
    return [];
  }
}

/**
 * Search products using the Shopify Search API (better relevance/typo tolerance)
 */
export async function searchProducts(
  query: string,
  options: { first?: number; after?: string } = {}
): Promise<ProductsQueryResponse> {
  try {
    const { first = 10, after } = options;

    // Shopify Search API requires query to be non-empty
    if (!query.trim()) {
      return {
        products: {
          edges: [],
          pageInfo: { hasNextPage: false, hasPreviousPage: false }
        }
      };
    }

    // Use SEARCH_PRODUCTS_QUERY which uses the search query field
    const data = await shopifyFetch<SearchQueryResponse>({
      query: SEARCH_PRODUCTS_QUERY,
      variables: {
        query,
        first,
        after
      },
    });

    // Transform search results to match ProductsQueryResponse structure
    return {
      products: {
        edges: data.search.edges,
        pageInfo: data.search.pageInfo,
      },
    };
  } catch (error) {
    console.error(`Error searching products with query "${query}":`, error);
    // Return empty results instead of crashing for search
    return {
      products: {
        edges: [],
        pageInfo: { hasNextPage: false, hasPreviousPage: false }
      }
    };
  }
}

// ─── Navigation Menu ───────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
}

// Canonical fallback — shown when Shopify menu is missing or incomplete.
// Order: Tie-Dye → Jewelry → Crystals → Leather → Artwork (per locked decision).
// Ceramics deferred — not a launch line yet (C2 2026-06-14); re-add when the line
// exists in Shopify (handle 'ceramics') and bump the count threshold below to 6.
const FALLBACK_NAV_ITEMS: NavItem[] = [
  { label: 'Tie-Dye',  href: '/collections/tie-dye' },
  { label: 'Jewelry',  href: '/collections/jewelry' },
  { label: 'Crystals', href: '/collections/crystals' },
  { label: 'Leather',  href: '/collections/leather' },
  { label: 'Artwork',  href: '/collections/artwork' },
];

// Valid collection handles for this store. Any item with a different handle is filtered out.
const VALID_HANDLES = new Set([
  'tie-dye', 'leather', 'jewelry', 'crystals', 'artwork',
]);

/**
 * Fetch the Shopify navigation menu and return NavItem[].
 * Falls back to FALLBACK_NAV_ITEMS if the menu is missing, the API fails,
 * or fewer than 5 valid category items are returned.
 */
export async function getNavMenu(handle: string): Promise<NavItem[]> {
  try {
    const data = await shopifyFetch<{
      menu: {
        items: Array<{ id: string; title: string; url: string; type: string }>;
      } | null;
    }>({
      query: GET_MENU_QUERY,
      variables: { handle },
    });

    if (!data.menu) {
      console.warn(`Shopify menu "${handle}" not found — using fallback nav`);
      return FALLBACK_NAV_ITEMS;
    }

    const items = data.menu.items
      .filter((item) => item.type === 'COLLECTION')
      .map((item) => {
        // Shopify URL is absolute: https://store.myshopify.com/collections/leather
        let collectionHandle = '';
        try {
          const pathname = new URL(item.url).pathname; // → '/collections/leather'
          collectionHandle = pathname.split('/collections/')[1]?.split('?')[0] ?? '';
        } catch {
          collectionHandle = '';
        }
        return { label: item.title, href: `/collections/${collectionHandle}` };
      })
      .filter((item) => VALID_HANDLES.has(item.href.replace('/collections/', '')));

    if (items.length < 5) {
      console.warn(
        `Shopify menu "${handle}" has ${items.length}/5 expected categories — using fallback nav`
      );
      return FALLBACK_NAV_ITEMS;
    }

    return items;
  } catch (error) {
    console.error('Failed to fetch Shopify nav menu:', error);
    return FALLBACK_NAV_ITEMS;
  }
}
