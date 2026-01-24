---
phase: 01-data-pipeline
plan: 03
subsystem: api
tags: [openrouter, embeddings, supabase, vercel-ai-sdk, vector-storage]

# Dependency graph
requires:
  - phase: 01-01
    provides: TypeScript foundation, types.ts with ChunkWithContext and DocumentChunk interfaces
provides:
  - Batch embedding generation via OpenRouter (generateEmbeddings)
  - Supabase vector storage with upsert (uploadChunks)
  - Helper functions for delete and count operations
affects: [01-04, orchestrator, ingest-cli]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Batch processing with progress callbacks
    - Rate limit handling with delays between batches
    - Upsert for idempotent re-ingestion

key-files:
  created:
    - scripts/ingest/embedder.ts
    - scripts/ingest/uploader.ts
  modified: []

key-decisions:
  - "50-item batches for embeddings to stay under token limits"
  - "100-item batches for Supabase inserts for performance"
  - "Heading context prepended to chunks for better semantic embedding"
  - "Upsert on source_file+chunk_index for duplicate prevention"

patterns-established:
  - "Progress callbacks: onProgress?: (completed: number, total: number) => void"
  - "Batch error context: include batch number in error messages"
  - "Service client factories: getSupabaseClient with minimal auth config"

# Metrics
duration: 2min
completed: 2026-01-24
---

# Phase 01 Plan 03: Embedder and Uploader Summary

**Batch embedding generation via OpenRouter with Vercel AI SDK and Supabase vector storage with upsert for idempotent ingestion**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-24T15:06:48Z
- **Completed:** 2026-01-24T15:08:35Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Batch embedding generator with 50-chunk batches and heading context prepending
- Supabase uploader with upsert preventing duplicates on re-ingestion
- Helper functions for file deletion and chunk counting
- Progress callbacks in both modules for CLI integration

## Task Commits

Each task was committed atomically:

1. **Task 1: Create batch embedding generator** - `685ff12` (feat)
2. **Task 2: Create Supabase vector uploader** - `98a5db4` (feat)

## Files Created/Modified
- `scripts/ingest/embedder.ts` - Generates 1536-dim embeddings via OpenRouter with batching and rate limiting
- `scripts/ingest/uploader.ts` - Stores chunks in Supabase with upsert, includes delete and count helpers

## Decisions Made
- Batch size of 50 for embeddings (conservative limit to avoid rate limits)
- Batch size of 100 for database inserts (Supabase performs well at this size)
- 100ms delay between embedding batches for rate limit avoidance
- Prepend heading_path to chunk content before embedding for better semantic context
- Use service role key for Supabase (not anon key) for insert permissions

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. Environment variables (OPENROUTER_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY) were documented in 01-01.

## Next Phase Readiness
- Embedder and uploader ready for integration into CLI orchestrator
- Types flow correctly: ChunkWithContext -> generateEmbeddings -> DocumentChunk -> uploadChunks
- Both modules expose progress callbacks for spinner updates

---
*Phase: 01-data-pipeline*
*Completed: 2026-01-24*
