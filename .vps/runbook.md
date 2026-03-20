# VPS Runbook — Quily Discord Bot

> "Bot died. Go." — this doc gets the Quily Discord bot back online.

**VPS:** Hetzner CAX11 (aarch64) — see `config.local.md` for IP
**OS user:** `quily`
**SSH alias:** `quily-vps` (configured in `~/.ssh/config`)
**Target state:** Fresh Ubuntu 24.04 → Quily bot online in Discord

---

## Quick Reference

| Thing | Value |
|---|---|
| SSH alias | `quily-vps` |
| SSH user | `quily` |
| SSH key | `~/.ssh/id_ed25519` |
| Bot code | `/home/quily/quily-chatbot/bot/` |
| Bot entry | `node /home/quily/quily-chatbot/bot/dist/index.js` |
| Process manager | pm2 |
| Env vars | `/home/quily/quily-chatbot/bot/.env` |
| Logs | `pm2 logs quily-bot` |

---

## Common Tasks Cheat Sheet

| Task | Command |
|---|---|
| Log into VPS | `ssh quily-vps` |
| Edit env vars | `ssh quily-vps 'nano ~/quily-chatbot/bot/.env'` |
| Restart bot | `ssh quily-vps 'pm2 restart quily-bot'` |
| Check status | `ssh quily-vps 'pm2 status quily-bot'` |
| View logs | `ssh quily-vps 'pm2 logs quily-bot --lines 30'` |
| Switch provider | Edit `.env` → change `BOT_LLM_PROVIDER` → restart bot (see [Switching LLM Provider](#switching-llm-provider)) |

---

## Step 1 — Create the `quily` User

> Skip if account already exists.

SSH in as root and create the user:

```bash
ssh kaya-vps-root '
useradd -m -s /bin/bash quily
mkdir -p /home/quily/.ssh
cp /root/.ssh/authorized_keys /home/quily/.ssh/authorized_keys
chown -R quily:quily /home/quily/.ssh
chmod 700 /home/quily/.ssh
chmod 600 /home/quily/.ssh/authorized_keys
'
```

Verify: `ssh quily-vps 'whoami'` → should return `quily`

---

## Step 2 — Install Node.js 22

```bash
ssh kaya-vps-root '
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
'
```

> Node.js is installed system-wide, shared with the `kaya` user. If already installed, skip this step.

Verify: `ssh quily-vps 'node --version'` → expect v22.x

---

## Step 3 — Install pm2 (Process Manager)

```bash
ssh quily-vps 'npm install -g pm2'
```

Verify: `ssh quily-vps 'pm2 --version'`

---

## Step 4 — Clone the Repo

```bash
ssh quily-vps '
git clone https://github.com/Quilibrium-Community/quily.git /home/quily/quily-chatbot
'
```

> The repo is public, no auth needed.

---

## Step 5 — Install Dependencies & Build

```bash
ssh quily-vps '
cd /home/quily/quily-chatbot/bot
npm install
npm run build
'
```

Verify: `ssh quily-vps 'ls /home/quily/quily-chatbot/bot/dist/index.js'`

---

## Step 6 — Create .env File

```bash
ssh quily-vps 'cat > /home/quily/quily-chatbot/bot/.env << EOF
# Discord
DISCORD_BOT_TOKEN=<paste>
DISCORD_CLIENT_ID=<paste>

# LLM Provider — "openrouter" or "chutes" (default: openrouter)
BOT_LLM_PROVIDER=openrouter

# OpenRouter (required if BOT_LLM_PROVIDER=openrouter)
OPENROUTER_API_KEY=<paste>

# Chutes (required if BOT_LLM_PROVIDER=chutes)
CHUTES_API_KEY=<paste>

# Supabase (RAG vector store)
NEXT_PUBLIC_SUPABASE_URL=<paste>
SUPABASE_SERVICE_ROLE_KEY=<paste>

# Reranking
COHERE_API_KEY=<paste>

# Embeddings (Cloudflare Workers AI)
CLOUDFLARE_ACCOUNT_ID=<paste>
CLOUDFLARE_API_TOKEN=<paste>

# Bot config (optional — defaults are sensible)
# BOT_MODEL=deepseek/deepseek-chat-v3-0324
# BOT_FALLBACK_MODELS=qwen/qwen3-32b,mistralai/mistral-small-3.2-24b-instruct
# DISCORD_DAILY_LIMIT=200
# MAX_MESSAGE_LENGTH=2000
EOF
chmod 600 /home/quily/quily-chatbot/bot/.env'
```

> Get values from the web app's `.env` (Supabase, Cohere, Cloudflare) and Discord Developer Portal (token, client ID). Use a **dedicated** OpenRouter API key with a monthly spending cap.

---

## Step 7 — Start the Bot with pm2

```bash
ssh quily-vps '
cd /home/quily/quily-chatbot/bot
pm2 start dist/index.js --name quily-bot
pm2 save
pm2 startup | tail -1
'
```

The last command outputs a `sudo` command — copy it and run it as root:
```bash
ssh kaya-vps-root '<paste the sudo command from pm2 startup>'
```

This ensures pm2 starts on boot and restores the bot process.

Verify: `ssh quily-vps 'pm2 status quily-bot'` → should show `online`

---

## Step 8 — Verify Bot is Working

```bash
ssh quily-vps 'pm2 logs quily-bot --lines 20'
```

Expected output:
```
Bot ready! Logged in as Quily#1234 — 1 guild(s)
```

Then @mention the bot in Discord to test a response.

---

## Deploying Updates

Use the deploy script from your local machine:

```bash
cd d:/GitHub/Quilibrium/quily-chatbot
.vps/deploy.sh
```

Or manually:
```bash
ssh quily-vps '
cd /home/quily/quily-chatbot
git pull
cd bot
npm install
npm run build
pm2 restart quily-bot
'
```

---

## Switching LLM Provider

The bot supports two LLM providers: **OpenRouter** and **Chutes**. To switch:

1. SSH into the VPS and edit the `.env`:
   ```bash
   ssh quily-vps 'nano /home/quily/quily-chatbot/bot/.env'
   ```
2. Change `BOT_LLM_PROVIDER=openrouter` to `BOT_LLM_PROVIDER=chutes` (or vice versa)
3. Make sure the corresponding API key is set (`CHUTES_API_KEY` or `OPENROUTER_API_KEY`)
4. Restart the bot — env changes are only read at startup:
   ```bash
   ssh quily-vps 'pm2 restart quily-bot'
   ```

Each provider uses its own default models and fallback chain automatically. You can override with `BOT_MODEL` and `BOT_FALLBACK_MODELS` if needed.

| Provider | Default Model | Fallbacks |
|---|---|---|
| `openrouter` | DeepSeek V3-0324 | Qwen3-32B, Mistral Small 3.2 |
| `chutes` | DeepSeek V3.1 (TEE) | Qwen3-32B, Mistral Small 3.2 |

---

## Disaster Recovery

If the VPS is completely wiped, follow Steps 1-8 sequentially. The only thing not in the repo is the `.env` file — keep those values in a password manager.

---

*Created: 2026-03-18 | Updated: 2026-03-18*
