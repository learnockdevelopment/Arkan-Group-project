# Arkan Property Investment Platform - Complete API Documentation

## Overview

This document provides comprehensive documentation for all APIs in the Arkan Property Investment Platform. The platform supports fractional real estate investment through three property types: Single Properties, Projects, and Bundles.

## Authentication & Authorization

### API Key Requirement
**ALL endpoints require an API key in the header:**
```
x-api-key: <API_KEY>
```

### JWT Authentication
User-specific endpoints also require JWT authentication:
```
Authorization: Bearer <jwt_token>
```

### Roles
- **Public**: Can view properties and calculate investments (with API key)
- **User**: Can create investments and manage portfolio
- **Owner**: Can create and manage their own properties
- **Admin**: Full access to all properties and system analytics

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/arkan
MONGODB_DBNAME=arkan
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
API_KEY=your-api-key
```

---

## 🏥 Health & System APIs

### Health Check
```http
GET /api/health
```

**Headers:**
```
x-api-key: <API_KEY>
```

**Response:**
```json
{
  "status": "ok",
  "db": "connected"
}
```

---

## 👥 Authentication APIs

### 1. Initialize Registration
```http
POST /api/auth/register/init
```

**Headers:**
```
x-api-key: <API_KEY>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "userId": "user_id_here"
}
```

### 2. Verify Email
```http
POST /api/auth/register/verify-email
```

**Headers:**
```
x-api-key: <API_KEY>
```

**Send Code:**
```json
{
  "userId": "user_id",
  "action": "send"
}
```

**Verify Code:**
```json
{
  "userId": "user_id",
  "action": "verify",
  "code": "123456"
}
```

### 3. Verify Phone
```http
POST /api/auth/register/verify-phone
```

**Headers:**
```
x-api-key: <API_KEY>
```

**Send Code:**
```json
{
  "userId": "user_id",
  "action": "send"
}
```

**Verify Code:**
```json
{
  "userId": "user_id",
  "action": "verify", 
  "code": "654321"
}
```

### 4. Set PIN
```http
POST /api/auth/register/set-pin
```

**Headers:**
```
x-api-key: <API_KEY>
```

**Request Body:**
```json
{
  "userId": "user_id",
  "pin": "173942"
}
```

**Response:**
```json
{
  "token": "jwt_token_here"
}
```

### 5. Login
```http
POST /api/auth/login
```

**Headers:**
```
x-api-key: <API_KEY>
```

**Request Body:**
```json
{
  "identifier": "john@example.com",
  "pin": "173942"
}
```

**Response:**
```json
{
  "token": "jwt_token_here"
}
```

### 6. Password Reset Request
```http
POST /api/auth/password/request
```

**Headers:**
```
x-api-key: <API_KEY>
```

**Request Body:**
```json
{
  "identifier": "john@example.com"
}
```

### 7. Password Reset
```http
POST /api/auth/password/reset
```

**Headers:**
```
x-api-key: <API_KEY>
```

**Request Body:**
```json
{
  "identifier": "john@example.com",
  "code": "123456",
  "newPassword": "NewPassword123!"
}
```

---

## 👤 Profile Management APIs

### Get Profile
```http
GET /api/profile
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "user": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "avatarUrl": "https://...",
    "roleId": "role_id",
    "status": "active"
  }
}
```

### Update Profile
```http
PATCH /api/profile
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "avatarUrl": "https://new-avatar-url.com"
}
```

### Change Email
```http
POST /api/profile/change-email
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <jwt_token>
```

**Send Code:**
```json
{
  "action": "send",
  "newEmail": "new@example.com"
}
```

**Verify Code:**
```json
{
  "action": "verify",
  "newEmail": "new@example.com",
  "code": "123456"
}
```

### Change Phone
```http
POST /api/profile/change-phone
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <jwt_token>
```

**Send Code:**
```json
{
  "action": "send",
  "newPhone": "+1987654321"
}
```

**Verify Code:**
```json
{
  "action": "verify",
  "newPhone": "+1987654321",
  "code": "654321"
}
```

---

## 💰 Wallet APIs

### Get Wallet
```http
GET /api/wallet
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "wallet": {
    "userId": "user_id",
    "balance": 1000.00,
    "currency": "EGP"
  }
}
```

---

## 🏠 Property APIs (Public)

### 1. List Properties
```http
GET /api/properties
```

**Headers:**
```
x-api-key: <API_KEY>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12, max: 50)
- `type` (string): Filter by type ('single', 'project', 'bundle')
- `status` (string): Filter by status
- `location` (string): Filter by location (partial match)
- `minPrice`, `maxPrice` (number): Price range filter
- `minRoi`, `maxRoi` (number): ROI range filter
- `rooms`, `bathrooms` (number): Property details filter
- `featured` (boolean): Show only featured properties
- `available` (boolean): Show only available properties
- `search` (string): Search in name, location, about, offers
- `sortBy` (string): Sort field ('createdAt', 'price', 'roi', 'deliveryDate', 'viewCount')
- `sortOrder` (string): Sort direction ('asc', 'desc')

**Example:**
```http
GET /api/properties?type=single&minPrice=1000000&maxPrice=5000000&sortBy=price&sortOrder=asc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "property_id",
        "name": "Luxury Villa in New Cairo",
        "type": "single",
        "location": "New Cairo, Egypt",
        "price": 2500000,
        "roi": 15,
        "totalShares": 50,
        "availableShares": 45,
        "sharePrice": 50000,
        "isFeatured": true,
        "developer": {
          "firstName": "Ahmed",
          "lastName": "Hassan"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 25,
      "limit": 12,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 2. Get Property Details
```http
GET /api/properties/{id}
```

**Headers:**
```
x-api-key: <API_KEY>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "property_id",
    "name": "Luxury Villa in New Cairo",
    "type": "single",
    "location": "New Cairo, Egypt",
    "price": 2500000,
    "roi": 15,
    "totalShares": 50,
    "availableShares": 45,
    "sharePrice": 50000,
    "shareDownPayment": 12500,
    "shareInstallment": 3125,
    "maxSharesPerUser": 10,
    "numberOfInstallments": 12,
    "installmentsFrequency": "monthly",
    "deliveryDate": "2025-06-30",
    "developer": {
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "email": "developer1@arkan.com"
    },
    "analytics": {
      "totalInvestments": 5,
      "uniqueInvestors": 4,
      "recentViews": 150,
      "fundingPercentage": 10,
      "remainingShares": 45
    },
    "keyHighlights": [
      {
        "label": "Property Value",
        "value": "2.5M EGP"
      }
    ],
    "reasonsToInvest": [
      {
        "title": "Prime Location",
        "desc": "Located in New Cairo's most prestigious neighborhood"
      }
    ],
    "offers": [
      "Private Garden",
      "Swimming Pool",
      "Security System"
    ],
    "documents": [
      {
        "title": "Property License",
        "url": "https://example.com/license.pdf"
      }
    ]
  }
}
```

### 3. Calculate Investment
```http
POST /api/properties/{id}
```

**Headers:**
```
x-api-key: <API_KEY>
```

**Request Body:**
```json
{
  "shares": 5,
  "userId": "optional_user_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "propertyId": "property_id",
    "propertyName": "Luxury Villa in New Cairo",
    "sharesRequested": 5,
    "availableShares": 45,
    "sharePrice": 50000,
    "totalInvestment": 250000,
    "paymentStructure": {
      "downPayment": 62500,
      "installmentAmount": 15625,
      "numberOfInstallments": 12,
      "frequency": "monthly",
      "installmentSchedule": [
        {
          "installmentNumber": 1,
          "amount": 15625,
          "dueDate": "2024-11-08"
        }
      ]
    },
    "expectedDelivery": "2025-06-30",
    "expectedROI": 15
  }
}
```

### 4. Featured Properties
```http
GET /api/properties/featured
```

**Headers:**
```
x-api-key: <API_KEY>
```

**Query Parameters:**
- `limit` (number): Max items (default: 6, max: 20)
- `type` (string): Filter by type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "property_id",
      "name": "Featured Property",
      "type": "single",
      "price": 2500000,
      "roi": 15,
      "isFeatured": true
    }
  ]
}
```

### 5. Search Properties
```http
GET /api/properties/search
```

**Headers:**
```
x-api-key: <API_KEY>
```

**Query Parameters:**
- `q` (string): Search query (required)
- `limit` (number): Max results (default: 10, max: 20)
- `type` (string): Filter by type
- `location` (string): Filter by location

**Example:**
```http
GET /api/properties/search?q=villa&type=single&limit=5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "property_id",
        "name": "Luxury Villa in New Cairo",
        "type": "single",
        "location": "New Cairo, Egypt"
      }
    ],
    "suggestions": [
      {
        "name": "Villa Compound",
        "location": "New Cairo",
        "type": "single"
      }
    ],
    "query": "villa",
    "totalResults": 1
  }
}
```

---

## 💼 Investment APIs (User Authentication Required)

### 1. Get User Investments
```http
GET /api/investments
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by status ('pending', 'active', 'completed', 'cancelled')
- `propertyType`: Filter by property type
- `sortBy`, `sortOrder`: Sorting options

**Response:**
```json
{
  "success": true,
  "data": {
    "investments": [
      {
        "id": "investment_id",
        "propertyId": "property_id",
        "sharesInvested": 5,
        "totalInvestment": 250000,
        "downPayment": 62500,
        "downPaymentPaid": true,
        "status": "active",
        "paymentProgress": 25.5,
        "property": {
          "name": "Luxury Villa",
          "type": "single",
          "location": "New Cairo"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalCount": 15
    }
  }
}
```

### 2. Create Investment
```http
POST /api/investments
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "propertyId": "property_id",
  "sharesInvested": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Investment created successfully",
  "data": {
    "id": "investment_id",
    "userId": "user_id",
    "propertyId": "property_id",
    "sharesInvested": 5,
    "totalInvestment": 250000,
    "downPayment": 62500,
    "status": "pending",
    "installments": [...]
  }
}
```

### 3. Get Investment Details
```http
GET /api/investments/{id}
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "investment_id",
    "sharesInvested": 5,
    "totalInvestment": 250000,
    "downPayment": 62500,
    "downPaymentPaid": true,
    "installments": [
      {
        "installmentNumber": 1,
        "amount": 15625,
        "dueDate": "2024-11-08",
        "status": "pending"
      }
    ],
    "property": {
      "name": "Luxury Villa",
      "location": "New Cairo"
    }
  }
}
```

### 4. Update Investment (Payment)
```http
PUT /api/investments/{id}
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <jwt_token>
```

**Pay Down Payment:**
```json
{
  "action": "pay_down_payment",
  "transactionId": "TXN-123456"
}
```

**Pay Installment:**
```json
{
  "action": "pay_installment",
  "installmentId": "installment_id",
  "transactionId": "TXN-789012"
}
```

### 5. Cancel Investment
```http
DELETE /api/investments/{id}
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Investment cancelled successfully"
}
```

---

## 💳 Payment APIs

### 1. Get Payment Schedule
```http
GET /api/investments/payments
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status`: Filter by status ('pending', 'overdue', 'upcoming', 'paid', 'all')
- `days`: Number of days for upcoming filter (default: 30)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "investmentId": "investment_id",
      "installmentId": "installment_id",
      "propertyId": "property_id",
      "type": "installment",
      "installmentNumber": 1,
      "amount": 15625,
      "dueDate": "2024-11-08",
      "status": "pending",
      "isOverdue": false,
      "isUpcoming": true
    }
  ]
}
```

### 2. Record Payment
```http
POST /api/investments/payments
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "investmentId": "investment_id",
  "installmentId": "installment_id",
  "paymentType": "installment",
  "amount": 15625,
  "transactionId": "TXN-123456",
  "paymentMethod": "credit_card"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Installment recorded successfully",
  "data": {
    "investment": {...},
    "paymentDetails": {
      "type": "installment",
      "amount": 15625,
      "transactionId": "TXN-123456",
      "paidAt": "2024-10-08T10:30:00Z"
    }
  }
}
```

---

## 🏢 Admin APIs (Admin Role Required)

### 1. Admin Property Management

#### List All Properties (Admin View)
```http
GET /api/admin/properties
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `type`, `status`, `developerId`: Filters
- `search`: Search term
- `sortBy`, `sortOrder`: Sorting
- `includeInactive`: Include inactive properties

#### Create Property (Admin)
```http
POST /api/admin/properties
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "name": "New Property",
  "type": "single",
  "developerId": "developer_user_id",
  "location": "Cairo, Egypt",
  "image": "https://example.com/image.jpg",
  "about": "Property description...",
  "price": 1000000,
  "advancement": 25,
  "totalShares": 100,
  "maxSharesPerUser": 10,
  "numberOfInstallments": 12,
  "deliveryDate": "2025-12-31",
  "roi": 15
}
```

#### Get Property Details (Admin)
```http
GET /api/admin/properties/{id}
```

#### Update Property (Admin)
```http
PUT /api/admin/properties/{id}
```

#### Delete Property (Admin)
```http
DELETE /api/admin/properties/{id}
```

### 2. Analytics
```http
GET /api/analytics/properties
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `days`: Number of days for analytics (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalProperties": 8,
      "totalInvestments": 25,
      "totalInvestmentValue": 5000000,
      "activeInvestors": 15,
      "averageFundingPercentage": 45.5
    },
    "distributions": {
      "propertiesByType": {
        "single": 3,
        "project": 2,
        "bundle": 3
      },
      "propertiesByStatus": {
        "Available": 6,
        "Funded": 2
      }
    },
    "trends": {
      "monthlyInvestments": [...]
    }
  }
}
```

### 3. Seeding APIs

#### Check Database Status
```http
GET /api/admin/seed-all
```

#### Seed Complete Database
```http
POST /api/admin/seed-all
```

#### Seed Only Properties
```http
POST /api/admin/seed-properties
```

#### Seed Roles
```http
POST /api/admin/seed-roles
```

#### Seed Admin User
```http
POST /api/admin/seed-admin
```

---

## 🏗️ Owner APIs (Owner/Admin Role Required)

### 1. Owner Property Management

#### List Owner Properties
```http
GET /api/owner/properties
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <owner_jwt_token>
```

#### Create Property (Owner)
```http
POST /api/owner/properties
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <owner_jwt_token>
```

**Request Body:** (Same as admin create, but developerId is automatically set to current user)

#### Get Owner Property Details
```http
GET /api/owner/properties/{id}
```

#### Update Owner Property
```http
PUT /api/owner/properties/{id}
```

#### Delete Owner Property
```http
DELETE /api/owner/properties/{id}
```

---

## 📊 Property Types & Investment Logic

### Single Property
- **Description**: Individual properties with fractional ownership
- **Investment Rules**:
  - Maximum shares per user limit
  - Installments start when property is fully funded
  - Users limited by `maxSharesPerUser`

### Project
- **Description**: Large-scale development projects
- **Investment Rules**:
  - No maximum shares per user limit
  - Installments start immediately after down payment
  - Suitable for large developments

### Bundle
- **Description**: Collection of multiple single properties
- **Investment Rules**:
  - Contains multiple single properties
  - Calculations based on total bundle value
  - Has own pricing and share structure

### Share Price Calculations
```typescript
sharePrice = Math.round(price / totalShares);
shareDownPayment = Math.round((sharePrice * advancement) / 100);
shareInstallment = Math.round((sharePrice - shareDownPayment) / numberOfInstallments);
```

---

## 🔒 Security & Error Handling

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid API key or JWT)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate data)
- `500`: Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...] // Validation errors if applicable
}
```

### API Key Security
- All endpoints require valid API key
- API key grants admin-level access to admin endpoints
- Store API key securely in environment variables

### JWT Security
- JWT tokens contain user identity and role
- Tokens expire based on `JWT_EXPIRES_IN` setting
- Include role-based access control

---

## 🔐 Profile Management APIs (Extended)

### Change PIN
```http
POST /api/profile/change-pin
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "currentPin": "123456",
  "newPin": "789012"
}
```

**Response:**
```json
{
  "success": true,
  "message": "PIN changed successfully"
}
```

### ID Verification

#### Submit ID Verification
```http
POST /api/profile/id-verification
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "frontImageUrl": "https://example.com/id-front.jpg",
  "backImageUrl": "https://example.com/id-back.jpg",
  "idType": "national_id",
  "idNumber": "12345678901234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "ID verification submitted successfully. Please wait for admin review.",
  "data": {
    "verificationId": "verification_id",
    "status": "pending",
    "submittedAt": "2024-10-08T10:30:00Z"
  }
}
```

#### Get Verification Status
```http
GET /api/profile/id-verification
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isVerified": false,
    "latestVerification": {
      "status": "pending",
      "submittedAt": "2024-10-08T10:30:00Z",
      "reviewedAt": null,
      "rejectionReason": null
    }
  }
}
```

---

## 💳 Wallet Extended APIs

### Withdraw Funds
```http
POST /api/wallet/withdraw
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "amount": 1000,
  "cardId": "card_id_here",
  "description": "Withdrawal to bank account"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal request processed successfully",
  "data": {
    "transactionId": "WD-1728384000-abc123",
    "amount": 1000,
    "newBalance": 4000,
    "status": "completed",
    "processedAt": "2024-10-08T10:30:00Z"
  }
}
```

### Top-up Wallet
```http
POST /api/wallet/topup
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "amount": 500,
  "cardId": "card_id_here",
  "description": "Top-up from credit card"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Top-up processed successfully",
  "data": {
    "transactionId": "TP-1728384000-xyz789",
    "amount": 500,
    "newBalance": 5500,
    "status": "completed",
    "processedAt": "2024-10-08T10:30:00Z"
  }
}
```

---

## 💳 Card Management APIs

### Get User Cards
```http
GET /api/cards
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "card_id",
      "maskedCardNumber": "**** **** **** 1234",
      "cardHolderName": "John Doe",
      "expiryDate": "12/25",
      "cardType": "visa",
      "cardBrand": "Visa",
      "nickname": "Main Card",
      "isDefault": true,
      "isActive": true
    }
  ]
}
```

### Add New Card
```http
POST /api/cards
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "cardNumber": "4111111111111111",
  "cardHolderName": "John Doe",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "cvv": "123",
  "nickname": "Business Card",
  "billingAddress": {
    "street": "123 Main St",
    "city": "Cairo",
    "state": "Cairo",
    "zipCode": "12345",
    "country": "EG"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Card added successfully",
  "data": {
    "id": "new_card_id",
    "maskedCardNumber": "**** **** **** 1111",
    "cardHolderName": "John Doe",
    "expiryDate": "12/25",
    "cardType": "visa",
    "isDefault": false
  }
}
```

### Get Card Details
```http
GET /api/cards/{id}
```

### Update Card
```http
PUT /api/cards/{id}
```

**Request Body:**
```json
{
  "nickname": "Updated Card Name",
  "billingAddress": {
    "street": "456 New St",
    "city": "Alexandria"
  }
}
```

### Delete Card
```http
DELETE /api/cards/{id}
```

### Set Default Card
```http
POST /api/cards/{id}/set-default
```

**Response:**
```json
{
  "success": true,
  "message": "Card set as default successfully",
  "data": {
    "id": "card_id",
    "maskedCardNumber": "**** **** **** 1234",
    "isDefault": true
  }
}
```

---

## 📝 Blog APIs

### Public Blog APIs

#### List Blogs
```http
GET /api/blogs
```

**Headers:**
```
x-api-key: <API_KEY>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 20)
- `category` (string): Filter by category ('real_estate', 'investment', 'market_news', 'tips', 'company_news', 'general')
- `featured` (boolean): Show only featured blogs
- `search` (string): Search in title, excerpt, content, tags
- `sortBy` (string): Sort field ('publishedAt', 'viewCount', 'likeCount')
- `sortOrder` (string): Sort direction ('asc', 'desc')

**Response:**
```json
{
  "success": true,
  "data": {
    "blogs": [
      {
        "id": "blog_id",
        "title": "The Future of Real Estate Investment in Egypt",
        "slug": "future-real-estate-investment-egypt",
        "excerpt": "Discover the emerging trends and opportunities...",
        "featuredImage": "https://example.com/image.jpg",
        "category": "real_estate",
        "tags": ["real estate", "egypt", "investment"],
        "publishedAt": "2024-10-08T10:30:00Z",
        "readingTime": 5,
        "viewCount": 150,
        "likeCount": 25,
        "author": {
          "firstName": "Admin",
          "lastName": "User",
          "avatarUrl": "https://example.com/avatar.jpg"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 25,
      "limit": 10
    }
  }
}
```

#### Get Blog by Slug
```http
GET /api/blogs/{slug}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "blog_id",
    "title": "Blog Title",
    "slug": "blog-slug",
    "content": "<h2>Full HTML content...</h2>",
    "featuredImage": "https://example.com/image.jpg",
    "category": "real_estate",
    "tags": ["tag1", "tag2"],
    "publishedAt": "2024-10-08T10:30:00Z",
    "readingTime": 5,
    "viewCount": 151,
    "author": {
      "firstName": "Admin",
      "lastName": "User"
    },
    "relatedPosts": [
      {
        "title": "Related Post",
        "slug": "related-post",
        "excerpt": "Related post excerpt...",
        "featuredImage": "https://example.com/related.jpg"
      }
    ]
  }
}
```

#### Get Featured Blogs
```http
GET /api/blogs/featured
```

**Query Parameters:**
- `limit` (number): Max items (default: 5, max: 10)

### Admin Blog Management

#### List All Blogs (Admin)
```http
GET /api/admin/blogs
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `status` (string): Filter by status ('draft', 'published', 'archived', 'all')
- `category`, `authorId`: Filters
- `search`: Search term
- `sortBy`, `sortOrder`: Sorting

#### Create Blog (Admin)
```http
POST /api/admin/blogs
```

**Request Body:**
```json
{
  "title": "New Blog Post",
  "excerpt": "Short description of the blog post...",
  "content": "<h2>Full HTML content of the blog post...</h2>",
  "featuredImage": "https://example.com/featured.jpg",
  "images": ["https://example.com/img1.jpg"],
  "category": "real_estate",
  "tags": ["real estate", "investment"],
  "status": "published",
  "metaTitle": "SEO Title",
  "metaDescription": "SEO Description",
  "keywords": ["keyword1", "keyword2"],
  "isFeatured": true,
  "commentsEnabled": true
}
```

#### Get Blog Details (Admin)
```http
GET /api/admin/blogs/{id}
```

#### Update Blog (Admin)
```http
PUT /api/admin/blogs/{id}
```

#### Delete Blog (Admin)
```http
DELETE /api/admin/blogs/{id}
```

---

## 📞 Contact APIs

### Submit Contact Form (Public)
```http
POST /api/contact
```

**Headers:**
```
x-api-key: <API_KEY>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "Investment Question",
  "message": "I have a question about property investments...",
  "category": "investment_question"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Your message has been sent successfully. We'll get back to you soon!",
  "data": {
    "contactId": "contact_id",
    "submittedAt": "2024-10-08T10:30:00Z"
  }
}
```

### Admin Contact Management

#### List All Contacts (Admin)
```http
GET /api/admin/contacts
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `status` (string): Filter by status ('new', 'in_progress', 'resolved', 'closed', 'all')
- `category` (string): Filter by category
- `priority` (string): Filter by priority ('low', 'medium', 'high', 'urgent')
- `assignedTo` (string): Filter by assigned admin ('unassigned' for unassigned contacts)
- `search`: Search term
- `sortBy`, `sortOrder`: Sorting

**Response:**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": "contact_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "subject": "Investment Question",
        "category": "investment_question",
        "status": "new",
        "priority": "medium",
        "createdAt": "2024-10-08T10:30:00Z",
        "assignedTo": null,
        "user": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 50
    },
    "stats": {
      "new": 15,
      "in_progress": 20,
      "resolved": 10,
      "closed": 5
    }
  }
}
```

#### Get Contact Details (Admin)
```http
GET /api/admin/contacts/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "contact_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "subject": "Investment Question",
    "message": "Full message content...",
    "category": "investment_question",
    "status": "in_progress",
    "priority": "medium",
    "assignedTo": {
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@arkan.com"
    },
    "adminResponse": "Thank you for your question...",
    "responseDate": "2024-10-08T11:00:00Z",
    "internalNotes": [
      {
        "note": "User seems genuinely interested",
        "addedBy": {
          "firstName": "Admin",
          "lastName": "User"
        },
        "addedAt": "2024-10-08T11:00:00Z"
      }
    ],
    "createdAt": "2024-10-08T10:30:00Z"
  }
}
```

#### Update Contact (Admin)
```http
PUT /api/admin/contacts/{id}
```

**Request Body:**
```json
{
  "status": "in_progress",
  "priority": "high",
  "assignedTo": "admin_user_id",
  "adminResponse": "Thank you for contacting us. I'll help you with your question...",
  "internalNote": "User requires follow-up call",
  "followUpRequired": true,
  "followUpDate": "2024-10-10T10:00:00Z"
}
```

#### Delete Contact (Admin)
```http
DELETE /api/admin/contacts/{id}
```

---

## 🆔 ID Verification Management (Admin)

### List ID Verification Requests
```http
GET /api/admin/id-verifications
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `status` (string): Filter by status ('pending', 'approved', 'rejected', 'all')
- `sortBy`, `sortOrder`: Sorting

**Response:**
```json
{
  "success": true,
  "data": {
    "verifications": [
      {
        "id": "verification_id",
        "userId": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "phone": "+1234567890"
        },
        "frontImageUrl": "https://example.com/front.jpg",
        "backImageUrl": "https://example.com/back.jpg",
        "idType": "national_id",
        "status": "pending",
        "submittedAt": "2024-10-08T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalCount": 15
    }
  }
}
```

### Review ID Verification
```http
PUT /api/admin/id-verifications/{id}
```

**Request Body:**
```json
{
  "action": "approve"
}
```

**Or for rejection:**
```json
{
  "action": "reject",
  "rejectionReason": "Document quality is poor, please resubmit with clearer images"
}
```

**Response:**
```json
{
  "success": true,
  "message": "ID verification approved successfully",
  "data": {
    "verificationId": "verification_id",
    "status": "approved",
    "reviewedAt": "2024-10-08T11:00:00Z"
  }
}
```

### Get Verification Details
```http
GET /api/admin/id-verifications/{id}
```

---

## 🌱 Seeding APIs (Admin)

### Seed All Data
```http
POST /api/admin/seed-all
```

**Headers:**
```
x-api-key: <API_KEY>
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Database seeded successfully with all data!",
  "data": {
    "properties": {
      "singleProperties": 3,
      "projects": 2,
      "bundles": 2,
      "totalProperties": 7
    },
    "investments": {
      "investorsCreated": 5,
      "investmentsCreated": 12
    },
    "blogs": {
      "blogsCreated": 7,
      "publishedBlogs": 6,
      "featuredBlogs": 3
    },
    "contacts": {
      "contactsCreated": 9,
      "statusBreakdown": {
        "new": 3,
        "inProgress": 3,
        "resolved": 2,
        "closed": 1
      }
    }
  }
}
```

### Seed Individual Components

#### Seed Properties Only
```http
POST /api/admin/seed-properties
```

#### Seed Blogs Only
```http
POST /api/admin/seed-blogs
```

#### Seed Contacts Only
```http
POST /api/admin/seed-contacts
```

#### Check Seeding Status
```http
GET /api/admin/seed-all
```

**Response:**
```json
{
  "success": true,
  "data": {
    "properties": {
      "total": 7,
      "single": 3,
      "projects": 2,
      "bundles": 2
    },
    "investments": {
      "total": 12,
      "active": 10
    },
    "blogs": {
      "total": 7,
      "published": 6
    },
    "contacts": {
      "total": 9,
      "new": 3
    },
    "users": {
      "total": 8
    },
    "seedingRecommended": false,
    "message": "Database contains 7 properties, 12 investments, 7 blogs, and 9 contacts."
  }
}
```

---

## 🧪 Testing Examples

### Test Property Listing
```bash
curl -X GET "http://localhost:3000/api/properties?type=single&limit=5" \
  -H "x-api-key: your-api-key"
```

### Test Investment Creation
```bash
curl -X POST "http://localhost:3000/api/investments" \
  -H "x-api-key: your-api-key" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"propertyId": "property-id", "sharesInvested": 3}'
```

### Test Admin Property Creation
```bash
curl -X POST "http://localhost:3000/api/admin/properties" \
  -H "x-api-key: your-api-key" \
  -H "Authorization: Bearer admin-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Property",
    "type": "single",
    "developerId": "developer-id",
    "location": "Cairo, Egypt",
    "price": 1000000,
    "advancement": 25,
    "totalShares": 100
  }'
```

### Test Change PIN
```bash
curl -X POST "http://localhost:3000/api/profile/change-pin" \
  -H "x-api-key: your-api-key" \
  -H "Authorization: Bearer user-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"currentPin": "123456", "newPin": "789012"}'
```

### Test ID Verification
```bash
curl -X POST "http://localhost:3000/api/profile/id-verification" \
  -H "x-api-key: your-api-key" \
  -H "Authorization: Bearer user-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "frontImageUrl": "https://example.com/id-front.jpg",
    "backImageUrl": "https://example.com/id-back.jpg",
    "idType": "national_id"
  }'
```

### Test Wallet Top-up
```bash
curl -X POST "http://localhost:3000/api/wallet/topup" \
  -H "x-api-key: your-api-key" \
  -H "Authorization: Bearer user-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"amount": 500, "cardId": "card-id"}'
```

### Test Add Card
```bash
curl -X POST "http://localhost:3000/api/cards" \
  -H "x-api-key: your-api-key" \
  -H "Authorization: Bearer user-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "cardNumber": "4111111111111111",
    "cardHolderName": "John Doe",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "cvv": "123"
  }'
```

### Test Contact Form
```bash
curl -X POST "http://localhost:3000/api/contact" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "subject": "Investment Question",
    "message": "I have a question about property investments...",
    "category": "investment_question"
  }'
```

### Test Blog Listing
```bash
curl -X GET "http://localhost:3000/api/blogs?category=real_estate&featured=true" \
  -H "x-api-key: your-api-key"
```

### Test Seeding
```bash
# Check database status
curl -X GET "http://localhost:3000/api/admin/seed-all" \
  -H "x-api-key: your-api-key" \
  -H "Authorization: Bearer admin-jwt-token"

# Seed all data
curl -X POST "http://localhost:3000/api/admin/seed-all" \
  -H "x-api-key: your-api-key" \
  -H "Authorization: Bearer admin-jwt-token"
```

---

## 🚀 Getting Started

1. **Set Environment Variables**
2. **Seed Roles**: `POST /api/admin/seed-roles`
3. **Seed Admin**: `POST /api/admin/seed-admin`
4. **Seed Properties**: `POST /api/admin/seed-all`
5. **Register Users**: Use registration flow
6. **Test APIs**: Use provided examples

This documentation covers all available APIs in the Arkan Property Investment Platform. For specific implementation details, refer to the individual API files in the codebase.
