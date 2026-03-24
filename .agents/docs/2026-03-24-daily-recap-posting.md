# Daily Recap Posting

**Added:** 2026-03-24

## Overview

The bot automatically generates and posts a daily community recap to #general at 14:00 UTC. The recap summarizes the last 24 hours of conversation, filtered for noise and summarized by an LLM.

## How It Works

1. **Scheduling:** `startDailyRecap()` in `bot/src/handlers/dailyRecap.ts` runs a 60-second interval timer (same pattern as `startDailyStats`). At the configured hour (default 14 UTC), it triggers once per day.

2. **Message Fetching:** `generateRecap()` in `bot/src/services/recapGenerator.ts` fetches the last 24h of messages from the target channel via discord.js `channel.messages.fetch()`, paginating in batches of 100.

3. **Noise Filtering:** `filterRecapMessages()` drops bot messages, short messages (<15 chars), emoji-only, URL-only, and common noise patterns (gm, lol, wagmi, etc.). Cassie's messages (lead dev) bypass all noise filters.

4. **LLM Summarization:** `summarizeForRecap()` calls OpenRouter (DeepSeek V3) to generate a 200-500 word recap grouped by topic. Cassie's substantive contributions get a dedicated "From Cassie" section.

5. **Discord Posting:** The formatted recap is posted to #general with `suppressDiscordEmbeds()` and `chunkMessage()` for long recaps.

6. **Supabase Upsert:** The recap is upserted to `document_chunks_chutes` with a BGE-M3 embedding, using `source_file: docs/discord/general-recap/YYYY-MM-DD.md` and `chunk_index: 0`. This overwrites the GitHub Action's 06:00 UTC version with the bot's more complete 14:00 UTC version.

## Configuration

| Env Var | Default | Purpose |
|---------|---------|---------|
| `DISCORD_RECAP_CHANNEL_ID` | (none — disables feature) | Channel to post recap |
| `DISCORD_RECAP_HOUR` | `14` | UTC hour to post |
| `RECAP_LLM_MODEL` | `deepseek/deepseek-chat-v3-0324` | Override LLM model |

Requires `OPENROUTER_API_KEY` (for both LLM and embedding) regardless of `BOT_LLM_PROVIDER`.

## Relationship with GitHub Action

The GitHub Actions workflow (`sync-docs.yml`) still runs at 06:00 UTC and generates recap files committed to `docs/discord/general-recap/`. Its Supabase entry gets overwritten by the bot's 14:00 UTC version. The on-demand `@Quily recap` command reads from Supabase and always returns the freshest version.

## Key Files

| File | Purpose |
|------|---------|
| `bot/src/services/recapGenerator.ts` | Filter + summarize + generate |
| `bot/src/handlers/dailyRecap.ts` | Scheduler + poster + Supabase upsert |
| `bot/src/handlers/recap.ts` | On-demand `@Quily recap` (unchanged) |
| `scripts/sync-discord/recap.ts` | GitHub Action recap generator (unchanged) |

## Cost

~$0.005/day for LLM summarization + negligible embedding cost. ~$0.15/month via OpenRouter.

*Created: 2026-03-24*
