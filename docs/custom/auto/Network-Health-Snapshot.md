---
title: "Quilibrium Network Health Snapshot — March 31, 2026"
source: Quilibrium Explorer API (automated daily)
date: 2026-03-31
type: network_status
topics:
  - network health
  - network status
  - shard health
  - peers
  - workers
  - stats
  - current status
  - latest update
  - network update
---

# Quilibrium Network Health Snapshot

**Date:** March 31, 2026
**Data source:** Quilibrium Explorer API (live data as of 2026-03-31)

## Overview

| Metric | Value |
|---|---|
| World Size | 154.16 GB |
| Total Shards | 3,098 |
| Peers | 423 |
| Total Workers | 37,486 |

## Shard Health

| Status | Count | Percentage |
|---|---|---|
| Healthy (6+ active provers) | 2,330 | 75.2% |
| Warning (3–5 active provers) | 517 | 16.7% |
| Halt Risk (<3 active provers) | 251 | 8.1% |

A shard is considered "healthy" when it has 6 or more active provers. Shards with fewer than 3 provers are at risk of halting. The network becomes fully activated when all shards move out of the "halt risk" category.

## Ring Distribution

| Ring | Workers per Shard | Shards |
|---|---|---|
| Ring 0 | 1–7 | 1,207 |
| Ring 1 | 8–15 | 1,056 |
| Ring 2 | 16–23 | 706 |
| Ring 3+ | 24+ | 129 |

## Worker Activity

| Status | Count |
|---|---|
| Active | 24,478 |
| Joining | 13,008 |
| Leaving | 1,347 |
| Rejected | 1,415 |

## Summary

As of March 31, 2026, the Quilibrium network has 3,098 total shards. Of these, 2,330 (75.2%) are healthy, 517 (16.7%) need more coverage, and 251 (8.1%) are at halt risk. The network has 423 peers and 37,486 total workers.

This snapshot is updated daily from the Quilibrium Explorer API.
