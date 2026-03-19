---
name: rag-test
description: Test and debug the RAG retrieval pipeline against the live Supabase database. Use when debugging retrieval issues, verifying temporal/livestream query handling, checking what chunks the bot would return for a query, or auditing Discord vs web UI code path consistency. Trigger on phrases like "test the RAG", "what would the bot return for", "debug retrieval", "check if the bot gets the right livestream", "test a query", "rag-test", or any investigation of why the chatbot returned wrong sources.
user-invocable: true
---

# RAG Pipeline Testing & Debugging

This skill lets you test the Quily chatbot's RAG retrieval pipeline against the live Supabase database without manually asking questions on Discord or the web UI.

## When to use

- After changing retriever logic (`src/lib/rag/retriever.ts`) and wanting to verify behavior
- When a user reports the bot returned wrong/outdated sources
- To check what chunks would be reserved for temporal queries (e.g., "last livestream")
- To audit whether Discord bot and web UI code paths are in sync
- After ingesting new documents, to verify they appear correctly in the database

## Architecture context

Both the Discord bot and web UI share the same retrieval pipeline:
- **Shared code:** `src/lib/rag/retriever.ts`, `src/lib/rag/prompt.ts`, `src/lib/rag/service.ts`
- **Discord entry:** `bot/src/handlers/mention.ts` → calls `processQuery()` from `src/lib/rag/service`
- **Web UI entry:** `app/api/chat/route.ts` → calls `prepareQuery()` from `src/lib/rag/service`

The key difference: Discord uses `processQuery()` (retrieval + LLM generation), web UI uses `prepareQuery()` (retrieval only) then streams via `streamText()`. Both funnel through `retrieveWithReranking()`.

## How to run tests

All tests run via SSH to the VPS where the bot has access to the Supabase database and environment variables.

### 1. Simulate a query — full retrieval check

This is the primary test. It simulates what `fetchRecentChunks` returns for a given query, including temporal and livestream detection.

```bash
ssh quily-vps 'cd /home/quily/quily-chatbot/bot && node -e "
const { createClient } = require(\"@supabase/supabase-js\");
require(\"dotenv\").config();
const c = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const TEMPORAL_KEYWORDS = [\"last\", \"latest\", \"recent\", \"newest\", \"most recent\", \"previous\"];
const LIVESTREAM_KEYWORDS = [\"livestream\", \"live stream\", \"stream\", \"broadcast\", \"ama\", \"town hall\", \"townhall\"];

const query = \"YOUR_QUERY_HERE\";
const lq = query.toLowerCase();
const isTemporal = TEMPORAL_KEYWORDS.some(kw => lq.includes(kw));
const isLivestream = LIVESTREAM_KEYWORDS.some(kw => lq.includes(kw));
const docTypeFilter = isLivestream ? \"livestream_transcript\" : null;

(async () => {
  console.log(\"Query:\", query);
  console.log(\"isTemporalQuery:\", isTemporal);
  console.log(\"isLivestreamQuery:\", isLivestream);
  console.log(\"docTypeFilter:\", docTypeFilter || \"none (all doc types)\");
  console.log(\"\");

  // Simulate fetchRecentChunks
  let qb = c.from(\"document_chunks_chutes\")
    .select(\"id, content, source_file, heading_path, source_url, published_date, title, doc_type\")
    .not(\"published_date\", \"is\", null);
  if (docTypeFilter) qb = qb.eq(\"doc_type\", docTypeFilter);
  const { data, error } = await qb.order(\"published_date\", { ascending: false }).limit(15);
  if (error) { console.error(\"DB error:\", error); return; }

  const seen = new Set();
  const unique = data.filter(r => { if (seen.has(r.source_file)) return false; seen.add(r.source_file); return true; }).slice(0, 3);

  if (isTemporal) {
    console.log(\"=== RESERVED TEMPORAL CHUNKS (bypass reranker) ===\");
    unique.forEach((r, i) => {
      console.log(\"\nSlot \" + (i+1) + \":\");
      console.log(\"  Date:   \", r.published_date);
      console.log(\"  Title:  \", r.title);
      console.log(\"  File:   \", r.source_file);
      console.log(\"  Type:   \", r.doc_type);
      console.log(\"  URL:    \", r.source_url || \"(none)\");
      console.log(\"  Preview:\", r.content.slice(0, 120) + \"...\");
    });
  } else {
    console.log(\"(Not a temporal query — no reserved chunks)\");
  }
})();
" 2>&1'
```

Replace `YOUR_QUERY_HERE` with the actual query to test.

### 2. List all documents by date (check what's in the DB)

Useful after ingestion to verify documents are present with correct metadata.

```bash
ssh quily-vps 'cd /home/quily/quily-chatbot/bot && node -e "
const { createClient } = require(\"@supabase/supabase-js\");
require(\"dotenv\").config();
const c = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const { data, error } = await c
    .from(\"document_chunks_chutes\")
    .select(\"source_file, published_date, title, doc_type\")
    .not(\"published_date\", \"is\", null)
    .order(\"published_date\", { ascending: false })
    .limit(200);
  if (error) { console.error(error); return; }
  const seen = new Set();
  const unique = data.filter(r => { if (seen.has(r.source_file)) return false; seen.add(r.source_file); return true; });
  console.log(\"All docs with dates (\" + unique.length + \" unique files):\");
  console.log(\"\");
  unique.forEach(r => {
    const type = (r.doc_type || \"unknown\").padEnd(25);
    console.log(r.published_date + \" | \" + type + \" | \" + r.source_file);
  });
})();
" 2>&1'
```

### 3. List livestreams specifically

```bash
ssh quily-vps 'cd /home/quily/quily-chatbot/bot && node -e "
const { createClient } = require(\"@supabase/supabase-js\");
require(\"dotenv\").config();
const c = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const { data, error } = await c
    .from(\"document_chunks_chutes\")
    .select(\"source_file, published_date, title, doc_type\")
    .eq(\"doc_type\", \"livestream_transcript\")
    .not(\"published_date\", \"is\", null)
    .order(\"published_date\", { ascending: false })
    .limit(100);
  if (error) { console.error(error); return; }
  const seen = new Set();
  const unique = data.filter(r => { if (seen.has(r.source_file)) return false; seen.add(r.source_file); return true; });
  console.log(\"Livestream transcripts (\" + unique.length + \" total, newest first):\");
  console.log(\"\");
  unique.forEach(r => console.log(r.published_date + \" | \" + (r.title || r.source_file)));
})();
" 2>&1'
```

### 4. Keyword detection check (batch test)

Test multiple query variants to verify temporal and livestream detection works correctly.

```bash
ssh quily-vps 'cd /home/quily/quily-chatbot/bot && node -e "
const TEMPORAL_KEYWORDS = [\"last\", \"latest\", \"recent\", \"newest\", \"most recent\", \"previous\"];
const LIVESTREAM_KEYWORDS = [\"livestream\", \"live stream\", \"stream\", \"broadcast\", \"ama\", \"town hall\", \"townhall\"];

const queries = [
  \"What was said in the last live stream?\",
  \"Recap the last livestream\",
  \"What was the most recent stream about?\",
  \"latest broadcast\",
  \"Recap the last AMA\",
  \"What happened recently?\",
  \"Tell me about Q Storage\",
  \"What is the latest news?\",
  \"Summarize the previous town hall\",
];

console.log(\"Query\".padEnd(50) + \"Temporal  Livestream  Filter\");
console.log(\"─\".repeat(95));
queries.forEach(q => {
  const lq = q.toLowerCase();
  const t = TEMPORAL_KEYWORDS.some(kw => lq.includes(kw));
  const l = LIVESTREAM_KEYWORDS.some(kw => lq.includes(kw));
  const filter = (t && l) ? \"livestream_transcript\" : (t ? \"none (all types)\" : \"n/a (not temporal)\");
  console.log(q.padEnd(50) + String(t).padEnd(9) + String(l).padEnd(12) + filter);
});
" 2>&1'
```

### 5. Discord vs Web UI drift check

Compare the configuration options passed by each entry point to `processQuery`/`prepareQuery`. Run this from the local repo (no SSH needed).

The key things to compare:
- **Embedding provider:** Discord uses `embeddingProvider: 'openrouter'` hardcoded. Web UI derives it from the user's provider setting.
- **LLM provider:** Discord reads `BOT_LLM_PROVIDER` env var. Web UI uses the client's chosen provider.
- **Reranker:** Both pass `cohereApiKey` from env. Web UI additionally has Cloudflare fallback configured in the shared retriever.
- **Models:** Discord uses `BOT_MODEL` env var with fallback chain. Web UI uses client-specified model.

To check for drift, read both files and compare the options passed:

```
Local files to compare:
  - bot/src/handlers/mention.ts    (Discord — look at the processQuery call ~line 72)
  - app/api/chat/route.ts          (Web UI — look at the prepareQuery call ~line 651)
  - src/lib/rag/service.ts         (shared — processQuery wraps prepareQuery)
```

The most common drift: one path gets a new option (like a new reranker key or embedding model) and the other doesn't. Check that both paths pass the same set of retrieval options.

## Database reference

**Table:** `document_chunks_chutes`

| Column | Type | Description |
|--------|------|-------------|
| id | int | Chunk primary key |
| content | text | Chunk text content |
| source_file | text | Relative path from docs/ |
| heading_path | text | Markdown heading hierarchy |
| source_url | text | YouTube URL or external link |
| published_date | date | From frontmatter (YYYY-MM-DD) |
| title | text | Document title from frontmatter |
| doc_type | text | e.g., `livestream_transcript`, `comparison`, `community_faq` |
| embedding | vector(1024) | BGE-M3 embedding |

**Indexed:** `published_date DESC NULLS LAST`

## Retriever logic summary

When `isTemporalQuery(query)` is true:
1. `fetchRecentChunks(3, docType?)` queries the DB for most recent docs
2. If `isLivestreamQuery(query)` → filters by `doc_type = 'livestream_transcript'`
3. Results are deduped by `source_file`, limited to 3 unique docs
4. These become **reserved temporal chunks** — they bypass the reranker entirely
5. The reranker operates on the remaining candidates with reduced `topN`
6. Reserved chunks are prepended to final results so they appear first in LLM context
