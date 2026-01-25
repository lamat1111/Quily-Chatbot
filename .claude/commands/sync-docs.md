---
name: sync-docs
description: Sync Quilibrium docs from GitHub and update RAG knowledge base
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---

<objective>
Synchronize documentation from the Quilibrium Network GitHub repository and optionally update the RAG knowledge base. This is a one-command workflow for keeping the chatbot's knowledge up to date.
</objective>

<process>

<step name="check-status">
**Check current sync status:**

Run the sync-docs status command to see what's changed:

```bash
npm run sync-docs status
```

This will show:
- Last sync timestamp
- Number of tracked files
- Any remote changes detected
</step>

<step name="report-changes">
**Report findings to user:**

Summarize what was found:
- If no changes: "Documentation is already up to date."
- If changes exist: List new/modified/deleted files

Example output:
```
📊 Sync Status

Last sync: [timestamp]
Files tracked: [count]

📋 Remote Changes:
  📥 [N] new file(s) to add
  📝 [M] file(s) modified
  🗑️ [D] file(s) deleted remotely
  ✓ [U] file(s) unchanged
```
</step>

<step name="confirm-sync">
**If changes detected, ask user to confirm:**

Use AskUserQuestion to present options:
- **Sync & Update RAG** — Download changes and run ingestion pipeline
- **Sync Only** — Download changes without updating RAG
- **Skip** — Don't sync now

If no changes, skip to final step.
</step>

<step name="execute-sync">
**Based on user choice, execute sync:**

For "Sync & Update RAG":
```bash
npm run sync-docs sync --ingest
```

For "Sync Only":
```bash
npm run sync-docs sync
```

For "Skip":
- Inform user no changes were made
- Suggest running again later
</step>

<step name="verify-results">
**After sync, verify and report results:**

If ingestion was run, show:
- Number of documents loaded
- Number of chunks created
- Confirmation of database update

If only sync was run:
- Remind user to run `npm run ingest run` when ready to update RAG
</step>

<step name="summary">
**Provide final summary:**

```
✅ Sync Complete

- Files synced: [count]
- RAG updated: [yes/no]
- Next: [suggestion based on what happened]
```
</step>

</process>

<success_criteria>
- [ ] User sees current sync status before any action
- [ ] Changes are clearly summarized
- [ ] User confirms before any file modifications
- [ ] Sync executes without errors
- [ ] RAG ingestion runs if selected
- [ ] Clear summary of what was done
</success_criteria>

<notes>
The sync system:
- Pulls directly from GitHub (no local clone dependency)
- Uses a manifest to track sync state
- Only downloads changed files (incremental)
- Preserves your existing `./docs` folder structure
- Runs the existing ingestion pipeline for RAG updates

Source: github.com/QuilibriumNetwork/docs/docs (main branch)
Destination: ./docs
</notes>
