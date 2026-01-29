import { embed, rerank } from 'ai';
import { createCohere } from '@ai-sdk/cohere';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createChutes } from '@chutes-ai/ai-sdk-provider';
import { supabase } from '../supabase';
import type { RetrievedChunk, RetrievalOptions } from './types';

// Unified embedding model - BGE-M3 (1024 dims)
// Both OpenRouter and Chutes produce identical vectors for this model,
// allowing us to use a single table regardless of which provider generates the query embedding
const UNIFIED_EMBEDDING_MODEL = 'baai/bge-m3';
const CHUTES_EMBEDDING_MODEL = 'chutes-baai-bge-m3';

/**
 * Two-stage retrieval with optional Cohere reranking
 *
 * Stage 1: Vector search via Supabase RPC
 * Stage 2: Rerank with Cohere if API key available
 *
 * Graceful degradation: If reranking fails, falls back to similarity-based selection
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
    embeddingProvider = 'openrouter',
    embeddingApiKey,
    chutesAccessToken,
    embeddingModel,
    cohereApiKey,
    initialCount = 15,
    finalCount = 5,
    similarityThreshold = 0.35, // Lower threshold - text-embedding-3-small typically produces 0.3-0.6 similarity scores
  } = options;

  // Stage 1: Vector search using unified BGE-M3 model
  // Both providers produce identical vectors, so we use the same table for all queries
  let embeddingResult;

  if (embeddingProvider === 'chutes') {
    if (!chutesAccessToken) {
      throw new Error('Chutes access token is required for embeddings');
    }
    const chutes = createChutes({ apiKey: chutesAccessToken });
    const modelId = embeddingModel || CHUTES_EMBEDDING_MODEL;

    embeddingResult = await embed({
      model: chutes.textEmbeddingModel(modelId),
      value: query,
    });
  } else {
    if (!embeddingApiKey) {
      throw new Error('OpenRouter API key is required for embeddings');
    }
    const openrouter = createOpenRouter({ apiKey: embeddingApiKey });

    embeddingResult = await embed({
      model: openrouter.textEmbeddingModel(
        embeddingModel || process.env.OPENROUTER_EMBEDDING_MODEL || UNIFIED_EMBEDDING_MODEL
      ),
      value: query,
    });
  }

  const { embedding } = embeddingResult;

  // Use unified BGE-M3 table (1024-dim) for all providers
  // OpenRouter and Chutes BGE-M3 produce identical vectors, verified by compatibility testing
  const rpcFunction = 'match_document_chunks_chutes';

  // Call Supabase RPC for similarity search
  const { data: candidates, error } = await supabase.rpc(rpcFunction, {
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

  // Helper to map reranked results to chunks
  const mapRankedToChunks = (
    ranking: { originalIndex: number; score: number }[]
  ): RetrievedChunk[] => {
    return ranking.map((ranked, idx) => {
      const original = candidates[ranked.originalIndex];
      return {
        id: original.id,
        content: original.content,
        source_file: original.source_file,
        heading_path: original.heading_path,
        source_url: original.source_url,
        similarity: original.similarity,
        citationIndex: idx + 1,
      };
    });
  };

  // Helper for similarity-based fallback
  const fallbackToSimilarity = (): RetrievedChunk[] => {
    return candidates
      .slice(0, finalCount)
      .map(
        (
          chunk: {
            id: number;
            content: string;
            source_file: string;
            heading_path: string | null;
            source_url: string | null;
            similarity: number;
          },
          idx: number
        ) => ({
          ...chunk,
          citationIndex: idx + 1,
        })
      );
  };

  // Stage 2: Reranking (with graceful fallback)
  // Only attempt reranking if we have more candidates than finalCount
  if (candidates.length <= finalCount) {
    return fallbackToSimilarity();
  }

  // Resolve Cohere API key: options > environment
  const resolvedCohereKey = cohereApiKey || process.env.COHERE_API_KEY;

  // Try Cohere reranking (paid, highest quality)
  if (resolvedCohereKey) {
    try {
      const cohereProvider = createCohere({ apiKey: resolvedCohereKey });
      const { ranking } = await rerank({
        model: cohereProvider.reranking('rerank-v3.5'),
        query,
        documents: candidates.map((c: { content: string }) => c.content),
        topN: finalCount,
      });
      return mapRankedToChunks(ranking);
    } catch (cohereError) {
      console.warn('Cohere reranking failed, falling back to similarity:', cohereError);
      // Fall through to similarity
    }
  }

  // Fallback to similarity-based selection
  return fallbackToSimilarity();
}
