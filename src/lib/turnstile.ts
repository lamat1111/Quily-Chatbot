/**
 * Server-side Turnstile token verification.
 *
 * Verifies tokens with Cloudflare's siteverify API.
 * Tokens expire after 300 seconds (5 minutes).
 */

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Verify a Turnstile token with Cloudflare.
 *
 * @param token - The token from the client-side widget
 * @param ip - Optional client IP for additional validation
 * @returns Object with success boolean and optional error message
 */
export async function verifyTurnstileToken(
  token: string,
  ip?: string
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.warn('[Turnstile] Missing TURNSTILE_SECRET_KEY - skipping verification');
    // In development without key, allow through
    return { success: true };
  }

  if (!token) {
    return { success: false, error: 'Missing Turnstile token' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (ip) {
      formData.append('remoteip', ip);
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      console.error('[Turnstile] Verification request failed:', response.status);
      return { success: false, error: 'Verification request failed' };
    }

    const data: TurnstileVerifyResponse = await response.json();

    if (!data.success) {
      const errorCodes = data['error-codes']?.join(', ') || 'Unknown error';
      console.warn('[Turnstile] Verification failed:', errorCodes);
      return { success: false, error: `Verification failed: ${errorCodes}` };
    }

    return { success: true };
  } catch (error) {
    console.error('[Turnstile] Verification error:', error);
    return { success: false, error: 'Verification request error' };
  }
}
