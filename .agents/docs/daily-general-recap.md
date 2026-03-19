---
type: doc
title: "Daily General Channel Recap"
status: done
ai_generated: true
created: 2026-03-19
updated: 2026-03-19
related_docs:
  - "automated-docs-sync-pipeline.md"
  - "discord-bot-architecture.md"
related_tasks:
  - "2026-03-19-daily-general-recap.md"
---

# Daily General Channel Recap

> **AI-Generated**: May contain errors. Verify before use.

## Overview

The daily recap feature scrapes the Discord general channel (`#general`, ID `1212446222367985726`), filters out noise, and produces an LLM-generated summary of the day's substantive discussion. Recaps are stored as markdown files, ingested into the RAG vector database for semantic search, and retrievable on demand via the `@Quily recap` bot command.

This complements the existing announcement scraping — announcements capture official news, while recaps capture community discussion and informal updates from the development team.

## Architecture

The recap pipeline runs as a separate step in the daily GitHub Actions workflow (`sync-docs.yml`), after the announcement sync and before change detection.

```
GitHub Action (daily 06:00 UTC)
  ├─ Sync announcements (existing)
  ├─ Generate general recap (NEW)
  │    ├─ Fetch messages via Discord REST API
  │    ├─ Rule-based noise filter
  │    ├─ LLM summarization (DeepSeek V3 via OpenRouter)
  │    └─ Write docs/discord/general-recap/YYYY-MM-DD.md
  ├─ Check for changes
  ├─ Sync docs + ingest into Supabase
  └─ Commit and push
```

**Key components:**

- [recap.ts](scripts/sync-discord/recap.ts) — CLI entry point, orchestrates the full pipeline
- [recap-filter.ts](scripts/sync-discord/recap-filter.ts) — rule-based noise filter
- [recap-summarizer.ts](scripts/sync-discord/recap-summarizer.ts) — OpenRouter LLM summarization
- [recap.ts (bot)](bot/src/handlers/recap.ts) — `@Quily recap` command handler

**Data flow:**

1. `recap.ts` loads the manifest, fetches new messages from the general channel via `discord-api.ts`
2. Messages pass through `recap-filter.ts` which drops bots, short messages, emojis, URLs-only, and noise patterns
3. Filtered messages go to `recap-summarizer.ts` which calls DeepSeek V3 on OpenRouter to produce a structured summary
4. The summary is written as a markdown file with `type: discord_recap` frontmatter
5. The existing ingestion pipeline picks it up and stores it in Supabase
6. Users can retrieve the latest recap via `@Quily recap` in Discord

## Noise Filtering

The rule-based pre-filter (`recap-filter.ts`) applies these heuristics:

**Dropped:** Bot messages, messages under 15 characters, emoji-only messages, URL-only messages (no commentary), noise patterns (`gm`, `gn`, `lol`, `wen`, `wagmi`, etc.)

**Cassie bypass:** Messages from Cassie (Discord user ID `597996105300705301`, lead Quilibrium developer) bypass all rule-based filters. However, the LLM still decides which of her messages are substantive enough to include — casual greetings and noise from Cassie are filtered at the LLM stage, not kept unconditionally.

## LLM Summarization

The summarizer (`recap-summarizer.ts`) calls OpenRouter with configurable model (default: `deepseek/deepseek-chat-v3-0324`).

**Prompt instructions:**
- Group discussion by topic/theme with markdown headings
- Highlight Cassie's substantive contributions in a dedicated "From Cassie" section
- Include shared links and resources with context
- Cover all topics discussed (not just Quilibrium-specific)
- Skip price speculation, casual greetings, noise
- Keep output to 200-500 words

**Safety features:**
- Input truncation at 60,000 characters (~15,000 tokens), oldest non-Cassie messages dropped first
- First-run cap: max 1,000 messages fetched when no manifest entry exists
- Fallback: if the LLM call fails, filtered messages are stored as raw markdown

**Cost:** ~$0.005/day (~$0.15/month)

## RAG Integration

Recaps use `doc_type: discord_recap` and are ingested into Supabase like any other document.

**Retrieval behavior:**
- **No temporal slot** — recaps do NOT surface for "what's the latest news?" queries (announcements handle that)
- **Semantic search only** — recaps surface when the user's question semantically matches discussion topics (e.g., "did anyone discuss QStorage migration?")
- **Source label:** "Community Recap" in citations

## Bot Command: `@Quily recap`

The recap command is implemented as an early bypass in the mention handler ([mention.ts:54-56](bot/src/handlers/mention.ts#L54-L56)). When a user sends `@Quily recap` (exact match only — "recap the latest livestream" goes to normal RAG), it:

1. Queries Supabase for the most recent `discord_recap` chunk
2. Formats and returns it directly (no RAG retrieval, no rate limit consumed)
3. Uses `chunkMessage()` to split if output exceeds Discord's 2,000-character limit

## Configuration

| Env Var | Purpose | Required By |
|---------|---------|-------------|
| `DISCORD_GENERAL_CHANNEL_ID` | General channel snowflake ID | GitHub Actions |
| `OPENROUTER_API_KEY` | LLM API access | GitHub Actions |
| `RECAP_LLM_MODEL` | Override default model (optional) | GitHub Actions |
| `DISCORD_BOT_TOKEN` | Discord API auth | GitHub Actions |

## Storage

- **Output path:** `docs/discord/general-recap/YYYY-MM-DD.md`
- **Manifest:** tracked in `.discord-manifest.json` under the general channel entry
- **Cleanup:** 28-day rolling window (handled by existing `cleanOldAnnouncements`)
- **Frontmatter:** `type: discord_recap`, `channel: general`

## Technical Decisions

- **Separate env var (`DISCORD_GENERAL_CHANNEL_ID`)** instead of adding to `DISCORD_CHANNEL_IDS`: keeps announcement and recap pipelines completely independent, avoiding the need to modify existing sync-discord code.
- **DeepSeek V3 (open source)** instead of proprietary models: strong summarization at negligible cost (~$0.15/month), user preference for open source.
- **No temporal slot in RAG**: recaps are supplementary context, not authoritative news. Announcements are the canonical source for "latest news" queries. Recaps surface only via semantic similarity.
- **Early bypass in mention handler** instead of separate event listener: avoids dual-handler conflicts where both handlers fire on the same message.

## Known Limitations

- **24-hour delay**: recaps are generated once daily at 06:00 UTC. Messages from the current day aren't available until the next run.
- **Single-channel**: only scrapes `#general`. Adding more channels would require extending `DISCORD_GENERAL_CHANNEL_ID` to a list or adding new env vars.
- **LLM quality variance**: summarization quality depends on the model. DeepSeek V3 performs well but may occasionally miss nuance or misattribute discussion threads.
- **No date targeting**: `@Quily recap` returns only the most recent recap. Users cannot request a specific date's recap.

## Related Documentation

- [Automated Documentation Sync Pipeline](.agents/docs/automated-docs-sync-pipeline.md) — the parent workflow this feature extends
- [Discord Bot Architecture](.agents/docs/discord-bot-architecture.md) — bot handler patterns and message flow

---

*Updated: 2026-03-19*
