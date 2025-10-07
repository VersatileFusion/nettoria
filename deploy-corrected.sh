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

# Install PostgreSQL (not MySQL!)
print_status "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
print_status "Setting up PostgreSQL database..."
sudo -u postgres psql << EOF
CREATE DATABASE nettoria;
CREATE USER nettoria_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE nettoria TO nettoria_user;
\q
EOF

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
if [ ! -f "server/.env" ]; then
    cat > server/.env << EOF
# Nettoria Server Environment Configuration
NODE_ENV=production
PORT=5000

# PostgreSQL Configuration
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nettoria
DB_USER=nettoria_user
DB_USERNAME=nettoria_user
DB_PASSWORD=your_secure_password_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here_change_this_to_random_string
JWT_EXPIRES_IN=7d

# SMTP Configuration (for emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# VMware vCenter Configuration (optional)
VCENTER_HOST=your_vcenter_host
VCENTER_USER=your_vcenter_user
VCENTER_PASS=your_vcenter_password

# Frontend URL
FRONTEND_URL=http://your-domain.com
EOF
    print_warning "Please edit server/.env and update the configuration values!"
fi

# Initialize database schema
print_status "Initializing database schema..."
node setup-nettoria-db.js || print_warning "Database setup failed - you may need to run this manually"

# Create log directory
print_status "Creating log directory..."
sudo mkdir -p /var/log/nettoria
sudo chown $USER:$USER /var/log/nettoria

# Configure Nginx
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/nettoria > /dev/null << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend static files
    location / {
        root /var/www/nettoria/public;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy to Node.js backend
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

# Stop existing PM2 process if running
pm2 stop $PM2_APP_NAME 2>/dev/null || true
pm2 delete $PM2_APP_NAME 2>/dev/null || true

# Start the app (use app.js, not server.js!)
pm2 start server/src/app.js --name $PM2_APP_NAME
pm2 save
pm2 startup

# Setup firewall
print_status "Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable

# Setup SSL with Let's Encrypt instructions
print_status "SSL setup instructions:"
echo ""
echo "To enable HTTPS, run:"
echo "  sudo apt install certbot python3-certbot-nginx"
echo "  sudo certbot --nginx -d your-domain.com -d www.your-domain.com"
echo ""

print_status "Deployment completed successfully! 🎉"
print_status "IMPORTANT: Edit server/.env with your actual configuration values!"
print_status ""
print_status "Your application should be accessible at: http://your-domain.com"
print_status "API endpoints are available at: http://your-domain.com/api"
print_status "API documentation: http://your-domain.com/api-docs"
print_status ""
print_status "Useful commands:"
print_status "  pm2 status              - Check application status"
print_status "  pm2 logs $PM2_APP_NAME  - View application logs"
print_status "  pm2 restart $PM2_APP_NAME - Restart application"
print_status "  sudo systemctl status nginx - Check Nginx status"

