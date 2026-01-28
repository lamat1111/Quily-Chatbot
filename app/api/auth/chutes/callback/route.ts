/**
 * Callback Route Handler
 *
 * Handles the OAuth callback, exchanges code for tokens, and sets session cookies.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  exchangeCodeForTokens,
  fetchUserInfo,
  getOAuthConfig,
} from '@/src/lib/chutesAuth';
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  COOKIE_USERINFO,
  COOKIE_OAUTH_STATE,
  COOKIE_PKCE_VERIFIER,
  cookieOptions,
} from '@/src/lib/serverAuth';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  // Handle OAuth errors from the IDP
  if (error) {
    return NextResponse.json({ error, errorDescription }, { status: 400 });
  }

  try {
    const origin = new URL(req.url).origin;
    const config = getOAuthConfig(origin);
    const cookieStore = await cookies();
    const storedState = cookieStore.get(COOKIE_OAUTH_STATE)?.value;
    const codeVerifier = cookieStore.get(COOKIE_PKCE_VERIFIER)?.value;

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
    }

    // Validate state to prevent CSRF
    if (!storedState || state !== storedState) {
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
    }

    // Validate PKCE verifier exists
    if (!codeVerifier) {
      return NextResponse.json({ error: 'Missing PKCE verifier' }, { status: 400 });
    }

    // Exchange code for tokens
    const tokenResult = await exchangeCodeForTokens({
      code,
      codeVerifier,
      config,
    });

    const accessToken = tokenResult.access_token;
    const refreshToken = tokenResult.refresh_token;
    const expiresIn = tokenResult.expires_in ?? 3600;

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token returned' }, { status: 500 });
    }

    // Redirect to home page after successful auth
    const res = NextResponse.redirect(new URL('/', req.url));

    // Set access token cookie
    res.cookies.set(COOKIE_ACCESS_TOKEN, accessToken, {
      ...cookieOptions,
      maxAge: expiresIn,
    });

    // Set refresh token cookie (30 day lifetime)
    if (refreshToken) {
      res.cookies.set(COOKIE_REFRESH_TOKEN, refreshToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    // Fetch and cache user info
    try {
      const userinfo = await fetchUserInfo(config, accessToken);
      if (userinfo) {
        res.cookies.set(COOKIE_USERINFO, JSON.stringify(userinfo), {
          ...cookieOptions,
          maxAge: expiresIn,
        });
      }
    } catch {
      // Ignore userinfo fetch failures
    }

    // Clear temporary OAuth cookies
    res.cookies.set(COOKIE_OAUTH_STATE, '', { ...cookieOptions, maxAge: 0 });
    res.cookies.set(COOKIE_PKCE_VERIFIER, '', { ...cookieOptions, maxAge: 0 });

    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Callback failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
