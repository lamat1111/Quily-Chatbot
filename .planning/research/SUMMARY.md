# Project Research Summary

**Project:** Quilibrium Documentation RAG Chatbot
**Domain:** Self-hosted RAG documentation assistant with user-provided API keys
**Researched:** 2026-01-24
**Confidence:** HIGH

## Executive Summary

This project is a RAG-powered documentation chatbot targeting Quilibrium protocol documentation (50-100 markdown files + 20 transcripts) with zero operational cost through user-provided OpenRouter API keys. Based on comprehensive research, the recommended approach is to build with **Vercel AI SDK (raw implementation)** rather than heavyweight frameworks like LangChain, using **assistant-ui** for the chat interface, **pgvector on Supabase** for vector storage, and **text-embedding-3-small** for embeddings. This "simple stack" approach is validated by 2025-2026 ecosystem consensus: for straightforward RAG use cases, raw implementation beats framework overhead.

The architecture follows a clear separation of concerns: an **offline ingestion pipeline** (document chunking, embedding generation, storage) runs at build/CLI time, while the **online query pipeline** (vector search, context assembly, LLM generation, streaming) runs on Vercel Edge/Node.js runtime. This separation is critical because Edge Runtime cannot handle filesystem access or heavy compute required for ingestion. The key insight is that both pipelines share the same embedding model but operate at completely different times with different constraints.

Critical risks center on **chunking strategy** (naive fixed-size chunking destroys semantic context), **hallucination despite RAG** (LLM ignoring retrieved context without proper prompt engineering), and **Vercel Edge Runtime limitations** (functions dying mid-stream if not configured correctly). Prevention requires semantic chunking with 500-1000 token chunks and 100-token overlap, strict grounding instructions in prompts requiring inline citations, and using Node.js runtime (not Edge) for routes that write to databases. Get these right from the start to avoid rewrites.

## Key Findings

### Recommended Stack

**Core principle: Simplicity over abstraction.** The 2025-2026 consensus is clear: for basic RAG applications, Vercel AI SDK provides exactly what's needed without LangChain's 50+ dependency overhead. The stack prioritizes integration quality (assistant-ui + Vercel AI SDK is best-documented), cost efficiency (pgvector on Supabase free tier works for <100k vectors), and modern embedding options (text-embedding-3-small vastly outperforms outdated models like all-MiniLM-L6-v2).

**Core technologies:**
- **assistant-ui (^0.7.x)** — Production-ready chat UI with first-class Vercel AI SDK integration, streaming support, source citation rendering, and 8.2k GitHub stars with active maintenance
- **Vercel AI SDK (^6.0.x)** — LLM orchestration with `streamText()` for backend and `useChat()` for frontend; handles streaming, message state, and abort/retry without framework complexity
- **@openrouter/ai-sdk-provider (^1.5.x)** — Official OpenRouter integration enabling 300+ models via single API with user-provided keys (zero cost to you)
- **Supabase with pgvector (0.8.x)** — Vector database proven for <1M vectors with <100ms query latency; free tier sufficient for documentation scale with built-in Row Level Security for future multi-tenancy
- **text-embedding-3-small** — 1536-dimensional embeddings at $0.02/1M tokens; vastly superior to outdated all-MiniLM-L6-v2 (2019 model with only 56% Top-5 accuracy vs 86%+)

**Critical version requirements:**
- AI SDK 6.0+ for agent abstraction, reranking support, and LangChain adapter if needed later
- assistant-ui 0.7+ for `useChatRuntime` hook with Vercel AI SDK integration
- Next.js 14.2+ for stable Edge Runtime support

**Why NOT to use:**
- **LangChain (for v1)** — Overkill for simple RAG; 50+ dependencies; ~10ms overhead vs ~3-6ms for raw implementation; adds complexity creep
- **all-MiniLM-L6-v2** — Outdated 2019 model; only 384 dimensions; 512 token limit; 56% accuracy vs 86%+ for modern models
- **chatbot-ui-lite** — Minimal starter (~21 commits); no streaming infrastructure; unmaintained; would require significant work for production features

### Expected Features

**Table stakes (users expect these):**
- **Natural language query input** — Plain language questions in standard text field
- **Accurate, grounded responses** — RAG retrieval quality is critical; hallucinations destroy trust
- **Source citations with links** — Users must be able to verify answers; builds trust and credibility
- **Streaming responses** — ChatGPT set the standard; users expect token-by-token delivery; waiting feels broken
- **Markdown + code syntax highlighting** — Developer audience expects readable code blocks with proper formatting
- **Mobile-responsive design** — Non-negotiable; many users browse documentation on mobile devices
- **Error handling with clear messages** — Graceful degradation for rate limits, network errors, API failures
- **Model selection dropdown** — Users with their own API keys want to choose cost vs capability

**Competitive differentiators (valued when present):**
- **Thumbs up/down feedback** — Simple UI, valuable for quality improvement iteration; low effort, high value
- **Copy to clipboard** — Developer convenience for code snippets; trivially easy to add
- **Suggested follow-up questions** — Reduces friction, helps discovery; can be AI-generated or curated
- **Multi-turn conversation context** — Maintains thread coherence but requires session management complexity
- **Dark mode** — Developer preference; CSS theming work but can add any time
- **Stop generation button** — User control during streaming; enables canceling long-running responses

**Anti-features (explicitly defer to v2+):**
- **User accounts/authentication** — Adds complexity; user-provided API keys already personalize experience
- **Admin panel for embeddings** — Significant backend complexity; ship with pre-built index, add admin only if update frequency demands it
- **Agentic workflows** — Executing actions requires trust and security review; pure Q&A sufficient for v1
- **Real-time doc sync** — Periodic re-indexing (manual or cron) sufficient for v1; avoid complexity of watching external sources
- **Multi-language translation** — Requires extensive testing per language; focus English docs first

### Architecture Approach

RAG chatbots follow a well-established two-pipeline pattern: **offline ingestion** (document processing, chunking, embedding, storage) and **online query** (user query, retrieval, augmentation, generation, streaming). The pipelines share a common embedding model but operate at completely different times with different performance constraints. For Vercel Edge Runtime, the architecture must handle Edge limitations (no filesystem, limited Node.js APIs) by pre-computing embeddings at build/ingestion time.

**Major components:**

1. **Ingestion Pipeline (CLI/Build time)** — Document loader reads markdown files, chunker splits into 500-1000 token chunks with 100-token overlap respecting semantic boundaries, embedder generates vectors locally via Transformers.js, storage writer inserts chunks + embeddings + metadata into Supabase

2. **Query Pipeline (Runtime - Edge/Node.js)** — API route validates request and extracts user API key, query embedder creates vector via OpenRouter API, vector search uses pgvector cosine similarity to retrieve top-k candidates, optional reranker reduces 10-20 candidates to top 5 (+20-35% accuracy), context assembly formats chunks as LLM context with citations

3. **Streaming Handler (Vercel AI SDK)** — Backend uses `streamText()` to generate token-by-token response, frontend uses `useChat()` hook for real-time delivery, includes abort/retry handling and message state management

4. **Chat UI (assistant-ui)** — Browser-based interface with message history, streaming display with auto-scroll, markdown rendering with code highlighting, source citation display with clickable links

**Key patterns to follow:**
- **Separation of ingestion and query** — Ingestion runs as CLI script with filesystem access; query runs on Edge without filesystem; enables independent scaling and testing
- **Streaming-first API design** — Design for streaming from start, not afterthought; LLM responses take 5-30s; streaming provides immediate feedback
- **Metadata-rich chunks** — Store source_file, heading_path, chunk_index, token_count with each chunk for filtering, citation, context reconstruction, and debugging
- **User-owned API keys** — Users provide OpenRouter key; never store or proxy; no billing management, no rate limiting headaches, simpler compliance

### Critical Pitfalls

1. **Naive chunking destroys context** — Fixed character/token counts without semantic boundaries cut sentences mid-thought, split code examples, separate headers from content; embedding vectors lose specificity; retrieved chunks contain half-sentences; LLM generates incorrect answers. **Prevention:** Use recursive chunking respecting paragraph boundaries; 400-800 token chunks with 10-20% overlap; preserve code blocks whole; chunk markdown by section (##) first then subdivide if needed. **Phase 1 (Ingestion Pipeline).**

2. **LLM ignores retrieved context (hallucination despite RAG)** — Without proper prompt engineering, model generates from training data instead of using retrieved chunks; users receive confident but wrong answers; trust erodes when manually verified. **Prevention:** Explicit grounding instructions ("Answer ONLY using provided context; if context doesn't contain answer, say so"); place retrieved context prominently; require inline citations; implement answer gating (refuse if similarity scores below threshold). **Phase 2-3 (Prompt Engineering).**

3. **Wrong K value and missing reranking** — Retrieving too few chunks (k=2-3) misses relevant info; too many (k=10+) floods context with noise; without reranking, initial retrieval order based solely on embedding similarity misses factually correct but semantically different chunks. **Prevention:** Start with k=5-7 for initial retrieval, rerank to top 3-4; implement two-stage retrieval (broad k=10-20 then cross-encoder reranking); use hybrid search (vector + keyword); set similarity score thresholds (don't include below 0.7). **Phase 2 (Retrieval Logic).**

4. **Vercel Edge function dies mid-stream** — Edge Runtime has strict limits (4MB bundle, no Node.js APIs, 1MB request); `onFinish` callbacks are fire-and-forget; async operations aren't awaited; Hobby plan 60s timeout can be exceeded; conversations cut off mid-response with no error. **Prevention:** Use Node.js runtime for routes needing database writes; don't rely on `onFinish` for critical operations; explicitly set `export const runtime = 'nodejs'`; implement error boundaries and timeout handling. **Phase 1 (Infrastructure).**

5. **Client-side API key exposure** — User-provided OpenRouter keys get logged, transmitted insecurely, or exposed through browser dev tools; keys leak through error messages or network requests. **Prevention:** Never log API keys server-side (even in error handlers); transmit only over HTTPS; store in localStorage (not cookies); show clear warnings; consider OAuth PKCE flow with OpenRouter; implement key validation endpoint that doesn't expose key. **Phase 1 (Security Architecture).**

6. **Unusable or missing citations** — Citations absent (no trust), wrong (cite sources not supporting claim), or unusable (dead links); LLM hallucinates citation numbers not matching retrieved chunks. **Prevention:** Store source URL/path with each chunk in metadata; include chunk ID in retrieval to map to citation; have LLM cite specific retrieved chunks, not generate citations; use tool-calling for deterministic citations. **Phase 2-3 (Response Formatting).**

## Implications for Roadmap

Based on research, suggested phase structure prioritizes **foundation before features** and **data layer before UI**. The architecture demands building ingestion pipeline first (can't test retrieval without data), then query pipeline (core RAG loop), then user interface (requires working backend), then enhancements (polish and optimization).

### Phase 1: Foundation & Data Pipeline
**Rationale:** Everything depends on having quality data properly ingested. Cannot test retrieval without embeddings. Cannot test generation without retrieval. The ingestion pipeline's chunking strategy is the most critical architectural decision that impacts all downstream quality.

**Delivers:**
- Supabase schema with pgvector extension, documents and chunks tables, HNSW index for <1M vector performance
- CLI ingestion script: markdown loader, semantic chunker (500-1000 tokens, 100 overlap, respect boundaries), local embedding via Transformers.js, metadata-rich storage
- Initial corpus embedded and searchable (50-100 docs + 20 transcripts)

**Addresses (from FEATURES.md):**
- Foundation for "Accurate, grounded responses" (table stakes)
- Enables "Source citations with links" (table stakes)

**Avoids (from PITFALLS.md):**
- **Pitfall 1:** Naive chunking — implement semantic chunking from start
- **Pitfall 8:** Embedding drift — version configuration, standardize preprocessing
- **Pitfall 11:** pgvector misconfiguration — configure HNSW correctly for corpus size

**Research needed:** No — chunking and embedding patterns are well-documented in research sources.

---

### Phase 2: Query Pipeline & RAG Core
**Rationale:** The critical path is the RAG loop: query embedding, vector search, context assembly, LLM generation. Test this thoroughly as standalone API before adding UI complexity. Streaming must be built from day one (not added later) because it's core to UX expectations.

**Delivers:**
- API route (`/api/chat`) with streaming support via Vercel AI SDK
- Query embedding via OpenRouter API (runtime, user's key)
- Vector similarity search with pgvector cosine distance
- Context assembly with token counting and prompt templates
- OpenRouter LLM integration with `streamText()`
- Two-stage retrieval: initial k=10-20, reranking to top 5
- Hybrid search (semantic + keyword) for technical term matching

**Uses (from STACK.md):**
- Vercel AI SDK ^6.0.x for `streamText()` backend orchestration
- @openrouter/ai-sdk-provider for multi-model access
- Supabase JS client for vector search queries
- text-embedding-3-small for query embedding (via OpenRouter)

**Implements (from ARCHITECTURE.md):**
- Query Pipeline components: query embedder, vector search, reranker, context assembly, LLM provider, stream handler
- Streaming-first API design pattern
- User-owned API keys pattern (BYOK)

**Avoids (from PITFALLS.md):**
- **Pitfall 2:** Wrong K value — implement two-stage retrieval with reranking
- **Pitfall 3:** Hallucination — strict grounding instructions, require citations
- **Pitfall 4:** Edge function death — use Node.js runtime for this route
- **Pitfall 9:** No streaming — build streaming from day one

**Research needed:** Possibly for reranking integration (Cohere/Jina APIs) if not using simple LLM-based reranking.

---

### Phase 3: Chat Interface & User Experience
**Rationale:** UI can only be properly tested with working backend. assistant-ui provides production-ready components for streaming, markdown, citations. Focus on core chat experience before adding enhancements.

**Delivers:**
- Chat UI with assistant-ui components (Thread, Message, Input primitives)
- API key management: input UI, localStorage storage, validation
- Message history with streaming display (`useChat` hook)
- Markdown rendering with code syntax highlighting (Prism/Shiki)
- Source citation display with clickable links to documentation
- Mobile-responsive design with Tailwind CSS
- Error handling with user-friendly messages
- Loading/typing indicators during generation

**Uses (from STACK.md):**
- assistant-ui ^0.7.x with `@assistant-ui/react-ai-sdk` integration
- Vercel AI SDK `useChat()` hook for frontend streaming
- Next.js 14.x+ for app framework
- Tailwind CSS for responsive styling

**Addresses (from FEATURES.md):**
- Natural language query input (table stakes)
- Streaming responses (table stakes)
- Markdown + code highlighting (table stakes)
- Mobile-responsive design (table stakes)
- Error handling (table stakes)
- Model selection dropdown (table stakes)
- Source citations with links (table stakes)

**Avoids (from PITFALLS.md):**
- **Pitfall 6:** API key exposure — HTTPS only, localStorage, clear warnings
- **Pitfall 10:** Unusable citations — tool-based citations, verify links
- **Pitfall 13:** Code formatting — ensure proper markdown rendering
- **Pitfall 15:** Error exposure — catch all errors, user-friendly messages

**Research needed:** No — assistant-ui integration is well-documented with examples.

---

### Phase 4: Quality & Trust Features
**Rationale:** After core chat works, add features that improve answer quality and build user trust. These are differentiators that increase engagement and enable iteration based on feedback.

**Delivers:**
- Thumbs up/down feedback mechanism with analytics logging
- Copy to clipboard for code blocks and responses
- Suggested follow-up questions (AI-generated based on context)
- Stop generation button for long-running responses
- Conversation context management (multi-turn awareness)
- "I don't know" graceful handling with similarity thresholds
- Dark mode CSS theming

**Addresses (from FEATURES.md):**
- Thumbs up/down feedback (differentiator)
- Copy to clipboard (differentiator)
- Suggested follow-up questions (differentiator)
- Stop generation button (differentiator)
- Multi-turn conversation context (differentiator)
- Dark mode (differentiator)

**Avoids (from PITFALLS.md):**
- **Pitfall 12:** No graceful "I don't know" — similarity thresholds, explicit refusal
- **Pitfall 14:** Missing conversation context — include last N messages in prompt

**Research needed:** No — these are standard patterns with existing implementations.

---

### Phase 5: Security Hardening (Post-MVP)
**Rationale:** For self-hosted with controlled documentation corpus, security risks are lower initially. However, before scaling or adding user-submitted content, implement security measures.

**Delivers:**
- Sanitization of retrieved content to prevent prompt injection
- Output validation before showing responses to users
- Content guardrails detecting injection patterns
- Audit process for new document sources (especially transcriptions)
- OAuth PKCE flow option as alternative to raw API key input
- Rate limiting and abuse prevention

**Avoids (from PITFALLS.md):**
- **Pitfall 5:** Prompt injection — sanitize retrieved content, clear delimiters, output validation

**Research needed:** Possibly for OAuth PKCE implementation details with OpenRouter.

---

### Phase Ordering Rationale

**Why this order:**
1. **Data first** — Cannot build retrieval without embedded corpus; chunking strategy impacts all downstream quality
2. **Backend before frontend** — RAG pipeline must work standalone before adding UI; enables isolated testing and validation
3. **Streaming from day one** — Not an enhancement; core UX expectation; adding later requires architectural changes
4. **Quality after functionality** — Feedback and enhancements require working chat to gather user input
5. **Security iteratively** — Controlled corpus reduces initial risk; harden before scaling or adding dynamic content

**Dependency flow:**
- Phase 1 output (embedded corpus) required for Phase 2 (retrieval)
- Phase 2 output (working API) required for Phase 3 (UI integration)
- Phase 3 output (user-facing chat) required for Phase 4 (feedback collection)
- Phases 1-3 complete before Phase 5 (can't secure what doesn't exist)

**Pitfall avoidance:**
- Building ingestion (Phase 1) correctly avoids chunking pitfalls that would require re-embedding entire corpus
- Building streaming (Phase 2) from start avoids Edge function death and UX rewrites
- Separating security (Phase 5) allows focus on core functionality but doesn't defer critical issues (API key handling in Phase 3)

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 2 (Reranking integration):** If using Cohere or Jina APIs for cross-encoder reranking, may need `/gsd:research-phase` for API specifics and pricing
- **Phase 5 (OAuth PKCE flow):** If implementing OAuth alternative to raw keys, needs OpenRouter OAuth documentation research

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Ingestion):** Chunking and embedding patterns thoroughly documented in research sources
- **Phase 3 (Chat UI):** assistant-ui + Vercel AI SDK integration has official docs and templates
- **Phase 4 (Quality features):** Standard patterns with existing implementations (feedback buttons, copy-to-clipboard, etc.)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | Official Vercel AI SDK docs, assistant-ui GitHub with 8.2k stars, Supabase pgvector production usage verified, OpenRouter provider package official |
| Features | **HIGH** | Multiple RAG chatbot sources agree on table stakes (citations, streaming, markdown); anti-features validated by community pitfalls |
| Architecture | **HIGH** | Two-pipeline pattern is well-established; Vercel Edge constraints documented; ingestion/query separation validated by official templates |
| Pitfalls | **MEDIUM-HIGH** | Critical pitfalls (chunking, hallucination, Edge death) verified across multiple sources; some lower-priority pitfalls from single sources |

**Overall confidence:** **HIGH**

The core recommendation (Vercel AI SDK raw implementation over LangChain for simple RAG) is validated by 2025-2026 ecosystem consensus. The stack choices (assistant-ui, pgvector, text-embedding-3-small) have official documentation and production usage examples. The architecture pattern (separate ingestion/query pipelines) is standard for Edge deployments. Critical pitfalls are well-documented with clear prevention strategies.

### Gaps to Address

**During Phase 1 implementation:**
- Validate chunking strategy on sample Quilibrium docs — may need adjustment based on actual heading structure and code block patterns
- Test text-embedding-3-small quality on protocol-specific terminology — consider hybrid search if semantic-only fails on technical terms

**During Phase 2 implementation:**
- Determine reranking approach: simple LLM-based vs dedicated API (Cohere/Jina) — benchmark latency vs accuracy tradeoff
- Set optimal k value empirically — start with k=10-20 for retrieval, top 5 after reranking, but adjust based on actual doc corpus

**During Phase 3 implementation:**
- Decide on conversation context strategy: include last N messages vs summarization — depends on typical user session patterns
- Validate citation link format matches Quilibrium docs URL structure — metadata must include correct paths

**Open questions (resolve during planning):**
- Should query embeddings use OpenRouter (consistent with LLM calls) or dedicated embedding API (potentially cheaper/faster)?
- For transcriptions specifically: do they need special preprocessing (speaker labels, timestamps) before chunking?
- What's the acceptable similarity score threshold for "I don't know" responses (0.6? 0.7? empirically determine)?

## Sources

### Primary (HIGH confidence)
- [Vercel AI SDK 6 Announcement](https://vercel.com/blog/ai-sdk-6) — December 2025 release details, agent abstraction, reranking support
- [assistant-ui GitHub](https://github.com/assistant-ui/assistant-ui) — Updated January 2026, 8.2k stars, production usage examples
- [assistant-ui Vercel AI SDK Docs](https://www.assistant-ui.com/docs/runtimes/ai-sdk/use-chat) — Integration patterns with `useChatRuntime`
- [OpenRouter AI SDK Provider](https://github.com/OpenRouterTeam/ai-sdk-provider) — Official provider package, 162+ projects using
- [Supabase AI & Vectors Docs](https://supabase.com/docs/guides/ai) — Vector storage patterns, pgvector extension guide
- [Vercel Edge Runtime Docs](https://vercel.com/docs/functions/runtimes/edge) — Runtime constraints, limitations, best practices
- [OWASP LLM Top 10](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) — Prompt injection as #1 risk for LLM apps

### Secondary (MEDIUM confidence)
- [RAG Stack Recommendations 2025](https://medium.com/devmap/the-rag-stack-id-use-if-i-were-starting-from-zero-in-2025-and-why-c4b1d67ad859) — LangChain vs raw implementation guidance
- [NVIDIA RAG 101](https://developer.nvidia.com/blog/rag-101-demystifying-retrieval-augmented-generation-pipelines/) — Two-pipeline architecture explanation
- [Pinecone: Rerankers Guide](https://www.pinecone.io/learn/series/rag/rerankers/) — Two-stage retrieval with cross-encoders
- [Weaviate: Chunking Strategies](https://weaviate.io/blog/chunking-strategies-for-rag) — Semantic boundary preservation
- [Unstructured: Chunking Best Practices](https://unstructured.io/blog/chunking-for-rag-best-practices) — Context preservation importance
- [Stack Overflow: Chunking in RAG](https://stackoverflow.blog/2024/12/27/breaking-up-is-hard-to-do-chunking-in-rag-applications/) — Chunking pitfalls
- [kapa.ai: RAG Common Mistakes](https://www.kapa.ai/blog/rag-gone-wrong-the-7-most-common-mistakes-and-how-to-avoid-them) — K value, chunking, hallucination issues
- [AWS: RAG Security](https://aws.amazon.com/blogs/security/hardening-the-rag-chatbot-architecture-powered-by-amazon-bedrock-blueprint-for-secure-design-and-anti-pattern-migration/) — Security patterns
- [Promptfoo: RAG Data Poisoning](https://www.promptfoo.dev/blog/rag-poisoning/) — Injection via retrieved documents

### Tertiary (LOW confidence, needs validation)
- [Vercel Community: Edge Functions Dying](https://community.vercel.com/t/vercel-edge-functions-dying-without-hitting-timeout-limits/17879) — Anecdotal reports of Edge function issues
- [DEV Community: Embedding Drift](https://dev.to/dowhatmatters/embedding-drift-the-quiet-killer-of-retrieval-quality-in-rag-systems-4l5m) — Single source on drift issues

---
*Research completed: 2026-01-24*
*Ready for roadmap: yes*
