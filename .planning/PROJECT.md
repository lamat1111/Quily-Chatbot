# Quilibrium AI Assistant

## What This Is

A self-hosted, open-source RAG chatbot that answers questions about the Quilibrium protocol. Users bring their own API keys (via OpenRouter), ask questions, and get accurate answers sourced from official documentation and livestream transcriptions. Zero operational cost for the project maintainers.

## Core Value

Users get instant, accurate answers about Quilibrium from official sources with clear citations — no hunting through docs or Discord history.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Basic chat interface (send message, receive streaming response)
- [ ] API key input stored in browser localStorage
- [ ] Model selection dropdown (Llama 3.1 70B, Mixtral 8x7B, Qwen 2.5, etc.)
- [ ] RAG pipeline: retrieve relevant doc chunks, send to LLM, stream response
- [ ] Source citations displayed with each answer (clickable links to docs)
- [ ] Markdown rendering (code blocks, links, formatting)
- [ ] Mobile-responsive design
- [ ] Error handling (invalid API key, rate limits, API errors)
- [ ] Data ingestion pipeline for markdown docs
- [ ] Data ingestion for livestream transcriptions (20 transcripts, already transcribed)
- [ ] Vector storage in Supabase with pgvector
- [ ] Deployment to Vercel (free tier)

### Out of Scope

- User authentication — users provide their own API keys, no accounts needed
- Payments/subscriptions — zero-cost model by design
- Real-time collaborative features — single-user chat experience
- Voice input/output — text-only for v1
- Image generation — documentation Q&A only
- Chat history persistence — v1.1+ feature
- Multi-turn conversation context — v1.1+ feature
- Admin panel for updating embeddings — v1.1+ feature
- Discord bot integration — v2.0 feature

## Context

**Target Users:**
- Quilibrium node operators needing technical guidance
- Developers building on Quilibrium
- Community members learning about the protocol
- New users onboarding to the ecosystem

**Knowledge Sources:**
- Quilibrium Docusaurus documentation (~50-100 markdown pages)
  - Source: https://github.com/QuilibriumNetwork/docs/tree/main/docs
- 20 livestream transcriptions (30-40 min each, technical content)
  - Already transcribed, ready to ingest

**Update Strategy:**
- Weekly/biweekly manual content refresh
- Version tags to track content freshness

## Constraints

- **Hosting**: Vercel free tier (100GB bandwidth, 100K edge function executions/month)
- **Database**: Supabase free tier (500MB storage, 2GB bandwidth)
- **Embeddings**: all-MiniLM-L6-v2 (384 dimensions) — local compute, no API cost
- **LLM**: User-provided API keys via OpenRouter — no inference cost to project
- **Branding**: Clean, simple UI — no strict Quilibrium branding required
- **Chat UI**: Research needed — evaluate assistant-ui vs chatbot-ui-lite fork

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| User-provided API keys | Zero operational cost, users control their own usage | — Pending |
| OpenRouter as LLM gateway | Supports multiple models, single integration point | — Pending |
| Supabase + pgvector | Free tier sufficient, familiar Postgres interface | — Pending |
| all-MiniLM-L6-v2 embeddings | Good quality, fast, runs locally, 384 dims fits free tier | — Pending |
| Next.js 14 App Router | Modern React, built-in API routes, Vercel-native | — Pending |

---
*Last updated: 2026-01-24 after initialization*
