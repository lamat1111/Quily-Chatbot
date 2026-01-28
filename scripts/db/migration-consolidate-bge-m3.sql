-- =============================================================================
-- MIGRATION: Consolidate to Single BGE-M3 Embedding Table
-- =============================================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
--
-- BACKGROUND:
-- Previously, we had two embedding tables:
--   - document_chunks (1536 dims, OpenAI text-embedding-3-small)
--   - document_chunks_chutes (1024 dims, BGE-M3)
--
-- After research and testing (see .agents/tasks/research-unified-bge-m3-embedding.md),
-- we confirmed that OpenRouter and Chutes both produce IDENTICAL BGE-M3 vectors.
-- This allows us to consolidate to a single table for both providers.
--
-- BENEFITS:
--   - Simpler architecture (one table instead of two)
--   - Better retrieval quality (BGE-M3 MTEB 63.0 vs text-embedding-3-small 55.8)
--   - Smaller storage (1024 dims vs 1536 dims = 33% reduction)
--   - Single ingestion run instead of two
--   - Either provider can be used interchangeably for embeddings
--
-- PREREQUISITES:
--   1. Ensure document_chunks_chutes table is populated (run: yarn ingest:chutes)
--   2. Verify the code changes are deployed (retriever.ts now uses single table)
--   3. Test the application to confirm RAG works
--
-- =============================================================================

-- STEP 1: Drop the old table and its dependencies
-- WARNING: This is irreversible! Make sure document_chunks_chutes has all your data.

-- Drop the RPC function first (depends on the table)
DROP FUNCTION IF EXISTS match_document_chunks(vector(1536), FLOAT, INT);

-- Drop indexes
DROP INDEX IF EXISTS document_chunks_embedding_idx;
DROP INDEX IF EXISTS document_chunks_source_idx;

-- Drop the table
DROP TABLE IF EXISTS document_chunks;

-- =============================================================================
-- VERIFICATION QUERIES (run these after migration)
-- =============================================================================

-- Confirm old table is gone:
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'document_chunks';
-- (should return 0 rows)

-- Confirm Chutes table exists with data:
-- SELECT COUNT(*) FROM document_chunks_chutes;
-- (should return your chunk count, e.g., 595)

-- Confirm RPC function works:
-- SELECT * FROM match_document_chunks_chutes(
--   array_fill(0::float, ARRAY[1024])::vector(1024),
--   0.0,
--   5
-- );

-- =============================================================================
-- OPTIONAL: Rename table for cleaner naming
-- =============================================================================
-- If you want to rename document_chunks_chutes back to document_chunks,
-- uncomment and run this section. NOTE: This requires updating the code to
-- use the new table name (retriever.ts RPC function name).
--
-- ALTER TABLE document_chunks_chutes RENAME TO document_chunks;
-- ALTER INDEX document_chunks_chutes_embedding_idx RENAME TO document_chunks_embedding_idx;
-- ALTER INDEX document_chunks_chutes_source_idx RENAME TO document_chunks_source_idx;
--
-- Then update the RPC function:
-- CREATE OR REPLACE FUNCTION match_document_chunks(
--   query_embedding vector(1024),
--   match_threshold FLOAT DEFAULT 0.7,
--   match_count INT DEFAULT 5
-- )
-- ... (copy body from match_document_chunks_chutes, change table reference)
