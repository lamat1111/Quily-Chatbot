---
title: "Klearu: E2EE ML Primitives and Runtime"
source: github_readme + discord
author: Cassandra Heart
date: 2025-03-02
type: technical_reference
topics:
  - Klearu
  - private inference
  - two-party computation
  - 2PC
  - SLIDE
  - LLM
  - machine learning
  - E2EE
  - CPU inference
  - quantization
  - distributed inference
  - MPC
  - FHE
  - privacy
---

# Klearu: E2EE ML Primitives and Runtime

Klearu is a Rust implementation of the SLIDE paper family (Sub-LInear Deep learning Engine), extended with support for large language model inference, transformer sparsity optimization, and secure two-party computation (2PC). It is open-source under AGPL-3.0 with additional non-commercial terms, licensed exclusively for use on the Quilibrium mainnet for commercial deployments.

GitHub: [QuilibriumNetwork/klearu](https://github.com/QuilibriumNetwork/klearu)

---

## What Is Klearu?

Klearu enables **end-to-end encrypted (E2EE) ML inference** — meaning a user can run AI inference on remote nodes without the node learning anything about the user's inputs or outputs. This is fundamentally different from how AI services work today.

> "If you want llama to be 'private', you'd have to also control the server. What I mean is that Klearu can be on nodes, remote from the users, and can still do inference, but the data is not revealed to the evaluating node." — Cassie

---

## Why Not Just Use a TEE or FHE?

There are two competing privacy approaches in the AI industry today, both with significant limitations:

### Trusted Execution Environments (TEEs)
Many AI companies claim "private inference" via TEEs (e.g., secure enclaves). As Cassie put it:

> "Whenever someone says their AI is private, and they actually mean they're using a TEE, they're saying 'we super pinky swear we aren't looking inside the box.'"

TEEs are trust-based — you're trusting the hardware manufacturer and operator not to inspect the enclave.

### Fully Homomorphic Encryption (FHE)
FHE allows computation on fully encrypted data without ever decrypting, but:

> "FHE is still years out there — not to mention that one particular company has decided to patent-swarm it." — Cassie

FHE is computationally impractical for LLM inference at this stage.

### Klearu's Approach: Two-Party Computation (2PC)
Klearu uses a **2PC protocol** between client and server:

> "The trick here is that the client is interacting with the server in a 2PC protocol. With a 2PC-driven approach, a TEE isn't required — and it's way faster than FHE." — Cassie

The output is effectively encrypted in memory during inference. The evaluating node cannot observe the inputs or outputs.

---

## Performance

Klearu is CPU-native — it does not require GPUs:

> "Faster than llama for base runtime. With lower security mode, roughly as fast. With high security mode, slightly slower. But we haven't done a massive perf grind and there's lots of room on the table." — Cassie

Performance characteristics:
- **Lower security mode**: ~4.6 KB communication per token, comparable speed to llama.cpp CPU-only
- **High security mode**: ~2 MB/token, slightly slower but stronger privacy guarantees
- Speedups depend on: **model size, CPU model, L1/L2/L3 cache sizes, core count, and RAM speed**

> "Klearu makes this fast enough to be comparable in some cases." — Cassie

Benchmarking against llama.cpp has been flagged as a community task.

---

## Model Support and Size

Klearu currently ships examples with LLaMA-compatible models (SmolLM up to 1.7B in the README), but is not limited to small models:

> "You can run 7B+." — Cassie

> "There isn't a limit on size — you're just dealing with time to complete at that point, and by extension, increased cost to run." — Agent 002 (confirmed by context)

Models must be in HuggingFace's LLaMA architecture using safetensors format.

---

## Quantization and Sparsity

Klearu has built-in support for both:

> "We have built-in quantization, and also some heavy optimizations for sparseness." — Cassie

**Sparsity prediction** (via the `klearu-dejavu` crate) identifies which transformer components (attention heads, FFN layers) matter per token, allowing the system to skip unnecessary computation — reducing inference cost without sacrificing accuracy.

Hardware acceleration uses **AVX2/NEON SIMD with BF16 quantization** for CPU efficiency.

---

## Distributed Inference

Multiple nodes can collaborate on inference:

> "Distributed inference is definitely possible." — Cassie

> "Chaining primitives together is possible." — Cassie

Cost is the same as regular Quilibrium compute, based on **Oblivious Transfers (OTs)**.

---

## Licensing

Klearu is licensed under **AGPL-3.0 with additional terms**:
- Commercial use is restricted to the **Quilibrium mainnet**
- Automated reimplementation for competing commercial products is prohibited
- The license is intentionally non-permissive toward VCs and competitors

> "Went with AGPL + non-commercial outside of Q mainnet for now." — Cassie

---

## Crate Architecture (10-Crate Workspace)

| Crate | Purpose |
|-------|---------|
| `klearu-core` | LSH hash families, sparse tensors, SLIDE network training |
| `klearu-accel` | Platform-adaptive SIMD (AVX2/NEON) with BF16 quantization |
| `klearu-mongoose` | Trainable hash functions with adaptive rebuild scheduling |
| `klearu-bolt` | Automatic LSH hyperparameter tuning for target recall |
| `klearu-dejavu` | Transformer sparsity prediction (attention and FFN) |
| `klearu-llm` | LLaMA-compatible inference with GQA, RoPE, and RMSNorm |
| `klearu-dpf` | AES-based Distributed Point Functions for MPC protocols |
| `klearu-mpc` | Two-party computation with fixed-point arithmetic and Beaver triples |
| `klearu-private` | End-to-end private inference via Ferret OT and OPRF |

---

## Getting Started

The README includes a simple guide. For the Quilibrium monorepo, check out the `develop` branch:

```bash
git checkout develop
```

Binaries are included for:
- Interactive chat
- Model diagnostics
- Sparse inference calibration
- Private client-server inference

---

*Last updated: 2026-03-02*
