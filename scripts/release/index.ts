#!/usr/bin/env node
/**
 * Automated release CLI for Quily Chat.
 *
 * Commands:
 *   yarn release           - Show help
 *   yarn release prepare   - Analyze commits and preview release
 *   yarn release run       - Execute release (bump + changelog + commit + tag)
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import type { BumpType, PrepareResult, ReleaseOptions } from './types.js';
import { categorizeCommits, detectBumpType } from './commit-parser.js';
import {
  getLatestTag,
  getCommitsSince,
  hasUncommittedChanges,
  getCurrentBranch,
  createTag,
  stageFiles,
  createCommit,
  getRepoUrl,
  tagExists,
} from './git.js';
import {
  generateChangelogEntry,
  readChangelog,
  writeChangelog,
  createChangelogEntry,
  getCommitSummary,
} from './changelog.js';

// Version file path
const VERSION_FILE = path.join(process.cwd(), 'src/lib/version.ts');
const CHANGELOG_FILE = path.join(process.cwd(), 'CHANGELOG.md');

/**
 * Get current version from version.ts
 */
function getCurrentVersion(): string {
  const content = fs.readFileSync(VERSION_FILE, 'utf-8');
  const match = content.match(/VERSION\s*=\s*['"]([^'"]+)['"]/);
  if (!match) {
    throw new Error('Could not find VERSION in version.ts');
  }
  return match[1];
}

/**
 * Update version.ts with new version
 */
function updateVersionFile(newVersion: string): void {
  let content = fs.readFileSync(VERSION_FILE, 'utf-8');
  content = content.replace(
    /VERSION\s*=\s*['"][^'"]+['"]/,
    `VERSION = '${newVersion}'`
  );
  fs.writeFileSync(VERSION_FILE, content);
}

/**
 * Calculate new version based on bump type
 */
function bumpVersion(current: string, type: BumpType): string {
  if (type === 'none') return current;

  const parts = current.split('.').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid version format: ${current}`);
  }

  const [major, minor, patch] = parts;

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      return current;
  }
}

/**
 * Prepare release - analyze commits and return preview
 */
function prepareRelease(forceBump?: BumpType): PrepareResult {
  const currentVersion = getCurrentVersion();
  const latestTag = getLatestTag();
  const commits = getCommitsSince(latestTag);
  const categorized = categorizeCommits(commits);
  const recommendedBump = forceBump || detectBumpType(commits);
  const newVersion = bumpVersion(currentVersion, recommendedBump);
  const repoUrl = getRepoUrl() || undefined;

  const entry = createChangelogEntry(newVersion, categorized);
  const changelogPreview = generateChangelogEntry(entry, repoUrl);

  return {
    currentVersion,
    latestTag,
    commits,
    categorized,
    recommendedBump,
    newVersion,
    changelogPreview,
  };
}

// CLI program
const program = new Command();

program
  .name('release')
  .description('Automated versioning and changelog generation for Quily Chat')
  .version('1.0.0');

program
  .command('prepare')
  .description('Analyze commits and preview what would be released')
  .option('--force <type>', 'Force bump type (major|minor|patch)')
  .action(async (options: { force?: string }) => {
    const spinner = ora();

    console.log(chalk.blue('\n📦 Release Preparation\n'));

    try {
      // Check for uncommitted changes
      if (hasUncommittedChanges()) {
        console.log(chalk.yellow('⚠️  Warning: You have uncommitted changes\n'));
      }

      // Current branch
      const branch = getCurrentBranch();
      console.log(chalk.gray(`  Branch: ${branch}`));

      // Validate force option
      const forceBump = options.force as BumpType | undefined;
      if (forceBump && !['major', 'minor', 'patch'].includes(forceBump)) {
        console.error(chalk.red('Invalid --force value. Use: major, minor, or patch'));
        process.exit(1);
      }

      spinner.start('Analyzing commits...');
      const result = prepareRelease(forceBump);
      spinner.succeed('Analysis complete');

      // Display results
      console.log(chalk.blue('\n📊 Release Preview\n'));
      console.log(`  Current version: ${chalk.cyan(result.currentVersion)}`);
      console.log(`  Latest tag: ${chalk.cyan(result.latestTag || '(none - initial release)')}`);
      console.log(`  Commits to include: ${chalk.cyan(result.commits.length)} commits`);
      console.log(`  Recommended bump: ${chalk.yellow(result.recommendedBump)}`);
      console.log(`  New version: ${chalk.green(result.newVersion)}`);

      // Commit summary
      console.log(chalk.blue('\n📋 Changes Summary\n'));
      console.log(`  ${getCommitSummary(result.categorized)}`);

      // Show changelog preview
      console.log(chalk.blue('\n📝 Changelog Preview\n'));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(result.changelogPreview);
      console.log(chalk.gray('─'.repeat(60)));

      // Next steps
      console.log(chalk.blue('\n🚀 Next Steps\n'));
      console.log('  Run one of these commands to create the release:\n');
      console.log(chalk.gray(`    yarn release run                  # Release as v${result.newVersion}`));
      console.log(chalk.gray('    yarn release run --dry-run        # Preview without changes'));
      console.log(chalk.gray('    yarn release run --force major    # Force major bump'));
      console.log('');
    } catch (error) {
      spinner.fail('Preparation failed');
      console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : String(error)}\n`));
      process.exit(1);
    }
  });

program
  .command('run')
  .description('Execute the release (bump version, update changelog, commit, tag)')
  .option('--dry-run', 'Preview changes without writing files', false)
  .option('--skip-tag', 'Skip creating git tag', false)
  .option('--skip-commit', 'Skip creating release commit', false)
  .option('--force <type>', 'Force bump type (major|minor|patch)')
  .action(async (options: ReleaseOptions & { force?: string }) => {
    const spinner = ora();

    console.log(chalk.blue('\n🚀 Release Execution\n'));

    try {
      // Pre-flight checks
      if (!options.dryRun && hasUncommittedChanges()) {
        console.log(chalk.yellow('⚠️  Warning: You have uncommitted changes'));
        console.log(chalk.gray('   These will be included in the release commit\n'));
      }

      // Validate force option
      const forceBump = options.force as BumpType | undefined;
      if (forceBump && !['major', 'minor', 'patch'].includes(forceBump)) {
        console.error(chalk.red('Invalid --force value. Use: major, minor, or patch'));
        process.exit(1);
      }

      // Prepare release
      spinner.start('Analyzing commits...');
      const result = prepareRelease(forceBump);
      spinner.succeed('Analysis complete');

      // Check if there are commits to release
      if (result.commits.length === 0) {
        console.log(chalk.yellow('\n⚠️  No commits found since last release'));
        console.log(chalk.gray('   Nothing to release\n'));
        process.exit(0);
      }

      // Check if tag already exists
      if (!options.skipTag && tagExists(result.newVersion)) {
        console.error(chalk.red(`\n❌ Tag v${result.newVersion} already exists`));
        console.log(chalk.gray('   Use --skip-tag or bump to a different version\n'));
        process.exit(1);
      }

      // Display what will happen
      console.log(chalk.blue('\n📋 Release Details\n'));
      console.log(`  Version: ${chalk.cyan(result.currentVersion)} → ${chalk.green(result.newVersion)}`);
      console.log(`  Commits: ${chalk.cyan(result.commits.length)}`);
      console.log(`  ${getCommitSummary(result.categorized)}`);

      if (options.dryRun) {
        console.log(chalk.yellow('\n🔍 Dry run - no changes will be made\n'));
        console.log(chalk.blue('📝 Changelog entry that would be created:\n'));
        console.log(chalk.gray('─'.repeat(60)));
        console.log(result.changelogPreview);
        console.log(chalk.gray('─'.repeat(60)));
        console.log(chalk.gray('\nRun without --dry-run to apply these changes\n'));
        return;
      }

      // Step 1: Update version.ts
      spinner.start('Updating version.ts...');
      updateVersionFile(result.newVersion);
      spinner.succeed(`Version updated to ${result.newVersion}`);

      // Step 2: Update CHANGELOG.md
      spinner.start('Updating CHANGELOG.md...');
      const existingChangelog = readChangelog();
      writeChangelog(result.changelogPreview, existingChangelog);
      spinner.succeed('Changelog updated');

      // Step 3: Create commit (if not skipped)
      if (!options.skipCommit) {
        spinner.start('Creating release commit...');
        stageFiles([VERSION_FILE, CHANGELOG_FILE]);
        createCommit(`chore(release): v${result.newVersion}`);
        spinner.succeed('Release commit created');
      }

      // Step 4: Create tag (if not skipped)
      if (!options.skipTag) {
        spinner.start('Creating git tag...');
        createTag(result.newVersion, `Release v${result.newVersion}`);
        spinner.succeed(`Tag v${result.newVersion} created`);
      }

      // Success summary
      console.log(chalk.green('\n✅ Release created successfully!\n'));
      console.log(`  Version: ${chalk.green(`v${result.newVersion}`)}`);
      console.log(`  Commits included: ${result.commits.length}`);

      if (!options.skipCommit) {
        console.log(`  Commit: ${chalk.gray(`chore(release): v${result.newVersion}`)}`);
      }
      if (!options.skipTag) {
        console.log(`  Tag: ${chalk.gray(`v${result.newVersion}`)}`);
      }

      // Next steps
      console.log(chalk.blue('\n📤 Next Steps\n'));
      console.log('  Push your changes to the remote repository:\n');
      if (!options.skipTag) {
        console.log(chalk.cyan('    git push && git push --tags'));
      } else {
        console.log(chalk.cyan('    git push'));
      }
      console.log('');
    } catch (error) {
      spinner.fail('Release failed');
      console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : String(error)}\n`));
      process.exit(1);
    }
  });

program
  .command('tag')
  .description('Create git tag for current version (without bumping)')
  .action(async () => {
    const spinner = ora();

    try {
      const version = getCurrentVersion();

      if (tagExists(version)) {
        console.log(chalk.yellow(`\n⚠️  Tag v${version} already exists\n`));
        process.exit(0);
      }

      spinner.start(`Creating tag v${version}...`);
      createTag(version, `Release v${version}`);
      spinner.succeed(`Tag v${version} created`);

      console.log(chalk.blue('\n📤 Push the tag:\n'));
      console.log(chalk.cyan('    git push --tags\n'));
    } catch (error) {
      spinner.fail('Tag creation failed');
      console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : String(error)}\n`));
      process.exit(1);
    }
  });

program.parse();
