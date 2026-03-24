// bot/src/handlers/dailyRecap.ts
// Scheduled daily recap posting — mirrors startDailyStats pattern.

import type { Client, TextChannel } from 'discord.js';
import { createClient } from '@supabase/supabase-js';
import { embed } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createHash } from 'crypto';
import { generateRecap, type RecapResult } from '../services/recapGenerator';
import { chunkMessage } from '../utils/messageChunker';
import { suppressDiscordEmbeds } from '../formatter';

const EMBEDDING_MODEL = 'baai/bge-m3';

/**
 * Start the daily scheduled recap posting.
 * Posts to DISCORD_RECAP_CHANNEL_ID at the configured hour (default: 14:00 UTC).
 */
export function startDailyRecap(client: Client): void {
  const channelId = process.env.DISCORD_RECAP_CHANNEL_ID;
  if (!channelId) {
    console.log('[recap] DISCORD_RECAP_CHANNEL_ID not set — daily recap disabled');
    return;
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (!openrouterKey) {
    console.log('[recap] OPENROUTER_API_KEY not set — daily recap disabled');
    return;
  }

  const hour = parseInt(process.env.DISCORD_RECAP_HOUR || '14', 10);
  console.log(`[recap] Daily recap scheduled for ${hour}:00 UTC → channel ${channelId}`);

  let lastPostedDate = '';

  setInterval(async () => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();

    if (currentHour !== hour || currentMinute !== 0 || lastPostedDate === todayStr) return;

    lastPostedDate = todayStr;

    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || !('send' in channel)) {
        console.error(`[recap] Channel ${channelId} not found or not a text channel`);
        return;
      }

      console.log(`[recap] Generating daily recap for ${todayStr}...`);
      const result = await generateRecap(channel as TextChannel);

      if (!result) {
        console.log('[recap] No substantive messages — skipping post');
        return;
      }

      console.log(`[recap] Recap generated (${result.messageCount} messages). Posting...`);

      // Format for Discord (bold heading, suppress embeds)
      const discordMessage = suppressDiscordEmbeds(
        `**Community Recap — #general**\n\n**${result.titleDate}** | ${result.timeFrom} – ${result.timeTo}\n\n${result.content}\n\n-# *Recaps are posted daily at ${hour}:00 UTC*`
      );

      const chunks = chunkMessage(discordMessage);
      for (const chunk of chunks) {
        await (channel as TextChannel).send(chunk);
      }

      console.log('[recap] Daily recap posted successfully');

      // Upsert to Supabase (best-effort — posting is the primary goal)
      try {
        await upsertRecapToSupabase(result, openrouterKey);
        console.log('[recap] Supabase upsert successful');
      } catch (error) {
        console.error('[recap] Supabase upsert failed (recap was still posted):', error);
      }
    } catch (error) {
      console.error('[recap] Failed to generate/post daily recap:', error);
    }
  }, 60_000);
}

/**
 * Upsert the recap to Supabase with embedding.
 * Uses the same source_file convention as the GitHub Action ingestion pipeline.
 */
async function upsertRecapToSupabase(result: RecapResult, openrouterKey: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.log('[recap] Supabase credentials not configured — skipping upsert');
    return;
  }

  // Format content to match what handleRecap expects (starts with # heading)
  const fullContent = `# Community Recap — #general\n\n**${result.titleDate}** | ${result.timeFrom} – ${result.timeTo}\n\n${result.content}`;

  // Generate embedding via OpenRouter BGE-M3
  const openrouter = createOpenRouter({ apiKey: openrouterKey });
  const { embedding: vector } = await embed({
    model: openrouter.textEmbeddingModel(EMBEDDING_MODEL),
    value: fullContent,
    maxRetries: 2,
  });

  const sourceFile = `docs/discord/general-recap/${result.date}.md`;
  const contentHash = createHash('sha256').update(fullContent).digest('hex');
  const tokenCount = Math.ceil(fullContent.length / 4);

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { error } = await supabase
    .from('document_chunks_chutes')
    .upsert(
      {
        content: fullContent,
        embedding: vector,
        source_file: sourceFile,
        heading_path: null,
        chunk_index: 0,
        token_count: tokenCount,
        version: result.date,
        content_hash: contentHash,
        doc_type: 'discord_recap',
        published_date: result.date,
        title: `Community Recap - ${result.titleDate}`,
        source_url: null,
      },
      { onConflict: 'source_file,chunk_index' },
    );

  if (error) throw new Error(`Supabase upsert error: ${error.message}`);
}
