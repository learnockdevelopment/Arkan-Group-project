# Property System Seeding Guide

## Overview

This guide explains how to seed the database with test data for the Property Investment System. The seeding process creates sample properties, users, and investments to test the system functionality.

## What Gets Seeded

### 1. Users
- **1 Admin User**: `admin@arkan.com`
- **3 Owner/Developer Users**: 
  - `developer1@arkan.com` (Ahmed Hassan)
  - `developer2@arkan.com` (Fatima Ali)  
  - `developer3@arkan.com` (Mohamed Salah)
- **5 Investor Users**: Regular users for testing investments

### 2. Properties

#### Single Properties (3 properties)
1. **Luxury Villa in New Cairo**
   - Price: 2.5M EGP
   - Shares: 50 (max 10 per user)
   - ROI: 15%
   - Developer: Ahmed Hassan

2. **Modern Apartment in Zamalek**
   - Price: 1.8M EGP  
   - Shares: 36 (max 6 per user)
   - ROI: 12%
   - Developer: Fatima Ali

3. **Commercial Shop in Mall**
   - Price: 1.2M EGP
   - Shares: 24 (max 4 per user)
   - ROI: 18%
   - Developer: Mohamed Salah

#### Project Properties (2 projects)
1. **Al Alamein New City Development**
   - Price: 50B EGP
   - Shares: 1,000,000 (no limit per user)
   - ROI: 25%
   - Developer: Admin User

2. **Smart City Technology Hub**
   - Price: 15B EGP
   - Shares: 300,000 (no limit per user)
   - ROI: 30%
   - Developer: Ahmed Hassan

#### Bundle Properties (2 bundles)
1. **Cairo Premium Portfolio Bundle**
   - Price: 5.5M EGP (combines 3 single properties)
   - Shares: 110 (max 20 per user)
   - ROI: 16%
   - Developer: Fatima Ali

2. **North Coast Resort Bundle**
   - Price: 8.5M EGP
   - Shares: 170 (max 25 per user)
   - ROI: 20%
   - Developer: Mohamed Salah

### 3. Sample Investments
- Multiple investments across all property types
- Various investment amounts and payment statuses
- Some completed payments, some pending
- Realistic investment patterns

## How to Run Seeding

### Method 1: API Endpoints (Recommended)

#### Check Database Status
```bash
GET /api/admin/seed-all
```
This shows current database statistics and whether seeding is recommended.

#### Seed Everything
```bash
POST /api/admin/seed-all
```
This seeds both properties and investments in one go.

#### Seed Only Properties
```bash
POST /api/admin/seed-properties
```
This seeds only properties without investments.

### Method 2: Direct Script Execution

```bash
# Navigate to project directory
cd /path/to/your/project

# Run the seeding script
node scripts/seed-properties.js

# Or run comprehensive seeding (if you have ts-node)
npx ts-node lib/seedProperties.ts
```

### Method 3: Using Next.js API Routes

1. Start your Next.js development server:
```bash
npm run dev
```

2. Make API calls to seed endpoints:
```bash
# Check status
curl -X GET "http://localhost:3000/api/admin/seed-all" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Run seeding
curl -X POST "http://localhost:3000/api/admin/seed-all" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Authentication Requirements

⚠️ **Important**: Seeding endpoints require admin authentication.

1. First, create an admin user through the registration API
2. Login to get an admin token
3. Use the token in the Authorization header

## Testing Seeded Data

### 1. Verify Properties
```bash
# Get all properties
curl "http://localhost:3000/api/properties"

# Get featured properties
curl "http://localhost:3000/api/properties/featured"

# Search properties
curl "http://localhost:3000/api/properties/search?q=villa"

# Filter by type
curl "http://localhost:3000/api/properties?type=single"
curl "http://localhost:3000/api/properties?type=project"  
curl "http://localhost:3000/api/properties?type=bundle"
```

### 2. Verify Property Details
```bash
# Get specific property details
curl "http://localhost:3000/api/properties/{property-id}"

# Calculate investment for a property
curl -X POST "http://localhost:3000/api/properties/{property-id}" \
  -H "Content-Type: application/json" \
  -d '{"shares": 5}'
```

### 3. Test Investment APIs (requires user authentication)
```bash
# Get user investments
curl "http://localhost:3000/api/investments" \
  -H "Authorization: Bearer USER_TOKEN"

# Create new investment
curl -X POST "http://localhost:3000/api/investments" \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"propertyId": "PROPERTY_ID", "sharesInvested": 3}'
```

### 4. Test Admin APIs (requires admin authentication)
```bash
# Get all properties (admin view)
curl "http://localhost:3000/api/admin/properties" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Get analytics
curl "http://localhost:3000/api/analytics/properties" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Sample Data Structure

### Property Types Distribution
- **Single Properties**: 3 properties (residential + commercial)
- **Projects**: 2 large-scale developments
- **Bundles**: 2 property portfolios

### Investment Scenarios
- **Active Investments**: Users with ongoing payment plans
- **Pending Investments**: Awaiting down payments
- **Completed Payments**: Some installments already paid
- **Various Share Amounts**: From small to large investments

### Geographic Distribution
- **Cairo**: New Cairo, Zamalek (urban properties)
- **North Coast**: Al Alamein, resort areas (tourism)
- **New Administrative Capital**: Technology hub (commercial)
- **6th October City**: Commercial mall (retail)

## Expected API Responses

### Properties Listing
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "...",
        "name": "Luxury Villa in New Cairo",
        "type": "single",
        "price": 2500000,
        "roi": 15,
        "totalShares": 50,
        "availableShares": 45,
        "fundingPercentage": 10,
        "isFeatured": true,
        "developer": {
          "firstName": "Ahmed",
          "lastName": "Hassan"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalCount": 8
    }
  }
}
```

### Property Details
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Luxury Villa in New Cairo",
    "type": "single",
    "analytics": {
      "totalInvestments": 2,
      "uniqueInvestors": 2,
      "recentViews": 15,
      "fundingPercentage": 10,
      "remainingShares": 45
    },
    "keyHighlights": [...],
    "reasonsToInvest": [...],
    "documents": [...]
  }
}
```

## Troubleshooting

### Common Issues

1. **"Roles not found" Error**
   - Ensure roles are seeded first
   - Run: `POST /api/admin/seed-roles`

2. **Authentication Errors**
   - Make sure you have admin privileges
   - Check your JWT token is valid

3. **Database Connection Issues**
   - Verify MongoDB is running
   - Check MONGODB_URI environment variable

4. **Duplicate Data**
   - Seeding clears existing properties before creating new ones
   - Safe to run multiple times

### Verification Steps

1. **Check Database Connection**
```bash
curl "http://localhost:3000/api/health"
```

2. **Verify Roles Exist**
```bash
curl "http://localhost:3000/api/admin/seed-roles"
```

3. **Check Property Count**
```bash
curl "http://localhost:3000/api/admin/seed-all"
```

## Customizing Seed Data

### Adding More Properties

Edit `lib/seedProperties.ts` and add new property objects to the respective arrays:
- `singleProperties` for individual properties
- `projectProperties` for large developments  
- `bundleProperties` for property portfolios

### Modifying Investment Patterns

Edit `lib/seedInvestments.ts` to change:
- Number of investors per property
- Investment amounts and patterns
- Payment completion rates

### Adding New Property Types

1. Update the `PropertyType` enum in `models/Property.ts`
2. Add new property data in the seeding script
3. Update validation schemas in APIs

## Production Considerations

⚠️ **Warning**: This seeding is for development/testing only.

For production:
1. Remove or secure seeding endpoints
2. Use real property data
3. Implement proper user onboarding
4. Add data validation and sanitization
5. Use environment-specific configurations

## Next Steps After Seeding

1. **Test Property Listings**: Verify all property types appear correctly
2. **Test Filtering**: Check search and filter functionality
3. **Test Investment Flow**: Create test investments
4. **Test Payment System**: Simulate payment processes
5. **Test Admin Functions**: Verify admin management features
6. **Performance Testing**: Test with larger datasets

This seeding system provides a comprehensive foundation for testing all aspects of the Property Investment System.
