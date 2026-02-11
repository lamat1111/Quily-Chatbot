---
title: "Block Storage — Verifiable Delay Functions and Bloom Clocks"
source: official_docs_synthesis
date: 2026-02-11
type: technical_reference
topics:
  - VDF
  - verifiable delay function
  - bloom clock
  - time reel
  - block storage
  - consensus
  - frame production
  - difficulty adjustment
  - Wesolowski
  - Lamport clock
  - data storage proofs
---

# Block Storage: Verifiable Delay Functions and Bloom Clocks

Quilibrium's block storage layer uses two key cryptographic primitives to establish trustless ordering and causal consistency across a distributed network: **Verifiable Delay Functions (VDFs)** for provable time passage and **Bloom Clocks** for lightweight causal tracking. Together, they form the foundation of Quilibrium's frame-based consensus.

## What Is a Verifiable Delay Function?

A Verifiable Delay Function (VDF) is a cryptographic function that takes a prescribed number of sequential steps to compute, but whose output can be verified quickly. VDFs were formally introduced by Dan Boneh and others to solve the problem of cryptographically verifiable time in distributed systems.

### Core Properties

VDFs guarantee three essential properties:

1. **Non-parallelizability**: The computation is inherently sequential. No amount of parallel hardware can speed it up — each step depends on the previous step's output. This is unlike hash-based approaches where more hardware means faster computation.

2. **Succinct verifiability**: The proof that the computation was performed correctly is compact and can be verified much faster than it took to produce. In Quilibrium's case, verification is orders of magnitude faster than production.

3. **Determinism**: Given the same input and number of iterations, every honest evaluator produces the same output.

### How VDFs Work: Repeated Squaring

Most VDF constructions, including Quilibrium's, use **repeated squaring** in a special algebraic structure (class groups of imaginary quadratic fields):

```
Input: challenge value x, iteration count T

Step 1: y₁ = x²
Step 2: y₂ = y₁²
Step 3: y₃ = y₂²
  ...
Step T: yₜ = yₜ₋₁²

Output: (yₜ, proof π)
```

The key insight is that in the chosen number system (class groups), there is no shortcut to compute `x^(2^T)` without performing all T squarings sequentially. Yet a verifier can check the result with a compact proof.

### Quilibrium's VDF Implementation

Quilibrium uses the **Wesolowski VDF** construction, derived from Chia's implementation with enhanced parameters and modifications to the Fiat-Shamir transform addressing known vulnerabilities. The implementation is written in Rust (`crates/vdf/` and `crates/classgroup/`) and accessed from Go through CGO bindings.

Key characteristics:
- **CPU-bound**: The VDF is not parallelizable and cannot benefit from GPU acceleration. Mining in Quilibrium is fundamentally CPU-based.
- **Class group arithmetic**: Uses imaginary quadratic class groups, providing the algebraic structure needed for non-parallelizability and succinct proofs.
- **Audited lineage**: The underlying implementation carries audit history through Chia's security reviews, with Quilibrium's modifications to the Fiat-Shamir transform.

## The Time Reel: VDFs as Network Clocks

In Quilibrium, the VDF serves as a **Time Reel** — a cryptographically verifiable clock that provides temporal ordering for the entire network.

### VDF as a Lamport Clock

A Lamport clock (from distributed systems theory) sequences events across a distributed system using a logical counter. Traditional Lamport clocks require trusting that all participants report time honestly. Quilibrium replaces this trust requirement with a VDF: the Time Reel provides Lamport clock-style sequencing that is **cryptographically verifiable** rather than trust-based.

### Frame Production and Timing

The network operates in discrete time periods called **frames**, each approximately 10 seconds long:

```
Frame N:
  Input: previous frame output + challenge
  Process: T iterations of VDF squaring
  Output: (VDF output, VDF proof)
  Duration: ~10 seconds on median hardware
```

- The iteration count T (the "difficulty") is calibrated so that median network hardware takes roughly 10 seconds per frame.
- Difficulty started at approximately 10,000 iterations at network launch and has grown to around 160,000 iterations as hardware has improved.
- The next major generation step is projected at 100 million iterations.

### Difficulty Adjustment

Unlike Bitcoin where the fastest hardware wins, Quilibrium's difficulty adjustment targets the **median** machine:

- The network tracks iteration counts across all participants.
- Difficulty data is captured in the application state tree, rolled up to data shards, then to global shards.
- The difficulty is recalibrated to the median, meaning faster hardware provides no advantage — the VDF is purely a sequencing mechanism.
- Each shard has its own difficulty calibration because workers use different hardware (e.g., a Raspberry Pi could never compete at the global level).

### Randomness Beacon

The VDF output at each frame serves as an **unforgeable randomness beacon** for the network. Since the output cannot be predicted before the computation completes (due to non-parallelizability), it provides:

- **Leader selection**: Random, unpredictable selection of which prover proposes the next frame.
- **Challenge generation**: Random challenges for data storage proofs.
- **Shard assignment**: Randomized ordering for prover selection across shards.

## Data Storage Proofs with VDFs

VDFs play a critical role in proving that nodes actually store the data they claim to hold:

### The Proof Cycle

```
┌─────────────┐    VDF heartbeat    ┌──────────────────┐
│  Randomness  │ ─────────────────> │  Random challenge │
│    Beacon    │                     │   over data set   │
└─────────────┘                     └────────┬─────────┘
                                             │
                                    ┌────────▼─────────┐
                                    │  KZG proof over   │
                                    │  selected data    │
                                    │  (74 bytes)       │
                                    └────────┬─────────┘
                                             │
                                    ┌────────▼─────────┐
                                    │  Feed KZG proof   │
                                    │  through VDF step │
                                    └────────┬─────────┘
                                             │
                                    ┌────────▼─────────┐
                                    │  Emit VDF proof   │
                                    │  of data holding  │
                                    └──────────────────┘
```

1. Every VDF heartbeat, the randomness beacon issues a new challenge.
2. Provers use this challenge to randomly select portions of their stored data.
3. A **KZG commitment proof** (only 74 bytes) is generated over the selected data.
4. This KZG output is fed through the VDF step.
5. The resulting VDF proof demonstrates the prover has held the data for the claimed time period.

This cannot be cheated because:
- New proofs must be generated against new random challenges each frame.
- The prover must possess the actual data to generate valid KZG proofs.
- The VDF proves temporal continuity — the proof took the required time to produce.

## VDF Multi-Proofs in Consensus

In version 2.1, Quilibrium introduced **VDF multi-proofs** to ensure all shard participants actively contribute:

### The Problem

In each shard consensus round, one prover is the designated leader while others (up to 35 of 36) wait. Idle provers could potentially fake participation.

### The Solution

Non-leader provers generate a **VDF multi-proof** contribution:
- Each prover performs the same VDF computation as the leader.
- The output is concatenated with their vote signature.
- When votes are tallied into the quorum certificate, the combined VDF proof verifies that every participant actively computed — not just signed.

This leverages **quadratic imaginary integer algebra** to combine individual VDF proof contributions into a single combinatorial proof that is efficiently verifiable.

## Bloom Clocks: Causal Ordering

While VDFs provide global temporal ordering, **Bloom Clocks** provide efficient causal ordering — tracking which events happened before, after, or concurrently with other events.

### What Is a Bloom Clock?

A Bloom Clock is a probabilistic data structure that combines the properties of:
- **Vector clocks** (tracking causal relationships between events in distributed systems)
- **Bloom filters** (compact probabilistic set membership testing)

### Purpose in Quilibrium

In a sharded distributed system like Quilibrium, different shards process events independently. Bloom Clocks provide a compact way to:

1. **Track causality**: Determine whether event A happened before event B, or if they were concurrent.
2. **Detect conflicts**: Identify when two shards have made conflicting updates that need resolution.
3. **Merge state**: When combining state from multiple shards, Bloom Clocks indicate which state is newer or if a merge is required.

### How Bloom Clocks Work

A Bloom Clock maintains a fixed-size array of counters. When an event occurs:

```
Event at node i:
  1. Hash the event identifier to k positions in the array
  2. Increment each of those k positions

Comparison:
  Clock A ≤ Clock B if every counter in A ≤ corresponding counter in B
  (meaning all events in A happened before or at the same time as B)

  If neither A ≤ B nor B ≤ A, the events are concurrent.
```

### Advantages Over Traditional Vector Clocks

- **Fixed size**: Unlike vector clocks that grow with the number of nodes, Bloom Clocks maintain a fixed-size array regardless of network size.
- **Compact**: Suitable for a large-scale sharded network where transmitting full vector clocks would be prohibitively expensive.
- **Probabilistic**: Small false-positive rate for causality detection, but no false negatives for concurrent event detection.

### Relationship to VDFs

Bloom Clocks and VDFs serve complementary roles:

| Aspect | VDF (Time Reel) | Bloom Clock |
|--------|-----------------|-------------|
| **Scope** | Global temporal ordering | Local causal ordering |
| **Granularity** | Frame-level (~10 seconds) | Event-level |
| **Guarantees** | Cryptographic time proof | Probabilistic causality |
| **Used for** | Frame production, difficulty, randomness | State merging, conflict detection |
| **Scale** | Network-wide | Per-shard or per-component |

Together, the VDF provides the coarse-grained global heartbeat while Bloom Clocks provide fine-grained causal tracking within and between shards.

## Integration with Consensus

### Frame-Based Architecture

The complete flow integrating VDFs and Bloom Clocks:

```
┌──────────────────────────────────────────────────────┐
│                   Global Consensus                    │
│                                                      │
│  Time Reel (VDF) ──> Frame N ──> Frame N+1 ──> ...  │
│       │                  │                           │
│       ▼                  ▼                           │
│  Randomness         Global Frame                     │
│  Beacon             Commitments                      │
└──────────┬───────────────┬───────────────────────────┘
           │               │
    ┌──────▼──────┐ ┌──────▼──────┐
    │   Shard A   │ │   Shard B   │
    │             │ │             │
    │ Bloom Clock │ │ Bloom Clock │
    │ tracks      │ │ tracks      │
    │ local       │ │ local       │
    │ causality   │ │ causality   │
    │             │ │             │
    │ VDF storage │ │ VDF storage │
    │ proofs      │ │ proofs      │
    └─────────────┘ └─────────────┘
```

1. The **Time Reel VDF** produces frames at regular intervals, providing global ordering and randomness.
2. Each **shard** maintains its own Bloom Clock for tracking causal relationships between events within the shard.
3. **Storage proofs** use VDF-derived challenges to continuously verify data holding.
4. **Frame consensus** combines VDF proofs (temporal) with KZG commitments (state) to finalize each frame.

### State Transitions

Each frame represents a deterministic state transition:

```
State(N) + Transactions(frame_N) = State(N+1)
```

The VDF ensures this transition took the required time (preventing time manipulation), while Bloom Clocks ensure events within the frame are causally consistent.

## Frequently Asked Questions

**Q: Why not use proof-of-work hashing like Bitcoin?**
A: Hash-based PoW rewards the fastest hardware and wastes energy on arbitrary computation. VDFs are non-parallelizable (faster hardware doesn't help beyond median calibration) and provide useful outputs: verifiable time proofs, randomness, and storage verification.

**Q: Can GPUs accelerate VDF computation?**
A: No. The Wesolowski VDF on class groups cannot be executed faster on GPUs than on CPUs. Mining in Quilibrium is fundamentally CPU-based, as demonstrated by mining pool operators who use CPU clusters rather than GPU rigs.

**Q: How does difficulty compare to Bitcoin's difficulty?**
A: Bitcoin adjusts difficulty based on the fastest miners (hash rate). Quilibrium targets the median machine, so faster hardware provides no advantage. The VDF is a sequencing mechanism, not a competitive race.

**Q: What happens if a prover's hardware is too slow?**
A: Provers with hardware below the median difficulty may fail to produce frames within the expected interval. This counts against their seniority score and can eventually lead to removal from the prover set.

**Q: Are Bloom Clocks related to Bloom filters?**
A: Yes. Bloom Clocks extend the concept of Bloom filters (probabilistic set membership) into the domain of vector clocks (causal ordering). They provide compact, probabilistic causality tracking suitable for large-scale distributed systems.

**Q: What is the "Time Reel" in the codebase?**
A: The Time Reel is the software component that manages VDF computation, frame writing to the store, and fork choice (selecting the canonical chain of frames). It is the mechanism through which the VDF clock drives consensus.

## What VDFs and Bloom Clocks Cannot Do

- **VDFs cannot guarantee wall-clock time**: They guarantee a minimum number of sequential computation steps, not actual seconds. The relationship between iterations and seconds depends on hardware.
- **Bloom Clocks have false positives**: They may occasionally report a causal relationship where none exists (but never miss a true concurrency).
- **Neither replaces Byzantine consensus**: VDFs and Bloom Clocks provide ordering and timing primitives that feed into the BFT consensus mechanism — they do not replace it.
- **VDFs do not prove computation correctness**: They prove time spent, not that the computation result is correct. Correctness is ensured by the consensus and verification layers.
