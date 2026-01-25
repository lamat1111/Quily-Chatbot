import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { createHash } from 'crypto';
import type { SyncManifest, SyncConfig, SyncedFile } from './types.js';

const MANIFEST_VERSION = 1;

/**
 * Get the manifest file path
 */
export function getManifestPath(destPath: string): string {
  return join(destPath, '.sync-manifest.json');
}

/**
 * Load the sync manifest from disk
 */
export async function loadManifest(destPath: string): Promise<SyncManifest | null> {
  const manifestPath = getManifestPath(destPath);

  try {
    const content = await readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(content) as SyncManifest;

    // Check version compatibility
    if (manifest.version !== MANIFEST_VERSION) {
      console.warn(`Manifest version mismatch (got ${manifest.version}, expected ${MANIFEST_VERSION}), will re-sync all files`);
      return null;
    }

    return manifest;
  } catch (error) {
    // File doesn't exist or is invalid
    return null;
  }
}

/**
 * Save the sync manifest to disk
 */
export async function saveManifest(
  destPath: string,
  manifest: SyncManifest
): Promise<void> {
  const manifestPath = getManifestPath(destPath);

  // Ensure directory exists
  await mkdir(dirname(manifestPath), { recursive: true });

  await writeFile(
    manifestPath,
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );
}

/**
 * Create a new empty manifest
 */
export function createEmptyManifest(config: SyncConfig): SyncManifest {
  return {
    lastSync: new Date().toISOString(),
    source: {
      owner: config.owner,
      repo: config.repo,
      branch: config.branch,
      path: config.sourcePath,
    },
    files: {},
    version: MANIFEST_VERSION,
  };
}

/**
 * Create a synced file entry
 */
export function createSyncedFile(
  path: string,
  sha: string,
  content: string,
  size: number
): SyncedFile {
  return {
    path,
    sha,
    contentHash: computeContentHash(content),
    syncedAt: new Date().toISOString(),
    size,
  };
}

/**
 * Compute MD5 hash of content
 */
export function computeContentHash(content: string): string {
  return createHash('md5').update(content).digest('hex');
}

/**
 * Update manifest with newly synced files
 */
export function updateManifestFiles(
  manifest: SyncManifest,
  syncedFiles: SyncedFile[]
): SyncManifest {
  const updated = { ...manifest };
  updated.lastSync = new Date().toISOString();

  for (const file of syncedFiles) {
    updated.files[file.path] = file;
  }

  return updated;
}

/**
 * Remove deleted files from manifest
 */
export function removeFromManifest(
  manifest: SyncManifest,
  deletedPaths: string[]
): SyncManifest {
  const updated = { ...manifest };
  updated.lastSync = new Date().toISOString();

  for (const path of deletedPaths) {
    delete updated.files[path];
  }

  return updated;
}
