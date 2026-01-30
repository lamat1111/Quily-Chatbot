/**
 * Changelog generation and management.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ChangelogEntry, CategorizedCommits, ConventionalCommit } from './types.js';
import { formatCommit } from './commit-parser.js';

const CHANGELOG_PATH = path.join(process.cwd(), 'CHANGELOG.md');

const CHANGELOG_HEADER = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;

/**
 * Format commits for a specific section.
 */
function formatSection(
  title: string,
  commits: ConventionalCommit[],
  repoUrl?: string
): string {
  if (commits.length === 0) return '';

  const lines = [`### ${title}\n`];
  for (const commit of commits) {
    lines.push(formatCommit(commit, repoUrl));
  }
  lines.push('');

  return lines.join('\n');
}

/**
 * Generate a changelog entry for a release.
 */
export function generateChangelogEntry(
  entry: ChangelogEntry,
  repoUrl?: string
): string {
  const lines: string[] = [];

  // Version header
  lines.push(`## [${entry.version}] - ${entry.date}\n`);

  // Breaking changes first (important!)
  if (entry.commits.breaking.length > 0) {
    lines.push(formatSection('Breaking Changes', entry.commits.breaking, repoUrl));
  }

  // Features
  lines.push(formatSection('Features', entry.commits.features, repoUrl));

  // Bug Fixes
  lines.push(formatSection('Bug Fixes', entry.commits.fixes, repoUrl));

  // Documentation
  lines.push(formatSection('Documentation', entry.commits.docs, repoUrl));

  // Refactoring
  lines.push(formatSection('Refactoring', entry.commits.refactors, repoUrl));

  // Styles
  lines.push(formatSection('Styles', entry.commits.styles, repoUrl));

  // Tests
  lines.push(formatSection('Tests', entry.commits.tests, repoUrl));

  // Chores (maintenance)
  lines.push(formatSection('Maintenance', entry.commits.chores, repoUrl));

  // Other (non-conventional commits)
  lines.push(formatSection('Other', entry.commits.other, repoUrl));

  return lines.filter(Boolean).join('\n');
}

/**
 * Read existing changelog content.
 * Returns header only if no changelog exists.
 */
export function readChangelog(): string {
  try {
    if (fs.existsSync(CHANGELOG_PATH)) {
      return fs.readFileSync(CHANGELOG_PATH, 'utf-8');
    }
  } catch {
    // Ignore errors
  }
  return CHANGELOG_HEADER;
}

/**
 * Write changelog with new entry prepended.
 */
export function writeChangelog(newEntry: string, existingContent: string): void {
  let content: string;

  if (existingContent === CHANGELOG_HEADER || !existingContent.includes('## [')) {
    // No existing entries - just add header + new entry
    content = CHANGELOG_HEADER + newEntry;
  } else {
    // Insert new entry after the header, before existing entries
    const headerEnd = existingContent.indexOf('\n## [');
    if (headerEnd === -1) {
      // No version entries found, append to end
      content = existingContent + '\n' + newEntry;
    } else {
      // Insert before first version entry
      content =
        existingContent.slice(0, headerEnd) +
        '\n' +
        newEntry +
        existingContent.slice(headerEnd);
    }
  }

  fs.writeFileSync(CHANGELOG_PATH, content);
}

/**
 * Create a changelog entry from categorized commits.
 */
export function createChangelogEntry(
  version: string,
  commits: CategorizedCommits
): ChangelogEntry {
  return {
    version,
    date: new Date().toISOString().split('T')[0],
    commits,
  };
}

/**
 * Generate summary stats for display.
 */
export function getCommitSummary(commits: CategorizedCommits): string {
  const parts: string[] = [];

  if (commits.breaking.length > 0) {
    parts.push(`⚠️  ${commits.breaking.length} breaking`);
  }
  if (commits.features.length > 0) {
    parts.push(`✨ ${commits.features.length} features`);
  }
  if (commits.fixes.length > 0) {
    parts.push(`🐛 ${commits.fixes.length} fixes`);
  }
  if (commits.docs.length > 0) {
    parts.push(`📝 ${commits.docs.length} docs`);
  }
  if (commits.refactors.length > 0) {
    parts.push(`♻️  ${commits.refactors.length} refactors`);
  }
  if (commits.chores.length > 0) {
    parts.push(`🔧 ${commits.chores.length} chores`);
  }
  if (commits.styles.length > 0) {
    parts.push(`💄 ${commits.styles.length} styles`);
  }
  if (commits.tests.length > 0) {
    parts.push(`✅ ${commits.tests.length} tests`);
  }
  if (commits.other.length > 0) {
    parts.push(`📦 ${commits.other.length} other`);
  }

  return parts.join('  ');
}
