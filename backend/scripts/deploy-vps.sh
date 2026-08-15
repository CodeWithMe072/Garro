#!/usr/bin/env bash

# =========================================================================
# Garro Backend VPS Automated Deployment Script
# Run this script on your Linux VPS to update code, install packages, and reload PM2
# Usage: ./scripts/deploy-vps.sh
# =========================================================================

set -e

echo "🚀 Starting Garro Backend VPS Deployment..."

# 1. Pull latest changes from git
echo "📥 Pulling latest code from Git..."
git pull origin main

# 2. Install production dependencies
echo "📦 Installing production npm packages..."
npm ci --only=production

# 3. Create logs directory if missing
mkdir -p logs

# 4. Check if PM2 is installed globally
if ! command -v pm2 &> /dev/null; then
    echo "⚠️ PM2 not found globally. Installing PM2..."
    sudo npm install -g pm2
fi

# 5. Start or Reload PM2 cluster gracefully
echo "🔄 Reloading PM2 process cluster..."
if pm2 list | grep -q "garro-backend"; then
    pm2 reload ecosystem.config.cjs --env production
else
    pm2 start ecosystem.config.cjs --env production
fi

# 6. Save PM2 state for automatic reboot persistence
pm2 save

echo "✅ Garro Backend successfully deployed & running in production!"
pm2 status garro-backend
