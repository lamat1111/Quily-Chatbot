---
title: "Quilibrium Node Release Notes"
source: github.com/QuilibriumNetwork/monorepo (automated daily)
date: 2026-04-04
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

**Last updated:** April 4, 2026
**Source:** [Quilibrium Monorepo](https://github.com/QuilibriumNetwork/monorepo)

This document tracks changes in each Quilibrium node release.

## v2.1.0.21 (version .21) *(auto-generated)*
- resolve sync race condition with prover registry pruning
- reconcile old and new config paths
- fix formatting and precision on prover reward data
- fix peering issue solution
- fix app shard lookups on mainnet

## v2.1.0.20 (version .20) *(auto-generated)*
- fixed high CPU overhead in initial worker behaviors and ongoing sync
- added debug environment variable support
- fixed pebbleDB constructor config parameter
- improved docker build caching
- added node info metrics and command line querying
- implemented automatic leaving of overcrowded shards
- added hub-and-spoke global message broadcast system
- improved CLI output formatting for join frames

## v2.1.0.19 (version .19) *(auto-generated)*
- fix seniority marker join blocker and sync message size limit defaults
- resolve signature failures and merge-related signature issues
- fix one-shot sync message size, app shard TC signature size, collector/hotstuff race condition, and expired joins blocking new joins
- remove compatibility with old 2.0.0 blossomsub
- resolve abandoned prover joins and stale worker proposal edge
- add sanity check on join before submitting
- fix rare SIGFPE and orphan expired joins blocking worker reallocation
- add reconnect fallback with variable time when no peers are found
- update base peer count to 1
- fix expired prover join frames, starting port ranges, stuck proposer, and seniority on joins
- fix shutdown panics, libp2p discovery picking inaccessible peers, and coverage event checks
- fix shutdown quirks, reload hanging, and early bailout on coverage check shutdown
- force registry refresh on worker waiting for registration
- fix worker manager filter refresh and snapshot blocking on shutdown
- force shutdown after five seconds for app worker
- prevent shutdown loops and add named workers for tracing
- use deterministic key for worker peer IDs to avoid sybil attack flags
- remove pubsub stop from app consensus engine and integrate shutdown context for sync
- fix blossomsub pubsub subscription tracking and nil panic on subscribe
- switch from dnsaddr to dns4 and add missing quic-v1
- restore proper respawn logic and fix frozen hypergraph post-respawn
- unsubscribe from previously missing bitmask

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
- added bloom filter for peer discovery optimization
- fixed peer discovery race condition in kad dht
- improved peer scoring for blossomsub
- optimized message propagation in hypergraph
- reduced memory usage in pebble storage
- fixed deadlock in channel manager
- improved sync performance with batched requests
- added validation for invalid peer metadata
- fixed edge case in proof verification
- optimized network resource usage during sync

---

*This document is auto-generated daily. Curated notes come from the monorepo RELEASE-NOTES file. Versions marked (auto-generated) are summarized from commit messages and may be less precise.*
