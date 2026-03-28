---
title: "Quilibrium Network Health Snapshot — March 28, 2026"
source: Quilibrium Explorer API (automated daily)
date: 2026-03-28
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

**Date:** March 28, 2026
**Data source:** Quilibrium Explorer API (live data as of 2026-03-28)

## Overview

| Metric | Value |
|---|---|
| World Size | 154.16 GB |
| Total Shards | 3,098 |
| Peers | 404 |
| Total Workers | 36,527 |

## Shard Health

| Status | Count | Percentage |
|---|---|---|
| Healthy (6+ active provers) | 2,268 | 73.2% |
| Warning (3–5 active provers) | 549 | 17.7% |
| Halt Risk (<3 active provers) | 281 | 9.1% |

A shard is considered "healthy" when it has 6 or more active provers. Shards with fewer than 3 provers are at risk of halting. The network becomes fully activated when all shards move out of the "halt risk" category.

## Ring Distribution

| Ring | Workers per Shard | Shards |
|---|---|---|
| Ring 0 | 1–7 | 1,207 |
| Ring 1 | 8–15 | 1,053 |
| Ring 2 | 16–23 | 708 |
| Ring 3+ | 24+ | 130 |

## Worker Activity

| Status | Count |
|---|---|
| Active | 24,213 |
| Joining | 12,314 |
| Leaving | 1,318 |
| Rejected | 603 |

## Summary

As of March 28, 2026, the Quilibrium network has 3,098 total shards. Of these, 2,268 (73.2%) are healthy, 549 (17.7%) need more coverage, and 281 (9.1%) are at halt risk. The network has 404 peers and 36,527 total workers.

This snapshot is updated daily from the Quilibrium Explorer API.
