---
title: "Quilibrium Node Release Notes"
source: github.com/QuilibriumNetwork/monorepo (automated daily)
date: 2026-04-08
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

**Last updated:** April 8, 2026
**Source:** [Quilibrium Monorepo](https://github.com/QuilibriumNetwork/monorepo)

This document tracks changes in each Quilibrium node release.

## v2.1.0.22 (version .22) *(auto-generated)*
- improved prover commands and added worker id visibility
- relaxed peerstore clearing interval
- tuned component-level logging
- enhanced prover management TUI with manual tracking and worker id joins
- optimized TUI rendering and interaction
- fixed prover eviction and leaving status bugs
- renamed pending state to joining for clarity
- fixed merge spend marker and timereel head acceptance
- added timeouts and LRU cache for global frame fetching
- improved ring position and membership set calculations
- adjusted worker TUI reward calculations and reduced bandwidth
- implemented auto-sized filters and fixed dynamic filter width
- optimized logging for shard join/leave operations
- improved blossomsub behavior and estimation calculations
- added migrations to resolve eviction issues
- refactored global consensus engine into discrete components
- adjusted RPC/worker ring display

## v2.1.0.21 (version .21) *(auto-generated)*
- reconciled old and new config paths
- fixed formatting and precision on prover reward data
- improved peering stability
- fixed app shard lookups on mainnet

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
- enhanced error logging and debugging
- fixed sync message size limit defaults
- resolved signature failure edge cases
- added more error logging for merge-related signatures
- fixed rare SIGFPE conditions
- fixed orphan expired joins blocking workers
- reloaded prover registry to resolve abandoned joins
- fixed stale worker proposal edge cases
- added full sanity checks on joins before submission
- resolved non-fallthrough conditions that should be fallthrough
- fixed expired prover join frames and starting port ranges
- fixed proposer getting stuck edge cases
- tweaked seniority markers on joins
- fixed panic on shutdown edge cases
- fixed libp2p discovery picking inaccessible peers
- fixed coverage event checks not in shutdown logic
- fixed blossomsub pubsub interface subscription tracking
- fixed subscribe ordering to prevent nil panics
- switched from dnsaddr to dns4 for blossomsub addressing
- added quic-v1 transport support
- added deterministic worker keys to prevent sybil attacks
- fixed blossomsub pubsub interface subscription status tracking
- fixed subscribe ordering edge cases
- fixed frozen hypergraph post-respawn state

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
- improved peer connection stability during network partitions
- optimized hypergraph sync performance for large datasets
- added validation for DKLs23 fork parameters
- resolved edge case in channel message ordering
- reduced memory usage in pebble storage backend
- fixed certificate rotation timing issue
- improved error handling during prover registry updates

---

*This document is auto-generated daily. Curated notes come from the monorepo RELEASE-NOTES file. Versions marked (auto-generated) are summarized from commit messages and may be less precise.*
