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

---

## 🚀 Getting Started

1. **Set Environment Variables**
2. **Seed Roles**: `POST /api/admin/seed-roles`
3. **Seed Admin**: `POST /api/admin/seed-admin`
4. **Seed Properties**: `POST /api/admin/seed-all`
5. **Register Users**: Use registration flow
6. **Test APIs**: Use provided examples

This documentation covers all available APIs in the Arkan Property Investment Platform. For specific implementation details, refer to the individual API files in the codebase.
