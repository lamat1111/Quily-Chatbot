-- =============================================================================
-- MIGRATION: Add source_url column for external source attribution
-- =============================================================================
-- Run this migration to add support for YouTube URLs and other external sources
-- in chatbot citations.
--
-- This allows transcripts to display their YouTube URL instead of "(internal)"
-- =============================================================================

-- Add source_url column to store external URLs (YouTube, etc.)
ALTER TABLE document_chunks_chutes
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Drop existing function first (required when changing return type)
DROP FUNCTION IF EXISTS match_document_chunks_chutes(vector, double precision, integer);

-- Recreate the RPC function with source_url in return type
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

-- Comment explaining the column purpose
COMMENT ON COLUMN document_chunks_chutes.source_url IS
  'External URL for source attribution (e.g., YouTube URL from transcript frontmatter)';
