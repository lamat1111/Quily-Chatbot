---
type: doc
title: "RAG Knowledge Base Workflow"
status: done
ai_generated: true
reviewed_by: null
created: 2026-01-25
updated: 2026-01-25
related_docs: []
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
| Embedder | `scripts/ingest/embedder.ts` | Generates 1536-dim vectors via OpenRouter |
| Uploader | `scripts/ingest/uploader.ts` | Batch inserts to Supabase pgvector |
| CLI Orchestrator | `scripts/ingest/index.ts` | Coordinates the ingestion pipeline |
| Docs Sync | `scripts/sync-docs/` | Syncs docs from GitHub repository |
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
         │   (npm run ingest)     │
         └───────────┬───────────┘
                     │
         ├─→ Loader (reads .md and .txt files)
         │
         ├─→ Chunker (500-1000 tokens, heading context)
         │
         ├─→ Embedder (OpenRouter text-embedding-3-small)
         │
         └─→ Supabase pgvector Database
                      │
                      ├─ document_chunks table
                      ├─ 1536-dim vectors
                      ├─ HNSW index
                      └─ match_document_chunks() RPC
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
                    (OpenRouter + Citations)
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

2. **document_chunks table**:
```sql
CREATE TABLE document_chunks (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  content TEXT NOT NULL,
  embedding vector(1536),
  source_file TEXT NOT NULL,
  heading_path TEXT,
  chunk_index INTEGER NOT NULL,
  token_count INTEGER NOT NULL,
  version TEXT,
  content_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_file, chunk_index)
);
```

3. **HNSW index for fast similarity search**:
```sql
CREATE INDEX document_chunks_embedding_idx
  ON document_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

4. **match_document_chunks() RPC function**:
```sql
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id bigint,
  content text,
  source_file text,
  heading_path text,
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
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
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

# OpenRouter API Key (required for ingestion and runtime)
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
| `OPENROUTER_API_KEY` | [OpenRouter](https://openrouter.ai/keys) |
| `COHERE_API_KEY` | [Cohere Dashboard](https://dashboard.cohere.com/api-keys) |
| `GITHUB_TOKEN` | [GitHub Settings](https://github.com/settings/tokens) (no scopes needed) |

---

## Step 4: Sync Documentation from GitHub

The sync system pulls documentation from the Quilibrium Network GitHub repository.

### Sync Commands

```bash
# Check sync status (shows what would change)
npm run sync-docs status

# Sync docs from GitHub (incremental - only downloads changes)
npm run sync-docs sync

# Preview changes without downloading
npm run sync-docs sync -- --dry-run

# Force re-download all files (ignores manifest)
npm run sync-docs sync -- --force

# Sync and automatically run RAG ingestion
npm run sync-docs sync -- --ingest

# Verify local files match manifest
npm run sync-docs verify
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
# Full ingestion (add/update chunks)
npm run ingest run

# Full ingestion with cleanup of deleted files
npm run ingest run -- --clean

# Preview without uploading (dry run)
npm run ingest run -- --dry-run

# Specify docs directory and version tag
npm run ingest run -- -d ./docs -v "v1.0"
```

### Maintenance Commands

```bash
# Check sync status between local docs and database
npm run ingest status

# Count total chunks in database
npm run ingest count

# Remove chunks for deleted files (standalone cleanup)
npm run ingest clean

# Preview cleanup without making changes
npm run ingest clean -- --dry-run
```

### What Happens During Ingestion

1. **Loading**: Reads all `.md` and `.txt` files from `./docs` recursively
2. **Cleaning** (if `--clean`): Removes chunks for files that no longer exist
3. **Chunking**: Splits into ~800-token chunks with 100-token overlap
4. **Embedding**: Generates 1536-dimensional vectors using `text-embedding-3-small`
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
npm run sync-docs sync

# 2. Run ingestion
npm run ingest run
```

### Updating Existing Documentation

```bash
# 1. Sync latest from GitHub
npm run sync-docs sync

# 2. Re-ingest (upserts handle updates)
npm run ingest run
```

### Deleting Documentation

```bash
# 1. Delete files from ./docs

# 2. Run ingestion with cleanup
npm run ingest run -- --clean
```

### Full Refresh

```bash
# 1. Force sync all docs from GitHub
npm run sync-docs sync -- --force

# 2. Clean and re-ingest everything
npm run ingest run -- --clean
```

### One-Command Update (Sync + Ingest)

```bash
npm run sync-docs sync -- --ingest
```

---

## Step 7: How RAG Works at Runtime

### Query Flow

When a user sends a message:

1. **Extract Query**: The chat API extracts the user's latest message

2. **Embed Query**: The query is converted to a 1536-dim vector using the same embedding model

3. **Vector Search**: Supabase RPC `match_document_chunks()` finds top 15 similar chunks by cosine similarity

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
  embeddingApiKey: string;           // OpenRouter key
  cohereApiKey?: string;             // Optional reranking
  initialCount?: number;             // 15 (candidates)
  finalCount?: number;               // 5 (final results)
  similarityThreshold?: number;      // 0.5 (cosine similarity)
}
```

---

## Quick Reference

### All Commands

| Command | Description |
|---------|-------------|
| `npm run sync-docs status` | Check for remote changes |
| `npm run sync-docs sync` | Sync docs from GitHub |
| `npm run sync-docs sync -- --force` | Force re-download all |
| `npm run sync-docs sync -- --ingest` | Sync + auto-ingest |
| `npm run ingest run` | Run ingestion pipeline |
| `npm run ingest run -- --clean` | Ingest + remove orphans |
| `npm run ingest run -- --dry-run` | Preview without uploading |
| `npm run ingest status` | Show local vs DB sync status |
| `npm run ingest count` | Count chunks in database |
| `npm run ingest clean` | Remove orphaned chunks |

### Checklist

| Step | Action | Command |
|------|--------|---------|
| 1 | Set environment variables | Edit `.env` |
| 2 | Run database schema | Supabase SQL Editor |
| 3 | Sync docs from GitHub | `npm run sync-docs sync` |
| 4 | Add manual docs (optional) | Copy to `./docs/` |
| 5 | Run ingestion | `npm run ingest run` |
| 6 | Verify | `npm run ingest status` |
| 7 | Test the chatbot | Ask questions in the UI |

---

## Troubleshooting

### "No chunks found" after ingestion

- Verify `.env` has correct Supabase credentials
- Check that `./docs` folder contains `.md` or `.txt` files
- Run with `--dry-run` to see what would be processed

### Poor search results

- Add `COHERE_API_KEY` for reranking
- Improve document structure with clear headings
- Ensure chunks have sufficient context (check heading_path)

### "Embedding failed" errors

- Verify `OPENROUTER_API_KEY` is valid
- Check OpenRouter account has credits
- Review rate limiting (100ms delay between batches)

### Deleted files still appearing in results

- Run `npm run ingest run -- --clean` to remove orphaned chunks
- Or run `npm run ingest clean` followed by `npm run ingest run`

### GitHub sync rate limited

- Add `GITHUB_TOKEN` to `.env` (5,000 requests/hour vs 60 unauthenticated)
- Create token at https://github.com/settings/tokens (no scopes needed)

### Sync not detecting changes

- Check `.sync-manifest.json` exists in `./docs/`
- Run with `--force` to re-download all files
- Verify `GITHUB_TOKEN` is set correctly

---

## Technical Decisions

### Why 800-token chunks?

- **Balance**: Large enough for context, small enough for precision
- **Overlap**: 100-token overlap preserves context across boundaries
- **Embedding quality**: Fits well within embedding model limits

### Why HNSW index?

- **Speed**: Sub-millisecond query times even with millions of vectors
- **Accuracy**: Minimal recall loss compared to exact search
- **Scalability**: Handles growing knowledge bases efficiently

### Why two-stage retrieval?

- **Recall**: Vector search casts a wide net (15 candidates)
- **Precision**: Reranking focuses on the most relevant (5 results)
- **Quality**: Cohere reranking provides semantic understanding beyond vector similarity

### Why support .txt files?

- **Transcriptions**: Video/audio transcriptions naturally come as plain text
- **Flexibility**: Not all content needs markdown formatting
- **Simplicity**: No conversion needed for raw text content

---

_Updated: 2026-01-25 18:45_
