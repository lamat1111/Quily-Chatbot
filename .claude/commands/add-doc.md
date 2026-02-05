---
name: add-doc
description: Add a new document to the RAG knowledge base (custom or community docs)
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
  - WebFetch
  - AskUserQuestion
  - Task
---

<objective>
Add one or more documents to the Quily chatbot's RAG knowledge base. This command handles docs that go in `docs/custom/` (official content not on docs.quilibrium.com) or `docs/community/` (community-contributed content).

**Note:** For official docs from docs.quilibrium.com, use `/sync-docs`. For livestream transcripts, use `/sync-transcripts`.
</objective>

<document_taxonomy>

## Folders (this command handles these two)

| Folder | Purpose | Trust Level |
|--------|---------|-------------|
| `docs/custom/` | Official content not yet on website (Discord from Cassie, whitepaper excerpts, technical refs) | Official |
| `docs/community/` | Community-contributed content | Unofficial |

## Document Types

**For `docs/custom/`:**
- `discord_transcript` — Explanations from Cassie/team in Discord
- `technical_reference` — Architecture docs, deep-dives
- `whitepaper_excerpt` — Sections from the whitepaper
- `blog_post` — Official blog content

**For `docs/community/`:**
- `community_faq` — Community-compiled FAQs
- `community_guide` — Tutorials written by community
- `community_analysis` — Community research/analysis

</document_taxonomy>

<process>

<step name="parse-input">
**Parse the user's input:**

The user may provide:
- One or more URLs
- One or more file paths (e.g., `.temp/doc.md`)
- Pasted markdown content
- A mix of the above

The user will typically indicate the trust level and context in their message, e.g.:
- "Add this Discord explanation from Cassie about QNS"
- "Here's a community FAQ I compiled"
- "Add these blog posts: [urls]"

**Infer from user's message:**
- Trust level (official vs community) — look for mentions of Cassie, team, official, community, etc.
- Document type — based on source description
- If unclear, default to asking ONE question about trust level
</step>

<step name="fetch-content">
**Fetch all content in parallel:**

For each input:
- URL → Use WebFetch
- File path → Use Read
- Pasted content → Use directly

If multiple inputs, use Task tool to process in parallel.
</step>

<step name="analyze-and-check">
**For each document, analyze and check for overlap:**

1. **Extract metadata:**
   - Title (from content or infer)
   - Topics/keywords (5-10)
   - Source (URL, Discord, etc.)
   - Date (today if not specified)

2. **Check for duplicates:**
   - Search existing docs in `docs/custom/` and `docs/community/` for similar titles
   - Grep for key unique phrases to detect content overlap
   - Estimate overlap percentage

3. **Determine recommendation:**
   - No overlap → Proceed
   - Minor overlap (<30%) → Proceed with note
   - Significant overlap (30-70%) → Warn, may add new info
   - High overlap (>70%) → Recommend skip
</step>

<step name="present-summary">
**Present single summary for approval:**

For single doc:
```
📋 Document Analysis

Title: "QNS Privacy Mechanisms"
Source: Discord (Cassie)
Trust: Official → docs/custom/QNS-Privacy-Mechanisms.md
Type: discord_transcript
Topics: QNS, privacy, wallet, identity, metadata
Overlap: 12% with QNS-FAQ.md (different focus)

✓ Ready to add

Proceed? [Yes / Edit / Skip]
```

For batch:
```
📋 Batch Analysis (3 documents)

1. ✓ "QNS Privacy" → docs/custom/ (discord_transcript)
   Overlap: 12% with QNS-FAQ.md

2. ✓ "Node Troubleshooting" → docs/community/ (community_guide)
   Overlap: None

3. ⚠ "Token Basics" → SKIP RECOMMENDED
   Overlap: 85% with existing Token-Overview.md

Add documents 1 & 2? [Yes / Review each / Add all / Cancel]
```

Use AskUserQuestion only here for final confirmation.
</step>

<step name="format-and-write">
**Format and write approved documents:**

For each approved doc:

1. **Create YAML frontmatter:**
```yaml
---
title: "Document Title"
source: discord | whitepaper | blog | community
author: Name (if applicable)
date: YYYY-MM-DD
type: <appropriate type>
topics:
  - topic1
  - topic2
---
```

2. **For community docs, add disclaimer after frontmatter:**
```markdown
> **Disclaimer**: This is community-contributed content and may not reflect official Quilibrium positions.
```

3. **Format content:**
   - Clean up markdown
   - Ensure clear section headers for better RAG chunking
   - Remove redundant info already well-covered elsewhere

4. **Write to appropriate folder:**
   - Official → `docs/custom/Title-Kebab-Case.md`
   - Community → `docs/community/Title-Kebab-Case.md`
</step>

<step name="report">
**Final report:**

```
✅ Added [N] document(s)

Files:
- docs/custom/QNS-Privacy-Mechanisms.md
- docs/community/Node-Troubleshooting.md

Next: Run `yarn ingest run` to update RAG database
```
</step>

</process>

<inference_rules>

**Trust Level Inference:**
- Mentions Cassie, Cassandra Heart, team, official → Official (custom/)
- Mentions community, compiled, I wrote, forum → Community (community/)
- Source is quilibrium.com, official blog → Official (custom/)
- Source is Medium, personal blog, Reddit → Community (community/)
- When in doubt → Ask once

**Type Inference:**
- Discord messages → `discord_transcript`
- Whitepaper content → `whitepaper_excerpt`
- Architecture/technical deep-dive → `technical_reference`
- FAQ format → `community_faq` or `discord_transcript`
- Tutorial/how-to → `community_guide`
- Analysis/research → `community_analysis`

</inference_rules>

<examples>

**Example 1: Single Discord explanation**
```
User: "Add this Discord explanation from Cassie about wallet privacy"
[pastes content]

→ Infer: Official, discord_transcript
→ Analyze, check overlap
→ Present summary, confirm
→ Write to docs/custom/Wallet-Privacy.md
```

**Example 2: Batch community docs**
```
User: "Add these community guides I found:
- https://example.com/quil-setup
- https://example.com/node-faq"

→ Infer: Community (user said "community guides")
→ Fetch both in parallel
→ Analyze each, check overlaps
→ Present batch summary
→ Write approved to docs/community/
```

**Example 3: Mixed batch**
```
User: "Add this whitepaper section from .temp/consensus.md
and this community analysis from https://..."

→ Infer: First is official (whitepaper), second is community
→ Process both
→ Present summary with different destinations
→ Write to respective folders
```

</examples>
