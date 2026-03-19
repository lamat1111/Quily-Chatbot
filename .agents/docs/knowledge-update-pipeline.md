---
type: doc
title: "Knowledge Update Pipeline — Automated Docs from GitHub Issues"
status: done
ai_generated: true
created: 2026-03-19
updated: 2026-03-19
related_docs:
  - "update-news-skill.md"
  - "rag-knowledge-base-workflow.md"
related_tasks:
  - "2026-03-19-issue-to-knowledge-pipeline.md"
---

# Knowledge Update Pipeline — Automated Docs from GitHub Issues

> **AI-Generated**: May contain errors. Verify before use.

## Overview

An automated pipeline that turns GitHub issues into documentation PRs. Community members submit knowledge updates via a structured issue template, a maintainer triages and labels the issue, and Claude automatically generates a doc change and opens a PR for review.

This complements the `/update-news` skill: the pipeline **adds** new knowledge, while `/update-news` **marks existing knowledge as outdated**.

## How It Works

```
Community member opens issue (Knowledge Update template)
        │
        ▼
Maintainer reviews and adds `knowledge-update` label
        │
        ▼
GitHub Actions workflow triggers
        │
        ▼
Duplicate check (skip if PR already exists for this issue)
        │
        ▼
Claude reads issue, generates/edits a markdown doc
        │
        ▼
Post-generation guardrail validates all changes are in allowed dirs
        │
        ▼
PR created on branch `knowledge/issue-<number>`
        │
        ▼
Maintainer reviews and merges PR (issue auto-closes via `Closes #N`)
        │
        ▼
Daily sync (06:00 UTC) reingests into RAG database
        │
        ▼
(Optional) Maintainer runs /update-news if update supersedes existing docs
```

## Key Files

| File | Purpose |
|------|---------|
| `.github/workflows/knowledge-update.yml` | The GitHub Actions workflow |
| `.github/ISSUE_TEMPLATE/knowledge-update.yml` | Structured issue template for submissions |
| `docs/custom/How-To-Update-Quily-Knowledge.md` | Doc so Quily can answer "how do I update your info?" |

## Two Contribution Workflows

The system supports two ways for community members to contribute knowledge:

### 1. GitHub Issue (lower friction)

Best for non-technical users or quick info drops. They describe what changed, Claude writes the doc.

1. Open issue using "Knowledge Update" template
2. Maintainer adds `knowledge-update` label after triage
3. Claude generates PR automatically
4. Maintainer reviews and merges

### 2. Pull Request (direct contribution)

Best for contributors who want to write the doc themselves.

1. Fork the repo
2. Add/edit `.md` file in `docs/community/` or `docs/custom/`
3. Submit PR
4. Maintainer reviews and merges

Both workflows are documented in the README Contributing section and in `docs/custom/How-To-Update-Quily-Knowledge.md`.

## Guardrails

### Protected folders (never modified)

- `docs/quilibrium-official/` — automated mirror of docs.quilibrium.com
- `docs/discord/` — automated Discord announcement scrapes
- `docs/transcriptions/` — curated livestream transcripts

### Allowed folders (where changes go)

- `docs/community/` — community-contributed content
- `docs/custom/` — detailed technical references

### Two layers of protection

1. **Prompt-level**: Claude is instructed to never touch protected folders
2. **Post-generation validation**: A shell step checks `git diff --name-only` and fails the workflow if any file is outside allowed directories

### Spam prevention

The issue template does **not** auto-apply the `knowledge-update` label. A maintainer must manually add it after triage, preventing untriaged issues from triggering Claude API calls.

### Duplicate prevention

The workflow checks for an existing open PR on branch `knowledge/issue-<number>` before proceeding. Re-labeling an issue doesn't create duplicate PRs.

## Authentication

Uses `claude_code_oauth_token` — an OAuth token from a Claude Pro/Max subscription. No per-token API charges.

### Setup

1. Install the Claude GitHub App: https://github.com/apps/claude
2. Generate a token locally: `claude setup-token`
3. Add as GitHub secret: `CLAUDE_CODE_OAUTH_TOKEN`

## GitHub Labels

| Label | Color | Purpose |
|-------|-------|---------|
| `knowledge-update` | Green | Triggers the pipeline when applied by maintainer |
| `needs-manual-review` | Red | Applied when pipeline fails |
| `automated` | Light blue | Marks auto-generated PRs |

## Error Handling

| Failure | Action |
|---------|--------|
| Claude API error | Comments on issue, adds `needs-manual-review` label |
| Changes outside allowed dirs | Discards changes, comments on issue, adds `needs-manual-review` |
| Duplicate PR exists | Comments linking to existing PR, skips |

## Relationship with /update-news

| | Knowledge Update Pipeline | /update-news Skill |
|---|---|---|
| **Direction** | Adds new knowledge | Marks existing knowledge as outdated |
| **Trigger** | GitHub issue + label | Manual `/update-news` command |
| **Who initiates** | Community members | Maintainer |
| **Output** | New/edited doc via PR | OUTDATED annotations in existing docs |

They work together: after merging a knowledge update PR that supersedes existing info, the PR body reminds the maintainer to run `/update-news` to annotate the outdated references.

## Reingestion

No special reingestion step needed. The existing daily sync workflow (`sync-docs.yml`, 06:00 UTC) handles ingestion of all docs including `docs/community/` and `docs/custom/`. For urgent updates, trigger the workflow manually from the Actions tab.

---

_Updated: 2026-03-19_
