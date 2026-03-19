---
type: doc
title: "Automated Documentation Sync Pipeline"
description: "Daily GitHub Actions pipeline that syncs official docs, scrapes Discord announcements, and generates general channel recaps into the RAG knowledge base"
status: done
ai_generated: true
reviewed_by: null
created: 2026-02-24
updated: 2026-03-19
related_docs:
  - "rag-knowledge-base-workflow.md"
  - "discord-bot-architecture.md"
  - "daily-general-recap.md"
related_tasks:
  - "automated-weekly-docs-sync.md"
  - "2026-03-18-discord-announcements-scraper.md"
  - "2026-03-19-daily-general-recap.md"
---

# Automated Documentation Sync Pipeline

> **⚠️ AI-Generated**: May contain errors. Verify before use.

## Overview

The sync pipeline keeps Quily's RAG knowledge base current by pulling content from three sources:

1. **Official Quilibrium docs** (`yarn sync-docs`) — syncs markdown from the `QuilibriumNetwork/docs` GitHub repository
2. **Discord announcements** (`yarn sync-discord`) — scrapes announcement channels via the Discord REST API and converts messages to dated markdown files
3. **General channel recaps** (`yarn recap-general`) — scrapes the Discord general channel, filters noise, and produces LLM-summarized daily recaps (see [Daily General Channel Recap](daily-general-recap.md))

All three run within a single daily GitHub Actions workflow (`.github/workflows/sync-docs.yml`) at 06:00 UTC. When any source has new content, the workflow triggers a single RAG re-ingestion pass so the chatbot always has up-to-date answers — including recent news and announcements from Discord.

## Architecture

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| CLI Entry Point | `scripts/sync-docs/index.ts` | Commander-based CLI with `sync`, `status`, and `verify` commands |
| GitHub Fetcher | `scripts/sync-docs/github.ts` | Fetches file lists via GitHub Contents API with retry/rate-limit handling |
| Git Clone Fetcher | `scripts/sync-docs/git-clone.ts` | Alternative bulk fetch via shallow `git clone` with sparse checkout |
| Diff Engine | `scripts/sync-docs/diff.ts` | Compares remote file SHAs against local manifest to compute adds/modifies/deletes |
| Sync Executor | `scripts/sync-docs/sync.ts` | Downloads changed files from raw.githubusercontent.com, writes to disk, deletes removed files |
| Manifest Manager | `scripts/sync-docs/manifest.ts` | Persists `.sync-manifest.json` with per-file SHA + content hash for incremental updates |
| Companion Impact | `scripts/sync-docs/companion-impact.ts` | Checks if changed official docs affect custom companion docs (via gap-audit-log) |
| Type Definitions | `scripts/sync-docs/types.ts` | Shared TypeScript interfaces for the pipeline |
| GitHub Actions | `.github/workflows/sync-docs.yml` | Daily cron (06:00 UTC) + manual dispatch workflow |

### Data Flow

```
QuilibriumNetwork/docs (GitHub)
        │
        ├── GitHub Contents API (file list + SHAs)
        │   └── fetchAllMarkdownFiles() — recursive directory walk
        │
        ├── OR: git clone --depth 1 (bulk alternative)
        │   └── syncViaGitClone() — shallow clone + sparse checkout
        │
        ▼
   computeDiff()
   ├── Compare remote SHAs against .sync-manifest.json
   ├── Categorize: added / modified / deleted / unchanged
   │
   ▼
   executeSync()
   ├── Download added/modified files from raw.githubusercontent.com
   ├── Write to ./docs/quilibrium-official/
   ├── Delete locally-removed files
   ├── Update manifest with new SHAs + content hashes
   │
   ▼
   analyzeCompanionImpact() (optional)
   ├── Cross-reference gap-audit-log.json
   ├── Flag stale/orphaned companion docs
   │
   ▼
   runIngestion() (if --ingest flag)
   └── Spawns `yarn ingest run` for RAG embedding + Supabase upload
```

### Default Configuration

```typescript
const DEFAULT_CONFIG: SyncConfig = {
  owner: 'QuilibriumNetwork',
  repo: 'docs',
  sourcePath: 'docs',
  branch: 'main',
  destPath: './docs/quilibrium-official',
};
```

Synced files land in `./docs/quilibrium-official/` which is committed to the repo. The GitHub Actions workflow commits updated docs and manifest back to `main` so that `git pull` gives you the latest docs locally.

## CLI Commands

### `yarn sync-docs sync`

The primary command. Fetches the remote file list, computes a diff against the local manifest, downloads changes, and optionally triggers RAG ingestion.

**Flags:**

| Flag | Default | Description |
|------|---------|-------------|
| `--dry-run` | `false` | Show what would change without modifying files |
| `--force` | `false` | Ignore manifest, re-download all files |
| `--ingest` | `false` | Automatically run `yarn ingest run` after sync |
| `--verbose` | `false` | Show detailed progress for each file |

**Convenience scripts in `package.json`:**

| Script | Equivalent |
|--------|------------|
| `yarn sync-docs:run` | `yarn sync-docs sync` |
| `yarn sync-docs:dry` | `yarn sync-docs sync --dry-run` |
| `yarn sync-docs:force` | `yarn sync-docs sync --force` |
| `yarn sync-docs:ingest` | `yarn sync-docs sync --ingest` |

### `yarn sync-docs status`

Checks for remote changes without modifying anything. Loads the local manifest, fetches the current remote file list, computes the diff, and reports what would need syncing. Used by the GitHub Actions workflow to decide whether to proceed.

### `yarn sync-docs verify`

Validates that local files match the manifest's recorded content hashes (MD5). Useful for debugging file corruption or manual edits.

## Incremental Sync via Manifest

The pipeline avoids unnecessary downloads through a `.sync-manifest.json` file stored in `./docs/quilibrium-official/`:

```json
{
  "lastSync": "2026-02-24T06:00:00.000Z",
  "source": {
    "owner": "QuilibriumNetwork",
    "repo": "docs",
    "branch": "main",
    "path": "docs"
  },
  "files": {
    "api/01-overview.md": {
      "path": "api/01-overview.md",
      "sha": "abc123...",
      "contentHash": "d41d8cd98f00b204e9800998ecf8427e",
      "syncedAt": "2026-02-24T06:00:00.000Z",
      "size": 4521
    }
  },
  "version": 1
}
```

The diff engine compares each remote file's Git SHA against the manifest entry. Only files with changed SHAs are downloaded. Files present in the manifest but absent from the remote are treated as deletions.

## GitHub API Integration

### Rate Limiting

The GitHub fetcher (`github.ts`) handles rate limits with:

- **Retry with backoff**: Up to 3 retries with increasing delays (1s, 2s, 3s)
- **403 detection**: Reads `x-ratelimit-remaining` and `x-ratelimit-reset` headers
- **Wait-and-retry**: If reset is under 60 seconds away, waits and retries
- **Token support**: Set `GITHUB_TOKEN` for 5,000 requests/hour (vs 60 unauthenticated)
- **Raw downloads**: File content is fetched from `raw.githubusercontent.com` which has separate, higher rate limits

### File Filtering

- Only `.md` files are synced
- Files prefixed with `_` (drafts/hidden) are skipped
- Directory traversal is recursive with 100ms delays between directory fetches

### Alternative: Git Clone

`git-clone.ts` provides a bulk alternative using `git clone --depth 1` with sparse checkout. This is more efficient for initial syncs or force re-downloads since it transfers all files in a single operation rather than individual API calls.

## Companion Doc Impact Detection

When official docs change, custom companion docs that reference them may become stale. The `companion-impact.ts` module:

1. Loads `.claude/skills/doc-gap-analysis/gap-audit-log.json`
2. Builds a reverse map: companion doc → set of official source docs
3. Cross-references modified/deleted files from the sync diff
4. Classifies impact severity:
   - **Stale**: Source docs were modified — companion may have outdated info
   - **Partially orphaned**: Some source docs were deleted
   - **Orphaned**: All source docs were deleted — companion has no valid sources

The impact report is displayed in the terminal after sync. This helps maintainers know which companion docs need manual review.

## Discord Announcements Scraper

### Overview

The Discord scraper (`scripts/sync-discord/`) fetches messages from configured Discord announcement channels via the REST API (no `discord.js` dependency), converts them to dated markdown files, and maintains a rolling 4-week window. The files land in `docs/discord-announcements/` where the existing ingestion pipeline picks them up automatically.

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| CLI Entry Point | `scripts/sync-discord/index.ts` | Commander-based CLI with `sync` and `status` commands |
| Discord API Client | `scripts/sync-discord/discord-api.ts` | REST client for channels and messages (Bot token auth, v10 API) |
| Formatter | `scripts/sync-discord/formatter.ts` | Groups messages by date, cleans Discord markup, writes markdown with frontmatter |
| Manifest Manager | `scripts/sync-discord/manifest.ts` | Persists `.discord-manifest.json` at repo root with last message ID per channel |
| Cleanup | `scripts/sync-discord/cleanup.ts` | Deletes markdown files older than 28 days, removes empty directories |
| Type Definitions | `scripts/sync-discord/types.ts` | Shared TypeScript interfaces |

### Data Flow

```
Discord REST API v10
        │
        ├── GET /channels/{id} — channel name + guild ID
        ├── GET /channels/{id}/messages?after={last_id}&limit=100
        │   └── Paginate until no more messages
        │
        ▼
   groupByDate()
   ├── Group messages by YYYY-MM-DD
   ├── Clean Discord markup (mentions, emojis, embeds)
   │
   ▼
   writeMarkdownFiles()
   ├── Write to ./docs/discord-announcements/{channel-name}/{date}.md
   ├── Frontmatter: type: discord_announcement, date, source_url
   ├── Append to existing file if same-day re-run
   │
   ▼
   cleanOldAnnouncements()
   ├── Delete files older than 28 days
   ├── Remove empty channel directories
   │
   ▼
   saveManifest()
   └── Update .discord-manifest.json with last message ID per channel
```

### Channel Configuration

Channels are configured via the `DISCORD_CHANNEL_IDS` environment variable (or GitHub Secret):

```
# Format: channel_id:folder_name,channel_id:folder_name
DISCORD_CHANNEL_IDS=123456789:announcements,987654321:dev-updates

# Or without names (fetched from Discord API automatically):
DISCORD_CHANNEL_IDS=123456789,987654321
```

### CLI Commands

#### `yarn sync-discord sync`

Fetches new messages from all configured channels and writes markdown files.

| Flag | Default | Description |
|------|---------|-------------|
| `--dry-run` | `false` | Show what would be fetched without writing files |

**Convenience scripts:**

| Script | Equivalent |
|--------|------------|
| `yarn sync-discord:run` | `yarn sync-discord sync` |
| `yarn sync-discord:dry` | `yarn sync-discord sync --dry-run` |

#### `yarn sync-discord status`

Shows the current manifest state — last run time, tracked channels, and last message IDs.

### Markdown Output Format

Each daily file looks like:

```markdown
---
title: "announcements - March 18, 2026"
type: discord_announcement
channel: announcements
date: 2026-03-18
source_url: https://discord.com/channels/guild/channel/message
---

# announcements - March 18, 2026

## Author Name — 2:30 PM UTC

Message content here...

---

## Author Name — 5:15 PM UTC

Another announcement...
```

The `source_url` links to the first message of the day in Discord. The `type: discord_announcement` and `date` fields are used by the ingestion pipeline for doc_type labeling and temporal query support.

### Rolling Window

- **Window size**: 28 days
- **On each run**: Fetch new messages since last scrape, delete files older than cutoff
- **Orphan cleanup**: `yarn ingest run --clean` removes Supabase chunks for deleted files
- **First run**: Fetches the latest 100 messages per channel (Discord API limit without pagination history)

### Discord Bot Prerequisites

The scraper uses a Discord bot token with read-only permissions. The bot must:

1. Be created on the [Discord Developer Portal](https://discord.com/developers/applications)
2. Have **Message Content Intent** enabled
3. Be invited to the target server with **View Channels** + **Read Message History** permissions
4. Have access to the specific announcement channels being scraped

The same bot token used for the live Quily Discord bot can be reused — the scraper only makes read-only API calls.

## GitHub Actions Automation

### Workflow: `.github/workflows/sync-docs.yml`

The workflow runs daily at 06:00 UTC and can be triggered manually from the GitHub Actions tab.

**Steps:**

1. **Checkout** repository
2. **Setup** Node.js 20 with yarn cache
3. **Install** dependencies (`yarn install --frozen-lockfile`)
4. **Sync Discord** announcements (guarded — skips if secrets not configured)
5. **Generate general channel recap** (guarded — skips if `DISCORD_GENERAL_CHANNEL_ID` or `OPENROUTER_API_KEY` not configured)
6. **Check** for changes — checks both upstream docs (`yarn sync-docs status`) and local Discord file changes (`git status`)
6. **Sync docs + ingest** (only if either source changed) — runs `yarn sync-docs sync --ingest`
7. **Commit** updated docs, Discord announcements, and manifests back to the repo
8. **Summary** — logs whether changes were synced or skipped

### Required GitHub Secrets

| Secret | Maps to `.env` variable | Purpose |
|--------|------------------------|---------|
| `SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL for embedding uploads |
| `SUPABASE_SERVICE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` | Service role key for write access |
| `CHUTES_API_KEY` | `CHUTES_API_KEY` | Chutes API for BGE-M3 embedding generation |
| `DISCORD_BOT_TOKEN` | `DISCORD_BOT_TOKEN` | Discord bot token for announcement scraping |
| `DISCORD_CHANNEL_IDS` | `DISCORD_CHANNEL_IDS` | Comma-separated channel IDs to scrape (see format above) |
| `DISCORD_GENERAL_CHANNEL_ID` | `DISCORD_GENERAL_CHANNEL_ID` | General channel ID for daily recaps |
| `OPENROUTER_API_KEY` | `OPENROUTER_API_KEY` | OpenRouter API key for recap LLM summarization |

### Resource Usage

- **No changes**: ~15 seconds (status check only)
- **With changes**: 2-5 minutes (sync + embedding generation + Supabase upload)
- **Monthly cost**: ~7.5 minutes of GitHub Actions time (free tier is 2,000 min/month)

### Commit Behavior

The workflow commits as `github-actions[bot]` with the message:
```
docs: sync documentation and announcements (automated daily)
```

It performs a `git pull --rebase origin main` before pushing to avoid conflicts with concurrent pushes.

## Technical Decisions

- **GitHub Actions over app-level cron**: The sync runs independently of the hosting platform (Vercel, QStorage, etc.), ensuring documentation stays current regardless of deployment infrastructure changes.
- **Manifest-based incremental sync**: Comparing Git SHAs is fast and avoids downloading unchanged files. The MD5 content hash provides a secondary integrity check.
- **Raw URL downloads**: Fetching file content from `raw.githubusercontent.com` instead of the API avoids counting against API rate limits.
- **50ms inter-file delay**: Prevents rate limiting when downloading many files sequentially during large syncs.
- **Companion impact as advisory**: The impact report is informational — it flags potentially stale companion docs but does not block the sync or auto-modify them.
- **Committed sync destination**: `./docs/quilibrium-official/` and its manifest are committed to the repo. This enables incremental sync (manifest persists between runs) and lets `git pull` deliver the latest docs locally without running sync manually.

## Known Limitations

- **No webhook trigger**: The pipeline relies on a daily cron schedule rather than GitHub webhooks. Changes to the upstream repo may take up to 24 hours to appear in the chatbot's knowledge base.
- **No partial ingestion**: When changes are detected, the `--ingest` flag re-runs the full ingestion pipeline rather than only re-embedding changed files.
- **Companion impact requires gap analysis**: The impact detection only works if `doc-gap-analysis` has been run previously to generate the audit log.
- **API rate limits without token**: Unauthenticated GitHub API access is limited to 60 requests/hour, which may be insufficient for large repos. Set `GITHUB_TOKEN` for production use.
- **Discord first-run limit**: The first Discord scrape fetches only the latest 100 messages per channel (Discord API default). Older announcements from the 28-day window won't be backfilled. Subsequent daily runs capture everything going forward.
- **Discord bot permissions**: The bot must have explicit View Channel + Read Message History permissions on each announcement channel. Server-level permissions may not be sufficient if channels have permission overrides.

## Related Documentation

- [RAG Knowledge Base Workflow](rag-knowledge-base-workflow.md) — Full RAG pipeline including ingestion, retrieval, and runtime query flow
- [Discord Bot Architecture](discord-bot-architecture.md) — The live Discord bot that uses the same RAG pipeline
- [Task: Automated Weekly Docs Sync](../tasks/.done/automated-weekly-docs-sync.md) — Original docs sync implementation task
- [Task: Discord Announcements Scraper](../tasks/2026-03-18-discord-announcements-scraper.md) — Discord scraper implementation plan

---

_Created: 2026-02-24_
_Updated: 2026-03-19_
