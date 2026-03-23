/**
 * Fetches the Quilibrium Tech Tree from qstorage.quilibrium.com/techtree/,
 * extracts the embedded JSON data from the JS bundle, filters out noise,
 * and generates a curated markdown doc for RAG ingestion.
 *
 * The tech tree is a Vite/React SPA with data baked into the JS bundle.
 * This script parses the HTML to find the current bundle filename, fetches
 * the bundle, and extracts structured item objects via regex.
 *
 * Usage: tsx scripts/sync-techtree.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import https from 'https';

const BASE_URL = 'https://qstorage.quilibrium.com/techtree';
const OUT_PATH = resolve(__dirname, '../docs/custom/auto/Quilibrium-Tech-Tree.md');

// ── Types ────────────────────────────────────────────────────────────────────

interface TechTreeItem {
  id: string;
  label: string;
  description: string;
  status: 'developed' | 'development' | 'planned';
  dependencies: string[];
  category: string;
}

interface CategoryStats {
  developed: number;
  development: number;
  planned: number;
  total: number;
  items: TechTreeItem[];
}

// ── Fetch helpers ────────────────────────────────────────────────────────────

/** Fetch a URL over HTTPS, ignoring TLS cert issues (qstorage has cert problems) */
function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { rejectUnauthorized: false }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchUrl(res.headers.location).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

// ── Extraction ───────────────────────────────────────────────────────────────

/** Parse the HTML page to find the JS bundle filename */
function extractBundleFilename(html: string): string {
  const match = html.match(/src="\.\/assets\/(index-[^"]+\.js)"/);
  if (!match) throw new Error('Could not find JS bundle filename in HTML');
  return match[1];
}

/** Extract tech tree item objects from the JS bundle */
function extractItems(js: string): TechTreeItem[] {
  // Items are embedded as object literals: {"id":"...","label":"...", ...}
  const pattern = /\{[^{}]*"id":"[^"]*"[^{}]*\}/g;
  const matches = js.match(pattern) || [];

  const items: TechTreeItem[] = [];
  for (const raw of matches) {
    try {
      const obj = JSON.parse(raw);
      // Validate it's actually a tech tree item (has required fields)
      if (obj.id && obj.label && obj.category && obj.status && Array.isArray(obj.dependencies)) {
        items.push({
          id: obj.id,
          label: obj.label,
          description: obj.description || '',
          status: obj.status,
          dependencies: obj.dependencies,
          category: obj.category,
        });
      }
    } catch {
      // Not valid JSON — skip
    }
  }
  return items;
}

// ── Filtering ────────────────────────────────────────────────────────────────

const NOISE_PATTERNS = [
  /^Monorepo folder feature:/i,
  /^Monorepo crypto folder feature:/i,
  /^Service category \(per AWS services-by-category\):/i,
  /^API-compatible cloud services built on/i,
];

/** Filter out auto-generated noise items with no meaningful description */
function filterNoise(items: TechTreeItem[]): TechTreeItem[] {
  return items.filter((item) => {
    if (!item.description) return false;
    return !NOISE_PATTERNS.some((p) => p.test(item.description));
  });
}

// ── Markdown generation ──────────────────────────────────────────────────────

/** Parse AWS-compatible service name from description like "Compatible with S3." */
function parseAwsEquivalent(description: string): string | null {
  const match = description.match(/Compatible with ([^.]+)\./);
  return match ? match[1].trim() : null;
}

const STATUS_LABELS: Record<string, string> = {
  developed: 'Shipped',
  development: 'In Development',
  planned: 'Planned',
};

const STATUS_ORDER = ['developed', 'development', 'planned'];

function buildMarkdown(items: TechTreeItem[], totalRaw: number, totalFiltered: number): string {
  const dateHuman = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const dateIso = new Date().toISOString().split('T')[0];

  // Compute stats per category
  const categories = new Map<string, CategoryStats>();
  for (const item of items) {
    if (!categories.has(item.category)) {
      categories.set(item.category, { developed: 0, development: 0, planned: 0, total: 0, items: [] });
    }
    const cat = categories.get(item.category)!;
    cat[item.status]++;
    cat.total++;
    cat.items.push(item);
  }

  // Global stats
  const developed = items.filter((i) => i.status === 'developed').length;
  const inDev = items.filter((i) => i.status === 'development').length;
  const planned = items.filter((i) => i.status === 'planned').length;

  // Category order: Protocol, Cryptography, Consumer, Web Services
  const categoryOrder = ['Protocol', 'Cryptography', 'Consumer', 'Web Services'];
  const sortedCategories = [...categories.entries()].sort((a, b) => {
    const ai = categoryOrder.indexOf(a[0]);
    const bi = categoryOrder.indexOf(b[0]);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  let md = `---
title: "Quilibrium Tech Tree — Development Roadmap"
source: qstorage.quilibrium.com/techtree (automated weekly)
date: ${dateIso}
type: roadmap
topics:
  - tech tree
  - roadmap
  - development status
  - web services
  - AWS compatible
  - planned features
  - what is being built
  - quilibrium services
  - feature status
---

# Quilibrium Tech Tree — Development Roadmap

**Last updated:** ${dateHuman}
**Source:** [Interactive Tech Tree](${BASE_URL}/index.html) — a visual, explorable graph of every component in the Quilibrium ecosystem. Users can scroll, zoom, and click on individual items to see details and dependencies.

## Overview

The Quilibrium Tech Tree maps out every component being built across the protocol, cryptographic primitives, consumer products, and cloud-compatible web services. It tracks ${items.length} meaningful components across ${categories.size} categories.

| Status | Count | Percentage |
|---|---|---|
| Shipped | ${developed} | ${pct(developed, items.length)} |
| In Development | ${inDev} | ${pct(inDev, items.length)} |
| Planned | ${planned} | ${pct(planned, items.length)} |

`;

  // Per-category sections
  for (const [catName, stats] of sortedCategories) {
    md += `## ${catName}\n\n`;
    md += `${stats.developed} shipped, ${stats.development} in development, ${stats.planned} planned.\n\n`;

    // Sort items: developed first, then development, then planned; alpha within each
    const sorted = [...stats.items].sort((a, b) => {
      const statusDiff = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
      if (statusDiff !== 0) return statusDiff;
      return a.label.localeCompare(b.label);
    });

    // Build table
    const hasAws = sorted.some((i) => parseAwsEquivalent(i.description));
    if (hasAws) {
      md += `| Service | Description | AWS Equivalent | Status |\n`;
      md += `|---|---|---|---|\n`;
      for (const item of sorted) {
        const aws = parseAwsEquivalent(item.description);
        const desc = item.description.replace(/Compatible with [^.]+\.\s*/g, '').trim();
        md += `| ${item.label} | ${desc || '—'} | ${aws || '—'} | ${STATUS_LABELS[item.status]} |\n`;
      }
    } else {
      md += `| Component | Description | Status |\n`;
      md += `|---|---|---|\n`;
      for (const item of sorted) {
        md += `| ${item.label} | ${item.description} | ${STATUS_LABELS[item.status]} |\n`;
      }
    }
    md += '\n';
  }

  md += `---

*This document is auto-generated weekly from the [Quilibrium Tech Tree](${BASE_URL}/index.html). To explore the full interactive graph with dependency relationships and visual layout, visit the link directly.*
`;

  return md;
}

function pct(n: number, total: number): string {
  if (total === 0) return '0.0%';
  return `${((n / total) * 100).toFixed(1)}%`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching tech tree HTML...');
  const html = await fetchUrl(`${BASE_URL}/index.html`);

  const bundleFile = extractBundleFilename(html);
  console.log(`Found JS bundle: ${bundleFile}`);

  console.log('Fetching JS bundle...');
  const js = await fetchUrl(`${BASE_URL}/assets/${bundleFile}`);

  console.log('Extracting tech tree items...');
  const rawItems = extractItems(js);
  console.log(`  Raw items extracted: ${rawItems.length}`);

  const items = filterNoise(rawItems);
  console.log(`  After filtering noise: ${items.length} (removed ${rawItems.length - items.length} auto-generated entries)`);

  const md = buildMarkdown(items, rawItems.length, items.length);

  // Change detection: compare with existing file
  if (existsSync(OUT_PATH)) {
    const existing = readFileSync(OUT_PATH, 'utf-8');
    // Compare ignoring the date line (which changes every run)
    const normalize = (s: string) => s.replace(/^date: .+$/m, '').replace(/^\*\*Last updated:\*\* .+$/m, '');
    if (normalize(existing) === normalize(md)) {
      console.log('No changes detected — tech tree is up to date.');
      return;
    }
  }

  writeFileSync(OUT_PATH, md, 'utf-8');
  console.log(`Wrote tech tree doc to ${OUT_PATH}`);

  // Print summary
  const developed = items.filter((i) => i.status === 'developed').length;
  const inDev = items.filter((i) => i.status === 'development').length;
  const planned = items.filter((i) => i.status === 'planned').length;
  console.log(`  Shipped: ${developed} | In Development: ${inDev} | Planned: ${planned}`);
}

main().catch((err) => {
  console.error('Failed to sync tech tree:', err);
  process.exit(1);
});
