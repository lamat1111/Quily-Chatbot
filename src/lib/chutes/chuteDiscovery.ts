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

export interface ChutesAPIResponse {
  total: number;
  items: ChuteInfo[];
}

/**
 * Fetch available chutes from the Chutes.ai Management API
 */
export async function discoverChutes(
  accessToken: string,
  includePublic: boolean = true,
  limit: number = 500
): Promise<ChuteInfo[]> {
  if (!accessToken) {
    throw new Error('Access token is required for chute discovery');
  }

  const queryParams = new URLSearchParams({
    include_public: String(includePublic),
    limit: String(limit),
  });

  const url = `https://api.chutes.ai/chutes/?${queryParams}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
 * Filter chutes by type (embedding, llm, image, etc.)
 * Uses standard templates and keyword heuristics from Chutes.ai examples.
 */
export function filterChutesByType(chutes: ChuteInfo[], type: string): ChuteInfo[] {
  const lowerType = type.toLowerCase();

  // Allow dynamic template matching via env vars for future-proofing
  const embeddingTemplates = (process.env.CHUTES_EMBEDDING_TEMPLATES || 'tei,embedding').split(',');
  const llmTemplates = (process.env.CHUTES_LLM_TEMPLATES || 'vllm,llm').split(',');

  switch (lowerType) {
    case 'embedding':
    case 'embeddings':
      return chutes.filter((chute) => {
        const template = chute.standard_template?.toLowerCase() || '';
        const name = chute.name?.toLowerCase() || '';
        const description = chute.description?.toLowerCase() || '';
        const tagline = chute.tagline?.toLowerCase() || '';

        return (
          embeddingTemplates.includes(template) ||
          name.includes('embed') ||
          description.includes('embed') ||
          tagline.includes('embed')
        );
      });

    case 'llm':
    case 'text':
    case 'chat':
      return chutes.filter((chute) => {
        const template = chute.standard_template?.toLowerCase() || '';
        const name = chute.name?.toLowerCase() || '';

        return (
          llmTemplates.includes(template) ||
          name.includes('llm') ||
          name.includes('gpt') ||
          name.includes('claude') ||
          name.includes('llama') ||
          name.includes('mistral') ||
          name.includes('kimi') ||
          name.includes('glm')
        );
      });

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
