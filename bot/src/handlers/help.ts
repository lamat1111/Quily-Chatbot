// bot/src/handlers/help.ts
// Handles the "help" keyword — lists available commands and useful links.

import type { Message } from 'discord.js';

const HELP_PATTERN = /^\s*help\s*$/i;

const HELP_TEXT = `Hi! I'm Quily, the Quilibrium knowledge assistant.

**Commands:**
• **stats** / **network stats** / **network status** / **shard status** — Live network health snapshot

**How to use me:**
• Mention me with any question about Quilibrium
• Reply to my messages to continue the conversation
• If I get something wrong, tell me and I'll open a GitHub issue for review

**Knowledge sources:**
• Official Quilibrium docs (docs.quilibrium.com)
• Livestream transcripts and summaries
• Community-contributed technical references
• Discord announcements and recaps

**Links:**
• Web app: <https://quily.quilibrium.one/>
• Report issues: <https://github.com/Quilibrium-Community/quily/issues>`;

/**
 * Check if a mention query is asking for help.
 * Returns true if handled (caller should return early).
 */
export async function handleHelp(message: Message, query: string): Promise<boolean> {
  if (!HELP_PATTERN.test(query)) return false;

  await message.reply(HELP_TEXT);
  return true;
}

