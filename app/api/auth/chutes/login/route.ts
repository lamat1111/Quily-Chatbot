/**
 * Login Route Handler
 *
 * Initiates the OAuth flow by generating PKCE and redirecting to Chutes IDP.
 */

import { NextResponse } from 'next/server';
import {
  buildAuthorizeUrl,
  generatePkce,
  generateState,
  getOAuthConfig,
} from '@/src/lib/chutesAuth';
import {
  COOKIE_OAUTH_STATE,
  COOKIE_PKCE_VERIFIER,
  cookieOptions,
} from '@/src/lib/serverAuth';

export async function GET(req: Request) {
  try {
    const origin = new URL(req.url).origin;
    const config = getOAuthConfig(origin);
    const state = generateState();
    const { verifier, challenge } = generatePkce();
    const authorizeUrl = buildAuthorizeUrl({
      state,
      codeChallenge: challenge,
      config,
    });

    const res = NextResponse.redirect(authorizeUrl);

    // Store state and PKCE verifier in temporary cookies (5 min TTL)
    res.cookies.set(COOKIE_OAUTH_STATE, state, {
      ...cookieOptions,
      maxAge: 300,
    });
    res.cookies.set(COOKIE_PKCE_VERIFIER, verifier, {
      ...cookieOptions,
      maxAge: 300,
    });

    return res;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to start Chutes login';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
