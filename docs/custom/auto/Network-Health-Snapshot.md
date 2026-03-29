---
title: "Quilibrium Network Health Snapshot — March 29, 2026"
source: Quilibrium Explorer API (automated daily)
date: 2026-03-29
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

**Date:** March 29, 2026
**Data source:** Quilibrium Explorer API (live data as of 2026-03-29)

## Overview

| Metric | Value |
|---|---|
| World Size | 154.16 GB |
| Total Shards | 3,098 |
| Peers | 420 |
| Total Workers | 36,853 |

## Shard Health

| Status | Count | Percentage |
|---|---|---|
| Healthy (6+ active provers) | 2,293 | 74.0% |
| Warning (3–5 active provers) | 535 | 17.3% |
| Halt Risk (<3 active provers) | 270 | 8.7% |

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
| Active | 24,299 |
| Joining | 12,554 |
| Leaving | 1,379 |
| Rejected | 1,383 |

## Summary

As of March 29, 2026, the Quilibrium network has 3,098 total shards. Of these, 2,293 (74.0%) are healthy, 535 (17.3%) need more coverage, and 270 (8.7%) are at halt risk. The network has 420 peers and 36,853 total workers.

This snapshot is updated daily from the Quilibrium Explorer API.
