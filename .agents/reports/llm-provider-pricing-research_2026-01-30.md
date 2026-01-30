---
type: doc
title: "LLM Provider Pricing Research"
status: done
ai_generated: true
reviewed_by: null
created: 2026-01-30
updated: 2026-01-30
related_docs:
  - "model-specific-instruction-handling.md"
related_tasks: []
---

# LLM Provider Pricing Research

> **⚠️ AI-Generated**: May contain errors. Verify before use.

## Overview

This document captures research into LLM API pricing for the providers and models used by Quily Chat. The goal was to provide users with accurate cost estimates to help them understand what to expect when using the chatbot.

## Current Configuration

### Recommended Model
- **Model**: DeepSeek V3
- **Model ID**: `deepseek/deepseek-chat`
- **Reason**: Best open-source quality with excellent reasoning and accuracy at low cost

### Recommended Provider
- **Provider**: Chutes (marked as `isRecommended: true` in codebase)
- **Alternative**: OpenRouter

## Key Finding: OpenRouter Routes Through Chutes

An important discovery from this research: **OpenRouter's `deepseek/deepseek-chat` model routes exclusively through Chutes** as of January 2026. This means:

- Users selecting OpenRouter with DeepSeek V3 are effectively using Chutes infrastructure
- Both providers have the **same pricing** for this model
- This may change in the future if OpenRouter adds more providers for this model

Source: [OpenRouter DeepSeek V3 Providers](https://openrouter.ai/deepseek/deepseek-chat/providers)

## Pricing Data (January 2026)

### DeepSeek V3 (`deepseek/deepseek-chat`)

| Provider | Input (per 1M tokens) | Output (per 1M tokens) | Notes |
|----------|----------------------|------------------------|-------|
| **Chutes** | $0.30 | $1.20 | Via OpenRouter or direct |
| **OpenRouter** | $0.30 | $1.20 | Routes through Chutes |

### Alternative DeepSeek Models on OpenRouter

| Model | Provider | Input/1M | Output/1M | Notes |
|-------|----------|----------|-----------|-------|
| DeepSeek V3 0324 | Chutes | $0.19 | $0.87 | Older version |
| DeepSeek V3.1 | SambaNova | $0.15 | $0.75 | Different provider available |
| DeepSeek V3.2 | DeepInfra | $0.26 | $0.38 | Cheaper output |

### DeepSeek Direct API (for reference)

| Model | Input/1M | Output/1M | Cache Hit Input/1M |
|-------|----------|-----------|-------------------|
| DeepSeek V3.2 | $0.28 | $0.42 | $0.028 |

Source: [DeepSeek API Pricing](https://api-docs.deepseek.com/quick_start/pricing)

## User Cost Estimates

### Assumptions

Based on typical chatbot usage patterns:
- **Average input tokens per question**: ~100 tokens (user question + system context)
- **Average output tokens per response**: ~500 tokens
- **Total per conversation turn**: ~600 tokens

### Cost Per Question

Using Chutes/OpenRouter pricing for DeepSeek V3:
- Input: 100 tokens × $0.30/1M = $0.00003
- Output: 500 tokens × $1.20/1M = $0.0006
- **Total per question: ~$0.0006 (rounded to $0.001)**

### Monthly Cost Projections

| Usage Level | Questions/Day | Monthly Questions | Monthly Cost |
|-------------|---------------|-------------------|--------------|
| Light | 5 | 150 | ~$0.10 |
| Casual | 10 | 300 | ~$0.20 |
| Moderate | 25 | 750 | ~$0.50 |
| Heavy | 50 | 1,500 | ~$1.00 |
| Power User | 100 | 3,000 | ~$2.00 |

## Implementation

Based on this research, a cost estimate was added to the Provider Setup page:

**Location**: `src/components/chat/ProviderSetup.tsx`

**Message shown to users**:
> "Estimated cost: About $0.001 per question"

### Design Decisions

1. **Placement**: Below provider selection cards, visible before users commit to setup
2. **Style**: Subtle muted text (`text-xs text-gray-500`) - informative but not prominent
3. **Scope**: Only shown on initial setup page, not in Settings (since users can change models in Settings, and costs vary by model)
4. **Simplicity**: Single per-question cost rather than complex ranges - easier to understand at a glance

## Caveats and Limitations

1. **Provider routing may change**: OpenRouter could add more providers for DeepSeek V3 with different pricing
2. **Model updates**: DeepSeek releases new versions; pricing may change
3. **Token estimates are approximate**: Actual usage varies based on question complexity and response length
4. **Cache hits not factored**: DeepSeek's direct API offers 90% discount on cache hits, but this doesn't apply via Chutes/OpenRouter
5. **Only covers recommended model**: Users selecting Claude, GPT-4o, or other models will have significantly higher costs

## Future Considerations

- Consider adding dynamic pricing display based on selected model
- Monitor for OpenRouter adding cheaper providers for DeepSeek
- Update estimates if Chutes pricing changes
- Consider adding a "cost so far" indicator in the chat interface

## Sources

- [OpenRouter DeepSeek V3](https://openrouter.ai/deepseek/deepseek-chat)
- [OpenRouter Provider Routing Docs](https://openrouter.ai/docs/guides/routing/provider-selection)
- [DeepSeek API Pricing](https://api-docs.deepseek.com/quick_start/pricing)
- [DeepInfra DeepSeek Models](https://deepinfra.com/deepseek)
- [Price Per Token Comparison](https://pricepertoken.com/)

---

_Created: 2026-01-30_
_Updated: 2026-01-30_
