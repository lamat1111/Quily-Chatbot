/**
 * Chutes OAuth Authentication Utilities
 *
 * Core functions for OAuth 2.0 + PKCE authentication with Chutes IDP.
 */

import crypto from 'crypto';

// ============================================================================
// Types
// ============================================================================

export type OAuthConfig = {
  idpBaseUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
};

export type UserInfo = {
  sub: string;
  username?: string;
  email?: string;
  name?: string;
  created_at?: string;
  [key: string]: unknown;
};

// ============================================================================
// Configuration
// ============================================================================

const IDP_BASE_URL = process.env.CHUTES_IDP_BASE_URL || 'https://api.chutes.ai';

/**
 * Build the OAuth redirect URI dynamically based on environment.
 * Priority: CHUTES_OAUTH_REDIRECT_URI > NEXT_PUBLIC_APP_URL > request origin > localhost
 */
function buildRedirectUri(requestOrigin?: string): string {
  const envRedirect = process.env.CHUTES_OAUTH_REDIRECT_URI;
  const publicBase = process.env.NEXT_PUBLIC_APP_URL;

  if (envRedirect) return envRedirect;

  if (publicBase) {
    return `${publicBase.replace(/\/$/, '')}/api/auth/chutes/callback`;
  }

  if (requestOrigin) {
    return `${requestOrigin.replace(/\/$/, '')}/api/auth/chutes/callback`;
  }

  return 'http://localhost:3000/api/auth/chutes/callback';
}

/**
 * Get the complete OAuth configuration from environment variables.
 * Throws if required CLIENT_ID or CLIENT_SECRET are missing.
 */
export function getOAuthConfig(requestOrigin?: string): OAuthConfig {
  const clientId = process.env.CHUTES_OAUTH_CLIENT_ID || '';
  const clientSecret = process.env.CHUTES_OAUTH_CLIENT_SECRET || '';
  const redirectUri = buildRedirectUri(requestOrigin);
  const scopes =
    process.env.CHUTES_OAUTH_SCOPES || 'profile chutes:read chutes:invoke';

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing Chutes OAuth credentials. Set CHUTES_OAUTH_CLIENT_ID and CHUTES_OAUTH_CLIENT_SECRET.'
    );
  }

  return {
    idpBaseUrl: IDP_BASE_URL,
    clientId,
    clientSecret,
    redirectUri,
    scopes,
  };
}

// ============================================================================
// PKCE & State Generation
// ============================================================================

/**
 * Generate a random state parameter for CSRF protection.
 * Store this in a cookie before redirecting to the IDP.
 */
export function generateState(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generate PKCE code verifier and challenge.
 * - verifier: Random string sent during token exchange
 * - challenge: SHA256 hash of verifier, sent during authorization
 */
export function generatePkce(): { verifier: string; challenge: string } {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const hash = crypto.createHash('sha256').update(verifier).digest();
  const challenge = hash.toString('base64url');
  return { verifier, challenge };
}

// ============================================================================
// URL Builders
// ============================================================================

/**
 * Build the authorization URL to redirect users to Chutes login.
 */
export function buildAuthorizeUrl(params: {
  state: string;
  codeChallenge: string;
  config: OAuthConfig;
}): string {
  const { state, codeChallenge, config } = params;
  const authorize = new URL(`${config.idpBaseUrl}/idp/authorize`);
  authorize.searchParams.set('response_type', 'code');
  authorize.searchParams.set('client_id', config.clientId);
  authorize.searchParams.set('redirect_uri', config.redirectUri);
  authorize.searchParams.set('scope', config.scopes.replace(/\s+/g, ' '));
  authorize.searchParams.set('state', state);
  authorize.searchParams.set('code_challenge', codeChallenge);
  authorize.searchParams.set('code_challenge_method', 'S256');
  return authorize.toString();
}

// ============================================================================
// Token Operations
// ============================================================================

/**
 * Exchange authorization code for access and refresh tokens.
 * Called in the callback route after user authorizes.
 */
export async function exchangeCodeForTokens(args: {
  code: string;
  codeVerifier: string;
  config: OAuthConfig;
}): Promise<TokenResponse> {
  const { code, codeVerifier, config } = args;
  const tokenUrl = `${config.idpBaseUrl}/idp/token`;
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code_verifier: codeVerifier,
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const json = await res.json();
  if (!res.ok) {
    const err = json?.error_description || json?.error || 'Token exchange failed';
    throw new Error(err);
  }

  return json;
}

/**
 * Refresh an expired access token using the refresh token.
 */
export async function refreshTokens(args: {
  refreshToken: string;
  config: OAuthConfig;
}): Promise<TokenResponse> {
  const { refreshToken, config } = args;
  const tokenUrl = `${config.idpBaseUrl}/idp/token`;
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const json = await res.json();
  if (!res.ok) {
    const err = json?.error_description || json?.error || 'Token refresh failed';
    throw new Error(err);
  }

  return json;
}

// ============================================================================
// User Info
// ============================================================================

/**
 * Fetch user profile from the Chutes userinfo endpoint.
 * Returns null if the token is invalid or expired.
 */
export async function fetchUserInfo(
  config: OAuthConfig,
  accessToken: string
): Promise<UserInfo | null> {
  const res = await fetch(`${config.idpBaseUrl}/idp/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

/**
 * Fetch detailed user info from the /users/me endpoint.
 * Includes additional fields like balance, logo_id, etc.
 */
export async function fetchDetailedUserInfo(
  config: OAuthConfig,
  accessToken: string
): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${config.idpBaseUrl}/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

// ============================================================================
// Balance & Credits Checking
// ============================================================================

export interface ChutesBalanceResult {
  hasCredits: boolean;
  balance?: number;
  error?: 'unauthorized' | 'network_error' | 'no_credits';
}

/**
 * Check if a Chutes user has sufficient credits/balance.
 * Uses /users/me/quotas endpoint which returns quota information.
 *
 * This is a lightweight check designed for pre-flight validation.
 * Returns quickly even on failure to avoid blocking the user experience.
 */
export async function checkChutesBalance(
  accessToken: string,
  config?: OAuthConfig
): Promise<ChutesBalanceResult> {
  if (!accessToken) {
    return { hasCredits: false, error: 'unauthorized' };
  }

  const baseUrl = config?.idpBaseUrl || IDP_BASE_URL;

  try {
    // Use AbortController for timeout to ensure fast response
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const res = await fetch(`${baseUrl}/users/me/quotas`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.status === 401 || res.status === 403) {
      return { hasCredits: false, error: 'unauthorized' };
    }

    // 402 Payment Required = no credits
    if (res.status === 402) {
      return { hasCredits: false, balance: 0, error: 'no_credits' };
    }

    if (!res.ok) {
      // On other errors, assume they have credits to avoid false negatives
      console.warn(`Chutes quota check returned ${res.status}, assuming has credits`);
      return { hasCredits: true };
    }

    const data = await res.json();

    // The quotas endpoint returns quota info - if we get a successful response,
    // the user has access. We can refine this based on actual response structure.
    // For now, a 200 response means the user has an active account.
    return { hasCredits: true, balance: data?.balance };
  } catch (error) {
    // On network error or timeout, don't block - assume they have credits
    // The actual API call will fail with a proper error if they don't
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Chutes balance check timed out, proceeding with request');
    } else {
      console.warn('Chutes balance check failed:', error);
    }
    return { hasCredits: true, error: 'network_error' };
  }
}
