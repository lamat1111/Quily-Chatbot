/**
 * Chute discovery and filtering utilities for Chutes.ai
 */

export interface ChuteInfo {
  chute_id: string;
  slug: string;
  name: string;
  standard_template?: string;
  description?: string;
  tagline?: string;
  public?: boolean;
}

/**
 * Metadata for curated LLM models.
 * Includes descriptions, badges, and display order.
 */
export interface CuratedModelMetadata {
  slug: string;
  displayName: string;
  description: string;
  isOpenSource: boolean;
  isRecommended: boolean;
  order: number;
}

/**
 * Curated list of high-quality LLM models for the chat interface.
 * Aligned with OpenRouter's open-source offerings for consistency.
 * Power users can still use any model via the manual URL input.
 */
const CURATED_LLM_MODELS: CuratedModelMetadata[] = [
  // DeepSeek - Top recommendation (matches OpenRouter)
  {
    slug: 'chutes-deepseek-ai-deepseek-v3',
    displayName: 'DeepSeek V3',
    description: 'Best open-source. Excellent reasoning and accuracy.',
    isOpenSource: true,
    isRecommended: true,
    order: 1,
  },
  {
    slug: 'chutes-deepseek-ai-deepseek-r1-tee',
    displayName: 'DeepSeek R1',
    description: 'Advanced reasoning. Great for complex questions.',
    isOpenSource: true,
    isRecommended: false,
    order: 2,
  },
  // Qwen - Strong multilingual (matches OpenRouter)
  {
    slug: 'chutes-qwen-qwen2-5-72b-instruct',
    displayName: 'Qwen 2.5 72B',
    description: 'High quality. Strong multilingual support.',
    isOpenSource: true,
    isRecommended: false,
    order: 3,
  },
  // Additional Chutes-exclusive options
  {
    slug: 'chutes-qwen-qwen3-32b',
    displayName: 'Qwen 3 32B',
    description: 'Fast and capable. Good instruction following.',
    isOpenSource: true,
    isRecommended: false,
    order: 4,
  },
  {
    slug: 'chutes-chutesai-mistral-small-3-2-24b-instruct-2506',
    displayName: 'Mistral Small 3.2',
    description: 'Good balance of speed and quality.',
    isOpenSource: true,
    isRecommended: false,
    order: 5,
  },
  {
    slug: 'chutes-nousresearch-hermes-4-70b',
    displayName: 'Hermes 4 70B',
    description: 'Excellent for Q&A and reasoning tasks.',
    isOpenSource: true,
    isRecommended: false,
    order: 6,
  },
];

/**
 * Curated list of embedding models for RAG.
 */
const CURATED_EMBEDDING_MODELS: CuratedModelMetadata[] = [
  {
    slug: 'chutes-baai-bge-m3',
    displayName: 'BGE-M3',
    description: 'Multilingual embedding model.',
    isOpenSource: true,
    isRecommended: true,
    order: 1,
  },
  {
    slug: 'chutes-baai-bge-large-en-v1-5',
    displayName: 'BGE Large EN',
    description: 'English-focused embedding model.',
    isOpenSource: true,
    isRecommended: false,
    order: 2,
  },
];

export interface ChutesAPIResponse {
  total: number;
  items: ChuteInfo[];
}

/**
 * Fetch available chutes from the Chutes.ai Management API.
 * Uses the server-side API key (CHUTES_API_KEY) since OAuth tokens
 * cannot access the /chutes/ management endpoint.
 */
export async function discoverChutes(
  _accessToken?: string,
  includePublic: boolean = true,
  limit: number = 500
): Promise<ChuteInfo[]> {
  const apiKey = process.env.CHUTES_API_KEY;
  if (!apiKey) {
    throw new Error('CHUTES_API_KEY is required for model discovery');
  }

  const queryParams = new URLSearchParams({
    include_public: String(includePublic),
    limit: String(limit),
  });

  const url = `https://api.chutes.ai/chutes/?${queryParams}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch chutes: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as ChutesAPIResponse;
  return data.items || [];
}

/**
 * Get the curated model metadata, with optional env var overrides.
 * Set CHUTES_ALLOWED_LLM_MODELS or CHUTES_ALLOWED_EMBEDDING_MODELS to customize.
 */
export function getCuratedModels(type: 'llm' | 'embedding'): CuratedModelMetadata[] {
  if (type === 'llm') {
    const envOverride = process.env.CHUTES_ALLOWED_LLM_MODELS;
    if (envOverride) {
      // If env override, create basic metadata for custom slugs
      return envOverride.split(',').map((slug, idx) => ({
        slug: slug.trim(),
        displayName: slug.trim(),
        description: '',
        isOpenSource: true,
        isRecommended: idx === 0,
        order: idx + 1,
      }));
    }
    return [...CURATED_LLM_MODELS].sort((a, b) => a.order - b.order);
  } else {
    const envOverride = process.env.CHUTES_ALLOWED_EMBEDDING_MODELS;
    if (envOverride) {
      return envOverride.split(',').map((slug, idx) => ({
        slug: slug.trim(),
        displayName: slug.trim(),
        description: '',
        isOpenSource: true,
        isRecommended: idx === 0,
        order: idx + 1,
      }));
    }
    return [...CURATED_EMBEDDING_MODELS].sort((a, b) => a.order - b.order);
  }
}

/**
 * Get just the slugs from curated models (for filtering).
 */
function getCuratedSlugs(type: 'llm' | 'embedding'): string[] {
  return getCuratedModels(type).map((m) => m.slug);
}

/**
 * Filter chutes by type using a curated whitelist.
 * Only returns models from the curated list to keep the dropdown manageable.
 * Power users can still use any model via the manual URL/slug input field.
 */
export function filterChutesByType(chutes: ChuteInfo[], type: string): ChuteInfo[] {
  const lowerType = type.toLowerCase();

  switch (lowerType) {
    case 'embedding':
    case 'embeddings': {
      const allowedSlugs = getCuratedSlugs('embedding');
      return chutes.filter((chute) => allowedSlugs.includes(chute.slug));
    }

    case 'llm':
    case 'text':
    case 'chat': {
      const allowedSlugs = getCuratedSlugs('llm');
      return chutes.filter((chute) => allowedSlugs.includes(chute.slug));
    }

    default:
      return chutes;
  }
}

/**
 * Construct chute URL from slug
 */
export function getChuteUrl(slug: string): string {
  if (slug.startsWith('http://') || slug.startsWith('https://')) {
    return slug;
  }
  return `https://${slug}.chutes.ai`;
}
