// scripts/sync-discord/discord-api.ts
import type { DiscordMessage, DiscordChannel } from './types.js';

const DISCORD_API_BASE = 'https://discord.com/api/v10';
const MAX_MESSAGES_PER_REQUEST = 100;

function getHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bot ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Fetch channel info (name, type) from Discord API.
 */
export async function fetchChannel(token: string, channelId: string): Promise<DiscordChannel> {
  const res = await fetch(`${DISCORD_API_BASE}/channels/${channelId}`, {
    headers: getHeaders(token),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Discord API error ${res.status} fetching channel ${channelId}: ${body}`);
  }

  return (await res.json()) as DiscordChannel;
}

/**
 * Fetch messages from a channel, optionally after a given message ID.
 * Returns messages in chronological order (oldest first).
 * Paginates automatically to get all messages since `afterId`.
 */
export async function fetchMessages(
  token: string,
  channelId: string,
  afterId?: string | null,
): Promise<DiscordMessage[]> {
  const allMessages: DiscordMessage[] = [];
  let cursor = afterId || undefined;

  while (true) {
    const params = new URLSearchParams({ limit: String(MAX_MESSAGES_PER_REQUEST) });
    if (cursor) params.set('after', cursor);

    const res = await fetch(`${DISCORD_API_BASE}/channels/${channelId}/messages?${params}`, {
      headers: getHeaders(token),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Discord API error ${res.status} fetching messages for channel ${channelId}: ${body}`);
    }

    const batch = (await res.json()) as DiscordMessage[];

    if (batch.length === 0) break;

    // Discord returns newest-first; we want chronological order
    allMessages.push(...batch.reverse());

    // If we got fewer than the limit, we've reached the end
    if (batch.length < MAX_MESSAGES_PER_REQUEST) break;

    // Move cursor to the newest message we just got
    cursor = allMessages[allMessages.length - 1].id;
  }

  return allMessages;
}
