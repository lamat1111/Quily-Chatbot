---
type: doc
title: "Automated Documentation Sync Pipeline"
status: done
ai_generated: true
reviewed_by: null
created: 2026-02-24
updated: 2026-02-24
related_docs:
  - "rag-knowledge-base-workflow.md"
related_tasks:
  - "automated-weekly-docs-sync.md"
---

# Automated Documentation Sync Pipeline

> **⚠️ AI-Generated**: May contain errors. Verify before use.

## Overview

The sync-docs pipeline keeps Quily's RAG knowledge base current by pulling official Quilibrium documentation from the `QuilibriumNetwork/docs` GitHub repository. It runs as both a local CLI tool (`yarn sync-docs`) and an automated daily GitHub Actions workflow. When upstream docs change, the pipeline downloads new/modified files, updates a local manifest, optionally detects companion doc impact, and triggers RAG re-ingestion so the chatbot always has up-to-date answers.

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

## GitHub Actions Automation

### Workflow: `.github/workflows/sync-docs.yml`

The workflow runs daily at 06:00 UTC and can be triggered manually from the GitHub Actions tab.

**Steps:**

1. **Checkout** repository
2. **Setup** Node.js 20 with yarn cache
3. **Install** dependencies (`yarn install --frozen-lockfile`)
4. **Check** for changes (`yarn sync-docs status`) — parses output for "unchanged"
5. **Sync + ingest** (only if changes detected) — runs `yarn sync-docs sync --ingest`
6. **Commit** updated manifest and docs back to the repo
7. **Summary** — logs whether changes were synced or skipped

### Required GitHub Secrets

| Secret | Maps to `.env` variable | Purpose |
|--------|------------------------|---------|
| `SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL for embedding uploads |
| `SUPABASE_SERVICE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` | Service role key for write access |
| `CHUTES_API_KEY` | `CHUTES_API_KEY` | Chutes API for BGE-M3 embedding generation |

### Resource Usage

- **No changes**: ~15 seconds (status check only)
- **With changes**: 2-5 minutes (sync + embedding generation + Supabase upload)
- **Monthly cost**: ~7.5 minutes of GitHub Actions time (free tier is 2,000 min/month)

### Commit Behavior

The workflow commits as `github-actions[bot]` with the message:
```
docs: sync Quilibrium documentation (automated daily)
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

## Related Documentation

- [RAG Knowledge Base Workflow](rag-knowledge-base-workflow.md) — Full RAG pipeline including ingestion, retrieval, and runtime query flow
- [Task: Automated Weekly Docs Sync](../tasks/.done/automated-weekly-docs-sync.md) — Original implementation task

---

_Created: 2026-02-24_
