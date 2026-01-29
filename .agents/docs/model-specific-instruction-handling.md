---
type: doc
title: "Model-Specific Instruction Handling"
status: done
ai_generated: true
reviewed_by: null
created: 2026-01-29
updated: 2026-01-29
related_docs:
  - "rag-knowledge-base-workflow.md"
related_tasks: []
---

# Model-Specific Instruction Handling

> **⚠️ AI-Generated**: May contain errors. Verify before use.

## Overview

The Quily chatbot implements differentiated behavior based on model capabilities. Frontier models (Claude, GPT, Gemini) receive full system prompts and are trusted to follow complex instructions, while open-source models receive safeguards to prevent hallucination when RAG quality is low.

## Architecture

### Model Classification

Models are classified by their instruction-following reliability in [route.ts:29-39](app/api/chat/route.ts#L29-L39):

```typescript
const INSTRUCTION_FOLLOWING_MODELS = [
  'anthropic/', // All Claude models
  'google/',    // All Gemini models
  'openai/',    // All GPT models
];
```

The `isInstructionFollowingModel()` function checks if a model ID starts with any of these prefixes.

### Behavior Matrix

| Model Type | High RAG Quality | Low/None RAG Quality |
|------------|------------------|----------------------|
| Claude/GPT/Gemini | Full system prompt | Full prompt + low-relevance warning |
| Open-source models | Full system prompt | **Bypasses LLM** → canned response |

### RAG Quality Assessment

Quality is determined in [prompt.ts:47-48](src/lib/rag/prompt.ts#L47-L48) based on similarity scores:

- **High**: Best chunk similarity ≥ 0.45 (`HIGH_RELEVANCE_THRESHOLD`)
- **Low**: Best chunk below threshold but chunks exist
- **None**: No chunks retrieved

### Low-Relevance Fallback

When RAG quality is not "high" AND the model is not instruction-following, the system returns a canned response defined in [route.ts:45-53](app/api/chat/route.ts#L45-L53):

```typescript
const LOW_RELEVANCE_FALLBACK_RESPONSE = `I don't have specific documentation...`
```

This bypass occurs at [route.ts:387-399](app/api/chat/route.ts#L387-L399) before the LLM is ever called.

## Technical Decisions

### Why Bypass Open-Source Models on Low Relevance

Open-source models are less reliable at following the "do not hallucinate" instruction in the system prompt. Rather than risk the model inventing technical details (CLI commands, configurations, etc.), the system returns a safe, helpful fallback that:

1. Acknowledges the information gap honestly
2. Points users to official documentation
3. Offers to help with other Quilibrium topics

### Why Trust Frontier Models

Claude, GPT, and Gemini models have demonstrated reliable instruction-following capabilities. They can be trusted to:

- Read and respect the low-relevance warning injected into context
- Say "I don't know" rather than fabricating information
- Stay within the bounds of provided documentation

### System Prompt Design

The full system prompt in [prompt.ts:101-191](src/lib/rag/prompt.ts#L101-L191) includes:

- **Identity & Voice**: Quily's personality and communication style
- **Identity Protection**: Jailbreak resistance instructions
- **Anti-Hallucination Rules**: Explicit prohibition on guessing technical details
- **Citation Instructions**: How to reference sources
- **Dynamic Context**: RAG chunks with quality warnings when applicable

## Usage Examples

### Frontier Model Flow (Claude)
```
User: "How do I check my node balance?"
→ RAG retrieves chunks (similarity: 0.52 = high quality)
→ Full system prompt sent to Claude
→ Claude responds with cited documentation
```

### Frontier Model with Low Relevance
```
User: "What's the weather like?"
→ RAG retrieves chunks (similarity: 0.31 = low quality)
→ System prompt includes LOW RELEVANCE WARNING
→ Claude sees warning, responds: "I focus on Quilibrium..."
```

### Open-Source Model with Low Relevance
```
User: "What's the weather like?"
→ RAG retrieves chunks (similarity: 0.31 = low quality)
→ Model is open-source (not in INSTRUCTION_FOLLOWING_MODELS)
→ LLM bypassed entirely
→ Returns canned fallback response
```

## Known Limitations

- **Binary classification**: Models are either "instruction-following" or not; no granularity for partially capable models
- **Prefix-based detection**: Relies on provider prefixes in model IDs; custom or renamed models may be misclassified
- **Static threshold**: The 0.45 similarity threshold is hardcoded; may need tuning for different embedding models or content types

## Related Documentation

- [RAG Knowledge Base Workflow](rag-knowledge-base-workflow.md) - How documentation is ingested and retrieved
- [prompt.ts](src/lib/rag/prompt.ts) - System prompt construction
- [route.ts](app/api/chat/route.ts) - Chat API with model-specific logic

---

_Created: 2026-01-29_
