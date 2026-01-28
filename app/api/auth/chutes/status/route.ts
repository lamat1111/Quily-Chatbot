/**
 * Chutes OAuth Status Endpoint
 *
 * Returns whether Chutes OAuth is configured and available.
 * Used by the frontend to show/hide the Chutes provider option.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.CHUTES_OAUTH_CLIENT_ID;
  const clientSecret = process.env.CHUTES_OAUTH_CLIENT_SECRET;

  const isConfigured = Boolean(clientId && clientSecret);

  return NextResponse.json({
    available: isConfigured,
    message: isConfigured ? undefined : 'Chutes OAuth is not configured',
  });
}
