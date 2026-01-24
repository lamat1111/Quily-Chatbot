import { embed, rerank } from 'ai';
import { cohere } from '@ai-sdk/cohere';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { supabase } from '../supabase';
import type { RetrievedChunk, RetrievalOptions } from './types';

/**
 * Two-stage retrieval with optional Cohere reranking
 *
 * Stage 1: Vector search via Supabase RPC
 * Stage 2: Rerank with Cohere if API key available
 *
 * @param query - User's search query
 * @param options - Retrieval configuration
 * @returns Array of retrieved chunks with citation indices
 */
export async function retrieveWithReranking(
  query: string,
  options: RetrievalOptions
): Promise<RetrievedChunk[]> {
  const {
    embeddingApiKey,
    cohereApiKey,
    initialCount = 15,
    finalCount = 5,
    similarityThreshold = 0.5,
  } = options;

  // Stage 1: Vector search
  const openrouter = createOpenRouter({ apiKey: embeddingApiKey });

  // Embed query using same model as ingestion (text-embedding-3-small)
  const { embedding } = await embed({
    model: openrouter.textEmbeddingModel('openai/text-embedding-3-small'),
    value: query,
  });

  // Call Supabase RPC for similarity search
  const { data: candidates, error } = await supabase.rpc('match_document_chunks', {
    query_embedding: embedding,
    match_threshold: similarityThreshold,
    match_count: initialCount,
  });

  if (error) {
    throw new Error(`Supabase RPC error: ${error.message}`);
  }

  if (!candidates || candidates.length === 0) {
    return [];
  }

  // Resolve Cohere API key: options > environment
  const resolvedCohereKey = cohereApiKey || process.env.COHERE_API_KEY;

  // Stage 2: Optional reranking
  if (resolvedCohereKey && candidates.length > finalCount) {
    // Rerank with Cohere
    const { results: rerankedDocuments } = await rerank({
      model: cohere.reranking('rerank-v3.5', { apiKey: resolvedCohereKey }),
      query,
      documents: candidates.map((c: { content: string }) => c.content),
      topN: finalCount,
    });

    // Map reranked results back to chunks with metadata
    return rerankedDocuments.map((reranked, idx) => {
      const original = candidates[reranked.index];
      return {
        id: original.id,
        content: original.content,
        source_file: original.source_file,
        heading_path: original.heading_path,
        similarity: original.similarity,
        citationIndex: idx + 1,
      };
    });
  }

  // Fallback: No reranking, take top N by similarity
  return candidates.slice(0, finalCount).map((chunk: {
    id: number;
    content: string;
    source_file: string;
    heading_path: string | null;
    similarity: number;
  }, idx: number) => ({
    ...chunk,
    citationIndex: idx + 1,
  }));
}
