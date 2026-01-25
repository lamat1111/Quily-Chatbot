import type { GitHubFile, SyncManifest, SyncDiff } from './types.js';

/**
 * Compare remote files against local manifest to determine what changed
 */
export function computeDiff(
  remoteFiles: GitHubFile[],
  manifest: SyncManifest | null
): SyncDiff {
  const diff: SyncDiff = {
    added: [],
    modified: [],
    deleted: [],
    unchanged: [],
  };

  // Create a map of remote files by path
  const remoteByPath = new Map<string, GitHubFile>();
  for (const file of remoteFiles) {
    remoteByPath.set(file.path, file);
  }

  // If no manifest, everything is new
  if (!manifest) {
    diff.added = remoteFiles;
    return diff;
  }

  // Check each remote file against manifest
  for (const [path, file] of remoteByPath) {
    const manifestEntry = manifest.files[path];

    if (!manifestEntry) {
      // New file
      diff.added.push(file);
    } else if (manifestEntry.sha !== file.sha) {
      // SHA changed - file was modified
      diff.modified.push(file);
    } else {
      // Unchanged
      diff.unchanged.push(path);
    }
  }

  // Check for deleted files (in manifest but not in remote)
  for (const path of Object.keys(manifest.files)) {
    if (!remoteByPath.has(path)) {
      diff.deleted.push(path);
    }
  }

  return diff;
}

/**
 * Format diff summary for display
 */
export function formatDiffSummary(diff: SyncDiff): string {
  const lines: string[] = [];

  if (diff.added.length > 0) {
    lines.push(`  📥 ${diff.added.length} new file(s) to add`);
    for (const file of diff.added.slice(0, 5)) {
      lines.push(`      + ${file.path}`);
    }
    if (diff.added.length > 5) {
      lines.push(`      ... and ${diff.added.length - 5} more`);
    }
  }

  if (diff.modified.length > 0) {
    lines.push(`  📝 ${diff.modified.length} file(s) modified`);
    for (const file of diff.modified.slice(0, 5)) {
      lines.push(`      ~ ${file.path}`);
    }
    if (diff.modified.length > 5) {
      lines.push(`      ... and ${diff.modified.length - 5} more`);
    }
  }

  if (diff.deleted.length > 0) {
    lines.push(`  🗑️  ${diff.deleted.length} file(s) deleted remotely`);
    for (const path of diff.deleted.slice(0, 5)) {
      lines.push(`      - ${path}`);
    }
    if (diff.deleted.length > 5) {
      lines.push(`      ... and ${diff.deleted.length - 5} more`);
    }
  }

  if (diff.unchanged.length > 0) {
    lines.push(`  ✓ ${diff.unchanged.length} file(s) unchanged`);
  }

  if (lines.length === 0 || (diff.added.length === 0 && diff.modified.length === 0 && diff.deleted.length === 0)) {
    lines.push(`  ✓ All ${diff.unchanged.length} files are up to date`);
  }

  return lines.join('\n');
}

/**
 * Check if diff has any changes
 */
export function hasChanges(diff: SyncDiff): boolean {
  return diff.added.length > 0 || diff.modified.length > 0 || diff.deleted.length > 0;
}
