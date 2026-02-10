---
type: doc
title: "RAG Query Decomposition"
status: done
ai_generated: true
reviewed_by: "expert-panel-validated"
created: 2026-02-10
updated: 2026-02-10
related_docs:
  - "rag-knowledge-base-workflow.md"
  - "system-prompt-anti-hallucination.md"
related_tasks:
  - "tasks/rag-query-decomposition.md"
---

# RAG Query Decomposition

## Overview

Query decomposition improves retrieval for queries that touch multiple Quilibrium products. Instead of generating a single embedding that averages across topics, the retriever generates targeted sub-queries for each relevant product, retrieves separately, and merges results using Reciprocal Rank Fusion (RRF).

**File:** `src/lib/rag/retriever.ts` (all logic lives here)

## Problem It Solves

A query like "how does encryption and storage work?" produces a single embedding that lands between QKMS and QStorage in vector space — potentially missing the best docs for either. With decomposition, separate embeddings are generated for each product, ensuring both get their own retrieval pass.

This also fixes the "list all products" scenario where the bot previously hallucinated descriptions for products it had no retrieved context for.

## How It Works

### Two Triggers

| Trigger | Condition | Sub-queries generated |
|---------|-----------|----------------------|
| **A — Broad query** | `isBroadQuery()` detects keywords like "all", "every", "products" | All 9 known entities |
| **B — Multi-entity** | `findMatchedEntities()` finds 2+ entity keyword matches in the query | Only the matched entities |

If neither trigger fires (single-topic or no entity keywords detected), the retriever behaves exactly as before — zero overhead.

### Known Entities

The retriever maintains a static list of Quilibrium products with keyword mappings:

| Entity | Type | Keywords |
|--------|------|----------|
| **QStorage** | S3-compatible object storage | storage, store, s3, data storage |
| **QKMS** | MPC-based key management | key management, encrypt, encryption, kms, mpc |
| **QNS** | Name service (.q domains) | name service, naming, domain, .q |
| **Quorum** | P2P encrypted messenger | messenger, messaging, chat, wallet |
| **Hypersnap** | Snapchain/Farcaster Rust node | snapchain, farcaster, snap |
| **Quark** | 3D game asset library/SDK | game, gaming, 3d, asset, game engine |
| **QPing** | Dispatch/notification mechanism | ping, dispatch, notification |
| **Bridge** | Ethereum cross-chain (QUIL/wQUIL) | bridge, cross-chain, wquil, bridging |
| **QQ** | SQS-compatible message queue | message queue, sqs, queue |

Entities are split into two tiers: well-documented (QStorage, QKMS, QNS, Quorum, Hypersnap) and lightly documented (Quark, QPing, Bridge, QQ). The anti-hallucination prompt rules handle cases where retrieval returns little or nothing for a given entity.

### Retrieval Flow

When decomposition triggers:

1. Build sub-query list: **original query + one per matched entity**
2. Generate embeddings in parallel (`Promise.allSettled`)
3. Run vector searches in parallel (`Promise.allSettled`)
4. Merge all result lists via **Reciprocal Rank Fusion**
5. Deduplicate by chunk ID (keep highest similarity)
6. Sort by RRF score, pass all candidates to the reranking pipeline
7. Reranker (Cohere/Cloudflare/similarity fallback) selects final chunks

The original query always runs alongside entity sub-queries so general/overview docs are still retrieved.

### Reciprocal Rank Fusion (RRF)

`score(doc) = Σ 1/(k + rank)` where k = 60 (standard constant from the RAG-Fusion paper).

Documents ranked highly across multiple sub-queries accumulate higher scores. RRF only uses ordinal position — it doesn't depend on similarity score magnitude, which can vary across sub-queries.

### Partial Failure Handling

`Promise.allSettled` is used for both embedding generation and vector search. If some sub-queries fail:
- Retrieval proceeds with successful ones
- Failed sub-queries are logged via `console.warn`
- If ALL sub-queries fail, an error is thrown

### Telemetry

Decomposition events are logged at `console.log` level:

```
[RAG] Query decomposition triggered: { trigger: 'broad', matchedEntities: [...], totalSubQueries: 10 }
[RAG] Query decomposition results: { successfulEmbeddings: 10, successfulSearches: 10 }
```

## Multilingual Behavior

Keyword-to-entity mappings are **English-only by design**:

- **Product names are language-agnostic** — users in any language type "QStorage", "QKMS" etc. as proper nouns, so Trigger B catches these regardless of language.
- **Semantic synonyms** (e.g., Chinese "存储" for storage) won't trigger entity matching. But the original query still runs and BGE-M3 is a multilingual embedding model, so retrieval quality doesn't regress — it just doesn't get the decomposition boost.
- **Multilingual broad keywords** for Trigger A are deferred until analytics data shows non-English "list all products" queries are common.

The worst case is always "falls back to today's behavior." Decomposition never makes things worse.

## Interaction with Other Retrieval Features

| Feature | Relationship |
|---------|-------------|
| **`isBroadQuery()` dynamic counts** | Still applies — broad queries get `initialCount=25`, `finalCount=10` regardless of decomposition |
| **`isTemporalQuery()` recent chunks** | Runs independently after decomposition — temporal augmentation applies to the merged candidate set |
| **Priority docs (conversational context)** | Merged after decomposition — previously cited chunks are prepended to the candidate set |
| **Reranking (Cohere/Cloudflare)** | Receives all RRF-merged candidates — no pre-truncation before reranking |
| **Anti-hallucination prompt rules** | Complementary — decomposition improves what gets retrieved, prompt rules prevent fabrication for what's still missing |

## Maintaining the Entity List

When adding new product docs to the RAG knowledge base, update `KNOWN_ENTITIES` in `retriever.ts`:

1. Add a new entry with `name`, `query` (product name + short description for embedding quality), and `keywords` (English terms users might use)
2. The `query` field should omit "Quilibrium" — users rarely prefix it since this is a dedicated bot
3. No code changes needed beyond adding the entry — the two-trigger logic picks it up automatically

A code comment in `retriever.ts` points maintainers to this documentation.

## Future Considerations

- **Entity embedding cache**: Sub-query strings are static — a module-level `Map<string, number[]>` cache would avoid re-embedding the same strings on repeated broad queries. Implement if embedding latency becomes noticeable.
- **Multilingual broad keywords**: Extend `BROAD_QUERY_KEYWORDS` with translations when analytics show non-English broad queries are common (same pattern as `TEMPORAL_KEYWORDS`).
- **Ecosystem growth**: As third-party projects build on Quilibrium, the entity list will grow. The current hardcoded approach works for ~9-15 entities; if it grows significantly, consider moving to a config file or database table.

---

*Created: 2026-02-10*
