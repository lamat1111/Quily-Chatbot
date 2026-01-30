---
name: sync-transcripts
description: Fetch YouTube transcripts, clean them, and prepare for RAG ingestion
allowed-tools:
  - Bash(python *)
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
---

# YouTube Transcript Management

Manage YouTube livestream transcriptions for the Quilibrium chatbot knowledge base.

## Folder Structure

All transcript data is stored within this skill folder:

```
.claude/skills/sync-transcripts/
├── SKILL.md                    # This file
├── cookies.txt                 # YouTube auth cookies (gitignored)
├── .gitignore                  # Excludes sensitive/temp files
├── scripts/
│   ├── fetch-transcripts.py    # Download from YouTube
│   ├── status.py               # Show processing status
│   ├── mark-processed.py       # Track cleaned transcripts
│   ├── CLEANING-GUIDE.md       # Phase 2: How to clean transcripts
│   └── DEDUPE-GUIDE.md         # Phase 3: How to deduplicate against official docs
└── transcripts/
    ├── raw/                    # Downloaded transcripts (gitignored)
    ├── cleaned/                # Cleaned .md files (ready for dedupe)
    └── processed.json          # Tracking file (gitignored)
```

## What This Skill Does

1. **Fetches** raw transcripts from YouTube playlists using `yt-dlp`
2. **Cleans** transcripts automatically (fix terms, add structure, remove filler)
3. **Dedupes** cleaned transcripts against each other and existing docs
4. **Prepares** final files for RAG ingestion with proper attribution

## Workflow Overview

The workflow has 3 phases:

```
Phase 1: FETCH
  Download new transcripts from YouTube playlist

Phase 2: CLEAN
  Clean each raw transcript (automated with Claude)
  - Fix transcription errors
  - Add section headers
  - Remove filler/boilerplate
  - Add YAML frontmatter

Phase 3: DEDUPE
  Compare all cleaned transcripts
  - Find duplicate content across transcripts
  - Compare against docs/quilibrium-official/
  - Remove redundant explanations, keep best version
  - Add cross-references where appropriate

Phase 4: INGEST
  Copy final files to docs/transcriptions/ and run ingestion
```

## Menu Options

When the user invokes `/sync-transcripts`, ask what they want to do:

1. **Check status** - Run `status.py` to see raw vs cleaned counts
2. **Fetch new transcripts** - Run `fetch-transcripts.py`
3. **Clean a transcript** - Automatically clean using CLEANING-GUIDE rules
4. **Clean all transcripts** - Batch clean all raw transcripts
5. **Dedupe transcripts** - Find and remove duplicate content
6. **Copy to docs** - Move cleaned files to `docs/transcriptions/` for ingestion

---

## Phase 2: Cleaning a Transcript

When the user asks to clean a transcript:

1. **Run status.py** to show available raw transcripts
2. **Ask which transcript** to clean (or let user specify, or "all")
3. **Read the raw transcript** from `transcripts/raw/`
4. **Read CLEANING-GUIDE.md** for the cleaning rules
5. **Apply all cleaning rules automatically:**
   - Remove filler words ("um", "uh", "like", "you know", "basically")
   - Remove boilerplate intro (greetings, legal disclaimer, mission statement)
   - Remove stream housekeeping and technical difficulties
   - Fix Quilibrium terms (see CLEANING-GUIDE tables)
   - Fix version numbers (e.g., "21018" → "2.1.0.18")
   - Fix external service names (Solana, Arbitrum, etc.)
   - Add descriptive section headers for topic changes
   - Break into logical paragraphs
   - Flag outdated information with notes
6. **Generate YAML frontmatter** with:
   - title: Descriptive title based on content
   - youtube_url: Extract video ID from filename, format as full URL
   - date: Extract from filename (YYYY-MM-DD)
   - author: Cassandra Heart
   - topics: Identify 2-5 relevant topics from the content
7. **Save directly** to `transcripts/cleaned/YYYY-MM-DD_descriptive-title.md` (do NOT show preview to user)
8. **Mark as processed**: Run `mark-processed.py <video_id> <filename>`
9. **Notify user** with just the filename - they will review it manually in the cleaned folder

**Important:** During cleaning, preserve ALL technical content. Do NOT remove duplicates yet - that happens in Phase 3. Better to include too much than lose valuable information.

### YAML Frontmatter Format

```yaml
---
title: "Descriptive Title Based on Content"
source: youtube
youtube_url: https://www.youtube.com/watch?v=VIDEO_ID
author: Cassandra Heart
date: YYYY-MM-DD
type: livestream_transcript
topics:
  - topic1
  - topic2
---
```

---

## Phase 3: Deduplicating Transcripts

Run this AFTER all transcripts are cleaned. This phase compares content against official docs and removes duplicates.

**Full instructions:** See [DEDUPE-GUIDE.md](scripts/DEDUPE-GUIDE.md)

When the user asks to dedupe:

1. **Read DEDUPE-GUIDE.md** for the complete reference index and rules
2. **Read the cleaned transcript** from `transcripts/cleaned/`
3. **For each section**, check against the Official Docs Reference Index:
   - **Tier 1 topics** (comprehensive official docs exist): Remove explanation, add cross-reference
   - **Tier 2 content** (unique value): Keep analogies, Q&A, history, roadmap, examples
   - **Tier 3 topics** (documentation gaps): Flag for potential extraction to official docs
4. **Check against other transcripts** for duplicate explanations
5. **Apply changes** using the replacement templates from DEDUPE-GUIDE.md
6. **Quality check** using the checklist in DEDUPE-GUIDE.md

### Quick Reference: What to Remove vs Keep

| Remove (Tier 1) | Keep (Tier 2) |
|-----------------|---------------|
| Q Storage/QKMS technical details | Analogies and metaphors |
| Hypergraph/RDF definitions | Q&A answers |
| Tokenomics/emissions formulas | Historical context / origin story |
| Consensus mechanism details | Roadmap and future plans |
| Node setup instructions | Time-specific status updates |
| Mission statement | Real-world examples |
| Core technology explanations | Comparisons to competitors |

### Cross-Reference Format

When removing content, replace with:

```markdown
## [Topic Name]

For comprehensive information about [topic], see the [official documentation](../../../docs/quilibrium-official/[path]).

[Keep any unique insights, examples, or context specific to this stream...]
```

---

## Phase 4: Copy to Docs and Ingest

After cleaning and deduping:

```bash
cp .claude/skills/sync-transcripts/transcripts/cleaned/*.md docs/transcriptions/
yarn ingest run
```

**About the `--clean` flag:** The ingest pipeline is incremental - it only re-ingests files that have changed (based on content hash). The `--clean` flag removes orphaned chunks from files that were *deleted* from docs/. Use it when you've removed transcripts, not needed for adding new ones.

The `youtube_url` field in frontmatter enables clickable YouTube links in bot citations.

---

## Configuration

**Default Playlist:** https://www.youtube.com/playlist?list=PLnhsXXDZIsK7CTdt14TM9fo9KcT3GzPRf

**Default Author:** Cassandra Heart (Quilibrium Founder)

## Cookie Setup

YouTube requires authentication for some content. One-time setup:

1. Install "Get cookies.txt LOCALLY" browser extension
2. Go to youtube.com while logged in
3. Export cookies to `.claude/skills/sync-transcripts/cookies.txt`

The cookies file is gitignored for security.

## Topics for Frontmatter

High-level categories:
- tokenomics
- q-storage
- q-console
- quorum
- mpc
- security
- roadmap
- architecture
- node-operation

---

*Last updated: 2026-01-29*
