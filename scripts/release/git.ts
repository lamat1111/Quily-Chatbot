/**
 * Git operations for the release system.
 * Windows-compatible implementation.
 */

import { execSync, spawnSync } from 'child_process';
import type { ConventionalCommit } from './types.js';

// Use a delimiter that's unlikely to appear in commit messages
const FIELD_DELIMITER = '<<<FIELD>>>';
const COMMIT_DELIMITER = '<<<COMMIT>>>';

/**
 * Execute a simple git command and return the output.
 */
function execGit(args: string[]): string {
  try {
    const result = spawnSync('git', args, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (result.error) {
      throw result.error;
    }

    if (result.status !== 0) {
      throw new Error(result.stderr || 'Git command failed');
    }

    return result.stdout.trim();
  } catch (error) {
    const err = error as Error;
    throw new Error(`Git command failed: ${err.message}`);
  }
}

/**
 * Get the latest version tag (e.g., v0.1.0).
 * Returns null if no version tags exist.
 */
export function getLatestTag(): string | null {
  try {
    const output = execGit(['tag', '-l', 'v*.*.*', '--sort=-version:refname']);

    if (!output) return null;

    const tags = output.split('\n').filter(Boolean);
    return tags[0] || null;
  } catch {
    return null;
  }
}

/**
 * Parse a raw commit entry into a ConventionalCommit object.
 */
function parseCommitEntry(entry: string): ConventionalCommit | null {
  const parts = entry.split(FIELD_DELIMITER);
  if (parts.length < 4) return null;

  const [hash, shortHash, date, subject, ...bodyParts] = parts;
  const body = bodyParts.join(FIELD_DELIMITER).trim();

  // Parse subject for conventional commit format
  // Matches: type(scope)!: subject or type!: subject or type: subject
  const match = subject.match(/^(\w+)(?:\(([^)]+)\))?(!)?\s*:\s*(.+)$/);

  if (!match) {
    // Non-conventional commit
    return {
      hash: hash.trim(),
      shortHash: shortHash.trim(),
      date: date.trim(),
      type: 'other',
      subject: subject.trim(),
      body: body || undefined,
      breaking: false,
    };
  }

  const [, type, scope, bang, commitSubject] = match;

  // Check for breaking change indicators
  const breaking =
    bang === '!' ||
    body.includes('BREAKING CHANGE:') ||
    body.includes('BREAKING-CHANGE:');

  return {
    hash: hash.trim(),
    shortHash: shortHash.trim(),
    date: date.trim(),
    type: type.toLowerCase(),
    scope: scope?.trim(),
    subject: commitSubject.trim(),
    body: body || undefined,
    breaking,
  };
}

/**
 * Get all commits since a reference point (tag or null for all commits).
 * Returns commits in chronological order (oldest first).
 */
export function getCommitsSince(ref: string | null): ConventionalCommit[] {
  // Use a format with custom delimiters that work on Windows
  const format = `%H${FIELD_DELIMITER}%h${FIELD_DELIMITER}%aI${FIELD_DELIMITER}%s${FIELD_DELIMITER}%b${COMMIT_DELIMITER}`;

  const args = ref === null
    ? ['log', `--format=${format}`, '--reverse']
    : ['log', `${ref}..HEAD`, `--format=${format}`, '--reverse'];

  const output = execGit(args);
  if (!output) return [];

  // Split by commit delimiter and parse each
  const commits: ConventionalCommit[] = [];
  const entries = output.split(COMMIT_DELIMITER).filter(Boolean);

  for (const entry of entries) {
    const commit = parseCommitEntry(entry.trim());
    if (commit) {
      commits.push(commit);
    }
  }

  return commits;
}

/**
 * Check if the working directory has uncommitted changes.
 */
export function hasUncommittedChanges(): boolean {
  const status = execGit(['status', '--porcelain']);
  return status.length > 0;
}

/**
 * Get the current branch name.
 */
export function getCurrentBranch(): string {
  return execGit(['rev-parse', '--abbrev-ref', 'HEAD']);
}

/**
 * Create a new git tag.
 */
export function createTag(version: string, message: string): void {
  const tag = version.startsWith('v') ? version : `v${version}`;
  execGit(['tag', '-a', tag, '-m', message]);
}

/**
 * Stage specific files for commit.
 */
export function stageFiles(files: string[]): void {
  execGit(['add', ...files]);
}

/**
 * Create a commit with the given message.
 */
export function createCommit(message: string): void {
  execGit(['commit', '-m', message]);
}

/**
 * Get the repository URL from git remote.
 * Converts SSH URLs to HTTPS for changelog links.
 */
export function getRepoUrl(): string | null {
  try {
    let url = execGit(['remote', 'get-url', 'origin']);

    // Convert SSH to HTTPS
    // git@github.com:user/repo.git -> https://github.com/user/repo
    if (url.startsWith('git@')) {
      url = url
        .replace('git@', 'https://')
        .replace(':', '/')
        .replace(/\.git$/, '');
    }

    // Remove .git suffix from HTTPS URLs
    url = url.replace(/\.git$/, '');

    return url;
  } catch {
    return null;
  }
}

/**
 * Check if a tag already exists.
 */
export function tagExists(version: string): boolean {
  const tag = version.startsWith('v') ? version : `v${version}`;
  try {
    execGit(['rev-parse', tag]);
    return true;
  } catch {
    return false;
  }
}
