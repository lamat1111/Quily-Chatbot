---
type: doc
title: "RAG Knowledge Base Workflow"
status: done
ai_generated: true
reviewed_by: null
created: 2026-01-25
updated: 2026-02-09
related_docs:
  - "model-specific-instruction-handling.md"
related_tasks: []
---

# RAG Knowledge Base Workflow

> **⚠️ AI-Generated**: May contain errors. Verify before use.

## Overview

The Quilibrium Assistant uses a Retrieval Augmented Generation (RAG) system to provide accurate, context-aware responses based on your documentation. This system ingests documents, converts them into vector embeddings, stores them in Supabase with pgvector, and retrieves relevant context when users ask questions.

## Architecture

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Document Loader | `scripts/ingest/loader.ts` | Reads `.md` and `.txt` files from `./docs` |
| Semantic Chunker | `scripts/ingest/chunker.ts` | Splits documents into 800-token chunks |
| Embedder (Chutes) | `scripts/ingest/embedder-chutes.ts` | Generates 1024-dim vectors via Chutes (BGE-M3) — default |
| Embedder (OpenRouter) | `scripts/ingest/embedder.ts` | Generates 1024-dim vectors via OpenRouter (BGE-M3) — alternative |
| Uploader | `scripts/ingest/uploader.ts` | Batch inserts to Supabase pgvector |
| CLI Orchestrator | `scripts/ingest/index.ts` | Coordinates the ingestion pipeline |
| Docs Sync | `scripts/sync-docs/` | Syncs docs from GitHub repository |
| Daily Automation | `.github/workflows/sync-docs.yml` | GitHub Actions cron: daily sync + ingest |
| Retriever | `src/lib/rag/retriever.ts` | Two-stage retrieval with optional reranking |
| Prompt Builder | `src/lib/rag/prompt.ts` | Formats context and builds system prompts |
| Chat API | `app/api/chat/route.ts` | Handles user queries with RAG pipeline |

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Documentation Sources                 │
├─────────────────────────────────────────────────────────┤
│  GitHub Repo ──sync-docs──▶ ./docs/quilibrium-official/ │
│  (QuilibriumNetwork/docs)   (gitignored, not committed) │
│                                                         │
│  Manual Uploads ──────────▶ ./docs/transcriptions/      │
│  (transcriptions, etc.)     ./docs/custom/              │
│                             (version controlled)        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   Ingestion Pipeline   │
         │   (yarn ingest)     │
         └───────────┬───────────┘
                     │
         ├─→ Loader (reads .md and .txt files)
         │
         ├─→ Chunker (500-1000 tokens, heading context)
         │
         ├─→ Embedder (BGE-M3 via OpenRouter or Chutes)
         │
         └─→ Supabase pgvector Database
                      │
                      ├─ document_chunks_chutes table
                      ├─ 1024-dim vectors (BGE-M3)
                      ├─ HNSW index
                      └─ match_document_chunks_chutes() RPC
                           │
                           ▼
                ┌───────────────────┐
                │   User Query      │
                │   (Browser)       │
                └─────────┬─────────┘
                          │
                    ┌─────┴─────┐
                    │            │
                    ▼            ▼
              Embed Query  → Vector Search (top 15)
                    │            │
                    └─────┬──────┘
                          │
                     Rerank (optional, top 5)
                          │
                    Format Context
                          │
                   Stream LLM Response
                    (OpenRouter or Chutes + Citations)
```

---

## Step 1: Prepare Documentation

### File Location

Documentation is organized in the `./docs` directory into two categories:

```
docs/
├── quilibrium-official/          ← Synced from GitHub (gitignored)
│   ├── api/
│   │   ├── 01-overview.md
│   │   └── 03-q-storage/
│   ├── discover/
│   │   ├── 01-what-is-quilibrium.md
│   │   └── 02-FAQ.md
│   ├── learn/
│   └── .sync-manifest.json       ← Tracks GitHub-synced files
├── transcriptions/               ← Manual uploads (committed)
│   ├── x-space-april-2025.txt
│   └── live-stream-notes.txt
└── custom/                       ← Manual uploads (committed)
    └── Quilibrium Architecture.md
```

### Documentation Categories

| Folder | Source | Git Status | Purpose |
|--------|--------|------------|---------|
| `quilibrium-official/` | GitHub sync | Gitignored | Official docs from QuilibriumNetwork/docs repo |
| `transcriptions/` | Manual upload | Committed | Video/audio transcriptions, AMAs |
| `custom/` | Manual upload | Committed | Custom docs, architecture notes, etc. |

### Supported File Types

| Extension | Type | Frontmatter |
|-----------|------|-------------|
| `.md` | Markdown documentation | Supported (optional) |
| `.txt` | Plain text (transcriptions) | Not parsed |

### Document Format

Markdown documents support optional YAML frontmatter:

```markdown
---
title: "Getting Started with Quilibrium"
category: "guides"
---

# Getting Started

## Overview
Your content here...

### Prerequisites
- Requirement 1
- Requirement 2
```

Plain text files (`.txt`) are ingested as-is without frontmatter parsing.

### Best Practices

- **Use clear headings**: The chunker preserves heading hierarchy for context
- **Keep sections focused**: Each section should cover one topic
- **Use descriptive headings**: They become part of the chunk metadata
- **Include code examples**: They're preserved in chunks
- **Avoid very long paragraphs**: Chunking works better with natural breaks

---

## Step 2: Set Up Supabase Database

### Run the Schema

Execute the SQL schema in your Supabase SQL Editor. The schema file is located at `scripts/db/schema.sql`.

The schema creates:

1. **Enable pgvector extension**:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

2. **document_chunks_chutes table** (unified BGE-M3 embeddings):
```sql
CREATE TABLE document_chunks_chutes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  content TEXT NOT NULL,
  embedding vector(1024) NOT NULL,  -- BGE-M3 produces 1024 dimensions
  source_file TEXT NOT NULL,
  heading_path TEXT,
  chunk_index INTEGER NOT NULL,
  token_count INTEGER NOT NULL,
  version TEXT,
  content_hash TEXT NOT NULL,
  source_url TEXT,  -- External URL for source attribution (e.g., YouTube URL)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_file, chunk_index)
);
```

3. **HNSW index for fast similarity search**:
```sql
CREATE INDEX document_chunks_chutes_embedding_idx
  ON document_chunks_chutes
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

4. **match_document_chunks_chutes() RPC function**:
```sql
CREATE OR REPLACE FUNCTION match_document_chunks_chutes(
  query_embedding vector(1024),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id bigint,
  content text,
  source_file text,
  heading_path text,
  source_url text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    dc.source_file,
    dc.heading_path,
    dc.source_url,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks_chutes dc
  WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## Step 3: Configure Environment Variables

Create or update `.env` with the following variables:

```env
# Supabase Configuration (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Legacy alias (used by ingestion scripts)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Chutes API Key (required for ingestion and chat)
CHUTES_API_KEY=your_chutes_key

# OpenRouter API Key (alternative embedder, optional)
OPENROUTER_API_KEY=your_openrouter_key

# Cohere API Key (optional but recommended for better search)
COHERE_API_KEY=your_cohere_key

# GitHub Token (required for docs sync - no scopes needed for public repos)
GITHUB_TOKEN=ghp_your_token_here
```

### Where to Get Keys

| Key | Source |
|-----|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → Service Role Key |
| `CHUTES_API_KEY` | [Chutes](https://chutes.ai/app/api) (required for ingestion and chat) |
| `OPENROUTER_API_KEY` | [OpenRouter](https://openrouter.ai/keys) (alternative embedder, optional) |
| `COHERE_API_KEY` | [Cohere Dashboard](https://dashboard.cohere.com/api-keys) |
| `GITHUB_TOKEN` | [GitHub Settings](https://github.com/settings/tokens) (no scopes needed) |

---

## Step 4: Sync Documentation from GitHub

The sync system pulls documentation from the Quilibrium Network GitHub repository.

### Sync Commands

```bash
# Check sync status (shows what would change)
yarn sync-docs:status

# Sync docs from GitHub (incremental - only downloads changes)
yarn sync-docs:run

# Preview changes without downloading
yarn sync-docs:dry

# Force re-download all files (ignores manifest)
yarn sync-docs:force

# Sync and automatically run RAG ingestion
yarn sync-docs:ingest

# Verify local files match manifest
yarn sync-docs verify
```

### How Sync Works

1. **Fetches file list** from GitHub API (`QuilibriumNetwork/docs` repo)
2. **Compares** against local `.sync-manifest.json` in `docs/quilibrium-official/`
3. **Downloads** only new/modified files to `docs/quilibrium-official/`
4. **Synced files are gitignored** - each deployment pulls fresh from GitHub

### Manual Files

Files in `docs/transcriptions/` and `docs/custom/` are:
- **Version controlled** - committed to your repo
- **Not touched by sync** - sync only manages `quilibrium-official/`
- **Included in ingestion** - all `./docs` subfolders are processed

---

## Step 5: Run the Ingestion Pipeline

### Ingestion Commands

```bash
# Full ingestion via Chutes (default)
yarn ingest:run

# Full ingestion via OpenRouter (alternative)
yarn ingest:run-openrouter

# Full ingestion with cleanup of deleted files
yarn ingest:clean

# Preview without uploading (dry run)
yarn ingest:dry

# Specify docs directory and version tag
yarn ingest -- run -d ./docs -v "v1.0"
```

### Maintenance Commands

```bash
# Check sync status between local docs and database
yarn ingest:status

# Count total chunks in database
yarn ingest:count

# Remove chunks for deleted files (standalone cleanup)
yarn ingest clean

# Preview cleanup without making changes
yarn ingest -- clean --dry-run
```

### What Happens During Ingestion

1. **Loading**: Reads all `.md` and `.txt` files from `./docs` recursively
2. **Cleaning** (if `--clean`): Removes chunks for files that no longer exist
3. **Chunking**: Splits into ~800-token chunks with 100-token overlap
4. **Embedding**: Generates 1024-dimensional vectors using BGE-M3 (via Chutes by default, or OpenRouter)
5. **Uploading**: Upserts chunks to Supabase (updates on re-ingestion)

### Expected Output

```
📚 Quilibrium Docs Ingestion Pipeline

  Docs path: ./docs
  Version: 2026-01-25
  Clean orphans: true
  Dry run: false

✔ Loaded 262 documents
✔ No orphaned chunks found
✔ Created 586 chunks (283,460 tokens total)
✔ Generated 586 embeddings
✔ Uploaded 586 chunks
✔ Total chunks in database: 586

✅ Ingestion complete!
```

---

## Step 6: Common Workflows

### Adding New Documentation

```bash
# 1. Add files to ./docs (manually or via sync)
yarn sync-docs:run

# 2. Run ingestion
yarn ingest:run
```

### Updating Existing Documentation

```bash
# 1. Sync latest from GitHub
yarn sync-docs:run

# 2. Re-ingest (upserts handle updates)
yarn ingest:run
```

### Deleting Documentation

```bash
# 1. Delete files from ./docs

# 2. Run ingestion with cleanup
yarn ingest:clean
```

### Full Refresh

```bash
# 1. Force sync all docs from GitHub
yarn sync-docs:force

# 2. Clean and re-ingest everything
yarn ingest:clean
```

### One-Command Update (Sync + Ingest)

```bash
yarn sync-docs:ingest
```

### Automated Daily Sync (GitHub Actions)

A GitHub Actions workflow runs daily at 06:00 UTC to keep the knowledge base current without manual intervention.

**How it works:**
1. Checks the QuilibriumNetwork/docs repo for changes via `yarn sync-docs status`
2. If changes are detected, runs `yarn sync-docs sync --ingest` (sync + embed via Chutes + upload to Supabase)
3. Commits the updated `.sync-manifest.json` and docs back to the repo
4. If no changes, exits in ~15 seconds with no side effects

**Workflow file:** `.github/workflows/sync-docs.yml`

**Required GitHub Secrets** (Settings → Secrets and variables → Actions):

| Secret | Value from `.env` |
|--------|-------------------|
| `SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` |
| `SUPABASE_SERVICE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` |
| `CHUTES_API_KEY` | `CHUTES_API_KEY` |

**Manual trigger:** Go to the repo's Actions tab → "Daily Docs Sync & RAG Ingestion" → "Run workflow"

**Cost:** Negligible — ~15 minutes/month of GitHub Actions time (free tier is 2,000 minutes/month).

---

## Step 7: How RAG Works at Runtime

### Query Flow

When a user sends a message:

1. **Extract Query**: The chat API extracts the user's latest message

2. **Embed Query**: The query is converted to a 1024-dim vector using BGE-M3 (via OpenRouter or Chutes, depending on provider)

3. **Vector Search**: Supabase RPC `match_document_chunks_chutes()` finds top 15 similar chunks by cosine similarity

4. **Reranking** (if Cohere key available):
   - Cohere's `rerank-v3.5` model reorders the 15 candidates
   - Selects the 5 most relevant chunks
   - Provides 20-35% accuracy improvement

5. **Context Building**: Retrieved chunks are formatted with citation indices:
   ```
   [1] Source: docs/getting-started.md > Installation
   ---
   Content of the chunk...

   [2] Source: docs/concepts/consensus.md > Proof of Work
   ---
   Content of another chunk...
   ```

6. **LLM Generation**: The system prompt instructs the LLM to:
   - Use ONLY the provided context
   - Include citation numbers `[1]`, `[2]`, etc.
   - Avoid hallucination outside context

7. **Response Streaming**: The response streams to the client with:
   - Source URLs for citations
   - LLM-generated text with inline citations

### Configuration Options

The retrieval system accepts these options (`src/lib/rag/types.ts`):

```typescript
interface RetrievalOptions {
  embeddingProvider?: 'openrouter' | 'chutes';  // Provider for embeddings
  embeddingApiKey?: string;          // OpenRouter API key
  chutesAccessToken?: string;        // Chutes access token
  embeddingModel?: string;           // Optional model ID override
  cohereApiKey?: string;             // Optional reranking (paid)
  initialCount?: number;             // 15 (candidates)
  finalCount?: number;               // 5 (final results)
  similarityThreshold?: number;      // 0.35 (cosine similarity)
}
```

---

## Quick Reference

### All Commands

| Command | Description |
|---------|-------------|
| `yarn sync-docs:status` | Check for remote changes |
| `yarn sync-docs:run` | Sync docs from GitHub |
| `yarn sync-docs:force` | Force re-download all |
| `yarn sync-docs:ingest` | Sync + auto-ingest |
| `yarn sync-docs:dry` | Preview without downloading |
| `yarn ingest:run` | Run ingestion pipeline (Chutes, default) |
| `yarn ingest:run-openrouter` | Run ingestion via OpenRouter |
| `yarn ingest:clean` | Ingest + remove orphans |
| `yarn ingest:dry` | Preview without uploading |
| `yarn ingest:status` | Show local vs DB sync status |
| `yarn ingest:count` | Count chunks in database |
| `yarn ingest clean` | Remove orphaned chunks |

### Checklist

| Step | Action | Command |
|------|--------|---------|
| 1 | Set environment variables | Edit `.env` |
| 2 | Run database schema | Supabase SQL Editor |
| 3 | Sync docs from GitHub | `yarn sync-docs:run` |
| 4 | Add manual docs (optional) | Copy to `./docs/` |
| 5 | Run ingestion | `yarn ingest:run` |
| 6 | Verify | `yarn ingest:status` |
| 7 | Test the chatbot | Ask questions in the UI |

---

## Troubleshooting

### "No chunks found" after ingestion

- Verify `.env` has correct Supabase credentials
- Check that `./docs` folder contains `.md` or `.txt` files
- Run `yarn ingest:dry` to see what would be processed

### Poor search results

- Add `COHERE_API_KEY` for reranking
- Improve document structure with clear headings
- Ensure chunks have sufficient context (check heading_path)

### "Embedding failed" errors

- Verify `CHUTES_API_KEY` is valid (default embedder)
- Check Chutes account has credits
- Review rate limiting (100ms delay between batches)
- If using OpenRouter (`yarn ingest:run-openrouter`), verify `OPENROUTER_API_KEY` and credits

### Deleted files still appearing in results

- Run `yarn ingest:clean` to remove orphaned chunks
- Or run `yarn ingest clean` followed by `yarn ingest:run`

### GitHub sync rate limited

- Add `GITHUB_TOKEN` to `.env` (5,000 requests/hour vs 60 unauthenticated)
- Create token at https://github.com/settings/tokens (no scopes needed)

### Sync not detecting changes

- Check `.sync-manifest.json` exists in `./docs/`
- Run `yarn sync-docs:force` to re-download all files
- Verify `GITHUB_TOKEN` is set correctly

---

## Technical Decisions

### Why 800-token chunks?

- **Balance**: Large enough for context, small enough for precision
- **Overlap**: 100-token overlap preserves context across boundaries
- **Embedding quality**: Fits well within embedding model limits

### Why BGE-M3 instead of text-embedding-3-small?

- **Better retrieval quality**: MTEB score 63.0 vs 55.8 for text-embedding-3-small
- **Open source**: MIT licensed, no vendor lock-in
- **Provider compatibility**: Both OpenRouter and Chutes produce identical vectors
- **Unified table**: Single database table works regardless of which provider generates embeddings

### Why HNSW index?

- **Speed**: Sub-millisecond query times even with millions of vectors
- **Accuracy**: Minimal recall loss compared to exact search
- **Scalability**: Handles growing knowledge bases efficiently

### Why two-stage retrieval?

- **Recall**: Vector search casts a wide net (15 candidates, or 25 for broad queries)
- **Precision**: Reranking focuses on the most relevant (5 results, or 10 for broad queries)
- **Quality**: Cohere reranking provides semantic understanding beyond vector similarity
- **Multi-topic coverage**: Query decomposition generates sub-queries per product for broad/multi-entity queries, merged via Reciprocal Rank Fusion. See [RAG Query Decomposition](rag-query-decomposition.md).

### Why support .txt files?

- **Transcriptions**: Video/audio transcriptions naturally come as plain text
- **Flexibility**: Not all content needs markdown formatting
- **Simplicity**: No conversion needed for raw text content

### Model-Specific Behavior

The chat API implements differentiated behavior based on model capabilities. See [Model-Specific Instruction Handling](model-specific-instruction-handling.md) for details on how frontier models (Claude/GPT/Gemini) vs open-source models handle low-relevance RAG results.

---

_Updated: 2026-02-10_
