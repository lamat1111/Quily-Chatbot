/**
 * Conventional commit categorization and bump type detection.
 */

import type { ConventionalCommit, CategorizedCommits, BumpType } from './types.js';

/**
 * Categorize commits by type.
 */
export function categorizeCommits(commits: ConventionalCommit[]): CategorizedCommits {
  const result: CategorizedCommits = {
    features: [],
    fixes: [],
    chores: [],
    docs: [],
    styles: [],
    refactors: [],
    tests: [],
    breaking: [],
    other: [],
  };

  for (const commit of commits) {
    // Breaking changes go to their own category (in addition to their type)
    if (commit.breaking) {
      result.breaking.push(commit);
    }

    // Categorize by type
    switch (commit.type) {
      case 'feat':
        result.features.push(commit);
        break;
      case 'fix':
        result.fixes.push(commit);
        break;
      case 'chore':
        result.chores.push(commit);
        break;
      case 'doc':
      case 'docs':
        result.docs.push(commit);
        break;
      case 'style':
        result.styles.push(commit);
        break;
      case 'refactor':
        result.refactors.push(commit);
        break;
      case 'test':
      case 'tests':
        result.tests.push(commit);
        break;
      default:
        result.other.push(commit);
    }
  }

  return result;
}

/**
 * Determine the appropriate version bump based on commits.
 */
export function detectBumpType(commits: ConventionalCommit[]): BumpType {
  if (commits.length === 0) {
    return 'none';
  }

  // Priority 1: Any breaking change = major
  if (commits.some(c => c.breaking)) {
    return 'major';
  }

  // Priority 2: Any feat = minor
  if (commits.some(c => c.type === 'feat')) {
    return 'minor';
  }

  // Priority 3: Any recognized type = patch
  const patchTypes = ['fix', 'chore', 'doc', 'docs', 'style', 'refactor', 'test', 'tests'];
  if (commits.some(c => patchTypes.includes(c.type))) {
    return 'patch';
  }

  // Unrecognized commits only - still bump patch
  return 'patch';
}

/**
 * Format a commit for changelog display.
 */
export function formatCommit(commit: ConventionalCommit, repoUrl?: string): string {
  const scope = commit.scope ? `**${commit.scope}**: ` : '';
  const subject = `${scope}${commit.subject}`;

  if (repoUrl) {
    return `- ${subject} ([${commit.shortHash}](${repoUrl}/commit/${commit.hash}))`;
  }
  return `- ${subject} (${commit.shortHash})`;
}
