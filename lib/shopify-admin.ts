/**
 * Shopify Admin API client using Client Credentials Grant (2026+)
 *
 * This module handles authentication with Shopify's Admin API using the
 * client credentials grant flow, which exchanges client ID and secret
 * for short-lived access tokens (24 hours).
 */

interface TokenResponse {
  access_token: string;
  scope: string;
  expires_in: number;
}

interface AdminApiError {
  errors?: string | Record<string, string[]>;
  error?: string;
  error_description?: string;
}

// Cache for the access token
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

// Buffer time before expiration to refresh (5 minutes)
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

/**
 * Get a valid Admin API access token, fetching a new one if needed
 */
export async function getAdminAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now + TOKEN_REFRESH_BUFFER_MS) {
    return cachedToken;
  }

  // Fetch a new token
  const token = await fetchNewAccessToken();
  return token;
}

/**
 * Fetch a new access token using client credentials grant
 */
async function fetchNewAccessToken(): Promise<string> {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  if (!storeDomain) {
    throw new Error('SHOPIFY_STORE_DOMAIN environment variable is required');
  }

  if (!clientId || !clientSecret) {
    throw new Error(
      'SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET environment variables are required for Admin API access'
    );
  }

  // Normalize store domain (remove protocol if present)
  const normalizedDomain = storeDomain.replace(/^https?:\/\//, '');

  const tokenUrl = `https://${normalizedDomain}/admin/oauth/access_token`;

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });

    if (!response.ok) {
      const errorData: AdminApiError = await response.json().catch(() => ({}));
      const errorMessage = errorData.error_description ||
                          errorData.error ||
                          (typeof errorData.errors === 'string' ? errorData.errors : JSON.stringify(errorData.errors)) ||
                          `HTTP ${response.status}`;
      throw new Error(`Failed to get Admin API access token: ${errorMessage}`);
    }

    const data: TokenResponse = await response.json();

    // Cache the token
    cachedToken = data.access_token;
    // Set expiration time (convert seconds to milliseconds)
    tokenExpiresAt = Date.now() + (data.expires_in * 1000);

    console.log(`[Shopify Admin] New access token obtained, expires in ${data.expires_in} seconds`);

    return data.access_token;
  } catch (error) {
    // Clear cache on error
    cachedToken = null;
    tokenExpiresAt = 0;
    throw error;
  }
}

/**
 * Make a GraphQL request to the Shopify Admin API
 */
export async function adminApiFetch<T>({
  query,
  variables = {},
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  if (!storeDomain) {
    throw new Error('SHOPIFY_STORE_DOMAIN environment variable is required');
  }

  const normalizedDomain = storeDomain.replace(/^https?:\/\//, '');
  const accessToken = await getAdminAccessToken();

  const apiVersion = '2025-04';
  const url = `https://${normalizedDomain}/admin/api/${apiVersion}/graphql.json`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      // If unauthorized, clear the token cache and retry once
      if (response.status === 401) {
        console.log('[Shopify Admin] Token expired, refreshing...');
        cachedToken = null;
        tokenExpiresAt = 0;
        const newToken = await getAdminAccessToken();

        const retryResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': newToken,
          },
          body: JSON.stringify({ query, variables }),
        });

        if (!retryResponse.ok) {
          throw new Error(`Admin API request failed: HTTP ${retryResponse.status}`);
        }

        const retryData = await retryResponse.json();
        return retryData.data as T;
      }

      throw new Error(`Admin API request failed: HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('[Shopify Admin] GraphQL Errors:', JSON.stringify(data.errors, null, 2));
      const errorMessages = Array.isArray(data.errors)
        ? data.errors.map((e: { message?: string }) => e.message || JSON.stringify(e)).join(', ')
        : JSON.stringify(data.errors);
      throw new Error(`Admin API GraphQL Errors: ${errorMessages}`);
    }

    return data.data as T;
  } catch (error) {
    console.error('[Shopify Admin] API Error:', error);
    throw error;
  }
}

/**
 * Check if Admin API credentials are configured
 */
export function isAdminApiConfigured(): boolean {
  return !!(
    process.env.SHOPIFY_STORE_DOMAIN &&
    process.env.SHOPIFY_CLIENT_ID &&
    process.env.SHOPIFY_CLIENT_SECRET
  );
}

/**
 * Clear the cached token (useful for testing or forced refresh)
 */
export function clearTokenCache(): void {
  cachedToken = null;
  tokenExpiresAt = 0;
}
