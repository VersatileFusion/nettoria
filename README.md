# Nettoria - Cloud Services Platform

Nettoria is a comprehensive cloud services platform that provides VPN, Domain Management, Virtual Server Hosting, and other cloud-based solutions. The platform offers a modern, secure, and user-friendly interface for managing various cloud services.

## 🌟 Features

### Core Services

- **Virtual Server Hosting**
  - Customizable VM configurations
  - Real-time server monitoring
  - Automated backups
  - Resource scaling
  - Multiple datacenter locations
  - Various OS options

- **VPN Services**
  - Secure VPN connections
  - Multiple server locations
  - Real-time connection monitoring
  - Bandwidth usage tracking
  - Custom VPN configurations
  - Multiple protocol support

- **Domain Management**
  - Domain registration and management
  - DNS record management
  - Domain transfer services
  - SSL certificate integration
  - WHOIS privacy protection
  - Auto-renewal options

- **Cloud Hosting**
  - Managed cloud solutions
  - Load balancing
  - Auto-scaling
  - High availability
  - CDN integration
  - Backup solutions

### Additional Features

- **User Management**
  - Two-factor authentication
  - Role-based access control
  - User profile management
  - Security preferences
  - Activity logging
  - Session management

- **Payment System**
  - Secure payment processing
  - Multiple currency support
  - Transaction history
  - Automated billing
  - Multiple payment gateways
  - Invoice generation

- **Support System**
  - Ticket management
  - Real-time chat support
  - Knowledge base
  - FAQ section
  - Priority support
  - SLA monitoring

- **Blog System**
  - Content management
  - Comment system
  - SEO optimization
  - Social sharing
  - Analytics integration
  - Newsletter subscription

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MySQL (v8.0 or higher)
- Git
- VMware vCenter (for VM management)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/VersatileFusion/Nettoria.git
cd Nettoria
```

2. Install dependencies:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
```

3. Configure environment variables:

```bash
# Create .env file in root directory
cp .env.example .env

# Create .env file in server directory
cd server
cp .env.example .env
```

4. Update the environment variables in both `.env` files with your configuration.

5. Initialize the database:

```bash
# From the root directory
node setup-nettoria-db.js
```

6. Start the development servers:

```bash
# Start the backend server
cd server
npm run dev

# In a new terminal, start the frontend
cd public
npm run dev
```

## 📁 Project Structure

```
Nettoria/
├── public/                 # Frontend files
│   ├── Assets/            # Static assets
│   │   ├── Css/          # Stylesheets
│   │   ├── Js/           # JavaScript files
│   │   └── Images/       # Image assets
│   └── *.html            # HTML pages
├── server/                # Backend files
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Custom middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   └── tests/            # Test files
└── docs/                 # Documentation
```

## 🔧 API Documentation

The API documentation is available at `/api-docs` when running the server. It provides detailed information about all available endpoints, request/response formats, and authentication requirements.

## 🛠️ Development

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "suite name"

# Run frontend tests
cd public
npm test

# Run backend tests
cd server
npm test
```

### Code Style

The project uses ESLint for code linting. Run the linter:

```bash
# Lint all code
npm run lint

# Lint frontend code
cd public
npm run lint

# Lint backend code
cd server
npm run lint
```

### Building for Production

```bash
# Build frontend
cd public
npm run build

# Build backend
cd server
npm run build

# Start production server
cd server
npm start
```

## 🔒 Security

- JWT-based authentication
- Two-factor authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure password hashing
- Session management
- Audit logging

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support, please:

1. Check the [documentation](docs/)
2. Open a support ticket in the dashboard
3. Contact our support team at support@nettoria.com
4. Join our [Discord community](https://discord.gg/nettoria)

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/)
- [Sequelize](https://sequelize.org/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Bootstrap](https://getbootstrap.com/)
- [jQuery](https://jquery.com/)
- [VMware vSphere](https://www.vmware.com/products/vsphere.html)

## 📞 Contact

- Website: [nettoria.com](https://nettoria.com)
- Email: contact@nettoria.com
- Twitter: [@NettoriaCloud](https://twitter.com/NettoriaCloud)
- LinkedIn: [Nettoria](https://linkedin.com/company/nettoria)
- Discord: [Nettoria Community](https://discord.gg/nettoria)
