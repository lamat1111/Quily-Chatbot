# Roadmap: Quilibrium AI Assistant

## Overview

This roadmap delivers a self-hosted RAG chatbot for Quilibrium documentation in 4 phases. We start with the data pipeline (embeddings must exist before retrieval can work), then build the RAG query pipeline (backend before frontend), then the chat interface (users need working backend), and finally polish features. Each phase delivers a coherent, testable capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (e.g., 2.1): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Data Pipeline** - Ingest documentation into searchable vector store
- [x] **Phase 2: RAG Pipeline** - Query, retrieve, and generate streaming responses
- [x] **Phase 3: Chat Interface** - User-facing chat with API key management
- [ ] **Phase 4: Polish** - UX improvements and visual refinements

## Phase Details

### Phase 1: Data Pipeline
**Goal**: Documentation corpus is chunked, embedded, and searchable in Supabase pgvector
**Depends on**: Nothing (first phase)
**Requirements**: INGEST-01, INGEST-02, INGEST-03, INGEST-04
**Success Criteria** (what must be TRUE):
  1. CLI script chunks markdown files with semantic boundaries (500-1000 tokens, 100 overlap)
  2. CLI script generates embeddings for all chunks using specified model
  3. Embeddings are stored in Supabase with source file, heading path, and version metadata
  4. Vector similarity search returns relevant chunks for test queries
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Project setup, database schema, and shared types
- [x] 01-02-PLAN.md — Markdown loader and semantic chunker
- [x] 01-03-PLAN.md — Embedding generator and Supabase uploader
- [x] 01-04-PLAN.md — CLI entry point and end-to-end verification

### Phase 2: RAG Pipeline
**Goal**: API endpoint accepts queries, retrieves relevant context, and streams LLM responses
**Depends on**: Phase 1 (needs embedded corpus)
**Requirements**: RAG-01, RAG-02, RAG-03, RAG-04
**Success Criteria** (what must be TRUE):
  1. User query triggers semantic search against documentation vectors
  2. Retrieved chunks are assembled into LLM prompt with proper context
  3. LLM response streams token-by-token via API endpoint
  4. Response includes source citations that map to actual retrieved chunks
  5. Two-stage retrieval with reranking improves result precision
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — RAG types, Supabase client, and two-stage retriever with reranking
- [x] 02-02-PLAN.md — Prompt builder and streaming chat API route

### Phase 3: Chat Interface
**Goal**: Users can chat with the assistant using their own API keys
**Depends on**: Phase 2 (needs working RAG API)
**Requirements**: KEY-01, KEY-02, KEY-03, KEY-04, KEY-05, CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, RENDER-01, RENDER-02, RENDER-03
**Success Criteria** (what must be TRUE):
  1. User can enter and validate their OpenRouter API key
  2. API key persists in localStorage across browser sessions
  3. User can select from available LLM models in dropdown
  4. User can type a question and submit it
  5. Response streams character-by-character with typing indicator
  6. User can stop generation mid-stream
  7. Error messages display clearly for API failures and rate limits
  8. Responses render with markdown formatting and syntax-highlighted code
  9. Interface works on mobile devices (responsive design)
**Plans**: 4 plans

Plans:
- [x] 03-01-PLAN.md — Foundation setup (Tailwind, hooks, stores, utilities)
- [x] 03-02-PLAN.md — Sidebar components (API key, model selector, conversations)
- [x] 03-03-PLAN.md — Chat components (messages, input, markdown rendering)
- [x] 03-04-PLAN.md — Main page integration, dark theme, and visual verification

### Phase 4: Polish
**Goal**: Quality-of-life features that improve daily usage
**Depends on**: Phase 3 (needs working chat)
**Requirements**: RENDER-04, RENDER-05, POLISH-01, POLISH-02, POLISH-03, POLISH-04
**Success Criteria** (what must be TRUE):
  1. User can copy code snippets with one click (copy button on code blocks)
  2. User can copy entire assistant response with one click
  3. Keyboard shortcuts work (Ctrl/Cmd+Enter to send, Escape to stop)
  4. Loading skeletons show during initial page load and API calls
  5. API key configuration opens in modal dialog (not sidebar)
  6. Modal includes OpenRouter explanation and signup link
  7. Light/dark mode toggle available (dark is default)
**Plans**: 5 plans

Plans:
- [ ] 04-01-PLAN.md — Theme infrastructure with next-themes and light/dark toggle
- [ ] 04-02-PLAN.md — Clipboard hook and reusable UI components (CopyButton, Skeleton)
- [ ] 04-03-PLAN.md — Copy buttons for code blocks and message responses
- [ ] 04-04-PLAN.md — API key modal with OpenRouter explanation
- [ ] 04-05-PLAN.md — Keyboard shortcuts, loading skeletons, and final verification

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Data Pipeline | 4/4 | Complete | 2026-01-24 |
| 2. RAG Pipeline | 2/2 | Complete | 2026-01-24 |
| 3. Chat Interface | 4/4 | Complete | 2026-01-24 |
| 4. Polish | 0/5 | Ready to execute | - |

---
*Roadmap created: 2026-01-24*
*Phase 1 planned: 2026-01-24*
*Phase 2 planned: 2026-01-24*
*Phase 3 planned: 2026-01-24*
*Phase 4 planned: 2026-01-25*
*Depth: standard*
*Coverage: 23/23 v1 requirements mapped*
