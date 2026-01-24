# Roadmap: Quilibrium AI Assistant

## Overview

This roadmap delivers a self-hosted RAG chatbot for Quilibrium documentation in 4 phases. We start with the data pipeline (embeddings must exist before retrieval can work), then build the RAG query pipeline (backend before frontend), then the chat interface (users need working backend), and finally polish features. Each phase delivers a coherent, testable capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (e.g., 2.1): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Data Pipeline** - Ingest documentation into searchable vector store
- [ ] **Phase 2: RAG Pipeline** - Query, retrieve, and generate streaming responses
- [ ] **Phase 3: Chat Interface** - User-facing chat with API key management
- [ ] **Phase 4: Polish** - Code copying and dark mode

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
- [ ] 01-01-PLAN.md — Project setup, database schema, and shared types
- [ ] 01-02-PLAN.md — Markdown loader and semantic chunker
- [ ] 01-03-PLAN.md — Embedding generator and Supabase uploader
- [ ] 01-04-PLAN.md — CLI entry point and end-to-end verification

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
**Plans**: TBD

Plans:
- [ ] 02-01: TBD (defined during plan-phase)

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
**Plans**: TBD

Plans:
- [ ] 03-01: TBD (defined during plan-phase)

### Phase 4: Polish
**Goal**: Quality-of-life features that improve daily usage
**Depends on**: Phase 3 (needs working chat)
**Requirements**: RENDER-04, RENDER-05
**Success Criteria** (what must be TRUE):
  1. User can copy code snippets with one click
  2. User can toggle between light and dark mode
**Plans**: TBD

Plans:
- [ ] 04-01: TBD (defined during plan-phase)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Data Pipeline | 0/4 | Ready to execute | - |
| 2. RAG Pipeline | 0/TBD | Not started | - |
| 3. Chat Interface | 0/TBD | Not started | - |
| 4. Polish | 0/TBD | Not started | - |

---
*Roadmap created: 2026-01-24*
*Phase 1 planned: 2026-01-24*
*Depth: standard*
*Coverage: 23/23 v1 requirements mapped*
