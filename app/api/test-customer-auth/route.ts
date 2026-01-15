import { NextResponse } from 'next/server';

export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // Check required environment variables
  const shopId = process.env.SHOPIFY_SHOP_ID;
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  results.checks = {
    SHOPIFY_SHOP_ID: shopId ? `Set (${shopId.substring(0, 4)}...)` : 'MISSING',
    SHOPIFY_STORE_DOMAIN: storeDomain ? `Set (${storeDomain})` : 'MISSING',
    SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID: clientId ? `Set (${clientId.substring(0, 8)}...)` : 'MISSING',
    SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET: clientSecret ? 'Set' : 'MISSING (optional for public clients)',
    NEXT_PUBLIC_BASE_URL: baseUrl || 'MISSING',
  };

  // Check if all required vars are present
  const missingRequired = [];
  if (!shopId) missingRequired.push('SHOPIFY_SHOP_ID');
  if (!storeDomain) missingRequired.push('SHOPIFY_STORE_DOMAIN');
  if (!clientId) missingRequired.push('SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID');

  if (missingRequired.length > 0) {
    return NextResponse.json({
      success: false,
      error: `Missing required environment variables: ${missingRequired.join(', ')}`,
      ...results,
    });
  }

  // Try to fetch the OpenID configuration
  try {
    const openIdConfigUrl = `https://shopify.com/${shopId}/.well-known/openid-configuration`;
    results.openIdConfigUrl = openIdConfigUrl;

    const response = await fetch(openIdConfigUrl);

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch OpenID configuration: HTTP ${response.status}`,
        hint: 'Your SHOPIFY_SHOP_ID might be incorrect. It should be a numeric ID like "12345678"',
        ...results,
      });
    }

    const config = await response.json();
    results.openIdConfig = {
      issuer: config.issuer,
      authorization_endpoint: config.authorization_endpoint ? 'Found' : 'Missing',
      token_endpoint: config.token_endpoint ? 'Found' : 'Missing',
    };

    // Calculate callback URL
    const callbackUrl = `${baseUrl}/api/auth/customer/callback`;
    results.callbackUrl = callbackUrl;
    results.note = 'Make sure this callback URL is added to your Headless channel in Shopify Admin';

    return NextResponse.json({
      success: true,
      message: 'Customer Account API configuration looks good!',
      ...results,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Failed to verify configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ...results,
    });
  }
}
