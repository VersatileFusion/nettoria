# API Documentation

## Authentication

### Login

- **POST** `/api/auth/login`
- **Body**: `{ email: string, password: string }`
- **Response**: `{ token: string, user: User }`

### Register

- **POST** `/api/auth/register`
- **Body**: `{ email: string, password: string, name: string, phone: string }`
- **Response**: `{ token: string, user: User }`

### One-Time Login

- **POST** `/api/one-time-login/generate`
- **Body**: `{ email: string }`
- **Response**: `{ message: string }`

- **POST** `/api/one-time-login/validate`
- **Body**: `{ token: string }`
- **Response**: `{ token: string, user: User }`

### Two-Factor Authentication

- **POST** `/api/auth/2fa/setup`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ secret: string, qrCode: string }`

- **POST** `/api/auth/2fa/verify`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ code: string }`
- **Response**: `{ verified: boolean }`

## Virtual Server Management

### List VMs

- **GET** `/api/virtual-server/list`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ vms: VM[] }`

### Create VM

- **POST** `/api/virtual-server/create`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ plan: string, os: string, datacenter: string }`
- **Response**: `{ vm: VM }`

### VM Operations

- **POST** `/api/virtual-server/:id/power`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ action: 'start' | 'stop' | 'restart' }`
- **Response**: `{ status: string }`

## VPN Management

### List VPN Services

- **GET** `/api/vpn/services`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ services: VPNService[] }`

### Create VPN

- **POST** `/api/vpn/create`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ plan: string, location: string }`
- **Response**: `{ vpn: VPN }`

### VPN Configuration

- **GET** `/api/vpn/:id/config`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ config: string }`

## Domain Management

### List Domains

- **GET** `/api/domains`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ domains: Domain[] }`

### Register Domain

- **POST** `/api/domains/register`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ domain: string, period: number }`
- **Response**: `{ domain: Domain }`

### DNS Management

- **GET** `/api/domains/:id/dns`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ records: DNSRecord[] }`

## SMS Services

### List SMS Services

- **GET** `/api/sms/services`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ services: SMSService[] }`

### Send SMS

- **POST** `/api/sms/send`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ to: string, message: string }`
- **Response**: `{ status: string, messageId: string }`

## Blog System

### List Posts

- **GET** `/api/blog/posts`
- **Query**: `{ page: number, limit: number }`
- **Response**: `{ posts: Post[], pagination: Pagination }`

### Create Post

- **POST** `/api/blog/posts`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ title: string, content: string, tags: string[] }`
- **Response**: `{ post: Post }`

### Comments

- **POST** `/api/blog/posts/:id/comments`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ content: string }`
- **Response**: `{ comment: Comment }`

## Support System

### Create Ticket

- **POST** `/api/tickets`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ subject: string, message: string, category: string }`
- **Response**: `{ ticket: Ticket }`

### List Tickets

- **GET** `/api/tickets`
- **Headers**: `Authorization: Bearer <token>`
- **Query**: `{ status: string, page: number }`
- **Response**: `{ tickets: Ticket[], pagination: Pagination }`

## Wallet & Payment

### Wallet Balance

- **GET** `/api/wallet/balance`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ balance: number, currency: string }`

### Add Funds

- **POST** `/api/wallet/deposit`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ amount: number, method: string }`
- **Response**: `{ transaction: Transaction }`

### Withdraw

- **POST** `/api/wallet/withdraw`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ amount: number, method: string, details: object }`
- **Response**: `{ withdrawal: Withdrawal }`

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": {} // Optional additional error details
  }
}
```

Common error codes:

- `INVALID_INPUT`: Validation error
- `UNAUTHORIZED`: Authentication error
- `FORBIDDEN`: Authorization error
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Server error
- `SERVICE_UNAVAILABLE`: Service temporarily unavailable
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INVALID_CREDENTIALS`: Invalid login credentials
- `ACCOUNT_LOCKED`: Account temporarily locked
- `INSUFFICIENT_FUNDS`: Not enough balance
- `SERVICE_LIMIT_REACHED`: Service quota exceeded

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- Authentication endpoints: 5 requests per minute
- API endpoints: 60 requests per minute
- File upload endpoints: 10 requests per minute
- SMS endpoints: 3 requests per minute

## Security

1. All sensitive endpoints require authentication via JWT token
2. Passwords are hashed using PBKDF2
3. Two-factor authentication support
4. One-time login tokens expire after 15 minutes
5. All API requests must be made over HTTPS
6. CORS is enabled for specific origins only
7. Rate limiting on all endpoints
8. Input validation and sanitization
9. SQL injection prevention
10. XSS protection

## Data Validation

All input data is validated using express-validator:

- Email addresses must be valid
- Passwords must meet complexity requirements
- Phone numbers must be valid
- Numeric values must be within acceptable ranges
- Required fields must be present
- String lengths must be within limits
- File uploads must meet size and type restrictions

## Pagination

Endpoints that return lists support pagination:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Sort field (default: 'createdAt')
- `order`: Sort order ('asc' or 'desc')

## Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "data": {} // Response data
}
```

Pagination responses include:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "total": number,
      "page": number,
      "pages": number,
      "limit": number
    }
  }
}
```
