/**
 * Server-Side Authentication Helpers for Chutes
 */

import { cookies } from 'next/headers';

// ============================================================================
// Cookie Names
// ============================================================================

export const COOKIE_ACCESS_TOKEN = 'chutes_access_token';
export const COOKIE_REFRESH_TOKEN = 'chutes_refresh_token';
export const COOKIE_USERINFO = 'chutes_userinfo';
export const COOKIE_OAUTH_STATE = 'chutes_oauth_state';
export const COOKIE_PKCE_VERIFIER = 'chutes_pkce_verifier';

// ============================================================================
// Cookie Configuration
// ============================================================================

const isProd = process.env.NODE_ENV === 'production';

export const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/',
};

// ============================================================================
// Token Retrieval
// ============================================================================

/**
 * Get the current access token from cookies.
 * Use this in API routes to authenticate requests to Chutes API.
 */
export async function getServerAccessToken(): Promise<string | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_ACCESS_TOKEN)?.value;
    return token || null;
  } catch {
    return null;
  }
}

/**
 * Get the refresh token from cookies.
 * Use this to refresh an expired access token.
 */
export async function getServerRefreshToken(): Promise<string | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_REFRESH_TOKEN)?.value;
    return token || null;
  } catch {
    return null;
  }
}

/**
 * Get cached user info from cookies.
 * Returns parsed user object or null if not available.
 */
export async function getServerUserInfo(): Promise<Record<string, unknown> | null> {
  try {
    const store = await cookies();
    const raw = store.get(COOKIE_USERINFO)?.value;
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

// ============================================================================
// Session Management
// ============================================================================

/**
 * Check if the user is currently authenticated.
 * Simply checks for presence of access token cookie.
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getServerAccessToken();
  return !!token;
}

/**
 * Clear all session cookies (logout).
 * Use this in the logout API route.
 */
export function clearSessionCookies(responseHeaders: Headers) {
  const cookiesToClear = [
    COOKIE_ACCESS_TOKEN,
    COOKIE_REFRESH_TOKEN,
    COOKIE_USERINFO,
    COOKIE_OAUTH_STATE,
    COOKIE_PKCE_VERIFIER,
  ];

  for (const name of cookiesToClear) {
    responseHeaders.append(
      'Set-Cookie',
      `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
    );
  }
}

// ============================================================================
// Helper Type for User
// ============================================================================

export type ChutesUser = {
  sub?: string;
  username?: string;
  email?: string;
  name?: string;
  created_at?: string;
  [key: string]: unknown;
};
