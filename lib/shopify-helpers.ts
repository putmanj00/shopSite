// Helper functions for Shopify API operations with error handling

import { shopifyFetch } from './shopify';
import {
  GET_PRODUCTS_QUERY,
  GET_PRODUCT_BY_HANDLE_QUERY,
  GET_COLLECTIONS_QUERY,
  GET_COLLECTION_BY_HANDLE_QUERY,
} from './shopify-queries';
import type {
  ProductsQueryResponse,
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
