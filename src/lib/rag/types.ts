/**
 * RAG retrieval layer types
 * These are distinct from ingestion types - different concerns
 */

/**
 * A retrieved document chunk from similarity search
 * Matches match_document_chunks RPC return + citationIndex
 */
export interface RetrievedChunk {
  /** Database ID */
  id: number;
  /** Chunk text content */
  content: string;
  /** Original source file path */
  source_file: string;
  /** Heading hierarchy path or null */
  heading_path: string | null;
  /** Cosine similarity score (0-1) */
  similarity: number;
  /** Citation index for display (1-based) */
  citationIndex: number;
}

/**
 * Options for retrieval with optional reranking
 */
export interface RetrievalOptions {
  /** OpenRouter API key for embedding */
  embeddingApiKey: string;
  /** Cohere API key for reranking (optional) */
  cohereApiKey?: string;
  /** Number of candidates from vector search (default 15) */
  initialCount?: number;
  /** Number of results after reranking (default 5) */
  finalCount?: number;
  /** Minimum similarity threshold (default 0.5) */
  similarityThreshold?: number;
}

/**
 * Source reference for client-side citation display
 */
export interface SourceReference {
  /** Citation index (1-based) */
  index: number;
  /** Source file path */
  file: string;
  /** Heading path or null */
  heading: string | null;
  /** URL to source if available */
  url: string | null;
}
