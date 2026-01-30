#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { spawn } from 'child_process';
import type { SyncConfig, SyncOptions } from './types.js';
import { fetchAllMarkdownFiles } from './github.js';
import { loadManifest, saveManifest, createEmptyManifest } from './manifest.js';
import { computeDiff, formatDiffSummary, hasChanges } from './diff.js';
import { executeSync } from './sync.js';

// Default configuration for Quilibrium docs
const DEFAULT_CONFIG: SyncConfig = {
  owner: 'QuilibriumNetwork',
  repo: 'docs',
  sourcePath: 'docs',
  branch: 'main',
  destPath: './docs/quilibrium-official',
};

const program = new Command();

program
  .name('sync-docs')
  .description('Sync documentation from Quilibrium GitHub repository')
  .version('1.0.0');

program
  .command('sync')
  .description('Sync docs from GitHub to local directory')
  .option('--dry-run', 'Show what would change without modifying files', false)
  .option('--force', 'Force re-download all files (ignore manifest)', false)
  .option('--ingest', 'Automatically run RAG ingestion after sync', false)
  .option('--verbose', 'Show detailed progress', false)
  .action(async (options: SyncOptions) => {
    const spinner = ora();

    console.log(chalk.blue('\n📚 Quilibrium Docs Sync\n'));
    console.log(chalk.gray(`  Source: github.com/${DEFAULT_CONFIG.owner}/${DEFAULT_CONFIG.repo}/${DEFAULT_CONFIG.sourcePath}`));
    console.log(chalk.gray(`  Branch: ${DEFAULT_CONFIG.branch}`));
    console.log(chalk.gray(`  Destination: ${DEFAULT_CONFIG.destPath}`));
    console.log(chalk.gray(`  Mode: ${options.dryRun ? 'dry-run' : options.force ? 'force sync' : 'incremental'}\n`));

    try {
      // Step 1: Load local manifest (unless force)
      spinner.start('Loading local manifest...');
      let manifest = options.force ? null : await loadManifest(DEFAULT_CONFIG.destPath);

      if (manifest) {
        spinner.succeed(`Found manifest (last sync: ${new Date(manifest.lastSync).toLocaleString()})`);
      } else {
        spinner.succeed('No manifest found - will download all files');
        manifest = createEmptyManifest(DEFAULT_CONFIG);
      }

      // Step 2: Fetch remote file list
      spinner.start('Fetching file list from GitHub...');
      const remoteFiles = await fetchAllMarkdownFiles(
        DEFAULT_CONFIG,
        '',
        options.verbose ? (path) => { spinner.text = path; } : undefined
      );
      spinner.succeed(`Found ${remoteFiles.length} markdown files on GitHub`);

      // Step 3: Compute diff
      spinner.start('Computing changes...');
      const diff = computeDiff(remoteFiles, options.force ? null : manifest);
      spinner.succeed('Diff computed');

      // Display diff summary
      console.log(chalk.blue('\n📋 Changes:\n'));
      console.log(formatDiffSummary(diff));
      console.log();

      // Exit early if no changes
      if (!hasChanges(diff)) {
        console.log(chalk.green('✅ Already up to date!\n'));
        return;
      }

      // Dry-run mode stops here
      if (options.dryRun) {
        console.log(chalk.yellow('🔍 Dry run - no changes made\n'));
        console.log(chalk.gray('Run without --dry-run to apply these changes\n'));
        return;
      }

      // Step 4: Execute sync
      spinner.start('Syncing files...');
      const { result, manifest: updatedManifest } = await executeSync(
        DEFAULT_CONFIG,
        diff,
        manifest,
        options.verbose ? (msg) => { spinner.text = msg; } : undefined
      );

      if (result.success) {
        spinner.succeed(`Sync complete: +${result.added} ~${result.modified} -${result.deleted}`);
      } else {
        spinner.warn(`Sync completed with ${result.errors.length} error(s)`);
        for (const error of result.errors) {
          console.error(chalk.red(`  - ${error}`));
        }
      }

      // Step 5: Save updated manifest
      spinner.start('Saving manifest...');
      await saveManifest(DEFAULT_CONFIG.destPath, updatedManifest);
      spinner.succeed('Manifest saved');

      // Step 6: Run ingestion if requested and needed
      if (options.ingest && result.needsReingestion) {
        console.log(chalk.blue('\n🔄 Running RAG ingestion...\n'));
        await runIngestion();
      } else if (result.needsReingestion) {
        console.log(chalk.yellow('\n⚠️  Documents changed - run `yarn ingest run` to update RAG knowledge base\n'));
      }

      console.log(chalk.green('✅ Sync complete!\n'));
    } catch (error) {
      spinner.fail('Sync failed');
      console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : String(error)}\n`));
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show sync status without making changes')
  .action(async () => {
    const spinner = ora();

    try {
      spinner.start('Loading manifest...');
      const manifest = await loadManifest(DEFAULT_CONFIG.destPath);

      if (!manifest) {
        spinner.info('No manifest found - docs have not been synced yet');
        console.log(chalk.gray('\nRun `yarn sync-docs sync` to download docs\n'));
        return;
      }

      spinner.succeed(`Manifest loaded (${Object.keys(manifest.files).length} files tracked)`);

      console.log(chalk.blue('\n📊 Sync Status\n'));
      console.log(`  Last sync: ${new Date(manifest.lastSync).toLocaleString()}`);
      console.log(`  Source: ${manifest.source.owner}/${manifest.source.repo}/${manifest.source.path}`);
      console.log(`  Branch: ${manifest.source.branch}`);
      console.log(`  Files tracked: ${Object.keys(manifest.files).length}`);

      // Check for remote changes
      spinner.start('Checking for remote changes...');
      const remoteFiles = await fetchAllMarkdownFiles(DEFAULT_CONFIG);
      const diff = computeDiff(remoteFiles, manifest);
      spinner.succeed('Remote check complete');

      console.log(chalk.blue('\n📋 Remote Changes:\n'));
      console.log(formatDiffSummary(diff));
      console.log();

      if (hasChanges(diff)) {
        console.log(chalk.yellow('Run `yarn sync-docs sync` to update\n'));
      }
    } catch (error) {
      spinner.fail('Status check failed');
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('verify')
  .description('Verify local files match manifest')
  .action(async () => {
    const spinner = ora();

    try {
      spinner.start('Loading manifest...');
      const manifest = await loadManifest(DEFAULT_CONFIG.destPath);

      if (!manifest) {
        spinner.info('No manifest found - nothing to verify');
        return;
      }

      spinner.start('Verifying local files...');
      const { verifyLocalFiles } = await import('./sync.js');
      const { valid, issues } = await verifyLocalFiles(DEFAULT_CONFIG, manifest);

      if (valid) {
        spinner.succeed(`All ${Object.keys(manifest.files).length} files verified`);
      } else {
        spinner.warn(`Found ${issues.length} issue(s)`);
        for (const issue of issues) {
          console.log(chalk.yellow(`  - ${issue}`));
        }
        console.log(chalk.gray('\nRun `yarn sync-docs sync --force` to fix\n'));
      }
    } catch (error) {
      spinner.fail('Verification failed');
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

/**
 * Run the ingestion pipeline
 */
async function runIngestion(): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('yarn', ['ingest', 'run'], {
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Ingestion failed with code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

program.parse();
