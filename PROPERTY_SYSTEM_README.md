# Property Investment System Documentation

## Overview

The Property Investment System is a comprehensive platform that allows users to invest in real estate properties through a fractional ownership model. The system supports three types of properties: Single Properties, Projects, and Bundles, each with different investment rules and payment structures.

## Property Types

### 1. Single Property
- **Description**: Individual real estate properties that can be purchased through fractional ownership
- **Investment Rules**: 
  - Has a maximum shares per user limit
  - Installments start only when the property is fully funded
  - Users can invest up to the maximum allowed shares
- **Use Case**: Individual apartments, houses, or commercial units

### 2. Project
- **Description**: Large-scale development projects where users can invest
- **Investment Rules**:
  - No maximum shares per user limit (users can invest in all shares)
  - Installments start immediately after down payment
  - Suitable for large developments where immediate funding is needed
- **Use Case**: Residential complexes, commercial developments, infrastructure projects

### 3. Bundle
- **Description**: Collection of multiple single properties packaged together
- **Investment Rules**:
  - Contains multiple single properties
  - Calculations are based on the total value of all properties in the bundle
  - Has its own pricing and share structure
- **Use Case**: Portfolio investments, diversified property collections

## Database Models

### Property Model (`models/Property.ts`)

```typescript
interface Property {
  // Basic Information
  name: string;
  type: 'single' | 'project' | 'bundle';
  developerId: ObjectId; // Reference to User (admin/owner)
  location: string;
  image: string;
  images: string[];
  
  // Financial Information
  price: number;
  roi: number; // Return on Investment percentage
  advancement: number; // Down payment percentage (0-100)
  totalShares: number;
  availableShares: number;
  sharePrice: number; // Calculated: price / totalShares
  shareDownPayment: number; // Calculated: (sharePrice * advancement) / 100
  shareInstallment: number; // Calculated: (sharePrice - shareDownPayment) / numberOfInstallments
  
  // Investment Rules
  maxSharesPerUser?: number; // Only for single properties
  numberOfInstallments: number;
  installmentsFrequency: 'monthly' | 'quarterly' | 'semi_annual' | 'annual';
  
  // Bundle-specific
  bundleProperties?: ObjectId[]; // Only for bundle type
  bundleSize?: number; // Number of properties in bundle
  
  // Project-specific
  projectValue?: number;
  expectedReturns?: number;
  
  // Status and Metadata
  status: 'Available' | 'Funded' | 'Exited' | 'Under Construction' | 'Completed';
  deliveryDate: Date;
  isActive: boolean;
  isFeatured: boolean;
}
```

### Investment Model (`models/Investment.ts`)

```typescript
interface Investment {
  userId: ObjectId;
  propertyId: ObjectId;
  sharesInvested: number;
  sharePrice: number; // Price per share at time of investment
  totalInvestment: number;
  
  // Payment Structure
  downPayment: number;
  downPaymentPaid: boolean;
  installmentAmount: number;
  numberOfInstallments: number;
  installments: Installment[];
  
  // Status and Timing
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  investmentDate: Date;
  firstInstallmentDate?: Date;
  
  // Returns
  expectedReturns: number;
  actualReturns: number;
}

interface Installment {
  installmentNumber: number;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  transactionId?: string;
}
```

## API Endpoints

### Public APIs (No Authentication Required)

#### 1. List Properties
```
GET /api/properties
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12, max: 50)
- `type` (string): Filter by property type ('single', 'project', 'bundle')
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

**Response:**
```json
{
  "success": true,
  "data": {
    "properties": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalCount": 100,
      "limit": 12,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### 2. Get Property Details
```
GET /api/properties/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Property Name",
    "type": "single",
    "developer": {...},
    "analytics": {
      "totalInvestments": 15,
      "uniqueInvestors": 12,
      "recentViews": 150,
      "fundingPercentage": 75.5,
      "remainingShares": 5
    },
    "bundleProperties": [...] // Only for bundle type
  }
}
```

#### 3. Calculate Investment
```
POST /api/properties/{id}
```

**Request Body:**
```json
{
  "shares": 5,
  "userId": "optional-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "propertyId": "...",
    "sharesRequested": 5,
    "totalInvestment": 50000,
    "paymentStructure": {
      "downPayment": 12500,
      "installmentAmount": 3750,
      "numberOfInstallments": 10,
      "frequency": "monthly",
      "installmentSchedule": [...]
    }
  }
}
```

#### 4. Featured Properties
```
GET /api/properties/featured
```

#### 5. Search Properties
```
GET /api/properties/search?q=search-term
```

### User Investment APIs (Authentication Required)

#### 1. User Investments
```
GET /api/investments
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by investment status
- `propertyType`: Filter by property type
- `sortBy`, `sortOrder`: Sorting options

#### 2. Create Investment
```
POST /api/investments
```

**Request Body:**
```json
{
  "propertyId": "property-id",
  "sharesInvested": 3
}
```

#### 3. Investment Details
```
GET /api/investments/{id}
```

#### 4. Update Investment (Payment)
```
PUT /api/investments/{id}
```

**Request Body:**
```json
{
  "action": "pay_down_payment", // or "pay_installment"
  "installmentId": "installment-id", // required for installment payments
  "transactionId": "transaction-reference"
}
```

#### 5. Payment Schedule
```
GET /api/investments/payments?status=pending&days=30
```

#### 6. Record Payment
```
POST /api/investments/payments
```

### Admin APIs (Admin Role Required)

#### 1. Admin Property Management
```
GET /api/admin/properties
POST /api/admin/properties
GET /api/admin/properties/{id}
PUT /api/admin/properties/{id}
DELETE /api/admin/properties/{id}
```

#### 2. Analytics
```
GET /api/analytics/properties
```

### Owner APIs (Owner/Admin Role Required)

#### 1. Owner Property Management
```
GET /api/owner/properties
POST /api/owner/properties
GET /api/owner/properties/{id}
PUT /api/owner/properties/{id}
DELETE /api/owner/properties/{id}
```

## Investment Logic

### Share Price Calculations

All share-related prices are automatically calculated when a property is created or updated:

```typescript
// Calculated in Property model pre-save middleware
sharePrice = Math.round(price / totalShares);
shareDownPayment = Math.round((sharePrice * advancement) / 100);
shareInstallment = Math.round((sharePrice - shareDownPayment) / numberOfInstallments);
```

### Investment Flow

#### For Single Properties:
1. User selects shares (up to `maxSharesPerUser`)
2. System validates availability and user limits
3. Investment is created with `pending` status
4. User pays down payment → status becomes `active`
5. Installments start only when property is fully funded
6. When all installments are paid → status becomes `completed`

#### For Projects:
1. User can invest in any number of available shares
2. Investment is created with `pending` status
3. User pays down payment → status becomes `active`
4. Installments start immediately (next month)
5. When all installments are paid → status becomes `completed`

#### For Bundles:
1. Similar to single properties but calculations are based on bundle totals
2. Bundle contains multiple single properties
3. Investment rules follow single property pattern

### Payment Schedule Generation

Installment schedules are automatically generated based on:
- `numberOfInstallments`: Total number of payments
- `installmentsFrequency`: Payment frequency
- `firstInstallmentDate`: When payments should start

```typescript
// Example: Monthly installments starting next month
for (let i = 1; i <= numberOfInstallments; i++) {
  const dueDate = new Date(startDate);
  dueDate.setMonth(dueDate.getMonth() + (i - 1));
  
  installments.push({
    installmentNumber: i,
    amount: installmentAmount,
    dueDate: dueDate,
    status: 'pending'
  });
}
```

## Security and Authorization

### Role-Based Access Control

- **Public**: Can view properties and calculate investments
- **User**: Can create investments and manage their portfolio
- **Owner**: Can create and manage their own properties
- **Admin**: Full access to all properties and system analytics

### Data Validation

All APIs use Zod schemas for request validation:
- Input sanitization
- Type checking
- Business rule validation
- Error handling with detailed messages

### Investment Restrictions

- Users cannot modify financial terms of properties with active investments
- Properties with active investments cannot be deleted
- Investment cancellation is only allowed for pending investments with no payments

## Usage Examples

### Creating a Single Property

```json
POST /api/owner/properties
{
  "name": "Luxury Apartment in New Cairo",
  "type": "single",
  "location": "New Cairo, Egypt",
  "image": "https://example.com/image.jpg",
  "about": "Modern 3-bedroom apartment...",
  "price": 1000000,
  "advancement": 25,
  "totalShares": 100,
  "maxSharesPerUser": 10,
  "numberOfInstallments": 12,
  "installmentsFrequency": "monthly",
  "rooms": 3,
  "bathrooms": 2,
  "deliveryDate": "2025-12-31",
  "roi": 15
}
```

### Creating an Investment

```json
POST /api/investments
{
  "propertyId": "property-id-here",
  "sharesInvested": 5
}
```

### Recording a Payment

```json
POST /api/investments/payments
{
  "investmentId": "investment-id",
  "paymentType": "down_payment",
  "amount": 12500,
  "transactionId": "TXN-123456",
  "paymentMethod": "credit_card"
}
```

## Error Handling

All APIs return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [...] // Validation errors if applicable
}
```

Common HTTP status codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Performance Considerations

### Database Indexes

Key indexes are created for optimal query performance:
- Property queries: `type`, `status`, `location`, `price`, `deliveryDate`
- Investment queries: `userId`, `propertyId`, `status`
- Analytics queries: `createdAt`, compound indexes

### Caching Strategy

Consider implementing caching for:
- Featured properties list
- Property search results
- User investment summaries
- Analytics data

### Pagination

All list endpoints support pagination to handle large datasets efficiently.

## Future Enhancements

1. **Payment Gateway Integration**: Connect with actual payment processors
2. **Document Management**: File upload and management for property documents
3. **Notification System**: Email/SMS notifications for payment reminders
4. **Mobile App APIs**: Optimized endpoints for mobile applications
5. **Advanced Analytics**: More detailed reporting and insights
6. **Multi-currency Support**: Support for different currencies
7. **Automated Profit Distribution**: Automatic distribution of returns to investors

## Testing

### API Testing

Use tools like Postman or curl to test the APIs:

```bash
# Get all properties
curl -X GET "http://localhost:3000/api/properties?limit=10&type=single"

# Create investment (requires authentication)
curl -X POST "http://localhost:3000/api/investments" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"propertyId": "PROPERTY_ID", "sharesInvested": 3}'
```

### Database Testing

Ensure proper data relationships and constraints:
- Property-Investment relationships
- User-Investment relationships
- Bundle-Property relationships

## Deployment Considerations

1. **Environment Variables**: Set up proper MongoDB connection and other configs
2. **Database Migrations**: Run initial data seeding for roles and test data
3. **API Rate Limiting**: Implement rate limiting for public endpoints
4. **Monitoring**: Set up logging and monitoring for API performance
5. **Backup Strategy**: Regular database backups for investment data

This documentation provides a comprehensive guide to the Property Investment System. For specific implementation details, refer to the individual model and API files in the codebase.
