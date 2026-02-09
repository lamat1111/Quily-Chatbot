# Quily Chat

A self-hosted RAG chatbot that answers questions about the Quilibrium protocol using official documentation and livestream transcriptions.

> **Beta**: This project is under active development. Expect rough edges and contributions are welcome!

### [>> Try the live demo <<](https://quily.quilibrium.one/)

## Features

- **RAG-powered answers** with source citations from official Quilibrium docs
- **Streaming responses** via Chutes (recommended) or OpenRouter
- **Chutes OAuth** for easy sign-in without API keys
- **OpenRouter support** as an alternative provider (requires API key)
- **Two-stage retrieval** with Cohere or Cloudflare reranking (free tier available)
- **Auto-sync** documentation from GitHub with incremental updates
- **Conversation history** persisted in browser localStorage
- **Dark mode** support
- **Mobile responsive** design

---

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- Chutes account (recommended) **OR** OpenRouter API key (for chat)
- GitHub token (for docs sync, no scopes needed)

### 1. Clone and Install

```bash
git clone https://github.com/lamat1111/Quily-Chatbot.git
cd Quily-Chatbot
yarn
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key

# Chutes OAuth (recommended - enables Sign in with Chutes)
CHUTES_OAUTH_CLIENT_ID=cid_xxx
CHUTES_OAUTH_CLIENT_SECRET=csc_xxx
CHUTES_OAUTH_SCOPES="openid profile chutes:invoke"
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Optional overrides
# CHUTES_OAUTH_REDIRECT_URI=https://your-domain.com/api/auth/chutes/callback
# CHUTES_IDP_BASE_URL=https://api.chutes.ai

# OpenRouter (alternative provider - requires API key)
OPENROUTER_API_KEY=your_openrouter_key

# Cohere reranking (optional, improves retrieval quality)
COHERE_API_KEY=your_cohere_key

# GitHub (required for docs sync)
GITHUB_TOKEN=ghp_your_token_here
```

**Get your keys:**
- [Supabase](https://supabase.com) → Dashboard → Settings → API
- [Chutes](https://chutes.ai) → Create account (recommended, for OAuth sign-in)
- [OpenRouter](https://openrouter.ai/keys) (alternative, requires API key)
- [Cohere](https://dashboard.cohere.com/api-keys) (optional)
- [GitHub](https://github.com/settings/tokens) → Generate token (no scopes needed for public repos)

### 3. Set Up Supabase

Create a new Supabase project and run the schema from `scripts/db/schema.sql` in the SQL Editor.

The schema uses BGE-M3 embeddings (1024 dimensions) which work with both Chutes and OpenRouter providers.

### 4. Sync and Ingest Documentation

```bash
# Sync docs from Quilibrium GitHub repo
yarn sync-docs:run

# Ingest into vector database
yarn ingest:run
```

### 5. Run Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) and configure your preferred provider (Chutes sign-in or OpenRouter API key) in Settings to start chatting.

---

## Documentation Management

The chatbot's knowledge comes from the `./docs` folder. Documentation is organized into two categories:

### 1. Official docs (synced from GitHub, NOT committed)

Official Quilibrium docs are synced from [QuilibriumNetwork/docs](https://github.com/QuilibriumNetwork/docs) into `docs/quilibrium-official/`. This folder is gitignored.

```bash
# Check what would change
yarn sync-docs:status

# Sync latest docs
yarn sync-docs:run

# Force re-download everything
yarn sync-docs:force
```

### 2. Custom docs (your uploads, COMMITTED)

Add your own content to `docs/transcriptions/` or `docs/custom/`. These are version-controlled.

```
docs/
├── quilibrium-official/          ← Synced from GitHub (gitignored)
│   ├── api/
│   ├── discover/
│   ├── learn/
│   └── .sync-manifest.json
├── transcriptions/               ← Your uploads (committed)
│   ├── livestream-notes.txt
│   └── ama-transcript.txt
└── custom/                       ← Your uploads (committed)
    └── Quilibrium Architecture.md
```

### Supported File Types

| Extension | Type | Notes |
|-----------|------|-------|
| `.md` | Markdown | Frontmatter supported |
| `.txt` | Plain text | Good for transcriptions |

---

## Keeping the Knowledge Base Updated

### Automated (recommended)

A GitHub Actions workflow checks for new documentation daily at 06:00 UTC. If changes are detected, it automatically syncs docs and re-ingests embeddings into Supabase.

To enable, add these **GitHub Secrets** (Settings → Secrets and variables → Actions):

| Secret | Value from `.env` |
|--------|-------------------|
| `SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` |
| `SUPABASE_SERVICE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` |
| `CHUTES_API_KEY` | `CHUTES_API_KEY` |

You can also trigger it manually from the Actions tab → "Daily Docs Sync & RAG Ingestion" → "Run workflow".

### Manual update

```bash
# One-command: sync + ingest
yarn sync-docs:ingest

# Or step by step:
yarn sync-docs:run    # Sync latest from GitHub
yarn ingest:run       # Update the RAG database (via Chutes)
```

### After deleting files

```bash
# Remove orphaned chunks from database
yarn ingest:clean
```

### Check sync status

```bash
# GitHub sync status
yarn sync-docs:status

# Database sync status
yarn ingest:status
```

---

## All Commands

### Development

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Production build |
| `yarn start` | Start production server |
| `yarn typecheck` | TypeScript type checking |

### Documentation Sync

| Command | Description |
|---------|-------------|
| `yarn sync-docs:status` | Check for remote changes |
| `yarn sync-docs:run` | Sync docs from GitHub |
| `yarn sync-docs:force` | Force re-download all |
| `yarn sync-docs:ingest` | Sync + auto-ingest |
| `yarn sync-docs:dry` | Preview without downloading |
| `yarn sync-docs verify` | Verify local files match manifest |

### Ingestion

| Command | Description |
|---------|-------------|
| `yarn ingest:run` | Run ingestion pipeline (Chutes, default) |
| `yarn ingest:run-openrouter` | Run ingestion via OpenRouter |
| `yarn ingest:clean` | Ingest + remove orphaned chunks |
| `yarn ingest:dry` | Preview without uploading |
| `yarn ingest:status` | Show local vs database sync |
| `yarn ingest:count` | Count chunks in database |
| `yarn ingest clean` | Remove orphaned chunks only |

---

## Project Structure

```
├── app/
│   ├── api/chat/route.ts       # Streaming chat endpoint with RAG
│   ├── layout.tsx              # Root layout with theme provider
│   └── page.tsx                # Main chat page
├── docs/                       # Documentation source
│   ├── quilibrium-official/    # ← Synced from GitHub (gitignored)
│   ├── transcriptions/         # ← Your uploads (committed)
│   └── custom/                 # ← Your uploads (committed)
├── scripts/
│   ├── ingest/                 # Ingestion pipeline
│   │   ├── index.ts            # CLI orchestrator
│   │   ├── loader.ts           # Document loader (.md, .txt)
│   │   ├── chunker.ts          # Semantic chunking
│   │   ├── embedder.ts         # BGE-M3 embeddings (OpenRouter)
│   │   ├── embedder-chutes.ts  # BGE-M3 embeddings (Chutes)
│   │   └── uploader.ts         # Supabase upload + cleanup
│   ├── sync-docs/              # GitHub sync system
│   │   ├── index.ts            # CLI orchestrator
│   │   ├── github.ts           # GitHub API client
│   │   ├── manifest.ts         # Sync state tracking
│   │   ├── diff.ts             # Change detection
│   │   └── sync.ts             # File sync execution
│   └── db/
│       └── schema.sql          # Supabase schema
├── src/
│   ├── components/
│   │   ├── chat/               # Chat UI components
│   │   ├── sidebar/            # Sidebar components
│   │   └── ui/                 # Shared UI components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/
│   │   ├── rag/                # RAG retrieval system
│   │   ├── openrouter.ts       # Model definitions
│   │   └── supabase.ts         # Database client
│   └── stores/                 # Zustand state management
└── .agents/
    └── docs/                   # Internal documentation
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server-side) |
| `SUPABASE_URL` | Yes | Supabase URL (for scripts) |
| `SUPABASE_SERVICE_KEY` | Yes | Service key (for scripts) |
| `GITHUB_TOKEN` | Yes | For docs sync (no scopes needed) |
| `CHUTES_OAUTH_CLIENT_ID` | Recommended | Chutes OAuth client ID (for Sign in with Chutes) |
| `CHUTES_OAUTH_CLIENT_SECRET` | Recommended | Chutes OAuth client secret |
| `CHUTES_OAUTH_SCOPES` | No | OAuth scopes (default: `openid profile chutes:invoke`) |
| `NEXT_PUBLIC_APP_URL` | No | Used to build OAuth redirect URL |
| `CHUTES_OAUTH_REDIRECT_URI` | No | Override redirect URL |
| `CHUTES_IDP_BASE_URL` | No | Override Chutes IDP base URL |
| `CHUTES_DEFAULT_MODEL` | No | Default Chutes LLM chute URL |
| `NEXT_PUBLIC_CHUTES_DEFAULT_MODEL` | No | Client default Chutes model |
| `CHUTES_EMBEDDING_MODEL` | No | Chutes embedding chute URL |
| `OPENROUTER_API_KEY` | No* | Alternative to Chutes (*required if not using Chutes) |
| `COHERE_API_KEY` | No | Enables reranking (paid, highest quality) |
| `CLOUDFLARE_ACCOUNT_ID` | No | Free reranking via Workers AI |
| `CLOUDFLARE_API_TOKEN` | No | Free reranking via Workers AI |

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **State**: Zustand + localStorage
- **AI**: Vercel AI SDK + Chutes (recommended) or OpenRouter
- **Embeddings**: BGE-M3 (1024 dimensions)
- **Vector DB**: Supabase pgvector
- **Reranking**: Cohere (paid) or Cloudflare Workers AI (free)

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

The free tier is sufficient for most use cases.

---

## Maintenance Guide

### Daily sync (automated)

Documentation sync runs automatically via GitHub Actions. Check the Actions tab for run history and status. To trigger manually:

```bash
# Or run locally:
yarn sync-docs:ingest
```

### After removing outdated content

```bash
# Delete files from ./docs, then:
yarn ingest:clean
```

### Full refresh (if something seems wrong)

```bash
yarn sync-docs:force
yarn ingest:clean
```

### Adding new transcriptions

1. Add `.txt` or `.md` files to `./docs/transcriptions/` or `./docs/custom/`
2. Run `yarn ingest:run`

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Sync rate limited | Add `GITHUB_TOKEN` to `.env` |
| Deleted files still in search | Run `yarn ingest:clean` |
| Embeddings failing | Check `CHUTES_API_KEY` (or `OPENROUTER_API_KEY` if using OpenRouter) |
| Poor search results | Add `COHERE_API_KEY` for reranking |

For detailed documentation, see [.agents/docs/rag-knowledge-base-workflow.md](.agents/docs/rag-knowledge-base-workflow.md).

---

## Related

- [QuilibriumNetwork](https://github.com/QuilibriumNetwork) - Official Quilibrium GitHub organization
- [Quilibrium Docs Repo](https://github.com/QuilibriumNetwork/docs) - Source for the RAG knowledge base
- [docs.quilibrium.com](https://docs.quilibrium.com) - Official documentation
- [quilibrium.com](https://quilibrium.com) - Official website
- [Community Treasury](https://quilibrium.one/#treasury) - Support the project

---

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## License

AGPL-3.0 license
