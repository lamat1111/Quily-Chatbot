import { writeFile, mkdir, unlink, readFile } from 'fs/promises';
import { dirname, join } from 'path';
import type { SyncConfig, SyncDiff, SyncResult, SyncedFile, SyncManifest } from './types.js';
import { buildRawUrl, downloadFileContent } from './github.js';
import { createSyncedFile } from './manifest.js';

/**
 * Execute the sync operation - download changed files, delete removed ones
 */
export async function executeSync(
  config: SyncConfig,
  diff: SyncDiff,
  manifest: SyncManifest,
  onProgress?: (message: string) => void
): Promise<{ result: SyncResult; syncedFiles: SyncedFile[]; manifest: SyncManifest }> {
  const result: SyncResult = {
    success: true,
    added: 0,
    modified: 0,
    deleted: 0,
    unchanged: diff.unchanged.length,
    errors: [],
    needsReingestion: false,
  };

  const syncedFiles: SyncedFile[] = [];
  const updatedManifest = { ...manifest };

  // Process additions and modifications
  const toDownload = [...diff.added, ...diff.modified];

  for (const file of toDownload) {
    try {
      const url = buildRawUrl(config, file.path);
      if (onProgress) onProgress(`Downloading: ${file.path}`);

      const content = await downloadFileContent(url);

      // Write to local filesystem
      const localPath = join(config.destPath, file.path);
      await mkdir(dirname(localPath), { recursive: true });
      await writeFile(localPath, content, 'utf-8');

      // Create synced file entry
      const syncedFile = createSyncedFile(file.path, file.sha, content, file.size);
      syncedFiles.push(syncedFile);
      updatedManifest.files[file.path] = syncedFile;

      if (diff.added.includes(file)) {
        result.added++;
      } else {
        result.modified++;
      }

      // Add small delay to avoid rate limiting
      await sleep(50);
    } catch (error) {
      result.errors.push(`Failed to sync ${file.path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Process deletions
  for (const path of diff.deleted) {
    try {
      const localPath = join(config.destPath, path);
      if (onProgress) onProgress(`Deleting: ${path}`);

      await unlink(localPath);
      delete updatedManifest.files[path];
      result.deleted++;
    } catch (error) {
      // File might already be deleted locally - that's okay
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        result.errors.push(`Failed to delete ${path}: ${error instanceof Error ? error.message : String(error)}`);
      } else {
        // Still count it as deleted and remove from manifest
        delete updatedManifest.files[path];
        result.deleted++;
      }
    }
  }

  // Determine if re-ingestion is needed
  result.needsReingestion = result.added > 0 || result.modified > 0 || result.deleted > 0;
  result.success = result.errors.length === 0;

  // Update manifest timestamp
  updatedManifest.lastSync = new Date().toISOString();

  return { result, syncedFiles, manifest: updatedManifest };
}

/**
 * Verify local files match manifest (for debugging)
 */
export async function verifyLocalFiles(
  config: SyncConfig,
  manifest: SyncManifest
): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = [];

  for (const [path, entry] of Object.entries(manifest.files)) {
    try {
      const localPath = join(config.destPath, path);
      const content = await readFile(localPath, 'utf-8');

      // Check content hash
      const { computeContentHash } = await import('./manifest.js');
      const actualHash = computeContentHash(content);

      if (actualHash !== entry.contentHash) {
        issues.push(`Content mismatch: ${path} (local hash differs from manifest)`);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        issues.push(`Missing file: ${path}`);
      } else {
        issues.push(`Error reading ${path}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
