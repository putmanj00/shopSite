import { NextRequest, NextResponse } from 'next/server';
import { buildAuthorizationUrl, storeOAuthState } from '@/lib/customer-account';

export async function GET(request: NextRequest) {
  try {
    // Get optional return URL from query params
    const returnTo = request.nextUrl.searchParams.get('returnTo') || '/account';

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
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('Failed to initiate login')}`, request.url)
    );
  }
}
