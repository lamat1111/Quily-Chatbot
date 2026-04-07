---
title: "Quilibrium Network Health Snapshot — April 7, 2026"
source: Quilibrium Explorer API (automated daily)
date: 2026-04-07
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

**Date:** April 7, 2026
**Data source:** Quilibrium Explorer API (live data as of 2026-04-07)

## Overview

| Metric | Value |
|---|---|
| World Size | 154.16 GB |
| Total Shards | 3,098 |
| Peers | 345 |
| Total Workers | 40,431 |

## Shard Health

| Status | Count | Percentage |
|---|---|---|
| Healthy (6+ active provers) | 2,340 | 75.5% |
| Warning (3–5 active provers) | 491 | 15.8% |
| Halt Risk (<3 active provers) | 267 | 8.6% |

A shard is considered "healthy" when it has 6 or more active provers. Shards with fewer than 3 provers are at risk of halting. The network becomes fully activated when all shards move out of the "halt risk" category.

## Ring Distribution

| Ring | Workers per Shard | Shards |
|---|---|---|
| Ring 0 | 1–7 | 1 |
| Ring 1 | 8–15 | 1,926 |
| Ring 2 | 16–23 | 1,018 |
| Ring 3+ | 24+ | 153 |

## Worker Activity

| Status | Count |
|---|---|
| Active | 25,108 |
| Joining | 15,323 |
| Leaving | 1,600 |
| Rejected | 4,820 |

## Summary

As of April 7, 2026, the Quilibrium network has 3,098 total shards. Of these, 2,340 (75.5%) are healthy, 491 (15.8%) need more coverage, and 267 (8.6%) are at halt risk. The network has 345 peers and 40,431 total workers.

This snapshot is updated daily from the Quilibrium Explorer API.
