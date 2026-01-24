#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { loadDocuments } from './loader.js';
import { chunkDocuments } from './chunker.js';
import { generateEmbeddings } from './embedder.js';
import { uploadChunks, getChunkCount } from './uploader.js';
import type { IngestOptions } from './types.js';

const program = new Command();

program
  .name('ingest')
  .description('Ingest markdown documentation into Supabase vector database')
  .version('1.0.0');

program
  .command('run')
  .description('Run full ingestion pipeline')
  .option('-d, --docs <path>', 'Path to documentation directory', './docs')
  .option('-v, --version <tag>', 'Version tag for chunks', new Date().toISOString().split('T')[0])
  .option('--dry-run', 'Preview without uploading to database', false)
  .action(async (options: IngestOptions) => {
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
    console.log(chalk.gray(`  Dry run: ${options.dryRun}\n`));

    try {
      // Step 1: Load documents
      spinner.start('Loading markdown files...');
      const documents = await loadDocuments(options.docs);
      spinner.succeed(`Loaded ${documents.length} documents`);

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

program.parse();
