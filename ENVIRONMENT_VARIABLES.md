# 🔐 Nettoria Environment Variables Configuration

This document describes all environment variables needed for Nettoria deployment.

## 📝 Configuration File Location

Create the file: `server/.env`

## 🔧 Required Variables

### Application Settings

```env
NODE_ENV=production
PORT=5000
```

- **NODE_ENV**: Environment mode (`development`, `production`, or `test`)
- **PORT**: Port number for the application (default: 5000)

### Database Configuration (PostgreSQL)

```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nettoria
DB_USER=nettoria_user
DB_USERNAME=nettoria_user
DB_PASSWORD=your_secure_password_here
```

**Important Notes:**
- This project uses **PostgreSQL**, not MySQL
- `DB_USER` and `DB_USERNAME` should have the same value (both are needed for compatibility)
- Use a strong password for `DB_PASSWORD`

### JWT Authentication

```env
JWT_SECRET=your_jwt_secret_change_this_to_random_string
JWT_EXPIRES_IN=7d
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend URL

```env
FRONTEND_URL=http://your-domain.com
APP_URL=http://your-domain.com
APP_NAME=Nettoria
```

---

## 🔧 Optional Variables

### Email Configuration (SMTP)

For sending emails (user registration, password reset, notifications):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
SMTP_FROM=noreply@yourdomain.com
```

**For Gmail:**
1. Enable 2-factor authentication on your Google account
2. Generate an "App Password" from Google Account settings
3. Use the app password in `SMTP_PASS`

**Alternative SMTP providers:**
- **SendGrid**: `smtp.sendgrid.net` (Port 587)
- **Mailgun**: `smtp.mailgun.org` (Port 587)
- **AWS SES**: `email-smtp.region.amazonaws.com` (Port 587)

### VMware vCenter Configuration

For virtual machine management features:

```env
VCENTER_HOST=vcenter.yourdomain.com
VCENTER_PORT=443
VCENTER_USER=administrator@vsphere.local
VCENTER_PASS=your_vcenter_password
VCENTER_IGNORE_SSL=true
```

**Notes:**
- Required only if you're using VM management features
- Set `VCENTER_IGNORE_SSL=true` if using self-signed certificates

### SMS Service Configuration

For SMS notifications:

```env
SMS_API_KEY=your_sms_api_key
SMS_API_SECRET=your_sms_api_secret
```

### Payment Gateway (Zarinpal - Iranian Gateway)

```env
ZARINPAL_MERCHANT_ID=your_zarinpal_merchant_id
ZARINPAL_SANDBOX=false
```

Set `ZARINPAL_SANDBOX=true` for testing mode.

### Session Management

```env
SESSION_SECRET=your_session_secret_change_this
SESSION_EXPIRE=86400000
```

**Generate session secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Rate Limiting

```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

- `RATE_LIMIT_WINDOW_MS`: Time window in milliseconds (default: 15 minutes)
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window

### File Uploads

```env
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

- `MAX_FILE_SIZE`: Maximum file size in bytes (default: 10MB)

### Logging

```env
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

Log levels: `error`, `warn`, `info`, `debug`, `verbose`

### Redis (Optional - for caching/sessions)

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Security Settings

```env
BCRYPT_ROUNDS=10
PASSWORD_MIN_LENGTH=8
```

### Two-Factor Authentication

```env
TWO_FA_ENABLED=true
TWO_FA_APP_NAME=Nettoria
```

### Timezone

```env
TZ=UTC
```

Common timezones: `UTC`, `America/New_York`, `Europe/London`, `Asia/Tehran`

### API Configuration

```env
API_VERSION=v1
API_PREFIX=/api
```

### Debug Mode

```env
DEBUG=false
```

Set to `true` only in development for verbose logging.

---

## 📋 Complete Example Configuration

Create `server/.env` with this template:

```env
# ===================================
# Nettoria Environment Configuration
# ===================================

# Environment
NODE_ENV=production
PORT=5000

# Database (PostgreSQL)
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nettoria
DB_USER=nettoria_user
DB_USERNAME=nettoria_user
DB_PASSWORD=CHANGE_THIS_PASSWORD

# JWT
JWT_SECRET=GENERATE_RANDOM_STRING_HERE
JWT_EXPIRES_IN=7d

# URLs
FRONTEND_URL=http://yourdomain.com
APP_URL=http://yourdomain.com
APP_NAME=Nettoria

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourdomain.com

# VMware vCenter (Optional)
VCENTER_HOST=vcenter.yourdomain.com
VCENTER_PORT=443
VCENTER_USER=administrator@vsphere.local
VCENTER_PASS=vcenter_password
VCENTER_IGNORE_SSL=true

# Payment Gateway (Optional)
ZARINPAL_MERCHANT_ID=your_merchant_id
ZARINPAL_SANDBOX=false

# Session
SESSION_SECRET=GENERATE_SESSION_SECRET
SESSION_EXPIRE=86400000

# Security
BCRYPT_ROUNDS=10
PASSWORD_MIN_LENGTH=8
TWO_FA_ENABLED=true
TWO_FA_APP_NAME=Nettoria

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Timezone
TZ=UTC

# Debug (set to false in production)
DEBUG=false
```

---

## 🔒 Security Best Practices

### 1. Strong Passwords

Use strong, unique passwords for all services:

```bash
# Generate secure password
openssl rand -base64 32

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. File Permissions

```bash
# Restrict .env file permissions
chmod 600 server/.env
chown www-data:www-data server/.env  # Or your app user
```

### 3. Never Commit .env Files

Ensure `.env` is in `.gitignore`:

```bash
echo "server/.env" >> .gitignore
echo ".env" >> .gitignore
```

### 4. Use Environment-Specific Configs

- **Development**: `server/.env.development`
- **Production**: `server/.env.production`
- **Testing**: `server/.env.test`

### 5. Regular Rotation

Rotate sensitive credentials regularly:
- JWT secrets every 6 months
- Database passwords every 3 months
- API keys as needed

---

## 🧪 Testing Configuration

To verify your configuration:

```bash
# Test database connection
cd /var/www/nettoria
node -e "
  require('dotenv').config({ path: './server/.env' });
  const { Sequelize } = require('sequelize');
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres'
    }
  );
  sequelize.authenticate()
    .then(() => console.log('✅ Database connection successful'))
    .catch(err => console.error('❌ Database connection failed:', err));
"
```

---

## 🔄 Environment Variables by Feature

### Basic Deployment (Minimal)

```env
NODE_ENV=production
PORT=5000
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nettoria
DB_USER=nettoria_user
DB_USERNAME=nettoria_user
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://your-domain.com
```

### Full Deployment (All Features)

Add to basic deployment:
- Email configuration (SMTP)
- VMware vCenter credentials
- Payment gateway settings
- SMS service credentials
- Redis configuration (if using)

### Development Setup

```env
NODE_ENV=development
PORT=5000
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nettoria_dev
DB_USER=nettoria_user
DB_USERNAME=nettoria_user
DB_PASSWORD=dev_password
JWT_SECRET=dev_jwt_secret
FRONTEND_URL=http://localhost:3000
DEBUG=true
LOG_LEVEL=debug
```

---

## 📞 Troubleshooting

### Database Connection Issues

Check these variables:
- `DB_DIALECT=postgres` (NOT mysql)
- `DB_HOST=localhost`
- `DB_PORT=5432`
- Verify PostgreSQL is running: `sudo systemctl status postgresql`

### JWT Token Issues

- Ensure `JWT_SECRET` is set and not empty
- Use a long, random string
- Don't use special characters that might need escaping

### Email Not Sending

- Verify SMTP credentials
- Check firewall allows outbound connections on SMTP port
- Test SMTP connection: `telnet smtp.gmail.com 587`

### Application Won't Start

```bash
# Check for syntax errors in .env
cat server/.env

# Verify all required variables are set
grep -E "^(NODE_ENV|PORT|DB_|JWT_)" server/.env

# Check application logs
pm2 logs nettoria-app
```

---

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://jwt.io/introduction)
- [Nodemailer SMTP Setup](https://nodemailer.com/smtp/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Remember**: Never commit sensitive credentials to version control!

