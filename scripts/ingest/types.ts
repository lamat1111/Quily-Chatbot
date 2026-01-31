/**
 * Metadata attached to each document chunk
 */
export interface ChunkMetadata {
  /** Original source file path, e.g., "docs/getting-started.md" */
  source_file: string;
  /** Heading hierarchy, e.g., "Installation > Prerequisites" */
  heading_path: string;
  /** Position of this chunk in the source document */
  chunk_index: number;
  /** Number of tokens in this chunk (for cost tracking) */
  token_count: number;
  /** Version tag for freshness tracking, e.g., "2026-01-24" */
  version: string;
  /** MD5 hash of content for deduplication */
  content_hash: string;
  /** External URL for source attribution (e.g., YouTube URL from frontmatter) */
  source_url?: string;
  /** Publication date from frontmatter (when content was originally created) */
  published_date?: string;
  /** Document title from frontmatter */
  title?: string;
  /** Document type: 'livestream_transcript', 'documentation', etc. */
  doc_type?: string;
}

/**
 * A chunk of text with its metadata (before embedding)
 */
export interface ChunkWithContext {
  /** The actual text content of the chunk */
  content: string;
  /** Associated metadata */
  metadata: ChunkMetadata;
}

/**
 * A document chunk with its embedding vector (ready for upload)
 */
export interface DocumentChunk extends ChunkWithContext {
  /**
   * Embedding vector (dimensions vary by provider):
   * - OpenRouter: 1536-dim (text-embedding-3-small)
   * - Chutes: 1024-dim (BGE-M3)
   */
  embedding: number[];
}

/**
 * Raw loaded document before chunking
 */
export interface LoadedDocument {
  /** File path relative to docs root */
  path: string;
  /** Full markdown content */
  content: string;
  /** Frontmatter if present */
  frontmatter?: Record<string, unknown>;
}

/**
 * Result from similarity search RPC
 */
export interface SearchResult {
  id: number;
  content: string;
  source_file: string;
  heading_path: string | null;
  source_url: string | null;
  published_date: string | null;
  title: string | null;
  doc_type: string | null;
  similarity: number;
}

/**
 * CLI options for the ingest command
 */
export interface IngestOptions {
  /** Path to documentation directory */
  docs: string;
  /** Version tag for this ingestion run */
  version: string;
  /** Preview mode - don't upload to database */
  dryRun: boolean;
}
