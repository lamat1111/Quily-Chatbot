import { embed, rerank } from 'ai';
import { createCohere } from '@ai-sdk/cohere';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { supabase } from '../supabase';
import type { RetrievedChunk, RetrievalOptions } from './types';

// Unified embedding model - BGE-M3 (1024 dims)
// Both OpenRouter and Chutes produce identical vectors for this model,
// allowing us to use a single table regardless of which provider generates the query embedding
const UNIFIED_EMBEDDING_MODEL = 'baai/bge-m3';
const CHUTES_EMBEDDING_MODEL_SLUG = 'chutes-baai-bge-m3';

// Chutes API response type
interface ChutesEmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
  }>;
  model: string;
}

/**
 * Call Chutes embedding API directly
 * The AI SDK provider has a bug where it routes to api.chutes.ai instead of the chute URL
 */
async function getChutesEmbedding(text: string, apiKey: string): Promise<number[]> {
  const url = `https://${CHUTES_EMBEDDING_MODEL_SLUG}.chutes.ai/v1/embeddings`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: [text],
      model: 'BAAI/bge-m3',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Chutes API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as ChutesEmbeddingResponse;
  return data.data[0].embedding;
}

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
  let embedding: number[];

  if (embeddingProvider === 'chutes') {
    if (!chutesAccessToken) {
      throw new Error('Chutes access token is required for embeddings');
    }
    // Use direct API call (Chutes AI SDK has a routing bug)
    embedding = await getChutesEmbedding(query, chutesAccessToken);
  } else {
    if (!embeddingApiKey) {
      throw new Error('OpenRouter API key is required for embeddings');
    }
    const openrouter = createOpenRouter({ apiKey: embeddingApiKey });

    const embeddingResult = await embed({
      model: openrouter.textEmbeddingModel(
        embeddingModel || process.env.OPENROUTER_EMBEDDING_MODEL || UNIFIED_EMBEDDING_MODEL
      ),
      value: query,
    });
    embedding = embeddingResult.embedding;
  }

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
        published_date: original.published_date,
        title: original.title,
        doc_type: original.doc_type,
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
            published_date: string | null;
            title: string | null;
            doc_type: string | null;
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
