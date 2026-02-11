---
name: doc-gap-analysis
description: Analyze official Quilibrium docs for RAG chunking weaknesses and recommend custom companion docs to fill gaps
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
---

<objective>
Scan official documentation in `docs/quilibrium-official/` for chunking quality issues that degrade RAG retrieval. Cross-reference against existing custom docs in `docs/custom/` and the persistent audit log. Produce a prioritized gap report with actionable recommendations for new companion documents. Optionally draft a companion doc for a selected gap.
</objective>

<context>

## Chunking System Reference

The ingestion pipeline (`scripts/ingest/chunker.ts`) uses:
- **Splitter**: LangChain `RecursiveCharacterTextSplitter` (markdown-aware)
- **Chunk size**: 800 tokens
- **Overlap**: 100 tokens (~12%)
- **Tokenizer**: `gpt-tokenizer` (cl100k_base) — approximate as ~4 chars/token when analyzing
- **Heading hierarchy**: `buildHeadingMap()` produces `H1 > H2 > H3` paths stored as `heading_path` metadata
- **Metadata fields**: source_file, heading_path, chunk_index, token_count, content_hash, title, doc_type, published_date

Files without headings produce chunks with empty `heading_path`. Files without frontmatter `title` get `undefined` in metadata, degrading retrieval.

## Known Entities (from retriever)

The RAG retriever uses query decomposition for these 9 entities:

| Entity | Type | Doc Category |
|--------|------|-------------|
| QStorage | S3-compatible storage | `api/03-q-storage/` |
| QKMS | MPC key management | `api/04-q-kms/` |
| QNS | Name service | No dedicated folder |
| Quorum | P2P messenger | No dedicated folder |
| Hypersnap | Snapchain | No official docs |
| Quark | 3D game library | No official docs |
| QPing | Dispatch/notification | No official docs |
| Bridge | Cross-chain QUIL/wQUIL | No official docs |
| QQ | Message queue | No official docs |

Plus a **General/Protocol** category for cross-cutting topics (consensus, architecture, etc.).

## Official Doc Categories

| Category | Path | Approx Files | Content Type |
|----------|------|-------------|--------------|
| API | `api/` | ~178 | QStorage + QKMS reference |
| Build | `build/` | ~5 | Developer guides |
| Discover | `discover/` | ~14 | Intro/explainer content |
| Learn | `learn/` | ~19 | Deep technical concepts |
| Protocol | `protocol/` | ~3 | Protocol specifications |
| Run Node | `run-node/` | ~40 | Node operation guides |

## Known Systemic Issues

Many official docs are **Docusaurus React component stubs** — files that contain only:
```markdown
import Component from '@site/src/docs/...';
<Component />
```
These produce near-empty chunks since the actual content lives in React components not available to the markdown chunker.

Also watch for Docusaurus-specific syntax that doesn't render in plain markdown: `:::info`, `<Tabs>`, `<TabItem>`, `export const`.

## Audit Log

This skill maintains a persistent audit log at `.claude/skills/doc-gap-analysis/gap-audit-log.json`. The log tracks:
- Which categories/files have been analyzed and when
- Which gaps were identified and their severity
- Which custom companion docs were created as a result
- Files that were reviewed and deemed adequate (no custom doc needed)

**Always check the audit log first** before re-analyzing files. Skip files that have been analyzed and either:
- Had a custom doc created for them (status: `"covered"`)
- Were reviewed and deemed adequate (status: `"adequate"`)

Re-analyze files only if:
- The official doc has been modified since the last analysis (check file modification date vs audit date)
- The user explicitly requests a re-scan
- The file was previously flagged as a gap but no action was taken yet (status: `"gap_identified"`)

</context>

<scoring_system>

## Scoring Dimensions

Each file is scored on 6 dimensions (0-10), with weights:

| Dimension | Weight | What It Measures | Scoring |
|-----------|--------|------------------|---------|
| **Content Substance** | 3x | Actual markdown content present? | 0 = React stub/empty; 2 = <100 tokens; 5 = 100-300 tokens; 8 = 300-800 tokens; 10 = >800 tokens, well-structured |
| **Heading Structure** | 2x | Quality of heading hierarchy | 0 = no headings; 3 = single H1 only; 5 = H1+H2 but uneven; 8 = good H1>H2>H3; 10 = well-spaced hierarchy |
| **Section Size** | 2x | Are sections chunker-friendly? | 0 = one giant section; 3 = sections >1600 tokens; 5 = mixed; 8 = mostly 200-800 tokens; 10 = all in sweet spot |
| **Table Risk** | 1x | Tables that would split mid-row | 10 = no tables or small tables; 5 = tables <15 rows; 0 = large tables that will split |
| **Frontmatter** | 1x | Metadata for retrieval | 0 = none; 3 = sidebar_position only; 5 = title present; 8 = title+description; 10 = full frontmatter |
| **Standalone Context** | 1x | File understandable alone? | 0 = depends on React/broken links; 3 = needs parent context; 5 = somewhat standalone; 8 = good; 10 = fully self-contained |

**Composite Score** = weighted sum / (max weighted sum) as a letter grade:
- **A** (80-100%): Good for RAG, no action needed
- **B** (60-79%): Acceptable, minor issues
- **C** (40-59%): Degraded retrieval quality, consider companion doc
- **D** (20-39%): Poor chunking, companion doc recommended
- **F** (0-19%): Essentially broken for RAG, companion doc needed

**Token counting heuristic**: Use `content.length / 4` as an approximation of token count.

</scoring_system>

<process>

## Step 1: Display Banner

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 DOC GAP ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Analyzing documentation for RAG chunking quality...
```

## Step 2: Load Audit Log

Read `.claude/skills/doc-gap-analysis/gap-audit-log.json`. If it doesn't exist, initialize an empty log structure:

```json
{
  "last_full_scan": null,
  "files": {},
  "custom_docs_created": [],
  "categories_scanned": {}
}
```

Where `files` is keyed by relative path:
```json
{
  "files": {
    "learn/01-block-storage/vdf.md": {
      "status": "gap_identified",
      "last_analyzed": "2026-02-11",
      "score": "F",
      "composite_pct": 4,
      "issues": ["react_stub", "no_content"],
      "notes": "Docusaurus component stub — zero markdown content",
      "custom_doc": null
    },
    "discover/01-what-is-quilibrium.md": {
      "status": "adequate",
      "last_analyzed": "2026-02-11",
      "score": "B",
      "composite_pct": 72,
      "issues": [],
      "notes": "Well-structured intro doc, good heading hierarchy",
      "custom_doc": null
    },
    "learn/03-oblivious-hypergraph/rdf-storage.md": {
      "status": "covered",
      "last_analyzed": "2026-02-11",
      "score": "F",
      "composite_pct": 2,
      "issues": ["react_stub"],
      "notes": "Stub file, but topic covered by custom doc",
      "custom_doc": "docs/custom/RDF-Hypergraph-Query-System.md"
    }
  }
}
```

Display how many files are in the log and how many are new/unscanned.

## Step 3: Ask User for Scope

Use `AskUserQuestion`:

- **"Full analysis"** — Scan all files across all categories (skips already-audited files unless re-scan requested)
- **"By category"** — Pick a specific category (api/, discover/, learn/, run-node/, build/, protocol/)
- **"New files only"** — Only analyze files not yet in the audit log
- **"Re-scan everything"** — Ignore audit log, fresh analysis of all files

## Step 4: Scan and Score

For each file in scope (that isn't already in the audit log with status `adequate` or `covered`, unless re-scanning):

1. **Read the file content**
2. **Check for React component stubs**: Look for `import ... from '@site/'` — if content minus imports/JSX is <50 chars, mark as stub (Content Substance = 0)
3. **Check for Docusaurus syntax**: `:::info`, `:::warning`, `<Tabs>`, `<TabItem>`, `export const` — flag as "partial content loss in RAG"
4. **Estimate token count**: `content.length / 4`
5. **Analyze heading structure**: Count headings by level using `^#{1,6}\s+` regex
6. **Measure section sizes**: Estimate tokens between consecutive headings
7. **Detect tables**: Lines matching `|...|...|` patterns, estimate row counts
8. **Check frontmatter**: Presence and completeness of title, description, date, type
9. **Assess standalone context**: References to parent docs, broken links, external components
10. **Compute composite score** per the scoring system above

**Performance optimization**: Process files in batches. Read 5-10 files at a time using parallel Read calls. For `api/` categories (which are very large), sample representatively:
- Read ALL `overview.md` files
- Read ALL files in `user-manual/` directories
- Sample 5-10 files from `api-reference/` directories (they tend to be structurally uniform)
- Note the sampling in the report

**Update the audit log** after scoring each batch.

## Step 5: Cross-Reference Against Custom Docs

Read all files in `docs/custom/` and build a topic coverage map:
- Extract title and topics from each custom doc's frontmatter
- Map topics to the known entities list
- Identify which entity/topic areas have custom doc coverage and which don't
- Also check the audit log's `custom_docs_created` list

## Step 6: Group Findings by Topic Area

Organize scored files into groups matching the known entities + categories:

1. **QStorage** — `api/03-q-storage/`
2. **QKMS** — `api/04-q-kms/`
3. **QNS** — No dedicated folder (gap indicator)
4. **Quorum** — No dedicated folder
5. **Hypersnap** — No official docs
6. **Quark, QPing, Bridge, QQ** — No official docs
7. **Protocol & Consensus** — `protocol/`
8. **Node Operations** — `run-node/`
9. **Developer/Build** — `build/`
10. **Learn/Concepts** — `learn/`
11. **Discover/Overview** — `discover/`

For each group compute:
- Average score
- Number of stub files
- Number of files below C grade
- Whether a custom doc already covers this area
- **Gap Severity**: `HIGH` = low avg score + no custom doc | `MEDIUM` = low avg score + partial coverage | `LOW` = decent scores or already covered

## Step 7: Generate Report

Display an inline summary and write a full report to `.agents/reports/doc-gap-analysis_YYYY-MM-DD.md`.

### Inline Summary Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GAP ANALYSIS RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Scanned: X files | Stubs: Y | Below C: Z | Skipped (already audited): W

## Top Gaps (Ranked by Impact)

| # | Topic Area      | Severity | Avg Score | Stubs | Custom Doc? | Action               |
|---|----------------|----------|-----------|-------|-------------|-----------------------|
| 1 | Learn/Concepts | HIGH     | F (4%)    | 18/19 | Partial     | Needs companion docs  |
| 2 | ...            | ...      | ...       | ...   | ...         | ...                   |

## Entity Coverage

| Entity    | Official Docs | Custom Doc       | Gap Status        |
|-----------|--------------|------------------|--------------------|
| QStorage  | 105 files    | None             | API ref OK, needs overview |
| QKMS      | 72 files     | None             | API ref OK, needs overview |
| QNS       | 0 files      | None             | MISSING            |
| Quorum    | 0 files      | 1 doc            | Partial            |
| Hypersnap | 0 files      | 1 doc            | Covered            |
| ...       | ...          | ...              | ...                |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Full Report File

Write to `.agents/reports/doc-gap-analysis_YYYY-MM-DD.md` with frontmatter:

```yaml
---
type: report
title: "Documentation Gap Analysis for RAG Quality"
ai_generated: true
reviewed_by: null
created: YYYY-MM-DD
updated: YYYY-MM-DDTHH:MM:SS
related_tasks: []
related_docs: []
---
```

Include: executive summary, methodology, per-category findings, per-entity coverage, prioritized gap list with specific recommendations, and recommended custom doc outlines for top 3 gaps.

## Step 8: Save Audit Log

Write the updated audit log to `.claude/skills/doc-gap-analysis/gap-audit-log.json` with all scoring results, statuses, and timestamps.

## Step 9: Ask User What To Do Next

Use `AskUserQuestion`:

- **"Draft a companion doc"** — Pick a gap and generate a custom doc
- **"Re-scan a different category"** — Run analysis on another scope
- **"View detailed scores"** — Show per-file breakdown for a category
- **"Done"** — Exit

## Step 10: Draft Companion Doc (if selected)

If the user picks "Draft a companion doc":

1. Use `AskUserQuestion` with the top 3-5 identified gaps as options
2. Read ALL affected official docs for that topic area
3. Read any related existing custom docs for consistency
4. Generate a custom companion doc following this template:

```yaml
---
title: "Topic Name — Comprehensive RAG Reference"
source: official_docs_synthesis
date: YYYY-MM-DD
type: technical_reference
topics:
  - topic1
  - topic2
---
```

Template structure:
- **Overview**: 2-3 paragraphs explaining the concept at a high level
- **Well-spaced headings**: Every ~300-500 tokens (chunker-friendly)
- **Key sections**: Core concepts, how it works, architecture/components
- **Code examples**: Where applicable (CLI commands, API calls, schemas)
- **ASCII diagrams**: Where architecture is involved
- **Common use cases**: Practical applications
- **FAQ section**: Likely user questions with clear answers
- **What it cannot do / limitations**: Explicit non-capabilities
- **Cross-references**: Links to related docs

5. Write to `docs/custom/` with a descriptive filename (e.g., `QStorage-Overview.md`)
6. Update the audit log: mark all related official doc files as `status: "covered"` with a reference to the new custom doc
7. Run `python .agents/update-index.py`

</process>

<success_criteria>
- [ ] Audit log loaded (or initialized if first run)
- [ ] Scope selected by user
- [ ] Already-audited files skipped appropriately (unless re-scan)
- [ ] All files in scope scanned and scored on 6 dimensions
- [ ] React component stubs correctly identified
- [ ] Docusaurus-specific syntax flagged
- [ ] Custom docs cross-referenced for existing coverage
- [ ] Findings grouped by topic/entity area
- [ ] Gap severity computed per group
- [ ] Inline summary displayed
- [ ] Full report written to `.agents/reports/`
- [ ] Audit log updated and saved
- [ ] User offered next actions
- [ ] If drafting: companion doc follows custom doc template conventions
- [ ] If drafting: audit log updated with `covered` status for related files
- [ ] Index updated after any new files created
</success_criteria>

<notes>
- Token counting is approximate (~4 chars/token heuristic). The actual chunker uses `gpt-tokenizer` for cl100k_base.
- React component stubs mean the rendered content exists in the Docusaurus site's React components, but is NOT available to the RAG chunker. This is the #1 systemic issue.
- API reference files may use inline JSX for parameters (`export const HEADER_PARAMETERS = [...]`). This JavaScript data appears as raw code in chunks, not rendered tables.
- `:::info` admonition blocks render as plain text in chunks — acceptable but not ideal.
- For the `api/` category (~178 files), use representative sampling rather than reading every file. Note this in the report.
- The audit log is the source of truth for what's been analyzed. Always save it after each scan, even partial ones.
- When a custom doc is created, mark ALL related official doc files in the log as `covered` — not just the ones that scored poorly. The custom doc serves as the consolidated reference for that entire topic area.
</notes>

---
*Last updated: 2026-02-11*
