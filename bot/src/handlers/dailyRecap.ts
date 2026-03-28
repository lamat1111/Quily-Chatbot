// bot/src/handlers/dailyRecap.ts
// Multi-channel daily digest — posts to #daily-digest channel.

import type { Client, TextChannel } from 'discord.js';
import { createClient } from '@supabase/supabase-js';
import { embed } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createHash } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { generateChannelRecap, type ChannelRecapResult } from '../services/recapGenerator';
import { chunkMessage } from '../utils/messageChunker';
import { suppressDiscordEmbeds } from '../formatter';

const EMBEDDING_MODEL = 'baai/bge-m3';

/**
 * Sanitize a Discord channel name for use as a directory name.
 * Strips emoji prefixes, lowercases, replaces non-alphanumeric with hyphens.
 */
function sanitizeChannelName(name: string): string {
  return name
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u200d\ufe0f]/gu, '')
    .replace(/^[\s\-︱│|]+/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'unknown';
}

/**
 * Start the daily scheduled multi-channel digest.
 * Posts to DISCORD_RECAP_CHANNEL_ID at the configured hour (default: 14:00 UTC).
 */
export function startDailyRecap(client: Client): void {
  const destChannelId = process.env.DISCORD_RECAP_CHANNEL_ID;
  if (!destChannelId) {
    console.log('[digest] DISCORD_RECAP_CHANNEL_ID not set — daily digest disabled');
    return;
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (!openrouterKey) {
    console.log('[digest] OPENROUTER_API_KEY not set — daily digest disabled');
    return;
  }

  const hour = parseInt(process.env.DISCORD_RECAP_HOUR || '14', 10);
  const channelIds = parseDigestChannelIds();

  console.log(`[digest] Daily digest scheduled for ${hour}:00 UTC → channel ${destChannelId} (${channelIds.length} source channels)`);

  let lastPostedDate = '';

  setInterval(async () => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();

    if (currentHour !== hour || currentMinute !== 0 || lastPostedDate === todayStr) return;

    lastPostedDate = todayStr;

    try {
      const destChannel = await client.channels.fetch(destChannelId);
      if (!destChannel || !('send' in destChannel)) {
        console.error(`[digest] Destination channel ${destChannelId} not found or not a text channel`);
        return;
      }

      console.log(`[digest] Generating multi-channel digest for ${todayStr}...`);

      // Fetch and summarize all channels in parallel
      const results = await Promise.allSettled(
        channelIds.map(async (id) => {
          const channel = await client.channels.fetch(id);
          if (!channel || !('messages' in channel)) {
            throw new Error(`Channel ${id} not found or not a text channel`);
          }
          return generateChannelRecap(channel as TextChannel);
        }),
      );

      // Collect successful results, log failures
      const channelRecaps: ChannelRecapResult[] = [];
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === 'rejected') {
          console.error(`[digest] Channel ${channelIds[i]} failed:`, result.reason);
        } else if (result.value) {
          channelRecaps.push(result.value);
        }
      }

      if (channelRecaps.length === 0) {
        console.log('[digest] No channels had substantive content — skipping post');
        return;
      }

      // Sort by config order (channelIds array order)
      channelRecaps.sort(
        (a, b) => channelIds.indexOf(a.channelId) - channelIds.indexOf(b.channelId),
      );

      const totalMessages = channelRecaps.reduce((sum, r) => sum + r.messageCount, 0);
      console.log(`[digest] Digest ready: ${channelRecaps.length} channels, ${totalMessages} messages. Posting...`);

      // Assemble and post digest
      const titleDate = new Date(todayStr + 'T00:00:00Z').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      });

      const sections = channelRecaps.map(
        (r) => `**<#${r.channelId}>**\n\n${r.content}`,
      );

      const digestBody = `**Daily Digest - ${titleDate}**\n\n${sections.join('\n\n')}`;
      const footer = `\n\n-# *Digests are posted daily at ${hour}:00 UTC*`;

      const fullMessage = suppressDiscordEmbeds(digestBody + footer);
      const chunks = chunkMessage(fullMessage);

      for (const chunk of chunks) {
        await (destChannel as TextChannel).send(chunk);
      }

      console.log('[digest] Daily digest posted successfully');

      // Write markdown files + upsert to Supabase (best-effort)
      try {
        await persistRecaps(channelRecaps, titleDate, openrouterKey);
        console.log('[digest] Markdown files written + Supabase upsert successful');
      } catch (error) {
        console.error('[digest] Persistence failed (digest was still posted):', error);
      }
    } catch (error) {
      console.error('[digest] Failed to generate/post daily digest:', error);
    }
  }, 60_000);
}

/**
 * Parse DISCORD_DIGEST_CHANNEL_IDS into an array.
 * Falls back to DISCORD_GENERAL_CHANNEL_ID or the hardcoded general channel.
 */
function parseDigestChannelIds(): string[] {
  const raw = process.env.DISCORD_DIGEST_CHANNEL_IDS;
  if (raw) {
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
  // Fallback: single-channel mode using general channel
  const generalId = process.env.DISCORD_GENERAL_CHANNEL_ID || '1212446222367985726';
  console.log('[digest] DISCORD_DIGEST_CHANNEL_IDS not set — falling back to single channel');
  return [generalId];
}

/**
 * Write markdown files to disk and upsert to Supabase for each channel recap.
 */
async function persistRecaps(
  recaps: ChannelRecapResult[],
  titleDate: string,
  openrouterKey: string,
): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.log('[digest] Supabase credentials not configured — skipping persistence');
    return;
  }

  const openrouter = createOpenRouter({ apiKey: openrouterKey });
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Base path for recap files (relative to project root, alongside announcements/dev-updates)
  const docsBase = join(process.cwd(), 'docs', 'discord');

  await Promise.allSettled(
    recaps.map(async (recap) => {
      const sanitized = sanitizeChannelName(recap.channelName);
      const dirName = `recap-${sanitized}`;
      const dirPath = join(docsBase, dirName);
      const fileName = `${recap.date}.md`;
      const filePath = join(dirPath, fileName);
      const sourceFile = `docs/discord/${dirName}/${fileName}`;

      // Write markdown file
      const markdownContent = [
        '---',
        `title: "Daily Recap - #${sanitized} - ${titleDate}"`,
        'type: discord_recap',
        `channel: ${sanitized}`,
        `date: ${recap.date}`,
        '---',
        '',
        `# Daily Recap - #${sanitized}`,
        '',
        recap.content,
        '',
      ].join('\n');

      await mkdir(dirPath, { recursive: true });
      await writeFile(filePath, markdownContent, 'utf-8');

      // Generate embedding
      const embeddingContent = `Daily Recap - #${sanitized} - ${titleDate}\n\n${recap.content}`;
      const { embedding: vector } = await embed({
        model: openrouter.textEmbeddingModel(EMBEDDING_MODEL),
        value: embeddingContent,
        maxRetries: 2,
      });

      const contentHash = createHash('sha256').update(markdownContent).digest('hex');
      const tokenCount = Math.ceil(markdownContent.length / 4);

      // Upsert to Supabase
      const { error } = await supabase
        .from('document_chunks_chutes')
        .upsert(
          {
            content: embeddingContent,
            embedding: vector,
            source_file: sourceFile,
            heading_path: null,
            chunk_index: 0,
            token_count: tokenCount,
            version: recap.date,
            content_hash: contentHash,
            doc_type: 'discord_recap',
            published_date: recap.date,
            title: `Daily Recap - #${sanitized} - ${titleDate}`,
            source_url: null,
          },
          { onConflict: 'source_file,chunk_index' },
        );

      if (error) {
        throw new Error(`Supabase upsert for #${sanitized}: ${error.message}`);
      }

      console.log(`[digest] Persisted recap for #${sanitized} → ${sourceFile}`);
    }),
  );
}
