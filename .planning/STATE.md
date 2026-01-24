# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-24)

**Core value:** Users get instant, accurate answers about Quilibrium from official sources with clear citations
**Current focus:** Phase 2 - RAG Pipeline

## Current Position

Phase: 2 of 4 (RAG Pipeline)
Plan: 1 of 3 (RAG Retrieval Layer)
Status: In progress
Last activity: 2026-01-24 - Completed 02-01-PLAN.md

Progress: [#####.....] ~38%

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: 2.4 min
- Total execution time: 12.2 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-data-pipeline | 4 | 10 min | 2.5 min |
| 02-rag-pipeline | 1 | 2.2 min | 2.2 min |

**Recent Trend:**
- Last 5 plans: 01-02 (1min), 01-03 (2min), 01-04 (4min), 02-01 (2.2min)
- Trend: Stable

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- NodeNext module resolution without type:module - tsx handles ESM
- HNSW index with m=16, ef_construction=64 for <10k vectors
- vector(1536) for text-embedding-3-small compatibility
- 800 token target with 100 overlap for chunk sizing
- RecursiveCharacterTextSplitter.fromLanguage('markdown') for semantic splitting
- 50-item batches for embeddings to stay under token limits
- 100-item batches for Supabase inserts for performance
- Heading context prepended to chunks for better semantic embedding
- Windows path fix: convert backslashes for glob compatibility
- Cohere reranking optional via API key presence (graceful degradation)
- Same embedding model for queries as ingestion (text-embedding-3-small)
- Service role key for Supabase server-side operations

### Pending Todos

- None

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-01-24
Stopped at: Completed 02-01-PLAN.md
Resume file: None

## Phase 1 Completion Summary

**Delivered:**
- CLI ingestion pipeline (`npm run ingest`)
- Markdown loader with frontmatter parsing
- Semantic chunker with heading context
- Embedding generator via OpenRouter
- Supabase uploader with upsert support
- pgvector schema with similarity search RPC

**Files created:**
- scripts/ingest/index.ts (CLI entry)
- scripts/ingest/loader.ts
- scripts/ingest/chunker.ts
- scripts/ingest/embedder.ts
- scripts/ingest/uploader.ts
- scripts/ingest/types.ts
- scripts/db/schema.sql
- package.json, tsconfig.json, .env.example

**Verified:** User confirmed end-to-end pipeline works

## Phase 2 Progress

**Plan 02-01 Complete:**
- Two-stage retriever with optional Cohere reranking
- Supabase client singleton with service role key
- RAG types (RetrievedChunk, RetrievalOptions, SourceReference)

**Files created:**
- src/lib/rag/types.ts
- src/lib/rag/retriever.ts
- src/lib/supabase.ts

**Next:** 02-02 (Context assembly) or 02-03 (API route)
