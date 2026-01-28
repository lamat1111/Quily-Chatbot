/**
 * OpenRouter API utilities for the chat interface.
 */

/**
 * Recommended models for the chat interface dropdown.
 * DeepSeek V3 is recommended for best reasoning at low cost.
 * Open-source models are listed first, followed by proprietary options.
 */

/** Default model ID - DeepSeek V3 for best open-source quality */
export const DEFAULT_MODEL_ID = process.env.NEXT_PUBLIC_DEFAULT_MODEL_ID || 'deepseek/deepseek-chat';

export interface ModelMetadata {
  id: string;
  name: string;
  description: string;
  isOpenSource: boolean;
  isRecommended: boolean;
}

const BASE_RECOMMENDED_MODELS: ModelMetadata[] = [
  // Open Source Models - Recommended
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3',
    description: 'Best open-source. Excellent reasoning and accuracy.',
    isOpenSource: true,
    isRecommended: true,
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    description: 'Advanced reasoning. Great for complex questions.',
    isOpenSource: true,
    isRecommended: false,
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct',
    name: 'Qwen 2.5 72B',
    description: 'High quality. Strong multilingual support.',
    isOpenSource: true,
    isRecommended: false,
  },
  // Proprietary Models
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    description: 'Most accurate. Premium pricing.',
    isOpenSource: false,
    isRecommended: false,
  },
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash',
    description: 'Fast and capable. Good for general questions.',
    isOpenSource: false,
    isRecommended: false,
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'Well-rounded performance. Premium pricing.',
    isOpenSource: false,
    isRecommended: false,
  },
];

/**
 * Get recommended models, potentially merging with environment overrides
 */
export function getRecommendedModels(): ModelMetadata[] {
  const overridesStr = process.env.NEXT_PUBLIC_ADDITIONAL_MODELS;
  if (!overridesStr) return [...BASE_RECOMMENDED_MODELS];

  try {
    const overrides = JSON.parse(overridesStr) as ModelMetadata[];
    // Merge overrides by ID, ensuring no duplicates
    const models = [...BASE_RECOMMENDED_MODELS];
    for (const override of overrides) {
      const index = models.findIndex((m) => m.id === override.id);
      if (index >= 0) {
        models[index] = override;
      } else {
        models.push(override);
      }
    }
    return models;
  } catch (e) {
    console.warn('Failed to parse NEXT_PUBLIC_ADDITIONAL_MODELS:', e);
    return [...BASE_RECOMMENDED_MODELS];
  }
}

export const RECOMMENDED_MODELS = BASE_RECOMMENDED_MODELS;

/**
 * Result from validating an OpenRouter API key
 */
export interface ApiKeyValidationResult {
  valid: boolean;
  hasCredits: boolean;
  balance?: number;
  error?: 'invalid_key' | 'no_credits' | 'network_error';
}

/**
 * Validates an OpenRouter API key and checks credit balance.
 *
 * Uses /api/v1/credits which requires authentication - returns 401 for invalid keys.
 * Also checks if the account has sufficient credits to make requests.
 *
 * @param apiKey - OpenRouter API key to validate
 * @returns Validation result with key validity and credit status
 */
export async function validateApiKeyWithCredits(
  apiKey: string
): Promise<ApiKeyValidationResult> {
  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false, hasCredits: false, error: 'invalid_key' };
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/credits', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
      },
    });

    // 401/403 = invalid key
    if (!response.ok) {
      return { valid: false, hasCredits: false, error: 'invalid_key' };
    }

    // Parse the credits response
    const data = await response.json();
    // OpenRouter returns { data: { total_credits: number, total_usage: number } }
    const totalCredits = data?.data?.total_credits ?? 0;
    const totalUsage = data?.data?.total_usage ?? 0;
    const balance = totalCredits - totalUsage;

    // Key is valid, check if there are credits
    if (balance <= 0) {
      return { valid: true, hasCredits: false, balance, error: 'no_credits' };
    }

    return { valid: true, hasCredits: true, balance };
  } catch (error) {
    console.warn('Error validating OpenRouter API key:', error);
    return { valid: false, hasCredits: false, error: 'network_error' };
  }
}

/**
 * Simple validation that just checks if the key is valid (for backwards compatibility).
 * @deprecated Use validateApiKeyWithCredits for full credit checking
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  const result = await validateApiKeyWithCredits(apiKey);
  return result.valid;
}
