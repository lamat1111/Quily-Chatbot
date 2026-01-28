import { embed, rerank } from 'ai';
import { createCohere } from '@ai-sdk/cohere';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createChutes } from '@chutes-ai/ai-sdk-provider';
import { supabase } from '../supabase';
import type { RetrievedChunk, RetrievalOptions } from './types';

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

  // Stage 1: Vector search
  let embeddingResult;

  if (embeddingProvider === 'chutes') {
    if (!chutesAccessToken) {
      throw new Error('Chutes access token is required for embeddings');
    }
    const chutes = createChutes({ apiKey: chutesAccessToken });
    const modelId =
      embeddingModel || process.env.CHUTES_EMBEDDING_MODEL || 'https://embeddings.chutes.ai';

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
        process.env.OPENROUTER_EMBEDDING_MODEL || 'openai/text-embedding-3-small'
      ),
      value: query,
    });
  }

  const { embedding } = embeddingResult;

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
