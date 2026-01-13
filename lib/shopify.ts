import {
  createStorefrontApiClient,
  type StorefrontApiClient,
} from '@shopify/storefront-api-client';

// Lazy-loaded Shopify client (created on first use)
let shopifyClient: StorefrontApiClient | null = null;

/**
 * Get or create the Shopify Storefront API client
 */
function getShopifyClient(): StorefrontApiClient {
  if (shopifyClient) {
    return shopifyClient;
  }

  // Validate required environment variables
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!storeDomain) {
    throw new Error('SHOPIFY_STORE_DOMAIN environment variable is required');
  }

  if (!storefrontAccessToken) {
    throw new Error(
      'SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variable is required'
    );
  }

  // Create and cache the client
  shopifyClient = createStorefrontApiClient({
    storeDomain,
    apiVersion: '2024-01',
    publicAccessToken: storefrontAccessToken,
  });

  return shopifyClient;
}

// Helper function to execute GraphQL queries with error handling
export async function shopifyFetch<T>({
  query,
  variables = {},
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> {
  try {
    const client = getShopifyClient();
    const response = await client.request(query, {
      variables,
    });

    if (response.errors) {
      const errorMessages = Array.isArray(response.errors)
        ? response.errors.map((e: { message: string }) => e.message).join(', ')
        : String(response.errors);
      throw new Error(`GraphQL Errors: ${errorMessages}`);
    }

    return response.data as T;
  } catch (error) {
    console.error('Shopify API Error:', error);
    throw error;
  }
}
