---
type: doc
title: "Cloudflare Workers AI Reranker"
status: done
ai_generated: true
reviewed_by: null
created: 2026-02-05
updated: 2026-02-05
related_docs:
  - "rag-knowledge-base-workflow.md"
related_tasks:
  - "implement-cloudflare-reranker.md"
---

# Cloudflare Workers AI Reranker

> **⚠️ AI-Generated**: May contain errors. Verify before use.

## Overview

The Cloudflare Workers AI Reranker provides a **free** semantic reranking solution for the RAG pipeline. It uses Cloudflare's BGE-reranker-base model via REST API to improve retrieval quality at zero cost. The reranker sits between the initial vector search (15 candidates) and final result selection (5 documents), reordering candidates by semantic relevance to the query.

## Architecture

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Reranker Module | `src/lib/rag/cloudflare-reranker.ts` | REST API client for Cloudflare Workers AI |
| Retriever Integration | `src/lib/rag/retriever.ts:340-361` | Fallback chain integration |

### Reranking Fallback Chain

The retriever attempts reranking in this order:

```
1. Cohere (paid, highest quality)
   ↓ fails or not configured
2. Cloudflare Workers AI (free)
   ↓ fails or not configured
3. Similarity-based selection (always available)
```

### Data Flow

```
Vector Search Results (15 candidates)
            │
            ▼
    ┌───────────────────┐
    │   Cohere Rerank   │ ← If COHERE_API_KEY set
    │   (rerank-v3.5)   │
    └─────────┬─────────┘
              │ fails/missing
              ▼
    ┌───────────────────┐
    │ Cloudflare Rerank │ ← If CLOUDFLARE_ACCOUNT_ID +
    │ (bge-reranker)    │   CLOUDFLARE_API_TOKEN set
    └─────────┬─────────┘
              │ fails/missing
              ▼
    ┌───────────────────┐
    │ Similarity Sort   │ ← Always available
    │ (vector cosine)   │
    └─────────┬─────────┘
              │
              ▼
    Final Results (5 documents)
```

## Configuration

### Environment Variables

```bash
# Cloudflare Workers AI (free reranker)
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

### Setup Instructions

1. **Create Cloudflare Account** (free): https://dash.cloudflare.com/sign-up
2. **Get Account ID**: Dashboard → Workers & Pages → Overview → Account ID (right sidebar)
3. **Create API Token**:
   - My Profile → API Tokens → Create Token
   - Use "Custom token" template
   - Permissions: `Account` → `Workers AI` → `Read`
   - Create and copy token
4. **Add to Environment**:
   - Local: Add to `.env.local`
   - Vercel: Settings → Environment Variables

## API Details

### Endpoint

```
POST https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/baai/bge-reranker-base
```

### Request Format

```typescript
{
  query: string,
  contexts: Array<{ text: string }>,
  top_k: number
}
```

### Response Format

```typescript
{
  result: {
    response: Array<{
      id: number,    // Original document index
      score: number  // Relevance score
    }>
  },
  success: boolean,
  errors: Array<{ message: string }>
}
```

## Usage Examples

### Direct Usage

```typescript
import { rerankWithCloudflare } from '@/lib/rag/cloudflare-reranker';

const results = await rerankWithCloudflare(
  'What is Quilibrium consensus?',
  ['Document 1 content...', 'Document 2 content...'],
  5,  // topK
  process.env.CLOUDFLARE_ACCOUNT_ID!,
  process.env.CLOUDFLARE_API_TOKEN!
);

// Returns: [{ index: 1, score: 0.92 }, { index: 0, score: 0.78 }]
```

### Automatic Integration

When configured, the reranker is automatically used by the retriever:

```typescript
import { retrieveWithReranking } from '@/lib/rag/retriever';

// Cloudflare reranking happens automatically if:
// - CLOUDFLARE_ACCOUNT_ID is set
// - CLOUDFLARE_API_TOKEN is set
// - Cohere is not configured or fails
const chunks = await retrieveWithReranking(query, options);
```

## Technical Decisions

### Why Cloudflare Workers AI?

- **Free tier**: 10,000 neurons/day (~7,100 reranks) at no cost
- **No SDK required**: Simple REST API callable from any environment
- **BGE model quality**: Open-source model with good performance
- **Graceful fallback**: Doesn't break if rate limited or unavailable

### Why as a Cohere Fallback?

- **Quality hierarchy**: Cohere's rerank-v3.5 outperforms BGE-reranker
- **Cost optimization**: Use paid Cohere for production, free Cloudflare for development/low-traffic
- **Flexibility**: Projects can choose based on budget and quality needs

### Timeout Configuration

The reranker uses a 10-second timeout to prevent blocking the response pipeline. If Cloudflare is slow or unreachable, the system falls back to similarity-based selection quickly.

## Free Tier Limits

| Metric | Value |
|--------|-------|
| **Free daily neurons** | 10,000 |
| **Approx. reranks/day** | ~7,100 |
| **Reset time** | 00:00 UTC daily |

### Usage Projections

| Scenario | Daily Reranks | % of Free Quota | Monthly Cost |
|----------|---------------|-----------------|--------------|
| 100 users × 5 queries | 500 | 7% | $0 |
| 500 users × 5 queries | 2,500 | 35% | $0 |
| 1,000 users × 5 queries | 5,000 | 70% | $0 |

## Error Handling

The module handles these error conditions gracefully:

| Error | Behavior |
|-------|----------|
| Rate limit (429) | Falls back to similarity |
| Network timeout | Falls back to similarity |
| Invalid credentials | Falls back to similarity |
| Empty query/documents | Returns empty array |

All errors are logged with `console.warn` for debugging without breaking the user experience.

## Known Limitations

- **No batching**: Each rerank call is independent (not batched)
- **Daily limits**: Free tier resets at UTC midnight, not rolling 24h
- **Model quality**: BGE-reranker is good but not as accurate as Cohere rerank-v3.5
- **Cold starts**: First request may be slower due to Cloudflare worker initialization

## Related Documentation

- [RAG Knowledge Base Workflow](../rag-knowledge-base-workflow.md) - Full RAG pipeline documentation
- [Cloudflare Workers AI Docs](https://developers.cloudflare.com/workers-ai/) - Official Cloudflare documentation
- [Cloudflare Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) - Free tier details

---

_Created: 2026-02-05_
_Updated: 2026-02-05_
