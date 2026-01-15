import { NextRequest, NextResponse } from 'next/server';
import {
  retrieveAndClearOAuthState,
  exchangeCodeForTokens,
  storeTokens,
} from '@/lib/customer-account';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/login?error=Missing+authorization+parameters', request.url)
      );
    }

    // Retrieve and validate state
    const storedState = await retrieveAndClearOAuthState();
    if (!storedState || storedState.state !== state) {
      return NextResponse.redirect(
        new URL('/login?error=Invalid+state+parameter', request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, storedState.codeVerifier);

    // Store tokens in cookies
    await storeTokens(tokens);

    // Get return URL from cookie
    const returnTo = request.cookies.get('ca_return_to')?.value || '/account';

    // Create response with redirect
    const response = NextResponse.redirect(new URL(returnTo, request.url));

    // Clear the return URL cookie
    response.cookies.delete('ca_return_to');

    return response;
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error instanceof Error ? error.message : 'Authentication failed')}`,
        request.url
      )
    );
  }
}
