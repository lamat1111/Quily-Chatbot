// scripts/sync-discord/manifest.ts
import { readFile, writeFile } from 'fs/promises';
import type { DiscordManifest } from './types.js';

const MANIFEST_VERSION = 1;
const MANIFEST_PATH = 'docs/discord/.discord-manifest.json';

export function getManifestPath(): string {
  return MANIFEST_PATH;
}

export async function loadManifest(): Promise<DiscordManifest | null> {
  try {
    const content = await readFile(getManifestPath(), 'utf-8');
    const manifest = JSON.parse(content) as DiscordManifest;
    if (manifest.version !== MANIFEST_VERSION) {
      console.warn(`Manifest version mismatch (got ${manifest.version}, expected ${MANIFEST_VERSION}), starting fresh`);
      return null;
    }
    return manifest;
  } catch {
    return null;
  }
}

export async function saveManifest(manifest: DiscordManifest): Promise<void> {
  await writeFile(getManifestPath(), JSON.stringify(manifest, null, 2), 'utf-8');
}

export function createEmptyManifest(): DiscordManifest {
  return {
    version: MANIFEST_VERSION,
    lastRun: new Date().toISOString(),
    channels: {},
  };
}
