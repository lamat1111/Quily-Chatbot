# VPS Cheatsheet — Quily Discord Bot

## Connect

```bash
ssh quily-vps
```

---

## Bot Management (pm2)

| Action | Command |
|--------|---------|
| Status | `ssh quily-vps 'pm2 status quily-bot'` |
| Start | `ssh quily-vps 'pm2 start quily-bot'` |
| Stop | `ssh quily-vps 'pm2 stop quily-bot'` |
| Restart | `ssh quily-vps 'pm2 restart quily-bot'` |
| Logs (live) | `ssh quily-vps 'pm2 logs quily-bot'` |
| Logs (last 50) | `ssh quily-vps 'pm2 logs quily-bot --lines 50'` |
| Reload (zero-downtime) | `ssh quily-vps 'pm2 reload quily-bot'` |

---

## Deploy Updates

From your local machine:
```bash
.vps/deploy.sh
```

Manual deploy:
```bash
ssh quily-vps 'cd /home/quily/quily-chatbot && git pull && cd bot && npm install && npm run build && pm2 restart quily-bot'
```

---

## Key Paths (on VPS)

| What | Path |
|------|------|
| Repo root | `/home/quily/quily-chatbot/` |
| Bot source | `/home/quily/quily-chatbot/bot/src/` |
| Bot build | `/home/quily/quily-chatbot/bot/dist/index.js` |
| Env vars | `/home/quily/quily-chatbot/bot/.env` |
| pm2 logs | `~/.pm2/logs/quily-bot-*.log` |

---

## Environment Variables

Edit on VPS:
```bash
ssh quily-vps 'nano /home/quily/quily-chatbot/bot/.env'
```

After editing, restart:
```bash
ssh quily-vps 'pm2 restart quily-bot'
```

---

## System Checks

```bash
ssh quily-vps 'df -h /'           # Disk usage
ssh quily-vps 'free -h'           # Memory
ssh quily-vps 'uptime'            # Uptime
ssh quily-vps 'pm2 monit'         # Interactive monitor (q to exit)
```

---

## Troubleshooting

### Bot not responding in Discord
1. Check if running: `ssh quily-vps 'pm2 status quily-bot'`
2. Check logs for errors: `ssh quily-vps 'pm2 logs quily-bot --lines 50'`
3. Restart: `ssh quily-vps 'pm2 restart quily-bot'`
4. Check .env exists: `ssh quily-vps 'ls -la /home/quily/quily-chatbot/bot/.env'`

### Bot crashes on start
1. Check Node version: `ssh quily-vps 'node --version'` (needs v22+)
2. Check build: `ssh quily-vps 'ls /home/quily/quily-chatbot/bot/dist/index.js'`
3. Rebuild: `ssh quily-vps 'cd /home/quily/quily-chatbot/bot && npm run build'`

### Daily limit reached
Reset manually: `ssh quily-vps 'pm2 restart quily-bot'` (restarts the counter since it's in-memory)

---

*Created: 2026-03-18*
