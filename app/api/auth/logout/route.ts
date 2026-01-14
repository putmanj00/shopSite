import { NextRequest, NextResponse } from 'next/server';
import { getShopifyClient } from '@/lib/shopify';
import { CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION } from '@/lib/shopify-queries';
import type { CustomerAccessTokenDeletePayload } from '@/types/shopify';

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ success: true });
    }

    const client = getShopifyClient();
    await client.request<{
      customerAccessTokenDelete: CustomerAccessTokenDeletePayload;
    }>(CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION, {
      variables: {
        customerAccessToken: accessToken,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout API error:', error);
    // Return success even if API call fails (local cleanup will still happen)
    return NextResponse.json({ success: true });
  }
}
