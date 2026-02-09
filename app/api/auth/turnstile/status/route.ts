/**
 * Turnstile Session Status
 *
 * Returns whether the user has an existing Turnstile verified session cookie.
 * Used by the client to skip re-rendering the Turnstile widget on page load
 * when the user has already been verified.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const verified = cookieStore.get('turnstile_verified')?.value === 'true';
  return NextResponse.json({ verified });
}
