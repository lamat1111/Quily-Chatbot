---
title: "Quilibrium Node Release Notes"
source: github.com/QuilibriumNetwork/monorepo (automated daily)
date: 2026-04-05
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

**Last updated:** April 5, 2026
**Source:** [Quilibrium Monorepo](https://github.com/QuilibriumNetwork/monorepo)

This document tracks changes in each Quilibrium node release.

## v2.1.0.21 (version .21) *(auto-generated)*
- resolved feedback reconciliation between old and new config paths
- fixed formatting and precision issues in prover reward data
- improved peering stability
- fixed app shard lookups on mainnet

## v2.1.0.20 (version .20) *(auto-generated)*
- fixed high CPU overhead in initial worker behaviors and ongoing sync
- added debug environment variable support
- fixed pebbledb constructor config parameter
- improved docker build caching for faster builds
- added extra node info data and command line metrics query
- implemented hub-and-spoke global message broadcasts
- added automatic leave proposals for overcrowded shards
- tweaked CLI output formatting for join frames

## v2.1.0.19 (version .19) *(auto-generated)*
- fixed sync race conditions including prover registry pruning, worker allocation, and blossomsub message size limits
- resolved signature failures and merge-related signature errors
- fixed various edge cases in worker management including stale proposals, expired joins, and shutdown scenarios
- improved peer discovery and connection handling with dns4 support and reconnect fallback
- optimized shutdown logic to prevent hangs and added tracing for worker states
- removed compatibility with old blossomsub protocol versions
- fixed hypergraph freezing after respawn and improved respawn reliability
- added sanity checks for prover joins and refreshed registry states
- resolved rare SIGFPE and orphaned join frame issues
- adjusted app worker behavior to match global worker patterns
- added deterministic worker keys to prevent false sybil attack detection
- fixed pubsub subscription tracking and nil panic scenarios

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
- reduced memory usage in pebble storage layer
- added validation for DAG sync requests
- fixed channel buffer overflow in network transport
- improved error handling for prover registry operations
- resolved edge case in peer connection handshake
- optimized bloom filter usage in content routing

---

*This document is auto-generated daily. Curated notes come from the monorepo RELEASE-NOTES file. Versions marked (auto-generated) are summarized from commit messages and may be less precise.*
