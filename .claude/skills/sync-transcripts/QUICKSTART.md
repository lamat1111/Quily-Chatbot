# Transcript Workflow - Quick Reference

## TL;DR

```bash
# 1. Fetch new transcripts from YouTube
python .claude/skills/sync-transcripts/scripts/fetch-transcripts.py

# 2. Check what needs cleaning
python .claude/skills/sync-transcripts/scripts/status.py

# 3. Clean transcripts (ask Claude)
#    Say: "Clean the transcript from [date]" or "Clean all transcripts"

# 4. Copy to docs and ingest
cp .claude/skills/sync-transcripts/transcripts/cleaned/*.md docs/transcriptions/
yarn ingest run
```

---

## Detailed Steps

### Step 1: Fetch Transcripts

Downloads auto-generated subtitles from YouTube and converts to text.

```bash
python .claude/skills/sync-transcripts/scripts/fetch-transcripts.py
```

- Uses the default Quilibrium playlist
- Skips videos already downloaded
- Saves to `.claude/skills/sync-transcripts/transcripts/raw/`

**First time setup:** Export YouTube cookies to `.claude/skills/sync-transcripts/cookies.txt` using a browser extension like "Get cookies.txt LOCALLY".

### Step 2: Check Status

See what's been fetched and what still needs cleaning.

```bash
python .claude/skills/sync-transcripts/scripts/status.py
```

### Step 3: Clean Transcripts

Raw transcripts have no punctuation, filler words, and transcription errors. Claude cleans them automatically.

**Just ask Claude:**
- "Clean the transcript from January 21"
- "Clean all raw transcripts"
- `/sync-transcripts` → select "Clean a transcript"

**What Claude does:**
- Removes filler words (um, uh, like, you know)
- Fixes Quilibrium terms (equilibrium → Quilibrium, quill → QUIL)
- Fixes version numbers (21018 → 2.1.0.18)
- Adds section headers and paragraphs
- Adds YAML frontmatter with YouTube URL

**Output:** `.claude/skills/sync-transcripts/transcripts/cleaned/YYYY-MM-DD_title.md`

### Step 4: Copy and Ingest

```bash
# Copy cleaned files to docs
cp .claude/skills/sync-transcripts/transcripts/cleaned/*.md docs/transcriptions/

# Ingest into RAG database (incremental - only processes new/changed files)
yarn ingest run
```

---

## File Locations

| What | Where |
|------|-------|
| Raw transcripts | `.claude/skills/sync-transcripts/transcripts/raw/` |
| Cleaned transcripts | `.claude/skills/sync-transcripts/transcripts/cleaned/` |
| Final docs (for RAG) | `docs/transcriptions/` |
| Cookies file | `.claude/skills/sync-transcripts/cookies.txt` |
| Cleaning rules | `.claude/skills/sync-transcripts/scripts/CLEANING-GUIDE.md` |

---

## FAQ

**Q: Do I need to re-ingest everything when adding new transcripts?**
No. The ingest pipeline is incremental - it only processes new or changed files.

**Q: What does `--clean` flag do?**
Removes chunks from files that were *deleted* from docs/. Not needed for adding new files.

**Q: How do YouTube links appear in the chatbot?**
The `youtube_url` field in YAML frontmatter becomes a clickable source link in citations.

---

*Last updated: 2025-01-29*
