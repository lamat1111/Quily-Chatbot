// scripts/sync-discord/formatter.ts
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { DiscordMessage } from './types.js';

/** Group messages by date (YYYY-MM-DD) */
export function groupByDate(messages: DiscordMessage[]): Map<string, DiscordMessage[]> {
  const groups = new Map<string, DiscordMessage[]>();
  for (const msg of messages) {
    const date = msg.timestamp.split('T')[0]; // YYYY-MM-DD
    const existing = groups.get(date) || [];
    existing.push(msg);
    groups.set(date, existing);
  }
  return groups;
}

/** Format a Discord message's text content for markdown */
function formatMessageContent(msg: DiscordMessage): string {
  let content = msg.content;

  // Clean up Discord mentions: <@123456> → (user mention)
  content = content.replace(/<@!?\d+>/g, '(user mention)');

  // Clean up channel mentions: <#123456> → (channel)
  content = content.replace(/<#\d+>/g, '(channel)');

  // Clean up role mentions: <@&123456> → (role)
  content = content.replace(/<@&\d+>/g, '(role)');

  // Clean up custom emojis: <:name:123456> → :name:
  content = content.replace(/<a?:(\w+):\d+>/g, ':$1:');

  // Append embed descriptions (often used for rich announcements)
  for (const embed of msg.embeds) {
    if (embed.title) content += `\n\n**${embed.title}**`;
    if (embed.description) content += `\n${embed.description}`;
  }

  // Note attachments
  if (msg.attachments.length > 0) {
    const names = msg.attachments.map((a) => a.filename).join(', ');
    content += `\n\n*Attachments: ${names}*`;
  }

  return content.trim();
}

/** Format a human-readable date for the title */
function formatDateTitle(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00Z');
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Format a message timestamp as "HH:MM UTC" */
function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }) + ' UTC';
}

/** Build a Discord message URL */
function buildMessageUrl(guildId: string, channelId: string, messageId: string): string {
  return `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
}

/**
 * Write grouped messages as dated markdown files.
 * Returns the list of dates that had files written.
 */
export async function writeMarkdownFiles(
  messages: DiscordMessage[],
  channelName: string,
  channelId: string,
  guildId: string,
  destPath: string,
): Promise<string[]> {
  if (messages.length === 0) return [];

  const channelDir = join(destPath, channelName);
  await mkdir(channelDir, { recursive: true });

  const dateGroups = groupByDate(messages);
  const writtenDates: string[] = [];

  for (const [date, msgs] of dateGroups) {
    const title = `${channelName} - ${formatDateTitle(date)}`;
    const filePath = join(channelDir, `${date}.md`);

    // Build new message sections
    const newSections = msgs.map((msg) => {
      const authorName = msg.author.global_name || msg.author.username;
      const time = formatTime(msg.timestamp);
      const content = formatMessageContent(msg);
      return `## ${authorName} — ${time}\n\n${content}`;
    });

    // Check for existing file and append if present (handles multiple runs per day)
    let markdown: string;
    try {
      const existing = await readFile(filePath, 'utf-8');
      // Append new messages after existing content
      markdown = existing + '\n\n---\n\n' + newSections.join('\n\n---\n\n');
    } catch {
      // No existing file — create with frontmatter
      const firstMessageUrl = buildMessageUrl(guildId, channelId, msgs[0].id);
      const frontmatter = [
        '---',
        `title: "${title}"`,
        `type: discord_announcement`,
        `channel: ${channelName}`,
        `date: ${date}`,
        `source_url: ${firstMessageUrl}`,
        '---',
      ].join('\n');
      markdown = `${frontmatter}\n\n# ${title}\n\n${newSections.join('\n\n---\n\n')}`;
    }

    await writeFile(filePath, markdown, 'utf-8');
    writtenDates.push(date);
  }

  return writtenDates;
}
