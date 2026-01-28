# Quily Assistant

A self-hosted RAG chatbot that answers questions about the Quilibrium protocol using official documentation and livestream transcriptions.

**Zero operational cost** — users bring their own API keys via OpenRouter or sign in with Chutes.

## Features

- **RAG-powered answers** with source citations from official Quilibrium docs
- **Streaming responses** via OpenRouter (supports Llama, Mixtral, Claude, GPT-4, etc.)
- **Optional Chutes OAuth** for using Chutes models without API keys
- **Two-stage retrieval** with optional Cohere reranking for improved accuracy
- **Auto-sync** documentation from GitHub with incremental updates
- **Conversation history** persisted in browser localStorage
- **Dark mode** support
- **Mobile responsive** design

---

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- OpenRouter API key **OR** Chutes account (for chat)
- GitHub token (for docs sync, no scopes needed)

### 1. Clone and Install

```bash
git clone https://github.com/lamat1111/Quily-Chatbot.git
cd Quily-Chatbot
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key

# OpenRouter (required for ingestion and embeddings)
OPENROUTER_API_KEY=your_openrouter_key

# Chutes OAuth (optional - enables Sign in with Chutes)
CHUTES_OAUTH_CLIENT_ID=cid_xxx
CHUTES_OAUTH_CLIENT_SECRET=csc_xxx
CHUTES_OAUTH_SCOPES="openid profile chutes:invoke"
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Optional overrides
# CHUTES_OAUTH_REDIRECT_URI=https://your-domain.com/api/auth/chutes/callback
# CHUTES_IDP_BASE_URL=https://api.chutes.ai

# Cohere reranking (optional, improves retrieval quality)
COHERE_API_KEY=your_cohere_key

# GitHub (required for docs sync)
GITHUB_TOKEN=ghp_your_token_here
```

**Get your keys:**
- [Supabase](https://supabase.com) → Dashboard → Settings → API
- [OpenRouter](https://openrouter.ai/keys) (for API key auth)
- [Chutes](https://chutes.ai) → Create account (for OAuth sign-in, alternative to OpenRouter)
- [Cohere](https://dashboard.cohere.com/api-keys) (optional)
- [GitHub](https://github.com/settings/tokens) → Generate token (no scopes needed for public repos)

### 3. Set Up Supabase

Create a new Supabase project and run the schema from `scripts/db/schema.sql` in the SQL Editor.

Or run this minimal setup:

```sql
-- Enable pgvector extension
create extension if not exists vector;

-- Create document chunks table
create table document_chunks (
  id bigint primary key generated always as identity,
  content text not null,
  embedding vector(1536),
  source_file text not null,
  heading_path text,
  chunk_index integer not null,
  token_count integer not null,
  version text,
  content_hash text not null,
  created_at timestamptz default now(),
  unique(source_file, chunk_index)
);

-- Create HNSW index for fast similarity search
create index document_chunks_embedding_idx
  on document_chunks
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- Create similarity search function
create or replace function match_document_chunks(
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 10
)
returns table (
  id bigint,
  content text,
  source_file text,
  heading_path text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    dc.id,
    dc.content,
    dc.source_file,
    dc.heading_path,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  where 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

### 4. Sync and Ingest Documentation

```bash
# Sync docs from Quilibrium GitHub repo
npm run sync-docs:run

# Ingest into vector database
npm run ingest:run
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and configure your preferred provider (OpenRouter API key or Chutes sign-in) in Settings to start chatting.

---

## Documentation Management

The chatbot's knowledge comes from the `./docs` folder. Documentation is organized into two categories:

### 1. Official docs (synced from GitHub, NOT committed)

Official Quilibrium docs are synced from [QuilibriumNetwork/docs](https://github.com/QuilibriumNetwork/docs) into `docs/quilibrium-official/`. This folder is gitignored.

```bash
# Check what would change
npm run sync-docs:status

# Sync latest docs
npm run sync-docs:run

# Force re-download everything
npm run sync-docs:force
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

### Regular update workflow

```bash
# 1. Sync latest from GitHub
npm run sync-docs:run

# 2. Update the RAG database
npm run ingest:run
```

### One-command update

```bash
npm run sync-docs:ingest
```

### After deleting files

```bash
# Remove orphaned chunks from database
npm run ingest:clean
```

### Check sync status

```bash
# GitHub sync status
npm run sync-docs:status

# Database sync status
npm run ingest:status
```

---

## All Commands

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run typecheck` | TypeScript type checking |

### Documentation Sync

| Command | Description |
|---------|-------------|
| `npm run sync-docs:status` | Check for remote changes |
| `npm run sync-docs:run` | Sync docs from GitHub |
| `npm run sync-docs:force` | Force re-download all |
| `npm run sync-docs:ingest` | Sync + auto-ingest |
| `npm run sync-docs:dry` | Preview without downloading |
| `npm run sync-docs verify` | Verify local files match manifest |

### Ingestion

| Command | Description |
|---------|-------------|
| `npm run ingest:run` | Run ingestion pipeline |
| `npm run ingest:clean` | Ingest + remove orphaned chunks |
| `npm run ingest:dry` | Preview without uploading |
| `npm run ingest:status` | Show local vs database sync |
| `npm run ingest:count` | Count chunks in database |
| `npm run ingest clean` | Remove orphaned chunks only |

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
│   │   ├── embedder.ts         # OpenRouter embeddings
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
| `OPENROUTER_API_KEY` | Yes* | For embeddings during ingestion (*required for ingestion, optional for chat if using Chutes) |
| `COHERE_API_KEY` | No | Enables reranking for better retrieval |
| `GITHUB_TOKEN` | Yes | For docs sync (no scopes needed) |
| `CHUTES_OAUTH_CLIENT_ID` | No | Chutes OAuth client ID (for Sign in with Chutes) |
| `CHUTES_OAUTH_CLIENT_SECRET` | No | Chutes OAuth client secret |
| `CHUTES_OAUTH_SCOPES` | No | OAuth scopes (default: `openid profile chutes:invoke`) |
| `NEXT_PUBLIC_APP_URL` | No | Used to build OAuth redirect URL |
| `CHUTES_OAUTH_REDIRECT_URI` | No | Override redirect URL |
| `CHUTES_IDP_BASE_URL` | No | Override Chutes IDP base URL |
| `CHUTES_DEFAULT_MODEL` | No | Default Chutes LLM chute URL |
| `NEXT_PUBLIC_CHUTES_DEFAULT_MODEL` | No | Client default Chutes model |
| `CHUTES_EMBEDDING_MODEL` | No | Chutes embedding chute URL |

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **State**: Zustand + localStorage
- **AI**: Vercel AI SDK + OpenRouter
- **Vector DB**: Supabase pgvector
- **Reranking**: Cohere (optional)

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

The free tier is sufficient for most use cases.

### Docker

```bash
docker build -t quily-chatbot .
docker run -p 3000:3000 --env-file .env quily-chatbot
```

---

## Maintenance Guide

### Daily/Weekly tasks

```bash
# Check for doc updates and sync
npm run sync-docs:ingest
```

### After removing outdated content

```bash
# Delete files from ./docs, then:
npm run ingest:clean
```

### Full refresh (if something seems wrong)

```bash
npm run sync-docs:force
npm run ingest:clean
```

### Adding new transcriptions

1. Add `.txt` or `.md` files to `./docs/video-transcriptions/`
2. Run `npm run ingest:run`

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Sync rate limited | Add `GITHUB_TOKEN` to `.env` |
| Deleted files still in search | Run `npm run ingest:clean` |
| Embeddings failing | Check `OPENROUTER_API_KEY` and credits |
| Poor search results | Add `COHERE_API_KEY` for reranking |

For detailed documentation, see [.agents/docs/rag-knowledge-base-workflow.md](.agents/docs/rag-knowledge-base-workflow.md).

---

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## License

AGPL-3.0 license
