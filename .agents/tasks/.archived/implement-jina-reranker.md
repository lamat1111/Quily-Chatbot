---
type: task
title: "Implement Jina Reranker as Free Alternative to Cohere"
status: archived
complexity: medium
ai_generated: true
reviewed_by: null
created: 2026-01-27
updated: 2026-01-27
related_docs: ["docs/features/rag-knowledge-base-workflow.md"]
---

# Implement Jina Reranker as Free Alternative to Cohere

> **AI-Generated**: May contain errors. Verify before use.

## Status: ARCHIVED - Reverted

**Reason**: Jina's free tier (10M tokens) is licensed under CC-BY-NC-4.0, which requires non-commercial use and Creative Commons licensing. This conflicts with the project's requirement for commercial-use-friendly solutions with zero cost to the service operator.

**Resolution**: Code was implemented and then removed. The RAG pipeline now uses:
- Cohere reranking (if `COHERE_API_KEY` provided)
- Similarity-based fallback (default)

**Future alternatives considered**:
- LLM-based reranking via OpenRouter (using user's API key) - adds latency but uses same key
- Voyage AI (200M free tokens, commercial OK) - requires separate API key

---

## Original Task Description

The RAG pipeline currently supports Cohere reranking to improve retrieval quality (20-35% accuracy improvement), but Cohere's trial keys are unusable and it's a paid service. Jina AI offers a free reranker API with 10 million tokens - sufficient for most projects.

**Problem discovered**: Jina's free tier requires:
1. Non-commercial use only (CC-BY-NC-4.0)
2. Creative Commons licensing for your content

This makes it unsuitable for a commercial service where users bring their own API keys.

---

_Created: 2026-01-27_
_Archived: 2026-01-27_
