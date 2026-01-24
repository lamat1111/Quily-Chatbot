# Phase 1: Data Pipeline - Research

**Researched:** 2026-01-24
**Domain:** RAG ingestion pipeline (chunking, embeddings, vector storage)
**Confidence:** HIGH

## Summary

This research covers the complete data pipeline for ingesting markdown documentation into a searchable vector database. The pipeline consists of four stages: (1) markdown file loading with metadata extraction, (2) semantic chunking with heading context preservation, (3) embedding generation via text-embedding-3-small, and (4) storage in Supabase pgvector with HNSW indexing.

The recommended approach uses LangChain's `@langchain/textsplitters` package for markdown-aware chunking (RecursiveCharacterTextSplitter with markdown separators), the Vercel AI SDK with OpenRouter provider for embedding generation, and the Supabase JavaScript SDK for vector storage. This stack provides type safety, handles batching automatically, and integrates well with the existing technology decisions.

Key findings: (1) HNSW indexes should use defaults (m=16, ef_construction=64) for the expected ~1000-5000 chunks; (2) chunk sizes of 500-1000 tokens with 100 token overlap align well with retrieval precision; (3) metadata must include source_file, heading_path, chunk_index, and version for proper citation; (4) PostgREST doesn't support pgvector operators directly, requiring an RPC function for similarity search.

**Primary recommendation:** Use RecursiveCharacterTextSplitter.fromLanguage("markdown") for chunking, Vercel AI SDK embedMany() for batch embedding, and Supabase RPC for similarity search.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @langchain/textsplitters | latest | Markdown-aware text chunking | Industry standard, markdown separators built-in |
| ai (Vercel AI SDK) | ^3.0 | Embedding generation | Unified API, batch support, OpenRouter compatible |
| @openrouter/ai-sdk-provider | latest | OpenRouter integration | Official provider, embedding support |
| @supabase/supabase-js | ^2.79+ | Vector storage and retrieval | Official SDK, pgvector RPC support |
| gpt-tokenizer | ^2.4+ | Token counting | Fastest on npm, cl100k_base for text-embedding-3 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| commander | ^12.0 | CLI command parsing | Main CLI structure |
| ora | ^8.0 | Terminal spinners | Progress feedback during long operations |
| chalk | ^5.0 | Terminal colors | Status messages and errors |
| dotenv | ^16.0 | Environment variables | API key management |
| glob | ^10.0 | File pattern matching | Finding markdown files |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @langchain/textsplitters | semantic-chunking npm | Requires local embedding model, slower |
| Vercel AI SDK | Direct OpenRouter fetch | More code, no retry logic |
| gpt-tokenizer | js-tiktoken | Similar performance, gpt-tokenizer more features |

**Installation:**
```bash
npm install @langchain/textsplitters @langchain/core ai @openrouter/ai-sdk-provider @supabase/supabase-js gpt-tokenizer commander ora chalk dotenv glob
```

## Architecture Patterns

### Recommended Project Structure
```
scripts/
├── ingest/
│   ├── index.ts           # CLI entry point
│   ├── loader.ts          # Markdown file loading
│   ├── chunker.ts         # Text splitting with metadata
│   ├── embedder.ts        # Batch embedding generation
│   ├── uploader.ts        # Supabase vector storage
│   └── types.ts           # Shared interfaces
├── db/
│   ├── schema.sql         # pgvector table + function
│   └── migrations/        # Version-controlled schema
└── package.json           # CLI scripts
```

### Pattern 1: Chunk with Heading Context
**What:** Preserve document hierarchy by prepending heading path to chunk content
**When to use:** Always for documentation - enables better retrieval and citation
**Example:**
```typescript
// Source: Verified pattern from RAG best practices research
interface ChunkWithContext {
  content: string;           // The actual chunk text
  metadata: {
    source_file: string;     // e.g., "docs/getting-started.md"
    heading_path: string;    // e.g., "Installation > Prerequisites"
    chunk_index: number;     // Position in document
    token_count: number;     // For cost tracking
    version: string;         // Document version/date
    content_hash: string;    // For deduplication
  };
}

// Prepend heading context for embedding
function formatChunkForEmbedding(chunk: ChunkWithContext): string {
  return `${chunk.metadata.heading_path}\n\n${chunk.content}`;
}
```

### Pattern 2: Batch Embedding with Rate Limiting
**What:** Process embeddings in batches with automatic retry
**When to use:** During ingestion of large document sets
**Example:**
```typescript
// Source: Vercel AI SDK docs + OpenRouter API reference
import { embedMany } from 'ai';
import { openrouter } from '@openrouter/ai-sdk-provider';

async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const BATCH_SIZE = 100; // Stay under 300k token limit
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const { embeddings: batchEmbeddings } = await embedMany({
      model: openrouter.textEmbeddingModel('openai/text-embedding-3-small'),
      values: batch,
    });
    embeddings.push(...batchEmbeddings);
  }

  return embeddings;
}
```

### Pattern 3: Supabase RPC for Similarity Search
**What:** Use PostgreSQL function for vector similarity (PostgREST limitation)
**When to use:** All vector queries - PostgREST doesn't support pgvector operators
**Example:**
```typescript
// Source: Supabase OpenAI Cookbook
const { data, error } = await supabase
  .rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: 5
  });
```

### Anti-Patterns to Avoid
- **Naive fixed-size chunking:** Destroys semantic context; use RecursiveCharacterTextSplitter with markdown separators
- **Embedding one-at-a-time:** Use batch embedding (embedMany) for 10x+ performance improvement
- **Storing embeddings without metadata:** Makes citation and freshness tracking impossible
- **Direct SQL from client:** Use RPC functions for vector queries, not raw SQL

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Token counting | Character-based estimation | gpt-tokenizer | Different tokenizers for different models; cl100k_base needed for text-embedding-3 |
| Markdown chunking | Regex-based splitting | RecursiveCharacterTextSplitter.fromLanguage("markdown") | Handles code blocks, lists, headers correctly |
| Embedding batching | Manual chunking + fetch | Vercel AI SDK embedMany | Handles retries, rate limits, response parsing |
| Vector similarity SQL | Dynamic query building | Supabase RPC function | PostgREST doesn't support `<=>`, `<->`, `<#>` operators |
| Progress spinners | console.log statements | ora | Handles terminal width, clears properly, shows elapsed time |

**Key insight:** The RAG ingestion pipeline has many edge cases (code blocks in markdown, rate limits on embedding APIs, vector operator support). Established libraries handle these; hand-rolled solutions typically fail on edge cases discovered too late.

## Common Pitfalls

### Pitfall 1: Token Count vs Character Count for Chunk Size
**What goes wrong:** Chunking by character count (e.g., 2000 chars) results in inconsistent token counts, exceeding embedding model limits
**Why it happens:** 1 token != 1 character; varies by language and content type
**How to avoid:** Use gpt-tokenizer to count tokens; target 500-1000 tokens per chunk
**Warning signs:** Embedding API errors about context length exceeded

### Pitfall 2: Lost Heading Context in Chunks
**What goes wrong:** Chunks lack context about where they came from in document hierarchy
**Why it happens:** Standard splitters don't track heading hierarchy
**How to avoid:** Parse markdown headings first, track current heading path, include in chunk metadata
**Warning signs:** Retrieved chunks that are contextually ambiguous

### Pitfall 3: Embedding Model Mismatch
**What goes wrong:** Query embeddings from different model than document embeddings
**Why it happens:** Hardcoded model names in different parts of codebase
**How to avoid:** Single config for embedding model name; use same model for ingestion and query
**Warning signs:** Similarity search returns irrelevant results

### Pitfall 4: No Deduplication on Re-ingestion
**What goes wrong:** Duplicate chunks accumulate on each ingestion run
**Why it happens:** No upsert logic or content hashing
**How to avoid:** Use content hash as unique identifier; upsert based on source_file + chunk_index
**Warning signs:** Database size grows unexpectedly; same content appears multiple times in results

### Pitfall 5: PostgREST Vector Operator Limitation
**What goes wrong:** Vector similarity queries fail with syntax errors
**Why it happens:** PostgREST (used by Supabase client) doesn't support pgvector operators
**How to avoid:** Create a PostgreSQL function for similarity search; call via supabase.rpc()
**Warning signs:** Errors like "operator does not exist" when querying

## Code Examples

Verified patterns from official sources:

### Supabase Schema for Document Chunks
```sql
-- Source: Supabase pgvector docs + OpenAI Cookbook
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Document chunks table
CREATE TABLE document_chunks (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL,  -- text-embedding-3-small dimensions
  source_file TEXT NOT NULL,
  heading_path TEXT,
  chunk_index INTEGER NOT NULL,
  token_count INTEGER NOT NULL,
  version TEXT,
  content_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint for upsert
  UNIQUE(source_file, chunk_index)
);

-- HNSW index for cosine similarity (recommended for OpenAI embeddings)
CREATE INDEX document_chunks_embedding_idx
  ON document_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Index for filtering by source
CREATE INDEX document_chunks_source_idx ON document_chunks(source_file);
```

### Similarity Search Function
```sql
-- Source: Supabase OpenAI Cookbook
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  source_file TEXT,
  heading_path TEXT,
  similarity FLOAT
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

### Markdown Chunking with LangChain
```typescript
// Source: LangChain.js textsplitters documentation
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { encode } from 'gpt-tokenizer';

// Token-based length function for accurate chunking
function tokenLength(text: string): number {
  return encode(text).length;
}

const splitter = RecursiveCharacterTextSplitter.fromLanguage('markdown', {
  chunkSize: 800,           // Target 500-1000 tokens
  chunkOverlap: 100,        // ~10-20% overlap
  lengthFunction: tokenLength,
});

const chunks = await splitter.splitText(markdownContent);
```

### Batch Embedding with Vercel AI SDK
```typescript
// Source: Vercel AI SDK docs + OpenRouter provider
import { embedMany } from 'ai';
import { openrouter } from '@openrouter/ai-sdk-provider';

const { embeddings, usage } = await embedMany({
  model: openrouter.textEmbeddingModel('openai/text-embedding-3-small'),
  values: chunkTexts,
  maxRetries: 3,
});

console.log(`Tokens used: ${usage.tokens}`);
```

### Supabase Upsert Pattern
```typescript
// Source: Supabase JS SDK documentation
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Batch upsert with conflict handling
const { error } = await supabase
  .from('document_chunks')
  .upsert(
    chunks.map((chunk, i) => ({
      content: chunk.content,
      embedding: chunk.embedding,
      source_file: chunk.metadata.source_file,
      heading_path: chunk.metadata.heading_path,
      chunk_index: i,
      token_count: chunk.metadata.token_count,
      version: chunk.metadata.version,
      content_hash: chunk.metadata.content_hash,
    })),
    { onConflict: 'source_file,chunk_index' }
  );
```

### CLI Structure with Commander
```typescript
// Source: Commander.js documentation
import { Command } from 'commander';
import ora from 'ora';

const program = new Command();

program
  .name('ingest')
  .description('Ingest markdown documentation into vector database')
  .version('1.0.0');

program
  .command('run')
  .description('Run full ingestion pipeline')
  .option('-d, --docs <path>', 'Path to documentation directory', './docs')
  .option('-v, --version <tag>', 'Version tag for chunks', 'latest')
  .option('--dry-run', 'Preview without uploading', false)
  .action(async (options) => {
    const spinner = ora('Loading documents...').start();
    try {
      // ... pipeline logic
      spinner.succeed('Ingestion complete');
    } catch (err) {
      spinner.fail('Ingestion failed');
      console.error(err);
      process.exit(1);
    }
  });

program.parse();
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| text-embedding-ada-002 (1536d) | text-embedding-3-small (1536d) | Jan 2024 | Better performance, same dimensions, lower cost |
| IVFFlat indexes | HNSW indexes | pgvector 0.5.0 | Better recall, no retraining needed, faster queries |
| Character-based chunking | Token-based chunking | 2024 | Accurate chunk sizes, no truncation |
| LangChain full framework | @langchain/textsplitters only | 2024 | Lighter weight, same chunking quality |

**Deprecated/outdated:**
- `text-embedding-ada-002`: Replaced by text-embedding-3-small (better, cheaper)
- `langchain` monolithic package: Use `@langchain/textsplitters` for just splitting
- IVFFlat indexes: HNSW recommended for all new deployments
- Node.js 18: Dropped in Supabase SDK 2.79.0 (EOL April 2025)

## Open Questions

Things that couldn't be fully resolved:

1. **OpenRouter Batch API Support**
   - What we know: OpenRouter supports embeddings via unified API
   - What's unclear: Whether they have a dedicated batch API like OpenAI's 50% discount tier
   - Recommendation: Use standard API with in-memory batching; investigate batch API later for cost optimization

2. **Optimal HNSW Parameters for ~5000 Chunks**
   - What we know: Defaults (m=16, ef_construction=64) work well for most cases
   - What's unclear: Whether tuning helps for small datasets
   - Recommendation: Use defaults; tune ef_search at query time if recall is low

3. **Heading Extraction from Docusaurus Markdown**
   - What we know: Standard markdown heading syntax applies
   - What's unclear: Whether Docusaurus frontmatter needs special handling
   - Recommendation: Parse frontmatter separately; use standard heading regex for body

## Sources

### Primary (HIGH confidence)
- [Supabase pgvector docs](https://supabase.com/docs/guides/database/extensions/pgvector) - Schema, extension setup
- [Supabase HNSW indexes](https://supabase.com/docs/guides/ai/vector-indexes/hnsw-indexes) - Index creation syntax
- [pgvector GitHub](https://github.com/pgvector/pgvector) - v0.8.1, parameters, dimension limits
- [Vercel AI SDK Embeddings](https://ai-sdk.dev/docs/ai-sdk-core/embeddings) - embed/embedMany API
- [OpenRouter Embeddings API](https://openrouter.ai/docs/api/reference/embeddings) - Endpoint, authentication
- [Supabase OpenAI Cookbook](https://cookbook.openai.com/examples/vector_databases/supabase/semantic-search) - Complete schema + RPC pattern

### Secondary (MEDIUM confidence)
- [LangChain.js RecursiveCharacterTextSplitter](https://v03.api.js.langchain.com/classes/langchain.text_splitter.RecursiveCharacterTextSplitter.html) - API, fromLanguage method
- [Commander.js](https://github.com/tj/commander.js) - CLI structure
- [ora](https://github.com/sindresorhus/ora) - Spinner API
- WebSearch results for RAG chunking best practices (multiple sources agree on 500-1000 tokens, 10-20% overlap)

### Tertiary (LOW confidence)
- Specific optimal chunk sizes for documentation (varies by use case; requires experimentation)
- OpenRouter rate limits (not documented in detail; use conservative batching)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified with official documentation
- Architecture: HIGH - Patterns from official cookbooks and docs
- Pitfalls: MEDIUM - Compiled from multiple sources, some based on community experience

**Research date:** 2026-01-24
**Valid until:** 2026-02-24 (30 days - libraries are stable)
