---
title: "Quilibrium Node Release Notes"
source: github.com/QuilibriumNetwork/monorepo (automated daily)
date: 2026-04-12
type: release_notes
topics:
  - release notes
  - changelog
  - version
  - update
  - what changed
  - bug fix
  - new feature
  - node update
---

# Quilibrium Node Release Notes

**Last updated:** April 12, 2026
**Source:** [Quilibrium Monorepo](https://github.com/QuilibriumNetwork/monorepo)

This document tracks changes in each Quilibrium node release.

## v2.1.0.22 (version .22) *(auto-generated)*
- improved prover commands and worker ID visibility
- relaxed peerstore clearing interval
- tuned component-level logging
- enhanced prover management TUI with manual tracking and worker ID joins
- optimized TUI interface and rendering
- fixed prover eviction and leaving status bugs
- renamed "pending" state to "joining" for clarity
- resolved merge and sorting issues in TUI
- fixed timereel behavior to accept new head immediately
- added timeouts and LRU cache for global frame fetching
- adjusted ring position and membership set calculations
- fixed worker TUI reward calculations and logical shard counts
- implemented auto-sized filters and fixed dynamic filter width
- optimized logging for shard join/leave operations
- improved blossomsub behavior and estimation calculations
- added migrations to resolve eviction issues
- refactored global consensus engine into discrete components
- adjusted RPC/worker ring display

## v2.1.0.21 (version .21) *(auto-generated)*
- resolved feedback reconciliation between old and new config paths
- fixed prover reward data formatting and precision
- addressed potential peering issue
- fixed app shard lookups on mainnet

## v2.1.0.20 (version .20) *(auto-generated)*
- fixed high CPU overhead in initial worker behaviors and ongoing sync
- added debug environment variable support
- fixed pebbleDB constructor config parameter
- improved docker build caching
- added node info metrics and command line query support
- implemented leave proposals for overcrowded shards
- added hub-and-spoke global message broadcasts
- improved CLI output for join frames

## v2.1.0.19 (version .19) *(auto-generated)*
- fixed sync message size limits and seniority marker join blocker
- resolved signature failures and merge-related signature issues
- fixed one-shot sync message size, app shard TC signature size, and collector/hotstuff race condition
- prevented expired joins from blocking new joins due to pruning disable
- removed compatibility with old 2.0.0 blossomsub
- resolved abandoned prover joins and stale worker proposal edge
- added full sanity check on join submissions
- fixed rare SIGFPE and orphan expired joins blocking worker reallocation
- added reconnect fallback with variable timing when no peers are found
- updated base peer count to 1
- fixed expired prover join frames, port ranges, stuck proposers, and seniority on joins
- resolved shutdown panics, libp2p discovery picking inaccessible peers, and coverage event checks
- fixed worker behavior to mirror global prover root reconciliation
- addressed shutdown quirks and reload hanging
- forced registry refresh on waiting workers
- fixed worker manager filter refresh and snapshot blocking on shutdown
- added forced shutdown after five seconds for app workers
- prevented shutdown loops and added named workers for tracing
- used deterministic keys for worker peer IDs to prevent sybil attack flags
- removed pubsub stop from app consensus engine and integrated shutdown context for syncs
- fixed blossomsub subscription tracking and nil panic on subscribe
- switched from dnsaddr to dns4 and added quic-v1
- restored proper respawn logic and fixed frozen hypergraph post-respawn
- fixed missing bitmask unsubscriptions

## v2.1.0.18 (version .18)
- resolve transaction missing from certain tree methods
- resolve tree deletion corruption
- resolve seniority bug
- added DKLs23 fork
- fixed channel bug
- added raw bytestream to ferret
- added challenge derivation for ed448 in FROST
- fixed race condition in global intrinsic
- other smaller bug fixes

## v2.1.0.17 (version .17)
- resolve sync race condition with prover registry pruning
- update hypergraph to directly manage raw deletions
- migration to resolve records issue from above
- resolve early snapshot termination issue
- global halts are now just halts on processing non-global ops

## v2.1.0.16 (version .16)
- build_utils – static code analysis checker for underlying slice assignment
- hypergraph snapshot manager now uses in memory snapshot instead of pebble snapshot
- hypersync can delete orphaned entries
- signature aggregation wrapper for app shards no longer expects proposer to have a proof (the proof is already in the frame)
- hook events on sync for app shards
- app shards properly sync global prover info
- coverage streaks/halt events now trigger on app shards
- peer info and key registry handlers on app shard level
- updated to pebble v2
- pebble v2 upgrade handler
- archive mode memory bug fix
- subtle underlying slice mutation bug fix

## v2.1.0.15 (version .15)
- Adds direct db sync mode for hypersync
- Removes blackhole detection entirely
- Enforces reachability check with new approach
- Resolves start/stop issue

## v2.1.0.14 (version .14)
- Resolves race condition around QC processing
- Remove noisy sync logs
- Skip unnecessary prover check for global prover info
- Fix issue with 100+ rejections/confirmations
- Resolve sync panic

## v2.1.0.13 (version .13)
- Extends ProverConfirm and ProverReject to have multiple filters per message
- Adds snapshot integration to allow hypersync to occur concurrently with writes
- Resolved infinitessimal rings divide-by-zero error

## v2.1.0.11 (version .11) *(auto-generated)*
- fixed blossomsub peer discovery race condition
- improved peer scoring metrics for blossomsub
- optimized hypergraph sync performance
- added validation for DKLs23 proofs
- reduced memory usage in pebble storage layer
- fixed channel buffer overflow in network stack
- improved error handling for invalid peer connections
- resolved edge case in prover registry cleanup

---

*This document is auto-generated daily. Curated notes come from the monorepo RELEASE-NOTES file. Versions marked (auto-generated) are summarized from commit messages and may be less precise.*
