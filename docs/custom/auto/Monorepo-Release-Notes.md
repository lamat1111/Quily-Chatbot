---
title: "Quilibrium Node Release Notes"
source: github.com/QuilibriumNetwork/monorepo (automated daily)
date: 2026-03-27
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

**Last updated:** March 27, 2026
**Source:** [Quilibrium Monorepo](https://github.com/QuilibriumNetwork/monorepo)

This document tracks changes in each Quilibrium node release.

## v2.1.0.21 (version .21) *(auto-generated)*
- resolved feedback and reconciled old/new config paths
- fixed formatting/precision on prover reward data
- fixed peering issue
- fixed app shard lookups on mainnet

## v2.1.0.20 (version .20) *(auto-generated)*
- fixed pebbledb constructor config parameter
- reduced CPU overhead in initial worker behaviors and sync
- added debug environment variable support
- improved docker build caching for faster builds
- added extra node info data and command line metrics query
- implemented hub-and-spoke global message broadcasts
- adjusted cli output for join frames
- added leave proposals for overcrowded shards

## v2.1.0.19 (version .19) *(auto-generated)*
- fixed seniority marker join blocker and sync message size limit defaults
- resolved signature failures and merge-related signature issues
- fixed one-shot sync message size, app shard TC signature size, and collector/hotstuff race condition
- resolved expired joins blocking new joins due to pruning disable
- removed compatibility with old 2.0.0 blossomsub
- fixed abandoned prover joins and stale worker proposal edge
- added full sanity check on join before submitting
- resolved rare SIGFPE and orphan expired joins blocking worker reallocation
- added reconnect fallback with variable time when no peers are found
- updated base peer count to 1
- fixed expired prover join frames, starting port ranges, and proposer getting stuck
- resolved shutdown panics, libp2p discovery picking inaccessible peers, and coverage event checks
- fixed shutdown scenario quirks and reload hanging
- forced registry refresh on worker waiting for registration
- fixed worker manager filter refresh on allocation and snapshots blocking shutdown
- added forced shutdown after five seconds for app worker
- prevented shutdown loops and added named workers for tracing
- used deterministic key for worker peer IDs to prevent sybil attack flags
- removed pubsub stop from app consensus engine and integrated shutdown context for syncs
- fixed blossomsub pubsub subscription tracking and nil panic on subscribe
- switched from dnsaddr to dns4 and added missing quic-v1
- restored proper respawn logic and fixed frozen hypergraph post-respawn
- fixed bitmask unsubscribe issue

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
- improved peer scoring for blossomsub
- optimized hypergraph sync performance
- added validation for DKLs23 proofs
- reduced memory usage in pebble storage
- fixed deadlock in peer manager
- improved error handling for invalid proofs
- optimized network message processing

---

*This document is auto-generated daily. Curated notes come from the monorepo RELEASE-NOTES file. Versions marked (auto-generated) are summarized from commit messages and may be less precise.*
