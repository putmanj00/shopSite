import { NextRequest, NextResponse } from 'next/server';
import { getShopifyClient } from '@/lib/shopify';
import { CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION } from '@/lib/shopify-queries';
import type { CustomerAccessTokenCreatePayload } from '@/types/shopify';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const client = getShopifyClient();
    const response = await client.request<{
      customerAccessTokenCreate: CustomerAccessTokenCreatePayload;
    }>(CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, {
      variables: {
        input: { email, password },
      },
    });

    const { customerAccessToken, customerUserErrors } =
      response.data?.customerAccessTokenCreate || {};

    if (customerUserErrors && customerUserErrors.length > 0) {
      return NextResponse.json(
        { 
          error: customerUserErrors[0].message,
          code: customerUserErrors[0].code 
        },
        { status: 400 }
      );
    }

    if (!customerAccessToken) {
      return NextResponse.json(
        { error: 'Failed to create access token' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      accessToken: customerAccessToken.accessToken,
      expiresAt: customerAccessToken.expiresAt,
    });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed' },
      { status: 500 }
    );
  }
}
