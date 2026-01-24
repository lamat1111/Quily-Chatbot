# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-24)

**Core value:** Users get instant, accurate answers about Quilibrium from official sources with clear citations
**Current focus:** Phase 3 - Chat Interface

## Current Position

Phase: 3 of 4 (Chat Interface)
Plan: 3 of 4 complete
Status: In progress
Last activity: 2026-01-24 - Completed 03-03-PLAN.md (Chat components)

Progress: [#######...] ~70%

## Performance Metrics

**Velocity:**
- Total plans completed: 9
- Average duration: 3.5 min
- Total execution time: 32.2 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-data-pipeline | 4 | 10 min | 2.5 min |
| 02-rag-pipeline | 2 | 9.2 min | 4.6 min |
| 03-chat-interface | 3 | 13 min | 4.3 min |

**Recent Trend:**
- Last 5 plans: 02-02 (7min), 03-01 (4min), 03-02 (4min), 03-03 (5min)
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
- createUIMessageStream for combined data+LLM streams (ai SDK v6)
- source-url stream parts for citation metadata before LLM response
- Path alias @/* for clean imports
- Tailwind CSS 4.x with @import syntax (not legacy @tailwind directives)
- Zustand persist middleware with createJSONStorage for localStorage
- 50 conversation limit with oldest-first pruning
- Auto-title from first user message (50 char truncate)
- _hasHydrated flag pattern for SSR hydration safety
- Password input always masked with no reveal option (security)
- API key shows last 6 chars as hint when present
- Mobile sidebar as overlay with fixed toggle button at bottom-left
- Model selection persisted to localStorage separately
- AI SDK v6 DefaultChatTransport for useChat configuration
- UIMessage parts array extraction (no content property in v6)
- sendMessage { text } format instead of { role, content }

### Pending Todos

- None

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-01-24
Stopped at: Completed 03-03-PLAN.md (Chat components)
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

## Phase 2 Completion Summary

**Delivered:**
- Two-stage retrieval (`retrieveWithReranking`)
- Optional Cohere reranking (graceful degradation)
- RAG types (RetrievedChunk, RetrievalOptions, SourceReference)
- Supabase client singleton with service role key
- Prompt builder with [N] citation formatting
- Streaming chat API at /api/chat
- Next.js App Router configuration

**Files created:**
- src/lib/rag/types.ts
- src/lib/rag/retriever.ts
- src/lib/rag/prompt.ts
- src/lib/supabase.ts
- app/api/chat/route.ts
- next.config.js

**Verified:** 9/9 must-haves verified by gsd-verifier

## Phase 3 Progress

**Plan 01 (Foundation) - Complete:**
- Tailwind CSS 4.x with @tailwindcss/postcss plugin
- useLocalStorage hook with SSR hydration safety
- useScrollAnchor hook for chat auto-scroll
- Zustand conversation store with localStorage persistence
- OpenRouter validateApiKey and RECOMMENDED_MODELS utilities

**Files created:**
- app/globals.css, app/layout.tsx, postcss.config.mjs
- src/hooks/useLocalStorage.ts, src/hooks/useScrollAnchor.ts
- src/stores/conversationStore.ts, src/lib/openrouter.ts

**Plan 02 (Sidebar) - Complete:**
- ApiKeyConfig with localStorage persistence and OpenRouter validation
- ModelSelector dropdown with RECOMMENDED_MODELS
- ConversationList with history and CRUD operations
- Responsive Sidebar container (w-72 desktop, overlay mobile)

**Files created:**
- src/components/sidebar/ApiKeyConfig.tsx
- src/components/sidebar/ModelSelector.tsx
- src/components/sidebar/ConversationList.tsx
- src/components/sidebar/Sidebar.tsx

**Plan 03 (Chat Components) - Complete:**
- MarkdownRenderer with react-markdown and syntax highlighting
- SourcesCitation expandable source list
- TypingIndicator animated loading state
- MessageBubble role-based styling with markdown
- MessageList auto-scroll with useScrollAnchor
- ChatInput form with submit/stop functionality
- ChatContainer orchestrating useChat with DefaultChatTransport

**Files created:**
- src/components/chat/MarkdownRenderer.tsx
- src/components/chat/SourcesCitation.tsx
- src/components/chat/TypingIndicator.tsx
- src/components/chat/MessageBubble.tsx
- src/components/chat/MessageList.tsx
- src/components/chat/ChatInput.tsx
- src/components/chat/ChatContainer.tsx

**Next:** Plan 04 (Page integration and final wiring)
