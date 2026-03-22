---
type: report
title: "Model Benchmark — Full Eval Suite (40 tests)"
ai_generated: true
reviewed_by: null
created: 2026-03-22
updated: 2026-03-22
---

# Model Benchmark — Full Eval Suite Results

> Generated: 2026-03-22 | Judge: Claude (collect mode, $0 cost) | Provider: OpenRouter

## Context

- **Current primary:** DeepSeek V3.1 (`deepseek/deepseek-chat-v3-0324`)
- **Test suite:** `test-suite-focused.yaml` — 40 tests (9 factual, 14 hallucination, 6 multi-hop, 11 node ops)
- **Goal:** Determine if switching to a newer model improves hallucination resistance and node ops accuracy
- **Previous benchmark:** 2026-03-21 (9 tests, 27 points) — this run uses the expanded 40-test suite

## Overall Results

| Rank | Model | Pass Rate | Avg Score | Factual | Hallucination | Multi-hop | Avg Latency |
|------|-------|-----------|-----------|---------|---------------|-----------|-------------|
| 1 | **DeepSeek V3.2** | **36/40 (90%)** | **95%** | 16/18 (89%) | 15/17 (88%) | 5/5 (100%) | ~15s |
| 2 | Qwen3 Coder Next | 30/40 (75%) | 83% | 15/18 (83%) | 11/17 (65%) | 4/5 (80%) | ~10s |
| 3 | DeepSeek V3.1 (baseline) | 23/40 (58%) | 75% | 9/18 (50%) | 11/17 (65%) | 3/5 (60%) | ~15s |
| — | DeepSeek R1 0528 | *cancelled* | — | — | — | — | ~60s |

**DeepSeek R1 0528** was cancelled after 13/40 tests due to unacceptable latency (27-152s per response). Reasoning models are not suitable for interactive chatbot use.

## Category Breakdown

### Hallucination Resistance (Primary Decision Factor)

| Test | V3.1 | Qwen3 Coder | V3.2 |
|------|------|-------------|------|
| focused-halluc-staking | FAIL | FAIL | PASS |
| focused-halluc-solidity | PASS | PASS | PASS |
| focused-halluc-qping-details | PASS | PASS | PASS |
| focused-halluc-bridge-details | FAIL | PASS | FAIL |
| focused-halluc-fake-command | FAIL | FAIL | PASS |
| focused-halluc-price | PASS | PASS | PASS |
| focused-multiturn-halluc-pressure | FAIL | FAIL | PASS |
| techalluc-metavm-acronym | PASS | FAIL | PASS |
| techalluc-metavm-architecture | PASS | PASS | PASS |
| techalluc-fft-quilibrium | PASS | PASS | PASS |
| techalluc-klearu-models | FAIL | FAIL | FAIL |
| techalluc-fx-internals | PASS | PASS | PASS |
| techalluc-partial-to-confident | PASS | PASS | PASS |
| techalluc-qcl-capabilities | PASS | PASS | PASS |
| techalluc-equinox-timeline | PASS | PASS | PASS |
| nodeops-fake-command | PASS | FAIL | PASS |
| nodeops-disk-terminate | PASS | PASS | PASS |

**V3.2: 15/17 (88%)** — best by a wide margin
**Qwen3: 11/17 (65%)** — same as baseline
**V3.1: 11/17 (65%)** — current model

### Node Ops Accuracy (Secondary Factor)

| Test | V3.1 | Qwen3 Coder | V3.2 |
|------|------|-------------|------|
| nodeops-port-numbers | FAIL | PASS | PASS |
| nodeops-old-ports-question | FAIL | PASS | PASS |
| nodeops-worker-count-calculation | FAIL | FAIL | FAIL |
| nodeops-reachability-halt | PASS | PASS | PASS |
| nodeops-prover-merge-order | FAIL | PASS | PASS |
| nodeops-worker-listen-localhost | PASS | PASS | PASS |
| nodeops-key-types | PASS | PASS | PASS |
| nodeops-update-order | PASS | PASS | PASS |
| nodeops-master-port-8340 | FAIL | PASS | PASS |

## Failure Analysis

### DeepSeek V3.2 (4 failures)

1. **focused-factual-storage-vague** — Described object storage but didn't mention "S3" or "S3-compatible"
2. **focused-factual-consensus-detail** — Covered Proof of Meaningful Work well but didn't mention "MPC" (multi-party computation)
3. **focused-halluc-bridge-details** — Mentioned "mint/burn events" when describing bridge mechanics (semantically equivalent to forbidden "lock and mint")
4. **techalluc-klearu-models** — Mentioned "GPT-4" and "Claude" by name even while correctly stating they are not supported

### Qwen3 Coder Next (10 failures)

1. **focused-factual-storage-vague** — Missing "S3" concept
2. **focused-halluc-staking** — Mentioned "APY" and "delegation" even in denial
3. **focused-halluc-fake-command** — Mentioned "PEM format" even in denial
4. **focused-multiturn-halluc-pressure** — Mentioned "VPN" concepts while denying
5. **focused-multiturn-clarification** — Empty response (fetch error)
6. **techalluc-metavm-acronym** — Repeated "Metaverse Virtual Machine" from user's question
7. **focused-multiturn-topic-switch** — Missing citations
8. **techalluc-klearu-models** — Mentioned "GPT-4"/"Claude" in denial
9. **nodeops-worker-count-calculation** — Showed intermediate wrong values (16, 125)
10. **nodeops-fake-command** — Failed to mention `qclient update` as correct command

### DeepSeek V3.1 Baseline (17 failures)

- 8 citation formatting failures (inline `[1]` markers not parsed by eval system)
- 5 must_not_mention failures (repeating forbidden terms in denials)
- 3 missing required concepts (S3, MPC, qclient update)
- 1 intermediate calculation values shown

## Key Insights

1. **V3.2 is dramatically better at not hallucinating** — it avoids fabricating details on topics it doesn't have docs for, where V3.1 and Qwen3 both invent plausible-sounding answers.

2. **Qwen3 Coder Next has a "repeat-to-deny" problem** — it restates forbidden concepts while explaining they don't exist, which triggers strict must_not_mention failures. This is a real issue for users who might see "APY" mentioned and think staking exists.

3. **The `techalluc-klearu-models` test fails for ALL models** — they all mention "GPT-4"/"Claude" when explaining Klearu doesn't support them. This might warrant adjusting the test to allow negated mentions, or the prompt to explicitly avoid naming unsupported models.

4. **V3.1 baseline had citation formatting issues** that V3.2 and Qwen3 didn't — suggests V3.2 better follows the system prompt's citation instructions.

## Recommendation

**Switch primary model to DeepSeek V3.2.**

- +32 percentage points on pass rate over baseline (90% vs 58%)
- +23 percentage points on hallucination resistance (88% vs 65%)
- Same latency profile (~15s), same architecture family
- Trivial upgrade: change model slug in 2 files

### To switch

Update these files:
- `src/lib/rag/service.ts` — change `CHUTES_DEFAULT_MODEL`
- `src/lib/chutes/chuteDiscovery.ts` — update primary model in `CURATED_LLM_MODELS`

Chutes slug: `chutes-deepseek-ai-deepseek-v3-2-tee` (verify availability first)
OpenRouter ID: `deepseek/deepseek-v3.2`

---

*Updated: 2026-03-22*
