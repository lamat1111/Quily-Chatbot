---
phase: 02-rag-pipeline
plan: 02
subsystem: api
tags: [vercel-ai-sdk, openrouter, streaming, nextjs, zod, rag]

# Dependency graph
requires:
  - phase: 02-01
    provides: retrieveWithReranking function, RetrievedChunk/SourceReference types
provides:
  - Prompt builder with citation formatting (buildContextBlock, buildSystemPrompt, formatSourcesForClient)
  - Streaming chat API endpoint (POST /api/chat)
  - Next.js App Router configuration
affects: [03-chat-interface, frontend]

# Tech tracking
tech-stack:
  added: [next, react, react-dom]
  patterns: [createUIMessageStream for combined data+LLM streams, source-url stream parts for citations]

key-files:
  created:
    - src/lib/rag/prompt.ts
    - app/api/chat/route.ts
    - next.config.js
  modified:
    - src/lib/rag/retriever.ts (fixed rerank API)
    - tsconfig.json (Next.js compatibility)
    - package.json (dev/build/start scripts)

key-decisions:
  - "createUIMessageStream over legacy createDataStreamResponse for ai SDK v6"
  - "source-url stream parts for citation metadata before LLM response"
  - "Minimal next.config.js - v16 defaults work well"
  - "Path alias @/* for clean imports"

patterns-established:
  - "Prompt pattern: [N] citation format with source path and heading"
  - "Stream pattern: sources first via writer.write, then LLM via writer.merge"
  - "Validation pattern: zod schema for request body validation"

# Metrics
duration: 7min
completed: 2026-01-24
---

# Phase 2 Plan 02: Prompt Assembly & Chat API Summary

**Streaming chat API with citation-formatted prompts using Vercel AI SDK v6 createUIMessageStream**

## Performance

- **Duration:** 7 min
- **Started:** 2026-01-24T16:04:19Z
- **Completed:** 2026-01-24T16:11:04Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Prompt builder formats chunks with [N] citations and docs.quilibrium.com URLs
- System prompt instructs LLM to cite sources and stay within context
- Chat API streams source metadata before LLM tokens
- Next.js App Router configured with path aliases

## Task Commits

Each task was committed atomically:

1. **Task 1: Create prompt builder module** - `0023898` (feat)
2. **Task 2: Create streaming chat API route** - `0630fbe` (feat)
3. **Task 3: Configure Next.js and path aliases** - `cc92ffe` (chore)

## Files Created/Modified

- `src/lib/rag/prompt.ts` - Context formatting with [N] citations, system prompt builder, URL generator
- `app/api/chat/route.ts` - Streaming chat endpoint with zod validation and RAG context
- `next.config.js` - Minimal Next.js config
- `tsconfig.json` - Updated for Next.js App Router with @/* path alias
- `package.json` - Added dev/build/start scripts, next/react dependencies
- `src/lib/rag/retriever.ts` - Fixed rerank API for ai SDK v6 (RerankResult.ranking)

## Decisions Made

- **Vercel AI SDK v6 API:** Used `createUIMessageStream` with `writer.write()` for sources and `writer.merge()` for LLM stream, as `createDataStreamResponse` is not available in v6
- **Source streaming:** Send sources as `source-url` stream parts before LLM response starts, enabling frontend to display citations while tokens stream
- **URL generation:** Construct docs.quilibrium.com URLs for files starting with `docs/`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed retriever.ts rerank API mismatch**
- **Found during:** Task 2 (type checking chat route)
- **Issue:** retriever.ts used `results` property and `cohere.reranking(model, {apiKey})` which don't exist in ai SDK v6
- **Fix:** Changed to `ranking` property with `originalIndex`, used `createCohere({apiKey})` provider factory
- **Files modified:** src/lib/rag/retriever.ts
- **Verification:** `npx tsc --noEmit` passes
- **Committed in:** 0630fbe (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix for type checking to pass. No scope creep.

## Issues Encountered

- **ai SDK v6 API changes:** Plan specified `createDataStreamResponse` which doesn't exist in v6. Adapted to use `createUIMessageStream` + `createUIMessageStreamResponse` pattern which achieves same goal.

## User Setup Required

None - no external service configuration required for this plan. Cohere API key remains optional (set in 02-01).

## Next Phase Readiness

- Chat API ready for frontend integration
- Streaming works with sources-first pattern
- Next.js dev server starts successfully
- Path aliases configured for clean imports

---
*Phase: 02-rag-pipeline*
*Completed: 2026-01-24*
