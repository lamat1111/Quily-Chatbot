import type { ChunkWithContext, DocumentChunk } from './types.js';

// Batch size for embedding requests (stay under token limits)
const BATCH_SIZE = 50;

// Chutes embedding model slug - BGE-M3 produces 1024 dimensions
const DEFAULT_EMBEDDING_MODEL_SLUG = 'chutes-baai-bge-m3';

// Chutes API response type
interface ChutesEmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
  }>;
  model: string;
}

/**
 * Format chunk content with heading context for better embeddings
 */
function formatForEmbedding(chunk: ChunkWithContext): string {
  if (chunk.metadata.heading_path) {
    return `${chunk.metadata.heading_path}\n\n${chunk.content}`;
  }
  return chunk.content;
}

/**
 * Call Chutes embedding API directly
 * The AI SDK provider has a bug where it routes to api.chutes.ai instead of the chute URL
 */
async function callChutesEmbeddingAPI(
  texts: string[],
  apiKey: string,
  modelSlug: string
): Promise<number[][]> {
  const url = `https://${modelSlug}.chutes.ai/v1/embeddings`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: texts,
      model: 'BAAI/bge-m3', // The underlying model name
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Chutes API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as ChutesEmbeddingResponse;

  // Sort by index to ensure order matches input
  const sorted = [...data.data].sort((a, b) => a.index - b.index);
  return sorted.map((item) => item.embedding);
}

/**
 * Generate embeddings for chunks using Chutes BGE-M3 model
 * @param chunks - Chunks with content and metadata
 * @param apiKey - Chutes API key
 * @param onProgress - Optional callback for progress updates
 * @returns Chunks with embeddings attached (1024 dimensions)
 */
export async function generateChutesEmbeddings(
  chunks: ChunkWithContext[],
  apiKey: string,
  onProgress?: (completed: number, total: number) => void
): Promise<DocumentChunk[]> {
  const modelSlug = process.env.CHUTES_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL_SLUG;

  const results: DocumentChunk[] = [];
  const total = chunks.length;

  // Process in batches
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map(formatForEmbedding);

    try {
      const embeddings = await callChutesEmbeddingAPI(texts, apiKey, modelSlug);

      // Attach embeddings to chunks
      for (let j = 0; j < batch.length; j++) {
        results.push({
          ...batch[j],
          embedding: embeddings[j],
        });
      }

      // Report progress
      if (onProgress) {
        onProgress(Math.min(i + BATCH_SIZE, total), total);
      }

      // Small delay between batches to avoid rate limits
      if (i + BATCH_SIZE < chunks.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      // Re-throw with context about which batch failed
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);
      throw new Error(
        `Chutes embedding batch ${batchNum}/${totalBatches} failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return results;
}
