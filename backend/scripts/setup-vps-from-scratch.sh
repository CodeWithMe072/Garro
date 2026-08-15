#!/usr/bin/env bash

# =========================================================================
# Garro Backend — Master VPS Installation Script (From Scratch)
# Tested on Ubuntu 22.04 / 24.04 LTS
# Usage: Run on a fresh Ubuntu VPS as root or with sudo:
#        chmod +x setup-vps-from-scratch.sh && ./setup-vps-from-scratch.sh
# =========================================================================

set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}   🚀 GARRO BACKEND — COMPLETE VPS SETUP FROM SCRATCH ${NC}"
echo -e "${CYAN}====================================================${NC}"

# Check if running as root or sudo
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Please run this script with sudo or as root.${NC}"
  exit 1
fi

# 1. Update system packages
echo -e "\n${YELLOW}[1/7] Updating system package list...${NC}"
apt update && apt upgrade -y
apt install -y curl wget git build-essential ufw software-properties-common gnupg unzip

# 2. Configure UFW Firewall
echo -e "\n${YELLOW}[2/7] Configuring UFW Firewall...${NC}"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo -e "${GREEN}✓ Firewall configured (Ports 22, 80, 443 open)${NC}"

# 3. Install Node.js 20 LTS & PM2
echo -e "\n${YELLOW}[3/7] Installing Node.js 20 LTS & PM2...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
pm2 startup systemd -u root --hp /root || true
echo -e "${GREEN}✓ Node.js $(node -v) and PM2 $(pm2 -v) installed successfully!${NC}"

# 4. Install MongoDB 7.0 Community Edition
echo -e "\n${YELLOW}[4/7] Installing MongoDB 7.0...${NC}"
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org
systemctl daemon-reload
systemctl enable mongod
systemctl restart mongod
echo -e "${GREEN}✓ MongoDB 7.0 installed and running locally!${NC}"

# 5. Install Nginx & Certbot SSL
echo -e "\n${YELLOW}[5/7] Installing Nginx & Certbot SSL...${NC}"
apt install -y nginx certbot python3-certbot-nginx
systemctl enable nginx
systemctl restart nginx
echo -e "${GREEN}✓ Nginx and Certbot SSL installed!${NC}"

# 6. Create Application Directory Structure
echo -e "\n${YELLOW}[6/7] Preparing application directory...${NC}"
mkdir -p /var/www/garro
mkdir -p /var/www/garro/logs

echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}   🎉 ALL PREREQUISITES INSTALLED FROM SCRATCH!     ${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "${CYAN}Follow these final 3 steps to launch your backend live:${NC}\n"

echo -e "${YELLOW}Step A: Clone your backend repository into /var/www/garro${NC}"
echo -e "   cd /var/www/garro"
echo -e "   git clone <YOUR_REPO_URL> ."
echo -e "   cd backend && npm ci --only=production\n"

echo -e "${YELLOW}Step B: Create your production environment file${NC}"
echo -e "   cp .env.production.example .env"
echo -e "   nano .env  (Fill in MONGO_URI, JWT_SECRET, STRIPE_SECRET_KEY, etc.)\n"

echo -e "${YELLOW}Step C: Start backend with PM2 & Configure Nginx SSL${NC}"
echo -e "   pm2 start ecosystem.config.cjs --env production"
echo -e "   pm2 save"
echo -e "   cp nginx.conf.example /etc/nginx/sites-available/garro-api"
echo -e "   ln -s /etc/nginx/sites-available/garro-api /etc/nginx/sites-enabled/"
echo -e "   sudo certbot --nginx -d YOUR_DOMAIN.com"
echo -e "   sudo systemctl reload nginx\n"
