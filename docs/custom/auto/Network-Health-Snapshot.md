---
title: "Quilibrium Network Health Snapshot — March 27, 2026"
source: Quilibrium Explorer API (automated daily)
date: 2026-03-27
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

**Date:** March 27, 2026
**Data source:** Quilibrium Explorer API (live data as of 2026-03-27)

## Overview

| Metric | Value |
|---|---|
| World Size | 154.16 GB |
| Total Shards | 3,098 |
| Peers | 391 |
| Total Workers | 35,850 |

## Shard Health

| Status | Count | Percentage |
|---|---|---|
| Healthy (6+ active provers) | 2,261 | 73.0% |
| Warning (3–5 active provers) | 552 | 17.8% |
| Halt Risk (<3 active provers) | 285 | 9.2% |

A shard is considered "healthy" when it has 6 or more active provers. Shards with fewer than 3 provers are at risk of halting. The network becomes fully activated when all shards move out of the "halt risk" category.

## Ring Distribution

| Ring | Workers per Shard | Shards |
|---|---|---|
| Ring 0 | 1–7 | 1,255 |
| Ring 1 | 8–15 | 1,011 |
| Ring 2 | 16–23 | 700 |
| Ring 3+ | 24+ | 132 |

## Worker Activity

| Status | Count |
|---|---|
| Active | 24,036 |
| Joining | 11,814 |
| Leaving | 1,288 |
| Rejected | 343 |

## Summary

As of March 27, 2026, the Quilibrium network has 3,098 total shards. Of these, 2,261 (73.0%) are healthy, 552 (17.8%) need more coverage, and 285 (9.2%) are at halt risk. The network has 391 peers and 35,850 total workers.

This snapshot is updated daily from the Quilibrium Explorer API.
