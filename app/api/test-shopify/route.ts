import { NextResponse } from 'next/server';
import { getProducts, getCollections } from '@/lib/shopify-helpers';

/**
 * Test API route to verify Shopify Storefront API connection
 * Access this at: /api/test-shopify
 */
export async function GET() {
  try {
    // Test fetching products
    const productsData = await getProducts({ first: 5 });
    const productCount = productsData.products.edges.length;

    // Test fetching collections
    const collectionsData = await getCollections({ first: 5 });
    const collectionCount = collectionsData.collections.edges.length;

    return NextResponse.json(
      {
        success: true,
        message: 'Shopify API connection successful',
        data: {
          products: {
            count: productCount,
            hasMore: productsData.products.pageInfo.hasNextPage,
            items: productsData.products.edges.map((edge) => ({
              id: edge.node.id,
              handle: edge.node.handle,
              title: edge.node.title,
              price: edge.node.priceRange.minVariantPrice,
            })),
          },
          collections: {
            count: collectionCount,
            hasMore: collectionsData.collections.pageInfo.hasNextPage,
            items: collectionsData.collections.edges.map((edge) => ({
              id: edge.node.id,
              handle: edge.node.handle,
              title: edge.node.title,
            })),
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Shopify API test failed:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to connect to Shopify API',
        error: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Please check your SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN environment variables',
      },
      { status: 500 }
    );
  }
}
