/**
 * POST /api/auth/openrouter/validate-key
 *
 * Validates an OpenRouter API key by calling the /credits endpoint.
 * Returns validation result and credit balance on success.
 */

interface OpenRouterCreditsResponse {
  data?: {
    total_credits?: number;
    total_usage?: number;
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return Response.json(
        { valid: false, hasCredits: false, error: 'invalid_key' },
        { status: 400 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/credits', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    // 401/403 = invalid key
    if (!response.ok) {
      return Response.json(
        { valid: false, hasCredits: false, error: 'invalid_key' },
        { status: 200 }
      );
    }

    // Parse the credits response
    const data: OpenRouterCreditsResponse = await response.json();
    const totalCredits = data?.data?.total_credits ?? 0;
    const totalUsage = data?.data?.total_usage ?? 0;
    const balance = totalCredits - totalUsage;

    // Key is valid, check if there are credits
    if (balance <= 0) {
      return Response.json({
        valid: true,
        hasCredits: false,
        balance: 0,
        error: 'no_credits',
      });
    }

    return Response.json({
      valid: true,
      hasCredits: true,
      balance,
    });
  } catch (error) {
    console.error('OpenRouter API key validation error:', error);
    return Response.json(
      { valid: false, hasCredits: false, error: 'network_error' },
      { status: 500 }
    );
  }
}
