---
name: deploy
description: "Commit all changes, push to GitHub, and deploy the bot to the VPS in one step. Uses /commit-all for the commit, then pushes and deploys."
argument-hint: "[optional commit message hint]"
allowed-tools:
  - Bash
  - Agent
  - Read
  - Edit
  - Glob
  - Grep
---

<objective>
Ship changes: commit → push → deploy bot to VPS, in that order.
</objective>

<process>

## 1. Sanity check — anything to do?

Run in parallel:
```bash
git status --short
git log @{u}.. --oneline 2>/dev/null || echo "(no upstream)"
```

If the working tree is clean AND there are no unpushed commits, report:
> "Nothing to deploy — working tree is clean and up to date with remote."
And stop.

## 2. Commit (if there are uncommitted changes)

If `git status --short` shows any changes, run `/commit-all` (passing $ARGUMENTS as a hint if provided).

If the working tree is already clean but there are unpushed commits, skip straight to push.

## 3. Push to GitHub

```bash
git push
```

If push fails due to diverged history, do NOT force push. Report the conflict and stop — let the user resolve it.

## 4. Deploy to VPS

```bash
ssh quily-vps 'cd /home/quily/quily-chatbot && git pull && cd bot && npm install && npm run build && pm2 restart quily-bot'
```

Show the full output. If the command exits non-zero, report the error clearly and note that the commit+push already succeeded — the repo is ahead of the VPS.

## 5. Report

```
Deployed.

  Commit: <git log -1 --oneline>
  Remote: pushed
  VPS:    bot restarted
```

If anything failed partway, state exactly what succeeded and what didn't.

</process>
