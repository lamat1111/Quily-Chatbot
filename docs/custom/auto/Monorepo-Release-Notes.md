---
title: "Quilibrium Node Release Notes"
source: github.com/QuilibriumNetwork/monorepo (automated daily)
date: 2026-03-30
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

**Last updated:** March 30, 2026
**Source:** [Quilibrium Monorepo](https://github.com/QuilibriumNetwork/monorepo)

This document tracks changes in each Quilibrium node release.

## v2.1.0.21 (version .21) *(auto-generated)*
- reconcile old and new config paths
- fix prover reward data formatting and precision
- resolve peering issue
- fix app shard lookups on mainnet

## v2.1.0.20 (version .20) *(auto-generated)*
- allow debug mode via environment variable
- fix pebbledb constructor configuration parameter
- reduce cpu overhead in initial worker behaviors and sync
- optimize docker builds with better caching
- add extra node info data and command line metrics query
- implement leave proposals for overcrowded shards
- enable hub-and-spoke global message broadcasts
- improve cli output for join frames

## v2.1.0.19 (version .19) *(auto-generated)*
- fixed sync race conditions with prover registry pruning and worker allocation
- resolved signature failures and merge-related signature issues
- adjusted sync message size limits and app shard TC signature size
- fixed collector/hotstuff race condition and expired joins blocking new joins
- removed compatibility with old 2.0.0 blossomsub implementation
- resolved abandoned prover joins and stale worker proposal edges
- added pre-join sanity checks to identify bugs
- fixed rare SIGFPE and orphan expired joins blocking worker reallocation
- improved peer discovery with reconnect fallback and updated base peer count
- fixed expired prover join frames, port ranges, and stuck proposers
- resolved shutdown panics and libp2p discovery picking inaccessible peers
- fixed coverage event checks during shutdown and worker behavior alignment
- improved registry refresh logic during worker allocation
- added worker shutdown safeguards with forced timeout after five seconds
- implemented deterministic worker keys to prevent sybil attack flags
- fixed blossomsub pubsub lifecycle management and subscription issues
- switched from dnsaddr to dns4 for blossomsub and added quic-v1 support
- restored proper respawn logic and fixed frozen hypergraph after respawn

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
- fixed panic in peer manager when peer count drops below minimum threshold
- improved peer selection logic to prioritize stable connections
- optimized peer scoring algorithm for blossomsub
- reduced memory usage in hypergraph state management
- fixed edge case in DKLs23 fork validation
- improved error handling for invalid peer certificates
- resolved race condition in channel message processing
- optimized bloom filter usage in peer discovery
- fixed deadlock in pebble storage during high write loads
- improved cleanup of stale peer connections

---

*This document is auto-generated daily. Curated notes come from the monorepo RELEASE-NOTES file. Versions marked (auto-generated) are summarized from commit messages and may be less precise.*
