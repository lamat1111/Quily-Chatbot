# Domain Pitfalls: RAG Chatbot for Documentation

**Domain:** RAG-powered documentation chatbot (Quilibrium protocol)
**Researched:** 2026-01-24
**Overall Confidence:** MEDIUM-HIGH

---

## Critical Pitfalls

Mistakes that cause rewrites, major quality issues, or security incidents.

---

### Pitfall 1: Naive Chunking Destroys Context

**What goes wrong:** Teams default to fixed character/token counts (e.g., split every 500 characters) without considering semantic boundaries. This cuts sentences mid-thought, splits code examples, and separates headers from their content.

**Why it happens:** It's the easiest approach to implement. Most tutorials show simple `split_text()` calls with arbitrary sizes.

**Consequences:**
- Embedding vectors lose specificity (too much in chunk = vague; too little = no context)
- Retrieved chunks contain half-sentences or orphaned code
- LLM generates incorrect answers because context is literally torn apart
- "The semantic meaning is lost... this loss will propagate across your entire database" ([Unstructured](https://unstructured.io/blog/chunking-for-rag-best-practices))

**Prevention:**
1. Start with recursive chunking (respects paragraph/sentence boundaries)
2. Use 400-800 token chunks with 10-20% overlap as baseline
3. Preserve structural elements: keep code blocks whole, don't split tables, maintain header-to-content relationships
4. For markdown docs specifically: chunk by section (##) first, then subdivide if needed

**Detection (warning signs):**
- Retrieved chunks frequently start/end mid-sentence
- Code snippets are syntactically broken
- Users report answers that "don't make sense"
- Hit rate is decent but answer quality is poor

**Phase to address:** Phase 1 (Ingestion Pipeline) - get this right before embedding anything

**Sources:**
- [Stack Overflow: Chunking in RAG](https://stackoverflow.blog/2024/12/27/breaking-up-is-hard-to-do-chunking-in-rag-applications/)
- [Weaviate: Chunking Strategies](https://weaviate.io/blog/chunking-strategies-for-rag)
- [kapa.ai: RAG Common Mistakes](https://www.kapa.ai/blog/rag-gone-wrong-the-7-most-common-mistakes-and-how-to-avoid-them)

---

### Pitfall 2: Wrong K Value and Missing Reranking

**What goes wrong:** Teams either retrieve too few chunks (k=2-3) missing relevant info, or too many (k=10+) flooding context with noise. Without reranking, the initial retrieval order (based solely on embedding similarity) determines what the LLM sees.

**Why it happens:**
- K is often set arbitrarily or copied from tutorials
- Reranking adds latency and complexity, so it's skipped
- Embedding-based retrieval seems "good enough" in simple tests

**Consequences:**
- k too low: Multi-part questions fail; LLM lacks information to answer fully
- k too high: Context window fills with marginally relevant content; LLM gets confused
- No reranking: Semantically similar but factually wrong chunks rank higher than correct ones
- "Small K values omit crucial information and large K values introduce noise" ([Pinecone](https://www.pinecone.io/learn/series/rag/rerankers/))

**Prevention:**
1. Start with k=5-7 for initial retrieval, then rerank to top 3-4
2. Implement two-stage retrieval: broad retrieval (k=10-20) then cross-encoder reranking
3. Use hybrid search (vector + keyword) before reranking for better initial candidates
4. Set similarity score thresholds - don't include chunks below 0.7 similarity even if k allows it

**Detection:**
- Answers miss obvious information that exists in docs
- "I don't know" responses when relevant content exists
- Answers contradict each other across similar questions
- Retrieval latency is fine but answer quality varies wildly

**Phase to address:** Phase 2 (Retrieval Logic) - after basic ingestion works

**Sources:**
- [Pinecone: Rerankers](https://www.pinecone.io/learn/series/rag/rerankers/)
- [Fuzzy Labs: Re-Ranking Techniques](https://www.fuzzylabs.ai/blog-post/improving-rag-performance-re-ranking)
- [Neo4j: Advanced RAG Techniques](https://neo4j.com/blog/genai/advanced-rag-techniques/)

---

### Pitfall 3: LLM Ignores Retrieved Context (Hallucination Despite RAG)

**What goes wrong:** The LLM generates plausible-sounding answers from its training data instead of using the retrieved chunks. RAG is supposed to ground responses, but without proper prompt engineering, the model "knows better" and ignores context.

**Why it happens:**
- System prompt doesn't explicitly constrain to retrieved context
- Retrieved context is placed poorly in the prompt (buried, not emphasized)
- LLM's parametric knowledge is more confident than the noisy retrieved chunks
- Prompt allows freeform answering instead of requiring evidence

**Consequences:**
- Users receive confident but wrong answers
- Answers cite sources but the cited content doesn't support the claim
- Trust in the system erodes when users verify answers manually
- "The risk of hallucinations persists in RAG systems unless a well-crafted prompt instructs the system to exclusively rely on retrieved text" ([PromptHub](https://www.prompthub.us/blog/three-prompt-engineering-methods-to-reduce-hallucinations))

**Prevention:**
1. Use explicit grounding instructions: "Answer ONLY using the provided context. If the context doesn't contain the answer, say 'I don't have information about that in the documentation.'"
2. Place retrieved context prominently (not buried after long instructions)
3. Require inline citations: "For each claim, cite the specific section you're drawing from"
4. Implement answer gating: if similarity scores are all below threshold, refuse to answer rather than guess
5. Add Chain-of-Verification: prompt model to verify its answer against context before responding

**Detection:**
- Answers contain specific claims not found in any retrieved chunk
- Citation links exist but cited text doesn't support the answer
- Model answers confidently about topics not in your documentation
- Answers for niche protocol questions sound generic/Wikipedia-like

**Phase to address:** Phase 2-3 (Prompt Engineering) - iterative refinement needed

**Sources:**
- [SUSE: Preventing AI Hallucinations](https://documentation.suse.com/suse-ai/1.0/html/AI-preventing-hallucinations/index.html)
- [Prompt Engineering Guide: RAG](https://www.promptingguide.ai/research/rag)
- [AWS: Detect Hallucinations for RAG](https://aws.amazon.com/blogs/machine-learning/detect-hallucinations-for-rag-based-systems/)

---

### Pitfall 4: Vercel Edge Function Dies Mid-Stream

**What goes wrong:** Edge functions timeout, die silently, or fail to complete `onFinish` callbacks. Streaming appears to work locally but breaks in production. Database writes in `onFinish` never complete.

**Why it happens:**
- Edge Runtime has strict limits: 4MB bundle size, no native Node.js APIs, 1MB request limit
- `onFinish` callbacks may be "fire-and-forget" - async operations aren't properly awaited
- Hobby plan has 60-second timeout; long LLM responses can exceed this
- Memory billing during streaming keeps instance busy the entire time

**Consequences:**
- Conversations cut off mid-response with no error
- Chat history fails to save, breaking conversation continuity
- Usage tracking/logging never completes
- "As soon as there is an asynchronous call there, the function just dies" ([Vercel Community](https://community.vercel.com/t/vercel-edge-functions-dying-without-hitting-timeout-limits/17879))

**Prevention:**
1. Use Node.js runtime for routes that need database writes, not Edge Runtime
2. Don't rely on `onFinish` for critical operations - consider separate API calls
3. Explicitly set `runtime` in route files: `export const runtime = 'nodejs'`
4. Implement proper error boundaries and timeout handling
5. For Pro plan: set `maxDuration` explicitly (up to 300s)
6. Keep streaming route minimal; offload heavy operations to background jobs

**Detection:**
- Responses work locally but cut off in production
- No errors in Vercel logs despite obvious failures
- Database records missing for conversations that users completed
- Intermittent "partial response" reports from users

**Phase to address:** Phase 1 (Infrastructure) - architecture decision before building chat

**Sources:**
- [Vercel: Edge Runtime Docs](https://vercel.com/docs/functions/runtimes/edge)
- [Vercel Community: Edge Functions Dying](https://community.vercel.com/t/vercel-edge-functions-dying-without-hitting-timeout-limits/17879)
- [AI SDK: Timeout Troubleshooting](https://ai-sdk.dev/docs/troubleshooting/timeout-on-vercel)
- [Upstash: Vercel Edge Explained](https://upstash.com/blog/vercel-edge)

---

### Pitfall 5: Prompt Injection via Retrieved Documents

**What goes wrong:** Malicious instructions embedded in documentation (or user-submitted content) get retrieved and injected into the system prompt, causing the LLM to execute unintended actions.

**Why it happens:**
- RAG systems trust that retrieved content is safe
- No sanitization between retrieval and prompt construction
- System assumes documentation is controlled, but transcriptions or community content may not be
- "Prompt injection is #1 on the OWASP Top 10 for LLMs" ([OWASP](https://genai.owasp.org/llmrisk/llm01-prompt-injection/))

**Consequences:**
- LLM ignores original instructions and follows injected ones
- System leaks information it shouldn't (other users' data, system prompts)
- Model generates harmful or off-topic content
- "Just five carefully crafted documents in a database of millions can successfully manipulate AI responses 90% of the time" ([Promptfoo](https://www.promptfoo.dev/blog/rag-poisoning/))

**Prevention:**
1. Sanitize retrieved content: strip potential instruction patterns before including in prompt
2. Use clear delimiters between system instructions and retrieved context
3. Implement output validation before showing responses to users
4. For user-provided API keys: they're calling their own model, but still filter content
5. Audit document sources: transcriptions need review before embedding
6. Consider content guardrails that detect injection patterns in context

**Detection:**
- Model suddenly responds in different persona or language
- Responses include content clearly not from your documentation
- Users report seeing system prompt contents in responses
- Answer quality degrades after adding new document sources

**Phase to address:** Phase 2-3 (Security hardening) - add after basic flow works

**Sources:**
- [OWASP: Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)
- [Promptfoo: RAG Data Poisoning](https://www.promptfoo.dev/blog/rag-poisoning/)
- [Wiz: Prompt Injection Defense](https://www.wiz.io/academy/ai-security/prompt-injection-attack)
- [IEEE S&P 2026 Paper on Plugin Injection](https://arxiv.org/html/2511.05797v1)

---

### Pitfall 6: Client-Side API Key Exposure

**What goes wrong:** User-provided OpenRouter API keys get logged, transmitted insecurely, or exposed through browser dev tools. Keys leak through error messages, network requests, or improper storage.

**Why it happens:**
- BYOK (Bring Your Own Key) requires client-side key handling
- Keys must be sent to server for API calls
- Error handling may inadvertently log keys
- LocalStorage is readable by any JavaScript on the page

**Consequences:**
- Users' API keys stolen and used for unauthorized purposes
- User charged for attacker's usage
- Loss of user trust destroys adoption
- Potential legal liability

**Prevention:**
1. Never log API keys server-side (even in error handlers)
2. Transmit keys only over HTTPS
3. Store in browser's localStorage (not cookies that get sent automatically)
4. Show clear warnings to users about key security
5. Consider OAuth PKCE flow with OpenRouter instead of raw keys (OpenRouter supports this)
6. Implement key validation endpoint that doesn't expose the key in responses
7. Use short-lived sessions rather than persistent key storage

**Detection:**
- API keys appearing in server logs
- Keys visible in browser network tab to wrong endpoints
- Users reporting unexpected charges
- Keys appearing in error messages or UI

**Phase to address:** Phase 1 (Security architecture) - design before implementing auth

**Sources:**
- [OpenRouter: Authentication Docs](https://openrouter.ai/docs/api/reference/authentication)
- [OpenRouter: OAuth PKCE](https://openrouter.ai/docs/guides/overview/auth/oauth)
- [AWS: RAG Chatbot Security](https://aws.amazon.com/blogs/security/hardening-the-rag-chatbot-architecture-powered-by-amazon-bedrock-blueprint-for-secure-design-and-anti-pattern-migration/)

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or degraded user experience.

---

### Pitfall 7: Embedding Model Mismatch

**What goes wrong:** Using a general-purpose embedding model for domain-specific technical content. The model doesn't understand protocol-specific terminology, leading to poor retrieval.

**Why it happens:**
- Default to popular models (OpenAI ada-002) without testing on domain
- Domain-specific terms (Quilibrium concepts, node operator jargon) not in training data
- No evaluation of retrieval quality before launch

**Prevention:**
1. Test embedding models on sample queries with expected results
2. Consider domain-specific fine-tuning if generic models underperform
3. Implement hybrid search: keywords catch exact technical terms, vectors catch semantic similarity
4. Add glossary/alias handling for protocol-specific terminology

**Detection:**
- Queries using exact documentation terms don't retrieve those documents
- Semantic queries work but technical term queries fail
- Users rephrase questions multiple times to get relevant results

**Phase to address:** Phase 1 (Embedding selection) with validation in Phase 2

**Sources:**
- [Snorkel: RAG Failure Modes](https://snorkel.ai/blog/retrieval-augmented-generation-rag-failure-modes-and-how-to-fix-them/)
- [OpenXcell: Best Embedding Models 2026](https://www.openxcell.com/blog/best-embedding-models/)

---

### Pitfall 8: Embedding Drift Over Time

**What goes wrong:** Re-embedding documents with different preprocessing, versions, or settings creates inconsistent vectors. Old and new embeddings don't align semantically.

**Why it happens:**
- Updating embedding model version without re-embedding all docs
- Inconsistent text preprocessing (whitespace, encoding, special characters)
- Partial re-indexing after content updates
- "By the time people notice that answers have become inconsistent, the drift has already spread" ([DEV Community](https://dev.to/dowhatmatters/embedding-drift-the-quiet-killer-of-retrieval-quality-in-rag-systems-4l5m))

**Prevention:**
1. Version your embedding configuration (model + preprocessing)
2. Re-embed ALL documents when changing embedding approach
3. Standardize preprocessing pipeline (consistent chunking, cleaning)
4. Store embedding version metadata with vectors
5. Implement consistency checks comparing old/new embeddings

**Detection:**
- Answer quality degrades after content updates
- Similar queries return inconsistent results over time
- New documents not retrieving as well as original ones

**Phase to address:** Phase 1 (Ingestion Pipeline) - build in from start

---

### Pitfall 9: No Streaming = Terrible UX

**What goes wrong:** Full response waits until LLM completes generation. Users see loading spinner for 10-30 seconds, assume system is broken, and leave.

**Why it happens:**
- Simpler to implement non-streaming first
- Edge Runtime issues (Pitfall 4) make streaming seem risky
- Team doesn't prioritize UX over functionality

**Consequences:**
- Users abandon before seeing response
- Perceived performance much worse than actual
- "Users won't wait 31 seconds for a Slack response" ([kapa.ai](https://www.kapa.ai/blog/rag-gone-wrong-the-7-most-common-mistakes-and-how-to-avoid-them))

**Prevention:**
1. Implement streaming from day one - it's not much harder
2. Use Vercel AI SDK's built-in streaming support
3. Show typing indicators and partial responses
4. If streaming fails, gracefully degrade to loading state (not blank screen)

**Detection:**
- High bounce rate on chat page
- User feedback about "slow" system
- Analytics showing users leaving before response completes

**Phase to address:** Phase 1 (Chat implementation) - non-negotiable for MVP

**Sources:**
- [Vercel: Streaming Functions](https://vercel.com/docs/functions/streaming-functions)
- [LogRocket: AI SDK Streaming](https://blog.logrocket.com/nextjs-vercel-ai-sdk-streaming/)

---

### Pitfall 10: Unusable or Missing Citations

**What goes wrong:** Citations are either absent (no trust), wrong (cite sources that don't support the claim), or unusable (dead links, no way to verify).

**Why it happens:**
- Citations bolted on after core functionality
- LLM hallucinates citation numbers not matching retrieved chunks
- Source URLs change or weren't stored with embeddings
- "If an LLM response is incorrect, it is crucial to review the final prompt... For issues with citations, developers must trace back to the original document links" ([Stack-AI](https://www.stack-ai.com/blog/how-to-build-rag-chatbot))

**Prevention:**
1. Store source URL/path with each chunk in metadata
2. Include chunk ID in retrieval, map to citation
3. Have LLM cite specific retrieved chunks, not generate citations
4. Verify cited chunks actually support the claims
5. Link citations to anchor points in docs (not just page)
6. Use tool-calling for citations: "having the model call a tool to declare citations is natural and deterministic" ([cianfrani.dev](https://cianfrani.dev/posts/citations-in-the-key-of-rag/))

**Detection:**
- Users report citations don't match content
- Clicking citations leads to wrong section
- Citations reference documents not in your corpus

**Phase to address:** Phase 2-3 (Response formatting) - design into data model early

---

### Pitfall 11: pgvector Index Misconfiguration

**What goes wrong:** Using wrong index type or misconfigured parameters leads to slow queries or poor recall. HNSW index exceeds RAM, IVFFlat has poor recall.

**Why it happens:**
- Default to simplest index without understanding tradeoffs
- Don't monitor memory usage as corpus grows
- Skip performance testing at realistic scale

**Consequences:**
- Query latency spikes from ms to seconds
- Memory exhaustion crashes database
- Recall drops silently (wrong results, no errors)
- "HNSW Index is RAM hungry - if your index exceeds your RAM, performance falls off a cliff" ([Geetopadesha](https://geetopadesha.com/vector-search-in-2026-pinecone-vs-supabase-pgvector-performance-test/))

**Prevention:**
1. For <10K vectors: IVFFlat is fine
2. For 10K-1M vectors: HNSW with proper memory allocation
3. Monitor Supabase memory usage dashboards
4. Set `ef_search` and `m` parameters appropriately for HNSW
5. Consider pgvectorscale for larger corpora (SSD-based indexing)
6. Test with production-like data volume before launch

**Detection:**
- Query latency increases as corpus grows
- Out-of-memory errors in Supabase logs
- Retrieval quality degrades at scale

**Phase to address:** Phase 1 (Database setup) - configure correctly from start

**Sources:**
- [Supabase: pgvector Docs](https://supabase.com/docs/guides/database/extensions/pgvector)
- [Vector Search 2026: Pinecone vs Supabase](https://geetopadesha.com/vector-search-in-2026-pinecone-vs-supabase-pgvector-performance-test/)

---

## Minor Pitfalls

Mistakes that cause annoyance but are relatively easy to fix.

---

### Pitfall 12: No Graceful "I Don't Know"

**What goes wrong:** System attempts to answer every question, even ones clearly outside scope. Results in poor answers and user frustration.

**Prevention:**
1. Implement similarity score thresholds - refuse below threshold
2. Explicit prompt instruction: "If uncertain, say so"
3. Provide suggested alternative resources when declining

**Detection:**
- Users report irrelevant answers to off-topic questions
- System attempts to answer questions about unrelated topics

---

### Pitfall 13: Ignoring Code Block Formatting

**What goes wrong:** Code examples in responses render as plain text, losing syntax highlighting and formatting.

**Prevention:**
1. Ensure markdown rendering in chat UI
2. Test code-heavy responses during development
3. Consider copy-to-clipboard buttons for code blocks

**Detection:**
- Code appears as unformatted text in chat
- Users can't easily copy commands

---

### Pitfall 14: Missing Conversation Context

**What goes wrong:** Each message treated independently; follow-up questions fail because system doesn't know what "it" refers to.

**Prevention:**
1. Include conversation history in prompt (last N messages)
2. Implement conversation summarization for long chats
3. Clear signal to users when starting new topic

**Detection:**
- Follow-up questions get confused responses
- "What do you mean by 'it'?" type failures

---

### Pitfall 15: Error Messages Expose Internals

**What goes wrong:** Raw API errors, stack traces, or internal details shown to users.

**Prevention:**
1. Catch all errors and show user-friendly messages
2. Log detailed errors server-side only
3. Never expose API keys, paths, or system details in UI

**Detection:**
- Users see JSON error objects
- Stack traces appear in chat window

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Ingestion Pipeline | Naive chunking (#1), Embedding drift (#8) | Implement semantic chunking, version embeddings |
| Database Setup | pgvector misconfiguration (#11) | Start with HNSW, monitor memory |
| Retrieval Logic | Wrong K value (#2), Embedding mismatch (#7) | Two-stage retrieval with reranking, hybrid search |
| Chat UI | No streaming (#9), Poor citations (#10) | Stream from day one, tool-based citations |
| Prompt Engineering | Hallucination (#3), Missing "I don't know" (#12) | Strict grounding instructions, score thresholds |
| Security | API key exposure (#6), Prompt injection (#5) | HTTPS only, sanitize retrieved content |
| Vercel Deployment | Edge function issues (#4) | Use Node.js runtime for DB operations |

---

## Priority Matrix for Quilibrium Project

Given the specific context (self-hosted docs chatbot, user-provided API keys, ~100 docs):

**Must Address Before MVP:**
1. Chunking strategy (#1) - foundational
2. Streaming (#9) - UX is non-negotiable
3. API key security (#6) - trust requirement
4. Edge function architecture (#4) - avoid rewrites

**Address in MVP:**
5. K value and reranking (#2) - quality
6. Hallucination prevention (#3) - accuracy
7. Basic citations (#10) - trust

**Can Iterate Post-MVP:**
8. Prompt injection hardening (#5) - controlled content
9. Embedding drift prevention (#8) - small corpus
10. Advanced pgvector tuning (#11) - ~100 docs won't stress it

---

## Sources Summary

**High Confidence (Official docs, verified):**
- [Vercel Edge Runtime Docs](https://vercel.com/docs/functions/runtimes/edge)
- [Supabase pgvector Docs](https://supabase.com/docs/guides/database/extensions/pgvector)
- [OpenRouter Authentication](https://openrouter.ai/docs/api/reference/authentication)
- [OWASP LLM Top 10](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)

**Medium Confidence (Multiple sources agree):**
- [Pinecone: Rerankers](https://www.pinecone.io/learn/series/rag/rerankers/)
- [Unstructured: Chunking Best Practices](https://unstructured.io/blog/chunking-for-rag-best-practices)
- [Weaviate: Chunking Strategies](https://weaviate.io/blog/chunking-strategies-for-rag)
- [AWS: RAG Security](https://aws.amazon.com/blogs/security/hardening-the-rag-chatbot-architecture-powered-by-amazon-bedrock-blueprint-for-secure-design-and-anti-pattern-migration/)

**Lower Confidence (Single source, community):**
- [Vercel Community discussions on Edge function issues](https://community.vercel.com/t/vercel-edge-functions-dying-without-hitting-timeout-limits/17879)
- [DEV Community: Embedding Drift](https://dev.to/dowhatmatters/embedding-drift-the-quiet-killer-of-retrieval-quality-in-rag-systems-4l5m)
