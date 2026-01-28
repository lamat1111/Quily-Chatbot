---
type: task
title: "Implement Dual Embedding Storage for OpenRouter and Chutes Providers"
status: open
complexity: high
ai_generated: true
reviewed_by: null
created: 2026-01-28
updated: 2026-01-28
related_docs:
  - docs/rag-knowledge-base-workflow.md
related_tasks: []
---

# Implement Dual Embedding Storage for OpenRouter and Chutes Providers

> **⚠️ AI-Generated**: May contain errors. Verify before use.

**Files**:
- `scripts/db/schema.sql` - Add Chutes embedding table and RPC function
- `scripts/ingest/embedder.ts` - Make provider-configurable
- `scripts/ingest/index.ts` - Add Chutes ingestion command
- `src/lib/rag/retriever.ts` - Query correct table based on provider
- `app/api/chat/route.ts` - Pass provider to retriever
- `package.json` - Add `ingest:chutes` script

## What & Why

**Current state**: The RAG system stores document embeddings using OpenRouter's `text-embedding-3-small` model (1536 dimensions). At query time, users can choose between OpenRouter or Chutes as their LLM provider. However, if a Chutes user's query is embedded with Chutes' BGE-M3 model (1024 dimensions), the vector search fails because the dimensions and semantic spaces don't match.

**Desired state**: Store two sets of embeddings - one for OpenRouter (1536 dims) and one for Chutes (1024 dims). At query time, the system automatically queries the correct table based on the user's selected provider.

**Value**:
- Users can choose either OpenRouter OR Chutes with fully functional RAG
- Zero ongoing server cost - users pay for their own embedding queries
- Supports the Quilibrium decentralized ecosystem by enabling Chutes
- One-time ingestion cost for each provider (paid by project owner)

## Context

- **Existing pattern**: Current ingestion uses OpenRouter exclusively (`scripts/ingest/embedder.ts:15`)
- **Constraints**:
  - OpenRouter embeddings: 1536 dimensions (`text-embedding-3-small`)
  - Chutes embeddings: 1024 dimensions (BGE-M3 model)
  - PostgreSQL `vector(N)` type requires fixed dimensions per column
  - Cannot store different-dimension vectors in same table
- **Dependencies**:
  - Chutes API key (`CHUTES_API_KEY`) already configured in `.env`
  - Chutes OAuth flow already implemented by collaborator
  - Supabase pgvector extension already enabled

## Prerequisites

- [ ] Review existing RAG documentation: `.agents/docs/rag-knowledge-base-workflow.md`
- [ ] Verify `CHUTES_API_KEY` is set in `.env`
- [ ] Understand current retriever logic in `src/lib/rag/retriever.ts`
- [ ] Confirm Chutes BGE-M3 embedding endpoint and response format

## Implementation

### Phase 1: Database Schema (Supabase)

- [ ] **Add Chutes embedding table** (`scripts/db/schema.sql`)
  - Done when: New table `document_chunks_chutes` exists with `vector(1024)` column
  - Verify: Run schema in Supabase SQL Editor, confirm table created

  ```sql
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
    UNIQUE(source_file, chunk_index)
  );

  -- HNSW index for Chutes table
  CREATE INDEX IF NOT EXISTS document_chunks_chutes_embedding_idx
    ON document_chunks_chutes
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

  -- Source file index for Chutes table
  CREATE INDEX IF NOT EXISTS document_chunks_chutes_source_idx
    ON document_chunks_chutes(source_file);
  ```

- [ ] **Add Chutes RPC function** (`scripts/db/schema.sql`)
  - Done when: Function `match_document_chunks_chutes()` is callable
  - Verify: Test with sample query in Supabase SQL Editor

  ```sql
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
  ```

### Phase 2: Ingestion Script Updates (requires Phase 1)

- [ ] **Create Chutes embedder** (`scripts/ingest/embedder-chutes.ts` or modify `embedder.ts`)
  - Done when: Can generate embeddings using Chutes BGE-M3 API
  - Verify: Test with single document chunk
  - Reference: Check Chutes API docs for embedding endpoint format
  - Note: Chutes embedding endpoint is likely `https://chutes-baai-bge-m3.chutes.ai` or similar

  Key changes needed:
  ```typescript
  // Option A: New file embedder-chutes.ts
  // Option B: Make embedder.ts configurable with provider parameter

  const CHUTES_EMBEDDING_MODEL = process.env.CHUTES_EMBEDDING_MODEL || 'chutes-baai-bge-m3';
  const EMBEDDING_DIMENSIONS = 1024; // BGE-M3 dimensions
  ```

- [ ] **Update uploader for Chutes table** (`scripts/ingest/uploader.ts`)
  - Done when: Uploader can target either `document_chunks` or `document_chunks_chutes`
  - Verify: Dry run shows correct table being targeted

  ```typescript
  // Add table parameter
  export async function uploadChunks(
    chunks: DocumentChunk[],
    supabaseUrl: string,
    supabaseKey: string,
    tableName: 'document_chunks' | 'document_chunks_chutes' = 'document_chunks'
  )
  ```

- [ ] **Add CLI command for Chutes ingestion** (`scripts/ingest/index.ts`)
  - Done when: `npm run ingest:chutes` runs successfully
  - Verify: Run dry mode first, then actual ingestion

  ```typescript
  // Add --provider flag or separate command
  program
    .command('run-chutes')
    .description('Ingest documents using Chutes embeddings')
    .option('-d, --docs <path>', 'Docs directory', './docs')
    .option('--dry-run', 'Preview without uploading')
    .action(async (options) => {
      // Use Chutes embedder and target document_chunks_chutes table
    });
  ```

- [ ] **Add npm scripts** (`package.json`)
  - Done when: `npm run ingest:chutes` and `npm run ingest:all` are available

  ```json
  {
    "scripts": {
      "ingest:chutes": "npx tsx scripts/ingest/index.ts run-chutes",
      "ingest:chutes:dry": "npx tsx scripts/ingest/index.ts run-chutes --dry-run",
      "ingest:chutes:clean": "npx tsx scripts/ingest/index.ts run-chutes --clean",
      "ingest:all": "npm run ingest:run && npm run ingest:chutes",
      "ingest:all:clean": "npm run ingest:clean && npm run ingest:chutes:clean"
    }
  }
  ```

### Phase 3: Runtime Retriever Updates (requires Phase 1)

- [ ] **Update retriever to query correct table** (`src/lib/rag/retriever.ts`)
  - Done when: Retriever uses `match_document_chunks_chutes` for Chutes provider
  - Verify: Test with both providers, confirm correct table is queried
  - Reference: Current implementation at lines 38-62

  ```typescript
  // Determine which RPC function to use
  const rpcFunction = embeddingProvider === 'chutes'
    ? 'match_document_chunks_chutes'
    : 'match_document_chunks';

  const { data, error } = await supabase.rpc(rpcFunction, {
    query_embedding: queryEmbedding,
    match_threshold: similarityThreshold,
    match_count: initialCount,
  });
  ```

- [ ] **Update chat route if needed** (`app/api/chat/route.ts`)
  - Done when: Provider information flows correctly to retriever
  - Verify: E2E test with both providers
  - Reference: Current logic at lines 328-366

### Phase 4: Documentation and Testing

- [ ] **Update RAG documentation** (`.agents/docs/rag-knowledge-base-workflow.md`)
  - Done when: Docs explain dual embedding setup
  - Include: New commands, architecture diagram update, troubleshooting

- [ ] **Test OpenRouter flow**
  - Done when: Chat with RAG works for OpenRouter users
  - Test: Ask question, verify relevant context retrieved

- [ ] **Test Chutes flow**
  - Done when: Chat with RAG works for Chutes users
  - Test: Sign in with Chutes, ask question, verify context retrieved

- [ ] **Verify zero server cost**
  - Done when: Confirmed user's key/token is used for query embeddings
  - Test: Monitor API calls, verify server's CHUTES_API_KEY not used at runtime

## Verification

✅ **Database schema complete**
   - Both tables exist with correct vector dimensions
   - Both RPC functions work
   - Indexes created for performance

✅ **Ingestion works for both providers**
   - `npm run ingest:run` → OpenRouter embeddings in `document_chunks`
   - `npm run ingest:chutes` → Chutes embeddings in `document_chunks_chutes`
   - `npm run ingest:all` → Both providers in one command

✅ **Runtime retrieval works**
   - OpenRouter user → queries `document_chunks` with their API key
   - Chutes user → queries `document_chunks_chutes` with their OAuth token

✅ **TypeScript compiles**
   - Run: `npx tsc --noEmit --jsx react-jsx --skipLibCheck`

✅ **No console errors**
   - Test both provider flows in browser

## Definition of Done

- [ ] Supabase schema updated with Chutes table and RPC function
- [ ] Ingestion script supports both OpenRouter and Chutes
- [ ] `npm run ingest:chutes` command available and working
- [ ] Retriever queries correct table based on provider
- [ ] Documents ingested with both embedding models
- [ ] E2E tested with both OpenRouter and Chutes providers
- [ ] RAG documentation updated
- [ ] TypeScript compiles without errors
- [ ] Zero ongoing server cost confirmed (users pay for their own queries)

## Cost Summary

| Action | Who Pays | Frequency |
|--------|----------|-----------|
| OpenRouter ingestion | Project owner | One-time (already done) |
| Chutes ingestion | Project owner | One-time (new) |
| OpenRouter query embeddings | End user | Per chat message |
| Chutes query embeddings | End user | Per chat message |

## Notes

- The Chutes embedding model (BGE-M3) produces 1024-dimensional vectors
- The OpenRouter model (`text-embedding-3-small`) produces 1536-dimensional vectors
- These cannot be mixed - each provider needs its own table
- Similarity thresholds may need tuning for BGE-M3 (different score distribution)
- Consider adding `CHUTES_EMBEDDING_MODEL` env var for flexibility

## Maintenance Workflow

When updating documentation, run a single command to update both embedding stores:

```bash
# Sync docs from GitHub + ingest to both providers
npm run sync-docs:run && npm run ingest:all

# Or with cleanup of deleted files
npm run sync-docs:run && npm run ingest:all:clean
```

**Estimated cost per full update**: ~$0.01 (both providers combined)

---

_Created: 2026-01-28_
_Updated: 2026-01-28_
