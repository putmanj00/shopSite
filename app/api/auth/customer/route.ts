import { NextRequest, NextResponse } from 'next/server';
import { getShopifyClient } from '@/lib/shopify';
import { GET_CUSTOMER_QUERY } from '@/lib/shopify-queries';
import type { CustomerQueryResponse } from '@/types/shopify';

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    const client = getShopifyClient();
    const response = await client.request<CustomerQueryResponse>(
      GET_CUSTOMER_QUERY,
      {
        variables: {
          customerAccessToken: accessToken,
        },
      }
    );

    if (response.data?.customer) {
      return NextResponse.json({ customer: response.data.customer });
    } else {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Fetch customer API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}
