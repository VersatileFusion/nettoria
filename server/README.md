# Nettoria Cloud Service Provider Platform

A cloud service provider platform built with Node.js and Express that allows users to register, manage virtual machines, and handle billing.

## Features

- User authentication with JWT (email/phone + password or OTP)
- Phone verification with SMS
- Email verification
- Password reset functionality
- VM provisioning and management via vCenter API
- Service ordering and configuration
- Billing and invoicing
- Wallet for hourly services
- Ticket system for support
- Admin dashboard
- Swagger API documentation

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL/PostgreSQL
- **Authentication**: JWT
- **API Documentation**: Swagger
- **Infrastructure Integration**: vCenter API

## Getting Started

### Prerequisites

- Node.js (v14.x or higher)
- MySQL or PostgreSQL
- vCenter API access (for production)

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

4. Set up the database:
   ```
   npm run setup-db
   ```

5. Start the development server:
   ```
   npm run dev
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

### Services

- `GET /api/services` - Get all available services
- `GET /api/services/:id` - Get service details
- `POST /api/services/configure` - Configure service before order

### Orders

- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/pay` - Pay for an order
- `POST /api/orders/:id/cancel` - Cancel an order

### VM Management

- `GET /api/vcenter/vms` - Get user VMs
- `GET /api/vcenter/vms/:id` - Get VM details
- `POST /api/vcenter/vms/:id/power` - Power on/off VM
- `POST /api/vcenter/vms/:id/restart` - Restart VM
- `POST /api/vcenter/vms/:id/rebuild` - Rebuild VM

### Wallet

- `GET /api/wallet` - Get wallet balance
- `POST /api/wallet/topup` - Add funds to wallet
- `GET /api/wallet/transactions` - Get wallet transactions

### Tickets

- `POST /api/tickets` - Create a new ticket
- `GET /api/tickets` - Get user tickets
- `GET /api/tickets/:id` - Get ticket details
- `POST /api/tickets/:id/reply` - Reply to a ticket
- `PATCH /api/tickets/:id/close` - Close a ticket

## License

This project is licensed under the ISC License. 