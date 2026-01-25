/**
 * Configuration for the docs sync system
 */
export interface SyncConfig {
  /** GitHub repository owner */
  owner: string;
  /** GitHub repository name */
  repo: string;
  /** Path within the repo to sync from */
  sourcePath: string;
  /** Branch to sync from */
  branch: string;
  /** Local destination directory */
  destPath: string;
}

/**
 * Represents a file in the GitHub repository
 */
export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
  download_url: string | null;
}

/**
 * Represents a synced file in the manifest
 */
export interface SyncedFile {
  /** Path relative to docs root */
  path: string;
  /** Git SHA for quick comparison */
  sha: string;
  /** Content hash for integrity */
  contentHash: string;
  /** Last sync timestamp */
  syncedAt: string;
  /** Size in bytes */
  size: number;
}

/**
 * Manifest tracking sync state
 */
export interface SyncManifest {
  /** Last sync timestamp */
  lastSync: string;
  /** Source repository info */
  source: {
    owner: string;
    repo: string;
    branch: string;
    path: string;
  };
  /** Map of file path to sync info */
  files: Record<string, SyncedFile>;
  /** Version of manifest format */
  version: number;
}

/**
 * Result of comparing local vs remote
 */
export interface SyncDiff {
  /** Files that need to be added */
  added: GitHubFile[];
  /** Files that have been modified */
  modified: GitHubFile[];
  /** Files that have been deleted remotely */
  deleted: string[];
  /** Files that are unchanged */
  unchanged: string[];
}

/**
 * Result of a sync operation
 */
export interface SyncResult {
  /** Whether sync was successful */
  success: boolean;
  /** Number of files added */
  added: number;
  /** Number of files modified */
  modified: number;
  /** Number of files deleted */
  deleted: number;
  /** Number of files unchanged */
  unchanged: number;
  /** Any errors encountered */
  errors: string[];
  /** Whether RAG re-ingestion is needed */
  needsReingestion: boolean;
}

/**
 * CLI options for sync command
 */
export interface SyncOptions {
  /** Dry run - show what would change without modifying */
  dryRun: boolean;
  /** Force sync - ignore manifest and re-download all */
  force: boolean;
  /** Auto-run ingestion after sync */
  ingest: boolean;
  /** Verbose output */
  verbose: boolean;
}
