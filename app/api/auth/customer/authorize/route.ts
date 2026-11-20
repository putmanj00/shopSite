import { NextRequest, NextResponse } from 'next/server';
import { buildAuthorizationUrl, storeOAuthState } from '@/lib/customer-account';
import { safeReturnTo } from '@/lib/safe-return-to';
import { loginErrorPath } from '@/lib/auth-errors';

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
    // Detail stays in the server log; the URL carries a fixed code only.
    console.error('Authorization error:', error);
    return NextResponse.redirect(new URL(loginErrorPath('login_unavailable'), request.url));
  }
}
