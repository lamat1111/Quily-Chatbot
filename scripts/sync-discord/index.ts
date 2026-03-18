#!/usr/bin/env node
// scripts/sync-discord/index.ts
import 'dotenv/config';
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import type { ChannelConfig } from './types.js';
import { fetchChannel, fetchMessages } from './discord-api.js';
import { writeMarkdownFiles } from './formatter.js';
import { loadManifest, saveManifest, createEmptyManifest } from './manifest.js';
import { cleanOldAnnouncements } from './cleanup.js';

const DEST_PATH = './docs/discord-announcements';

/**
 * Parse channel config from env var.
 * Format: "id1:name1,id2:name2" or just "id1,id2" (names fetched from API).
 */
function parseChannelConfig(envValue: string): ChannelConfig[] {
  return envValue.split(',').map((entry) => {
    const trimmed = entry.trim();
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx > 0) {
      return { id: trimmed.slice(0, colonIdx), name: trimmed.slice(colonIdx + 1) };
    }
    return { id: trimmed, name: '' }; // Name will be fetched from API
  });
}

const program = new Command();

program
  .name('sync-discord')
  .description('Scrape Discord announcement channels and convert to markdown for RAG ingestion')
  .version('1.0.0');

program
  .command('sync')
  .description('Fetch new announcements and write markdown files')
  .option('--dry-run', 'Show what would be fetched without writing files', false)
  .action(async (options: { dryRun: boolean }) => {
    const spinner = ora();
    const token = process.env.DISCORD_BOT_TOKEN;
    const channelIdsRaw = process.env.DISCORD_CHANNEL_IDS;

    if (!token) {
      console.error(chalk.red('Error: DISCORD_BOT_TOKEN environment variable is required'));
      process.exit(1);
    }
    if (!channelIdsRaw) {
      console.error(chalk.red('Error: DISCORD_CHANNEL_IDS environment variable is required'));
      console.error(chalk.gray('Format: "channel_id:name,channel_id:name" or "channel_id,channel_id"'));
      process.exit(1);
    }

    const channels = parseChannelConfig(channelIdsRaw);

    console.log(chalk.blue('\n📢 Discord Announcements Sync\n'));
    console.log(chalk.gray(`  Channels: ${channels.length}`));
    console.log(chalk.gray(`  Destination: ${DEST_PATH}`));
    console.log(chalk.gray(`  Mode: ${options.dryRun ? 'dry-run' : 'sync'}\n`));

    try {
      // Load manifest (stored at repo root as .discord-manifest.json)
      spinner.start('Loading manifest...');
      let manifest = await loadManifest();
      if (manifest) {
        spinner.succeed(`Manifest loaded (last run: ${new Date(manifest.lastRun).toLocaleString()})`);
      } else {
        manifest = createEmptyManifest();
        spinner.succeed('No manifest found — will fetch all recent messages');
      }

      let totalNew = 0;

      for (const channel of channels) {
        // Resolve channel name and guild ID from API
        let channelName = channel.name;
        let guildId = channel.guildId || '';

        if (!channelName || !guildId) {
          spinner.start(`Fetching channel info for ${channel.id}...`);
          const info = await fetchChannel(token, channel.id);
          if (!channelName) channelName = info.name;
          if (!guildId) guildId = info.guild_id;
          spinner.succeed(`Channel: #${channelName} (guild: ${guildId})`);
        }

        // Get last message ID from manifest
        const lastId = manifest.channels[channel.id]?.lastMessageId || null;
        const sinceLabel = lastId ? `after message ${lastId}` : 'all recent';

        spinner.start(`Fetching messages from #${channelName} (${sinceLabel})...`);
        const messages = await fetchMessages(token, channel.id, lastId);
        spinner.succeed(`#${channelName}: ${messages.length} new message(s)`);

        if (messages.length === 0) continue;

        totalNew += messages.length;

        if (!options.dryRun) {
          spinner.start(`Writing markdown for #${channelName}...`);
          const dates = await writeMarkdownFiles(messages, channelName, channel.id, guildId, DEST_PATH);
          spinner.succeed(`Wrote ${dates.length} file(s) for #${channelName}`);

          // Update manifest
          manifest.channels[channel.id] = {
            lastMessageId: messages[messages.length - 1].id,
            name: channelName,
            lastScraped: new Date().toISOString(),
          };
        } else {
          // In dry-run, show sample
          const sample = messages[0];
          const author = sample.author.global_name || sample.author.username;
          console.log(chalk.gray(`    Sample: [${author}] ${sample.content.slice(0, 80)}...`));
        }
      }

      // Clean old files
      if (!options.dryRun) {
        spinner.start('Cleaning files older than 28 days...');
        const deleted = await cleanOldAnnouncements(DEST_PATH);
        if (deleted.length > 0) {
          spinner.succeed(`Deleted ${deleted.length} old file(s)`);
        } else {
          spinner.succeed('No old files to clean');
        }

        // Save manifest
        manifest.lastRun = new Date().toISOString();
        await saveManifest(manifest);
      }

      console.log();
      if (totalNew > 0) {
        console.log(chalk.green(`✅ ${options.dryRun ? 'Found' : 'Synced'} ${totalNew} new message(s)\n`));
      } else {
        console.log(chalk.green('✅ No new announcements\n'));
      }
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

    spinner.start('Loading manifest...');
    const manifest = await loadManifest();

    if (!manifest) {
      spinner.info('No manifest found — Discord announcements have not been synced yet');
      console.log(chalk.gray('\nRun `yarn sync-discord sync` to start\n'));
      return;
    }

    spinner.succeed('Manifest loaded');
    console.log(chalk.blue('\n📊 Discord Sync Status\n'));
    console.log(`  Last run: ${new Date(manifest.lastRun).toLocaleString()}`);
    console.log(`  Channels tracked: ${Object.keys(manifest.channels).length}`);

    for (const [id, entry] of Object.entries(manifest.channels)) {
      console.log(`\n  #${entry.name} (${id})`);
      console.log(`    Last message ID: ${entry.lastMessageId || 'none'}`);
      console.log(`    Last scraped: ${new Date(entry.lastScraped).toLocaleString()}`);
    }
    console.log();
  });

program.parse();
