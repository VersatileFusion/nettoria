# Nettoria Cloud Service Provider Platform - Project Overview

## 1. Project Overview

Nettoria is a comprehensive cloud services platform built with Node.js and Express. The system allows users to register, manage virtual machines (VMs), process payments, and access support services. The project integrates deeply with VMware vCenter for automated VM provisioning and management. It also provides a suite of diagnostic tools for testing connectivity to vCenter environments, especially through VPN.

## 2. Main Features

### Authentication and User Management
- User registration with personal information
- Phone and email verification
- Multiple login methods (password, one-time code)
- JWT-based authentication
- Secure password recovery
- Profile completion with national ID verification
- Two-factor authentication
- Session management
- Activity logging

### Service and Virtual Machine Management
- Ready-made and custom plans (CPU, RAM, storage, etc.)
- Multiple datacenter and OS options
- Flexible payment periods (monthly, quarterly, etc.)
- Hourly billing with wallet
- Automated VM creation, power on/off, reset, rebuild, and deletion
- Resource allocation based on plan
- Real-time monitoring
- Automated backups
- Resource scaling

### Billing and Finance
- Invoice generation and payment
- Support for multiple payment gateways
- Discount code support
- Transaction history and wallet system
- SMS notifications for low balance
- Suspension of expired services
- Multiple currency support
- Automated billing
- Invoice generation

### User Dashboard
- Service list and management
- Transaction history
- Service renewal/cancellation
- Notification center
- Resource usage statistics
- Billing information
- Support ticket management

### Support System
- Ticket creation and categorization
- File attachments
- Email notifications
- Ticket status tracking
- Priority support
- SLA monitoring
- Knowledge base
- FAQ section

### Admin Dashboard
- User, order, and ticket management
- Reporting and analytics
- Promotional message sending (email/SMS)
- System monitoring
- Resource allocation
- Service management
- User management
- Financial reports

### vCenter API Test Suite
- VPN connection detection
- Network and API connectivity tests (REST/SOAP)
- Automated and interactive test execution
- Connection diagnostics
- Performance testing
- Security testing

## 3. Technical Stack

- **Backend:** Node.js, Express.js (REST API)
- **Database:** MySQL/PostgreSQL (SQL Server compatible)
- **ORM:** Sequelize
- **Authentication:** JWT, 2FA
- **VMware Integration:** vCenter API (node-vsphere-soap)
- **Notifications:** Email (Nodemailer), SMS (SMS.ir)
- **Documentation:** Swagger
- **Testing:** Jest, Supertest
- **Frontend:** HTML, CSS, JavaScript, Bootstrap
- **Security:** Helmet, CORS, Rate Limiting
- **Monitoring:** Winston, Morgan
- **Other:** dotenv, axios, bcrypt

## 4. Project Structure

```
/ (root)
├── node_modules/                # Project dependencies
├── scripts/                     # Management and test scripts
│   ├── test-pg-connection.js
│   ├── admin-setup-full.js
│   ├── register-admin-user.js
│   ├── get-admin-jwt.js
│   ├── promote-admin-user.js
│   └── verify-test-user.js
├── server/                      # Main server and backend
│   ├── node_modules/            # Server dependencies
│   ├── test-vcenter.js
│   ├── test-vcenter-api.js
│   ├── test-suite.js
│   ├── README.md
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── app.js
│       ├── setup-db.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── ticket.controller.js
│       │   ├── service.controller.js
│       │   ├── vcenter.controller.js
│       │   └── sms.controller.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── sms.routes.js
│       │   ├── payment.routes.js
│       │   ├── service.routes.js
│       │   ├── order.routes.js
│       │   ├── ticket.routes.js
│       │   ├── wallet.routes.js
│       │   ├── user.routes.js
│       │   └── vcenter.routes.js
│       ├── services/
│       │   ├── vcenter.service.js
│       │   ├── sms.service.js
│       │   └── sms-test.js
│       ├── models/
│       │   ├── user.model.js
│       │   ├── ticket.model.js
│       │   ├── comment.model.js
│       │   ├── index.js
│       │   ├── service.model.js
│       │   ├── order.model.js
│       │   ├── wallet.model.js
│       │   └── vm.model.js
│       ├── config/
│       │   ├── index.js
│       │   ├── database.js
│       │   ├── operating-systems.js
│       │   └── vm-plans.js
│       ├── middleware/
│       │   └── auth.middleware.js
│       ├── utils/
│       │   ├── error.js
│       │   ├── logger.js
│       │   ├── notification.util.js
│       │   ├── setup-db.js
│       │   └── auth.utils.js
│       └── views/
│           └── payment/
├── public/                      # Frontend files
│   ├── Assets/                  # Static assets
│   │   ├── Css/                # Stylesheets
│   │   ├── Js/                 # JavaScript files
│   │   └── Images/             # Image assets
│   └── *.html                  # HTML pages
├── test/                        # Test scripts and tools
│   ├── helpers/
│   │   └── setup-test-user.js
│   ├── test-vm-feature.js
│   ├── run-feature-tests.js
│   ├── test-auth-feature.js
│   ├── test-admin-feature.js
│   ├── test-support-feature.js
│   ├── test-dashboard-feature.js
│   ├── test-billing-feature.js
│   ├── test-vcenter-suite-feature.js
│   └── ... (other test files)
├── .gitignore
├── PROJECT_OVERVIEW.md
├── README.md
├── API_DOCUMENTATION.md
├── reset-test-db.js
├── setup-nettoria-db.js
├── check-schema.js
├── test-db-connection.js
└── db-config.js
```

## 5. How It Works (High-Level Flow)

1. **User Registration:** Users register, verify phone/email, and complete their profile.
2. **Service Selection:** Users choose or configure a VM service plan.
3. **Order and Payment:** Users place orders, pay invoices, or use wallet balance.
4. **VM Provisioning:** System provisions VM through vCenter API based on user specifications.
5. **VM Management:** Users can power on/off, reset, rebuild, or delete VMs.
6. **Billing:** Invoices are generated and wallet balance is managed for hourly billing.
7. **Support:** Users can create support tickets and receive notifications.
8. **Admin:** Admins manage users, orders, tickets, and send notifications.

## 6. API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login
- `POST /api/auth/2fa/setup` - Setup 2FA
- `POST /api/auth/2fa/verify` - Verify 2FA

### Services
- `GET /api/services` - List services
- `POST /api/orders` - Place order
- `GET /api/vcenter/vms` - List VMs
- `POST /api/vcenter/vms/:id/power` - Power on/off VM

### Wallet & Payment
- `GET /api/wallet` - Wallet information
- `POST /api/wallet/deposit` - Add funds
- `POST /api/wallet/withdraw` - Withdraw funds

### Support
- `POST /api/tickets` - Create support ticket
- `GET /api/tickets` - List tickets
- `POST /api/tickets/:id/reply` - Reply to ticket

### Admin
- `GET /api/admin/users` - List users
- `GET /api/admin/orders` - List orders
- `GET /api/admin/tickets` - List tickets
- `POST /api/admin/notifications` - Send notifications

(For complete API documentation, visit `/api-docs`)

## 7. Configuration & Setup

1. **Clone Repository**
2. **Install Dependencies:**
   ```bash
   npm install
   cd server && npm install
   ```
3. **Configure Environment Variables:**
   - Copy `.env.example` to `.env` and enter database, JWT, SMS, email, and vCenter values
4. **Initialize Database:**
   ```bash
   npm run setup-db
   ```
5. **Run Server:**
   ```bash
   npm run dev
   ```

## 8. Security Measures

1. **Authentication**
   - JWT-based authentication
   - Two-factor authentication
   - Session management
   - Password hashing with PBKDF2

2. **API Security**
   - Rate limiting
   - CORS protection
   - Input validation
   - SQL injection prevention
   - XSS protection

3. **Data Protection**
   - Data encryption
   - Secure password storage
   - Audit logging
   - Access control

4. **Network Security**
   - HTTPS enforcement
   - VPN support
   - Firewall rules
   - DDoS protection

## 9. Monitoring and Logging

1. **System Monitoring**
   - Server health checks
   - Resource usage monitoring
   - Performance metrics
   - Error tracking

2. **Application Logging**
   - Request logging
   - Error logging
   - Audit logging
   - Security logging

3. **User Activity**
   - Login attempts
   - Service usage
   - Payment transactions
   - Support interactions

## 10. Future Enhancements

1. **Planned Features**
   - Kubernetes integration
   - Container management
   - Serverless functions
   - AI-powered monitoring

2. **Infrastructure**
   - Multi-region deployment
   - Load balancing
   - Auto-scaling
   - Disaster recovery

3. **User Experience**
   - Mobile application
   - API client libraries
   - Enhanced analytics
   - Custom dashboards 