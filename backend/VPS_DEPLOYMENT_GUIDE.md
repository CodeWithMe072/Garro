# 🚀 Garro Backend — Linux VPS Deployment Guide

Step-by-step instructions for deploying the **Garro Backend** on a Linux VPS (Ubuntu 22.04 / 24.04 LTS) using **Node.js**, **PM2**, **MongoDB**, **Nginx Reverse Proxy**, **Let's Encrypt SSL**, and **UFW Firewall**.

---

## 📋 Prerequisites

- A VPS (Hostinger, DigitalOcean, Hetzner, AWS EC2, Vultr, etc.) running **Ubuntu 22.04 / 24.04**.
## ⚡ Quick Start: Automated Setup in 1 Command

On a fresh Ubuntu 22.04 / 24.04 VPS server, you can run the master setup script to install **Node.js 20**, **PM2**, **MongoDB 7.0**, **Nginx**, **UFW Firewall**, and **Certbot SSL** automatically:

```bash
# 1. Download & run the master installation script
curl -fsSL https://raw.githubusercontent.com/<YOUR_USER>/<YOUR_REPO>/main/backend/scripts/setup-vps-from-scratch.sh | sudo bash
```

Or execute manually step-by-step below:

---

## 🛠️ Step 1: Initial VPS Setup & Firewall

1. **Connect to your VPS via SSH**:
   ```bash
   ssh root@YOUR_VPS_IP
   ```

2. **Update system packages**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Configure UFW Firewall**:
   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

---

## 🟢 Step 2: Install Node.js 20 & PM2

1. **Install Node.js 20 LTS**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs git build-essential
   ```

2. **Install PM2 globally**:
   ```bash
   sudo npm install -g pm2
   ```

3. **Enable PM2 automatic startup on system reboot**:
   ```bash
   pm2 startup
   # Copy and run the command printed by pm2 startup (e.g. env PATH=... pm2 startup systemd ...)
   ```

---

## 🍃 Step 3: Install MongoDB 7.0 (Local Database)

*(Skip if using MongoDB Atlas cloud cluster)*

1. **Import MongoDB public key & add repository**:
   ```bash
   sudo apt install -y curl gnupg
   curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
   echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   ```

2. **Install and start MongoDB**:
   ```bash
   sudo apt update
   sudo apt install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

---

## 📂 Step 4: Clone & Configure Garro Backend

1. **Create application folder**:
   ```bash
   sudo mkdir -p /var/www/garro
   sudo chown -R $USER:$USER /var/www/garro
   cd /var/www/garro
   ```

2. **Clone repo or upload backend files**:
   ```bash
   git clone <YOUR_GIT_REPO_URL> .
   cd backend
   ```

3. **Install production npm packages**:
   ```bash
   npm ci --only=production
   ```

4. **Create `.env` file**:
   ```bash
   cp .env.production.example .env
   nano .env
   ```
   *Fill in `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, `R2_ACCESS_KEY_ID`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, etc.*

---

## ⚙️ Step 5: Start Backend with PM2

1. **Start process cluster using `ecosystem.config.cjs`**:
   ```bash
   pm2 start ecosystem.config.cjs --env production
   ```

2. **Save state for auto-reboot**:
   ```bash
   pm2 save
   ```

3. **Verify status & view logs**:
   ```bash
   pm2 status
   pm2 logs garro-backend
   ```

---

## 🌐 Step 6: Configure Nginx & Let's Encrypt SSL

1. **Install Nginx & Certbot**:
   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx
   ```

2. **Configure Nginx Site**:
   ```bash
   sudo nano /etc/nginx/sites-available/api.garro.ae
   ```

   Paste content from [`nginx.conf.example`](file:///d:/Clients%20Projects/Garro_Monorepo/backend/nginx.conf.example) (replace `api.garro.ae` with your domain).

3. **Enable configuration**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/api.garro.ae /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Obtain Free SSL Certificate via Certbot**:
   ```bash
   sudo certbot --nginx -d api.garro.ae
   ```

---

## 🔄 Step 7: Continuous Automated Deployment

Whenever you update your code in GitHub:
```bash
cd /var/www/garro/backend
./scripts/deploy-vps.sh
```

---

## 🛡️ Summary of Production Protections Enabled

| Protections / Features | Status |
|---|---|
| **PM2 Process Clustering** | Auto-scales across CPU cores with auto-restart on memory leaks (`>1GB`) |
| **MongoDB Connection Pooling** | Configured with 20 sockets, 45s socket timeout, and auto-reconnect |
| **Graceful Shutdown** | Captures `SIGTERM` and `SIGINT` to safely drain HTTP & WebSocket connections |
| **CORS Protection** | Whitelists exact production domains with fallback allowance for credentials |
| **Nginx WebSockets (`/socket.io/`)** | Configured with `Upgrade` and `Connection` headers for real-time tracking |
| **Client Upload Limit** | Configured to 50MB for invoice PDFs and customer photos |
| **Let's Encrypt SSL** | TLS 1.2/1.3 with HSTS and security headers |
