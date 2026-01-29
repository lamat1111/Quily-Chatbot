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
│   └── CLEANING-GUIDE.md       # How to clean transcripts
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
7. **Show the cleaned result** for user review
8. **On approval, save** to `transcripts/cleaned/YYYY-MM-DD_descriptive-title.md`
9. **Mark as processed**: Run `mark-processed.py <video_id> <filename>`

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

Run this AFTER all transcripts are cleaned. This phase compares content and removes duplicates.

When the user asks to dedupe:

1. **Read all cleaned transcripts** from `transcripts/cleaned/`
2. **Build a topic index** - List all section headers and topics from each file
3. **Identify duplicate topics** - Find sections covering the same subject across files
4. **For each duplicate topic:**
   - Compare the explanations
   - Identify which is most complete/clear
   - Keep the best version
   - In other files, replace with a brief reference + link to the best version
5. **Compare against official docs** (`docs/quilibrium-official/`):
   - If official docs cover a topic comprehensively, condense transcript to unique insights only
   - Keep examples, analogies, and context not in official docs
6. **Show proposed changes** for user review
7. **On approval, update the files**

### Duplicate Handling Rules

| Situation | Action |
|-----------|--------|
| Same topic in multiple transcripts | Keep most complete explanation, reference it from others |
| Topic fully covered in official docs | Condense to unique insights + "See official docs for details" |
| Transcript has unique examples | Keep examples even if topic is covered elsewhere |
| Historical context/roadmap updates | Keep - provides timeline context |
| Identical explanations | Keep only one, remove from others |

### Cross-Reference Format

When removing duplicate content, replace with:

```markdown
## [Topic Name]

For detailed information about [topic], see:
- [Official documentation](link) for technical details
- [Other transcript title](YYYY-MM-DD_other-transcript.md) for in-depth explanation

[Keep any unique insights, examples, or context specific to this stream...]
```

---

## Phase 4: Copy to Docs and Ingest

After cleaning and deduping:

```bash
cp .claude/skills/sync-transcripts/transcripts/cleaned/*.md docs/transcriptions/
npm run ingest run --clean
```

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

*Last updated: 2025-01-29*
