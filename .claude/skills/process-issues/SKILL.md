---
name: process-issues
description: Scan open GitHub issues for knowledge updates, triage, verify, apply changes to docs, push, reingest, and close issues. Run periodically to keep the knowledge base current from community input.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - WebSearch
  - WebFetch
  - AskUserQuestion
user-invocable: true
---

# Process Issues Skill

Scan all open GitHub issues, identify knowledge-update candidates, triage them, process approved ones into doc changes on main, push, reingest, and close issues.

## When to Use

- Periodically (e.g., daily or weekly) to process community knowledge submissions
- When you see new issues in the repo that might contain knowledge updates
- After someone mentions they filed a knowledge update issue

## Scope

This skill creates or edits files in **allowed folders only**:
- `docs/community/` — community-contributed content
- `docs/custom/` — detailed technical references

**NEVER modify** files in:
- `docs/quilibrium-official/` — automated mirror of docs.quilibrium.com
- `docs/discord/` — automated Discord announcement scrapes
- `docs/transcriptions/` — curated livestream transcripts

## Trusted Users

Claims from these users are accepted without web verification:
- `lamat1111` (repo owner)
- `CassOnMars` (Quilibrium founder)
- `winged-pegasus` (core team)

To update this list, edit this file directly.

---

<process>

<step name="fetch-issues">
**Fetch all open issues:**

Run:
```bash
gh issue list --state open --json number,title,body,author,labels,comments --limit 100
```

If no open issues, report "No open issues found" and stop.
</step>

<step name="triage">
**Triage each issue:**

Read every issue's title and body. Classify each as:

- **RELEVANT** — contains new information, corrections, or outdated info about Quilibrium or the knowledge base. This includes:
  - Issues filed via the "Knowledge Update" template (structured fields)
  - Free-form issues that happen to describe knowledge updates (e.g., "Quily says X but actually Y")
  - Issues reporting outdated information in the docs

- **SKIP** — bug reports, feature requests, code/UI changes, chatbot behavior questions, deployment issues, or anything not about documentation content

For each RELEVANT issue, note:
- Whether the author is a trusted user (skip verification)
- Whether sources are provided (affects verification need)
- Brief summary of what the update is about

Present the triage table to the user:

```
Found N open issues. Triage results:

RELEVANT:
  #9  — Hypersnap validator update (by CassOnMars, trusted — skip verify)
  #15 — QNS pricing changed (by random-user, no source — needs verification)

SKIPPED:
  #12 — Fix CSS alignment on mobile (bug report)
  #14 — Add dark mode toggle (feature request)

Approve this triage? (y/adjust)
```

Use AskUserQuestion to get approval. The user may adjust (e.g., "skip #15 too" or "include #12 actually").
</step>

<step name="process-issues">
**Process each approved issue sequentially:**

For each RELEVANT issue the user approved:

### 1. Read the full issue
Read the issue title, body, and all comments to understand the full context.

### 2. Verify claims (if needed)
- **Trusted users** (`lamat1111`, `CassOnMars`, `winged-pegasus`): skip verification entirely
- **Non-trusted users with credible source links**: trust without additional verification
- **Non-trusted users, claims seem surprising or lack sources**: use WebSearch to verify
  - Search for the specific claim
  - Check `docs/discord/` for related announcements
  - Check existing docs for contradictions
  - If unverifiable: present to user with recommendation:
    ```
    Issue #15: QNS pricing changed to 10 QUIL (by random-user)
    Could not verify this claim. No sources found.
    Recommendation: Skip and ask submitter for source.
    Action? (apply anyway / skip / ask submitter)
    ```

### 3. Determine action
- If issue references an existing file in `docs/community/` or `docs/custom/` → edit that file
- If new info with no matching existing doc → create new file in `docs/community/`
- If issue asks to change protected folders → skip, and add to a list for commenting later
- If issue contains multiple distinct topics → handle in a single commit

### 4. Propose approach
Present the proposed change to the user:

```
Issue #9: Hypersnap validator update (by CassOnMars)

Proposed: Update docs/custom/Hypersnap.md — add paragraph in Background
section about Neynar reversing course and Quilibrium soft forking.

Approve? (y/n/edit)
```

Use AskUserQuestion. If the user says "edit", ask what they'd change.

### 5. Apply the change
If approved, make the change using Edit or Write tools.

**For new files**, use this frontmatter:
```yaml
---
title: <Document Title>
source: Community Contribution (Issue #<number>)
date: <YYYY-MM-DD>
type: <technical_reference|guide|comparison|faq>
topics: [<relevant, topic, tags>]
---
```

**For existing files**, update the `date` field in the frontmatter.

### 6. Commit
```bash
git add <changed-files>
git commit -m "docs: <summary> (closes #<number>)"
```

**Do NOT comment on or close the issue yet** — wait until push succeeds in the finalize step.

Track the commit SHA and issue number for the finalize step.
</step>

<step name="handle-protected">
**Handle protected folder requests:**

For any issues that asked to change protected folders, comment on each:

```bash
gh issue comment <number> --body "These docs are automated mirrors or curated content and can't be edited through this process. For official docs changes, submit to https://github.com/QuilibriumNetwork/docs. Discord announcements and transcriptions are managed separately."
```

Close these issues.
</step>

<step name="finalize">
**Push, close issues, reingest:**

### 1. Pull and push
```bash
git pull --rebase origin main
git push origin main
```

If push fails, report the error to the user. Do NOT comment on or close any issues. Suggest manual resolution.

### 2. Close issues (only after successful push)
For each processed issue, comment and close:

```bash
gh issue comment <number> --body "Applied in commit \`<sha>\`. This will be reflected in Quily's knowledge after the next ingestion cycle."
gh issue close <number>
```

### 3. Reingest
```bash
yarn ingest:run
```

If ingestion fails, report to user: "Doc changes are pushed but reingestion failed. Run `yarn ingest:run` manually when ready."

### 4. Offer /update-news
If any of the changes superseded or contradicted existing documentation, suggest:

"Some of these changes may have made existing docs outdated. Want me to run /update-news to check?"

### 5. Print summary
```
Done. Processed N issues:
  #9  — Updated docs/custom/Hypersnap.md (commit abc1234)
  #15 — Created docs/community/QNS-Pricing.md (commit def5678)

Skipped M issues:
  #12 — Bug report (not knowledge-related)

Protected folder requests (commented and closed): K
  #20 — Asked to edit official docs

RAG reingestion: [complete / failed — run manually]
```
</step>

</process>
