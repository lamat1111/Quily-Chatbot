-- =============================================================================
-- QUILY CHATBOT - Database Schema
-- =============================================================================
-- Run this in Supabase SQL Editor to set up the RAG database.
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql
--
-- EMBEDDING MODEL: BGE-M3 (1024 dimensions)
-- Both OpenRouter and Chutes providers produce identical vectors for this model,
-- allowing a unified table for all embedding queries.
-- =============================================================================

-- Enable pgvector extension (run in Supabase SQL editor)
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- =============================================================================
-- DOCUMENT CHUNKS TABLE (Unified BGE-M3 Embeddings)
-- =============================================================================
-- Single table for all RAG embeddings using BGE-M3 model (1024 dimensions).
-- Works with both OpenRouter (baai/bge-m3) and Chutes (chutes-baai-bge-m3).

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
  source_url TEXT,  -- External URL for source attribution (e.g., YouTube URL for transcripts)
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint for upsert (prevents duplicates on re-ingestion)
  UNIQUE(source_file, chunk_index)
);

-- HNSW index for fast cosine similarity search
-- Parameters: m=16, ef_construction=64 (good defaults for <10k vectors)
CREATE INDEX IF NOT EXISTS document_chunks_chutes_embedding_idx
  ON document_chunks_chutes
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Index for filtering by source file
CREATE INDEX IF NOT EXISTS document_chunks_chutes_source_idx
  ON document_chunks_chutes(source_file);

-- RPC function for similarity search
-- Called by the retriever regardless of which provider generates the query embedding
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
  source_url TEXT,
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
    dc.source_url,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks_chutes dc
  WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- =============================================================================
-- LEGACY TABLE (DEPRECATED)
-- =============================================================================
-- The document_chunks table (1536 dimensions, text-embedding-3-small) is deprecated.
-- After confirming the BGE-M3 table works correctly, run:
--   scripts/db/migration-consolidate-bge-m3.sql
-- to drop the legacy table and free up storage.
--
-- Legacy table schema (for reference only, DO NOT CREATE):
-- CREATE TABLE document_chunks (
--   embedding vector(1536) NOT NULL,  -- text-embedding-3-small
--   ...
-- );
