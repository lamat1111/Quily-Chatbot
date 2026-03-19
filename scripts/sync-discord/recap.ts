#!/usr/bin/env node
// scripts/sync-discord/recap.ts
import 'dotenv/config';
import ora from 'ora';
import chalk from 'chalk';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { fetchChannel, fetchMessages } from './discord-api.js';
import { filterMessages } from './recap-filter.js';
import { summarizeMessages, formatFallbackMarkdown } from './recap-summarizer.js';
import { loadManifest, saveManifest, createEmptyManifest } from './manifest.js';

const DEST_PATH = './docs/discord/general-recap';
const MAX_FIRST_RUN_MESSAGES = 1000;

async function run() {
  const spinner = ora();
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_GENERAL_CHANNEL_ID;

  if (!token) {
    console.error(chalk.red('Error: DISCORD_BOT_TOKEN is required'));
    process.exit(1);
  }
  if (!channelId) {
    console.error(chalk.red('Error: DISCORD_GENERAL_CHANNEL_ID is required'));
    process.exit(1);
  }
  if (!process.env.OPENROUTER_API_KEY) {
    console.error(chalk.red('Error: OPENROUTER_API_KEY is required for recap summarization'));
    process.exit(1);
  }

  console.log(chalk.blue('\n📝 General Channel Recap\n'));

  // Load manifest
  spinner.start('Loading manifest...');
  let manifest = await loadManifest();
  if (!manifest) {
    manifest = createEmptyManifest();
    spinner.succeed('No manifest found — will fetch recent messages');
  } else {
    spinner.succeed(`Manifest loaded (last run: ${new Date(manifest.lastRun).toLocaleString()})`);
  }

  // Fetch channel info
  spinner.start(`Fetching channel info for ${channelId}...`);
  const channelInfo = await fetchChannel(token, channelId);
  spinner.succeed(`Channel: #${channelInfo.name} (guild: ${channelInfo.guild_id})`);

  // Fetch messages
  const lastId = manifest.channels[channelId]?.lastMessageId || null;
  const sinceLabel = lastId ? `after message ${lastId}` : `last ${MAX_FIRST_RUN_MESSAGES}`;
  spinner.start(`Fetching messages from #${channelInfo.name} (${sinceLabel})...`);

  let messages = await fetchMessages(token, channelId, lastId);

  // Cap first-run messages
  if (!lastId && messages.length > MAX_FIRST_RUN_MESSAGES) {
    messages = messages.slice(-MAX_FIRST_RUN_MESSAGES);
  }

  spinner.succeed(`#${channelInfo.name}: ${messages.length} message(s) fetched`);

  if (messages.length === 0) {
    console.log(chalk.green('\n✅ No new messages to recap\n'));
    return;
  }

  // Filter noise
  spinner.start('Filtering noise...');
  const filtered = filterMessages(messages);
  spinner.succeed(`${filtered.length} message(s) after filtering (${messages.length - filtered.length} dropped)`);

  if (filtered.length === 0) {
    console.log(chalk.green('\n✅ No substantive messages to recap\n'));
    // Still update manifest so we don't re-fetch these messages
    manifest.channels[channelId] = {
      lastMessageId: messages[messages.length - 1].id,
      name: channelInfo.name,
      lastScraped: new Date().toISOString(),
    };
    manifest.lastRun = new Date().toISOString();
    await saveManifest(manifest);
    return;
  }

  // Group messages by date and generate recaps
  const dateGroups = new Map<string, typeof filtered>();
  for (const f of filtered) {
    const date = f.message.timestamp.split('T')[0];
    const existing = dateGroups.get(date) || [];
    existing.push(f);
    dateGroups.set(date, existing);
  }

  await mkdir(DEST_PATH, { recursive: true });

  for (const [date, dayFiltered] of dateGroups) {
    spinner.start(`Generating recap for ${date}...`);

    let recapContent: string;
    let usedFallback = false;

    try {
      recapContent = await summarizeMessages(dayFiltered, date);
    } catch (error) {
      console.warn(chalk.yellow(`\n  LLM summarization failed, using fallback: ${error instanceof Error ? error.message : String(error)}`));
      recapContent = formatFallbackMarkdown(dayFiltered);
      usedFallback = true;
    }

    // Format date for title
    const titleDate = new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });

    const sourceUrl = `https://discord.com/channels/${channelInfo.guild_id}/${channelId}`;

    const markdown = [
      '---',
      `title: "Community Recap - ${titleDate}"`,
      'type: discord_recap',
      'channel: general',
      `date: ${date}`,
      `source_url: ${sourceUrl}`,
      '---',
      '',
      `# Community Recap — ${titleDate}`,
      '',
      recapContent,
    ].join('\n');

    const filePath = join(DEST_PATH, `${date}.md`);
    await writeFile(filePath, markdown, 'utf-8');
    spinner.succeed(`Recap for ${date} written${usedFallback ? ' (fallback mode)' : ''}`);
  }

  // Update manifest
  manifest.channels[channelId] = {
    lastMessageId: messages[messages.length - 1].id,
    name: channelInfo.name,
    lastScraped: new Date().toISOString(),
  };
  manifest.lastRun = new Date().toISOString();
  await saveManifest(manifest);

  console.log(chalk.green(`\n✅ Generated ${dateGroups.size} recap(s)\n`));
}

run().catch((error) => {
  console.error(chalk.red(`\nFatal error: ${error instanceof Error ? error.message : String(error)}\n`));
  process.exit(1);
});
