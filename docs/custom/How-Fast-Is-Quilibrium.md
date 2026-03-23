---
title: "How Fast is Quilibrium?"
source: community
author: lamat1111 (Quilibrium Wiki)
date: 2025-02-05
type: community_analysis
topics:
  - performance
  - TPS
  - throughput
  - sharding
  - finalization
  - latency
  - RPM mixnet
---

> **Disclaimer**: This is community-contributed content and may not reflect official Quilibrium positions.

# How Fast is Quilibrium?

## Performance Metrics

The Quilibrium network demonstrates substantial throughput capacity:

- **Message throughput**: Tested to handle up to 100 million messages per second
- **Transaction estimates**: 1.5-2.5 million TPS depending on available nodes
- **Shard capacity**: Each shard processes approximately 6,000 TPS
- **Minimum global shards**: 256 shards

Performance scales proportionally as the network expands.

## Technical Innovation

Quilibrium distinguishes itself through its approach to transaction processing:

- **No traditional Merkle trees**: Processes conflict-free transactions in parallel
- **Parallel execution model**: Allows for significantly higher throughput
- **RPM mixnet**: Live transaction inclusion system that bypasses mempool delays

## Transaction Finalization Speed

| Condition | Time |
|-----------|------|
| **Lower bound** | 200 milliseconds |
| **Upper bound** | 10 seconds |

Variance depends on:
- Transaction complexity
- Node hardware specifications
- Network latency
- Connection quality

## Competitive Comparison

| Network | Finalization Time |
|---------|-------------------|
| Ethereum | 12-14 minutes |
| Solana | ~12.8 seconds |
| Kaspa | 1-10 seconds |
| **Quilibrium** | **200 ms - 10 s** |

## Throughput Calculation

With the sharded architecture:
- 256 shards minimum × 6,000 TPS per shard = **1,536,000 TPS baseline**
- Network expansion increases both shard count and throughput

Quilibrium's finalization window positions it as notably faster than established networks in optimal conditions, while the sharded architecture enables horizontal scaling beyond what single-chain networks can achieve.

---
*Source: [Quilibrium Wiki](https://github.com/lamat1111/Quilibrium_Wiki) - Last updated: 2025-02-05*
