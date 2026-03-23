/**
 * Generates a daily network health snapshot as a markdown file in docs/custom/auto/.
 * This file gets picked up by the regular RAG ingestion pipeline, so queries like
 * "what's the latest?" or "how's the network doing?" return current data instead
 * of stale transcript references.
 *
 * Usage: tsx scripts/stats-snapshot.ts
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { computeStats, type NetworkSnapshot } from '../src/lib/networkStats';

const OUT_PATH = resolve(__dirname, '../docs/custom/auto/Network-Health-Snapshot.md');

function formatBytes(bytes: number): string {
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(2)} TB`;
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
  return `${bytes.toLocaleString('en-US')} B`;
}

function pct(n: number, total: number): string {
  if (total === 0) return '0.0%';
  return `${((n / total) * 100).toFixed(1)}%`;
}

function buildMarkdown(snap: NetworkSnapshot): string {
  const { totalShards: total } = snap;
  const dateHuman = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return `---
title: "Quilibrium Network Health Snapshot — ${dateHuman}"
source: Quilibrium Explorer API (automated daily)
date: ${snap.date}
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

**Date:** ${dateHuman}
**Data source:** Quilibrium Explorer API (live data as of ${snap.date})

## Overview

| Metric | Value |
|---|---|
| World Size | ${formatBytes(snap.worldBytes)} |
| Total Shards | ${snap.totalShards.toLocaleString('en-US')} |
| Peers | ${snap.peers.toLocaleString('en-US')} |
| Total Workers | ${snap.totalWorkers.toLocaleString('en-US')} |

## Shard Health

| Status | Count | Percentage |
|---|---|---|
| Healthy (6+ active provers) | ${snap.healthy.toLocaleString('en-US')} | ${pct(snap.healthy, total)} |
| Warning (3–5 active provers) | ${snap.warning.toLocaleString('en-US')} | ${pct(snap.warning, total)} |
| Halt Risk (<3 active provers) | ${snap.haltRisk.toLocaleString('en-US')} | ${pct(snap.haltRisk, total)} |

A shard is considered "healthy" when it has 6 or more active provers. Shards with fewer than 3 provers are at risk of halting. The network becomes fully activated when all shards move out of the "halt risk" category.

## Ring Distribution

| Ring | Workers per Shard | Shards |
|---|---|---|
| Ring 0 | 1–7 | ${(snap.rings['0'] || 0).toLocaleString('en-US')} |
| Ring 1 | 8–15 | ${(snap.rings['1'] || 0).toLocaleString('en-US')} |
| Ring 2 | 16–23 | ${(snap.rings['2'] || 0).toLocaleString('en-US')} |
| Ring 3+ | 24+ | ${(snap.rings['3+'] || 0).toLocaleString('en-US')} |

## Worker Activity

| Status | Count |
|---|---|
| Active | ${snap.workersActive.toLocaleString('en-US')} |
| Joining | ${snap.workersJoining.toLocaleString('en-US')} |
| Leaving | ${snap.workersLeaving.toLocaleString('en-US')} |
| Rejected | ${snap.workersRejected.toLocaleString('en-US')} |

## Summary

As of ${dateHuman}, the Quilibrium network has ${snap.totalShards.toLocaleString('en-US')} total shards. Of these, ${snap.healthy.toLocaleString('en-US')} (${pct(snap.healthy, total)}) are healthy, ${snap.warning.toLocaleString('en-US')} (${pct(snap.warning, total)}) need more coverage, and ${snap.haltRisk.toLocaleString('en-US')} (${pct(snap.haltRisk, total)}) are at halt risk. The network has ${snap.peers.toLocaleString('en-US')} peers and ${snap.totalWorkers.toLocaleString('en-US')} total workers.

This snapshot is updated daily from the Quilibrium Explorer API.
`;
}

async function main() {
  console.log('Fetching network stats from Explorer API...');
  const snap = await computeStats();
  const md = buildMarkdown(snap);
  writeFileSync(OUT_PATH, md, 'utf-8');
  console.log(`Wrote snapshot to ${OUT_PATH}`);
  console.log(`  Shards: ${snap.totalShards} | Peers: ${snap.peers} | Workers: ${snap.totalWorkers}`);
  console.log(`  Healthy: ${snap.healthy} | Warning: ${snap.warning} | Halt Risk: ${snap.haltRisk}`);
}

main().catch((err) => {
  console.error('Failed to generate stats snapshot:', err);
  process.exit(1);
});
