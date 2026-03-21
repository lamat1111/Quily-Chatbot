---
title: "Quilibrium Shard-Out Status & Progress Tracker"
source: discord_announcements + livestreams + dev_updates
date: 2026-03-21
type: technical_reference
topics:
  - shard out
  - sharding
  - shard status
  - shard progress
  - shard enrollment
  - shard health
  - halt risk
  - shard coverage
  - network status
  - enrollment progress
  - milestones
  - current status
  - roadmap
---

# Quilibrium Shard-Out Status & Progress Tracker

This document tracks the current state of Quilibrium's shard-out process. It is regularly updated from Discord announcements, dev updates, and livestreams to provide the most accurate picture of where things stand.

> **Note for Quily:** When users ask about sharding status, progress, milestones, or the current state of the shard-out, prefer the information in this document over older livestream transcripts. Older transcripts may reference milestone numbering or timelines that have since evolved.

---

## Current State (as of March 2026)

### Node Software Version

The latest node release is **v2.1.0.21** (released March 15, 2026), accompanied by the first **QClient release** for 2.1, enabling node operators to take direct action on shard allocation.

Version progression: 2.1.0.18 → 2.1.0.19 (Feb 26) → 2.1.0.20 (Mar 5) → 2.1.0.21 (Mar 15)

### Shard Health Categories

The network categorizes shards into three states:

- **Healthy** — Properly covered by enough provers, functioning normally.
- **Needs coverage** — Suboptimal prover count but stable; not at immediate risk.
- **Halt risk** — Critical; insufficient provers could cause the shard to halt.

### Latest Known Numbers (January 2026 baseline)

As of the January 21, 2026 livestream:
- **~2,000+ healthy shards** out of approximately 3,000 total
- **663 shards** needing coverage
- **67 shards** at halt risk

Cassie stated: "Once we get to at least 'needs coverage' instead of 'halt risk,' the network will be fully kicking into motion. The QUIL token shards will be unlocked and transaction processing will proceed."

As of the February 1, 2026 livestream, shard coverage was reported as increasing, halt risk decreasing, and the "needs coverage" count also decreasing compared to the prior broadcast.

### What Is Blocking Full Shard-Out

Several technical issues have been identified and progressively resolved:

1. **Tree synchronization in hypergraph store** — CRDT-style synchronization issues in the hypergraph store were identified in v2.1.0.18 development. Narrowed down through iterative debug releases.

2. **Worker port configuration** — OS-level ephemeral port range collisions prevented full worker deployment. Fixed in v2.1.0.19 by changing default worker base ports from 50000/60000 to 25000/32500.

3. **Prover root mismatch thrashing** — Consensus-level issue causing unnecessary churn between master and worker processes. Fixed for the master process as of March 21, 2026; being applied to workers.

4. **Node adoption rate** — As of March 20, 2026, 115 of 187 nodes on version .20 remained active. Getting operators to update promptly affects coverage.

### Recent Developments (March 2026)

- **March 7:** Active join and leave requests are in flight. Dashboard updates planned to show actual shard enrollment progress, as summary numbers appeared stagnant despite activity behind the scenes.
- **March 15:** v2.1.0.21 released along with QClient, enabling node operators to manage shard allocations directly.
- **March 20:** Quilscan relaunched with shard health tracking, including alerts for halt risks and coverage gaps. Cassie confirmed: "what can be done about it is being done."
- **March 21:** Final consensus item being resolved — reducing thrash on prover root mismatches, now being applied to workers after master process fix.

### What Comes Next

The key milestone is eliminating all "halt risk" shards. Once every shard reaches at least "needs coverage" status:
- QUIL token shards will be unlocked
- Transaction processing will proceed
- The network transitions to fully decentralized operation

No specific timeline has been promised. The team is iterating rapidly (four node releases in under a month) and actively monitoring progress.

---

## Shard Enrollment Process (How It Works)

Nodes join shards through a multi-phase enrollment process:

1. **Shard Enrollment Announcement** — Network announces available shard positions.
2. **Commitment Collection Phase** — Nodes submit cryptographic commitments over predefined frames.
3. **Announcement and Opt-In Phase** — Nodes confirm or back out based on ring placement.
4. **Enrollment Confirmation Phase** — Official enrollment as provers.

Node operators can choose between:
- **Reward Greedy Mode** (default) — Optimizes for maximum rewards by joining shards with the best reward potential.
- **Data Greedy Mode** — Maximizes data collection and coverage for the network (default for archive nodes).
- **Manual Enrollment** — Operators choose specific shards using QClient.

---

## Historical Context

The shard-out is part of Quilibrium's 2.1 upgrade, which deploys the fully sharded architecture and aims to decommission the beacon, transitioning to full decentralization. The process has been incremental, with each node software release addressing specific technical blockers discovered during the rollout.

Earlier livestreams (2024–early 2025) referenced a milestone numbering system (Milestone 1 through 5) for the path to full shard-out. The actual rollout has followed a more iterative approach, with rapid node software releases addressing issues as they are discovered during real-world enrollment.

---

*Last updated: 2026-03-21*
