---
name: vps-ops
description: VPS operations for Quily Discord bot. Use when checking bot status, restarting, deploying, viewing logs, or running any command on the VPS.
user-invocable: false
---

# VPS Operations — Quily Discord Bot

## SSH Access

```bash
ssh quily-vps 'your command here'
```

- **Host alias:** `quily-vps` (configured in `~/.ssh/config`)
- **User:** `quily`
- **Key:** `~/.ssh/id_ed25519`
- **Connection details:** See `.vps/config.local.md`

> Root access is available via `kaya-vps-root` (shared VPS with another service).

## Bot Service (pm2)

| Action | Command |
|--------|---------|
| Status | `ssh quily-vps 'pm2 status quily-bot'` |
| Start | `ssh quily-vps 'pm2 start quily-bot'` |
| Stop | `ssh quily-vps 'pm2 stop quily-bot'` |
| Restart | `ssh quily-vps 'pm2 restart quily-bot'` |
| Logs (live) | `ssh quily-vps 'pm2 logs quily-bot'` |
| Logs (last 50) | `ssh quily-vps 'pm2 logs quily-bot --lines 50'` |

## Deploy

From the local repo root:
```bash
.vps/deploy.sh
```

This pulls latest code, rebuilds, and restarts the bot.

## Key Paths (on VPS)

| What | Path |
|------|------|
| Repo root | `/home/quily/quily-chatbot/` |
| Bot source | `/home/quily/quily-chatbot/bot/src/` |
| Bot build | `/home/quily/quily-chatbot/bot/dist/index.js` |
| Env vars | `/home/quily/quily-chatbot/bot/.env` |
| pm2 logs | `~/.pm2/logs/quily-bot-*.log` |

## Common Checks

```bash
ssh quily-vps 'df -h /'           # Disk usage
ssh quily-vps 'free -h'           # Memory
ssh quily-vps 'uptime'            # Uptime
ssh quily-vps 'node --version'    # Node.js version
ssh quily-vps 'pm2 monit'        # Interactive monitor
```

## Environment

Edit env vars:
```bash
ssh quily-vps 'nano /home/quily/quily-chatbot/bot/.env'
ssh quily-vps 'pm2 restart quily-bot'    # restart to pick up changes
```

## Troubleshooting

1. Bot not responding → check `pm2 status`, then `pm2 logs --lines 50`
2. Crash loop → check `.env` exists and has valid tokens
3. Daily limit hit → `pm2 restart quily-bot` resets the in-memory counter
4. Build error → `cd bot && npm run build` and check output
