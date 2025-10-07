#!/bin/bash

###############################################################################
# Nettoria Automated Deployment Script for Ubuntu
# This script will deploy Nettoria on a fresh Ubuntu server
###############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="nettoria"
APP_DIR="/var/www/nettoria"
REPO_URL="https://github.com/VersatileFusion/nettoria.git"
DB_NAME="nettoria"
DB_USER="nettoria_user"
APP_PORT=5000

# Function to print colored messages
print_message() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Print banner
echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║   Nettoria Cloud Platform Deployment Script   ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run this script as root. Run as a regular user with sudo privileges."
    exit 1
fi

# Check if sudo is available
if ! command_exists sudo; then
    print_error "sudo is not installed. Please install sudo first."
    exit 1
fi

print_info "Starting deployment process..."
echo ""

# Step 1: Update system
print_info "Step 1/10: Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_message "System updated successfully"
echo ""

# Step 2: Check Node.js
print_info "Step 2/10: Checking Node.js installation..."
if command_exists node; then
    NODE_VERSION=$(node -v)
    print_message "Node.js $NODE_VERSION is installed"
else
    print_error "Node.js is not installed. Please install Node.js 18+ first:"
    echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "sudo apt install -y nodejs"
    exit 1
fi

if command_exists npm; then
    NPM_VERSION=$(npm -v)
    print_message "npm $NPM_VERSION is installed"
fi
echo ""

# Step 3: Check Git
print_info "Step 3/10: Checking Git installation..."
if command_exists git; then
    GIT_VERSION=$(git --version)
    print_message "$GIT_VERSION is installed"
else
    print_error "Git is not installed. Please install git first: sudo apt install -y git"
    exit 1
fi
echo ""

# Step 4: Install PostgreSQL
print_info "Step 4/10: Installing PostgreSQL..."
if command_exists psql; then
    print_warning "PostgreSQL is already installed"
else
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    print_message "PostgreSQL installed and started"
fi
echo ""

# Step 5: Install Nginx
print_info "Step 5/10: Installing Nginx..."
if command_exists nginx; then
    print_warning "Nginx is already installed"
else
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    print_message "Nginx installed and started"
fi
echo ""

# Step 6: Install PM2
print_info "Step 6/10: Installing PM2..."
if command_exists pm2; then
    print_warning "PM2 is already installed"
else
    sudo npm install -g pm2
    print_message "PM2 installed successfully"
fi
echo ""

# Step 7: Setup PostgreSQL Database
print_info "Step 7/10: Setting up PostgreSQL database..."
print_warning "You will be prompted to enter a secure database password."
read -s -p "Enter password for database user '$DB_USER': " DB_PASSWORD
echo ""
read -s -p "Confirm password: " DB_PASSWORD_CONFIRM
echo ""

if [ "$DB_PASSWORD" != "$DB_PASSWORD_CONFIRM" ]; then
    print_error "Passwords do not match!"
    exit 1
fi

# Create database and user
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"
print_message "Database created successfully"
echo ""

# Step 8: Clone repository
print_info "Step 8/10: Cloning Nettoria repository..."
if [ -d "$APP_DIR" ]; then
    print_warning "Directory $APP_DIR already exists. Backing up..."
    sudo mv "$APP_DIR" "${APP_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
fi

sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
cd /var/www
git clone $REPO_URL $APP_NAME
cd $APP_DIR
print_message "Repository cloned successfully"
echo ""

# Step 9: Install dependencies
print_info "Step 9/10: Installing application dependencies..."
npm install
cd server && npm install && cd ..
print_message "Dependencies installed successfully"
echo ""

# Step 10: Configure environment
print_info "Step 10/10: Configuring environment variables..."

# Generate JWT secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# Get server IP or domain
SERVER_IP=$(hostname -I | awk '{print $1}')
print_info "Detected server IP: $SERVER_IP"
read -p "Enter your domain name (or press Enter to use IP $SERVER_IP): " DOMAIN_NAME
if [ -z "$DOMAIN_NAME" ]; then
    DOMAIN_NAME=$SERVER_IP
fi

# Create .env file
cat > server/.env << EOF
# Environment
NODE_ENV=production
PORT=$APP_PORT

# PostgreSQL Database
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_USERNAME=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://$DOMAIN_NAME
APP_URL=http://$DOMAIN_NAME
APP_NAME=Nettoria

# Security
BCRYPT_ROUNDS=10
PASSWORD_MIN_LENGTH=8
TWO_FA_ENABLED=true

# Logging
LOG_LEVEL=info
TZ=UTC
DEBUG=false
EOF

chmod 600 server/.env
print_message "Environment configured successfully"
echo ""

# Initialize database schema
print_info "Initializing database schema..."
node setup-nettoria-db.js
print_message "Database schema initialized"
echo ""

# Configure Nginx
print_info "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Frontend static files
    location / {
        root $APP_DIR/public;
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
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Swagger API docs
    location /api-docs {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
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

# Enable site
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t
sudo systemctl restart nginx
print_message "Nginx configured successfully"
echo ""

# Create log directory
print_info "Creating log directory..."
sudo mkdir -p /var/log/nettoria
sudo chown $USER:$USER /var/log/nettoria
print_message "Log directory created"
echo ""

# Configure firewall
print_info "Configuring firewall..."
if command_exists ufw; then
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    print_message "Firewall configured"
else
    print_warning "UFW firewall not installed. Skipping firewall configuration."
fi
echo ""

# Start application with PM2
print_info "Starting application with PM2..."
cd $APP_DIR
pm2 start server/src/app.js --name $APP_NAME-app
pm2 save
pm2 startup | grep "sudo" | bash
print_message "Application started successfully"
echo ""

# Wait a few seconds for app to start
sleep 5

# Test application
print_info "Testing application..."
if curl -s http://localhost:$APP_PORT/api/status > /dev/null; then
    print_message "Application is responding"
else
    print_warning "Application may not be responding yet. Check logs: pm2 logs $APP_NAME-app"
fi
echo ""

# Print summary
echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║          Deployment Completed! 🎉              ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
print_message "Nettoria has been successfully deployed!"
echo ""
echo "📍 Application Details:"
echo "   - Frontend: http://$DOMAIN_NAME"
echo "   - API: http://$DOMAIN_NAME/api"
echo "   - API Docs: http://$DOMAIN_NAME/api-docs"
echo "   - Port: $APP_PORT"
echo ""
echo "🔧 Management Commands:"
echo "   - Check status: pm2 status"
echo "   - View logs: pm2 logs $APP_NAME-app"
echo "   - Restart: pm2 restart $APP_NAME-app"
echo "   - Stop: pm2 stop $APP_NAME-app"
echo "   - Monitor: pm2 monit"
echo ""
echo "📁 Application Directory: $APP_DIR"
echo "📋 Configuration File: $APP_DIR/server/.env"
echo ""
echo "🔒 Security Recommendations:"
echo "   1. Setup SSL certificate: sudo certbot --nginx -d $DOMAIN_NAME"
echo "   2. Change database password regularly"
echo "   3. Keep system updated: sudo apt update && sudo apt upgrade"
echo "   4. Monitor logs regularly: pm2 logs"
echo ""
echo "📚 Documentation:"
echo "   - Quick Guide: $APP_DIR/QUICK_DEPLOYMENT_GUIDE.md"
echo "   - API Docs: $APP_DIR/API_DOCUMENTATION.md"
echo "   - Environment: $APP_DIR/ENVIRONMENT_VARIABLES.md"
echo ""
print_warning "IMPORTANT: Save your database password securely!"
echo ""
print_message "Enjoy your Nettoria deployment! 🚀"
echo ""

