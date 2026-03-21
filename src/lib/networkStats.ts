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

    // Ring distribution (ring = floor(active_workers / 8))
    const ring = Math.floor(active / 8);
    if (ring === 0) rings['0']++;
    else if (ring === 1) rings['1']++;
    else if (ring === 2) rings['2']++;
    else rings['3+']++;
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
  };
}

// ── Formatting ─────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(2)} TB`;
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
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

/**
 * Format stats for Discord (monospace code block with emoji).
 */
export function formatDiscordStats(snapshot: NetworkSnapshot, history: NetworkSnapshot[]): string {
  const { totalShards: total } = snapshot;
  const date = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  let msg = '';
  msg += `📊 **Quilibrium Network Stats — ${date}**\n`;
  msg += '```\n';

  msg += `World Size       ${pad(formatBytes(snapshot.worldBytes), 14)}\n`;
  msg += `Shards           ${pad(snapshot.totalShards.toLocaleString('en-US'), 14)}\n`;
  msg += `Peers            ${pad(snapshot.peers.toLocaleString('en-US'), 14)}\n`;
  msg += `Total Workers    ${pad(snapshot.totalWorkers.toLocaleString('en-US'), 14)}\n`;
  msg += '\n';

  msg += `-- Shard Health ${'─'.repeat(30)}\n`;
  msg += `🟢 Healthy  (>=6)   ${pad(snapshot.healthy.toLocaleString('en-US'), 6)}  (${pct(snapshot.healthy, total)})\n`;
  msg += `🟡 Warning  (<6)    ${pad(snapshot.warning.toLocaleString('en-US'), 6)}  (${pct(snapshot.warning, total)})\n`;
  msg += `🔴 Halt Risk(<3)    ${pad(snapshot.haltRisk.toLocaleString('en-US'), 6)}  (${pct(snapshot.haltRisk, total)})\n`;
  msg += '\n';

  msg += `-- Ring Distribution ${'─'.repeat(25)}\n`;
  msg += `Ring 0  (1-7 workers)    ${pad((snapshot.rings['0'] || 0).toLocaleString('en-US'), 6)} shards\n`;
  msg += `Ring 1  (8-15 workers)   ${pad((snapshot.rings['1'] || 0).toLocaleString('en-US'), 6)} shards\n`;
  msg += `Ring 2  (16-23 workers)  ${pad((snapshot.rings['2'] || 0).toLocaleString('en-US'), 6)} shards\n`;
  msg += `Ring 3+ (24+ workers)    ${pad((snapshot.rings['3+'] || 0).toLocaleString('en-US'), 6)} shards\n`;
  msg += '\n';

  msg += `-- Worker Activity ${'─'.repeat(27)}\n`;
  msg += `Active     ${pad(snapshot.workersActive.toLocaleString('en-US'), 10)}\n`;
  msg += `Joining    ${pad(snapshot.workersJoining.toLocaleString('en-US'), 10)}\n`;
  msg += `Leaving    ${pad(snapshot.workersLeaving.toLocaleString('en-US'), 10)}\n`;

  const trendRows = buildTrends(snapshot, history);
  if (trendRows) {
    msg += '\n';
    msg += `── Trends ${'─'.repeat(36)}\n`;
    msg += trendRows;
  }

  msg += '```';
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
  msg += `| 👷 Total Workers | ${snapshot.totalWorkers.toLocaleString('en-US')} |\n`;
  msg += '\n';

  msg += '### Shard Health\n\n';
  msg += '| Status | Count | % |\n';
  msg += '|---|---|---|\n';
  msg += `| ✅ Healthy (≥6 provers) | ${snapshot.healthy.toLocaleString('en-US')} | ${((snapshot.healthy / total) * 100).toFixed(1)}% |\n`;
  msg += `| ⚠️ Warning (<6 provers) | ${snapshot.warning.toLocaleString('en-US')} | ${((snapshot.warning / total) * 100).toFixed(1)}% |\n`;
  msg += `| 🔴 Halt Risk (<3 provers) | ${snapshot.haltRisk.toLocaleString('en-US')} | ${((snapshot.haltRisk / total) * 100).toFixed(1)}% |\n`;
  msg += '\n';

  msg += '### Ring Distribution\n\n';
  msg += '| Ring | Workers/Shard | Shards |\n';
  msg += '|---|---|---|\n';
  msg += `| Ring 0 | 1–7 | ${(snapshot.rings['0'] || 0).toLocaleString('en-US')} |\n`;
  msg += `| Ring 1 | 8–15 | ${(snapshot.rings['1'] || 0).toLocaleString('en-US')} |\n`;
  msg += `| Ring 2 | 16–23 | ${(snapshot.rings['2'] || 0).toLocaleString('en-US')} |\n`;
  msg += `| Ring 3+ | 24+ | ${(snapshot.rings['3+'] || 0).toLocaleString('en-US')} |\n`;
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

// ── Trend helpers (shared) ─────────────────────────────────────────────

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
  let header = pad('', 18);
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
