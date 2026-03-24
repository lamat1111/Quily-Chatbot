// bot/src/services/recapGenerator.ts
// Generates daily community recaps from Discord channel messages.
// Ported from scripts/sync-discord/recap-filter.ts + recap-summarizer.ts

import type { Message, TextChannel } from 'discord.js';

/** Cassie's Discord user ID — lead dev, messages bypass noise filters */
const CASSIE_USER_ID = '597996105300705301';
const MIN_MESSAGE_LENGTH = 15;

const NOISE_PATTERNS = [
  /^gm+$/i, /^gn+$/i, /^g?nights?$/i, /^hey+$/i, /^hi+$/i, /^hello+$/i,
  /^yo+$/i, /^sup$/i, /^lol+$/i, /^lmao+$/i, /^rofl$/i, /^haha+$/i,
  /^wen\b/i, /^moon$/i, /^pump$/i, /^wagmi$/i, /^ngmi$/i, /^nice+$/i,
  /^thanks?$/i, /^ty+$/i, /^np$/i, /^yes+$/i, /^no+$/i, /^ok+$/i,
  /^k+$/i, /^same$/i, /^this$/i, /^true$/i, /^rip$/i, /^f$/i, /^gg$/i,
  /^\+1$/, /^100$/,
];

export interface FilteredMessage {
  authorName: string;
  authorId: string;
  content: string;
  timestamp: Date;
  isCassie: boolean;
  embeds: { title?: string; description?: string }[];
}

export interface RecapResult {
  content: string;
  date: string;
  timeFrom: string;
  timeTo: string;
  titleDate: string;
  messageCount: number;
}

function isEmojiOnly(content: string): boolean {
  const withoutCustom = content.replace(/<a?:\w+:\d+>/g, '').trim();
  const withoutEmoji = withoutCustom
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u200d\ufe0f]/gu, '')
    .trim();
  return withoutEmoji.length === 0;
}

function isUrlOnly(content: string): boolean {
  return /^https?:\/\/\S+$/i.test(content.trim());
}

export function filterRecapMessages(messages: Message[]): FilteredMessage[] {
  return messages
    .filter((msg) => {
      if (msg.author.bot) return false;
      if (msg.author.id === CASSIE_USER_ID) return true;
      const content = msg.content.trim();
      if (!content && msg.embeds.length === 0) return false;
      if (content.length < MIN_MESSAGE_LENGTH) return false;
      if (isEmojiOnly(content)) return false;
      if (isUrlOnly(content)) return false;
      if (NOISE_PATTERNS.some((p) => p.test(content))) return false;
      return true;
    })
    .map((msg) => ({
      authorName: msg.author.displayName,
      authorId: msg.author.id,
      content: msg.content,
      timestamp: msg.createdAt,
      isCassie: msg.author.id === CASSIE_USER_ID,
      embeds: msg.embeds.map((e) => ({
        title: e.title ?? undefined,
        description: e.description ?? undefined,
      })),
    }));
}

// ---------------------------------------------------------------------------
// LLM Summarizer
// ---------------------------------------------------------------------------

const DEFAULT_RECAP_MODEL = 'deepseek/deepseek-chat-v3-0324';
const MAX_INPUT_CHARS = 60_000;

const RECAP_SYSTEM_PROMPT = `You are a community recap writer for the Quilibrium Discord server. You produce concise daily recaps of the general channel.

Rules:
- Group discussion by topic/theme using markdown headings (## Topic Name)
- Messages tagged [LEAD DEV] are from Cassie, the lead developer of Quilibrium. If she made substantive contributions, highlight them in a dedicated "## From Cassie" section. Skip her casual/noise messages (greetings, jokes, etc.) just like you would for anyone else.
- Include any links or resources that were shared, with context about what they are
- Cover ALL topics discussed, not just Quilibrium-specific ones
- Skip: price speculation, casual greetings, memes, GIFs, off-topic noise
- Keep output concise: 200-500 words
- Use markdown formatting
- If no substantive discussion happened, write a short note saying it was a quiet day
- Do NOT invent or fabricate any information — only summarize what is in the messages`;

function formatMessagesForLLM(filtered: FilteredMessage[]): string {
  const cassieMessages = filtered.filter((f) => f.isCassie);
  const otherMessages = filtered.filter((f) => !f.isCassie);

  const fmt = (f: FilteredMessage): string => {
    const time = f.timestamp.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    });
    const tag = f.isCassie ? ' [LEAD DEV]' : '';
    let text = f.content;
    for (const embed of f.embeds) {
      if (embed.title) text += ` | ${embed.title}`;
      if (embed.description) text += ` — ${embed.description}`;
    }
    return `[${time} UTC] ${f.authorName}${tag}: ${text}`;
  };

  const cassieLines = cassieMessages.map(fmt);
  const cassieChars = cassieLines.join('\n').length;
  const budget = MAX_INPUT_CHARS - cassieChars;

  const otherEntries = otherMessages.map((f) => ({ id: f.authorId + f.timestamp.getTime(), line: fmt(f) }));
  let totalOtherChars = otherEntries.reduce((sum, e) => sum + e.line.length + 1, 0);

  while (totalOtherChars > budget && otherEntries.length > 0) {
    const removed = otherEntries.shift()!;
    totalOtherChars -= removed.line.length + 1;
  }

  const survivingIds = new Set(otherEntries.map((e) => e.id));

  const allFormatted = filtered
    .filter((f) => f.isCassie || survivingIds.has(f.authorId + f.timestamp.getTime()))
    .map(fmt);

  return allFormatted.join('\n');
}

export async function summarizeForRecap(
  filtered: FilteredMessage[],
  date: string,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is required for recap summarization');

  const model = process.env.RECAP_LLM_MODEL || DEFAULT_RECAP_MODEL;
  const messagesText = formatMessagesForLLM(filtered);

  if (!messagesText.trim()) {
    return 'No substantive discussion in the general channel today.';
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: RECAP_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Here are the messages from the Quilibrium Discord #general channel on ${date}. Write a concise recap:\n\n${messagesText}`,
        },
      ],
      max_tokens: 1500,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`OpenRouter API error ${response.status}: ${body}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };

  return data.choices[0]?.message?.content?.trim() || 'No recap generated.';
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export async function generateRecap(channel: TextChannel): Promise<RecapResult | null> {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const allMessages: Message[] = [];

  let lastId: string | undefined;
  while (true) {
    const batch = await channel.messages.fetch({ limit: 100, ...(lastId ? { before: lastId } : {}) });
    if (batch.size === 0) break;

    let reachedCutoff = false;
    for (const msg of batch.values()) {
      if (msg.createdTimestamp < cutoff) {
        reachedCutoff = true;
        break;
      }
      allMessages.push(msg);
    }

    if (reachedCutoff || batch.size < 100) break;
    lastId = batch.last()!.id;
  }

  if (allMessages.length === 0) return null;

  allMessages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

  const filtered = filterRecapMessages(allMessages);
  if (filtered.length === 0) return null;

  const todayStr = new Date().toISOString().slice(0, 10);
  const content = await summarizeForRecap(filtered, todayStr);

  const timestamps = filtered.map((f) => f.timestamp.getTime());
  const earliest = new Date(Math.min(...timestamps));
  const latest = new Date(Math.max(...timestamps));

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    }) + ' UTC';

  const titleDate = new Date(todayStr + 'T00:00:00Z').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return {
    content,
    date: todayStr,
    timeFrom: fmtTime(earliest),
    timeTo: fmtTime(latest),
    titleDate,
    messageCount: filtered.length,
  };
}
