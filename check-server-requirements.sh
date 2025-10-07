#!/bin/bash

###############################################################################
# Nettoria Server Requirements Checker
# Run this script on your Ubuntu server to check if all requirements are met
###############################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to print colored messages
print_pass() {
    echo -e "${GREEN}[✓ PASS]${NC} $1"
    ((PASSED++))
}

print_fail() {
    echo -e "${RED}[✗ FAIL]${NC} $1"
    ((FAILED++))
}

print_warn() {
    echo -e "${YELLOW}[! WARN]${NC} $1"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_header() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  $1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to compare versions
version_ge() {
    printf '%s\n%s\n' "$2" "$1" | sort -V -C
}

# Print banner
clear
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║     Nettoria Server Requirements Checker v1.0          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# System Information
print_header "SYSTEM INFORMATION"
print_info "Hostname: $(hostname)"
print_info "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
print_info "Kernel: $(uname -r)"
print_info "Architecture: $(uname -m)"
print_info "Date: $(date)"
echo ""

# Check 1: Operating System
print_header "1. OPERATING SYSTEM CHECK"
if [ -f /etc/os-release ]; then
    . /etc/os-release
    print_info "Distribution: $NAME $VERSION"
    
    if [[ "$ID" == "ubuntu" ]]; then
        VERSION_NUMBER=$(echo $VERSION_ID | cut -d'.' -f1)
        if [ "$VERSION_NUMBER" -ge 20 ]; then
            print_pass "Ubuntu version $VERSION_ID (>= 20.04 required)"
        else
            print_fail "Ubuntu version $VERSION_ID is too old (>= 20.04 required)"
        fi
    else
        print_warn "Not Ubuntu, but may work (Ubuntu 20.04+ recommended)"
    fi
else
    print_fail "Cannot determine OS version"
fi
echo ""

# Check 2: User privileges
print_header "2. USER PRIVILEGES CHECK"
if [ "$EUID" -eq 0 ]; then
    print_warn "Running as root (not recommended for deployment)"
else
    print_info "Running as: $(whoami)"
    
    if sudo -n true 2>/dev/null; then
        print_pass "User has sudo privileges (no password required)"
    elif sudo -v 2>/dev/null; then
        print_pass "User has sudo privileges"
    else
        print_fail "User does not have sudo privileges"
    fi
fi
echo ""

# Check 3: Node.js
print_header "3. NODE.JS CHECK"
if command_exists node; then
    NODE_VERSION=$(node -v | sed 's/v//')
    print_info "Node.js version: $NODE_VERSION"
    
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        print_pass "Node.js version $NODE_VERSION (>= 18.x required)"
    else
        print_fail "Node.js version $NODE_VERSION is too old (>= 18.x required)"
        print_info "Install: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs"
    fi
else
    print_fail "Node.js is not installed"
    print_info "Install: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs"
fi

if command_exists npm; then
    NPM_VERSION=$(npm -v)
    print_pass "npm version: $NPM_VERSION"
else
    print_fail "npm is not installed"
fi
echo ""

# Check 4: Git
print_header "4. GIT CHECK"
if command_exists git; then
    GIT_VERSION=$(git --version | awk '{print $3}')
    print_pass "Git version: $GIT_VERSION"
    
    # Check git configuration
    if git config --global user.name >/dev/null 2>&1; then
        print_info "Git user.name: $(git config --global user.name)"
    else
        print_warn "Git user.name not configured (optional)"
    fi
    
    if git config --global user.email >/dev/null 2>&1; then
        print_info "Git user.email: $(git config --global user.email)"
    else
        print_warn "Git user.email not configured (optional)"
    fi
else
    print_fail "Git is not installed"
    print_info "Install: sudo apt install -y git"
fi
echo ""

# Check 5: PostgreSQL
print_header "5. POSTGRESQL CHECK"
if command_exists psql; then
    PSQL_VERSION=$(psql --version | awk '{print $3}')
    print_pass "PostgreSQL client version: $PSQL_VERSION"
else
    print_fail "PostgreSQL client (psql) is not installed"
    print_info "Install: sudo apt install -y postgresql postgresql-contrib"
fi

if systemctl is-active --quiet postgresql 2>/dev/null; then
    print_pass "PostgreSQL service is running"
    
    # Check if we can connect
    if sudo -u postgres psql -c "SELECT version();" >/dev/null 2>&1; then
        print_pass "Can connect to PostgreSQL"
        PG_VERSION=$(sudo -u postgres psql -t -c "SHOW server_version;" | xargs)
        print_info "PostgreSQL server version: $PG_VERSION"
    else
        print_warn "Cannot connect to PostgreSQL"
    fi
else
    print_fail "PostgreSQL service is not running"
    print_info "Start: sudo systemctl start postgresql && sudo systemctl enable postgresql"
fi
echo ""

# Check 6: Nginx
print_header "6. NGINX CHECK"
if command_exists nginx; then
    NGINX_VERSION=$(nginx -v 2>&1 | awk -F'/' '{print $2}')
    print_pass "Nginx version: $NGINX_VERSION"
    
    if systemctl is-active --quiet nginx 2>/dev/null; then
        print_pass "Nginx service is running"
    else
        print_warn "Nginx service is not running"
        print_info "Start: sudo systemctl start nginx && sudo systemctl enable nginx"
    fi
    
    # Check Nginx configuration
    if sudo nginx -t >/dev/null 2>&1; then
        print_pass "Nginx configuration is valid"
    else
        print_warn "Nginx configuration has errors"
        print_info "Check: sudo nginx -t"
    fi
else
    print_fail "Nginx is not installed"
    print_info "Install: sudo apt install -y nginx"
fi
echo ""

# Check 7: PM2
print_header "7. PM2 PROCESS MANAGER CHECK"
if command_exists pm2; then
    PM2_VERSION=$(pm2 -v)
    print_pass "PM2 version: $PM2_VERSION"
    
    # Check if PM2 has any processes
    PM2_COUNT=$(pm2 list | grep -c "online\|stopped\|errored" || echo "0")
    if [ "$PM2_COUNT" -gt 0 ]; then
        print_info "PM2 is managing $PM2_COUNT process(es)"
    else
        print_info "PM2 has no processes (this is fine for new installation)"
    fi
else
    print_fail "PM2 is not installed"
    print_info "Install: sudo npm install -g pm2"
fi
echo ""

# Check 8: System Resources
print_header "8. SYSTEM RESOURCES CHECK"

# Memory
TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
AVAIL_MEM=$(free -m | awk '/^Mem:/{print $7}')
print_info "Total Memory: ${TOTAL_MEM}MB"
print_info "Available Memory: ${AVAIL_MEM}MB"

if [ "$TOTAL_MEM" -ge 2048 ]; then
    print_pass "Memory: ${TOTAL_MEM}MB (>= 2GB recommended)"
else
    print_warn "Memory: ${TOTAL_MEM}MB (< 2GB, may affect performance)"
fi

# Disk Space
ROOT_DISK=$(df -h / | awk 'NR==2 {print $4}')
ROOT_DISK_NUM=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
print_info "Available disk space on /: $ROOT_DISK"

if [ "$ROOT_DISK_NUM" -ge 10 ]; then
    print_pass "Disk space: ${ROOT_DISK} (>= 10GB recommended)"
else
    print_warn "Disk space: ${ROOT_DISK} (< 10GB, may run out of space)"
fi

# CPU
CPU_CORES=$(nproc)
print_info "CPU cores: $CPU_CORES"
if [ "$CPU_CORES" -ge 2 ]; then
    print_pass "CPU cores: $CPU_CORES (>= 2 recommended)"
else
    print_warn "CPU cores: $CPU_CORES (< 2, may affect performance)"
fi
echo ""

# Check 9: Network
print_header "9. NETWORK CHECK"

# Check internet connectivity
if ping -c 1 google.com >/dev/null 2>&1; then
    print_pass "Internet connectivity is working"
else
    print_fail "No internet connectivity (required for installation)"
fi

# Check if required ports are available
print_info "Checking required ports..."

# Port 80 (HTTP)
if sudo lsof -i :80 >/dev/null 2>&1; then
    SERVICE_80=$(sudo lsof -i :80 | awk 'NR==2 {print $1}')
    print_info "Port 80 is in use by: $SERVICE_80"
else
    print_pass "Port 80 is available"
fi

# Port 443 (HTTPS)
if sudo lsof -i :443 >/dev/null 2>&1; then
    SERVICE_443=$(sudo lsof -i :443 | awk 'NR==2 {print $1}')
    print_info "Port 443 is in use by: $SERVICE_443"
else
    print_pass "Port 443 is available"
fi

# Port 5000 (Application)
if sudo lsof -i :5000 >/dev/null 2>&1; then
    SERVICE_5000=$(sudo lsof -i :5000 | awk 'NR==2 {print $1}')
    print_warn "Port 5000 is in use by: $SERVICE_5000 (will need to stop this)"
else
    print_pass "Port 5000 is available"
fi

# Port 5432 (PostgreSQL)
if sudo lsof -i :5432 >/dev/null 2>&1; then
    print_pass "Port 5432 is in use (PostgreSQL)"
else
    print_warn "Port 5432 is not in use (PostgreSQL not running?)"
fi
echo ""

# Check 10: Firewall
print_header "10. FIREWALL CHECK"
if command_exists ufw; then
    print_pass "UFW firewall is installed"
    
    UFW_STATUS=$(sudo ufw status | head -n 1 | awk '{print $2}')
    if [ "$UFW_STATUS" == "active" ]; then
        print_pass "UFW firewall is active"
        
        # Check if required ports are allowed
        if sudo ufw status | grep -q "22/tcp"; then
            print_pass "Port 22 (SSH) is allowed"
        else
            print_warn "Port 22 (SSH) is not explicitly allowed"
        fi
        
        if sudo ufw status | grep -q "80/tcp\|80 "; then
            print_pass "Port 80 (HTTP) is allowed"
        else
            print_warn "Port 80 (HTTP) is not allowed (will need to open)"
        fi
        
        if sudo ufw status | grep -q "443/tcp\|443 "; then
            print_pass "Port 443 (HTTPS) is allowed"
        else
            print_warn "Port 443 (HTTPS) is not allowed (recommended)"
        fi
    else
        print_info "UFW firewall is inactive"
    fi
else
    print_warn "UFW firewall is not installed (optional but recommended)"
    print_info "Install: sudo apt install -y ufw"
fi
echo ""

# Check 11: Additional Tools
print_header "11. ADDITIONAL TOOLS CHECK"

if command_exists curl; then
    print_pass "curl is installed"
else
    print_warn "curl is not installed (recommended)"
    print_info "Install: sudo apt install -y curl"
fi

if command_exists wget; then
    print_pass "wget is installed"
else
    print_warn "wget is not installed (recommended)"
    print_info "Install: sudo apt install -y wget"
fi

if command_exists unzip; then
    print_pass "unzip is installed"
else
    print_warn "unzip is not installed (may be needed)"
    print_info "Install: sudo apt install -y unzip"
fi

if command_exists certbot; then
    print_pass "certbot is installed (for SSL certificates)"
else
    print_info "certbot is not installed (optional, for SSL)"
    print_info "Install: sudo apt install -y certbot python3-certbot-nginx"
fi
echo ""

# Check 12: Directory Permissions
print_header "12. DIRECTORY PERMISSIONS CHECK"

# Check /var/www
if [ -d "/var/www" ]; then
    print_pass "/var/www directory exists"
    
    if [ -w "/var/www" ]; then
        print_pass "Current user can write to /var/www"
    else
        print_warn "Current user cannot write to /var/www (will need sudo)"
    fi
else
    print_info "/var/www directory does not exist (will be created)"
fi

# Check /var/log
if [ -w "/var/log" ]; then
    print_pass "Can write to /var/log (may need sudo)"
elif sudo test -w "/var/log"; then
    print_pass "Can write to /var/log with sudo"
else
    print_warn "Cannot write to /var/log"
fi
echo ""

# Summary
print_header "SUMMARY"
echo ""
echo "  Total Checks: $((PASSED + FAILED + WARNINGS))"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"
echo -e "  ${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ Server is ready for Nettoria deployment!           ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Clone the repository:"
    echo "     git clone https://github.com/VersatileFusion/nettoria.git"
    echo ""
    echo "  2. Run the deployment script:"
    echo "     cd nettoria && bash deploy-ubuntu.sh"
    echo ""
else
    echo -e "${RED}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ Server has missing requirements                     ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Please fix the failed checks above before deployment."
    echo ""
    echo "Quick fix commands:"
    echo ""
    
    if ! command_exists node; then
        echo "# Install Node.js 18:"
        echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
        echo "sudo apt install -y nodejs"
        echo ""
    fi
    
    if ! command_exists git; then
        echo "# Install Git:"
        echo "sudo apt install -y git"
        echo ""
    fi
    
    if ! command_exists psql; then
        echo "# Install PostgreSQL:"
        echo "sudo apt install -y postgresql postgresql-contrib"
        echo "sudo systemctl start postgresql"
        echo "sudo systemctl enable postgresql"
        echo ""
    fi
    
    if ! command_exists nginx; then
        echo "# Install Nginx:"
        echo "sudo apt install -y nginx"
        echo "sudo systemctl start nginx"
        echo "sudo systemctl enable nginx"
        echo ""
    fi
    
    if ! command_exists pm2; then
        echo "# Install PM2:"
        echo "sudo npm install -g pm2"
        echo ""
    fi
fi

echo ""
print_info "Report generated on: $(date)"
print_info "For detailed deployment guide, see: QUICK_DEPLOYMENT_GUIDE.md"
echo ""

