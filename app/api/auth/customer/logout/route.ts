import { NextRequest, NextResponse } from 'next/server';
import { getStoredTokens, clearTokens, buildLogoutUrl } from '@/lib/customer-account';

export async function GET(request: NextRequest) {
  try {
    const tokens = await getStoredTokens();

    // Clear local tokens first
    await clearTokens();

    // If we have an ID token, redirect to Shopify's logout endpoint
    if (tokens.idToken) {
      try {
        const logoutUrl = await buildLogoutUrl(tokens.idToken);
        return NextResponse.redirect(logoutUrl);
      } catch (error) {
        console.error('Failed to build logout URL:', error);
        // Fall through to local redirect
      }
    }

    // Redirect to home page
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, clear cookies and redirect
    await clearTokens().catch(() => {});
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export async function POST(request: NextRequest) {
  // Also support POST for logout
  return GET(request);
}
