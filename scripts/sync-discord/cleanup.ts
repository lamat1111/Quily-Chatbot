// scripts/sync-discord/cleanup.ts
import { readdir, unlink, rmdir } from 'fs/promises';
import { join } from 'path';

const ROLLING_WINDOW_DAYS = 28;
const MIN_FILES_PER_CHANNEL = 3;

/**
 * Delete announcement markdown files older than the rolling window,
 * but always keep at least MIN_FILES_PER_CHANNEL most recent files per channel.
 * Returns list of deleted file paths.
 */
export async function cleanOldAnnouncements(destPath: string): Promise<string[]> {
  const cutoffDate = new Date();
  cutoffDate.setUTCDate(cutoffDate.getUTCDate() - ROLLING_WINDOW_DAYS);
  const cutoffStr = cutoffDate.toISOString().split('T')[0]; // YYYY-MM-DD

  const deleted: string[] = [];

  // Read channel directories
  let channelDirs: string[];
  try {
    channelDirs = await readdir(destPath);
  } catch {
    return []; // Directory doesn't exist yet
  }

  for (const channelDir of channelDirs) {
    const channelPath = join(destPath, channelDir);

    let files: string[];
    try {
      files = await readdir(channelPath);
    } catch {
      continue;
    }

    // Collect dated files and sort newest-first
    const datedFiles = files
      .map(file => {
        const match = file.match(/^(\d{4}-\d{2}-\d{2})\.md$/);
        return match ? { file, date: match[1] } : null;
      })
      .filter((f): f is { file: string; date: string } => f !== null)
      .sort((a, b) => b.date.localeCompare(a.date));

    // Always keep at least MIN_FILES_PER_CHANNEL, delete the rest if older than cutoff
    for (let i = 0; i < datedFiles.length; i++) {
      if (i < MIN_FILES_PER_CHANNEL) continue; // always keep the newest N
      if (datedFiles[i].date < cutoffStr) {
        const filePath = join(channelPath, datedFiles[i].file);
        await unlink(filePath);
        deleted.push(filePath);
      }
    }

    // Remove empty channel directories
    try {
      const remaining = await readdir(channelPath);
      if (remaining.length === 0) {
        await rmdir(channelPath);
      }
    } catch {
      // Ignore
    }
  }

  return deleted;
}
