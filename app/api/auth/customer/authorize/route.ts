import { NextRequest, NextResponse } from 'next/server';
import { buildAuthorizationUrl, storeOAuthState } from '@/lib/customer-account';
import { safeReturnTo } from '@/lib/safe-return-to';

export async function GET(request: NextRequest) {
  try {
    // Optional return path from query params — same-site paths only (no open redirect)
    const returnTo = safeReturnTo(request.nextUrl.searchParams.get('returnTo'));

    // Build the authorization URL with PKCE
    const { url, state, codeVerifier } = await buildAuthorizationUrl();

    // Store the state and code verifier in cookies for validation in callback
    await storeOAuthState(state, codeVerifier);

    // Store the return URL in a cookie
    const response = NextResponse.redirect(url);
    response.cookies.set('ca_return_to', returnTo, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Authorization error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to initiate login';
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}
