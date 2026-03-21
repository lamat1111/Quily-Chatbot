---
type: bug
title: "RAG retrieval surfaces outdated sharding/milestone info despite recency improvements"
status: done
priority: high
ai_generated: true
created: 2026-03-21
updated: 2026-03-21
resolved: 2026-03-21
resolution: "Annotated obsolete milestone/roadmap sections in 3 old transcripts as historical. Added status keyword detection, post-rerank recency boost, broad query word-boundary fix, maxOutputTokens cap, and streamlined system prompt. Primary fix was the transcript edits — the most effective approach for stale content."
---

# RAG retrieval surfaces outdated sharding/milestone info despite recency improvements

> **⚠️ AI-Generated**: May contain errors. Verify before use.

## Symptoms

When users ask about the current state of the shard-out process, milestones, or sharding progress, the bot consistently cites **year-old livestream transcripts** (Feb 2025) that reference an obsolete milestone numbering system (Milestone 3, Milestone 5) instead of recent Discord dev-updates and announcements from March 2026 that describe the actual current state.

**Example query**: "Could you please explain the remaining milestones for the full Shard Out, ordered chronologically by target/priority?"

**What the bot returns**:
- Milestone 3/5 framework from Feb 2025 livestreams
- Beacon decommissioning as a future event (may already be in progress)
- Sources: `transcriptions/2025-02-10_encrypted-ai-cloud-services-s3-kms-apis.md` and `transcriptions/2025-02-03_quilibrium-2.1-architecture-quorum-development.md`

**What it should return**:
- Current shard health numbers (~2000+ healthy shards, 67 halt risk, 663 needs coverage)
- Active version progression (v2.1.0.18 → .19 → .20 → .21)
- QClient release enabling direct shard allocation (Mar 15, 2026)
- Prover root mismatch fix in progress (Mar 21, 2026)
- The milestone numbering is obsolete; the rollout is iterative now

## Root Cause

Multiple compounding issues in the retrieval pipeline:

### 1. Semantic similarity heavily favors old, keyword-rich transcripts

Old livestream transcripts from early 2025 contain dense, detailed discussions of "sharding", "milestones", "shard out" — they score very high on semantic similarity (0.4+). Recent Discord dev-updates mention sharding briefly in context of other updates, scoring much lower (0.2-0.3). The vector search naturally returns old transcripts.

**Evidence from logs**:
```
Post-rerank recency boost applied:
  1. 2025-02-10 | score: 0.004 → 0.004 | transcriptions/2025-02-10_...
  2. 2025-02-03 | score: 0.002 → 0.002 | transcriptions/2025-02-03_...
```

### 2. Recency boost is too weak to overcome relevance gap

The post-rerank recency boost (`RECENCY_BOOST_MAX = 0.15`) is applied to the Cloudflare reranker's scores, but the reranker scores are normalized 0-1 and the old transcripts score much higher on content relevance. A +0.15 boost for a recent Discord recap that scores 0.05 relevance still loses to an old transcript scoring 0.4.

**Key insight**: The boost works well when old and new sources have similar relevance — but for sharding queries, old sources are far more keyword-dense.

### 3. Reserved temporal chunks are topic-agnostic

The temporal reservation system (`fetchRecentChunks`) pulls the 3 most recent documents regardless of topic:
- 1 most recent doc of any type (often unrelated — e.g., QUIL token reference)
- 1 most recent livestream (Feb 2026 — relevant but general)
- 1 most recent Discord announcement (Mar 2026 — often unrelated to sharding)

These chunks DO reach the LLM context, but the LLM often ignores them because they contain only brief mentions of sharding amid other topics, while the old transcripts have entire sections dedicated to milestones.

**Evidence from logs**:
```
Reserved temporal chunks: [
  '2026-03-21 | discord_recap | discord/general-recap/2026-03-21.md',
  '2026-03-19 | discord_announcement | discord/announcements/2026-03-19.md',
  '2026-02-01 | livestream_transcript | transcriptions/2026-02-01_qconsole-qkms-quark-launch.md'
]
```
The Mar 21 recap mentions prover root mismatch fixes (sharding-related), but it's a small part of a general recap. The LLM prefers citing the old transcripts that discuss milestones in detail.

### 4. `isBroadQuery` false positive (FIXED)

The word "all" in `BROAD_QUERY_KEYWORDS` matched as a substring inside "chronologic**all**y", triggering query decomposition into 11 product sub-queries. This diluted the search and returned irrelevant product docs.

**Fix applied**: `isBroadQuery` now uses word-boundary regex (`\b`) for single-word keywords.

### 5. Double response from zombie process (FIXED)

A test script (`node --input-type=module`) that imported the bot's bundled `dist/index.js` to check exports inadvertently started a second Discord gateway connection. Both the real bot and the zombie processed every message, causing duplicate responses.

**Fix applied**: Killed zombie process manually. Root cause was ad-hoc testing — not a code bug.

## Improvements Already Applied

| Change | File | Effect |
|--------|------|--------|
| Status keyword detection | `src/lib/rag/retriever.ts` | Queries with "status", "progress", "milestones", "remaining", "roadmap" etc. now trigger temporal augmentation |
| Post-rerank recency boost | `src/lib/rag/retriever.ts` | After reranking, recent docs get up to +0.15 score boost (linear decay over 90 days) |
| Wider reranker pool for temporal queries | `src/lib/rag/retriever.ts` | Reranker returns 2x candidates for temporal queries so boost has room to promote recent docs |
| `isBroadQuery` word-boundary fix | `src/lib/rag/retriever.ts` | Prevents false positive decomposition from substring matches like "all" in "chronologically" |
| `maxOutputTokens: 800` | `src/lib/rag/service.ts` | Caps response length to prevent multi-message responses on Discord |
| System prompt char limit | `src/lib/rag/prompt.ts` | Instructs LLM to keep responses under 1800 characters |
| System prompt cleanup | `src/lib/rag/prompt.ts` | Streamlined from ~110 lines to ~70 lines for clarity |

## What Still Needs Fixing

### Problem A: Recency boost insufficient for high-relevance-gap queries

**Diagnosis**: When old sources score 10-100x higher on relevance than recent sources, a flat +0.15 boost can't bridge the gap.

**Possible solutions**:
1. **Multiplicative boost instead of additive**: e.g., `score * (1 + recencyFactor)` so high-relevance recent docs get proportionally more benefit
2. **Increase `RECENCY_BOOST_MAX`** to 0.3-0.5 for status queries specifically
3. **Penalize very old sources**: Apply a decay penalty to sources older than 6 months when status intent is detected, rather than only boosting new ones
4. **Dedicated status/progress retrieval**: For status-intent queries, run a separate vector search scoped to `doc_type IN ('discord_recap', 'discord_announcement', 'discord_dev_update')` from the last 90 days, then merge with general results

### Problem B: Reserved temporal chunks are topic-agnostic

**Diagnosis**: `fetchRecentChunks` returns the most recent docs regardless of topic. For "shard out status?", it might return a QUIL token doc and a Quily-on-Discord announcement — neither relevant.

**Possible solutions**:
1. **Topic-filtered temporal reservation**: After embedding the query, also run a date-filtered vector search (e.g., last 90 days only) and use those as reserved chunks instead of purely date-sorted ones
2. **Hybrid approach**: Keep 1 generic recent chunk + 2 topic-relevant recent chunks

### Problem C: LLM ignores recent sources when old sources are more detailed

**Diagnosis**: Even when recent Discord recaps reach the LLM context, the model prefers citing old transcripts that have detailed, structured explanations of milestones. The recent sources contain brief mentions like "Cassie confirmed active efforts to address shard issues" — not enough for the LLM to build a detailed answer.

**Possible solutions**:
1. **Stronger system prompt guidance**: Add explicit instruction like "When the user asks about current status/progress, ALWAYS prefer the most recently dated sources even if older sources have more detail. Note that older information may be obsolete."
2. **Context ordering**: Put recent sources at the END of the context (closer to the query in the prompt), which some LLMs attend to more strongly
3. **Source date annotation**: Add a prominent `⚠️ DATED: This source is from [date]` warning to old chunks in the context block

### Problem D: No "staleness" concept in the knowledge base

**Diagnosis**: There's no way to mark old content as potentially outdated without deleting it. A 2025 transcript about milestones is still factually accurate about what was said in 2025, but its roadmap predictions are stale. The RAG system has no mechanism to distinguish "historically accurate but currently obsolete" from "still current."

**Possible solutions**:
1. **Staleness metadata**: Add a `stale_after` or `superseded_by` field to doc frontmatter for content known to evolve rapidly
2. **`/update-news` integration**: When running `/update-news`, mark old sources as partially stale rather than just annotating them
3. **Topic-specific recency windows**: For known fast-changing topics (sharding status, version releases, network health), always prefer sources from the last 90 days

## Files Involved

- `src/lib/rag/retriever.ts` — Core retrieval pipeline, temporal detection, recency boost
- `src/lib/rag/prompt.ts` — System prompt (character limit, response instructions)
- `src/lib/rag/service.ts` — `processQuery` orchestration, `maxOutputTokens`
- `src/lib/rag/cloudflare-reranker.ts` — Cloudflare BGE reranker (primary reranker in use)
- `bot/src/handlers/mention.ts` — Discord mention handler
- `bot/src/utils/messageChunker.ts` — Message splitting for Discord's 2000 char limit

## Reproduction

1. Ask Quily on Discord: "Could you please explain the remaining milestones for the full Shard Out, ordered chronologically by target/priority?"
2. Observe that the response cites Feb 2025 livestream transcripts and references an obsolete milestone numbering system
3. Check logs: `pm2 logs quily-bot --lines 20 --nostream` — look for `Post-rerank recency boost applied` to see which sources were selected

## Prevention

- When adding rapidly-evolving content (roadmaps, network status, version releases), consider adding topic-specific retrieval logic rather than relying on general-purpose semantic search
- Test status/progress queries after major RAG pipeline changes using the `/rag-test` skill
- Monitor the post-rerank boost logs to ensure recent sources are being promoted effectively

*Updated: 2026-03-21*
