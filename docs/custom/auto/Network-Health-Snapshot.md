---
title: "Quilibrium Network Health Snapshot — April 4, 2026"
source: Quilibrium Explorer API (automated daily)
date: 2026-04-04
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

**Date:** April 4, 2026
**Data source:** Quilibrium Explorer API (live data as of 2026-04-04)

## Overview

| Metric | Value |
|---|---|
| World Size | 154.16 GB |
| Total Shards | 3,098 |
| Peers | 338 |
| Total Workers | 39,207 |

## Shard Health

| Status | Count | Percentage |
|---|---|---|
| Healthy (6+ active provers) | 2,334 | 75.3% |
| Warning (3–5 active provers) | 489 | 15.8% |
| Halt Risk (<3 active provers) | 275 | 8.9% |

A shard is considered "healthy" when it has 6 or more active provers. Shards with fewer than 3 provers are at risk of halting. The network becomes fully activated when all shards move out of the "halt risk" category.

## Ring Distribution

| Ring | Workers per Shard | Shards |
|---|---|---|
| Ring 0 | 1–7 | 162 |
| Ring 1 | 8–15 | 2,087 |
| Ring 2 | 16–23 | 707 |
| Ring 3+ | 24+ | 142 |

## Worker Activity

| Status | Count |
|---|---|
| Active | 24,926 |
| Joining | 14,281 |
| Leaving | 1,480 |
| Rejected | 3,054 |

## Summary

As of April 4, 2026, the Quilibrium network has 3,098 total shards. Of these, 2,334 (75.3%) are healthy, 489 (15.8%) need more coverage, and 275 (8.9%) are at halt risk. The network has 338 peers and 39,207 total workers.

This snapshot is updated daily from the Quilibrium Explorer API.
