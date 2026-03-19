// bot/src/handlers/recap.ts
import type { Message } from 'discord.js';
import { createClient } from '@supabase/supabase-js';
import { chunkMessage } from '../utils/messageChunker';

/**
 * Handle the @Quily recap command.
 * Fetches the most recent community recap from Supabase and replies directly.
 * Returns true if the message was handled (caller should return early).
 */
export async function handleRecap(message: Message, query: string): Promise<boolean> {
  // Only handle "recap" command
  if (!/^\s*recap\s*$/i.test(query)) return false;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    await message.reply("Recap is not configured. Missing database credentials.");
    return true;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    if ('sendTyping' in message.channel) await message.channel.sendTyping();

    // Fetch the most recent recap chunk
    const { data, error } = await supabase
      .from('document_chunks_chutes')
      .select('content, published_date, source_url')
      .eq('doc_type', 'discord_recap')
      .order('published_date', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Recap fetch error:', error.message);
      await message.reply("I couldn't fetch the recap right now. Try again later.");
      return true;
    }

    if (!data || data.length === 0) {
      await message.reply(
        "No recap available yet. Recaps are generated daily from the general channel."
      );
      return true;
    }

    const recap = data[0];
    const dateLabel = recap.published_date
      ? new Date(recap.published_date + 'T00:00:00').toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Unknown date';

    const formatted = `**Community Recap — ${dateLabel}**\n\n${recap.content}\n\n-# *Generated daily from #general*`;

    const chunks = chunkMessage(formatted);
    for (let i = 0; i < chunks.length; i++) {
      if (i === 0) {
        await message.reply(chunks[i]);
      } else if ('send' in message.channel) {
        await message.channel.send(chunks[i]);
      }
    }
  } catch (error) {
    console.error('Recap handler error:', error);
    try {
      await message.reply("Something went wrong fetching the recap. Try again?");
    } catch {
      // Can't reply
    }
  }

  return true;
}
