/**
 * Login error codes for `/login?error=<code>`.
 *
 * The auth routes used to put raw `error.message` / Shopify's
 * `error_description` into the query string, and the login page rendered it.
 * That leaked internal detail (env-var names, token-exchange errors) and let
 * anyone craft a /login link showing arbitrary text on our domain.
 *
 * Now routes redirect with a fixed code; detail goes to the server log only.
 * The page shows the fixed message for a known code and a generic one for
 * anything else — the query value itself is never rendered.
 */
export const AUTH_ERROR_MESSAGES = {
  login_unavailable: 'Sign-in is temporarily unavailable. Please try again in a few minutes.',
  login_cancelled: 'Sign-in was cancelled or could not be completed. Please try again.',
  missing_params: 'That sign-in link was incomplete. Please try again.',
  invalid_state: 'Your sign-in session expired. Please try again.',
  auth_failed: 'We couldn’t sign you in. Please try again.',
} as const;

export type AuthErrorCode = keyof typeof AUTH_ERROR_MESSAGES;

export const GENERIC_AUTH_ERROR = AUTH_ERROR_MESSAGES.auth_failed;

export function loginErrorPath(code: AuthErrorCode): string {
  return `/login?error=${code}`;
}

export function authErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null;
  return Object.prototype.hasOwnProperty.call(AUTH_ERROR_MESSAGES, code)
    ? AUTH_ERROR_MESSAGES[code as AuthErrorCode]
    : GENERIC_AUTH_ERROR;
}
