# API Documentation

## Authentication

### Login
- **POST** `/api/auth/login`
- **Body**: `{ email: string, password: string }`
- **Response**: `{ token: string, user: User }`

### Register
- **POST** `/api/auth/register`
- **Body**: `{ email: string, password: string, name: string }`
- **Response**: `{ token: string, user: User }`

### One-Time Login
- **POST** `/api/one-time-login/generate`
- **Body**: `{ email: string }`
- **Response**: `{ message: string }`

- **POST** `/api/one-time-login/validate`
- **Body**: `{ token: string }`
- **Response**: `{ token: string, user: User }`

- **GET** `/api/one-time-login/status/:token`
- **Response**: `{ valid: boolean, message: string }`

### Success Password
- **POST** `/api/success-password/set`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ password: string }`
- **Response**: `{ message: string }`

- **POST** `/api/success-password/verify`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ password: string }`
- **Response**: `{ message: string }`

- **POST** `/api/success-password/reset`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message: string }`

## Cart Management

### Get Cart
- **GET** `/api/cart`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ items: CartItem[], total: number }`

### Add to Cart
- **POST** `/api/cart/add`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ serviceId: string, quantity: number }`
- **Response**: `{ items: CartItem[], total: number }`

### Update Cart Item
- **PUT** `/api/cart/update/:itemId`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ quantity: number }`
- **Response**: `{ items: CartItem[], total: number }`

### Remove from Cart
- **DELETE** `/api/cart/remove/:itemId`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ items: CartItem[], total: number }`

### Clear Cart
- **DELETE** `/api/cart/clear`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message: string }`

### Get Cart Total
- **GET** `/api/cart/total`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ total: number }`

## Withdrawal Management

### Get Withdrawal History
- **GET** `/api/withdrawals/history`
- **Headers**: `Authorization: Bearer <token>`
- **Query**: `{ page: number, limit: number }`
- **Response**: `{ withdrawals: Withdrawal[], pagination: { total: number, page: number, pages: number } }`

### Request Withdrawal
- **POST** `/api/withdrawals/request`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ amount: number, paymentMethod: string, accountDetails: object }`
- **Response**: `{ withdrawal: Withdrawal }`

### Get Withdrawal Status
- **GET** `/api/withdrawals/status/:withdrawalId`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ withdrawal: Withdrawal }`

### Cancel Withdrawal
- **POST** `/api/withdrawals/cancel/:withdrawalId`
- **Headers**: `Authorization: Bearer <token>`
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

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Authentication endpoints: 5 requests per minute
- Other endpoints: 60 requests per minute

## Security

1. All sensitive endpoints require authentication via JWT token
2. Passwords are hashed using PBKDF2
3. Success passwords are hashed and salted
4. One-time login tokens expire after 15 minutes
5. All API requests must be made over HTTPS
6. CORS is enabled for specific origins only

## Data Validation

All input data is validated using express-validator:
- Email addresses must be valid
- Passwords must meet complexity requirements
- Numeric values must be within acceptable ranges
- Required fields must be present
- String lengths must be within limits

## Pagination

Endpoints that return lists support pagination:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

## Response Format

All successful responses follow this format:
```json
{
    "success": true,
    "data": {} // Response data
}
``` 