/**
 * Shopify Customer Account API - OAuth2 + PKCE Authentication
 *
 * This module handles authentication with Shopify's new Customer Account API
 * using OAuth2 with PKCE for secure passwordless authentication.
 */

import { cookies } from 'next/headers';
import crypto from 'crypto';

// Cookie names
const CODE_VERIFIER_COOKIE = 'ca_code_verifier';
const STATE_COOKIE = 'ca_state';
const ACCESS_TOKEN_COOKIE = 'ca_access_token';
const REFRESH_TOKEN_COOKIE = 'ca_refresh_token';
const ID_TOKEN_COOKIE = 'ca_id_token';
const EXPIRES_AT_COOKIE = 'ca_expires_at';

// Environment variables
function getConfig() {
  const shopId = process.env.SHOPIFY_SHOP_ID;
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  if (!shopId) {
    throw new Error('SHOPIFY_SHOP_ID environment variable is required');
  }
  if (!storeDomain) {
    throw new Error('SHOPIFY_STORE_DOMAIN environment variable is required');
  }
  if (!clientId) {
    throw new Error('SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID environment variable is required');
  }

  return {
    shopId,
    storeDomain: storeDomain.replace(/^https?:\/\//, ''),
    clientId,
    clientSecret, // Optional for public clients
    baseUrl: baseUrl.replace(/\/+$/, ''), // Strip trailing slashes
    redirectUri: `${baseUrl.replace(/\/+$/, '')}/api/auth/customer/callback`,
    logoutRedirectUri: `${baseUrl.replace(/\/+$/, '')}/`,
  };
}

// PKCE helpers
export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

export function generateState(): string {
  return crypto.randomBytes(16).toString('base64url');
}

export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64url');
}

// Discovery endpoints
export async function discoverEndpoints() {
  const config = getConfig();

  // Fetch OpenID configuration from the STOREFRONT DOMAIN (not shopify.com)
  const openIdConfigUrl = `https://${config.storeDomain}/.well-known/openid-configuration`;
  const openIdResponse = await fetch(openIdConfigUrl);

  if (!openIdResponse.ok) {
    throw new Error(`Failed to fetch OpenID configuration: ${openIdResponse.status}`);
  }

  const openIdConfig = await openIdResponse.json();

  return {
    authorizationEndpoint: openIdConfig.authorization_endpoint,
    tokenEndpoint: openIdConfig.token_endpoint,
    endSessionEndpoint: openIdConfig.end_session_endpoint,
    userinfoEndpoint: openIdConfig.userinfo_endpoint,
    issuer: openIdConfig.issuer,
  };
}

// Build authorization URL
export async function buildAuthorizationUrl(): Promise<{ url: string; state: string; codeVerifier: string }> {
  const config = getConfig();
  const endpoints = await discoverEndpoints();

  const state = generateState();
  const nonce = generateNonce();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    scope: 'openid email customer-account-api:full',
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const url = `${endpoints.authorizationEndpoint}?${params.toString()}`;

  return { url, state, codeVerifier };
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn: number;
}> {
  const config = getConfig();
  const endpoints = await discoverEndpoints();

  const body: Record<string, string> = {
    grant_type: 'authorization_code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    code,
    code_verifier: codeVerifier,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  // Add client secret for confidential clients
  if (config.clientSecret) {
    const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
    headers['Authorization'] = `Basic ${credentials}`;
  }

  const response = await fetch(endpoints.tokenEndpoint, {
    method: 'POST',
    headers,
    body: new URLSearchParams(body).toString(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Token exchange error:', errorData);
    throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error || response.status}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    idToken: data.id_token,
    expiresIn: data.expires_in,
  };
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}> {
  const config = getConfig();
  const endpoints = await discoverEndpoints();

  const body: Record<string, string> = {
    grant_type: 'refresh_token',
    client_id: config.clientId,
    refresh_token: refreshToken,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  if (config.clientSecret) {
    const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
    headers['Authorization'] = `Basic ${credentials}`;
  }

  const response = await fetch(endpoints.tokenEndpoint, {
    method: 'POST',
    headers,
    body: new URLSearchParams(body).toString(),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

// Build logout URL
export async function buildLogoutUrl(idToken: string): Promise<string> {
  const config = getConfig();
  const endpoints = await discoverEndpoints();

  const params = new URLSearchParams({
    id_token_hint: idToken,
    post_logout_redirect_uri: config.logoutRedirectUri,
  });

  return `${endpoints.endSessionEndpoint}?${params.toString()}`;
}

// Store OAuth state in cookies (for authorize route)
export async function storeOAuthState(state: string, codeVerifier: string) {
  const cookieStore = await cookies();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  };

  cookieStore.set(STATE_COOKIE, state, cookieOptions);
  cookieStore.set(CODE_VERIFIER_COOKIE, codeVerifier, cookieOptions);
}

// Retrieve and clear OAuth state (for callback route)
export async function retrieveAndClearOAuthState(): Promise<{ state: string; codeVerifier: string } | null> {
  const cookieStore = await cookies();

  const state = cookieStore.get(STATE_COOKIE)?.value;
  const codeVerifier = cookieStore.get(CODE_VERIFIER_COOKIE)?.value;

  if (!state || !codeVerifier) {
    return null;
  }

  // Clear the temporary cookies
  cookieStore.delete(STATE_COOKIE);
  cookieStore.delete(CODE_VERIFIER_COOKIE);

  return { state, codeVerifier };
}

// Store tokens in cookies (for callback route after successful auth)
export async function storeTokens(tokens: {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn: number;
}) {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + tokens.expiresIn * 1000;

  const secureCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  // Access token - expires with the token
  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...secureCookieOptions,
    maxAge: tokens.expiresIn,
  });

  // Expires at timestamp
  cookieStore.set(EXPIRES_AT_COOKIE, expiresAt.toString(), {
    ...secureCookieOptions,
    maxAge: tokens.expiresIn,
  });

  // Refresh token - longer lived
  if (tokens.refreshToken) {
    cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      ...secureCookieOptions,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  // ID token - for logout
  if (tokens.idToken) {
    cookieStore.set(ID_TOKEN_COOKIE, tokens.idToken, {
      ...secureCookieOptions,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
}

// Get current tokens from cookies
export async function getStoredTokens(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  expiresAt: number | null;
}> {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null,
    refreshToken: cookieStore.get(REFRESH_TOKEN_COOKIE)?.value || null,
    idToken: cookieStore.get(ID_TOKEN_COOKIE)?.value || null,
    expiresAt: cookieStore.get(EXPIRES_AT_COOKIE)?.value
      ? parseInt(cookieStore.get(EXPIRES_AT_COOKIE)!.value, 10)
      : null,
  };
}

// Clear all tokens (for logout)
export async function clearTokens() {
  const cookieStore = await cookies();

  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(ID_TOKEN_COOKIE);
  cookieStore.delete(EXPIRES_AT_COOKIE);
}

// Get valid access token (refreshing if needed)
export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await getStoredTokens();

  if (!tokens.accessToken) {
    return null;
  }

  // Check if token is expired or about to expire (5 min buffer)
  const now = Date.now();
  const bufferMs = 5 * 60 * 1000;

  if (tokens.expiresAt && tokens.expiresAt - bufferMs < now) {
    // Token is expired or expiring soon, try to refresh
    if (tokens.refreshToken) {
      try {
        const newTokens = await refreshAccessToken(tokens.refreshToken);
        await storeTokens(newTokens);
        return newTokens.accessToken;
      } catch (error) {
        console.error('Token refresh failed:', error);
        await clearTokens();
        return null;
      }
    } else {
      // No refresh token, clear everything
      await clearTokens();
      return null;
    }
  }

  return tokens.accessToken;
}

// Make authenticated request to Customer Account API
export async function customerAccountFetch<T>({
  query,
  variables = {},
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> {
  const config = getConfig();
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const apiVersion = '2025-01';
  const url = `https://shopify.com/${config.shopId}/account/customer/api/${apiVersion}/graphql`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      await clearTokens();
      throw new Error('Authentication expired');
    }
    throw new Error(`Customer Account API request failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors) {
    console.error('Customer Account API errors:', data.errors);
    throw new Error(data.errors[0]?.message || 'GraphQL error');
  }

  return data.data as T;
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const token = await getValidAccessToken();
  return token !== null;
}
