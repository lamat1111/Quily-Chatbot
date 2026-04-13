// src/lib/networkStats.ts
// Shared service: fetches Quilibrium network stats from the explorer API.
// Used by both Discord bot and web chat.

const EXPLORER_API = 'https://explorer-api.quilibrium.com';

// ── Types ──────────────────────────────────────────────────────────────

interface ShardData {
  filter: string;
  counts: { active?: number; joining?: number; leaving?: number; rejected?: number };
  size_bytes: string;
  active_workers: number;
}

interface PeerData {
  peer_id: string;
  cores: number;
  [key: string]: unknown;
}

export interface NetworkSnapshot {
  date: string; // YYYY-MM-DD
  worldBytes: number;
  totalShards: number;
  peers: number;
  totalWorkers: number;
  healthy: number;
  warning: number;
  haltRisk: number;
  workersActive: number;
  workersJoining: number;
  workersLeaving: number;
  workersRejected: number;
  rings: Record<string, number>; // "0" → count, "1" → count, "3+" → count
  unassigned: number; // shards with 0 active provers
}

// ── API Fetching ───────────────────────────────────────────────────────

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res.json() as Promise<T>;
}

async function fetchShards(): Promise<ShardData[]> {
  return fetchJSON<ShardData[]>(`${EXPLORER_API}/provers/shards`);
}

async function fetchPeers(): Promise<PeerData[]> {
  return fetchJSON<PeerData[]>(`${EXPLORER_API}/peers`);
}

// ── Stats Computation ──────────────────────────────────────────────────

export async function computeStats(): Promise<NetworkSnapshot> {
  const [shards, peers] = await Promise.all([fetchShards(), fetchPeers()]);

  const totalShards = shards.length;
  let worldBytes = 0;
  let totalWorkers = 0;
  let healthy = 0;
  let warning = 0;
  let haltRisk = 0;
  let workersActive = 0;
  let workersJoining = 0;
  let workersLeaving = 0;
  let workersRejected = 0;
  const rings: Record<string, number> = { '0': 0, '1': 0, '2': 0, '3+': 0 };
  let unassigned = 0;

  for (const s of shards) {
    const size = parseInt(s.size_bytes || '0', 10);
    const active = s.active_workers || 0;
    const counts = s.counts || {};

    worldBytes += size;
    totalWorkers += active;

    // Shard health (matching dashboard thresholds)
    const activeProvers = counts.active || 0;
    if (activeProvers >= 6) healthy++;
    else if (activeProvers >= 3) warning++;
    else haltRisk++;

    // Worker activity
    workersActive += counts.active || 0;
    workersJoining += counts.joining || 0;
    workersLeaving += counts.leaving || 0;
    workersRejected += counts.rejected || 0;

    // Ring distribution — based on counts.active (prover count), not active_workers (total workers)
    if (activeProvers === 0) {
      unassigned++;
    } else {
      const ring = Math.floor(activeProvers / 8);
      if (ring === 0) rings['0']++;
      else if (ring === 1) rings['1']++;
      else if (ring === 2) rings['2']++;
      else rings['3+']++;
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return {
    date: today,
    worldBytes,
    totalShards,
    peers: peers.length,
    totalWorkers,
    healthy,
    warning,
    haltRisk,
    workersActive,
    workersJoining,
    workersLeaving,
    workersRejected,
    rings,
    unassigned,
  };
}

// ── Formatting ─────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  const TiB = 1024 ** 4;
  const GiB = 1024 ** 3;
  const MiB = 1024 ** 2;
  if (bytes >= TiB) return `${(bytes / TiB).toFixed(2)} TB`;
  if (bytes >= GiB) return `${(bytes / GiB).toFixed(2)} GB`;
  if (bytes >= MiB) return `${(bytes / MiB).toFixed(2)} MB`;
  return `${bytes.toLocaleString('en-US')} B`;
}

function formatDelta(current: number, previous: number, formatter: (n: number) => string): string {
  const diff = current - previous;
  const sign = diff >= 0 ? '+' : '';
  return `${sign}${formatter(diff)}`;
}

function formatDeltaNum(current: number, previous: number): string {
  const diff = current - previous;
  const sign = diff >= 0 ? '+' : '';
  return `${sign}${diff.toLocaleString('en-US')}`;
}

function formatDeltaBytes(current: number, previous: number): string {
  return formatDelta(current, previous, (n) => formatBytes(Math.abs(n)).replace(/^/, n < 0 ? '-' : ''));
}

function pad(str: string, len: number, align: 'left' | 'right' = 'right'): string {
  if (align === 'left') return str.padEnd(len);
  return str.padStart(len);
}

function pct(n: number, total: number): string {
  if (total === 0) return '  0.0%';
  return `${((n / total) * 100).toFixed(1).padStart(5)}%`;
}

/** Clean percentage string (no padding) — e.g. "74.4%" */
function fmtPct(n: number, total: number): string {
  if (total === 0) return '0.0%';
  return `${((n / total) * 100).toFixed(1)}%`;
}

/** Format a percentage change — e.g. "+3.1%" or "-0.5%" */
function fmtPctChange(current: number, previous: number): string {
  if (previous === 0) return current === 0 ? '0%' : 'new';
  const pctVal = ((current - previous) / Math.abs(previous)) * 100;
  const sign = pctVal >= 0 ? '+' : '';
  // Use 1 decimal for small changes, 0 for large
  const formatted = Math.abs(pctVal) >= 10 ? pctVal.toFixed(0) : pctVal.toFixed(1);
  return `${sign}${formatted}%`;
}

/**
 * Format stats for Discord — mobile-friendly layout.
 * Overview + Shard Health use emoji markdown; Trends use a compact code block.
 */
export function formatDiscordStats(snapshot: NetworkSnapshot, history: NetworkSnapshot[]): string {
  const { totalShards: total } = snapshot;
  const date = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  let msg = '';
  msg += `📊 **Quilibrium Network Stats — ${date}**\n\n`;

  // Overview
  msg += `🌍 World Size: **${formatBytes(snapshot.worldBytes)}**\n`;
  msg += `🧩 Shards: **${snapshot.totalShards.toLocaleString('en-US')}**\n`;
  msg += `👥 Peers: **${snapshot.peers.toLocaleString('en-US')}**\n`;
  msg += `🖥️ Workers: **${snapshot.totalWorkers.toLocaleString('en-US')}**\n`;

  // Shard Health (quick glance before trends)
  msg += `\n❤️ **Shard Health**\n`;
  msg += `🟢 Healthy (≥6): **${snapshot.healthy.toLocaleString('en-US')}** (${fmtPct(snapshot.healthy, total)})\n`;
  msg += `🟡 Warning (<6): **${snapshot.warning.toLocaleString('en-US')}** (${fmtPct(snapshot.warning, total)})\n`;
  msg += `🔴 Halt Risk (<3): **${snapshot.haltRisk.toLocaleString('en-US')}** (${fmtPct(snapshot.haltRisk, total)})\n`;

  // Trends (most interesting section)
  const trendLines = buildDiscordTrends(snapshot, history);
  if (trendLines) {
    msg += `\n📈 **Trends**\n`;
    msg += trendLines;
  }

  // Ring Distribution (single column for readability)
  msg += `\n⭕ **Ring Distribution**\n`;
  msg += `Ring 0 (1–7 provers): ${(snapshot.rings['0'] || 0).toLocaleString('en-US')} shards\n`;
  msg += `Ring 1 (8–15 provers): ${(snapshot.rings['1'] || 0).toLocaleString('en-US')} shards\n`;
  msg += `Ring 2 (16–23 provers): ${(snapshot.rings['2'] || 0).toLocaleString('en-US')} shards\n`;
  msg += `Ring 3+ (24+ provers): ${(snapshot.rings['3+'] || 0).toLocaleString('en-US')} shards\n`;
  msg += `Unassigned (0 provers): ${(snapshot.unassigned || 0).toLocaleString('en-US')} shards\n`;

  return msg;
}

/**
 * Format stats for web chat (markdown, no code block wrapper — rendered by the UI).
 */
export function formatWebStats(snapshot: NetworkSnapshot): string {
  const { totalShards: total } = snapshot;
  const date = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  let msg = `## 📊 Quilibrium Network Stats — ${date}\n\n`;

  msg += '| Metric | Value |\n';
  msg += '|---|---|\n';
  msg += `| 🌍 World Size | ${formatBytes(snapshot.worldBytes)} |\n`;
  msg += `| 🧩 Shards | ${snapshot.totalShards.toLocaleString('en-US')} |\n`;
  msg += `| 👥 Peers | ${snapshot.peers.toLocaleString('en-US')} |\n`;
  msg += `| 🖥️ Total Workers | ${snapshot.totalWorkers.toLocaleString('en-US')} |\n`;
  msg += '\n';

  msg += '### Shard Health\n\n';
  msg += '| Status | Count | % |\n';
  msg += '|---|---|---|\n';
  msg += `| 🟢 Healthy (≥6 provers) | ${snapshot.healthy.toLocaleString('en-US')} | ${((snapshot.healthy / total) * 100).toFixed(1)}% |\n`;
  msg += `| 🟡 Warning (<6 provers) | ${snapshot.warning.toLocaleString('en-US')} | ${((snapshot.warning / total) * 100).toFixed(1)}% |\n`;
  msg += `| 🔴 Halt Risk (<3 provers) | ${snapshot.haltRisk.toLocaleString('en-US')} | ${((snapshot.haltRisk / total) * 100).toFixed(1)}% |\n`;
  msg += '\n';

  msg += '### Ring Distribution\n\n';
  msg += '| Ring | Provers/Shard | Shards |\n';
  msg += '|---|---|---|\n';
  msg += `| Ring 0 | 1–7 | ${(snapshot.rings['0'] || 0).toLocaleString('en-US')} |\n`;
  msg += `| Ring 1 | 8–15 | ${(snapshot.rings['1'] || 0).toLocaleString('en-US')} |\n`;
  msg += `| Ring 2 | 16–23 | ${(snapshot.rings['2'] || 0).toLocaleString('en-US')} |\n`;
  msg += `| Ring 3+ | 24+ | ${(snapshot.rings['3+'] || 0).toLocaleString('en-US')} |\n`;
  msg += `| Unassigned | 0 | ${(snapshot.unassigned || 0).toLocaleString('en-US')} |\n`;
  msg += '\n';

  msg += '### Worker Activity\n\n';
  msg += '| Status | Count |\n';
  msg += '|---|---|\n';
  msg += `| 🟢 Active | ${snapshot.workersActive.toLocaleString('en-US')} |\n`;
  msg += `| 🔄 Joining | ${snapshot.workersJoining.toLocaleString('en-US')} |\n`;
  msg += `| 🔻 Leaving | ${snapshot.workersLeaving.toLocaleString('en-US')} |\n`;

  msg += '\n*Live data from the [Quilibrium Network Dashboard](https://dashboard.quilibrium.com).*';

  return msg;
}

// ── Trend helpers ─────────────────────────────────────────────────────

/**
 * Build Discord trends as a compact code block — one metric header, intervals indented below.
 * Monospace alignment keeps it legible on mobile without horizontal overflow.
 */
function buildDiscordTrends(current: NetworkSnapshot, history: NetworkSnapshot[]): string {
  if (history.length < 2) return '';

  const intervals: { label: string; snap: NetworkSnapshot | undefined }[] = [
    { label: '1d', snap: findByDaysAgo(history, 1) },
    { label: '3d', snap: findByDaysAgo(history, 3) },
    { label: '7d', snap: findByDaysAgo(history, 7) },
    { label: '30d', snap: findByDaysAgo(history, 30) },
  ];

  // Need at least 1d data
  if (!intervals[0].snap) return '';

  const metrics: { label: string; fn: (s: NetworkSnapshot) => number; fmtDelta: (a: number, b: number) => string }[] = [
    { label: 'World Size', fn: (s) => s.worldBytes, fmtDelta: formatDeltaBytes },
    { label: 'Peers', fn: (s) => s.peers, fmtDelta: formatDeltaNum },
    { label: 'Workers', fn: (s) => s.totalWorkers, fmtDelta: formatDeltaNum },
    { label: 'Healthy', fn: (s) => s.healthy, fmtDelta: formatDeltaNum },
    { label: 'Halt Risk', fn: (s) => s.haltRisk, fmtDelta: formatDeltaNum },
  ];

  let out = '```\n';
  for (const m of metrics) {
    out += `${m.label}\n`;
    for (const iv of intervals) {
      if (!iv.snap) continue;
      const delta = m.fmtDelta(m.fn(current), m.fn(iv.snap));
      const pctChange = fmtPctChange(m.fn(current), m.fn(iv.snap));
      out += `  ${iv.label.padEnd(4)}${delta} (${pctChange})\n`;
    }
  }
  out += '```';

  return out;
}

/**
 * Build code-block trends for web format (legacy table style).
 */
function buildTrends(current: NetworkSnapshot, history: NetworkSnapshot[]): string {
  if (history.length < 2) return '';

  const yesterday = findByDaysAgo(history, 1);
  const threeDays = findByDaysAgo(history, 3);
  const sevenDays = findByDaysAgo(history, 7);

  if (!yesterday) return '';

  const cols: { label: string; snap: NetworkSnapshot }[] = [
    { label: 'vs 1d ago', snap: yesterday },
  ];
  if (threeDays) cols.push({ label: 'vs 3d ago', snap: threeDays });
  if (sevenDays) cols.push({ label: 'vs 7d ago', snap: sevenDays });

  const colW = 12;
  let header = pad('', 12);
  for (const c of cols) header += pad(c.label, colW);
  header += '\n';

  const rows = [
    { label: 'World Size  ', fn: (s: NetworkSnapshot) => s.worldBytes, fmtDelta: formatDeltaBytes },
    { label: 'Peers       ', fn: (s: NetworkSnapshot) => s.peers, fmtDelta: formatDeltaNum },
    { label: 'Workers     ', fn: (s: NetworkSnapshot) => s.totalWorkers, fmtDelta: formatDeltaNum },
    { label: 'Healthy     ', fn: (s: NetworkSnapshot) => s.healthy, fmtDelta: formatDeltaNum },
    { label: 'Halt Risk   ', fn: (s: NetworkSnapshot) => s.haltRisk, fmtDelta: formatDeltaNum },
  ];

  let body = '';
  for (const row of rows) {
    let line = row.label;
    for (const c of cols) {
      line += pad(row.fmtDelta(row.fn(current), row.fn(c.snap)), colW);
    }
    body += line + '\n';
  }

  return header + body;
}

function findByDaysAgo(history: NetworkSnapshot[], daysAgo: number): NetworkSnapshot | undefined {
  const target = new Date();
  target.setDate(target.getDate() - daysAgo);
  const targetStr = target.toISOString().slice(0, 10);

  const exact = history.find((h) => h.date === targetStr);
  if (exact) return exact;

  const candidates = history.filter((h) => h.date <= targetStr);
  if (candidates.length === 0) return undefined;
  return candidates[candidates.length - 1];
}
