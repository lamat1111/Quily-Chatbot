import { embed, rerank } from 'ai';
import { createCohere } from '@ai-sdk/cohere';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { supabase } from '../supabase';
import type { RetrievedChunk, RetrievalOptions } from './types';
import { rerankWithCloudflare } from './cloudflare-reranker';

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

// Keywords that indicate the user is asking about multiple topics / wants a broad overview
const BROAD_QUERY_KEYWORDS = [
  'all', 'every', 'list', 'overview', 'summary', 'summarize',
  'products', 'services', 'features', 'tools', 'offerings',
  'what can', 'what does quilibrium offer', 'tell me about quilibrium',
  'everything', 'ecosystem', 'compare',
];

/**
 * Check if query is broad/multi-topic, warranting more retrieved chunks
 */
function isBroadQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return BROAD_QUERY_KEYWORDS.some(keyword => lowerQuery.includes(keyword));
}

// Known Quilibrium products/entities for query decomposition.
// When a broad or multi-entity query is detected, sub-queries are generated
// for matched entities so each product gets its own retrieval pass.
// Update this list when adding new product docs to the RAG knowledge base.
const KNOWN_ENTITIES = [
  // Well-documented (dedicated docs exist in RAG knowledge base)
  { name: 'QStorage', query: 'QStorage S3-compatible decentralized object storage',
    keywords: ['qstorage', 'storage', 'store', 'object storage', 's3', 'data storage'] },
  { name: 'QKMS', query: 'QKMS multi-party computation key management MPC',
    keywords: ['qkms', 'key management', 'keys', 'encrypt', 'encryption', 'kms', 'mpc'] },
  { name: 'QNS', query: 'QNS name service naming identity',
    keywords: ['qns', 'name service', 'naming', 'domain', '.q'] },
  { name: 'Quorum', query: 'Quorum peer-to-peer encrypted messenger',
    keywords: ['quorum', 'messenger', 'messaging', 'chat', 'wallet'] },
  { name: 'Hypersnap', query: 'Hypersnap Snapchain Farcaster Rust implementation',
    keywords: ['hypersnap', 'snapchain', 'farcaster', 'snap'] },

  // Lightly documented (mentioned in talks/overviews, no dedicated docs yet)
  { name: 'Quark', query: 'Quark 3D game asset library SDK',
    keywords: ['quark', 'game', 'gaming', '3d', 'asset', 'game engine'] },
  { name: 'QPing', query: 'QPing dispatch notification mechanism',
    keywords: ['qping', 'ping', 'dispatch', 'notification'] },
  { name: 'Bridge', query: 'Bridge Ethereum cross-chain QUIL wQUIL',
    keywords: ['bridge', 'cross-chain', 'wquil', 'bridging'] },
  { name: 'QQ', query: 'QQ SQS-compatible message queue service',
    keywords: ['qq', 'message queue', 'sqs', 'queue'] },
] as const;

type KnownEntity = (typeof KNOWN_ENTITIES)[number];

/**
 * Find entities mentioned in the query by scanning keyword mappings.
 * Returns matched entities (empty array if none matched).
 */
function findMatchedEntities(query: string): KnownEntity[] {
  const lowerQuery = query.toLowerCase();
  return KNOWN_ENTITIES.filter(entity =>
    entity.keywords.some(kw => lowerQuery.includes(kw))
  );
}

/**
 * Reciprocal Rank Fusion — merges multiple ranked result lists into a single score.
 * Formula: score(doc) = Σ 1/(k + rank) where k=60 (standard constant from RAG-Fusion paper).
 * Ranks are 0-indexed positions within each result list.
 */
function reciprocalRankFusion(
  rankedLists: { id: number }[][],
  k: number = 60
): Map<number, number> {
  const scores = new Map<number, number>();
  for (const list of rankedLists) {
    for (let rank = 0; rank < list.length; rank++) {
      const { id } = list[rank];
      scores.set(id, (scores.get(id) || 0) + 1 / (k + rank));
    }
  }
  return scores;
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

/**
 * Fetch document chunks by their database IDs
 * Used for conversational context - re-retrieving previously cited docs
 */
async function fetchPriorityChunks(ids: number[]): Promise<{
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
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from('document_chunks_chutes')
    .select('id, content, source_file, heading_path, source_url, published_date, title, doc_type')
    .in('id', ids);

  if (error || !data) {
    console.warn('Failed to fetch priority chunks:', error?.message);
    return [];
  }

  return data.map((chunk) => ({
    ...chunk,
    similarity: 0.45, // Synthetic score - low enough that relevant new results can beat it
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
 * Generate an embedding for the given text using the configured provider.
 * Extracted as a helper so it can be called for both the original query and sub-queries.
 */
async function generateEmbedding(
  text: string,
  provider: 'openrouter' | 'chutes',
  apiKey?: string,
  accessToken?: string,
  model?: string
): Promise<number[]> {
  if (provider === 'chutes') {
    if (!accessToken) throw new Error('Chutes access token is required for embeddings');
    return getChutesEmbedding(text, accessToken);
  }
  if (!apiKey) throw new Error('OpenRouter API key is required for embeddings');
  const openrouter = createOpenRouter({ apiKey });
  const result = await embed({
    model: openrouter.textEmbeddingModel(
      model || process.env.OPENROUTER_EMBEDDING_MODEL || UNIFIED_EMBEDDING_MODEL
    ),
    value: text,
  });
  return result.embedding;
}

/**
 * Two-stage retrieval with optional Cohere reranking, with query decomposition
 * for broad/multi-entity queries.
 *
 * Stage 0 (conditional): Decompose broad/multi-entity queries into sub-queries
 * Stage 1: Vector search via Supabase RPC (parallel for decomposed queries)
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
    initialCount: requestedInitialCount,
    finalCount: requestedFinalCount,
    similarityThreshold = 0.35, // Lower threshold - text-embedding-3-small typically produces 0.3-0.6 similarity scores
    priorityDocIds = [],
  } = options;

  // Dynamic retrieval: broad/multi-topic queries get more chunks for better coverage
  const broad = isBroadQuery(query);
  const initialCount = requestedInitialCount ?? (broad ? 25 : 15);
  const finalCount = requestedFinalCount ?? (broad ? 10 : 5);

  // Fetch priority docs in parallel with vector search for better latency
  const priorityChunksPromise =
    priorityDocIds.length > 0 ? fetchPriorityChunks(priorityDocIds) : Promise.resolve([]);

  // Use unified BGE-M3 table (1024-dim) for all providers
  const rpcFunction = 'match_document_chunks_chutes';

  // --- Query Decomposition (Stage 0) ---
  // Trigger A: broad query → sub-queries for ALL entities
  // Trigger B: 2+ entities matched by keywords → sub-queries for matched entities only
  const matchedEntities = findMatchedEntities(query);
  const shouldDecompose = broad || matchedEntities.length >= 2;
  const decomposedEntities = broad ? [...KNOWN_ENTITIES] : matchedEntities;

  let candidates: {
    id: number;
    content: string;
    source_file: string;
    heading_path: string | null;
    source_url: string | null;
    published_date: string | null;
    title: string | null;
    doc_type: string | null;
    similarity: number;
  }[];

  if (shouldDecompose) {
    // Build sub-query list: original query + one per matched entity
    const allQueries = [query, ...decomposedEntities.map(e => e.query)];

    console.log('[RAG] Query decomposition triggered:', {
      trigger: broad ? 'broad' : 'multi-entity',
      matchedEntities: decomposedEntities.map(e => e.name),
      totalSubQueries: allQueries.length,
    });

    // Generate embeddings for all queries in parallel — tolerate partial failures
    const embeddingResults = await Promise.allSettled(
      allQueries.map(q => generateEmbedding(q, embeddingProvider, embeddingApiKey, chutesAccessToken, embeddingModel))
    );

    const successfulEmbeddings = embeddingResults
      .map((r, i) => r.status === 'fulfilled' ? { query: allQueries[i], embedding: r.value } : null)
      .filter((r): r is { query: string; embedding: number[] } => r !== null);

    const failedCount = allQueries.length - successfulEmbeddings.length;
    if (failedCount > 0) {
      console.warn(`[RAG] ${failedCount}/${allQueries.length} sub-query embeddings failed`);
    }

    if (successfulEmbeddings.length === 0) {
      // All embeddings failed — this shouldn't happen, but throw so the caller knows
      throw new Error('All sub-query embeddings failed during query decomposition');
    }

    // Run vector searches in parallel for each successful embedding
    const searchResults = await Promise.allSettled(
      successfulEmbeddings.map(({ embedding }) =>
        supabase.rpc(rpcFunction, {
          query_embedding: embedding,
          match_threshold: similarityThreshold,
          match_count: initialCount,
        })
      )
    );

    // Collect successful search result lists for RRF
    const rankedLists: { id: number; content: string; source_file: string; heading_path: string | null; source_url: string | null; published_date: string | null; title: string | null; doc_type: string | null; similarity: number }[][] = [];
    for (let i = 0; i < searchResults.length; i++) {
      const result = searchResults[i];
      if (result.status === 'fulfilled' && !result.value.error && result.value.data) {
        rankedLists.push(result.value.data);
      } else {
        const errMsg = result.status === 'rejected' ? result.reason : result.value.error?.message;
        console.warn(`[RAG] Sub-query vector search failed for "${successfulEmbeddings[i].query}":`, errMsg);
      }
    }

    console.log('[RAG] Query decomposition results:', {
      successfulEmbeddings: successfulEmbeddings.length,
      successfulSearches: rankedLists.length,
    });

    if (rankedLists.length === 0) {
      // All searches failed — throw so caller knows
      throw new Error('All sub-query vector searches failed during query decomposition');
    }

    // Merge via Reciprocal Rank Fusion
    const rrfScores = reciprocalRankFusion(rankedLists);

    // Build a deduplicated chunk map (keep highest similarity from any list)
    const chunkMap = new Map<number, typeof candidates[number]>();
    for (const list of rankedLists) {
      for (const chunk of list) {
        const existing = chunkMap.get(chunk.id);
        if (!existing || chunk.similarity > existing.similarity) {
          chunkMap.set(chunk.id, chunk);
        }
      }
    }

    // Sort by RRF score (descending), use similarity as tiebreaker
    candidates = Array.from(chunkMap.values()).sort((a, b) => {
      const scoreA = rrfScores.get(a.id) || 0;
      const scoreB = rrfScores.get(b.id) || 0;
      return scoreB - scoreA || b.similarity - a.similarity;
    });
  } else {
    // Standard single-query retrieval (no decomposition)
    const embedding = await generateEmbedding(query, embeddingProvider, embeddingApiKey, chutesAccessToken, embeddingModel);

    const { data: vectorCandidates, error } = await supabase.rpc(rpcFunction, {
      query_embedding: embedding,
      match_threshold: similarityThreshold,
      match_count: initialCount,
    });

    if (error) {
      throw new Error(`Supabase RPC error: ${error.message}`);
    }

    candidates = vectorCandidates || [];
  }

  // Merge priority docs (previously cited) - await parallel fetch
  const priorityChunks = await priorityChunksPromise;
  if (priorityChunks.length > 0) {
    // Remove priority docs from vector results to avoid duplicates
    const priorityIds = new Set(priorityChunks.map((c) => c.id));
    candidates = candidates.filter((c: { id: number }) => !priorityIds.has(c.id));

    // Prepend priority docs so they're always included
    candidates = [...priorityChunks, ...candidates];
  }

  // For temporal queries, augment with recent content by date
  // This ensures "last/recent/latest" queries include actually recent documents
  // regardless of how the user phrases their request (works for any language)
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
  // Sort all candidates by similarity so priority docs don't blindly take slots
  const fallbackToSimilarity = (): RetrievedChunk[] => {
    const sorted = [...candidates].sort((a, b) => b.similarity - a.similarity);
    return sorted
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
        ): RetrievedChunk => ({
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
      console.warn('Cohere reranking failed, trying Cloudflare:', cohereError);
      // Fall through to Cloudflare
    }
  }

  // Try Cloudflare reranking (free tier)
  const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (cloudflareAccountId && cloudflareApiToken) {
    try {
      const ranking = await rerankWithCloudflare(
        query,
        candidates.map((c: { content: string }) => c.content),
        finalCount,
        cloudflareAccountId,
        cloudflareApiToken
      );
      if (ranking.length > 0) {
        return mapRankedToChunks(
          ranking.map((r) => ({ originalIndex: r.index, score: r.score }))
        );
      }
    } catch (cloudflareError) {
      console.warn('Cloudflare reranking failed, falling back to similarity:', cloudflareError);
    }
  }

  // Fallback to similarity-based selection
  return fallbackToSimilarity();
}
