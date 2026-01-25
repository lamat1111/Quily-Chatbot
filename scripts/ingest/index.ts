#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { loadDocuments } from './loader.js';
import { chunkDocuments } from './chunker.js';
import { generateEmbeddings } from './embedder.js';
import { uploadChunks, getChunkCount, cleanOrphanedChunks } from './uploader.js';
import type { IngestOptions } from './types.js';

interface ExtendedIngestOptions extends IngestOptions {
  clean: boolean;
}

const program = new Command();

program
  .name('ingest')
  .description('Ingest documentation into Supabase vector database')
  .version('1.0.0');

program
  .command('run')
  .description('Run full ingestion pipeline')
  .option('-d, --docs <path>', 'Path to documentation directory', './docs')
  .option('-v, --version <tag>', 'Version tag for chunks', new Date().toISOString().split('T')[0])
  .option('--dry-run', 'Preview without uploading to database', false)
  .option('--clean', 'Remove chunks for deleted files before ingesting', false)
  .action(async (options: ExtendedIngestOptions) => {
    const spinner = ora();

    // Validate environment
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY, OPENROUTER_API_KEY } = process.env;

    if (!options.dryRun) {
      if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error(chalk.red('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set'));
        console.error(chalk.gray('Create a .env file with these values from your Supabase dashboard'));
        process.exit(1);
      }
      if (!OPENROUTER_API_KEY) {
        console.error(chalk.red('Error: OPENROUTER_API_KEY must be set'));
        console.error(chalk.gray('Get your API key from https://openrouter.ai/keys'));
        process.exit(1);
      }
    }

    console.log(chalk.blue('\n📚 Quilibrium Docs Ingestion Pipeline\n'));
    console.log(chalk.gray(`  Docs path: ${options.docs}`));
    console.log(chalk.gray(`  Version: ${options.version}`));
    console.log(chalk.gray(`  Clean orphans: ${options.clean}`));
    console.log(chalk.gray(`  Dry run: ${options.dryRun}\n`));

    try {
      // Step 1: Load documents
      spinner.start('Loading documents...');
      const documents = await loadDocuments(options.docs);
      spinner.succeed(`Loaded ${documents.length} documents`);

      // Step 1.5: Clean orphaned chunks if requested
      if (options.clean && !options.dryRun) {
        spinner.start('Checking for orphaned chunks...');
        const localFiles = documents.map((d) => d.path);
        const { deletedFiles, deletedChunks } = await cleanOrphanedChunks(
          localFiles,
          SUPABASE_URL!,
          SUPABASE_SERVICE_KEY!,
          (msg) => {
            spinner.text = msg;
          }
        );

        if (deletedFiles.length > 0) {
          spinner.succeed(`Removed ${deletedChunks} chunks from ${deletedFiles.length} deleted file(s)`);
          for (const file of deletedFiles.slice(0, 5)) {
            console.log(chalk.gray(`    - ${file}`));
          }
          if (deletedFiles.length > 5) {
            console.log(chalk.gray(`    ... and ${deletedFiles.length - 5} more`));
          }
        } else {
          spinner.succeed('No orphaned chunks found');
        }
      } else if (options.clean && options.dryRun) {
        spinner.info('Skipping clean in dry-run mode');
      }

      // Step 2: Chunk documents
      spinner.start('Chunking documents...');
      const chunks = await chunkDocuments(documents, options.version);
      const totalTokens = chunks.reduce((sum, c) => sum + c.metadata.token_count, 0);
      spinner.succeed(`Created ${chunks.length} chunks (${totalTokens.toLocaleString()} tokens total)`);

      // In dry-run mode, show sample and exit
      if (options.dryRun) {
        console.log(chalk.yellow('\n🔍 Dry run - sample chunks:\n'));
        const samples = chunks.slice(0, 3);
        for (const sample of samples) {
          console.log(chalk.gray('─'.repeat(60)));
          console.log(chalk.white(`Source: ${sample.metadata.source_file}`));
          console.log(chalk.white(`Heading: ${sample.metadata.heading_path || '(none)'}`));
          console.log(chalk.white(`Tokens: ${sample.metadata.token_count}`));
          console.log(chalk.gray(sample.content.slice(0, 200) + '...'));
        }
        console.log(chalk.gray('─'.repeat(60)));
        console.log(chalk.green('\n✅ Dry run complete. Add real credentials and remove --dry-run to upload.\n'));
        return;
      }

      // Step 3: Generate embeddings
      spinner.start('Generating embeddings...');
      const embeddedChunks = await generateEmbeddings(
        chunks,
        OPENROUTER_API_KEY!,
        (completed, total) => {
          spinner.text = `Generating embeddings... ${completed}/${total}`;
        }
      );
      spinner.succeed(`Generated ${embeddedChunks.length} embeddings`);

      // Step 4: Upload to Supabase
      spinner.start('Uploading to Supabase...');
      const { inserted, errors } = await uploadChunks(
        embeddedChunks,
        SUPABASE_URL!,
        SUPABASE_SERVICE_KEY!,
        (completed, total) => {
          spinner.text = `Uploading to Supabase... ${completed}/${total}`;
        }
      );

      if (errors.length > 0) {
        spinner.warn(`Uploaded ${inserted} chunks with ${errors.length} errors`);
        for (const err of errors) {
          console.error(chalk.red(`  - ${err}`));
        }
      } else {
        spinner.succeed(`Uploaded ${inserted} chunks`);
      }

      // Step 5: Verify
      spinner.start('Verifying...');
      const totalCount = await getChunkCount(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);
      spinner.succeed(`Total chunks in database: ${totalCount}`);

      console.log(chalk.green('\n✅ Ingestion complete!\n'));
    } catch (error) {
      spinner.fail('Ingestion failed');
      console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : String(error)}\n`));
      process.exit(1);
    }
  });

program
  .command('clean')
  .description('Remove chunks for files that no longer exist in docs folder')
  .option('-d, --docs <path>', 'Path to documentation directory', './docs')
  .option('--dry-run', 'Preview what would be deleted without making changes', false)
  .action(async (options: { docs: string; dryRun: boolean }) => {
    const spinner = ora();

    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error(chalk.red('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set'));
      process.exit(1);
    }

    console.log(chalk.blue('\n🧹 Clean Orphaned Chunks\n'));
    console.log(chalk.gray(`  Docs path: ${options.docs}`));
    console.log(chalk.gray(`  Dry run: ${options.dryRun}\n`));

    try {
      // Load current documents to get local file list
      spinner.start('Loading local documents...');
      const documents = await loadDocuments(options.docs);
      const localFiles = documents.map((d) => d.path);
      spinner.succeed(`Found ${localFiles.length} local documents`);

      // Get files in database
      spinner.start('Checking database...');
      const { getSourceFilesInDatabase } = await import('./uploader.js');
      const dbFiles = await getSourceFilesInDatabase(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      spinner.succeed(`Found ${dbFiles.length} source files in database`);

      // Find orphans
      const localFileSet = new Set(localFiles.map((f) => f.replace(/\\/g, '/')));
      const orphanedFiles = dbFiles.filter((dbFile) => !localFileSet.has(dbFile));

      if (orphanedFiles.length === 0) {
        console.log(chalk.green('\n✅ No orphaned chunks found - database is in sync!\n'));
        return;
      }

      console.log(chalk.yellow(`\n⚠️  Found ${orphanedFiles.length} orphaned file(s):\n`));
      for (const file of orphanedFiles) {
        console.log(chalk.gray(`    - ${file}`));
      }

      if (options.dryRun) {
        console.log(chalk.yellow('\n🔍 Dry run - no changes made\n'));
        console.log(chalk.gray('Run without --dry-run to remove these chunks\n'));
        return;
      }

      // Actually delete
      spinner.start('Removing orphaned chunks...');
      const { deletedFiles, deletedChunks } = await cleanOrphanedChunks(
        localFiles,
        SUPABASE_URL,
        SUPABASE_SERVICE_KEY,
        (msg) => {
          spinner.text = msg;
        }
      );

      spinner.succeed(`Removed ${deletedChunks} chunks from ${deletedFiles.length} file(s)`);
      console.log(chalk.green('\n✅ Cleanup complete!\n'));
    } catch (error) {
      spinner.fail('Cleanup failed');
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('count')
  .description('Count chunks in database')
  .action(async () => {
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error(chalk.red('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set'));
      process.exit(1);
    }

    try {
      const count = await getChunkCount(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      console.log(chalk.blue(`\n📊 Total chunks in database: ${count}\n`));
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show sync status between local docs and database')
  .option('-d, --docs <path>', 'Path to documentation directory', './docs')
  .action(async (options: { docs: string }) => {
    const spinner = ora();

    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error(chalk.red('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set'));
      process.exit(1);
    }

    try {
      // Load local documents
      spinner.start('Loading local documents...');
      const documents = await loadDocuments(options.docs);
      const localFiles = new Set(documents.map((d) => d.path.replace(/\\/g, '/')));
      spinner.succeed(`Found ${localFiles.size} local documents`);

      // Get database files
      spinner.start('Checking database...');
      const { getSourceFilesInDatabase } = await import('./uploader.js');
      const dbFiles = await getSourceFilesInDatabase(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      const dbFileSet = new Set(dbFiles);
      spinner.succeed(`Found ${dbFiles.length} source files in database`);

      // Calculate differences
      const orphaned = dbFiles.filter((f) => !localFiles.has(f));
      const notIngested = [...localFiles].filter((f) => !dbFileSet.has(f));
      const inSync = [...localFiles].filter((f) => dbFileSet.has(f));

      console.log(chalk.blue('\n📊 Ingestion Status\n'));
      console.log(`  ✅ In sync: ${inSync.length} files`);
      console.log(`  📥 Not ingested: ${notIngested.length} files`);
      console.log(`  🗑️  Orphaned in DB: ${orphaned.length} files`);

      if (notIngested.length > 0) {
        console.log(chalk.yellow('\nFiles not yet ingested:'));
        for (const file of notIngested.slice(0, 5)) {
          console.log(chalk.gray(`    + ${file}`));
        }
        if (notIngested.length > 5) {
          console.log(chalk.gray(`    ... and ${notIngested.length - 5} more`));
        }
      }

      if (orphaned.length > 0) {
        console.log(chalk.yellow('\nOrphaned files (deleted locally but still in DB):'));
        for (const file of orphaned.slice(0, 5)) {
          console.log(chalk.gray(`    - ${file}`));
        }
        if (orphaned.length > 5) {
          console.log(chalk.gray(`    ... and ${orphaned.length - 5} more`));
        }
      }

      // Recommendations
      console.log();
      if (notIngested.length > 0 || orphaned.length > 0) {
        console.log(chalk.gray('To sync database with local docs:'));
        console.log(chalk.gray('  npm run ingest run --clean\n'));
      } else {
        console.log(chalk.green('✅ Database is fully in sync with local docs!\n'));
      }
    } catch (error) {
      spinner.fail('Status check failed');
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program.parse();
