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
- `docs/custom/` — community-contributed content and detailed technical references

**NEVER modify** files in:
- `docs/quilibrium-official/` — automated mirror of docs.quilibrium.com
- `docs/discord/` — automated Discord announcement scrapes
- `docs/transcriptions/` — curated livestream transcripts

## Trusted Users

Claims from these users are accepted without web verification (but conflict detection still applies — see step 3):
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

<step name="detect-duplicates">
**Detect duplicate issues:**

Before triaging, scan all issue titles and bodies for overlapping topics. Two issues are duplicates if they describe the same correction or the same topic area.

For each duplicate group:
- Identify the **most detailed** issue (longest body, has sources, has specific claims)
- Mark the others as duplicates in the triage table
- During finalize, close duplicates with: "This appears to be addressed by #N. Closing as duplicate."

Present duplicates in the triage table so the user can override if needed.
</step>

<step name="triage">
**Triage each issue:**

Read every issue's title and body. Classify each as:

- **RELEVANT** — contains new information, corrections, or outdated info about Quilibrium or the knowledge base. This includes:
  - Issues filed via the "Knowledge Update" template (structured fields)
  - Free-form issues that happen to describe knowledge updates (e.g., "Quily says X but actually Y")
  - Issues reporting outdated information in the docs

- **INVESTIGATE** — the user flagged a bot reply as wrong or inaccurate but did NOT provide a correction or detailed explanation. These are still valuable signals. The bot's original answer should be checked against the docs to determine if a correction is needed. This includes:
  - Issues like "this is wrong" or "the bot got this wrong" without specifying what the correct answer is
  - Issues where the user disagreed with the bot but didn't elaborate
  - Vague complaints about bot accuracy on a specific topic
  - Issues filed via the Discord bot's report feature that contain the bot's reply but no user-provided correction

  **Default to INVESTIGATE over SKIP when in doubt.** Even a low-effort issue is a useful starting point to audit the bot's answer. Only skip issues that are clearly unrelated to knowledge accuracy.

- **ACTIONABLE (non-knowledge)** — issues that are valid but not about knowledge accuracy. These still need resolution, just not through doc changes. Examples:
  - Code bug reports (CSS, UI, deployment issues) → convert to `.agents/tasks/` task or link to existing task
  - Feature requests for the chatbot or website → convert to `.agents/tasks/` task or link to existing task
  - Issues about chatbot behavior/UX (not answer correctness) → convert to task

  For each of these, check if an existing task in `.agents/tasks/` already covers it. If so, comment linking to it and close. If not, create a new task or ask the user.

- **DUPLICATE** — already covered by a more detailed issue (detected in previous step). Note which issue supersedes it.

- **SKIP** — ONLY for issues that cannot be acted on at all:
  - Gibberish or spam
  - Issues with zero actionable content even after reading comments

For each RELEVANT issue, note:
- Whether the author is a trusted user (lightweight verification only)
- Whether sources are provided (affects verification need)
- Brief summary of what the update is about

For each INVESTIGATE issue, note:
- The original bot reply (if included in the issue)
- The topic/question the user was asking about
- Brief summary of what needs to be checked

Present the triage table to the user:

```
Found N open issues. Triage results:

RELEVANT (have corrections/new info):
  #9  — Hypersnap validator update (by CassOnMars, trusted — lightweight verify)
  #15 — QNS pricing changed (by random-user, no source — needs verification)

INVESTIGATE (bot accuracy flagged, needs checking):
  #18 — User says staking answer was wrong (no correction given — will audit bot reply)
  #21 — "This is incorrect" on tokenomics question (will check docs)

DUPLICATES:
  #25 — Same topic as #15 (less detail) — will close as duplicate

ACTIONABLE (non-knowledge):
  #12 — Fix CSS alignment on mobile (bug report → task)
  #14 — Add dark mode toggle (feature request → task)

SKIPPED:
  #30 — Empty issue body, no comments

Approve this triage? (y/adjust)
```

Use AskUserQuestion to get approval. The user may adjust (e.g., "skip #15 too" or "include #12 actually").
</step>

<step name="process-issues">
**Process each approved issue sequentially — ALL doc changes before any push/close:**

**Critical rule**: Every issue must be fully resolved (doc created/edited and committed, OR follow-up comment prepared) before moving to the finalize step. Do NOT push, close, or reingest until ALL issues are processed. The finalize step handles push + close + reingest as a single batch.

Process RELEVANT and INVESTIGATE issues differently:

---

### Processing INVESTIGATE issues

For issues where the user flagged the bot as wrong but didn't provide a correction:

#### 1. Extract the bot's original reply
Read the issue body and comments. The bot's reply is usually quoted in the issue (especially for Discord bot reports). Identify:
- What question the user asked
- What the bot answered
- What the user objected to (if anything specific)

#### 2. Audit the bot's answer — structured decision matrix

Follow this structured process instead of ad-hoc investigation:

**Step A — Extract the bot's specific claim(s).** Identify the concrete factual statements (e.g., "minimum stake is 50,000 QUIL").

**Step B — Search docs for each claim:**
```
Grep docs/ for key terms from the claim
```

**Step C — Determine scenario based on results:**

| Docs found? | Docs agree with bot? | Web search result | → Scenario |
|-------------|---------------------|-------------------|------------|
| Yes | Yes (docs support bot) | — | **C** — Bot was right |
| Yes | No (docs contradict bot) | — | **B** — Bot misread docs, investigate why |
| No | — | Web supports user's objection | **A** — Doc gap, create doc |
| No | — | Web supports bot | **C** — Bot was right, consider adding doc |
| No | — | Inconclusive | **D** — Ask submitter for details |

**Scenario A: Doc gap causing hallucination**
- **Required action**: Create or update a doc in `docs/custom/` with accurate information from official docs, transcripts, Discord announcements, or web search.
- If only minimal info exists, create a short doc stating what IS known and explicitly noting what is NOT yet documented.
- Present the proposed doc to the user for approval before creating it.

**Scenario B: Bot answer was wrong, docs need updating**
- **Required action**: Edit the relevant doc(s) to correct the information.
- Follow the same Apply/Commit workflow as RELEVANT issues below.

**Scenario C: Bot answer was correct**
- **Required action**: Close with a comment explaining the bot's answer was verified correct against the documentation.

**Scenario D: Cannot determine correctness**
- **Required action**: Comment on the issue asking the submitter for more details/sources. Do NOT close — leave open for follow-up.

Present findings to the user with the scenario and proposed action:
```
Issue #18: User flagged bot answer about staking as wrong

Bot said: "You need minimum 50,000 QUIL to stake"
Docs say: docs/custom/staking-guide.md mentions 50,000 QUIL minimum
Web search: Recent Discord announcement says minimum was lowered to 10,000 QUIL

Scenario B: Bot answer outdated, docs need updating.
Proposed: Update docs/custom/staking-guide.md with new 10,000 QUIL minimum.
Approve? (y/n/edit)
```

#### 3. Apply the resolution
For Scenarios A and B, follow the same Apply/Commit workflow as RELEVANT issues below.
For Scenario C, prepare the closing comment (applied in finalize step).
For Scenario D, prepare the follow-up comment (applied in finalize step).

---

### Processing RELEVANT issues

For each RELEVANT issue the user approved:

### 1. Read the full issue
Read the issue title, body, and all comments to understand the full context.

### 2. Verify claims (if needed)
- **Trusted users** (`lamat1111`, `CassOnMars`, `winged-pegasus`): skip web verification, but still run conflict detection (step 3)
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

### 3. Conflict detection (REQUIRED — applies to ALL issues, including trusted users)

Before applying any change, check if the proposed correction contradicts existing docs:

```
Grep docs/ for the key claims being corrected (e.g., the old value being replaced)
```

If contradicting statements are found in other docs:
```
⚠️ Conflict detected:
  - docs/custom/staking-guide.md line 42: "minimum stake is 50,000 QUIL"
  - docs/custom/Node-Running-Guide.md line 18: "you need at least 50,000 QUIL"
  - Issue #15 says: "minimum is now 10,000 QUIL"

This correction would need to update 2 docs. Both will be updated if you approve.
Approve? (y/n/skip)
```

**Even for trusted users**: If a trusted user's correction contradicts 2+ existing docs, flag it. Trust the user more, but surface the conflict so the human can decide.

### 4. Scope check

Before proceeding, check the scope of the proposed change:

- **4+ files affected**: Warn the user: "This issue would touch N files. Proceeding — just flagging the scope."
- **>50% of a doc rewritten**: Warn the user: "This would rewrite most of `<filename>`. Proceeding — just flagging."
- **Frontmatter `type` or `topics` changed**: Warn the user: "This changes metadata that affects RAG retrieval. Proceeding — just flagging."

These are warnings, not blockers. The user can always proceed.

### 5. Determine action
- If issue references an existing file in `docs/custom/` → edit that file
- If new info with no matching existing doc → create new file in `docs/custom/`
- If issue asks to change protected folders → skip, and add to a list for commenting later
- If issue contains multiple distinct topics → handle in a single commit
- If conflict detection found other docs with contradicting info → update ALL affected docs, not just the one the issue mentions

### 6. Propose approach
Present the proposed change to the user:

```
Issue #9: Hypersnap validator update (by CassOnMars)

Proposed: Update docs/custom/Hypersnap.md — add paragraph in Background
section about Neynar reversing course and Quilibrium soft forking.

Conflicts: None
Scope: 1 file, minor edit

Approve? (y/n/edit)
```

Use AskUserQuestion. If the user says "edit", ask what they'd change.

### 7. Apply the change
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

### 8. Commit
```bash
git add <changed-files>
git commit -m "docs: <summary> (closes #<number>)"
```

**Do NOT comment on or close the issue yet** — wait until push succeeds in the finalize step.

Track the commit SHA, issue number, files changed, and confidence level for the summary.
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

For each duplicate issue, comment and close:

```bash
gh issue comment <number> --body "This appears to be addressed by #<superseding-issue>. Closing as duplicate."
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

Print a detailed summary with rollback instructions:

```
Done. Processed N issues:

  ✅ #9  — Updated docs/custom/Hypersnap.md (commit abc1234)
           Confidence: HIGH | Conflicts: none | Scope: 1 file
           Rollback: git revert abc1234

  ✅ #15 — Created docs/custom/QNS-Pricing.md (commit def5678)
           Confidence: HIGH | Conflicts: updated 2 other docs | Scope: 3 files
           Rollback: git revert def5678

Investigated I issues:
  ✅ #18 — Scenario B: docs outdated, updated staking-guide.md (commit ghi9012)
           Confidence: MEDIUM (web source only) | Rollback: git revert ghi9012
  ✅ #21 — Scenario C: bot answer verified correct, closed

Duplicates closed: D
  #25 — Duplicate of #15

Actionable (non-knowledge): A
  #12 — Created .agents/tasks/css-mobile-fix.md

Skipped: S
  #30 — Empty issue

Protected folder requests (commented and closed): K
  #20 — Asked to edit official docs

RAG reingestion: [complete / failed — run manually]
```
</step>

</process>
