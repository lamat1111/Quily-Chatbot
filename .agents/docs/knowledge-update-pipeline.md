---
type: doc
title: "Knowledge Update Pipeline — Processing GitHub Issues into Docs"
description: "The /process-issues skill that triages open GitHub issues, verifies claims, applies changes to docs, and reingests into RAG"
status: done
ai_generated: true
created: 2026-03-19
updated: 2026-03-19
related_docs:
  - "update-news-skill.md"
  - "rag-knowledge-base-workflow.md"
related_tasks:
  - "2026-03-19-process-issues-skill.md"
---

# Knowledge Update Pipeline — Processing GitHub Issues into Docs

> **AI-Generated**: May contain errors. Verify before use.

## Overview

The `/process-issues` skill scans all open GitHub issues, identifies knowledge-update candidates (regardless of how they were filed), triages them, verifies claims when needed, and applies approved changes directly to the docs on main. It then pushes, reingests into the RAG database, and closes the processed issues.

This complements the `/update-news` skill: `/process-issues` **adds** new knowledge, while `/update-news` **marks existing knowledge as outdated**.

## How It Works

```
Run /process-issues
        │
        ▼
Fetch all open issues via gh CLI
        │
        ▼
Triage: classify each as knowledge-update or skip
(handles both template and free-form issues)
        │
        ▼
Present triage summary — user approves/adjusts
        │
        ▼
For each approved issue:
  ├─ Verify claims (web search if needed, skip for trusted users)
  ├─ Propose approach — user approves/refuses
  ├─ Apply change to docs/community/ or docs/custom/
  └─ Commit on main
        │
        ▼
git pull --rebase && git push
        │
        ▼
Comment on issues with commit SHA, close them
        │
        ▼
yarn ingest:run (reingest into RAG)
        │
        ▼
Offer to run /update-news if changes supersede existing docs
```

## Key Files

| File | Purpose |
|------|---------|
| `.claude/skills/process-issues/SKILL.md` | The skill definition |
| `.github/ISSUE_TEMPLATE/knowledge-update.yml` | Structured issue template for submissions |
| `docs/custom/How-To-Update-Quily-Knowledge.md` | Doc so Quily can answer "how do I update your info?" |

## Two Contribution Workflows

Community members can contribute knowledge in two ways:

### 1. GitHub Issue (lower friction)

Best for non-technical users or quick info drops. They describe what changed, the maintainer runs `/process-issues` to apply it.

1. Open issue (using "Knowledge Update" template or free-form)
2. Maintainer runs `/process-issues` periodically
3. Skill triages, verifies, proposes approach
4. Maintainer approves — changes are committed, pushed, and reingested

### 2. Pull Request (direct contribution)

Best for contributors who want to write the doc themselves.

1. Fork the repo
2. Add/edit `.md` file in `docs/community/` or `docs/custom/`
3. Submit PR
4. Maintainer reviews and merges

Both workflows are documented in the README Contributing section and in `docs/custom/How-To-Update-Quily-Knowledge.md`.

## Trusted Users

Claims from these users skip web verification:

- `lamat1111` (repo owner)
- `CassOnMars` (Quilibrium founder)
- `winged-pegasus` (core team)

## Guardrails

### Protected folders (never modified)

- `docs/quilibrium-official/` — automated mirror of docs.quilibrium.com
- `docs/discord/` — automated Discord announcement scrapes
- `docs/transcriptions/` — curated livestream transcripts

### Allowed folders

- `docs/community/` — community-contributed content
- `docs/custom/` — detailed technical references

### Verification

- Trusted user claims: accepted without verification
- Non-trusted with credible links: accepted
- Non-trusted, surprising/unsourced claims: web searched for corroboration
- Unverifiable claims: flagged to maintainer with recommendation

## GitHub Labels

| Label | Color | Purpose |
|-------|-------|---------|
| `knowledge-update` | Green | Optional — community members can use the template which is associated with this label |
| `needs-manual-review` | Red | Applied when an issue needs manual attention |

## Relationship with /update-news

| | /process-issues | /update-news |
|---|---|---|
| **Direction** | Adds new knowledge | Marks existing knowledge as outdated |
| **Trigger** | `/process-issues` command | `/update-news` command |
| **Input** | GitHub issues | Maintainer describes what changed |
| **Output** | New/edited docs, committed and pushed | OUTDATED annotations in existing docs |

They work together: after `/process-issues` applies a change that supersedes existing info, it offers to run `/update-news` to annotate the outdated references.

## Reingestion

`/process-issues` runs `yarn ingest:run` automatically after pushing changes. No manual reingestion needed.

---

_Updated: 2026-03-19_
