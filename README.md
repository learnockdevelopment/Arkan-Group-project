## Backend API Documentation

This project exposes a set of REST APIs using Next.js Route Handlers with MongoDB (via Mongoose) for authentication, profile management, roles, and wallet.

### Environment
- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DBNAME` (optional): Database name
- `JWT_SECRET`: Secret for signing JWTs
- `JWT_EXPIRES_IN` (optional): e.g. `7d`

### Auth Headers
- All endpoints require `x-api-key: <API_KEY>`
- API key is validated against the `API_KEY` value in your `.env.local`
- Authenticated user endpoints also require `Authorization: Bearer <jwt>`

### Health
- GET `/api/health`
  - 200: `{ status: "ok", db: "connected" }`
  - 500: `{ status: "error", message }`

### Roles (Admin)
- POST `/api/admin/seed-roles`
  - Headers: `x-api-key: <API_KEY>`
  - 200: `{ seeded: true }`

- POST `/api/admin/seed-admin`
  - Headers: `x-api-key: <API_KEY>`
  - Seeds first admin using env overrides or defaults:
    - `ADMIN_EMAIL`, `ADMIN_PHONE`, `ADMIN_FIRST_NAME`, `ADMIN_LAST_NAME`, `ADMIN_PIN`
  - 200: `{ seeded: true, admin: { id, email, phone } }`

### Registration Flow
Registration is multi-step: init → verify email → verify phone → set PIN.

1) Init registration
- POST `/api/auth/register/init`
  - Headers: `x-api-key`
  - Body:
    ```json
    { "firstName":"John", "lastName":"Doe", "email":"john@doe.com", "phone":"+15551234567" }
    ```
  - 201: `{ "userId": "..." }`

2) Verify email
- POST `/api/auth/register/verify-email`
  - Headers: `x-api-key`
  - Send code
    - Body: `{ "userId": "...", "action": "send" }`
    - 200: `{ "sent": true, "devCode": "123456" }` (devCode is returned in dev only)
  - Verify code
    - Body: `{ "userId": "...", "action": "verify", "code": "123456" }`
    - 200: `{ "verified": true }`

3) Verify phone
- POST `/api/auth/register/verify-phone`
  - Headers: `x-api-key`
  - Send code
    - Body: `{ "userId": "...", "action": "send" }`
    - 200: `{ "sent": true, "devCode": "654321" }`
  - Verify code
    - Body: `{ "userId": "...", "action": "verify", "code": "654321" }`
    - 200: `{ "verified": true }`

4) Set PIN
- POST `/api/auth/register/set-pin`
  - Headers: `x-api-key`
  - Body: `{ "userId": "...", "pin": "173942" }`
    - Rules: 6 digits, all unique, not sequential ascending/descending
  - Side effect: if both email and phone are verified, user `status` becomes `active`
  - 200: `{ "token": "<jwt>" }`

### Login
- POST `/api/auth/login`
  - Headers: `x-api-key`
  - Body:
    ```json
    { "identifier": "john@doe.com", "pin": "173942" }
    // or { "identifier": "+15551234567", "pin": "173942" }
    ```
  - 200: `{ "token": "<jwt>" }`
  - 403: `{ "message": "User is banned" }`
  - 401: `{ "message": "Invalid credentials" }`

### Password Reset
1) Request code
- POST `/api/auth/password/request`
  - Headers: `x-api-key`
  - Body: `{ "identifier": "john@doe.com" }` or `{ "identifier": "+15551234567" }`
  - 200: `{ "sent": true, "devCode": "123456" }`

2) Reset password
- POST `/api/auth/password/reset`
  - Headers: `x-api-key`
  - Body: `{ "identifier": "john@doe.com", "code": "123456", "newPassword": "MyNewPass1!" }`
  - 200: `{ "reset": true }`

### Profile
- GET `/api/profile`
  - Headers: `x-api-key`, `Authorization: Bearer <jwt>`
  - 200: `{ "user": { "firstName", "lastName", "email", "phone", "avatarUrl", "roleId", "status" } }`

- PATCH `/api/profile`
  - Headers: `x-api-key`, `Authorization: Bearer <jwt>`
  - Body (any subset): `{ "firstName": "Jane", "lastName": "Doe", "avatarUrl": "https://..." }`
  - 200: `{ "user": { ...updated } }`

#### Change Email (with OTP)
- POST `/api/profile/change-email`
  - Headers: `x-api-key`, `Authorization: Bearer <jwt>`
  - Send: `{ "action": "send", "newEmail": "new@doe.com" }` → `{ "sent": true, "devCode": "..." }`
  - Verify: `{ "action": "verify", "newEmail": "new@doe.com", "code": "..." }` → `{ "updated": true }`

#### Change Phone (with OTP)
- POST `/api/profile/change-phone`
  - Headers: `x-api-key`, `Authorization: Bearer <jwt>`
  - Send: `{ "action": "send", "newPhone": "+15557654321" }` → `{ "sent": true, "devCode": "..." }`
  - Verify: `{ "action": "verify", "newPhone": "+15557654321", "code": "..." }` → `{ "updated": true }`

### Wallet
- GET `/api/wallet`
  - Headers: `x-api-key`, `Authorization: Bearer <jwt>`
  - 200: `{ "wallet": { "userId", "balance", "currency" } }` (auto-creates if missing)

### Authorization & API Keys
- API key middleware checks `x-api-key` and attaches an API role (e.g., `admin` for admin-only routes)
- JWT contains user identity and role; required on user endpoints
- Roles supported: `admin`, `owner`, `user`

### Common Errors
- 400: `{ "message": "Missing fields" }`
- 401: `{ "message": "Missing API key" | "Invalid token" | "Invalid API key" }`
- 403: `{ "message": "Forbidden" }`
- 404: `{ "message": "User not found" }`
- 409: `{ "message": "Email or phone already in use" }`

### Notes
- OTP delivery is stubbed; in development, responses include `devCode` for convenience. Integrate your email/SMS providers and remove `devCode` in production.
- PIN policy: exactly 6 digits, all unique, not sequential ascending or descending.
- Ensure you seed roles before assigning/admin actions: `POST /api/admin/seed-roles`.


