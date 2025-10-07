# Nettoria Deployment Guide for Ubuntu Server

This guide provides step-by-step instructions for deploying the Nettoria cloud services platform on an Ubuntu server using GitHub.

## Prerequisites

- Ubuntu 20.04 LTS or higher
- A domain name pointing to your server
- SSH access to your Ubuntu server
- GitHub repository access

## Step 1: Server Preparation

### 1.1 Connect to your Ubuntu server
```bash
ssh username@your-server-ip
```

### 1.2 Update system packages
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Install essential packages
```bash
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

## Step 2: Install Node.js

### 2.1 Add NodeSource repository
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
```

### 2.2 Install Node.js
```bash
sudo apt install -y nodejs
```

### 2.3 Verify installation
```bash
node --version
npm --version
```

## Step 3: Install and Configure Database

### 3.1 Install MySQL
```bash
sudo apt install -y mysql-server
```

### 3.2 Secure MySQL installation
```bash
sudo mysql_secure_installation
```

### 3.3 Create database and user
```bash
sudo mysql -e "CREATE DATABASE IF NOT EXISTS nettoria;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'nettoria_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';"
sudo mysql -e "GRANT ALL PRIVILEGES ON nettoria.* TO 'nettoria_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
```

## Step 4: Install Nginx

### 4.1 Install Nginx
```bash
sudo apt install -y nginx
```

### 4.2 Start and enable Nginx
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 5: Install PM2 Process Manager

### 5.1 Install PM2 globally
```bash
sudo npm install -g pm2
```

### 5.2 Setup PM2 startup script
```bash
pm2 startup
```

## Step 6: Deploy the Application

### 6.1 Create application directory
```bash
sudo mkdir -p /var/www/nettoria
sudo chown $USER:$USER /var/www/nettoria
```

### 6.2 Clone the repository
```bash
cd /var/www
git clone https://github.com/VersatileFusion/Nettoria.git nettoria
cd nettoria
```

### 6.3 Install dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

## Step 7: Configure Environment Variables

### 7.1 Create environment files
```bash
# Create root .env file
cat > .env << EOF
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nettoria
DB_USER=nettoria_user
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_jwt_secret_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
VCENTER_HOST=your_vcenter_host
VCENTER_USER=your_vcenter_user
VCENTER_PASS=your_vcenter_password
EOF

# Create server .env file
cat > server/.env << EOF
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nettoria
DB_USER=nettoria_user
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your_jwt_secret_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
VCENTER_HOST=your_vcenter_host
VCENTER_USER=your_vcenter_user
VCENTER_PASS=your_vcenter_password
EOF
```

### 7.2 Update the configuration
Edit both `.env` files and replace the placeholder values with your actual configuration:
- Database credentials
- JWT secret (generate a strong random string)
- SMTP settings for email functionality
- VMware vCenter credentials

## Step 8: Initialize Database

### 8.1 Run database setup
```bash
node setup-nettoria-db.js
```

## Step 9: Configure Nginx

### 9.1 Create Nginx configuration
```bash
sudo tee /etc/nginx/sites-available/nettoria > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Frontend static files
    location / {
        root /var/www/nettoria/public;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy to Node.js backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log|sql)$ {
        deny all;
    }
}
EOF
```

### 9.2 Enable the site
```bash
sudo ln -sf /etc/nginx/sites-available/nettoria /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

### 9.3 Test Nginx configuration
```bash
sudo nginx -t
```

### 9.4 Restart Nginx
```bash
sudo systemctl restart nginx
```

## Step 10: Start the Application

### 10.1 Start with PM2
```bash
cd /var/www/nettoria
pm2 start server/src/server.js --name nettoria-app
```

### 10.2 Save PM2 configuration
```bash
pm2 save
```

### 10.3 Check application status
```bash
pm2 status
pm2 logs nettoria-app
```

## Step 11: Setup SSL (Optional but Recommended)

### 11.1 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 11.2 Obtain SSL certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 11.3 Setup auto-renewal
```bash
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 12: Setup Firewall

### 12.1 Configure UFW firewall
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Step 13: Monitoring and Maintenance

### 13.1 Create log directories
```bash
sudo mkdir -p /var/log/nettoria
sudo chown $USER:$USER /var/log/nettoria
```

### 13.2 Setup log rotation
```bash
sudo tee /etc/logrotate.d/nettoria > /dev/null << EOF
/var/log/nettoria/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
EOF
```

### 13.3 Setup monitoring
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor application
pm2 monit
```

## Step 14: Automated Deployment (Optional)

### 14.1 Create deployment script
```bash
# Make the deployment script executable
chmod +x deploy.sh

# Run the automated deployment
./deploy.sh
```

## Verification Steps

### 1. Check application status
```bash
pm2 status
curl http://localhost:3000/health
```

### 2. Check Nginx status
```bash
sudo systemctl status nginx
curl -I http://your-domain.com
```

### 3. Check database connection
```bash
mysql -u nettoria_user -p nettoria -e "SHOW TABLES;"
```

### 4. Test the application
- Visit `http://your-domain.com` in your browser
- Test API endpoints at `http://your-domain.com/api`
- Check logs: `pm2 logs nettoria-app`

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Database connection failed**
   ```bash
   sudo mysql -e "SHOW GRANTS FOR 'nettoria_user'@'localhost';"
   ```

3. **Nginx configuration error**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

4. **PM2 process not starting**
   ```bash
   pm2 logs nettoria-app
   pm2 restart nettoria-app
   ```

### Useful Commands

```bash
# View application logs
pm2 logs nettoria-app

# Restart application
pm2 restart nettoria-app

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check system resources
htop
df -h
free -h

# Update application
cd /var/www/nettoria
git pull origin main
npm install
cd server && npm install && cd ..
pm2 restart nettoria-app
```

## Security Considerations

1. **Change default passwords** for all services
2. **Keep system updated** regularly
3. **Use strong JWT secrets**
4. **Enable firewall** and configure properly
5. **Use HTTPS** in production
6. **Regular backups** of database and application
7. **Monitor logs** for suspicious activity

## Backup Strategy

### Database Backup
```bash
# Create backup script
sudo tee /usr/local/bin/backup-nettoria.sh > /dev/null << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/nettoria"
DATE=\$(date +%Y%m%d_%H%M%S)
mkdir -p \$BACKUP_DIR
mysqldump -u nettoria_user -p nettoria > \$BACKUP_DIR/nettoria_\$DATE.sql
tar -czf \$BACKUP_DIR/app_\$DATE.tar.gz /var/www/nettoria
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

sudo chmod +x /usr/local/bin/backup-nettoria.sh

# Add to crontab for daily backups
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-nettoria.sh
```

Your Nettoria application should now be successfully deployed and accessible at your domain! 🎉 