import { NextRequest, NextResponse } from 'next/server';
import {
  retrieveAndClearOAuthState,
  exchangeCodeForTokens,
  storeTokens,
} from '@/lib/customer-account';
import { safeReturnTo } from '@/lib/safe-return-to';
import { loginErrorPath } from '@/lib/auth-errors';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors. error/error_description are attacker-controllable
    // query params: log them, never reflect them into the login page.
    if (error) {
      console.error('OAuth error:', error, errorDescription);
      return NextResponse.redirect(new URL(loginErrorPath('login_cancelled'), request.url));
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(new URL(loginErrorPath('missing_params'), request.url));
    }

    // Retrieve and validate state
    const storedState = await retrieveAndClearOAuthState();
    if (!storedState || storedState.state !== state) {
      return NextResponse.redirect(new URL(loginErrorPath('invalid_state'), request.url));
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, storedState.codeVerifier);

    // Store tokens in cookies
    await storeTokens(tokens);

    // Return path from cookie — re-validated here: the cookie is client-controlled
    const returnTo = safeReturnTo(request.cookies.get('ca_return_to')?.value);

    // Create response with redirect
    const response = NextResponse.redirect(new URL(returnTo, request.url));

    // Clear the return URL cookie
    response.cookies.delete('ca_return_to');

    return response;
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL(loginErrorPath('auth_failed'), request.url));
  }
}
