/**
 * Cloudflare Workers AI Reranker
 * Uses BGE reranker model via REST API.
 * Free tier: 10,000 neurons/day (~7,100 reranks)
 */

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4/accounts';
const MODEL_ID = '@cf/baai/bge-reranker-base';
const REQUEST_TIMEOUT_MS = 10000;

interface CloudflareResponse {
  result: { response: Array<{ id: number; score: number }> };
  success: boolean;
  errors: Array<{ message: string }>;
}

export interface RerankResult {
  index: number;
  score: number;
}

export async function rerankWithCloudflare(
  query: string,
  documents: string[],
  topK: number,
  accountId: string,
  apiToken: string
): Promise<RerankResult[]> {
  // Input validation
  if (!query.trim() || documents.length === 0) {
    return [];
  }

  const effectiveTopK = Math.min(topK, documents.length);
  const url = `${CLOUDFLARE_API_BASE}/${accountId}/ai/run/${MODEL_ID}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        contexts: documents.map((text) => ({ text })),
        top_k: effectiveTopK,
      }),
      signal: controller.signal,
    });

    if (response.status === 429) {
      throw new Error('Cloudflare rate limit exceeded');
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Cloudflare API error ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as CloudflareResponse;

    if (!data.success || !data.result?.response) {
      const errorMsg = data.errors?.[0]?.message || 'Unknown Cloudflare error';
      throw new Error(`Cloudflare rerank failed: ${errorMsg}`);
    }

    return data.result.response.map((item) => ({
      index: item.id,
      score: item.score,
    }));
  } finally {
    clearTimeout(timeoutId);
  }
}
