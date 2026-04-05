---
title: "Quilibrium Network Health Snapshot — April 5, 2026"
source: Quilibrium Explorer API (automated daily)
date: 2026-04-05
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

**Date:** April 5, 2026
**Data source:** Quilibrium Explorer API (live data as of 2026-04-05)

## Overview

| Metric | Value |
|---|---|
| World Size | 154.16 GB |
| Total Shards | 3,098 |
| Peers | 332 |
| Total Workers | 39,373 |

## Shard Health

| Status | Count | Percentage |
|---|---|---|
| Healthy (6+ active provers) | 2,320 | 74.9% |
| Warning (3–5 active provers) | 502 | 16.2% |
| Halt Risk (<3 active provers) | 276 | 8.9% |

A shard is considered "healthy" when it has 6 or more active provers. Shards with fewer than 3 provers are at risk of halting. The network becomes fully activated when all shards move out of the "halt risk" category.

## Ring Distribution

| Ring | Workers per Shard | Shards |
|---|---|---|
| Ring 0 | 1–7 | 23 |
| Ring 1 | 8–15 | 2,252 |
| Ring 2 | 16–23 | 684 |
| Ring 3+ | 24+ | 139 |

## Worker Activity

| Status | Count |
|---|---|
| Active | 24,730 |
| Joining | 14,643 |
| Leaving | 1,689 |
| Rejected | 3,699 |

## Summary

As of April 5, 2026, the Quilibrium network has 3,098 total shards. Of these, 2,320 (74.9%) are healthy, 502 (16.2%) need more coverage, and 276 (8.9%) are at halt risk. The network has 332 peers and 39,373 total workers.

This snapshot is updated daily from the Quilibrium Explorer API.
