// bot/src/handlers/recap.ts
import type { Message } from 'discord.js';

/**
 * Handle the @Quily recap command.
 * Redirects users to the #daily-digest channel.
 * Returns true if the message was handled.
 */
export async function handleRecap(message: Message, query: string): Promise<boolean> {
  if (!/^\s*recap\s*$/i.test(query)) return false;

  const digestChannelId = process.env.DISCORD_RECAP_CHANNEL_ID;
  if (digestChannelId) {
    await message.reply(
      `Daily digests are posted in <#${digestChannelId}>! Check there for the latest multi-channel recap.`,
    );
  } else {
    await message.reply(
      'The daily digest is not configured yet. Ask a moderator to set it up!',
    );
  }

  return true;
}
