# Technology Stack

**Project:** Quilibrium Documentation RAG Chatbot
**Researched:** 2026-01-24
**Overall Confidence:** HIGH

## Executive Summary

For a self-hosted RAG chatbot targeting Quilibrium protocol documentation with zero operational cost (user-provided API keys), the recommended stack leverages the Vercel AI SDK as the foundation rather than heavier frameworks like LangChain. The key insight from 2025-2026 ecosystem research: **for simple RAG use cases, raw implementation with Vercel AI SDK beats framework overhead**.

The stack prioritizes:
- **Simplicity over abstraction** - Vercel AI SDK handles LLM streaming without LangChain complexity
- **Integration quality** - assistant-ui + Vercel AI SDK is the best-documented combination
- **Cost efficiency** - pgvector on Supabase free tier is proven for <100k vectors
- **Modern embedding options** - text-embedding-3-small outperforms all-MiniLM-L6-v2 in quality

---

## Recommended Stack

### Chat UI Layer

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **assistant-ui** | ^0.7.x | Chat UI components | HIGH |
| @assistant-ui/react | ^0.7.x | Core React components | HIGH |
| @assistant-ui/react-ai-sdk | ^0.7.x | Vercel AI SDK integration | HIGH |

**Why assistant-ui over chatbot-ui-lite:**

1. **Active maintenance**: assistant-ui has 8.2k GitHub stars with updates as recent as January 2026. chatbot-ui-lite is a minimal starter that hasn't been significantly updated.

2. **Vercel AI SDK integration**: First-class support via `@assistant-ui/react-ai-sdk` with `useChatRuntime` hook - handles streaming, tool calls, and message state automatically.

3. **Production features out of box**:
   - Streaming with auto-scroll and interruptions
   - Markdown rendering with code highlighting
   - Accessibility and keyboard shortcuts built-in
   - Source citation rendering (critical for RAG)
   - Optimized bundle with minimal re-renders

4. **Composable primitives**: Not a monolithic component - you get Thread, Message, Input primitives that can be styled with Tailwind/shadcn.

5. **Enterprise adoption**: Used by LangChain, Browser Use, and 50k+ monthly npm downloads.

**chatbot-ui-lite assessment:**
- Minimal starter kit with ~21 commits total
- No built-in streaming infrastructure
- Would require significant work to add RAG-specific features
- Better suited for learning/prototyping, not production

**VERDICT: Use assistant-ui** - the integration story with Vercel AI SDK is mature and well-documented.

---

### LLM Orchestration Layer

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **Vercel AI SDK** | ^6.0.x | LLM streaming, chat management | HIGH |
| ai | ^6.0.37+ | Core SDK | HIGH |
| @openrouter/ai-sdk-provider | ^1.5.x | OpenRouter integration | HIGH |

**Why Vercel AI SDK over LangChain/LlamaIndex:**

1. **Right-sized for RAG**: 2025-2026 consensus is clear - LangChain's abstraction overhead is "unnecessary for basic RAG use cases." For a documentation chatbot doing semantic search + LLM response, Vercel AI SDK provides exactly what's needed.

2. **Performance**: Benchmark data shows LangChain adds ~10ms overhead vs ~3-6ms for lighter approaches. More importantly, LangChain pulls in 50+ packages vs 3-5 for raw implementation.

3. **First-class streaming**: `streamText()` and `useChat()` handle the hard parts:
   - Token-by-token streaming to UI
   - Message state management
   - Abort/retry handling
   - Type-safe message formats

4. **AI SDK 6 features** (released December 2025):
   - Agent abstraction for future extensibility
   - Tool execution with human-in-the-loop
   - Reranking support for improved retrieval
   - LangChain adapter if you need it later

5. **OpenRouter provider**: Official `@openrouter/ai-sdk-provider` package with AI SDK v5/v6 support, used by 162+ projects.

**When you WOULD use LangChain:**
- Multi-step reasoning chains with state
- Complex agent workflows with tool orchestration
- Need for LangSmith observability
- Team already invested in LangChain ecosystem

**VERDICT: Use Vercel AI SDK raw** - you get streaming, chat management, and OpenRouter integration without framework overhead. Add LangChain later only if complexity demands it.

---

### Vector Database Layer

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **Supabase** | Latest | Database + Auth | HIGH |
| **pgvector** | 0.8.x | Vector similarity search | HIGH |

**Why pgvector on Supabase:**

1. **Already decided** - Supabase with pgvector is in project constraints. Research validates this is appropriate for the use case.

2. **Scale validation**: pgvector performs well for <1M vectors, and documentation chatbots typically have <100k chunks. Query latency under 100ms is achievable.

3. **Hybrid search**: Supabase supports semantic + keyword search in same query - useful for technical documentation with specific terms.

4. **Row Level Security**: Built-in RLS for future multi-tenant scenarios without changing architecture.

5. **Free tier sufficient**: Supabase free tier provides adequate storage and compute for documentation corpus.

**Limitations to monitor:**
- Performance drops at 10M+ vectors (not a concern for docs)
- Index build times can be slow for large batches (batch during ingestion, not runtime)
- 8KB page limit constrains very high-dimensional embeddings (1536 dims is fine)

**Schema recommendation:**
```sql
create table documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  metadata jsonb,
  embedding vector(1536), -- for text-embedding-3-small
  created_at timestamptz default now()
);

create index on documents
using hnsw (embedding vector_cosine_ops);
```

**VERDICT: Supabase pgvector validated** - appropriate for documentation scale, with room to grow.

---

### Embedding Model Layer

| Technology | Dimensions | Cost | Confidence |
|------------|------------|------|------------|
| **text-embedding-3-small** | 1536 | $0.02/1M tokens | HIGH |
| nomic-embed-text-v1.5 | 768 | Free (self-host) | MEDIUM |

**Why text-embedding-3-small over all-MiniLM-L6-v2:**

1. **all-MiniLM-L6-v2 is outdated**: 2019 architecture with only 384 dimensions. Hacker News consensus (Jan 2026): "Don't use all-MiniLM-L6-v2 for new vector embeddings datasets."

2. **Performance gap**: all-MiniLM-L6-v2 achieved only 56% Top-5 accuracy in recent benchmarks vs 86%+ for modern models. For documentation Q&A, retrieval quality directly impacts answer quality.

3. **Context length**: all-MiniLM-L6-v2 limited to 512 tokens. text-embedding-3-small handles longer chunks better, important for documentation with code blocks.

4. **Cost is negligible**: At $0.02/1M tokens, embedding your entire documentation corpus costs pennies. User pays via their API key anyway.

**Alternative: nomic-embed-text-v1.5**

If you want to avoid OpenAI dependency for embeddings:
- Outperforms text-embedding-3-small on 2/3 benchmarks
- 8192 token context length
- Can run locally via Ollama
- 768 dimensions (smaller storage)

Trade-off: 2x slower embedding time, requires self-hosting or API setup.

**VERDICT: Use text-embedding-3-small** - best quality/simplicity ratio for user-provided API key model. Consider nomic-embed if OpenAI-free requirement emerges.

---

### LLM Routing Layer

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **OpenRouter** | API v1 | Multi-model LLM access | HIGH |
| @openrouter/ai-sdk-provider | ^1.5.4 | Vercel AI SDK integration | HIGH |

**Why OpenRouter (already decided, validated):**

1. **300+ models via single API**: Users can choose Claude, GPT-4, Llama, Mistral, etc. with their own keys.

2. **BYOK support**: User provides their own API key - zero cost to you. 5% fee on upstream usage (moving to fixed subscription).

3. **Vercel AI SDK integration**: First-class provider package that works with `streamText()` and `generateText()`.

4. **Latency**: ~25-40ms overhead is acceptable for chat applications where LLM response dominates latency.

**Implementation pattern:**
```typescript
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

const openrouter = createOpenRouter({
  apiKey: userProvidedKey, // from user input
});

const result = await streamText({
  model: openrouter.chat('anthropic/claude-3.5-sonnet'),
  messages,
  system: systemPrompt,
});
```

**VERDICT: OpenRouter validated** - mature integration, appropriate for user-provided key model.

---

### Framework Layer (Already Decided)

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Next.js | 14.x+ | App framework | HIGH |
| Tailwind CSS | 3.x | Styling | HIGH |
| Vercel Edge Runtime | - | Deployment | HIGH |

**Edge Runtime considerations:**
- 1MB request limit (fine for chat)
- 4MB function size limit (monitor bundle)
- No native Node.js APIs (use Edge-compatible packages)
- Shorter cold starts than serverless

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Chat UI | assistant-ui | chatbot-ui-lite | Minimal features, no streaming infra, unmaintained |
| Chat UI | assistant-ui | @llamaindex/chat-ui | Less mature, tighter LlamaIndex coupling |
| RAG Framework | Vercel AI SDK (raw) | LangChain | Overkill for simple RAG, 50+ deps, abstraction overhead |
| RAG Framework | Vercel AI SDK (raw) | LlamaIndex | Better for complex indexing, not needed for single doc corpus |
| Embedding | text-embedding-3-small | all-MiniLM-L6-v2 | Outdated (2019), lower accuracy, short context |
| Embedding | text-embedding-3-small | nomic-embed-text-v2 | Requires self-hosting, 2x slower |
| Vector DB | Supabase pgvector | Pinecone | Cost (vs free tier), another service to manage |
| Vector DB | Supabase pgvector | Qdrant | More setup, not needed at docs scale |

---

## Installation

```bash
# Core dependencies
npm install ai @openrouter/ai-sdk-provider
npm install @assistant-ui/react @assistant-ui/react-ai-sdk
npm install @supabase/supabase-js

# For embedding generation (if done client-side via OpenRouter)
# No additional packages - use OpenRouter with embedding model

# Dev dependencies
npm install -D @types/node typescript
```

**package.json versions (pin these):**
```json
{
  "dependencies": {
    "ai": "^6.0.37",
    "@openrouter/ai-sdk-provider": "^1.5.4",
    "@assistant-ui/react": "^0.7.0",
    "@assistant-ui/react-ai-sdk": "^0.7.0",
    "@supabase/supabase-js": "^2.45.0",
    "next": "^14.2.0",
    "react": "^18.3.0",
    "tailwindcss": "^3.4.0"
  }
}
```

---

## What NOT to Use

| Technology | Why Not |
|------------|---------|
| **LangChain** (for v1) | Overhead for simple RAG, complexity creep, 50+ deps |
| **all-MiniLM-L6-v2** | Outdated 2019 model, poor accuracy, 512 token limit |
| **chatbot-ui-lite** | Unmaintained, no streaming, would need significant work |
| **Chroma** | Good for prototyping, not recommended for production |
| **Custom streaming** | Vercel AI SDK already solves this well |
| **Pinecone/Qdrant** | Adds cost and complexity when pgvector suffices |

---

## Confidence Assessment

| Area | Level | Rationale |
|------|-------|-----------|
| Chat UI (assistant-ui) | HIGH | Official docs, npm stats, recent updates, production usage |
| Vercel AI SDK | HIGH | Official Vercel docs, Context7 verified, AI SDK 6 released Dec 2025 |
| OpenRouter integration | HIGH | Official provider package, documented integration |
| pgvector for docs scale | HIGH | Multiple sources confirm <1M vector performance |
| text-embedding-3-small | HIGH | Benchmark data, pricing verified, superior to alternatives |
| Raw RAG vs LangChain | MEDIUM | Community consensus clear, but verify with prototype |

---

## Sources

### HIGH Confidence (Official/Verified)
- [Vercel AI SDK 6 Announcement](https://vercel.com/blog/ai-sdk-6) - December 2025
- [assistant-ui GitHub](https://github.com/assistant-ui/assistant-ui) - Updated January 2026
- [assistant-ui Vercel AI SDK Docs](https://www.assistant-ui.com/docs/runtimes/ai-sdk/use-chat)
- [OpenRouter AI SDK Provider](https://github.com/OpenRouterTeam/ai-sdk-provider)
- [Supabase AI & Vectors Docs](https://supabase.com/docs/guides/ai)
- [Supabase pgvector Extension](https://supabase.com/docs/guides/database/extensions/pgvector)

### MEDIUM Confidence (Multiple Sources Agree)
- [RAG Stack Recommendations 2025](https://medium.com/devmap/the-rag-stack-id-use-if-i-were-starting-from-zero-in-2025-and-why-c4b1d67ad859)
- [LangChain vs Raw Implementation](https://www.droptica.com/blog/langchain-vs-langgraph-vs-raw-openai-how-choose-your-rag-stack/)
- [Embedding Model Benchmarks](https://supermemory.ai/blog/best-open-source-embedding-models-benchmarked-and-ranked/)
- [Best Embedding Models 2026](https://elephas.app/blog/best-embedding-models)

### LOW Confidence (Single Source, Verify Before Use)
- Specific version numbers should be verified at implementation time
- Bundle size claims for assistant-ui not independently verified
