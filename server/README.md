# Nettoria Cloud Service Provider Platform

A comprehensive cloud service provider platform built with Node.js and Express that allows users to register, manage virtual machines, handle billing, and access support services.

## Features

### Authentication
- Complete user registration with personal details (name, email, phone, password)
- Phone number verification via SMS with verification code
- Email verification through verification links
- Multiple login methods (email/phone + password or one-time password)
- Persistent login with JWT tokens
- Secure password reset functionality
- Profile completion with national ID verification

### Service Management
- Ready-made service plans with configurable options
- Custom service configurations (CPU, RAM, storage, IP, traffic)
- Multiple datacenter options
- Various operating system choices
- Flexible payment periods (monthly, quarterly, biannual, annual)
- Hourly billing option with wallet integration

### Billing and Finance
- Invoice generation for orders
- Multiple payment gateways integration
- Discount code support
- Transaction history with status tracking (paid, pending, rejected)
- Wallet system for hourly services with automatic balance management
- SMS notifications for low wallet balance
- Service suspension for expired services

### VM Management via vCenter
- Automated VM creation based on customer configurations
- VM operations (power on/off, restart)
- OS rebuilding capability
- Service termination and cleanup after grace period
- Resource allocation according to service plans

### User Dashboard
- Service listing with details
- Transaction history
- Service extension and cancellation options
- Notification center

### Support System
- Ticket creation with categorization (financial, technical, other)
- File attachment support
- Notifications via email
- Ticket status tracking

### Admin Dashboard
- User management
- Order monitoring
- Reporting capabilities
- Ticket response system
- Marketing message distribution via email and SMS

## Technology Stack

- **Backend**: Node.js, Express.js (RESTful API)
- **Database**: MySQL/PostgreSQL (SQL Server compatible)
- **Authentication**: JWT (JSON Web Tokens)
- **Infrastructure Integration**: vCenter API
- **Notification**: Email and SMS services
- **Documentation**: Swagger API docs

## Getting Started

### Prerequisites

- Node.js (v14.x or higher)
- MySQL or PostgreSQL
- vCenter API access (for production)
- SMS service API credentials
- Email service configuration

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-org/nettoria.git
   cd nettoria/server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and update with your configurations:
   ```
   cp .env.example .env
   ```
   
   Important environment variables to configure:
   - Database connection details
   - JWT secret key
   - SMS service API credentials
   - Email service settings
   - vCenter connection parameters

4. Set up the database:
   ```
   npm run setup-db
   ```

5. Start the development server:
   ```
   npm run dev
   ```
   
   For production:
   ```
   npm start
   ```

6. Access the API documentation:
   Open `http://localhost:5000/api-docs` in your browser.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/verify-phone` - Verify phone number
- `GET /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/login` - Login with email/phone and password
- `POST /api/auth/request-otp` - Request OTP for login
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `PATCH /api/auth/update-profile` - Update user profile
- `PATCH /api/auth/complete-profile` - Complete user profile with national ID

### Services

- `GET /api/services` - Get all available services
- `GET /api/services/:id` - Get service details
- `POST /api/services/configure` - Configure service before order
- `GET /api/services/plans` - Get predefined service plans

### Orders

- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/pay` - Pay for an order
- `POST /api/orders/:id/cancel` - Cancel an order
- `POST /api/orders/:id/apply-discount` - Apply discount code

### VM Management

- `GET /api/vcenter/vms` - Get user VMs
- `GET /api/vcenter/vms/:id` - Get VM details
- `POST /api/vcenter/vms/:id/power` - Power on/off VM
- `POST /api/vcenter/vms/:id/restart` - Restart VM
- `POST /api/vcenter/vms/:id/rebuild` - Rebuild VM (change OS)
- `GET /api/vcenter/vms/:id/status` - Get VM current status

### Wallet

- `GET /api/wallet` - Get wallet balance and details
- `POST /api/wallet/topup` - Add funds to wallet
- `GET /api/wallet/transactions` - Get wallet transactions
- `POST /api/wallet/withdraw` - Request withdrawal (admin approval required)

### Tickets

- `POST /api/tickets` - Create a new ticket
- `GET /api/tickets` - Get user tickets
- `GET /api/tickets/:id` - Get ticket details
- `POST /api/tickets/:id/reply` - Reply to a ticket
- `PATCH /api/tickets/:id/close` - Close a ticket
- `POST /api/tickets/:id/attachment` - Add attachment to ticket

### Admin

- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/orders` - Get all orders (admin only)
- `GET /api/admin/tickets` - Get all tickets (admin only)
- `POST /api/admin/notification` - Send notification to users (admin only)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the ISC License. 