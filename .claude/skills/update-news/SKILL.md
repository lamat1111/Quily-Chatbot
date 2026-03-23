---
name: update-news
description: Find and mark obsolete information across community docs, Discord announcements, and livestream transcripts when news changes. Supports annotating, updating, or deleting outdated content so the bot surfaces the most current information.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - AskUserQuestion
user-invocable: true
---

# Update News Skill

Find and manage obsolete information across non-official documentation (community docs, Discord announcements, livestream transcripts) when facts change.

## When to Use

- A previously announced date, feature, or detail has changed
- A product was renamed, merged, or cancelled
- An announcement was corrected or superseded by a newer one
- A livestream discussed something that has since changed
- Any time you need to find and fix stale information in the knowledge base

## Scope

This skill operates on **non-official docs only**:
- `docs/custom/` — Custom and community-contributed content
- `docs/custom/auto/` — Auto-generated docs (network health, tech tree)
- `docs/discord/` — Discord announcement archives
- `docs/transcriptions/` — Livestream transcripts

**NEVER modify** files in `docs/quilibrium-official/` — those are a mirror of the official docs and are managed by `/sync-docs`.

## How Obsolescence Notes Work

The approach uses **inline content annotations** that require zero schema changes. Since the chunker includes the actual markdown text in each chunk, an obsolescence note embedded in the content will naturally be retrieved and shown to the LLM, which will then correctly caveat its answer.

### Annotation Format

Insert an obsolescence blockquote **immediately after the frontmatter** (before any headings or content) and/or **before the specific section** that is outdated:

**Document-level (entire doc is outdated):**
```markdown
---
title: "Original Title"
...
---

> **OUTDATED (YYYY-MM-DD):** [Brief explanation of what changed and what the current information is. Include a pointer to the newer source if available.]

# Original Content Below...
```

**Section-level (only part of the doc is outdated):**
```markdown
## Some Section That Changed

> **OUTDATED (YYYY-MM-DD):** [Brief explanation of what changed.]

Original content that is now outdated...
```

### Annotation Rules

1. **Always include the date** in `YYYY-MM-DD` format — this tells the bot and future maintainers when the information became outdated
2. **Always explain what changed** — don't just say "outdated", say what the new reality is
3. **Point to the newer source** if one exists (e.g., "See the March 15, 2026 announcement" or "See docs.quilibrium.com/...")
4. **Use blockquote format** (`> **OUTDATED...**`) so it's visually distinct and chunked together with the content it annotates
5. **Preserve the original content** below the note — don't delete it, the historical record has value and the note provides sufficient context for the bot

### When to DELETE Instead of Annotate

Delete the entire file (and re-ingest) only when:
- The content is **completely wrong** (not just outdated — factually incorrect)
- The content is a **duplicate** of another doc that is more current
- The file is a Discord announcement **older than 28 days** that the rolling window missed (these should have been auto-cleaned)

For deletions, also run orphan cleanup: `yarn ingest:clean`

### When to UPDATE Instead of Annotate

Update the content directly (replace the outdated text with current info) when:
- You have **authoritative new information** to replace it with
- The doc is a **community FAQ or guide** that should reflect current state
- The user explicitly asks you to update rather than annotate

After updating, change the `date` field in the frontmatter to today's date.

---

<process>

<step name="understand-change">
**Understand what changed:**

Ask the user (or infer from their message):
1. **What is the topic?** (e.g., "QNS auction dates", "v2.1.0.21 release", "Quorum beta status")
2. **What is the OLD information?** (what was previously true)
3. **What is the NEW information?** (what is now true)
4. **What action to take?** Default to annotate. User may request update or delete.

If the user provides a clear description like "The testnet launch moved from March to April", extract all three pieces automatically.
</step>

<step name="search-knowledge-base">
**Search across all non-official docs for affected content:**

Search strategy (run in parallel where possible):

1. **Keyword search** — Grep for the topic keywords across all non-official doc folders:
   ```
   Grep pattern in: docs/custom/, docs/discord/, docs/transcriptions/
   ```

2. **Broader context search** — If the topic involves a product name, date, or version number, also search for related terms (e.g., searching for "v2.1.0.21" should also check "2.1.0.21", "version 21")

3. **Read matching files** — For each hit, read the surrounding context (not just the matching line) to understand if the content actually contains the outdated claim

Build a list of affected files with:
- File path
- What outdated claim it contains
- Whether the whole doc or just a section is affected
- Severity: how misleading is this if the bot surfaces it?
</step>

<step name="present-findings">
**Present findings to the user for review:**

```
Found [N] files with potentially outdated information about "[topic]":

1. docs/transcriptions/2026-02-01_qconsole-launch.md
   Section: "## QNS Update" (line 25-30)
   Says: "QNS update will ship within 24-48 hours"
   Impact: HIGH — bot could tell users an update is imminent when it already shipped
   Recommendation: Annotate section

2. docs/discord/announcements/2026-03-05.md
   Full document
   Says: "v2.1.0.20 released"
   Impact: LOW — version is old but not misleading (it was true at the time)
   Recommendation: Skip (historical record)

3. docs/custom/QNS-FAQ.md
   Section: "## Pricing" (line 45-52)
   Says: "Pricing has not been announced yet"
   Impact: HIGH — pricing has since been announced
   Recommendation: Update with current info

Action for each: [Annotate / Update / Delete / Skip]
```

Use AskUserQuestion to confirm the plan before making changes.
</step>

<step name="apply-changes">
**Apply approved changes:**

For each file, based on the approved action:

**Annotate:**
- Use Edit tool to insert the obsolescence blockquote
- Place it immediately after frontmatter (document-level) or before the affected section (section-level)
- Format: `> **OUTDATED (YYYY-MM-DD):** [explanation with pointer to newer source]`

**Update:**
- Use Edit tool to replace outdated content with current information
- Update the `date` field in frontmatter to today's date
- If significant changes, also update the `title` if needed

**Delete:**
- Use Bash to remove the file: `rm "docs/path/to/file.md"`
- Note the file for orphan cleanup

Track which files were modified for the re-ingestion step.
</step>

<step name="reingest">
**Re-ingest affected documents:**

After all changes are applied:

1. Show the user a summary of all changes made
2. Remind them to re-ingest:

```
Changes applied to [N] files:
- Annotated: docs/transcriptions/2026-02-01_qconsole-launch.md
- Updated: docs/custom/QNS-FAQ.md
- Deleted: (none)

To update the RAG database, run:
  yarn ingest:run        # re-ingest all docs (upserts handle updates)
  yarn ingest:clean      # if any files were deleted, clean orphaned chunks
```

If the user wants, offer to run the ingestion command directly.
</step>

</process>

---

## Examples

**Example 1: Date change**
```
User: "The Quorum beta was supposed to launch in February but it's been pushed to April"

→ Search for "Quorum beta", "Quorum launch", "February" across non-official docs
→ Find 2 transcripts and 1 community doc mentioning February launch
→ Present findings with recommendations
→ Annotate: > **OUTDATED (2026-03-19):** The Quorum beta launch has been postponed from February to April 2026.
```

**Example 2: Version superseded**
```
User: "v2.1.0.21 is out, mark any mentions of v2.1.0.20 as the latest version as outdated"

→ Search for "2.1.0.20", "latest version", "latest release"
→ Find Discord announcements and transcripts
→ Annotate or skip based on impact assessment
```

**Example 3: Feature renamed**
```
User: "QPing has been renamed to QHeartbeat"

→ Search for "QPing" across all non-official docs
→ Present all occurrences
→ Update community docs (replace QPing → QHeartbeat)
→ Annotate transcripts (can't change what was said, but note the rename)
```

**Example 4: Correction**
```
User: "The announcement said 10M QUIL rewards but it's actually 5M"

→ Search for "10M", "10 million", "rewards" in recent announcements
→ Annotate with correction
→ If community doc repeated it, update the community doc
```
