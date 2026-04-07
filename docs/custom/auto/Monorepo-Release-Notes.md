---
title: "Quilibrium Node Release Notes"
source: github.com/QuilibriumNetwork/monorepo (automated daily)
date: 2026-04-07
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

**Last updated:** April 7, 2026
**Source:** [Quilibrium Monorepo](https://github.com/QuilibriumNetwork/monorepo)

This document tracks changes in each Quilibrium node release.

## v2.1.0.22 (version .22) *(auto-generated)*
- improved prover commands and worker ID visibility
- relaxed peerstore clearing interval
- added component-level logger tuning
- enhanced prover management TUI with manual tracking and worker ID joins
- optimized TUI rendering and interaction
- fixed prover eviction and leaving status bugs
- renamed pending state to joining for clarity
- fixed merge spend marker and sorting/ring position issues
- improved timereel behavior for immediate head acceptance
- added global frame fetch timeout and LRU cache
- adjusted estimation behavior for proper ring position calculation
- fixed worker TUI reward calculations and logical shard count
- implemented auto-sized filters and dynamic filter width fixes
- optimized logging for shard join/leave operations
- improved blossomsub behavior and estimation calculations
- added migrations to resolve eviction issues
- refactored global consensus engine into discrete components
- adjusted RPC/worker ring display

## v2.1.0.21 (version .21) *(auto-generated)*
- resolve sync race condition with prover registry pruning
- reconcile old and new config paths
- fix formatting and precision on prover reward data
- fix peering issue solution
- fix app shard lookups on mainnet

## v2.1.0.20 (version .20) *(auto-generated)*
- allow debug mode via environment variable
- fix pebbledb constructor configuration parameter
- reduce high cpu overhead in initial worker behaviors and sync
- optimize docker builds with better caching
- add extra node info data and query metrics from cli
- implement hub-and-spoke global message broadcasts
- improve cli output for join frames
- leave proposals for overcrowded shards

## v2.1.0.19 (version .19) *(auto-generated)*
- fixed seniority marker join blocker and sync message size limit defaults
- resolved signature failures and added error logging for merge-related signatures
- fixed one-shot sync message size, app shard TC signature size, collector/hotstuff race condition, and expired joins blocking new joins
- removed compatibility with old 2.0.0 blossomsub
- resolved abandoned prover joins and reloaded prover registry
- fixed stale worker proposal edge and added pre-join sanity checks
- resolved rare SIGFPE and orphan expired joins blocking worker reallocation
- added reconnect fallback with variable timing when no peers are found
- updated base peer count to 1
- fixed expired prover join frames, port ranges, stuck proposers, and seniority on joins
- resolved shutdown issues including panic, inaccessible peer selection, and coverage event checks
- fixed registry refresh on worker registration wait and added logging
- improved worker manager filter refresh and snapshot shutdown handling
- enforced deterministic worker keys to prevent sybil attack flags
- fixed pubsub lifecycle management in app consensus engine
- resolved blossomsub subscription tracking and nil panic issues
- switched from dnsaddr to dns4 and added quic-v1 support
- fixed hypergraph freeze after respawn and bitmask unsubscribe issues
- improved respawn logic and worker shutdown tracing

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
- improved hypergraph sync performance during high network load
- optimized pebble storage compaction routine
- added validation for DKLs23 fork parameters
- resolved channel deadlock in peer negotiation
- reduced memory usage during large proof batches
- fixed edge case in prover registry cleanup

---

*This document is auto-generated daily. Curated notes come from the monorepo RELEASE-NOTES file. Versions marked (auto-generated) are summarized from commit messages and may be less precise.*
