/**
 * POST /api/auth/chutes/validate-key
 *
 * Validates a Chutes API key (cpk_...) by calling the /users/me endpoint.
 * Returns user info on success, error details on failure.
 */

import { validateChutesApiKey } from '@/src/lib/chutesAuth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== 'string') {
      return Response.json(
        { valid: false, error: 'invalid_key' },
        { status: 400 }
      );
    }

    const result = await validateChutesApiKey(apiKey);

    return Response.json(result);
  } catch (error) {
    console.error('API key validation error:', error);
    return Response.json(
      { valid: false, error: 'network_error' },
      { status: 500 }
    );
  }
}
