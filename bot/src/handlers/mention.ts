import type { Client, Message } from 'discord.js';
import { processQuery } from '../../../src/lib/rag/service';
import { checkRateLimit, recordRequest } from '../utils/rateLimiter';
import { checkIssueRateLimit, recordIssueCreation } from '../utils/issueRateLimiter';
import { createGitHubIssue } from '../utils/githubIssues';
import { getHistory, getLastChunkIds, addExchange } from '../utils/memory';
import { chunkMessage } from '../utils/messageChunker';
import { extractAttachments } from '../utils/attachments';
import { formatForDiscord } from '../formatter';
import { handleRecap } from './recap';
import { handleStats } from './stats';

const TYPING_REFRESH_MS = 9_000;
const TIMEOUT_MS = 60_000;

export function registerMentionHandler(client: Client): void {
  client.on('messageCreate', async (message: Message) => {
    let typing = false;
    try {
      if (message.author.bot) return;
      if (!client.user) return;

      // Respond to @mentions OR replies to the bot's own messages
      const isMentioned = message.mentions.has(client.user);
      let isReplyToBot = false;
      let repliedBotMessage: Message | null = null;
      if (message.reference) {
        try {
          const replied = await message.fetchReference();
          if (replied.author.id === client.user.id) {
            isReplyToBot = true;
            repliedBotMessage = replied;
          }
        } catch {
          // Referenced message may be deleted or inaccessible
        }
      }
      if (!isMentioned && !isReplyToBot) return;

      // Channel restriction: non-privileged users can only interact in the designated channel
      const quilyChannelId = process.env.DISCORD_QUILY_CHANNEL_ID;
      if (quilyChannelId && message.channelId !== quilyChannelId) {
        const privilegedRoleIds = (process.env.DISCORD_PRIVILEGED_ROLE_IDS || '')
          .split(',')
          .filter(Boolean);
        const memberRoleIds = message.member?.roles.cache.map((r) => r.id) || [];
        const isPrivileged = privilegedRoleIds.some((id) => memberRoleIds.includes(id));

        if (!isPrivileged) {
          await message.reply(
            `Ask me in <#${quilyChannelId}>! I only answer there for regular users.`,
          );
          return;
        }
      }

      let query = message.content
        .replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '')
        .trim();

      // If this is a reply to another user's message and mentions @Quily,
      // use the referenced message as the query (with optional instructions)
      if (isMentioned && message.reference && !isReplyToBot) {
        try {
          const referenced = await message.fetchReference();
          if (referenced && referenced.content) {
            const originalContent = referenced.content.trim();
            if (originalContent) {
              query = query
                ? `${query}\n\nContext (message from ${referenced.author.displayName}):\n${originalContent}`
                : originalContent;
            }
          }
        } catch {
          // Referenced message may be deleted or inaccessible
        }
      }

      if (!query && message.attachments.size === 0) return;

      // Extract text from supported file attachments (.txt, .md, code files, etc.)
      const fileContent = await extractAttachments(message.attachments);
      if (fileContent) {
        query = fileContent + (query || 'Describe the contents of the attached file(s).');
      }

      if (!query) return;

      // Bypass: handle @Quily recap without RAG
      const handled = await handleRecap(message, query);
      if (handled) return;

      // Bypass: handle @Quily stats / network stats without RAG
      const statsHandled = await handleStats(message, query);
      if (statsHandled) return;

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
      const priorityDocIds = getLastChunkIds(message.author.id, message.channelId);

      const llmProvider = (process.env.BOT_LLM_PROVIDER || 'openrouter') as 'openrouter' | 'chutes';
      const llmApiKey = llmProvider === 'chutes'
        ? process.env.CHUTES_API_KEY
        : process.env.OPENROUTER_API_KEY;

      const queryPromise = processQuery({
        query,
        conversationHistory: history,
        priorityDocIds,
        llmProvider,
        llmApiKey,
        embeddingProvider: 'openrouter',
        embeddingApiKey: process.env.OPENROUTER_API_KEY,
        cohereApiKey: process.env.COHERE_API_KEY,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_MS)
      );

      const result = await Promise.race([queryPromise, timeoutPromise]);

      typing = false;

      // If model produced only a tool call with no text, provide a default
      let responseText = result.text || 'Thanks for the correction!';

      // Handle auto-correction tool call
      if (result.toolCalls?.length) {
        const issueCall = result.toolCalls.find(
          (tc) => tc.toolName === 'create_knowledge_issue',
        );
        if (issueCall) {
          // Build context for the issue by walking the Discord reply chain
          // to find the ORIGINAL bot answer being corrected (not the follow-up).
          // The reply chain looks like:
          //   [Original Q] → [Quily's wrong answer] → [User: "wrong"] → [Quily: "tell me more"] → [User: correction]
          // We want Quily's wrong answer and the original question, not the follow-up.
          let originalQuestion = '';
          let quilyAnswer = '';
          let discordMessageLink = '';

          if (repliedBotMessage) {
            // Walk back the reply chain (up to 10 hops) to find the ORIGINAL
            // bot answer being corrected. Each message references the one it
            // replied to, so the chain looks like:
            //   [User A question] ← [Quily wrong answer] ← [LaMat "wrong"] ← [Quily "tell me more"] ← [LaMat correction]
            // We keep walking regardless of author, tracking the deepest bot
            // message (= the original wrong answer) and the deepest non-bot
            // message before it (= the original question).
            let currentMsg: Message = repliedBotMessage;
            let deepestBotMsg: Message = repliedBotMessage; // at minimum, the direct reply
            let deepestQuestion = '';

            for (let i = 0; i < 10; i++) {
              if (!currentMsg.reference) break;
              try {
                const parent = await currentMsg.fetchReference();
                if (parent.author.id === client.user!.id) {
                  deepestBotMsg = parent;
                } else {
                  deepestQuestion = parent.content;
                }
                currentMsg = parent;
              } catch {
                break; // Message deleted or inaccessible
              }
            }
            quilyAnswer = deepestBotMsg.content;
            originalQuestion = deepestQuestion;
            discordMessageLink = `https://discord.com/channels/${deepestBotMsg.guildId}/${deepestBotMsg.channelId}/${deepestBotMsg.id}`;
          }

          // Fall back to conversation history if reply chain didn't yield results
          if (!quilyAnswer && history.length >= 2) {
            originalQuestion = history[history.length - 2].content;
            quilyAnswer = history[history.length - 1].content;
          }

          if (!originalQuestion) {
            originalQuestion = query;
          }

          const memberRoles =
            message.member?.roles.cache.map((r) => r.id) || [];
          const limitStatus = checkIssueRateLimit(
            message.author.id,
            memberRoles,
          );

          if (
            limitStatus === 'ok' &&
            issueCall.input.title &&
            issueCall.input.correction
          ) {
            try {
              const issueUrl = await createGitHubIssue({
                title: issueCall.input.title,
                correction: issueCall.input.correction,
                discordUsername:
                  message.member?.displayName || message.author.username,
                originalQuestion,
                quilyAnswer,
                discordMessageLink: discordMessageLink || undefined,
              });
              recordIssueCreation(message.author.id);
              console.log(
                `[auto-issue] Created ${issueUrl} from ${message.author.username}`,
              );
              responseText +=
                `\n\n*I've opened a [GitHub issue](${issueUrl}) with your correction for the maintainers to review. Thanks for helping me get smarter.*`;
            } catch (err) {
              console.error('[auto-issue] Failed to create GitHub issue:', err);
              responseText +=
                `\n\n*I couldn't auto-create the issue — you can open one manually at https://github.com/Quilibrium-Community/quily/issues*`;
            }
          }
        }
      }

      const formatted = formatForDiscord(responseText, result.sources, result.ragQuality);

      const chunks = chunkMessage(formatted);
      for (let i = 0; i < chunks.length; i++) {
        if (i === 0) {
          await message.reply(chunks[i]);
        } else if ('send' in message.channel) {
          await message.channel.send(chunks[i]);
        }
      }

      const chunkIds = result.sources.map((s) => s.id);
      addExchange(message.author.id, message.channelId, query, result.text, chunkIds);

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
