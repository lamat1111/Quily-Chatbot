# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quily Chat is a self-hosted RAG chatbot that answers questions about the Quilibrium protocol. Users authenticate via OpenRouter API key or Chutes OAuth, and the system retrieves relevant documentation chunks from Supabase (pgvector) before streaming responses.

## Commands

```bash
# Development
yarn dev              # Start Next.js dev server

# Build & Type Check
yarn build            # Production build
yarn typecheck        # TypeScript type checking (tsc --noEmit)

# Data Ingestion
yarn ingest run -d ./docs           # Ingest markdown docs into Supabase
yarn ingest run -d ./docs --dry-run # Preview ingestion without uploading
yarn ingest count                    # Count chunks in database
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
OPENROUTER_API_KEY          # For ingestion; users can use OpenRouter or Chutes for chat
```

## Code Conventions

- Path alias: `@/*` maps to project root
- Components organized by feature: `src/components/chat/`, `src/components/sidebar/`, `src/components/ui/`
- Types co-located with modules (`types.ts` alongside implementation)
- AI SDK v6 message format: uses `parts` array with `{ type: 'text', text: string }`

## Mobile-First Design Rules (Tailwind CSS)

**IMPORTANT:** Apply these rules automatically when writing ANY Tailwind CSS code. Do not wait for an audit.

### Typography: The Mobile Bump Scale

On mobile (< 640px), text needs to be one size larger than desktop for readability:

| For Desktop Size | Write This Pattern | Result |
|------------------|-------------------|--------|
| `text-xs` (12px) | `text-sm sm:text-xs` | 14px mobile, 12px desktop |
| `text-sm` (14px) | `text-base sm:text-sm` | 16px mobile, 14px desktop |

**Rules:**
- NEVER use bare `text-xs` for readable content (body text, labels, nav items, citations, help text)
- NEVER use bare `text-sm` for important readable content without considering mobile
- ALWAYS use the responsive pattern: `text-sm sm:text-xs` or `text-base sm:text-sm`
- ONLY exceptions: badges, decorative labels, character counters, keyboard hints

### Touch Targets: 44px Minimum

All interactive elements must have a minimum touch target of **44×44px** on mobile:

| Element | Minimum | Tailwind |
|---------|---------|----------|
| Buttons | 44×44px | `min-h-11 min-w-11` |
| Icon buttons | 44×44px | `p-2.5` around `w-6 h-6` icon, or `w-11 h-11` |
| List item links | 44px height | `py-3` minimum |
| Form inputs | 44px height | `h-11` |

**Rules:**
- NEVER use `w-6 h-6`, `w-8 h-8` alone on clickable icons without padding
- NEVER use `p-1`, `p-2` on icon buttons - use `p-2.5` or `p-3`
- NEVER use `py-1`, `py-2` on clickable list items - use `py-3`
- NEVER use `h-8`, `h-9` on inputs - use `h-11`
- ALWAYS ensure 8px+ gap between adjacent touch targets

### Quick Reference

```jsx
// WRONG - too small on mobile
<span className="text-xs">Label</span>
<button className="p-1"><Icon className="w-6 h-6" /></button>
<a className="py-1">Nav item</a>

// CORRECT - mobile-friendly
<span className="text-sm sm:text-xs">Label</span>
<button className="p-2.5"><Icon className="w-6 h-6" /></button>
<a className="py-3">Nav item</a>
```
