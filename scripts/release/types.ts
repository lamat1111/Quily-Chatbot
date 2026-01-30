/**
 * Type definitions for the release automation system.
 */

export type BumpType = 'major' | 'minor' | 'patch' | 'none';

export interface ConventionalCommit {
  hash: string;
  shortHash: string;
  type: string;        // feat, fix, chore, etc.
  scope?: string;      // Optional scope in parentheses
  subject: string;     // Commit message subject
  body?: string;       // Full commit body
  breaking: boolean;   // Has breaking change indicator
  date: string;        // ISO date
}

export interface CategorizedCommits {
  features: ConventionalCommit[];
  fixes: ConventionalCommit[];
  chores: ConventionalCommit[];
  docs: ConventionalCommit[];
  styles: ConventionalCommit[];
  refactors: ConventionalCommit[];
  tests: ConventionalCommit[];
  breaking: ConventionalCommit[];
  other: ConventionalCommit[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  commits: CategorizedCommits;
}

export interface ReleaseOptions {
  dryRun: boolean;
  skipTag: boolean;
  skipCommit: boolean;
  force?: BumpType;    // Override automatic bump detection
}

export interface ReleaseResult {
  previousVersion: string;
  newVersion: string;
  bumpType: BumpType;
  commits: ConventionalCommit[];
  changelogEntry: string;
  tagged: boolean;
  committed: boolean;
}

export interface PrepareResult {
  currentVersion: string;
  latestTag: string | null;
  commits: ConventionalCommit[];
  categorized: CategorizedCommits;
  recommendedBump: BumpType;
  newVersion: string;
  changelogPreview: string;
}
