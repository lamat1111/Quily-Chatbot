/**
 * Session Route Handler
 *
 * Returns the current session state for the useChutesSession hook.
 * Attempts token refresh if access token is missing but refresh token exists.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getOAuthConfig, fetchUserInfo, refreshTokens } from '@/src/lib/chutesAuth';
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  COOKIE_USERINFO,
  cookieOptions,
} from '@/src/lib/serverAuth';

export async function GET() {
  // Dev bypass: if CHUTES_DEV_API_KEY is set, report as signed in
  const devApiKey = process.env.CHUTES_DEV_API_KEY;
  if (devApiKey) {
    return NextResponse.json({
      signedIn: true,
      user: { username: 'dev-user', email: 'dev@localhost' },
    });
  }

  const cookieStore = await cookies();
  let accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value || null;
  let refreshToken = cookieStore.get(COOKIE_REFRESH_TOKEN)?.value || null;
  const storedUser = cookieStore.get(COOKIE_USERINFO)?.value || null;

  let refreshed = false;
  let newExpiresIn: number | null = null;

  // If access token missing but refresh token exists, attempt refresh
  if (!accessToken && refreshToken) {
    try {
      const config = getOAuthConfig();
      const refreshedTokens = await refreshTokens({
        refreshToken,
        config,
      });
      accessToken = refreshedTokens.access_token;
      refreshToken = refreshedTokens.refresh_token || refreshToken;
      newExpiresIn = refreshedTokens.expires_in ?? 3600;
      refreshed = Boolean(accessToken);
    } catch {
      accessToken = null;
    }
  }

  // Not signed in if no access token
  if (!accessToken) {
    return NextResponse.json({ signedIn: false });
  }

  // Try to parse cached user info
  let user = null;
  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch {
      user = null;
    }
  }

  // Fetch fresh user info if not cached
  if (!user) {
    try {
      const config = getOAuthConfig();
      user = await fetchUserInfo(config, accessToken);
    } catch {
      user = null;
    }
  }

  const res = NextResponse.json({
    signedIn: true,
    user,
  });

  // If we refreshed, update cookies
  if (refreshed && newExpiresIn) {
    res.cookies.set(COOKIE_ACCESS_TOKEN, accessToken, {
      ...cookieOptions,
      maxAge: newExpiresIn,
    });
    if (refreshToken) {
      res.cookies.set(COOKIE_REFRESH_TOKEN, refreshToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    if (user) {
      res.cookies.set(COOKIE_USERINFO, JSON.stringify(user), {
        ...cookieOptions,
        maxAge: newExpiresIn,
      });
    }
  } else if (user) {
    res.cookies.set(COOKIE_USERINFO, JSON.stringify(user), {
      ...cookieOptions,
      maxAge: 60 * 60,
    });
  }

  return res;
}
