# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quilibrium AI Assistant is a self-hosted RAG chatbot that answers questions about the Quilibrium protocol. Users provide their own OpenRouter API keys, and the system retrieves relevant documentation chunks from Supabase (pgvector) before streaming responses via OpenRouter.

## Commands

```bash
# Development
npm run dev              # Start Next.js dev server

# Build & Type Check
npm run build            # Production build
npm run typecheck        # TypeScript type checking (tsc --noEmit)

# Data Ingestion
npm run ingest run -d ./docs           # Ingest markdown docs into Supabase
npm run ingest run -d ./docs --dry-run # Preview ingestion without uploading
npm run ingest count                    # Count chunks in database
```

## Architecture

### RAG Pipeline Flow

```
User Query → Embed (text-embedding-3-small via OpenRouter)
           → Vector Search (Supabase pgvector RPC: match_document_chunks)
           → Rerank (Cohere rerank-v3.5, optional)
           → Build Context + System Prompt
           → Stream Response (OpenRouter LLM)
           → Return Sources as source-url parts
```

### Key Layers

- **API Route** (`app/api/chat/route.ts`): Streaming endpoint using AI SDK's `createUIMessageStream`. Validates requests, retrieves RAG context, streams LLM response with sources.

- **RAG Retriever** (`src/lib/rag/retriever.ts`): Two-stage retrieval - vector search (top 15) followed by optional Cohere reranking (top 5).

- **RAG Prompt** (`src/lib/rag/prompt.ts`): Builds numbered context blocks and system prompt with citation instructions. Generates source URLs for docs.quilibrium.com.

- **Conversation Store** (`src/stores/conversationStore.ts`): Zustand store with localStorage persistence. Tracks conversations, messages, active state. Auto-generates titles from first user message.

- **Ingestion Pipeline** (`scripts/ingest/`): CLI tool using Commander.js. Loads markdown → chunks with RecursiveCharacterTextSplitter → embeds via OpenRouter → uploads to Supabase.

### State Management

- **API Key & Model**: `useLocalStorage` hook, persisted to localStorage
- **Conversations**: Zustand store with persist middleware, max 50 conversations
- **Hydration**: All localStorage state waits for hydration before rendering to prevent SSR mismatch

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL    # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY   # Service role key (server-side only)
COHERE_API_KEY              # Optional reranking
OPENROUTER_API_KEY          # For ingestion only; users provide their own for chat
```

## Code Conventions

- Path alias: `@/*` maps to project root
- Components organized by feature: `src/components/chat/`, `src/components/sidebar/`, `src/components/ui/`
- Types co-located with modules (`types.ts` alongside implementation)
- AI SDK v6 message format: uses `parts` array with `{ type: 'text', text: string }`
