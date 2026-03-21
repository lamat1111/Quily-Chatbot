// bot/src/handlers/stats.ts
// Handles on-demand "stats" keyword and daily scheduled posting.

import type { Client, Message, TextChannel } from 'discord.js';
import { computeStats, formatDiscordStats, loadHistory, recordSnapshot } from '../services/networkStats';

// Exact command patterns only — must be the entire query (no partial matches)
const STATS_PATTERNS = [
  /^\s*(?:network\s+)?stats?\s*$/i,
];

/**
 * Check if a mention query is asking for network stats.
 * Returns true if handled (caller should return early).
 */
export async function handleStats(message: Message, query: string): Promise<boolean> {
  if (!STATS_PATTERNS.some((p) => p.test(query))) return false;

  try {
    if ('sendTyping' in message.channel) await message.channel.sendTyping();

    const snapshot = await computeStats();
    const history = await loadHistory();
    const formatted = formatDiscordStats(snapshot, history);

    await message.reply(formatted);

    // Record this snapshot so it contributes to future trends
    await recordSnapshot(snapshot);
  } catch (error) {
    console.error('Stats handler error:', error);
    try {
      await message.reply("I couldn't fetch network stats right now. Try again in a moment.");
    } catch {
      // Can't reply
    }
  }

  return true;
}

/**
 * Start the daily scheduled stats posting.
 * Posts to DISCORD_STATS_CHANNEL_ID at the configured hour (default: 12:00 UTC).
 */
export function startDailyStats(client: Client): void {
  const channelId = process.env.DISCORD_STATS_CHANNEL_ID;
  if (!channelId) {
    console.log('[stats] DISCORD_STATS_CHANNEL_ID not set — daily stats disabled');
    return;
  }

  const hour = parseInt(process.env.DISCORD_STATS_HOUR || '12', 10);
  console.log(`[stats] Daily stats scheduled for ${hour}:00 UTC → channel ${channelId}`);

  // Check every minute if it's time to post
  let lastPostedDate = '';

  setInterval(async () => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();

    // Post at the configured hour, minute 0, and only once per day
    if (currentHour !== hour || currentMinute !== 0 || lastPostedDate === todayStr) return;

    lastPostedDate = todayStr;

    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || !('send' in channel)) {
        console.error(`[stats] Channel ${channelId} not found or not a text channel`);
        return;
      }

      console.log(`[stats] Posting daily stats for ${todayStr}`);
      const snapshot = await computeStats();
      const history = await loadHistory();
      const formatted = formatDiscordStats(snapshot, history);

      await (channel as TextChannel).send(formatted);
      await recordSnapshot(snapshot);

      console.log(`[stats] Daily stats posted successfully`);
    } catch (error) {
      console.error('[stats] Failed to post daily stats:', error);
    }
  }, 60_000); // Check every 60 seconds
}
