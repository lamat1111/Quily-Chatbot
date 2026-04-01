---
title: "Quilibrium Network Health Snapshot — April 1, 2026"
source: Quilibrium Explorer API (automated daily)
date: 2026-04-01
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

**Date:** April 1, 2026
**Data source:** Quilibrium Explorer API (live data as of 2026-04-01)

## Overview

| Metric | Value |
|---|---|
| World Size | 154.16 GB |
| Total Shards | 3,098 |
| Peers | 429 |
| Total Workers | 37,849 |

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
| Ring 0 | 1–7 | 1,190 |
| Ring 1 | 8–15 | 1,065 |
| Ring 2 | 16–23 | 714 |
| Ring 3+ | 24+ | 129 |

## Worker Activity

| Status | Count |
|---|---|
| Active | 24,466 |
| Joining | 13,383 |
| Leaving | 1,345 |
| Rejected | 1,270 |

## Summary

As of April 1, 2026, the Quilibrium network has 3,098 total shards. Of these, 2,330 (75.2%) are healthy, 517 (16.7%) need more coverage, and 251 (8.1%) are at halt risk. The network has 429 peers and 37,849 total workers.

This snapshot is updated daily from the Quilibrium Explorer API.
