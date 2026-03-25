---
title: "Quilibrium Node Release Notes"
source: github.com/QuilibriumNetwork/monorepo (automated daily)
date: 2026-03-25
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

**Last updated:** March 25, 2026
**Source:** [Quilibrium Monorepo](https://github.com/QuilibriumNetwork/monorepo)

This document tracks changes in each Quilibrium node release.

## v2.1.0.21 (version .21) *(auto-generated)*
- resolved feedback reconciliation between old and new config paths
- fixed formatting and precision issues in prover reward data
- fixed app shard lookups on mainnet
- improved peering stability

## v2.1.0.20 (version .20) *(auto-generated)*
- fixed high CPU overhead in initial worker behaviors and ongoing sync
- added debug environment variable support
- fixed pebbleDB constructor config parameter
- optimized docker builds with better caching
- added node info metrics and command line query support
- implemented automatic leave proposals for overcrowded shards
- added hub-and-spoke global message broadcast system
- improved CLI output formatting for join frames

## v2.1.0.19 (version .19) *(auto-generated)*
- fixed sync race conditions with prover registry pruning and worker allocation
- resolved signature failures and merge-related signature issues
- adjusted sync message size limits and app shard TC signature sizes
- removed compatibility with old 2.0.0 blossomsub implementation
- fixed abandoned prover joins and stale worker proposals
- added pre-join sanity checks to identify bugs
- resolved rare SIGFPE and orphan expired join blocking issues
- improved peer discovery with reconnect fallback and updated base peer count
- fixed expired prover join frames, port ranges, and stuck proposers
- addressed shutdown issues including panic, hanging reloads, and coverage checks
- optimized worker manager with registry refreshes and snapshot handling
- implemented deterministic worker keys to prevent sybil attack false positives
- fixed blossomsub subscription issues and pubsub lifecycle management
- switched from dnsaddr to dns4 for peer addressing
- restored proper respawn logic and fixed frozen hypergraph state
- added missing quic-v1 support and improved shutdown tracing

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
- fixed blossomsub peer discovery and connection handling
- improved peer scoring metrics for blossomsub
- optimized hypergraph sync performance
- added validation for DAG certificate chains
- reduced memory usage in pebble storage layer
- fixed deadlock in peer manager during shutdown
- improved error handling for invalid peer messages
- optimized bloom filter usage for peer state sync

---

*This document is auto-generated daily. Curated notes come from the monorepo RELEASE-NOTES file. Versions marked (auto-generated) are summarized from commit messages and may be less precise.*
