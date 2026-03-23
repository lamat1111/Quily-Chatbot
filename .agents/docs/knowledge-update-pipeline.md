---
type: doc
title: "Knowledge Update Pipeline — Auto-Correction & Issue Processing"
description: "Auto-correction flow (Discord & web chat), deterministic issue creation, and the /process-issues skill for applying changes to docs"
status: done
ai_generated: true
created: 2026-03-19
updated: 2026-03-21
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
  ├─ Apply change to docs/custom/
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

## Auto-Correction Flow (Discord & Web Chat)

Users can correct Quily directly in Discord or the web chat UI. The correction flow is **deterministic** — it does not rely on the LLM to call tools reliably.

### How It Works

```
User says something is wrong ("wrong", "that's incorrect", etc.)
        │
        ▼
Quily re-examines sources, acknowledges the error
Asks: "If you know the right answer, tell me and I'll open an issue"
        │
        ▼
User provides correction details
        │
        ▼
Server-side deterministic check:
  1. Was bot's previous message asking for correction? (pattern match)
  2. Is user's message NOT vague? (not just "wrong")
  → YES: skip the model, create GitHub issue automatically
        │
        ▼
Issue created with labels: knowledge-update, auto-reported
Contains: original question, Quily's wrong answer, user's correction
```

### Key Design Decision: Deterministic > Model-Dependent

Open-source models (DeepSeek, Qwen, etc.) unreliably handle structured tool calling — they often output tool calls as garbage text instead of using the proper protocol. Rather than relying on the model to decide when to create issues, the server enforces behavior deterministically:

- **Vague corrections blocked**: "wrong", "incorrect", "nope" → model asked to request details, issue creation blocked server-side via regex
- **Correction turn short-circuited**: When the bot's previous message contains "I'll open an issue" and the user provides details, the model is **skipped entirely** — the server writes "Got it, thanks for the correction!" and creates the issue
- **Reply chain walking (Discord)**: On Discord, the bot walks the reply chain up to 10 hops to find the original wrong answer, even when a different user corrects the bot

### Files Involved

| File | Purpose |
|------|---------|
| `bot/src/handlers/mention.ts` | Discord: reply chain walking, tool call handling |
| `app/api/chat/route.ts` | Web UI: deterministic short-circuit, issue creation |
| `bot/src/utils/githubIssues.ts` | GitHub issue creation (shared) |
| `src/lib/rag/prompt.ts` | System prompt: 3-scenario correction instructions |
| `src/lib/rag/personality.ts` | Personality examples for correction responses |
| `src/lib/rag/tools.ts` | Tool definition for `create_knowledge_issue` |
| `src/components/chat/MessageBubble.tsx` | Frontend: correction issue notification + garbage text stripping |

### Discord vs Web UI Differences

| | Discord | Web UI |
|---|---|---|
| **Context source** | Reply chain (walks Discord messages) | Conversation history (in request body) |
| **Tool calling** | `generateText()` with tools (more reliable) | Deterministic short-circuit (model skipped) |
| **Issue creation** | `mention.ts` handles after `processQuery()` | `route.ts` handles in streaming pipeline |
| **Rate limiting** | Per-user daily limits (role-aware) | No rate limiting yet |
| **Reporter name** | Discord username | "Web UI user" |

## Three Contribution Workflows

Community members can contribute knowledge in three ways:

### 1. Auto-correction (lowest friction)

Best for Discord/web chat users who spot errors in real-time.

1. User tells Quily "that's wrong" in Discord or web chat
2. Quily asks for the correct information
3. User provides the correction → GitHub issue auto-created
4. Maintainer runs `/process-issues` to apply it

### 2. GitHub Issue (manual)

Best for non-technical users or quick info drops. They describe what changed, the maintainer runs `/process-issues` to apply it.

1. Open issue (using "Knowledge Update" template or free-form)
2. Maintainer runs `/process-issues` periodically
3. Skill triages, verifies, proposes approach
4. Maintainer approves — changes are committed, pushed, and reingested

### 3. Pull Request (direct contribution)

Best for contributors who want to write the doc themselves.

1. Fork the repo
2. Add/edit `.md` file in `docs/custom/`
3. Submit PR
4. Maintainer reviews and merges

All workflows are documented in the README Contributing section and in `docs/custom/How-To-Update-Quily-Knowledge.md`.

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

- `docs/custom/` — community-contributed content and detailed technical references

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

_Updated: 2026-03-21_
