---
type: doc
title: "Update News Skill — Obsolescence Management"
description: "The /update-news skill that finds and annotates outdated information in community docs, Discord scrapes, and transcripts"
status: done
ai_generated: true
created: 2026-03-19
updated: 2026-03-19
related_docs:
  - "rag-knowledge-base-workflow.md"
related_tasks: []
---

# Update News Skill — Obsolescence Management

> **AI-Generated**: May contain errors. Verify before use.

## Overview

The `/update-news` skill finds and manages obsolete information across non-official documentation when facts change. It searches community docs, Discord announcements, and livestream transcripts for outdated claims, then applies one of three actions: annotate with an OUTDATED blockquote, update the content directly, or delete the file entirely.

The skill requires zero database schema changes. It works by embedding notes directly in the markdown content, which the existing chunker preserves and the LLM interprets at query time.

## Architecture

- **Skill definition**: `.claude/skills/update-news/SKILL.md`
- **Scope**: `docs/custom/`, `docs/discord/`, `docs/transcriptions/`
- **Never touches**: `docs/quilibrium-official/` (managed by `/sync-docs`)

### How Annotations Flow Through the Pipeline

```
Markdown file with OUTDATED note
        │
        ▼
Loader (strips frontmatter, preserves blockquote content)
        │
        ▼
Chunker (OUTDATED note included in chunk text)
        │
        ▼
Embedder → Supabase (chunk contains the caveat)
        │
        ▼
Retriever → Prompt Builder (LLM sees the caveat inline)
        │
        ▼
LLM naturally caveats its answer
```

The system prompt already instructs the LLM to handle conflicting/outdated information via the "Planned vs. Live Features" and "Recency tiebreaker" rules in [prompt.ts](src/lib/rag/prompt.ts#L174-L180).

## Usage Examples

```
/update-news
> "The Quorum beta was supposed to launch in February but it's been pushed to April"

/update-news
> "v2.1.0.21 is out, mark mentions of v2.1.0.20 as 'latest' as outdated"

/update-news
> "QPing has been renamed to QHeartbeat"
```

## Annotation Format

### Document-level

```markdown
---
title: "Original Title"
date: 2026-02-01
type: livestream_transcript
---

> **OUTDATED (2026-03-19):** The QNS update mentioned below shipped on Feb 3, 2026. See the Feb 3 Discord announcement for current details.

# Original Content Below...
```

### Section-level

```markdown
## Some Section That Changed

> **OUTDATED (2026-03-19):** Pricing has since been announced at 10 QUIL per name. See QNS docs on docs.quilibrium.com.

Original content that is now outdated...
```

## Three Action Modes

| Action | When to Use | Effect |
|--------|-------------|--------|
| **Annotate** | Default. Content was true at the time but is now outdated. | Inserts `> **OUTDATED (date):**` blockquote. Preserves original content. |
| **Update** | Authoritative new information available. Community FAQ/guide should reflect current state. | Replaces outdated text. Updates frontmatter `date` to today. |
| **Delete** | Content is completely wrong, a duplicate, or missed by rolling cleanup. | Removes file. Requires `yarn ingest:clean` to remove orphaned chunks. |

## Technical Decisions

### Why inline blockquotes instead of a database `status` field?

- **Zero schema changes** — no migration needed, no RPC function updates
- **Self-contained** — the caveat travels with the content through chunking, embedding, and retrieval
- **LLM-native** — the model naturally understands "OUTDATED" caveats without special filtering logic
- **Preserves history** — the original content remains for context; the note explains what changed and when
- **Grep-friendly** — `grep -r "OUTDATED" docs/` instantly shows all obsolete content

### Why preserve original content instead of deleting?

Livestream transcripts and Discord announcements are historical records. What was said at the time was true; the note explains what changed since. This gives the LLM the full picture to answer questions like "what was the original plan?" alongside "what's the current status?"

## Known Limitations

- **Re-ingestion required** — after annotating, the RAG database must be updated via `yarn ingest:run` for the bot to see the changes
- **No automatic detection** — the skill is manually triggered; it does not watch for news changes autonomously
- **Chunk boundary risk** — if an OUTDATED note is placed before a section and the chunker splits them apart, the caveat may end up in a different chunk than the content it annotates. Mitigated by placing notes immediately before the affected text.

## Related Documentation

- [RAG Knowledge Base Workflow](rag-knowledge-base-workflow.md) — full ingestion pipeline documentation
- [System Prompt & Anti-Hallucination Strategy](system-prompt-anti-hallucination.md) — how the LLM handles conflicting information

---

_Updated: 2026-03-19_
