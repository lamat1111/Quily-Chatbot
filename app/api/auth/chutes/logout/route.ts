/**
 * Logout Route Handler
 *
 * Clears all session cookies to log the user out.
 */

import { NextResponse } from 'next/server';
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  COOKIE_USERINFO,
  COOKIE_OAUTH_STATE,
  COOKIE_PKCE_VERIFIER,
  cookieOptions,
} from '@/src/lib/serverAuth';

export async function POST() {
  const res = NextResponse.json({ ok: true });

  // Clear all Chutes session cookies
  res.cookies.set(COOKIE_ACCESS_TOKEN, '', { ...cookieOptions, maxAge: 0 });
  res.cookies.set(COOKIE_REFRESH_TOKEN, '', { ...cookieOptions, maxAge: 0 });
  res.cookies.set(COOKIE_USERINFO, '', { ...cookieOptions, maxAge: 0 });
  res.cookies.set(COOKIE_OAUTH_STATE, '', { ...cookieOptions, maxAge: 0 });
  res.cookies.set(COOKIE_PKCE_VERIFIER, '', { ...cookieOptions, maxAge: 0 });

  return res;
}
