---
name: vps-push
description: "Quick-deploy to VPS only — no commit, no GitHub push. For rapid iteration during debugging or tweaking."
allowed-tools:
  - Bash
---

<objective>
Deploy current code to the VPS immediately. No commit, no GitHub push.
Use this during active debugging loops when you want to test a change fast.
</objective>

<process>

## 1. Push code and rebuild on VPS

```bash
ssh quily-vps 'cd /home/quily/quily-chatbot && git pull && cd bot && npm install && npm run build && pm2 restart quily-bot'
```

Show the full output.

If the command exits non-zero, report the error clearly.

## 2. Verify

```bash
ssh quily-vps 'pm2 status quily-bot'
```

## 3. Report

```
VPS synced.

  Note: changes are NOT committed or pushed to GitHub.
  Run /deploy when the fix is confirmed to do a full commit → push → deploy.
```

</process>
