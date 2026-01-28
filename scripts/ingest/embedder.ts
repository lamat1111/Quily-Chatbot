import { embedMany } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import type { ChunkWithContext, DocumentChunk } from './types.js';

// Batch size for embedding requests (stay under token limits)
const BATCH_SIZE = 50;

// Embedding model - BGE-M3 produces 1024 dimensions
// Chosen for: better retrieval quality (MTEB 63.0 vs 55.8), open source (MIT),
// and compatibility with both OpenRouter and Chutes providers
const EMBEDDING_MODEL = 'baai/bge-m3';

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
 * Generate embeddings for chunks in batches
 * @param chunks - Chunks with content and metadata
 * @param apiKey - OpenRouter API key
 * @param onProgress - Optional callback for progress updates
 * @returns Chunks with embeddings attached
 */
export async function generateEmbeddings(
  chunks: ChunkWithContext[],
  apiKey: string,
  onProgress?: (completed: number, total: number) => void
): Promise<DocumentChunk[]> {
  const openrouter = createOpenRouter({
    apiKey,
  });

  const results: DocumentChunk[] = [];
  const total = chunks.length;

  // Process in batches
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map(formatForEmbedding);

    try {
      const { embeddings } = await embedMany({
        model: openrouter.textEmbeddingModel(EMBEDDING_MODEL),
        values: texts,
        maxRetries: 3,
      });

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
        `Embedding batch ${batchNum}/${totalBatches} failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return results;
}
