---
title: "Quilibrium Network Health Snapshot — March 30, 2026"
source: Quilibrium Explorer API (automated daily)
date: 2026-03-30
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

**Date:** March 30, 2026
**Data source:** Quilibrium Explorer API (live data as of 2026-03-30)

## Overview

| Metric | Value |
|---|---|
| World Size | 154.16 GB |
| Total Shards | 3,098 |
| Peers | 421 |
| Total Workers | 36,969 |

## Shard Health

| Status | Count | Percentage |
|---|---|---|
| Healthy (6+ active provers) | 2,306 | 74.4% |
| Warning (3–5 active provers) | 536 | 17.3% |
| Halt Risk (<3 active provers) | 256 | 8.3% |

A shard is considered "healthy" when it has 6 or more active provers. Shards with fewer than 3 provers are at risk of halting. The network becomes fully activated when all shards move out of the "halt risk" category.

## Ring Distribution

| Ring | Workers per Shard | Shards |
|---|---|---|
| Ring 0 | 1–7 | 1,207 |
| Ring 1 | 8–15 | 1,058 |
| Ring 2 | 16–23 | 703 |
| Ring 3+ | 24+ | 130 |

## Worker Activity

| Status | Count |
|---|---|
| Active | 24,393 |
| Joining | 12,576 |
| Leaving | 1,358 |
| Rejected | 1,476 |

## Summary

As of March 30, 2026, the Quilibrium network has 3,098 total shards. Of these, 2,306 (74.4%) are healthy, 536 (17.3%) need more coverage, and 256 (8.3%) are at halt risk. The network has 421 peers and 36,969 total workers.

This snapshot is updated daily from the Quilibrium Explorer API.
