#!/bin/bash

# Nettoria Deployment Script for Ubuntu Server
# This script automates the deployment of the Nettoria application

set -e  # Exit on any error

echo "🚀 Starting Nettoria deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="nettoria"
APP_DIR="/var/www/nettoria"
GITHUB_REPO="https://github.com/VersatileFusion/Nettoria.git"
NODE_VERSION="18"
PM2_APP_NAME="nettoria-app"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js and npm
print_status "Installing Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
print_status "Verifying Node.js installation..."
node --version
npm --version

# Install PM2 globally
print_status "Installing PM2 process manager..."
sudo npm install -g pm2

# Install Nginx
print_status "Installing Nginx..."
sudo apt install -y nginx

# Install MySQL (if not using external database)
print_status "Installing MySQL..."
sudo apt install -y mysql-server

# Secure MySQL installation
print_status "Securing MySQL installation..."
sudo mysql_secure_installation

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Clone the repository
print_status "Cloning repository from GitHub..."
if [ -d "$APP_DIR/.git" ]; then
    cd $APP_DIR
    git pull origin main
else
    git clone $GITHUB_REPO $APP_DIR
fi

cd $APP_DIR

# Install dependencies
print_status "Installing root dependencies..."
npm install

print_status "Installing server dependencies..."
cd server
npm install
cd ..

# Create environment files
print_status "Setting up environment configuration..."
if [ ! -f ".env" ]; then
    cp .env.example .env 2>/dev/null || echo "Creating .env file..."
    cat > .env << EOF
# Nettoria Environment Configuration
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
fi

if [ ! -f "server/.env" ]; then
    cp server/.env.example server/.env 2>/dev/null || echo "Creating server .env file..."
    cat > server/.env << EOF
# Nettoria Server Environment Configuration
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
fi

# Setup database
print_status "Setting up database..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS nettoria;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'nettoria_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';"
sudo mysql -e "GRANT ALL PRIVILEGES ON nettoria.* TO 'nettoria_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Initialize database schema
print_status "Initializing database schema..."
node setup-nettoria-db.js

# Configure Nginx
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/nettoria > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Frontend static files
    location / {
        root $APP_DIR/public;
        index index.html;
        try_files \$uri \$uri/ /index.html;
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
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/nettoria /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Start services
print_status "Starting services..."
sudo systemctl enable nginx
sudo systemctl restart nginx

# Start the application with PM2
print_status "Starting application with PM2..."
cd $APP_DIR
pm2 start server/src/server.js --name $PM2_APP_NAME
pm2 save
pm2 startup

# Setup SSL with Let's Encrypt (optional)
print_status "SSL setup instructions:"
echo "To enable HTTPS, run: sudo apt install certbot python3-certbot-nginx"
echo "Then: sudo certbot --nginx -d your-domain.com -d www.your-domain.com"

print_status "Deployment completed successfully! 🎉"
print_status "Your application should be accessible at: http://your-domain.com"
print_status "API endpoints are available at: http://your-domain.com/api"
print_status "PM2 status: pm2 status"
print_status "PM2 logs: pm2 logs $PM2_APP_NAME"
print_status "Nginx logs: sudo tail -f /var/log/nginx/access.log" 