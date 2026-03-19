---
type: doc
title: "Discord Bot Architecture"
description: "Discord bot design: @mention handler, shared RAG service, rate limiting, conversation memory, and VPS deployment via pm2"
status: done
ai_generated: true
created: 2026-03-18
updated: 2026-03-18
related_docs:
  - .agents/tasks/2026-03-17-discord-bot-design.md
  - .agents/docs/rag-knowledge-base-workflow.md
related_tasks:
  - .agents/tasks/2026-03-17-discord-bot-plan.md
---

# Discord Bot Architecture

> **AI-Generated**: May contain errors. Verify before use.

## Overview

Quily runs as a Discord bot in the Quilibrium community server, responding to @mentions with RAG-powered answers sourced from the same knowledge base as the web chat UI. The bot shares the RAG retrieval pipeline (`src/lib/rag/`) with the web app but uses non-streaming text generation and Discord-specific formatting.

## Architecture

```
quily-chatbot/
├── src/lib/rag/
│   └── service.ts          # Shared RAG service (prepareQuery + processQuery)
├── bot/
│   ├── src/
│   │   ├── index.ts                 # Discord.js client, env validation, shutdown
│   │   ├── handlers/mention.ts      # @mention handler — orchestrates query flow
│   │   ├── utils/rateLimiter.ts     # Per-user cooldown + daily global cap
│   │   ├── utils/memory.ts          # Conversation memory with TTL + RAG continuity
│   │   ├── utils/messageChunker.ts  # Split messages at Discord's 2000-char limit
│   │   └── formatter.ts            # Markdown adaptation + source citations
│   ├── tsup.config.ts              # Bundles shared src/lib/ into dist/
│   └── .env.example                # All required env vars
```

### Shared RAG Service (`src/lib/rag/service.ts`)

Two entry points used by different consumers:

- **`prepareQuery()`** — Normalizes query, runs retrieval (embed + vector search + rerank), builds system prompt. Returns the prompt, chunks, and quality assessment. Used by the web app's streaming chat route.
- **`processQuery()`** — Calls `prepareQuery()`, then runs `generateText()` (non-streaming) with model fallback chain, parses follow-up questions. Used by the Discord bot.

Both functions accept a `llmProvider` option (`'openrouter'` or `'chutes'`) that controls which AI SDK provider and model IDs are used.

### Dual LLM Provider Support

The bot supports two LLM providers, switchable via the `BOT_LLM_PROVIDER` env var:

| Provider | Default Model | Fallbacks |
|---|---|---|
| `openrouter` | `deepseek/deepseek-chat-v3-0324` | `qwen/qwen3-32b`, `mistralai/mistral-small-3.2-24b-instruct` |
| `chutes` | `chutes-deepseek-ai-deepseek-v3-1-tee` | `chutes-qwen-qwen3-32b`, `chutes-chutesai-mistral-small-3-2-24b-instruct-2506` |

Chutes model IDs are slugs converted to URLs (e.g., `https://chutes-deepseek-ai-deepseek-v3-1-tee.chutes.ai`) by `getChuteUrl()` in `service.ts`. Embeddings always use OpenRouter regardless of the LLM provider.

Provider switching requires changing the env var and restarting the bot — env vars are read at process startup.

### Message Flow

1. Discord `messageCreate` event fires
2. Ignore bots and non-mentions
3. Check rate limits (daily cap, then per-user cooldown)
4. Strip `<@botId>` from message to extract the query
5. Load conversation history + last chunk IDs for RAG continuity
6. Show typing indicator (refreshed every 9 seconds)
7. Call `processQuery()` with 60-second timeout
8. Format response for Discord (link conversion, table conversion, source citations)
9. Chunk if >2000 chars, send as reply
10. Store exchange in conversation memory

### Rate Limiting (`bot/src/utils/rateLimiter.ts`)

- **Per-user cooldown:** 15 seconds between requests. If hit, bot reacts with a clock emoji instead of replying.
- **Daily global cap:** Configurable via `DISCORD_DAILY_LIMIT` (default: 500). Resets at UTC midnight. When reached, bot replies with a limit message.
- Lazy cleanup removes stale per-user entries.

### Conversation Memory (`bot/src/utils/memory.ts`)

- Keyed by `userId:channelId` — conversations are per-user, per-channel
- Sliding window: last 5 user/bot message pairs
- 5-minute TTL with lazy eviction (no background timer)
- Stores chunk IDs from the last response for RAG priority boosting on follow-ups
- In-memory only — lost on restart, acceptable given the short TTL

### Message Chunker (`bot/src/utils/messageChunker.ts`)

- Splits at newline boundaries when response exceeds the Discord limit (2000 chars)
- Preserves code blocks: detects unclosed ``` fences, closes in current chunk, reopens in next
- First chunk is sent as a reply; subsequent chunks as regular messages

### Discord Formatter (`bot/src/formatter.ts`)

- Converts `[text](url)` markdown links to `text — <url>` (Discord doesn't render markdown links)
- Converts markdown tables to code blocks
- Appends up to 3 source citations with type labels (Official Docs, Livestream, Community, etc.)
- Livestream sources include published date when available

### Model Fallback Chain (`service.ts`)

If the primary model fails (503, unavailable, etc.), `processQuery()` tries each fallback model in order. The fallback list is provider-specific and can be overridden via `BOT_FALLBACK_MODELS` env var (comma-separated).

### Low-Relevance Quality Gate (`service.ts`)

When RAG retrieval quality is not `'high'` and the model is not in the `INSTRUCTION_FOLLOWING_MODELS` list (Claude, Gemini, GPT), the bot returns a canned fallback response instead of calling the LLM. This prevents hallucination with models that don't reliably follow system prompt constraints.

## Error Handling

| Scenario | User sees |
|---|---|
| LLM provider error (5xx) | "I'm having trouble connecting right now. Try again in a moment." |
| Credits exhausted (402) / rate limited (429) | "I've hit my usage limit. Try again later." |
| Timeout (>60s) | "That took too long. Try a simpler question?" |
| Per-user cooldown | Clock emoji reaction, no reply |
| Daily cap reached | "I've reached my daily limit. I'll be back tomorrow!" |
| Unknown error | "I ran into something unexpected. Try again?" |

Every message handler is wrapped in try/catch — individual errors never crash the process. discord.js handles Gateway reconnection automatically.

## Build & Deploy

The bot is bundled with **tsup** which resolves imports from `../src/lib/rag/` and produces a single ESM output (`dist/index.js`). npm packages (discord.js, AI SDK, etc.) stay external and are installed from `node_modules` at runtime.

**Hosting:** Hetzner VPS managed with pm2 (auto-restart on crash, survives reboots).

**Deploy workflow:** Commit and push to GitHub, then pull on VPS, install, build, and restart via pm2. Automated with the `/deploy` command.

```bash
# Manual deploy
ssh quily-vps 'cd /home/quily/quily-chatbot && git pull && cd bot && npm install && npm run build && pm2 restart quily-bot'
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DISCORD_BOT_TOKEN` | Yes | Discord bot authentication token |
| `DISCORD_CLIENT_ID` | No | Discord application client ID |
| `BOT_LLM_PROVIDER` | No | `openrouter` (default) or `chutes` |
| `OPENROUTER_API_KEY` | If provider=openrouter | OpenRouter API key for LLM + embeddings |
| `CHUTES_API_KEY` | If provider=chutes | Chutes API key for LLM calls |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (RAG vector store) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `COHERE_API_KEY` | No | Cohere reranking API key |
| `CLOUDFLARE_ACCOUNT_ID` | No | Cloudflare Workers AI (fallback reranker) |
| `CLOUDFLARE_API_TOKEN` | No | Cloudflare API token |
| `BOT_MODEL` | No | Override primary LLM model |
| `BOT_FALLBACK_MODELS` | No | Comma-separated fallback model IDs |
| `DISCORD_DAILY_LIMIT` | No | Daily request cap (default: 500) |
| `MAX_MESSAGE_LENGTH` | No | Discord message limit (default: 2000) |

## Technical Decisions

- **Non-streaming responses:** Discord UX is better with complete messages than with repeated message edits simulating streaming.
- **In-memory conversation storage:** Simple for MVP. The 5-minute TTL means data loss on restart is negligible. A database can be added later if persistent history is needed.
- **@mentions only:** No slash commands, DMs, or thread support in v1. Keeps the interaction model simple and discoverable.
- **Embeddings always via OpenRouter:** Both providers produce identical BGE-M3 1024-dimensional vectors, so the Supabase vector table is unified. OpenRouter is used for embeddings regardless of which LLM provider is active to keep the embedding pipeline consistent.
- **tsup bundler approach:** Avoids monorepo restructuring. Shared code from `src/lib/` is bundled into the bot's output at build time, producing a single deployable artifact.

## Known Limitations

- **No persistent conversation history:** Memory is in-process and lost on restart. Acceptable for the 5-minute TTL window.
- **No slash commands or DM support:** Bot only responds to @mentions in guild channels.
- **No monitoring or alerting:** Relies on pm2 logs and manual checking. Consider adding health check endpoints or log shipping.
- **Single-instance only:** In-memory rate limiting and conversation memory don't work across multiple instances.

## Related Documentation

- [RAG Knowledge Base Workflow](.agents/docs/rag-knowledge-base-workflow.md) — How the shared retrieval pipeline works
- [Discord Bot Design Spec](.agents/tasks/2026-03-17-discord-bot-design.md) — Original design decisions
- [VPS Runbook](.vps/runbook.md) — Deployment and operations guide
