/**
 * Chutes OAuth Status Endpoint
 *
 * Returns whether Chutes OAuth is configured and available.
 * Used by the frontend to show/hide the Chutes provider option.
 *
 * Availability logic (in order):
 * 1. Check NEXT_PUBLIC_CHUTES_ENABLED flag - if 'false', Chutes is disabled
 * 2. Check credentials (CLIENT_ID + CLIENT_SECRET) - if missing, Chutes is not configured
 * 3. If both pass, Chutes is available
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // 1. Check the enabled flag first (quick kill switch)
  const enabledFlag = process.env.NEXT_PUBLIC_CHUTES_ENABLED;
  const isEnabled = enabledFlag !== 'false'; // Default to true if not set

  if (!isEnabled) {
    return NextResponse.json({
      available: false,
      reason: 'disabled',
      message: 'Chutes integration is temporarily disabled',
    });
  }

  // 2. Check credentials
  const clientId = process.env.CHUTES_OAUTH_CLIENT_ID;
  const clientSecret = process.env.CHUTES_OAUTH_CLIENT_SECRET;
  const isConfigured = Boolean(clientId && clientSecret);

  if (!isConfigured) {
    return NextResponse.json({
      available: false,
      reason: 'not_configured',
      message: 'Chutes OAuth is not configured',
    });
  }

  // 3. All checks passed - Chutes is available
  return NextResponse.json({
    available: true,
    reason: 'ready',
  });
}
