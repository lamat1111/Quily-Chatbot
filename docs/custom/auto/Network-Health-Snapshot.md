---
title: "Quilibrium Network Health Snapshot — March 23, 2026"
source: Quilibrium Explorer API (automated daily)
date: 2026-03-23
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

**Date:** March 23, 2026
**Data source:** Quilibrium Explorer API (live data as of 2026-03-23)

## Overview

| Metric | Value |
|---|---|
| World Size | 154.16 GB |
| Total Shards | 3,098 |
| Peers | 384 |
| Total Workers | 35,532 |

## Shard Health

| Status | Count | Percentage |
|---|---|---|
| Healthy (6+ active provers) | 2,250 | 72.6% |
| Warning (3–5 active provers) | 563 | 18.2% |
| Halt Risk (<3 active provers) | 285 | 9.2% |

A shard is considered "healthy" when it has 6 or more active provers. Shards with fewer than 3 provers are at risk of halting. The network becomes fully activated when all shards move out of the "halt risk" category.

## Ring Distribution

| Ring | Workers per Shard | Shards |
|---|---|---|
| Ring 0 | 1–7 | 1,311 |
| Ring 1 | 8–15 | 973 |
| Ring 2 | 16–23 | 681 |
| Ring 3+ | 24+ | 133 |

## Worker Activity

| Status | Count |
|---|---|
| Active | 23,717 |
| Joining | 11,815 |
| Leaving | 1,275 |
| Rejected | 32,468 |

## Summary

As of March 23, 2026, the Quilibrium network has 3,098 total shards. Of these, 2,250 (72.6%) are healthy, 563 (18.2%) need more coverage, and 285 (9.2%) are at halt risk. The network has 384 peers and 35,532 total workers.

This snapshot is updated daily from the Quilibrium Explorer API.
