---
title: "Q vs ETH vs SOL"
source: community
author: lamat1111 (Quilibrium Wiki)
date: 2025-02-05
type: community_analysis
topics:
  - comparison
  - Ethereum
  - Solana
  - architecture
  - TPS
  - performance
  - EVM
  - consensus
---

> **Disclaimer**: This is community-contributed content and may not reflect official Quilibrium positions.

# Q vs ETH vs SOL

This document compares Quilibrium, Ethereum 2.0, and Solana across technical specifications. Quilibrium operates as a novel decentralized system that differs from traditional blockchains in both architecture and performance.

## Key Specifications Comparison

### Quilibrium

- **Clock speed**: 54M OTs/s per core
- **Architecture**: SMP Multicore (up to ~10^98 cores theoretical)
- **Execution model**: Garbled circuits for secure computation
- **Storage**: RAID6-like with theoretical capacity of 1.8765 × 10^107B

### Ethereum 2.0

- **Clock speed**: ~650kHz
- **Architecture**: Stack-based EVM bytecode execution
- **Storage**: ~1TB for full transaction history
- **In-network retention**: ~100GB (18 days)

### Solana

- **Clock speed**: ~106MHz
- **Architecture**: Event-driven eBPF execution model
- **Storage**: ~100GB pruned history requirement
- **Consensus**: Proof-of-History mechanism

## Main Distinctions

Quilibrium's focus on secure, high-performance computing scales across an extensive number of cores, contrasting sharply with the sequential, single-instruction approaches of competing systems.

| Aspect | Quilibrium | Ethereum | Solana |
|--------|------------|----------|--------|
| **Primary Focus** | Distributed secure MPC | Flexibility & smart contracts | Throughput |
| **Execution** | Parallel garbled circuits | Sequential EVM | Event-driven eBPF |
| **Scaling** | Native multicore sharding | L2 solutions | Single chain |

While Ethereum prioritizes flexibility and Solana emphasizes throughput, Quilibrium introduces a design paradigm that prioritizes distributed, secure, and efficient multi-party computation.

---
*Source: [Quilibrium Wiki](https://github.com/lamat1111/Quilibrium_Wiki) - Last updated: 2025-02-05*
