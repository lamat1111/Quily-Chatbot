/**
 * OpenRouter API utilities for the chat interface.
 */

/**
 * Recommended models for the chat interface dropdown.
 * Curated for quality and availability on OpenRouter.
 * Open-source models are listed first to align with Quilibrium's values.
 */
/** Default model ID - best balance of quality, speed, and cost */
export const DEFAULT_MODEL_ID = 'meta-llama/llama-3.1-70b-instruct';

export const RECOMMENDED_MODELS = [
  // Open Source Models - Recommended first
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    description: 'Best balance of quality, speed, and cost.',
    isOpenSource: true,
    isRecommended: true,
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    description: 'Advanced reasoning for complex questions. Slower responses.',
    isOpenSource: true,
    isRecommended: false,
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct',
    name: 'Qwen 2.5 72B',
    description: 'Strong multilingual support. Low cost.',
    isOpenSource: true,
    isRecommended: false,
  },
  {
    id: 'mistralai/mixtral-8x7b-instruct',
    name: 'Mixtral 8x7B',
    description: 'Fast responses. Cheapest option.',
    isOpenSource: true,
    isRecommended: false,
  },
  // Proprietary Models
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Excellent reasoning and writing. Premium pricing.',
    isOpenSource: false,
    isRecommended: false,
  },
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    description: 'Large context window for long docs. Mid-range pricing.',
    isOpenSource: false,
    isRecommended: false,
  },
] as const;

export type RecommendedModel = (typeof RECOMMENDED_MODELS)[number];

/**
 * Validates an OpenRouter API key by checking account credits.
 *
 * Uses /api/v1/credits which requires authentication - returns 401 for invalid keys.
 * The /models endpoint is public and doesn't validate keys.
 *
 * @param apiKey - OpenRouter API key to validate
 * @returns true if the API key is valid, false otherwise
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey || apiKey.trim().length === 0) {
    return false;
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/credits', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
      },
    });

    // 200 = valid key, 401/403 = invalid key
    return response.ok;
  } catch (error) {
    console.warn('Error validating OpenRouter API key:', error);
    return false;
  }
}
