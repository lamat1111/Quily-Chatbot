---
type: report
title: "Multilingual Support Analysis for RAG Chatbot"
ai_generated: true
reviewed_by: null
created: 2026-01-30
updated: 2026-01-30
related_tasks: []
related_docs: []
---

# Multilingual Support Analysis for RAG Chatbot

> **⚠️ AI-Generated**: May contain errors. Verify before use.

## Executive Summary

This analysis examines the multilingual capabilities of the Quily chatbot's RAG (Retrieval-Augmented Generation) system. Key findings:

- **BGE-M3 embeddings enable cross-lingual retrieval** - Users can query in any of 100+ languages and retrieve relevant English documentation
- **Response language quality depends on LLM choice** - DeepSeek V3 handles major languages well; premium models (GPT-4, Claude) offer better multilingual output
- **No system prompt changes recommended** - Current setup is functional; forcing language responses may degrade quality

## Scope & Methodology

- **Scope**: Analysis of multilingual support across the embedding layer (retrieval) and LLM layer (generation)
- **Methodology**: Code review of embedding configuration, system prompts, and LLM integration
- **Key Files Analyzed**:
  - `src/lib/rag/retriever.ts` - Embedding model configuration
  - `src/lib/rag/prompt.ts` - System prompt definition
  - `src/lib/chutes/chuteDiscovery.ts` - Model discovery and configuration
  - `scripts/ingest/embedder-chutes.ts` - Embedding generation

## Findings

### 1. Embedding Layer: BGE-M3 Cross-Lingual Capabilities

**Current Configuration:**
```typescript
// src/lib/rag/retriever.ts:10-11
const UNIFIED_EMBEDDING_MODEL = 'baai/bge-m3';
const CHUTES_EMBEDDING_MODEL_SLUG = 'chutes-baai-bge-m3';
```

**Key Characteristics:**
- BGE-M3 is a **multilingual embedding model** supporting 100+ languages
- Produces 1024-dimensional vectors
- Enables **cross-lingual semantic search** - queries in any supported language can match English documents

**How It Works:**
```
User Query (French): "Comment fonctionne Quilibrium?"
         ↓
BGE-M3 encodes query into semantic vector space
         ↓
Vector search finds English chunks about "how Quilibrium works"
         ↓
Relevant English documentation retrieved
```

**Impact:** Users can ask questions in their native language and the system retrieves semantically relevant English documentation chunks.

### 2. LLM Layer: Response Language Quality

The LLM receives:
1. User's question (in their language)
2. English context chunks from retrieval
3. System prompt (English)

**Response behavior depends on model capabilities:**

| Model | Multilingual Quality | Notes |
|-------|---------------------|-------|
| GPT-4 / Claude | Excellent | Fluent responses in user's language |
| DeepSeek V3 (default) | Good | Strong for Chinese, English; decent for major European languages |
| Smaller/budget models | Variable | May default to English or produce awkward translations |

**DeepSeek V3 Specifics:**
- Trained heavily on Chinese and English - these are strongest
- Functional for Spanish, French, German, Portuguese
- May struggle with less common languages
- Generally mirrors user's language without explicit instruction

### 3. System Prompt Analysis

**Current State:** No explicit language instructions in system prompt (`src/lib/rag/prompt.ts:101-191`)

**Considered Enhancement:**
```typescript
// NOT RECOMMENDED
**Language:** Always respond in the same language the user wrote their question in.
```

**Why This Is NOT Recommended:**
1. **Dual-task degradation** - Forcing translation while reasoning about technical content can reduce quality
2. **Natural mirroring** - Capable LLMs already tend to respond in the user's language
3. **Safe fallback** - English responses are acceptable for technical documentation
4. **Model uncertainty** - Explicit instructions can cause worse results when model is unsure about the target language

### 4. Current User Experience by Language

| User Language | Retrieval | Response Quality |
|---------------|-----------|------------------|
| English | ✅ Excellent | ✅ Excellent |
| Chinese | ✅ Excellent | ✅ Excellent (DeepSeek strength) |
| Spanish/French/German | ✅ Excellent | ⚠️ Good |
| Other major languages | ✅ Good | ⚠️ Variable |
| Less common languages | ⚠️ Variable | ⚠️ May default to English |

## Recommendations

### High Priority

None required - current system is functional for multilingual use.

### Medium Priority

1. **User-selectable language preference**
   - **Why**: Gives users control over response language
   - **How**: Add UI toggle for "Respond in my language" that appends instruction to system prompt
   - **Trade-off**: May reduce quality for some language/model combinations

2. **Model recommendations by language**
   - **Why**: Help non-English users select optimal models
   - **How**: Add guidance in UI suggesting GPT-4/Claude for best multilingual output
   - **Files**: Update model selection UI with language quality indicators

### Low Priority

3. **Multilingual documentation ingestion**
   - **Why**: Native-language docs would improve retrieval quality for non-English queries
   - **How**: Ingest translated documentation alongside English sources
   - **Trade-off**: Significant content effort; BGE-M3 cross-lingual approach already works

4. **Query translation pipeline**
   - **Why**: Could improve retrieval for languages with weaker BGE-M3 coverage
   - **How**: Translate query to English before embedding, use English for retrieval
   - **Trade-off**: Adds latency; likely unnecessary given BGE-M3's broad language support

## Technical Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    User Query (Any Language)                 │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              BGE-M3 Embedding (Multilingual)                 │
│              - 100+ languages supported                      │
│              - Cross-lingual semantic matching               │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Pinecone Vector Search                      │
│              - English documentation indexed                 │
│              - Semantic similarity matching                  │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     LLM Generation                           │
│              - Receives: User query + English chunks         │
│              - Response language: Model-dependent            │
│              - DeepSeek V3: Good for major languages         │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Response (User's Language*)                 │
│              * Quality varies by model capability            │
└─────────────────────────────────────────────────────────────┘
```

## Action Items

- [ ] **Consider UI enhancement** - Add model quality indicators for multilingual users
- [ ] **Monitor user feedback** - Track if multilingual users report quality issues
- [ ] **Document in user guide** - Explain that queries work in any language

## Conclusion

The current RAG system provides solid multilingual support through BGE-M3's cross-lingual capabilities. Users can query in their native language and retrieve relevant documentation. Response language quality depends on the chosen LLM, with DeepSeek V3 providing good coverage for major languages. No immediate changes are recommended; the system works as-is and modifications risk degrading quality.

---

_Created: 2026-01-30_
_Report Type: Research/Analysis_
