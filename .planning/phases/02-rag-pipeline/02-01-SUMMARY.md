---
phase: 02
plan: 01
subsystem: rag-retrieval
tags: [rag, retrieval, embedding, reranking, cohere, supabase]
dependency-graph:
  requires: [01-04]
  provides: [retriever-module, rag-types, supabase-client]
  affects: [02-02, 02-03]
tech-stack:
  added: ["@ai-sdk/cohere", "zod"]
  patterns: ["two-stage-retrieval", "optional-reranking", "singleton-client"]
key-files:
  created:
    - src/lib/rag/types.ts
    - src/lib/rag/retriever.ts
    - src/lib/supabase.ts
  modified:
    - package.json
    - .env.example
decisions:
  - id: cohere-optional
    choice: "Cohere reranking optional via API key presence"
    rationale: "Graceful degradation - works without Cohere, better results with it"
  - id: same-embedding-model
    choice: "Use openai/text-embedding-3-small for queries"
    rationale: "Must match ingestion embedding model for vector similarity to work"
  - id: service-role-key
    choice: "Use SUPABASE_SERVICE_ROLE_KEY in client"
    rationale: "Server-side operations need service role, not anon key"
metrics:
  duration: 2.2min
  completed: 2026-01-24
---

# Phase 02 Plan 01: RAG Retrieval Layer Summary

**One-liner:** Two-stage retrieval with vector search via Supabase RPC and optional Cohere reranking for improved relevance.

## What Was Built

### 1. RAG Type Definitions (`src/lib/rag/types.ts`)

Three interfaces for the retrieval layer:

- **RetrievedChunk**: Search result with id, content, source_file, heading_path, similarity, citationIndex
- **RetrievalOptions**: Config for retrieval (API keys, counts, thresholds)
- **SourceReference**: Citation display format for client

### 2. Supabase Client Singleton (`src/lib/supabase.ts`)

Server-side Supabase client with:
- Service role key authentication
- Env var validation at import time
- Singleton pattern for connection reuse

### 3. Two-Stage Retriever (`src/lib/rag/retriever.ts`)

`retrieveWithReranking(query, options)` function:

**Stage 1 - Vector Search:**
- Embeds query with `openai/text-embedding-3-small` (same as ingestion)
- Calls `match_document_chunks` RPC with configurable threshold/count
- Returns candidates sorted by cosine similarity

**Stage 2 - Optional Reranking:**
- If Cohere API key available AND enough candidates:
  - Reranks with `rerank-v3.5` model
  - Maps back to original metadata
- Fallback: Returns top N by similarity score

**Output:** Array of `RetrievedChunk` with 1-based `citationIndex` for display.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| b8afcb6 | feat | Add RAG types and dependencies |
| 953316f | feat | Create Supabase client singleton |
| d1947c2 | feat | Create two-stage retriever with reranking |

## Files Changed

**Created:**
- `src/lib/rag/types.ts` - RetrievedChunk, RetrievalOptions, SourceReference
- `src/lib/rag/retriever.ts` - retrieveWithReranking function
- `src/lib/supabase.ts` - Supabase client singleton

**Modified:**
- `package.json` - Added @ai-sdk/cohere, zod dependencies
- `.env.example` - Added NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, COHERE_API_KEY

## Deviations from Plan

None - plan executed exactly as written.

## Key Patterns Established

1. **Two-stage retrieval**: Over-fetch candidates, rerank for quality
2. **Optional enhancement**: Works without Cohere, better with it
3. **Citation indexing**: 1-based indices for display consistency
4. **Environment fallback**: API keys from options or process.env

## Integration Points

**Uses (from Phase 1):**
- `match_document_chunks` RPC function (created in 01-03)
- Same embedding model `openai/text-embedding-3-small` (used in 01-02)

**Provides (for Phase 2):**
- `retrieveWithReranking()` for API route
- `RetrievedChunk` type for response formatting
- `SourceReference` type for citation display

## Next Phase Readiness

Ready for:
- **02-02**: Context assembly (use retrieved chunks to build prompts)
- **02-03**: API route (call retriever with user query)

No blockers. Retriever module is self-contained and tested via type checking.
