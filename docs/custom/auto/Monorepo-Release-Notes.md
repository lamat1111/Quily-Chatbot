---
title: "Quilibrium Node Release Notes"
source: github.com/QuilibriumNetwork/monorepo (automated daily)
date: 2026-03-23
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

**Last updated:** March 23, 2026
**Source:** [Quilibrium Monorepo](https://github.com/QuilibriumNetwork/monorepo)

This document tracks changes in each Quilibrium node release. For the latest release binary, visit [releases.quilibrium.com](https://releases.quilibrium.com/release).

## v2.1.0.21 (version .21) *(auto-generated)*
- reconciled old and new config paths
- fixed formatting and precision on prover reward data
- resolved peering issue
- fixed app shard lookups on mainnet

## v2.1.0.20 (version .20) *(auto-generated)*
- fixed high CPU overhead in initial worker behaviors and ongoing sync
- added debug environment variable support
- fixed pebbleDB constructor config parameter
- optimized docker builds with better caching
- added extra node info data and CLI metrics querying
- implemented leaving proposals for overcrowded shards
- added hub-and-spoke global message broadcasts
- improved CLI output formatting for join frames

## v2.1.0.19 (version .19) *(auto-generated)*
- fixed seniority marker join blocker and sync message size limit defaults
- resolved signature failures and merge-related signature issues
- fixed one-shot sync message size, app shard TC signature size, collector/hotstuff race condition, and expired joins blocking new joins
- removed compatibility with old 2.0.0 blossomsub
- resolved abandoned prover joins and stale worker proposal edge
- added sanity check on join submissions
- fixed rare SIGFPE and orphan expired joins blocking worker reallocation
- added reconnect fallback with variable time when no peers are found
- updated base peer count to 1
- fixed expired prover join frames, port ranges, stuck proposers, and seniority on joins
- resolved shutdown panics, libp2p peer selection, and coverage event checks
- fixed shutdown quirks, reload hangs, and early bailout on coverage check
- added forced registry refresh for waiting workers and more logging
- fixed worker manager filter refresh and snapshot blocking on shutdown
- added forced shutdown timeout for app workers
- prevented shutdown loops and added named worker tracing
- used deterministic keys for worker peer IDs to prevent sybil flags
- removed pubsub stop from app consensus engine and added shutdown context to sync
- fixed blossomsub subscription tracking and nil panic on subscribe
- switched from dnsaddr to dns4 and added quic-v1 support
- fixed hypergraph freeze post-respawn and missing bitmask unsubscription
- restored proper respawn logic and applied fixes to restart behavior

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
- fixed blossomsub peer discovery regression
- improved peer scoring metrics
- optimized hypergraph sync performance
- reduced memory usage in channel processing
- added validation for DKLs23 proofs
- resolved deadlock in pebble storage engine
- improved error handling during network disconnections
- fixed race condition in peer connection management

---

*This document is auto-generated daily. Curated notes come from the monorepo RELEASE-NOTES file. Versions marked (auto-generated) are summarized from commit messages and may be less precise.*
