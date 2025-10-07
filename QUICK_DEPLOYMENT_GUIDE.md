# 🚀 Nettoria Quick Deployment Guide

This is a simplified guide to deploy Nettoria on an Ubuntu server.

## ⚠️ Important Corrections

**This project uses:**
- **Database**: PostgreSQL (NOT MySQL)
- **Entry Point**: `server/src/app.js` (NOT `server/src/server.js`)
- **Port**: 5000 (default)

---

## 📋 Prerequisites

- **Ubuntu Server** 20.04 LTS or higher
- **Root or sudo access**
- **Domain name** pointing to your server (optional but recommended)
- **Minimum 2GB RAM** and 20GB storage

---

## 🎯 Three Deployment Methods

### Method 1: Automated Script (Recommended)

Use the corrected deployment script:

```bash
# Download the corrected script
wget https://raw.githubusercontent.com/YOUR_REPO/deploy-corrected.sh
chmod +x deploy-corrected.sh

# Run the script
./deploy-corrected.sh

# After completion, edit the environment file
nano /var/www/nettoria/server/.env
```

### Method 2: Using PM2 Ecosystem Config

```bash
# Clone the repository
cd /var/www
git clone https://github.com/VersatileFusion/Nettoria.git nettoria
cd nettoria

# Install dependencies
npm install
cd server && npm install && cd ..

# Setup environment (see section below)
cp server/.env.example server/.env
nano server/.env

# Create log directory
sudo mkdir -p /var/log/nettoria
sudo chown $USER:$USER /var/log/nettoria

# Start with PM2 ecosystem config
pm2 start pm2-ecosystem.config.js
pm2 save
pm2 startup
```

### Method 3: Manual Step-by-Step

Follow the detailed guide in `DEPLOYMENT_GUIDE.md` (NOTE: Replace MySQL steps with PostgreSQL)

---

## 🔧 Environment Configuration

Create `server/.env` file with the following content:

```env
# Environment
NODE_ENV=production
PORT=5000

# PostgreSQL Database (IMPORTANT: Use PostgreSQL, not MySQL!)
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nettoria
DB_USER=nettoria_user
DB_USERNAME=nettoria_user
DB_PASSWORD=your_secure_password_here

# JWT Configuration
JWT_SECRET=generate_a_random_secure_string_here
JWT_EXPIRES_IN=7d

# Email Configuration (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password

# VMware vCenter (Optional - for VM management)
VCENTER_HOST=vcenter.yourdomain.com
VCENTER_USER=administrator@vsphere.local
VCENTER_PASS=your_vcenter_password

# Frontend URL
FRONTEND_URL=http://your-domain.com

# Payment Gateway (Optional)
ZARINPAL_MERCHANT_ID=your_merchant_id
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 💾 Database Setup

### Install PostgreSQL

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Create Database and User

```bash
sudo -u postgres psql << EOF
CREATE DATABASE nettoria;
CREATE USER nettoria_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE nettoria TO nettoria_user;
ALTER DATABASE nettoria OWNER TO nettoria_user;
\q
EOF
```

### Initialize Schema

```bash
cd /var/www/nettoria
node setup-nettoria-db.js
```

---

## 🌐 Nginx Configuration

### Install Nginx

```bash
sudo apt install -y nginx
```

### Configure Site

```bash
sudo cp nginx.conf /etc/nginx/sites-available/nettoria

# Or create manually:
sudo nano /etc/nginx/sites-available/nettoria
```

Copy the content from `nginx.conf` and update:
- Replace `your-domain.com` with your actual domain
- Ensure `proxy_pass` uses `http://localhost:5000` (NOT 3000)

### Enable Site

```bash
# Enable the site
sudo ln -sf /etc/nginx/sites-available/nettoria /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔐 SSL/HTTPS Setup (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## 🎮 Application Management

### Start Application

```bash
cd /var/www/nettoria

# Option 1: Using PM2 with ecosystem config
pm2 start pm2-ecosystem.config.js

# Option 2: Simple PM2 start
pm2 start server/src/app.js --name nettoria-app

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Useful Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs nettoria-app

# Restart application
pm2 restart nettoria-app

# Stop application
pm2 stop nettoria-app

# Monitor in real-time
pm2 monit

# View specific logs
tail -f /var/log/nettoria/combined.log
```

---

## 🔍 Verification

### 1. Check Application Status

```bash
# PM2 status
pm2 status

# Check if app is listening on port 5000
sudo netstat -tulpn | grep 5000
```

### 2. Test API Endpoints

```bash
# Health check
curl http://localhost:5000/api/status

# API documentation
curl http://localhost:5000/api-docs

# From external
curl http://your-domain.com/api/status
```

### 3. Check Logs

```bash
# Application logs
pm2 logs nettoria-app

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### 4. Test in Browser

- Frontend: `http://your-domain.com`
- API Docs: `http://your-domain.com/api-docs`
- API Status: `http://your-domain.com/api/status`

---

## 🔥 Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 🐛 Troubleshooting

### Application Won't Start

```bash
# Check environment variables
cat server/.env

# Check database connection
sudo -u postgres psql -d nettoria -c "SELECT 1;"

# Check Node.js version
node --version  # Should be 14.0.0 or higher

# Check dependencies
cd /var/www/nettoria/server
npm install
```

### Database Connection Issues

```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U nettoria_user -d nettoria

# Check pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Ensure this line exists:
# local   all   all   md5
```

### Nginx Issues

```bash
# Test Nginx config
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### Port Already in Use

```bash
# Find what's using port 5000
sudo lsof -i :5000

# Kill the process
sudo kill -9 <PID>
```

---

## 🔄 Updating the Application

```bash
cd /var/www/nettoria

# Pull latest changes
git pull origin main

# Install new dependencies
npm install
cd server && npm install && cd ..

# Restart application
pm2 restart nettoria-app

# Check logs
pm2 logs nettoria-app
```

---

## 📦 Backup Strategy

### Database Backup

```bash
# Create backup script
sudo nano /usr/local/bin/backup-nettoria.sh
```

Add this content:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/nettoria"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup PostgreSQL database
sudo -u postgres pg_dump nettoria > $BACKUP_DIR/nettoria_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/nettoria

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make it executable and schedule:

```bash
sudo chmod +x /usr/local/bin/backup-nettoria.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-nettoria.sh") | crontab -
```

---

## 📊 Monitoring

### System Resources

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor system
htop

# Monitor network
sudo nethogs

# Monitor disk
df -h
```

### Application Monitoring

```bash
# PM2 monitoring
pm2 monit

# Real-time logs
pm2 logs nettoria-app --lines 100

# PM2 web interface (optional)
pm2 install pm2-server-monit
```

---

## 🎉 Success Checklist

- [ ] Ubuntu server updated and configured
- [ ] Node.js 18+ installed
- [ ] PostgreSQL installed and database created
- [ ] Application cloned and dependencies installed
- [ ] Environment variables configured in `server/.env`
- [ ] Database schema initialized
- [ ] Nginx installed and configured
- [ ] Application running via PM2
- [ ] Firewall configured
- [ ] SSL certificate installed (optional)
- [ ] Application accessible via domain
- [ ] API documentation accessible at `/api-docs`
- [ ] Backup strategy implemented

---

## 📞 Support

If you encounter issues:

1. Check the logs: `pm2 logs nettoria-app`
2. Review the main `DEPLOYMENT_GUIDE.md` for detailed steps
3. Check `API_DOCUMENTATION.md` for API details
4. Review `PROJECT_OVERVIEW.md` for architecture information

---

## ⚡ Quick Reference

| Component | Location/Command |
|-----------|------------------|
| Application Directory | `/var/www/nettoria` |
| Main Entry Point | `server/src/app.js` |
| Environment Config | `server/.env` |
| PM2 Config | `pm2-ecosystem.config.js` |
| Nginx Config | `/etc/nginx/sites-available/nettoria` |
| Application Logs | `pm2 logs nettoria-app` |
| Nginx Logs | `/var/log/nginx/` |
| Application Port | 5000 |
| Database | PostgreSQL (port 5432) |
| PM2 Management | `pm2 status`, `pm2 restart`, `pm2 logs` |

---

**Good luck with your deployment! 🚀**

