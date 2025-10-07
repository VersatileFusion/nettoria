# 🚀 Nettoria Server Deployment Commands

**Run these commands on your Ubuntu server** (`ahmadvand@62.60.200.94`)

---

## Step 1: Install System Requirements

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2

# Verify installations
node -v          # Should show v22.20.0
psql --version
nginx -v
pm2 --version
```

---

## Step 2: Setup PostgreSQL Database

```bash
# Create database and user
sudo -u postgres psql << 'EOF'
CREATE DATABASE nettoria;
CREATE USER nettoria_user WITH ENCRYPTED PASSWORD 'Nettoria@2025!Secure';
GRANT ALL PRIVILEGES ON DATABASE nettoria TO nettoria_user;
ALTER DATABASE nettoria OWNER TO nettoria_user;
\q
EOF
```

---

## Step 3: Clone Repository

```bash
# Go to home directory
cd ~

# Clone from GitHub
git clone https://github.com/VersatileFusion/Nettoria.git

# Navigate to project
cd Nettoria

# Install dependencies
npm install
cd server && npm install && cd ..
```

---

## Step 4: Configure Environment

```bash
# Create environment file
nano server/.env
```

**Paste this (press Ctrl+Shift+V):**

```env
NODE_ENV=production
PORT=5000

DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nettoria
DB_USER=nettoria_user
DB_USERNAME=nettoria_user
DB_PASSWORD=Nettoria@2025!Secure

JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://62.60.200.94
APP_URL=http://62.60.200.94
APP_NAME=Nettoria

BCRYPT_ROUNDS=10
PASSWORD_MIN_LENGTH=8
TWO_FA_ENABLED=true
LOG_LEVEL=info
TZ=UTC
DEBUG=false
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

---

## Step 5: Initialize Database

```bash
cd ~/Nettoria
node setup-nettoria-db.js
```

---

## Step 6: Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/nettoria
```

**Paste this:**

```nginx
server {
    listen 80;
    server_name 62.60.200.94;
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    location / {
        root /home/ahmadvand/Nettoria/public;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log|sql)$ {
        deny all;
    }
}
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

**Enable the site:**

```bash
sudo ln -sf /etc/nginx/sites-available/nettoria /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 7: Configure Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

---

## Step 8: Start Application

```bash
# Create log directory
sudo mkdir -p /var/log/nettoria
sudo chown ahmadvand:ahmadvand /var/log/nettoria

# Start with PM2
cd ~/Nettoria
pm2 start server/src/app.js --name nettoria-app

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# IMPORTANT: Copy and run the command PM2 gives you!
```

---

## Step 9: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs nettoria-app --lines 20

# Test locally
curl http://localhost:5000/api/status

# Test via Nginx
curl http://localhost/api/status
```

---

## Step 10: Access Your Application 🎉

**Open in browser:**
- Frontend: http://62.60.200.94
- API Status: http://62.60.200.94/api/status
- API Docs: http://62.60.200.94/api-docs

---

## 🔄 Update Application (Later)

```bash
cd ~/Nettoria
git pull origin master
npm install
cd server && npm install && cd ..
pm2 restart nettoria-app
pm2 logs nettoria-app
```

---

## 🛠️ Useful Commands

```bash
# View logs
pm2 logs nettoria-app

# Restart app
pm2 restart nettoria-app

# Stop app
pm2 stop nettoria-app

# Monitor in real-time
pm2 monit

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## ⚠️ Troubleshooting

### Application won't start
```bash
pm2 logs nettoria-app
# Check for errors in the logs
```

### Database connection error
```bash
sudo systemctl status postgresql
psql -h localhost -U nettoria_user -d nettoria
```

### Nginx issues
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

---

**Need help?** Check `QUICK_DEPLOYMENT_GUIDE.md` or `ENVIRONMENT_VARIABLES.md` for detailed information.

