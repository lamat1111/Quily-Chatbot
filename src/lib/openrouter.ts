/**
 * OpenRouter API utilities for the chat interface.
 */

/**
 * Recommended models for the chat interface dropdown.
 * Claude Sonnet is recommended for best accuracy with RAG.
 * Open-source models are available but may be less accurate for technical questions.
 */

/** Default model ID - Claude Sonnet for best accuracy */
export const DEFAULT_MODEL_ID = 'anthropic/claude-sonnet-4';

export const RECOMMENDED_MODELS = [
  // Best Quality - Recommended
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    description: 'Most accurate. Premium pricing.',
    isOpenSource: false,
    isRecommended: true,
  },
  // Open Source Models - May be less accurate
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    description: 'Good quality. May be less accurate on technical details.',
    isOpenSource: true,
    isRecommended: false,
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct',
    name: 'Qwen 2.5 72B',
    description: 'Good multilingual support. May be less accurate on technical details.',
    isOpenSource: true,
    isRecommended: false,
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    description: 'Advanced reasoning. May hallucinate technical details.',
    isOpenSource: true,
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
