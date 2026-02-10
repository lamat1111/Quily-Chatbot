---
type: doc
title: "System Prompt & Anti-Hallucination Strategy"
status: done
ai_generated: true
reviewed_by: null
created: 2026-02-09
updated: 2026-02-09
related_docs:
  - "rag-knowledge-base-workflow.md"
  - "model-specific-instruction-handling.md"
related_tasks: []
---

# System Prompt & Anti-Hallucination Strategy

> **AI-Generated**: May contain errors. Verify before use.

## Overview

Quily's system prompt is built at runtime from two files:

| File | Purpose |
|------|---------|
| `src/lib/rag/prompt.ts` | Knowledge scope rules, response instructions, context injection, citation system |
| `src/lib/rag/personality.ts` | Identity, voice, tone examples, priority rules |

The final prompt is assembled by `buildSystemPrompt()` which combines the personality block, knowledge scope, response instructions (rules 1-12), and the retrieved documentation context.

## Prompt Structure

```
# Quily Assistant — System Prompt
## Identity          (personality.ts → IDENTITY)
## Voice             (personality.ts → VOICE)
## Examples          (personality.ts → EXAMPLES)
## Rules             (personality.ts → PRIORITIES)
---
## Knowledge Scope   (prompt.ts — static rules about recency, planned vs live, etc.)
## Response Instructions (prompt.ts — rules 1-12)
---
## Documentation Context (retrieved chunks injected at runtime)
---
## Follow-Up Questions (output format instructions)
```

## Anti-Hallucination Defenses

### Layer 1: Retrieval Pipeline (`retriever.ts`)

- **Similarity threshold** (0.35): Chunks below this are not returned.
- **Low-relevance warning**: When the best chunk scores below 0.45, a `LOW RELEVANCE WARNING` is prepended to the context telling the LLM to say "I don't have information" rather than guess.
- **Dynamic chunk count**: Broad/multi-topic queries ("all products", "overview", "list features") automatically retrieve 10 chunks instead of the default 5, and pull from 25 initial candidates instead of 15. Detection uses keyword matching in `isBroadQuery()`.

### Layer 2: System Prompt Rules (rules 1-12 in `prompt.ts`)

**Core grounding rules (original):**
- Rule 1: Only use information from the documentation context.
- Rule 4: If info isn't in context, say "I don't have specific information."
- Rule 6: Never invent citation numbers.
- Rule 8: Never modify or extend documented CLI commands.

**Anti-hallucination rules (added 2026-02-09):**
- Rule 9: Never describe a product unless the context has at least a full sentence about it. Table cells, headers, list mentions are not enough. Includes a ban on name-based extrapolation (e.g. "QPing" sounding like "ping").
- Rule 10: For multi-topic questions with partial coverage, only answer about documented topics and explicitly list the rest as "I don't have documentation on X."
- Rule 11: Makes the LLM aware it has at most N source chunks, so multi-topic questions likely have incomplete coverage.
- Rule 12: For broad questions, the LLM must first inventory what topics are actually covered, then only discuss those, and note the answer may be incomplete.

### Layer 3: Personality Override (`personality.ts`)

The personality encourages confident, enthusiastic responses which can conflict with accuracy. Priority rule 3 is an explicit override:

> **OVERRIDE: Accuracy always beats personality. If staying in character would lead you to fill knowledge gaps with confident-sounding guesses, break character and say you don't know. A funny "I have no idea" is always better than a confident wrong answer.**

### Layer 4: Knowledge Scope Guards (`prompt.ts`)

- **Planned vs. Live features**: The prompt instructs the LLM to detect language like "upcoming", "planned", "under development" and NOT present those as live features.
- **Recency tiebreaker**: When sources conflict on feature status, trust the more recent publication date.
- **Product note**: Clarifies that S3/KMS services are offered by QConsole (Quilibrium Inc.), not the protocol itself.

## Known Failure Mode: Broad Queries

The hallucination incident that prompted these changes was a user asking about all Quilibrium products. The bot received 5 chunks covering some products and fabricated descriptions for the rest. Root causes:

1. **Insufficient chunk count** for multi-topic queries (fixed: dynamic `finalCount`)
2. **No rule against partial-coverage extrapolation** (fixed: rules 9-12)
3. **Personality rewarding confident answers** over admitting ignorance (fixed: priority override)
4. **Low-relevance warning not firing** because at least one chunk had high similarity (partially mitigated by rules 11-12 making the LLM aware of limited coverage)

## Future Improvements to Consider

- ~~**Query decomposition**~~ — **Implemented.** See [RAG Query Decomposition](rag-query-decomposition.md). Broad and multi-entity queries are now decomposed into sub-queries per product, retrieved in parallel, and merged via Reciprocal Rank Fusion before reranking.
- **Mixed quality level**: Track similarity score spread (max vs min) and add a 'mixed' quality warning when top chunks are high but bottom chunks are low.
- **Coverage metadata**: Inject the count of unique source files into the context so the LLM can gauge breadth of coverage.

---

*Updated: 2026-02-10*
