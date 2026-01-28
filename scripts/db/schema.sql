-- Enable pgvector extension (run in Supabase SQL editor)
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Document chunks table for RAG
CREATE TABLE IF NOT EXISTS document_chunks (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
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

-- HNSW index for fast cosine similarity search
-- Parameters: m=16, ef_construction=64 (good defaults for <10k vectors)
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
  ON document_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Index for filtering by source file
CREATE INDEX IF NOT EXISTS document_chunks_source_idx
  ON document_chunks(source_file);

-- RPC function for similarity search (required because PostgREST doesn't support pgvector operators)
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
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
  FROM document_chunks dc
  WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- =============================================================================
-- CHUTES EMBEDDINGS (1024 dimensions, BGE-M3 model)
-- =============================================================================
-- Separate table for Chutes provider embeddings.
-- Users selecting Chutes as their provider query this table instead.

-- Chutes embedding table (1024 dimensions for BGE-M3)
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

-- HNSW index for fast cosine similarity search
CREATE INDEX IF NOT EXISTS document_chunks_chutes_embedding_idx
  ON document_chunks_chutes
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Index for filtering by source file
CREATE INDEX IF NOT EXISTS document_chunks_chutes_source_idx
  ON document_chunks_chutes(source_file);

-- RPC function for Chutes similarity search
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
