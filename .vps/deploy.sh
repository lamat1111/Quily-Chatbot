#!/bin/bash
# Deploy Quily Discord bot to VPS
# Usage: .vps/deploy.sh
#
# Pulls latest code, rebuilds, and restarts the bot.

set -e

VPS_HOST="quily-vps"
BOT_DIR="/home/quily/quily-chatbot"

echo "Deploying Quily bot to $VPS_HOST..."

# Pull latest code
echo "  Pulling latest code..."
ssh "$VPS_HOST" "cd $BOT_DIR && git pull"

# Install deps and build
echo "  Installing dependencies..."
ssh "$VPS_HOST" "cd $BOT_DIR/bot && npm install"

echo "  Building..."
ssh "$VPS_HOST" "cd $BOT_DIR/bot && npm run build"

# Restart bot
echo "  Restarting bot..."
ssh "$VPS_HOST" "pm2 restart quily-bot"

# Verify
echo "  Verifying..."
sleep 2
ssh "$VPS_HOST" "pm2 status quily-bot"

echo ""
echo "Done."
echo "Check logs: ssh $VPS_HOST 'pm2 logs quily-bot --lines 20'"
