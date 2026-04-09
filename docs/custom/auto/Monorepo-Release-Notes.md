---
title: "Quilibrium Node Release Notes"
source: github.com/QuilibriumNetwork/monorepo (automated daily)
date: 2026-04-09
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

**Last updated:** April 9, 2026
**Source:** [Quilibrium Monorepo](https://github.com/QuilibriumNetwork/monorepo)

This document tracks changes in each Quilibrium node release.

## v2.1.0.22 (version .22) *(auto-generated)*
- improved prover commands and added worker id visibility
- relaxed peerstore clearing interval
- tuned component-level logging
- enhanced prover management TUI with manual tracking and worker id joins
- optimized TUI interface
- fixed dbscan compiler error
- added logging for shard allocation join/leave confirmations
- set default archive peer list
- fixed prover eviction bug
- improved prover visibility during implicit leave acceptance
- corrected prover leaving status in event distributor
- renamed pending status to joining
- fixed merge spend marker
- resolved TUI sorting and ring position issues
- adjusted render width for [M] marker
- improved timereel to accept new head immediately
- added timeout and lru cache to global frame fetch
- fixed ring position and membership set calculations
- corrected worker TUI reward calculations and logical shard count
- implemented auto-sized filters
- optimized shard join/leave logging
- fixed dynamic filter width
- improved blossomsub behavior and estimation calculations
- added migration to resolve eviction issue
- refactored global consensus engine into discrete components
- adjusted rpc/worker ring display

## v2.1.0.21 (version .21) *(auto-generated)*
- reconcile old and new config paths
- fix formatting and precision on prover reward data
- fix peering issue
- fix app shard lookups on mainnet

## v2.1.0.20 (version .20) *(auto-generated)*
- allow debug mode via environment variable
- fix pebbledb constructor configuration
- reduce cpu overhead in initial worker behaviors and sync
- improve docker build caching
- add node info metrics and command line querying
- skip proposals for overcrowded shards
- implement hub-and-spoke message broadcasting
- tweak cli output for join frames

## v2.1.0.19 (version .19) *(auto-generated)*
- fixed sync race conditions including prover registry pruning, seniority marker joins, and message size limits
- resolved signature failures and merge-related signature errors
- fixed various edge cases: one-shot sync sizing, app shard TC signatures, collector/hotstuff races, expired join blocking
- removed compatibility with old 2.0.0 blossomsub implementation
- resolved abandoned prover joins and stale worker proposals
- added pre-join sanity checks to identify bugs
- fixed rare SIGFPE and orphaned joins blocking worker reallocation
- improved peer connectivity with reconnect fallback and base peer count adjustment
- fixed expired prover joins, port ranges, stuck proposers, and seniority join issues
- resolved shutdown panics, libp2p peer selection, and coverage event checks
- improved worker registry refresh behavior during shutdown scenarios
- added worker allocation filter refreshes and fixed snapshot blocking on shutdown
- implemented forced shutdown timers and named workers for diagnostics
- switched to deterministic worker keys to prevent sybil attack false positives
- fixed pubsub lifecycle management and sync respawn blocking
- resolved blossomsub subscription tracking and nil panic on subscribe
- migrated from dnsaddr to dns4 addressing
- added quic-v1 support
- fixed hypergraph freeze after respawn and bitmask unsubscribe issues

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
- fixed peer discovery and connection stability issues
- improved blossomsub message handling efficiency
- optimized hypergraph sync performance
- resolved deadlock in peer manager during high load
- added validation for incoming channel messages
- reduced memory usage in pebble storage backend
- fixed edge case in proof verification logic
- improved error handling during network interruptions

---

*This document is auto-generated daily. Curated notes come from the monorepo RELEASE-NOTES file. Versions marked (auto-generated) are summarized from commit messages and may be less precise.*
