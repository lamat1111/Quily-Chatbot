---
title: "Quilibrium Node Release Notes"
source: github.com/QuilibriumNetwork/monorepo (automated daily)
date: 2026-03-29
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

**Last updated:** March 29, 2026
**Source:** [Quilibrium Monorepo](https://github.com/QuilibriumNetwork/monorepo)

This document tracks changes in each Quilibrium node release.

## v2.1.0.21 (version .21) *(auto-generated)*
- reconcile old and new config paths
- fix prover reward data formatting and precision
- resolve peering issue
- fix app shard lookups on mainnet

## v2.1.0.20 (version .20) *(auto-generated)*
- fixed high CPU overhead in initial worker behaviors and ongoing sync
- added extra data to node info and query metrics from command line
- implemented leave proposals for overcrowded shards
- added hub-and-spoke global message broadcasts
- improved CLI output for join frames
- fixed pebbleDB constructor config parameter
- optimized docker builds with better caching

## v2.1.0.19 (version .19) *(auto-generated)*
- fixed sync message size limits and seniority marker join blockers
- resolved signature failures and merge-related signature issues
- fixed one-shot sync message size, app shard TC signature size, and collector/hotstuff race conditions
- removed compatibility with old 2.0.0 blossomsub
- resolved abandoned prover joins and stale worker proposal edges
- added full sanity checks on joins to identify bugs
- fixed rare SIGFPE and orphan expired joins blocking worker reallocation
- improved peer discovery with reconnect fallback and updated base peer count
- resolved expired prover join frames, port ranges, and stuck proposers
- fixed shutdown panics, libp2p discovery quirks, and coverage event checks
- improved worker registry refresh and shutdown handling
- added deterministic keys for worker peer IDs to prevent sybil flagging
- fixed blossomsub pubsub lifecycle and subscription order issues
- switched from dnsaddr to dns4 for blossomsub
- added additional logging for respawn quirks and frozen hypergraph recovery

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
- improved hypergraph sync performance
- optimized pebble storage compaction
- reduced memory usage during proof verification
- fixed deadlock in channel manager
- added validation for DKLs23 proofs
- resolved edge case in peer scoring
- improved error handling for corrupted state snapshots

---

*This document is auto-generated daily. Curated notes come from the monorepo RELEASE-NOTES file. Versions marked (auto-generated) are summarized from commit messages and may be less precise.*
