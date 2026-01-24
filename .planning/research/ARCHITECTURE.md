# Architecture Patterns: RAG Chatbot System

**Domain:** Self-hosted RAG chatbot for Quilibrium protocol documentation
**Researched:** 2026-01-24
**Confidence:** HIGH (verified with official documentation)

## Executive Summary

RAG chatbot systems follow a well-established architectural pattern with two distinct pipelines: an **offline ingestion pipeline** (document processing, chunking, embedding, storage) and an **online query pipeline** (user query, retrieval, augmentation, generation, response streaming). The key architectural insight is that these pipelines share a common embedding model but operate at completely different times and with different performance constraints.

For the Quilibrium documentation chatbot with Vercel Edge Runtime constraints, the architecture must account for:
- Pre-computed embeddings at build/ingestion time (not runtime)
- Edge Runtime limitations (no filesystem, limited Node.js APIs)
- Streaming responses via Vercel AI SDK
- User-provided API keys requiring secure handling

---

## Recommended Architecture

```
+------------------+     +-------------------+     +------------------+
|   INGESTION      |     |     STORAGE       |     |   QUERY FLOW     |
|   PIPELINE       |     |                   |     |   (Runtime)      |
|   (Offline/CLI)  |     |                   |     |                  |
+------------------+     +-------------------+     +------------------+
        |                         |                        |
        v                         v                        v
+------------------+     +-------------------+     +------------------+
| 1. Document      |     | Supabase          |     | 1. User Query    |
|    Loader        |     | PostgreSQL        |     |    (Browser)     |
| (Markdown files) |     |                   |     +--------+---------+
+--------+---------+     | - documents table |              |
         |               | - chunks table    |              v
         v               | - embeddings      |     +------------------+
+------------------+     |   (pgvector)      |     | 2. API Route     |
| 2. Chunker       |     | - metadata        |     |    (Edge/Node)   |
| (500-1000 tokens |     +-------------------+     +--------+---------+
|  100 overlap)    |              ^                        |
+--------+---------+              |                        v
         |                        |               +------------------+
         v                        |               | 3. Query         |
+------------------+              |               |    Embedding     |
| 3. Embedder      |              |               | (runtime API or  |
| (all-MiniLM-L6-v2|              |               |  pre-computed)   |
|  Transformers.js)|              |               +--------+---------+
+--------+---------+              |                        |
         |                        |                        v
         v                        |               +------------------+
+------------------+              |               | 4. Vector Search |
| 4. Storage       +--------------+               |    (pgvector)    |
|    Writer        |                              +--------+---------+
| (Supabase client)|                                       |
+------------------+                                       v
                                                  +------------------+
                                                  | 5. Reranker      |
                                                  |    (optional)    |
                                                  +--------+---------+
                                                           |
                                                           v
                                                  +------------------+
                                                  | 6. Context       |
                                                  |    Assembly      |
                                                  +--------+---------+
                                                           |
                                                           v
                                                  +------------------+
                                                  | 7. LLM Call      |
                                                  |    (OpenRouter)  |
                                                  +--------+---------+
                                                           |
                                                           v
                                                  +------------------+
                                                  | 8. Stream        |
                                                  |    Response      |
                                                  | (Vercel AI SDK)  |
                                                  +------------------+
```

---

## Component Boundaries

| Component | Responsibility | Communicates With | Runtime |
|-----------|---------------|-------------------|---------|
| **Document Loader** | Read markdown files from filesystem | Chunker | CLI/Build |
| **Chunker** | Split documents into semantic chunks with overlap | Embedder | CLI/Build |
| **Embedder** | Generate 384-dim vectors using all-MiniLM-L6-v2 | Storage Writer | CLI/Build |
| **Storage Writer** | Insert chunks + embeddings into Supabase | Supabase | CLI/Build |
| **Chat UI** | User interaction, message history | API Route | Browser |
| **API Route** | Orchestrate RAG pipeline, handle streaming | All query components | Edge/Node |
| **Query Embedder** | Embed user query at runtime | Vector Search | Edge/Node |
| **Vector Search** | Retrieve top-k similar chunks | Supabase pgvector | Edge/Node |
| **Reranker** | Re-score retrieved chunks for relevance | Context Assembly | Edge/Node (optional) |
| **Context Assembly** | Format retrieved chunks as LLM context | LLM Call | Edge/Node |
| **LLM Provider** | Generate response via OpenRouter | Stream Response | External API |
| **Stream Handler** | Stream tokens to browser via SSE | Chat UI | Edge/Node |

---

## Data Flow

### Ingestion Pipeline (Offline)

```
Markdown Files (50-100 docs + 20 transcripts)
    |
    v
[1] Load & Parse Markdown
    - Preserve heading structure
    - Extract front matter as metadata
    - Maintain source file reference
    |
    v
[2] Chunking Strategy
    - Target: 500-1000 tokens per chunk
    - Overlap: 100 tokens (10-15%)
    - Split on: Heading boundaries first, then paragraphs
    - Preserve: Section context in chunk metadata
    |
    v
[3] Embedding Generation
    - Model: all-MiniLM-L6-v2 via Transformers.js
    - Output: 384-dimensional vectors
    - Batch processing for efficiency
    - Run locally (no API calls needed)
    |
    v
[4] Storage
    - Insert into Supabase PostgreSQL
    - Store: chunk text, embedding vector, metadata
    - Metadata: source_file, heading_path, chunk_index
```

### Query Pipeline (Online)

```
User Query (from browser)
    |
    v
[1] API Route Handler (/api/chat)
    - Validate request
    - Extract user API key from header/session
    - Initialize Supabase client
    |
    v
[2] Query Embedding
    OPTION A (Recommended for your constraints):
    - Use OpenRouter embedding endpoint (user's API key)
    - Or use Supabase Edge Function with local model

    OPTION B (If avoiding runtime embedding):
    - Pre-compute common query embeddings
    - Use hybrid keyword + semantic search
    |
    v
[3] Vector Similarity Search
    - Query: SELECT * FROM chunks
             ORDER BY embedding <=> query_embedding
             LIMIT 10
    - Uses pgvector's cosine distance operator
    - Returns top-k candidates (10-20)
    |
    v
[4] Reranking (Optional but Recommended)
    - Cross-encoder reranking via API (Cohere, Jina)
    - Or: Simple relevance scoring with LLM
    - Reduces 10-20 candidates to 5 best
    - Adds 200-500ms latency but +20-35% accuracy
    |
    v
[5] Context Assembly
    - Format: System prompt + retrieved chunks + user query
    - Include source citations for each chunk
    - Respect LLM context window limits
    |
    v
[6] LLM Generation (OpenRouter)
    - User provides their own API key
    - Stream response via SSE
    - Model selection by user preference
    |
    v
[7] Response Streaming (Vercel AI SDK)
    - streamText() on backend
    - useChat() on frontend
    - Real-time token delivery
```

---

## Patterns to Follow

### Pattern 1: Separation of Ingestion and Query Pipelines

**What:** Keep the ingestion pipeline completely separate from the runtime query pipeline. Ingestion runs as a CLI script or build step; queries run on Edge/serverless.

**Why:**
- Ingestion requires filesystem access (reading markdown files)
- Ingestion requires heavy compute (embedding generation)
- Edge Runtime cannot do either of these
- Clear separation enables independent scaling and testing

**Implementation:**
```typescript
// scripts/ingest.ts (runs locally or in CI)
import { pipeline } from "@huggingface/transformers";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const embedder = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2"
);

async function ingestDocument(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  const chunks = splitIntoChunks(content, {
    targetSize: 750,
    overlap: 100
  });

  for (const chunk of chunks) {
    const embedding = await embedder(chunk.text, {
      pooling: "mean",
      normalize: true
    });

    await supabase.from("chunks").insert({
      content: chunk.text,
      embedding: Array.from(embedding.data),
      metadata: {
        source: filePath,
        heading: chunk.heading,
        index: chunk.index
      }
    });
  }
}
```

### Pattern 2: Streaming-First API Design

**What:** Design the API route to stream responses from the start, not as an afterthought.

**Why:**
- LLM responses can take 5-30 seconds
- Streaming provides immediate feedback
- Vercel Edge has 25s initial response requirement
- Better UX with progressive rendering

**Implementation:**
```typescript
// app/api/chat/route.ts
import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const runtime = "edge";

export async function POST(request: Request) {
  const { messages, apiKey } = await request.json();

  // 1. Get query embedding (fast - ~50ms)
  const queryEmbedding = await getQueryEmbedding(
    messages[messages.length - 1].content
  );

  // 2. Retrieve relevant chunks (fast - ~100ms)
  const relevantChunks = await searchChunks(queryEmbedding, 5);

  // 3. Build context
  const context = formatContext(relevantChunks);

  // 4. Stream LLM response
  const openrouter = createOpenRouter({ apiKey });

  const result = streamText({
    model: openrouter("anthropic/claude-3-haiku"),
    system: buildSystemPrompt(context),
    messages,
  });

  return result.toDataStreamResponse();
}
```

### Pattern 3: Metadata-Rich Chunks

**What:** Store rich metadata with each chunk to enable filtering, citation, and context reconstruction.

**Why:**
- Enables source attribution in responses
- Allows filtering by document type (docs vs transcripts)
- Supports hierarchical context (section > subsection > paragraph)
- Enables debugging and quality analysis

**Implementation:**
```typescript
// Chunk schema
interface Chunk {
  id: string;
  content: string;
  embedding: number[]; // 384 dimensions
  metadata: {
    source_file: string;      // "docs/consensus.md"
    source_type: "doc" | "transcript";
    title: string;            // Document title from frontmatter
    heading_path: string[];   // ["Consensus", "Proof of Work"]
    chunk_index: number;      // Position in document
    token_count: number;      // For context window budgeting
    url?: string;             // Link to original if available
  };
  created_at: string;
}
```

### Pattern 4: User-Owned API Keys

**What:** Users provide their own OpenRouter API key; never store or proxy through your backend.

**Why:**
- No billing management for you
- No rate limiting headaches
- Users control their own costs
- Simpler compliance (you don't touch their data)

**Implementation:**
```typescript
// Frontend: Store key in localStorage, send in header
const response = await fetch("/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-OpenRouter-Key": localStorage.getItem("openrouter_key"),
  },
  body: JSON.stringify({ messages }),
});

// Backend: Use key from request
export async function POST(request: Request) {
  const apiKey = request.headers.get("X-OpenRouter-Key");
  if (!apiKey) {
    return new Response("API key required", { status: 401 });
  }
  // Use key directly with OpenRouter
}
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Runtime Embedding in Edge Runtime

**What:** Trying to run Transformers.js or other embedding models inside Edge Runtime.

**Why bad:**
- Edge Runtime has 1-4MB code size limit (compressed)
- Transformers.js models are 20-100MB
- No filesystem access to load model weights
- CPU-bound operations hit Edge timeout limits

**Instead:**
- Pre-compute document embeddings at build time
- For query embeddings, use an external API (OpenRouter, OpenAI, Cohere)
- Or use a Supabase Edge Function (which has Node.js runtime)

### Anti-Pattern 2: Fetching All Chunks Then Filtering

**What:** Retrieving all chunks from the database and filtering in application code.

**Why bad:**
- Transfers huge amounts of data (100+ chunks x embedding size)
- Application memory pressure
- Slow response times
- Wastes database and network resources

**Instead:**
```sql
-- Let PostgreSQL + pgvector handle the similarity search
SELECT id, content, metadata,
       1 - (embedding <=> $1) as similarity
FROM chunks
ORDER BY embedding <=> $1  -- Cosine distance
LIMIT 10;
```

### Anti-Pattern 3: Monolithic API Route

**What:** Putting all logic (embedding, search, reranking, generation) in a single 500-line API route.

**Why bad:**
- Hard to test individual components
- Can't swap implementations
- Debugging nightmares
- Violates single responsibility

**Instead:** Compose small, focused functions:
```typescript
// lib/rag/embed.ts
export async function embedQuery(text: string): Promise<number[]>

// lib/rag/search.ts
export async function searchChunks(embedding: number[], k: number): Promise<Chunk[]>

// lib/rag/rerank.ts
export async function rerankChunks(query: string, chunks: Chunk[]): Promise<Chunk[]>

// lib/rag/context.ts
export async function buildContext(chunks: Chunk[]): Promise<string>

// app/api/chat/route.ts - orchestration only
```

### Anti-Pattern 4: Ignoring Token Limits

**What:** Stuffing all retrieved chunks into context without counting tokens.

**Why bad:**
- Exceeds LLM context window (causes errors)
- Wastes money on unused tokens
- Later chunks get less attention (recency bias)
- Unpredictable failures

**Instead:**
```typescript
function buildContext(chunks: Chunk[], maxTokens: number): string {
  let tokenCount = 0;
  const includedChunks: Chunk[] = [];

  for (const chunk of chunks) {
    if (tokenCount + chunk.metadata.token_count > maxTokens) break;
    includedChunks.push(chunk);
    tokenCount += chunk.metadata.token_count;
  }

  return formatChunksAsContext(includedChunks);
}
```

---

## Vercel Edge Runtime Considerations

### What Works on Edge

| Capability | Status | Notes |
|------------|--------|-------|
| fetch() to external APIs | YES | OpenRouter, Supabase |
| Streaming responses | YES | Core feature for AI apps |
| JSON parsing/serialization | YES | Standard |
| Supabase JS client | YES | Use @supabase/supabase-js |
| Vercel AI SDK | YES | Designed for Edge |
| Environment variables | YES | For Supabase keys |

### What Does NOT Work on Edge

| Capability | Status | Alternative |
|------------|--------|-------------|
| Filesystem access | NO | Pre-compute at build time |
| Transformers.js (large models) | NO | Use API for query embedding |
| Heavy computation | NO | Offload to external service |
| node_modules with native deps | NO | Use Edge-compatible packages |
| Long synchronous operations | NO | Stream or use background tasks |

### Recommended Runtime Strategy

```typescript
// app/api/chat/route.ts
export const runtime = "edge";  // Fast cold starts, global distribution

// Alternative for heavy operations:
export const runtime = "nodejs"; // Full Node.js, single region
```

**Recommendation:** Use Edge Runtime for the chat API route. It's sufficient for:
- Calling Supabase (fetch-based)
- Calling OpenRouter (fetch-based)
- Streaming responses (native support)
- Light orchestration logic

The heavy work (embedding generation) happens at build/ingestion time, not runtime.

---

## Suggested Build Order

Based on component dependencies, build in this order:

### Phase 1: Foundation (Data Layer)
**Build first - everything depends on this**

1. **Supabase Schema Setup**
   - Create `documents` table (source files)
   - Create `chunks` table with pgvector column
   - Enable pgvector extension
   - Create similarity search function

2. **Ingestion Pipeline (CLI)**
   - Markdown loader
   - Chunking logic
   - Embedding generation (local Transformers.js)
   - Supabase insertion

**Why first:** Can't test retrieval without data. Can't test generation without retrieval.

### Phase 2: Query Pipeline (Core RAG)
**Build second - the critical path**

3. **Vector Search Function**
   - Query embedding (via API for runtime)
   - Supabase similarity search
   - Result formatting

4. **Context Assembly**
   - Prompt templates
   - Token counting
   - Source citation formatting

5. **LLM Integration**
   - OpenRouter provider setup
   - Streaming response handling
   - Error handling

**Why second:** This is the core RAG loop. Test it thoroughly before adding UI.

### Phase 3: User Interface
**Build third - user-facing layer**

6. **Chat UI**
   - Message history
   - Input handling
   - Streaming display (useChat hook)

7. **API Key Management**
   - Key input UI
   - Secure storage (localStorage)
   - Validation

**Why third:** UI can only be properly tested with working backend.

### Phase 4: Enhancements
**Build last - polish and optimization**

8. **Reranking** (Optional)
   - Cross-encoder integration
   - Improves accuracy 20-35%

9. **Hybrid Search** (Optional)
   - Add keyword search alongside semantic
   - Better for exact matches

10. **Analytics & Feedback** (Optional)
    - Query logging
    - User feedback collection

---

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **Vector Search** | pgvector IVFFlat index | pgvector HNSW index | Consider dedicated vector DB |
| **Embedding Storage** | Single Supabase instance | Same (pgvector handles millions) | Shard by document category |
| **Query Latency** | ~200ms total | ~300ms (add caching) | ~500ms (add CDN, edge caching) |
| **LLM Costs** | User pays (OpenRouter) | User pays | User pays |
| **Ingestion** | Manual CLI runs | Automated CI/CD | Background workers |

---

## Sources

### Official Documentation (HIGH confidence)
- [Supabase AI & Vectors](https://supabase.com/docs/guides/ai) - Vector storage patterns
- [Vercel Edge Runtime](https://vercel.com/docs/functions/runtimes/edge) - Runtime constraints
- [Vercel AI SDK](https://ai-sdk.dev/docs/introduction) - streamText/useChat architecture
- [OpenRouter API](https://openrouter.ai/docs/api/reference/streaming) - Streaming integration

### Technical References (MEDIUM confidence)
- [NVIDIA RAG 101](https://developer.nvidia.com/blog/rag-101-demystifying-retrieval-augmented-generation-pipelines/) - Pipeline architecture
- [Weaviate Chunking Strategies](https://weaviate.io/blog/chunking-strategies-for-rag) - Chunking best practices
- [Pinecone Rerankers Guide](https://www.pinecone.io/learn/series/rag/rerankers/) - Two-stage retrieval
- [Transformers.js Documentation](https://huggingface.co/Xenova/all-MiniLM-L6-v2) - Local embedding generation

### Community Patterns (MEDIUM confidence)
- [Vercel AI SDK RAG Template](https://vercel.com/templates/next.js/ai-sdk-rag) - Reference implementation
- [Upstash RAG Tutorial](https://upstash.com/blog/degree-guru) - Next.js + AI SDK pattern
