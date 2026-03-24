---
title: "Quilibrium Network Health Snapshot — March 24, 2026"
source: Quilibrium Explorer API (automated daily)
date: 2026-03-24
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

**Date:** March 24, 2026
**Data source:** Quilibrium Explorer API (live data as of 2026-03-24)

## Overview

| Metric | Value |
|---|---|
| World Size | 154.16 GB |
| Total Shards | 3,098 |
| Peers | 390 |
| Total Workers | 35,708 |

## Shard Health

| Status | Count | Percentage |
|---|---|---|
| Healthy (6+ active provers) | 2,259 | 72.9% |
| Warning (3–5 active provers) | 554 | 17.9% |
| Halt Risk (<3 active provers) | 285 | 9.2% |

A shard is considered "healthy" when it has 6 or more active provers. Shards with fewer than 3 provers are at risk of halting. The network becomes fully activated when all shards move out of the "halt risk" category.

## Ring Distribution

| Ring | Workers per Shard | Shards |
|---|---|---|
| Ring 0 | 1–7 | 1,259 |
| Ring 1 | 8–15 | 1,018 |
| Ring 2 | 16–23 | 688 |
| Ring 3+ | 24+ | 133 |

## Worker Activity

| Status | Count |
|---|---|
| Active | 23,907 |
| Joining | 11,801 |
| Leaving | 1,276 |
| Rejected | 32,947 |

## Summary

As of March 24, 2026, the Quilibrium network has 3,098 total shards. Of these, 2,259 (72.9%) are healthy, 554 (17.9%) need more coverage, and 285 (9.2%) are at halt risk. The network has 390 peers and 35,708 total workers.

This snapshot is updated daily from the Quilibrium Explorer API.
