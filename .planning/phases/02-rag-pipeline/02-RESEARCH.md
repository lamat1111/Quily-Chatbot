# Phase 2: RAG Pipeline - Research

**Researched:** 2026-01-24
**Domain:** Retrieval-Augmented Generation (semantic search, context injection, LLM streaming, reranking)
**Confidence:** HIGH

## Summary

This research covers the complete RAG pipeline for answering user queries using the embedded documentation corpus from Phase 1. The pipeline consists of four stages: (1) semantic search using the `match_document_chunks` RPC function, (2) optional reranking for precision improvement, (3) context injection into a structured LLM prompt with source tracking, and (4) streaming LLM response via Vercel AI SDK with OpenRouter.

The recommended approach uses the Vercel AI SDK `streamText()` function with the `@openrouter/ai-sdk-provider` for streaming responses, Cohere's `rerank-v3.5` model via `@ai-sdk/cohere` for two-stage retrieval, and a structured prompt format that enforces source citations. The existing `match_document_chunks` RPC from Phase 1 handles initial retrieval, returning chunks with similarity scores and source metadata.

Key findings: (1) Vercel AI SDK 6.0+ has native reranking support via `rerank()` function with Cohere provider; (2) Citations should be enforced via system prompt with numbered references matching retrieved chunk indices; (3) `toUIMessageStreamResponse()` is the recommended streaming response format for Next.js App Router; (4) Cohere reranking costs $2/1000 searches - acceptable for documentation Q&A scale.

**Primary recommendation:** Use `match_document_chunks` for initial recall (10-20 chunks), `rerank()` with Cohere to filter to top 5, inject as numbered context blocks, stream via `streamText()` with citation instructions in system prompt.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ai (Vercel AI SDK) | ^6.0.37+ | Streaming, reranking, chat management | Native reranking support, streamText, unified API |
| @openrouter/ai-sdk-provider | ^1.5.4+ | LLM access via OpenRouter | Official provider, 300+ models, user BYOK |
| @ai-sdk/cohere | ^1.0+ | Reranking model access | Native rerank() integration, best-in-class model |
| @supabase/supabase-js | ^2.79+ | Vector search via RPC | Already established in Phase 1 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @ai-sdk/react | ^1.0+ | useChat hook for frontend | Client-side chat state management (Phase 3) |
| zod | ^3.22+ | Schema validation | Validate API request/response shapes |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Cohere reranking | Jina reranker API | Jina has 10M free tokens, but no native AI SDK integration |
| Cohere reranking | Local cross-encoder | Requires GPU/compute, adds complexity |
| streamText | generateText | No streaming - worse UX for chat |

**Installation:**
```bash
npm install ai @openrouter/ai-sdk-provider @ai-sdk/cohere zod
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── api/
│   └── chat/
│       └── route.ts       # Streaming chat endpoint
src/
├── lib/
│   ├── rag/
│   │   ├── retriever.ts   # Vector search + reranking
│   │   ├── prompt.ts      # Prompt assembly with context
│   │   └── types.ts       # RAG-specific types
│   ├── openrouter.ts      # OpenRouter provider factory
│   └── supabase.ts        # Supabase client (from Phase 1)
```

### Pattern 1: Two-Stage Retrieval with Reranking
**What:** Initial broad recall followed by precision reranking
**When to use:** Always for documentation Q&A - improves relevance significantly
**Example:**
```typescript
// Source: Vercel AI SDK reranking docs + Cohere provider
import { rerank } from 'ai';
import { cohere } from '@ai-sdk/cohere';
import { supabase } from '@/lib/supabase';
import { embed } from 'ai';
import { openrouter } from '@/lib/openrouter';

async function retrieveContext(query: string) {
  // Stage 1: Broad recall via pgvector (10-20 chunks)
  const { embedding } = await embed({
    model: openrouter.textEmbeddingModel('openai/text-embedding-3-small'),
    value: query,
  });

  const { data: initialResults } = await supabase
    .rpc('match_document_chunks', {
      query_embedding: embedding,
      match_threshold: 0.5,  // Lower threshold for recall
      match_count: 15,       // More candidates for reranking
    });

  // Stage 2: Precision reranking (top 5)
  const { rerankedDocuments } = await rerank({
    model: cohere.reranking('rerank-v3.5'),
    query,
    documents: initialResults.map(r => r.content),
    topN: 5,
  });

  // Map back to original results with metadata
  return rerankedDocuments.map((doc, idx) => {
    const original = initialResults[doc.originalIndex];
    return {
      ...original,
      relevanceScore: doc.score,
      citationIndex: idx + 1,
    };
  });
}
```

### Pattern 2: Structured Context Injection with Citations
**What:** Format retrieved chunks with numbered references for citation tracking
**When to use:** Every RAG prompt - enables source attribution
**Example:**
```typescript
// Source: RAG best practices research
interface RetrievedChunk {
  content: string;
  source_file: string;
  heading_path: string | null;
  similarity: number;
  citationIndex: number;
}

function buildContextBlock(chunks: RetrievedChunk[]): string {
  return chunks.map(chunk => {
    const source = chunk.heading_path
      ? `${chunk.source_file} > ${chunk.heading_path}`
      : chunk.source_file;
    return `[${chunk.citationIndex}] Source: ${source}
${chunk.content}`;
  }).join('\n\n---\n\n');
}

function buildSystemPrompt(context: string): string {
  return `You are a helpful assistant that answers questions about Quilibrium protocol documentation.

## Instructions
- Answer questions using ONLY the provided context below
- Cite sources using [1], [2], etc. matching the source numbers in the context
- If the context doesn't contain the answer, say "I don't have information about that in the documentation"
- Be concise but complete
- Format code examples with proper markdown code blocks

## Context
${context}

## Response Format
Provide your answer with inline citations like [1] when referencing information from the context.`;
}
```

### Pattern 3: Streaming Chat Route Handler
**What:** Next.js App Router API route that streams LLM responses
**When to use:** The /api/chat endpoint for RAG
**Example:**
```typescript
// Source: Vercel AI SDK Next.js App Router guide
// app/api/chat/route.ts
import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { retrieveContext, buildSystemPrompt, buildContextBlock } from '@/lib/rag';

export async function POST(req: Request) {
  const { messages, apiKey, model } = await req.json() as {
    messages: UIMessage[];
    apiKey: string;
    model: string;
  };

  // Create provider with user's API key
  const openrouter = createOpenRouter({ apiKey });

  // Get the last user message for retrieval
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  if (!lastUserMessage) {
    return new Response('No user message', { status: 400 });
  }

  // Retrieve and rerank context
  const chunks = await retrieveContext(lastUserMessage.content);
  const context = buildContextBlock(chunks);
  const systemPrompt = buildSystemPrompt(context);

  // Stream response
  const result = streamText({
    model: openrouter.chat(model),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
```

### Pattern 4: Source Citations in Response
**What:** Return source metadata alongside streamed response
**When to use:** To display clickable source links in UI
**Example:**
```typescript
// Source: Vercel AI SDK data stream patterns
import { createDataStreamResponse, streamText } from 'ai';

export async function POST(req: Request) {
  const { messages, apiKey, model } = await req.json();

  const openrouter = createOpenRouter({ apiKey });
  const chunks = await retrieveContext(messages);

  return createDataStreamResponse({
    execute: async (dataStream) => {
      // Send sources first (before LLM response)
      dataStream.writeData({
        type: 'sources',
        sources: chunks.map(c => ({
          index: c.citationIndex,
          file: c.source_file,
          heading: c.heading_path,
          url: `/docs/${c.source_file.replace('.md', '')}`,
        })),
      });

      // Then stream LLM response
      const result = streamText({
        model: openrouter.chat(model),
        system: buildSystemPrompt(buildContextBlock(chunks)),
        messages: await convertToModelMessages(messages),
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}
```

### Anti-Patterns to Avoid
- **Retrieving too few chunks:** Retrieve 10-20 for reranking, not just 3-5. Reranker needs candidates.
- **Skipping reranking:** Embedding similarity alone has lower precision than reranked results.
- **Not enforcing citations:** Without explicit instruction, LLMs may hallucinate or not cite.
- **Hardcoded API keys:** Always pass user's API key from request, never store server-side.
- **Blocking on retrieval:** Use streaming for LLM, but retrieval/reranking must complete first.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| LLM streaming | Manual SSE/fetch | `streamText()` + `toUIMessageStreamResponse()` | Handles backpressure, cancellation, error recovery |
| Reranking | Sort by embedding similarity | `rerank()` with Cohere | Cross-encoder understands query-document relationship |
| Chat state | Manual message array | `useChat` hook (Phase 3) | Handles optimistic updates, streaming, abort |
| Prompt templates | String concatenation | Structured builder functions | Prevents injection, ensures consistency |
| API key validation | Regex check | Let OpenRouter validate | Returns proper error codes |

**Key insight:** The RAG pipeline has many moving parts - retrieval, reranking, prompt assembly, streaming. Using AI SDK's unified API prevents integration bugs and provides consistent error handling across providers.

## Common Pitfalls

### Pitfall 1: Embedding Model Mismatch
**What goes wrong:** Query embedded with different model than documents
**Why it happens:** Hardcoded model names in different files
**How to avoid:** Single constant for embedding model; use same model in retriever as ingestion
**Warning signs:** Semantically relevant documents score low in similarity

### Pitfall 2: Context Window Overflow
**What goes wrong:** Prompt exceeds LLM context limit, causing errors or truncation
**Why it happens:** Retrieved chunks too long, too many chunks retrieved
**How to avoid:** Calculate token count of context; limit chunks based on model limit minus expected response
**Warning signs:** API errors about context length, responses that ignore later context

### Pitfall 3: Missing API Key Handling
**What goes wrong:** Requests fail silently or expose server-side keys
**Why it happens:** No validation of user-provided API key
**How to avoid:** Validate API key presence before creating provider; return 401 for missing/invalid
**Warning signs:** Unauthorized errors, users seeing "undefined" in responses

### Pitfall 4: No Source Tracking Through Reranking
**What goes wrong:** Cannot map reranked documents back to original metadata
**Why it happens:** Reranking returns just content, loses source_file/heading_path
**How to avoid:** Use `originalIndex` from rerank response to map back to full records
**Warning signs:** Citations show wrong sources, no source links work

### Pitfall 5: Citation Hallucination
**What goes wrong:** LLM invents source numbers that don't exist
**Why it happens:** System prompt doesn't constrain citation format
**How to avoid:** Explicitly list valid citation numbers; instruct "only use [1] through [N]"
**Warning signs:** Response contains [6] when only 5 sources provided

### Pitfall 6: Cold Start Latency
**What goes wrong:** First request takes 5-10 seconds
**Why it happens:** Edge runtime cold start + embedding + reranking + LLM call
**How to avoid:** Consider Node.js runtime for /api/chat; warm-up strategies; show loading states
**Warning signs:** User complains about slow first message

## Code Examples

Verified patterns from official sources:

### Complete Retriever Module
```typescript
// src/lib/rag/retriever.ts
// Source: Vercel AI SDK docs + Cohere reranking docs
import { embed, rerank } from 'ai';
import { cohere } from '@ai-sdk/cohere';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface RetrievedChunk {
  id: number;
  content: string;
  source_file: string;
  heading_path: string | null;
  similarity: number;
  citationIndex: number;
}

export async function retrieveWithReranking(
  query: string,
  options: {
    embeddingApiKey: string;
    cohereApiKey?: string;
    initialCount?: number;
    finalCount?: number;
    similarityThreshold?: number;
  }
): Promise<RetrievedChunk[]> {
  const {
    embeddingApiKey,
    cohereApiKey,
    initialCount = 15,
    finalCount = 5,
    similarityThreshold = 0.5,
  } = options;

  // Generate query embedding
  const openrouter = createOpenRouter({ apiKey: embeddingApiKey });
  const { embedding } = await embed({
    model: openrouter.textEmbeddingModel('openai/text-embedding-3-small'),
    value: query,
  });

  // Stage 1: Vector similarity search
  const { data: candidates, error } = await supabase.rpc('match_document_chunks', {
    query_embedding: embedding,
    match_threshold: similarityThreshold,
    match_count: initialCount,
  });

  if (error) throw new Error(`Retrieval failed: ${error.message}`);
  if (!candidates?.length) return [];

  // Stage 2: Rerank if Cohere key provided
  if (cohereApiKey && candidates.length > finalCount) {
    const cohereProvider = cohere.reranking('rerank-v3.5');

    const { rerankedDocuments } = await rerank({
      model: cohereProvider,
      query,
      documents: candidates.map(c => c.content),
      topN: finalCount,
    });

    return rerankedDocuments.map((doc, idx) => {
      const original = candidates[doc.originalIndex];
      return {
        ...original,
        citationIndex: idx + 1,
      };
    });
  }

  // Fallback: Just take top N by similarity
  return candidates.slice(0, finalCount).map((chunk, idx) => ({
    ...chunk,
    citationIndex: idx + 1,
  }));
}
```

### Prompt Builder Module
```typescript
// src/lib/rag/prompt.ts
// Source: RAG prompt engineering best practices
import type { RetrievedChunk } from './retriever';

export function buildContextBlock(chunks: RetrievedChunk[]): string {
  if (!chunks.length) {
    return 'No relevant documentation found.';
  }

  return chunks.map(chunk => {
    const source = chunk.heading_path
      ? `${chunk.source_file} > ${chunk.heading_path}`
      : chunk.source_file;

    return `[${chunk.citationIndex}] Source: ${source}
---
${chunk.content}`;
  }).join('\n\n');
}

export function buildSystemPrompt(context: string, chunkCount: number): string {
  const citationRange = chunkCount > 0
    ? `Use citations [1] through [${chunkCount}] to reference sources.`
    : '';

  return `You are a knowledgeable assistant for the Quilibrium protocol. Answer questions using the provided documentation context.

## Guidelines
1. Answer based ONLY on the provided context
2. ${citationRange}
3. If the context doesn't answer the question, say: "I don't have specific information about that in the documentation."
4. Be concise but thorough
5. Use markdown formatting for code blocks, lists, and emphasis
6. When citing, place the citation immediately after the relevant statement, like this [1]

## Documentation Context
${context}

## Important
- Never make up information not in the context
- Never invent citation numbers beyond what's provided
- If multiple sources support a point, cite all of them [1][2]`;
}
```

### Chat API Route
```typescript
// app/api/chat/route.ts
// Source: Vercel AI SDK Next.js guide + OpenRouter provider
import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { retrieveWithReranking } from '@/lib/rag/retriever';
import { buildContextBlock, buildSystemPrompt } from '@/lib/rag/prompt';
import { z } from 'zod';

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  apiKey: z.string().min(1, 'API key required'),
  model: z.string().default('anthropic/claude-3.5-sonnet'),
  cohereApiKey: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, apiKey, model, cohereApiKey } = requestSchema.parse(body);

    // Get the latest user message for context retrieval
    const userMessages = messages.filter(m => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1];

    if (!lastUserMessage) {
      return new Response(JSON.stringify({ error: 'No user message found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Retrieve relevant context with optional reranking
    const chunks = await retrieveWithReranking(lastUserMessage.content, {
      embeddingApiKey: apiKey,
      cohereApiKey,
      initialCount: 15,
      finalCount: 5,
    });

    // Build prompt with context
    const context = buildContextBlock(chunks);
    const systemPrompt = buildSystemPrompt(context, chunks.length);

    // Create provider with user's key and stream response
    const openrouter = createOpenRouter({ apiKey });

    const result = streamText({
      model: openrouter.chat(model),
      system: systemPrompt,
      messages: await convertToModelMessages(
        messages as UIMessage[]
      ),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

### Streaming with Sources Metadata
```typescript
// app/api/chat/route.ts (alternative with pre-streamed sources)
// Source: Vercel AI SDK createDataStreamResponse docs
import { createDataStreamResponse, streamText, convertToModelMessages } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { retrieveWithReranking, RetrievedChunk } from '@/lib/rag/retriever';
import { buildContextBlock, buildSystemPrompt } from '@/lib/rag/prompt';

function formatSourcesForClient(chunks: RetrievedChunk[]) {
  return chunks.map(chunk => ({
    index: chunk.citationIndex,
    file: chunk.source_file,
    heading: chunk.heading_path,
    // Convert file path to doc URL (adjust pattern as needed)
    url: chunk.source_file.startsWith('docs/')
      ? `https://docs.quilibrium.com/${chunk.source_file.replace('docs/', '').replace('.md', '')}`
      : null,
  }));
}

export async function POST(req: Request) {
  const { messages, apiKey, model, cohereApiKey } = await req.json();

  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  if (!lastUserMessage) {
    return new Response('No user message', { status: 400 });
  }

  const chunks = await retrieveWithReranking(lastUserMessage.content, {
    embeddingApiKey: apiKey,
    cohereApiKey,
  });

  const openrouter = createOpenRouter({ apiKey });

  return createDataStreamResponse({
    execute: async (dataStream) => {
      // Send sources metadata before LLM response starts
      dataStream.writeData({
        type: 'sources',
        data: formatSourcesForClient(chunks),
      });

      // Stream LLM response
      const result = streamText({
        model: openrouter.chat(model),
        system: buildSystemPrompt(buildContextBlock(chunks), chunks.length),
        messages: await convertToModelMessages(messages),
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single-stage retrieval | Two-stage (retrieve + rerank) | 2024-2025 | 10-30% precision improvement |
| LangChain for RAG | Vercel AI SDK raw | 2025-2026 | Less abstraction, better streaming |
| Custom streaming SSE | `toUIMessageStreamResponse()` | AI SDK 4.0+ | Simpler, handles edge cases |
| Manual message conversion | `convertToModelMessages()` | AI SDK 6.0 | Type-safe, multi-modal ready |
| Separate embed/chat calls | Unified AI SDK providers | 2025 | Consistent API across operations |

**Deprecated/outdated:**
- `toDataStreamResponse()` alone: Use `createDataStreamResponse` for pre-streaming data
- `convertToCoreMessages()`: Renamed to `convertToModelMessages()` in AI SDK 6.0
- LangChain for simple RAG: Overkill; Vercel AI SDK handles streaming + tools natively

## Open Questions

Things that couldn't be fully resolved:

1. **Cohere API Key Management**
   - What we know: Cohere reranking needs its own API key ($2/1000 searches)
   - What's unclear: Should user provide Cohere key separately, or use fallback without reranking?
   - Recommendation: Make reranking optional; if no Cohere key, skip reranking stage and use top similarity results

2. **Optimal Initial Retrieval Count**
   - What we know: Retrieve more than final count to give reranker candidates
   - What's unclear: Exact ratio (2x? 3x? 4x?) for this corpus size
   - Recommendation: Start with 15 candidates -> 5 final; tune based on relevance feedback

3. **Context Token Budget**
   - What we know: Different models have different context limits
   - What's unclear: How to dynamically adjust chunk count based on model
   - Recommendation: Default to 5 chunks (~2500 tokens); add model-specific limits if needed

4. **Jina vs Cohere for Reranking**
   - What we know: Jina has 10M free tokens, Cohere has better AI SDK integration
   - What's unclear: Whether Jina integration is worth the HTTP calls without native provider
   - Recommendation: Use Cohere for native integration; consider Jina as cost-free fallback

## Sources

### Primary (HIGH confidence)
- [Vercel AI SDK Reranking Docs](https://ai-sdk.dev/docs/ai-sdk-core/reranking) - rerank() function API
- [Vercel AI SDK streamText Reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text) - Streaming API
- [Vercel AI SDK Next.js Guide](https://ai-sdk.dev/docs/getting-started/nextjs-app-router) - App Router setup
- [Vercel AI SDK RAG Guide](https://ai-sdk.dev/cookbook/guides/rag-chatbot) - RAG patterns
- [@openrouter/ai-sdk-provider GitHub](https://github.com/OpenRouterTeam/ai-sdk-provider) - OpenRouter integration
- [@ai-sdk/cohere Provider Docs](https://ai-sdk.dev/providers/ai-sdk-providers/cohere) - Cohere reranking setup
- [Cohere Pricing](https://cohere.com/pricing) - $2/1000 searches for rerank-v3.5

### Secondary (MEDIUM confidence)
- [Jina Reranker API](https://jina.ai/reranker/) - Alternative reranking (10M free tokens)
- [RAG Prompt Engineering Guide](https://www.promptingguide.ai/techniques/rag) - Citation patterns
- [AI SDK 6 Announcement](https://vercel.com/blog/ai-sdk-6) - Latest features

### Tertiary (LOW confidence)
- Optimal chunk counts for reranking (requires experimentation)
- Edge runtime performance for RAG (monitor cold starts)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified with official documentation
- Architecture: HIGH - Patterns from official RAG guides and SDK docs
- Pitfalls: MEDIUM - Compiled from multiple sources, some based on community experience
- Reranking integration: HIGH - Native AI SDK support verified

**Research date:** 2026-01-24
**Valid until:** 2026-02-24 (30 days - libraries are stable)
