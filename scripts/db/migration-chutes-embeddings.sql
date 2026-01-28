-- =============================================================================
-- MIGRATION: Add Chutes Embedding Support
-- =============================================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
--
-- This creates a separate table for Chutes embeddings (1024 dimensions, BGE-M3 model)
-- The existing document_chunks table remains for OpenRouter embeddings (1536 dimensions)
-- =============================================================================

-- 1. Create Chutes embedding table (1024 dimensions for BGE-M3)
CREATE TABLE IF NOT EXISTS document_chunks_chutes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  content TEXT NOT NULL,
  embedding vector(1024) NOT NULL,
  source_file TEXT NOT NULL,
  heading_path TEXT,
  chunk_index INTEGER NOT NULL,
  token_count INTEGER NOT NULL,
  version TEXT,
  content_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint for upsert (prevents duplicates on re-ingestion)
  UNIQUE(source_file, chunk_index)
);

-- 2. Create HNSW index for fast cosine similarity search
-- Parameters: m=16, ef_construction=64 (good defaults for <10k vectors)
CREATE INDEX IF NOT EXISTS document_chunks_chutes_embedding_idx
  ON document_chunks_chutes
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- 3. Create index for filtering by source file
CREATE INDEX IF NOT EXISTS document_chunks_chutes_source_idx
  ON document_chunks_chutes(source_file);

-- 4. Create RPC function for Chutes similarity search
CREATE OR REPLACE FUNCTION match_document_chunks_chutes(
  query_embedding vector(1024),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  source_file TEXT,
  heading_path TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    dc.source_file,
    dc.heading_path,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks_chutes dc
  WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- =============================================================================
-- VERIFICATION QUERIES (run these after the migration to confirm success)
-- =============================================================================

Check table was created:
SELECT table_name FROM information_schema.tables WHERE table_name = 'document_chunks_chutes';

Check indexes were created:
SELECT indexname FROM pg_indexes WHERE tablename = 'document_chunks_chutes';

Check RPC function exists:
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'match_document_chunks_chutes';

Test RPC function (will return empty until you ingest data):
SELECT * FROM match_document_chunks_chutes(
  array_fill(0::float, ARRAY[1024])::vector(1024),
  0.0,
  5
);
