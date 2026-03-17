import type { Client, Message } from 'discord.js';
import { processQuery } from '@/lib/rag/service';
import { checkRateLimit, recordRequest } from '../utils/rateLimiter';
import { getHistory, addExchange } from '../utils/memory';
import { chunkMessage } from '../utils/messageChunker';
import { formatForDiscord } from '../formatter';

const TYPING_REFRESH_MS = 9_000;
const TIMEOUT_MS = 30_000;

export function registerMentionHandler(client: Client): void {
  client.on('messageCreate', async (message: Message) => {
    let typing = false;
    try {
      if (message.author.bot) return;
      if (!client.user || !message.mentions.has(client.user)) return;

      const query = message.content
        .replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '')
        .trim();

      if (!query) return;

      const limitStatus = checkRateLimit(message.author.id);

      if (limitStatus === 'daily_cap') {
        await message.reply("I've reached my daily limit. I'll be back tomorrow!");
        return;
      }

      if (limitStatus === 'user_cooldown') {
        await message.react('🕐');
        return;
      }

      recordRequest(message.author.id);

      typing = true;
      const sendTyping = async () => {
        while (typing) {
          try {
            if ('sendTyping' in message.channel) await message.channel.sendTyping();
          } catch {
            // Channel may become unavailable
          }
          await new Promise((r) => setTimeout(r, TYPING_REFRESH_MS));
        }
      };
      const typingPromise = sendTyping();

      const history = getHistory(message.author.id, message.channelId);

      const queryPromise = processQuery({
        query,
        conversationHistory: history,
        llmProvider: 'openrouter',
        llmApiKey: process.env.OPENROUTER_API_KEY,
        embeddingProvider: 'openrouter',
        embeddingApiKey: process.env.OPENROUTER_API_KEY,
        cohereApiKey: process.env.COHERE_API_KEY,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_MS)
      );

      const result = await Promise.race([queryPromise, timeoutPromise]);

      typing = false;

      const formatted = formatForDiscord(result.text, result.sources);

      const chunks = chunkMessage(formatted);
      for (let i = 0; i < chunks.length; i++) {
        if (i === 0) {
          await message.reply(chunks[i]);
        } else if ('send' in message.channel) {
          await message.channel.send(chunks[i]);
        }
      }

      addExchange(message.author.id, message.channelId, query, result.text);

    } catch (error: unknown) {
      typing = false;
      const errorMessage = getErrorMessage(error);
      console.error('Mention handler error:', {
        userId: message.author.id,
        channelId: message.channelId,
        query: message.content.slice(0, 200),
        error,
      });

      try {
        await message.reply(errorMessage);
      } catch {
        // Can't reply
      }
    }
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message === 'TIMEOUT') {
      return "That took too long. Try a simpler question?";
    }
  }

  const statusCode = (error as { status?: number })?.status
    || (error as { statusCode?: number })?.statusCode;

  if (statusCode === 402 || statusCode === 429) {
    return "I've hit my usage limit. Try again later.";
  }

  if (statusCode && statusCode >= 500) {
    return "I'm having trouble connecting right now. Try again in a moment.";
  }

  return "I ran into something unexpected. Try again?";
}
