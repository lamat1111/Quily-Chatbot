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

// Temporal keywords that indicate the user wants recent content
// Includes translations for major languages to support multilingual queries
const TEMPORAL_KEYWORDS = [
  // English
  'last', 'latest', 'recent', 'newest', 'most recent', 'previous',
  // Chinese (Simplified & Traditional)
  '最近', '最新', '上一次', '最後', '最后', '近期', '之前',
  // Spanish
  'último', 'última', 'reciente', 'más reciente', 'anterior',
  // French
  'dernier', 'dernière', 'récent', 'récente', 'plus récent', 'précédent',
  // German
  'letzte', 'letzten', 'neueste', 'aktuell', 'kürzlich', 'vorherige',
  // Portuguese
  'último', 'última', 'recente', 'mais recente', 'anterior',
  // Italian
  'ultimo', 'ultima', 'recente', 'più recente', 'precedente',
  // Russian
  'последний', 'последняя', 'недавний', 'новейший', 'предыдущий',
  // Japanese
  '最近', '最新', '前回', '直近',
  // Korean
  '최근', '최신', '마지막', '이전',
  // Arabic
  'الأخير', 'الأحدث', 'الأخيرة',
  // Hindi
  'पिछला', 'हाल', 'नवीनतम',
];

/**
 * Check if query contains temporal keywords indicating recency intent
 */
function isTemporalQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return TEMPORAL_KEYWORDS.some(keyword => lowerQuery.includes(keyword));
}

/**
 * Fetch the most recent document chunks by publication date
 * Used to augment vector search for temporal queries
 * Returns chunks from unique source files (most recent documents)
 */
async function fetchRecentChunks(limit: number = 3): Promise<{
  id: number;
  content: string;
  source_file: string;
  heading_path: string | null;
  source_url: string | null;
  published_date: string | null;
  title: string | null;
  doc_type: string | null;
  similarity: number;
}[]> {
  const { data, error } = await supabase
    .from('document_chunks_chutes')
    .select('id, content, source_file, heading_path, source_url, published_date, title, doc_type')
    .not('published_date', 'is', null)
    .order('published_date', { ascending: false })
    .limit(limit * 5); // Fetch more to get unique source files

  if (error || !data) {
    console.warn('Failed to fetch recent chunks:', error?.message);
    return [];
  }

  // Deduplicate by source_file, keeping the first chunk from each unique document
  const seen = new Set<string>();
  const unique = data.filter(chunk => {
    if (seen.has(chunk.source_file)) return false;
    seen.add(chunk.source_file);
    return true;
  }).slice(0, limit);

  // Add a synthetic similarity score (high since we're explicitly fetching for recency)
  return unique.map(chunk => ({
    ...chunk,
    similarity: 0.6, // Synthetic score to indicate relevance
  }));
}

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
  const { data: vectorCandidates, error } = await supabase.rpc(rpcFunction, {
    query_embedding: embedding,
    match_threshold: similarityThreshold,
    match_count: initialCount,
  });

  if (error) {
    throw new Error(`Supabase RPC error: ${error.message}`);
  }

  // For temporal queries, augment with recent content by date
  // This ensures "last/recent/latest" queries include actually recent documents
  // regardless of how the user phrases their request (works for any language)
  let candidates = vectorCandidates || [];

  if (isTemporalQuery(query)) {
    const recentChunks = await fetchRecentChunks(3);

    // Merge recent chunks with vector results, avoiding duplicates
    const existingIds = new Set(candidates.map((c: { id: number }) => c.id));
    const newChunks = recentChunks.filter(c => !existingIds.has(c.id));

    // Prepend recent chunks so they're prioritized
    candidates = [...newChunks, ...candidates];
  }

  if (candidates.length === 0) {
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
