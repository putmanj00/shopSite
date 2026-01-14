import { NextResponse } from 'next/server';
import { adminApiFetch, isAdminApiConfigured } from '@/lib/shopify-admin';

// Simple query to test Admin API connection
const SHOP_QUERY = `
  query {
    shop {
      name
      email
      myshopifyDomain
      plan {
        displayName
      }
    }
  }
`;

interface ShopQueryResponse {
  shop: {
    name: string;
    email: string;
    myshopifyDomain: string;
    plan: {
      displayName: string;
    };
  };
}

export async function GET() {
  // Check if Admin API is configured
  if (!isAdminApiConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: 'Admin API not configured',
        message: 'Please set SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET environment variables',
      },
      { status: 400 }
    );
  }

  try {
    const data = await adminApiFetch<ShopQueryResponse>({
      query: SHOP_QUERY,
    });

    return NextResponse.json({
      success: true,
      message: 'Admin API connection successful!',
      shop: {
        name: data.shop.name,
        email: data.shop.email,
        domain: data.shop.myshopifyDomain,
        plan: data.shop.plan.displayName,
      },
    });
  } catch (error) {
    console.error('Admin API test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to connect to Shopify Admin API. Check your credentials.',
      },
      { status: 500 }
    );
  }
}
