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

The Quilibrium Assistant uses a Retrieval Augmented Generation (RAG) system to provide accurate, context-aware responses based on your documentation. This system ingests Markdown files, converts them into vector embeddings, stores them in Supabase with pgvector, and retrieves relevant context when users ask questions.

## Architecture

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Document Loader | `scripts/ingest/loader.ts` | Reads markdown files from `./docs` |
| Semantic Chunker | `scripts/ingest/chunker.ts` | Splits documents into 800-token chunks |
| Embedder | `scripts/ingest/embedder.ts` | Generates 1536-dim vectors via OpenRouter |
| Uploader | `scripts/ingest/uploader.ts` | Batch inserts to Supabase pgvector |
| CLI Orchestrator | `scripts/ingest/index.ts` | Coordinates the ingestion pipeline |
| Retriever | `src/lib/rag/retriever.ts` | Two-stage retrieval with optional reranking |
| Prompt Builder | `src/lib/rag/prompt.ts` | Formats context and builds system prompts |
| Chat API | `app/api/chat/route.ts` | Handles user queries with RAG pipeline |

### Data Flow Diagram

```
┌─────────────────┐
│   Markdown      │
│   Files (./docs)│
└────────┬────────┘
         │
         ├─→ Loader (reads files, parses frontmatter)
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

Place all Markdown files in the `./docs` directory:

```
docs/
├── getting-started.md
├── guides/
│   ├── installation.md
│   └── configuration.md
├── concepts/
│   ├── consensus.md
│   └── tokenomics.md
└── faq.md
```

### Document Format

Documents support optional YAML frontmatter:

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

Create or update `.env.local` with the following variables:

```env
# Supabase Configuration (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenRouter API Key (required for ingestion and runtime)
OPENROUTER_API_KEY=your_openrouter_key

# Cohere API Key (optional but recommended for better search)
COHERE_API_KEY=your_cohere_key
```

### Where to Get Keys

| Key | Source |
|-----|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → Service Role Key |
| `OPENROUTER_API_KEY` | [OpenRouter](https://openrouter.ai/keys) |
| `COHERE_API_KEY` | [Cohere Dashboard](https://dashboard.cohere.com/api-keys) |

---

## Step 4: Run the Ingestion Pipeline

### Basic Usage

```bash
npm run ingest run
```

### With Options

```bash
# Specify docs directory and version tag
npm run ingest run -d ./docs -v "v1.0"

# Dry run (test without uploading)
npm run ingest run --dry-run

# Full example
npm run ingest run -d ./docs -v "2026-01-25" --dry-run
```

### What Happens During Ingestion

1. **Loading**: Reads all `.md` files from `./docs` recursively
2. **Chunking**: Splits into ~800-token chunks with 100-token overlap
3. **Embedding**: Generates 1536-dimensional vectors using `text-embedding-3-small`
4. **Uploading**: Upserts chunks to Supabase (updates on re-ingestion)

### Expected Output

```
✓ Loaded 12 documents
✓ Created 47 chunks (38,400 tokens total)
✓ Generated 47 embeddings
✓ Uploaded 47 chunks to database
```

---

## Step 5: Verify Ingestion

### Check Chunk Count

```bash
npm run ingest count
```

This queries the database and reports how many chunks are stored.

### Manual Verification in Supabase

1. Go to Supabase Dashboard → Table Editor
2. Select `document_chunks` table
3. Verify entries exist with:
   - `content`: Chunk text
   - `source_file`: Original file path (e.g., "docs/getting-started.md")
   - `heading_path`: Heading hierarchy (e.g., "Getting Started > Prerequisites")
   - `embedding`: Vector data (shown as array)

---

## Step 6: How RAG Works at Runtime

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

## Quick Reference Checklist

| Step | Action | Command/Location |
|------|--------|------------------|
| 1 | Add markdown files | `./docs/` folder |
| 2 | Run database schema | Supabase SQL Editor |
| 3 | Set environment variables | `.env.local` |
| 4 | Run ingestion | `npm run ingest run` |
| 5 | Verify chunk count | `npm run ingest count` |
| 6 | Test the chatbot | Ask questions in the UI |

---

## Troubleshooting

### "No chunks found" after ingestion

- Verify `.env.local` has correct Supabase credentials
- Check that `./docs` folder contains `.md` files
- Run with `--dry-run` to see what would be processed

### Poor search results

- Add `COHERE_API_KEY` for reranking
- Improve document structure with clear headings
- Ensure chunks have sufficient context (check heading_path)

### "Embedding failed" errors

- Verify `OPENROUTER_API_KEY` is valid
- Check OpenRouter account has credits
- Review rate limiting (100ms delay between batches)

### Chunks not updating on re-ingestion

- The uploader uses upsert on `(source_file, chunk_index)`
- If document structure changes significantly, consider clearing old chunks first

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

---

_Updated: 2026-01-25_
