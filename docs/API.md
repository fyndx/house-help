# API Documentation

## Base URL

- **Development**: `http://localhost:3000`
- **RPC Endpoint**: `/rpc`
- **OpenAPI Docs**: `/api-reference`

## Authentication

The API uses Better-Auth for authentication. Most endpoints require a valid session. Authentication is handled via:

- Session cookies (automatically set on sign-in)
- Authorization headers (for programmatic access)

### Authentication Endpoints

All auth endpoints are available at `/api/auth/*`:

- `POST /api/auth/sign-up/email` - User registration
- `POST /api/auth/sign-in/email` - User login
- `POST /api/auth/sign-out` - User logout
- `GET /api/auth/session` - Get current session

---

## Customer Router

Base path: `/rpc/customer.*`

### Authentication

#### Sign Up

**Endpoint**: `customer.signUp`

**Method**: `POST`

**Auth**: Public

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "id": "customer_id",
  "userId": "user_id"
}
```

#### Sign In

**Endpoint**: `customer.signIn`

**Method**: `POST`

**Auth**: Public

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "session": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "customer": {
    "id": "customer_id",
    "addresses": []
  }
}
```

### Profile Management

#### Edit Profile

**Endpoint**: `customer.edit`

**Method**: `POST`

**Auth**: Protected (Customer)

**Request Body**:
```json
{
  "name": "John Doe Updated",
  "image": "https://example.com/image.jpg"
}
```

**Response**: Updated customer object

### Address Management

#### Add Address

**Endpoint**: `customer.addAddress`

**Method**: `POST`

**Auth**: Protected (Customer)

**Request Body**:
```json
{
  "address": "123 Main Street",
  "landmark": "Near Park",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "label": "Home"
}
```

**Response**: Created address object with geolocation

#### Get Addresses

**Endpoint**: `customer.getAddresses`

**Method**: `GET`

**Auth**: Protected (Customer)

**Response**: Array of customer addresses

#### Get Address

**Endpoint**: `customer.getAddress`

**Method**: `POST`

**Auth**: Protected (Customer)

**Request Body**:
```json
{
  "id": "address_id"
}
```

**Response**: Address object

#### Edit Address

**Endpoint**: `customer.editAddress`

**Method**: `POST`

**Auth**: Protected (Customer)

**Request Body**:
```json
{
  "id": "address_id",
  "address": "Updated Address",
  "landmark": "Updated Landmark",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "label": "Work"
}
```

**Response**: Updated address object

#### Delete Address

**Endpoint**: `customer.deleteAddress`

**Method**: `POST`

**Auth**: Protected (Customer)

**Request Body**:
```json
{
  "id": "address_id"
}
```

**Response**: Deleted address object

### Favorite Professionals

#### Add to Favorites

**Endpoint**: `customer.makeProfessionalFavorite`

**Method**: `POST`

**Auth**: Protected (Customer)

**Request Body**:
```json
{
  "professionalId": "professional_id"
}
```

**Response**: Favorite professional object

#### Get Favorites

**Endpoint**: `customer.getFavoriteProfessionals`

**Method**: `GET`

**Auth**: Protected (Customer)

**Response**: Array of favorite professionals

#### Remove from Favorites

**Endpoint**: `customer.removeProfessionalFromFavorites`

**Method**: `POST`

**Auth**: Protected (Customer)

**Request Body**:
```json
{
  "id": "favorite_id"
}
```

**Response**: Status 204

---

## Professional Router

Base path: `/rpc/professional.*`

### Authentication

#### Sign Up

**Endpoint**: `professional.signUp`

**Method**: `POST`

**Auth**: Public

**Request Body**:
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securePassword123"
}
```

**Response**: Created professional object

#### Sign In

**Endpoint**: `professional.signIn`

**Method**: `POST`

**Auth**: Public

**Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "session": {
    "user": {
      "id": "user_id",
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  },
  "professional": {
    "id": "professional_id",
    "approvalStatus": "PENDING"
  }
}
```

### Profile Management

#### Complete Profile

**Endpoint**: `professional.completeProfile`

**Method**: `POST`

**Auth**: Protected (Professional)

**Request Body**:
```json
{
  "maskedAadhaar": "XXXX-XXXX-1234",
  "dateOfBirth": "1990-01-01T00:00:00Z",
  "gender": "FEMALE",
  "profileImage": "https://example.com/profile.jpg",
  "bio": "Experienced house help professional",
  "experienceYears": 5,
  "languages": ["English", "Hindi", "Kannada"],
  "serviceRadiusKm": 10,
  "baseLatitude": 12.9716,
  "baseLongitude": 77.5946,
  "baseLocation": "POINT(77.5946 12.9716)"
}
```

**Response**: Updated professional object

#### Edit Profile

**Endpoint**: `professional.edit`

**Method**: `POST`

**Auth**: Protected (Professional)

**Request Body**:
```json
{
  "profileImage": "https://example.com/new-profile.jpg",
  "bio": "Updated bio",
  "experienceYears": 6,
  "languages": ["English", "Hindi"],
  "serviceRadiusKm": 15,
  "baseLatitude": 12.9716,
  "baseLongitude": 77.5946
}
```

**Response**: Updated professional object

#### Get Profile

**Endpoint**: `professional.getProfile`

**Method**: `GET`

**Auth**: Protected (Professional)

**Response**: Professional profile object

#### Update Duty Status

**Endpoint**: `professional.updateDutyStatus`

**Method**: `POST`

**Auth**: Protected (Professional)

**Request Body**:
```json
{
  "isAvailable": true
}
```

**Response**: Updated professional object

### Document Management

#### Add Document

**Endpoint**: `professional.addDocument`

**Method**: `POST`

**Auth**: Protected (Professional)

**Request Body**:
```json
{
  "documentType": "AADHAAR",
  "documentUrl": "https://example.com/document.pdf"
}
```

**Document Types**: `AADHAAR`, `PAN`, `POLICE_VERIFICATION`, `REFERENCE_LETTER`, `CERTIFICATE`

**Response**: Created document object

### Availability Management

#### Create Availability

**Endpoint**: `professional.createAvailability`

**Method**: `POST`

**Auth**: Protected (Professional)

**Request Body**:
```json
{
  "dayOfWeek": "MONDAY",
  "startTime": "09:00",
  "endTime": "17:00"
}
```

**Day of Week**: `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY`

**Time Format**: `HH:MM` (24-hour format)

**Response**: Created availability object

#### Get Availability

**Endpoint**: `professional.getAvailability`

**Method**: `GET`

**Auth**: Protected (Professional)

**Response**: Array of availability objects

#### Update Availability

**Endpoint**: `professional.updateAvailability`

**Method**: `POST`

**Auth**: Protected (Professional)

**Request Body**:
```json
{
  "id": "availability_id",
  "dayOfWeek": "MONDAY",
  "startTime": "10:00",
  "endTime": "18:00"
}
```

**Response**: Updated availability object

#### Delete Availability

**Endpoint**: `professional.deleteAvailability`

**Method**: `POST`

**Auth**: Protected (Professional)

**Request Body**:
```json
{
  "id": "availability_id"
}
```

**Response**: Deleted availability object

### Service Management

#### Create Service

**Endpoint**: `professional.createService`

**Method**: `POST`

**Auth**: Protected (Professional)

**Request Body**:
```json
{
  "serviceId": "service_id",
  "hourlyRate": 500.00
}
```

**Response**: Created professional service object

#### Get Services

**Endpoint**: `professional.getServices`

**Method**: `GET`

**Auth**: Protected (Professional)

**Response**: Array of professional services

#### Update Service

**Endpoint**: `professional.updateService`

**Method**: `POST`

**Auth**: Protected (Professional)

**Request Body**:
```json
{
  "id": "professional_service_id",
  "hourlyRate": 600.00
}
```

**Response**: Updated professional service object

#### Delete Service

**Endpoint**: `professional.deleteService`

**Method**: `POST`

**Auth**: Protected (Professional)

**Request Body**:
```json
{
  "id": "professional_service_id"
}
```

**Response**: Deleted professional service object

---

## Services Router

Base path: `/rpc/services.*`

### Service Management

#### Get Services

**Endpoint**: `services.getServices`

**Method**: `GET`

**Auth**: Public

**Response**: Array of active services

#### Get Service

**Endpoint**: `services.getService`

**Method**: `POST`

**Auth**: Public

**Request Body**:
```json
{
  "id": "service_id"
}
```

**Response**: Service object

#### Create Service

**Endpoint**: `services.createService`

**Method**: `POST`

**Auth**: Protected

**Request Body**:
```json
{
  "name": "Deep Cleaning",
  "description": "Comprehensive deep cleaning service"
}
```

**Response**: Created service object

#### Update Service

**Endpoint**: `services.updateService`

**Method**: `POST`

**Auth**: Protected

**Request Body**:
```json
{
  "id": "service_id",
  "name": "Deep Cleaning Updated",
  "description": "Updated description"
}
```

**Response**: Updated service object

#### Delete Service

**Endpoint**: `services.deleteService`

**Method**: `POST`

**Auth**: Protected

**Request Body**:
```json
{
  "id": "service_id"
}
```

**Response**: Deleted service object

---

## Common Router

### Health Check

**Endpoint**: `healthCheck`

**Method**: `GET`

**Auth**: Public

**Response**: `"OK"`

### Private Data

**Endpoint**: `privateData`

**Method**: `GET`

**Auth**: Protected

**Response**:
```json
{
  "message": "This is private",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

---

## Error Handling

The API uses oRPC error handling. Errors are returned in the following format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "data": {}
  }
}
```

### Common Error Codes

- `BAD_REQUEST` - Invalid request data
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `INTERNAL_SERVER_ERROR` - Server error
- `SIGN_UP_FAILED` - Registration failed
- `SIGN_IN_FAILED` - Login failed
- `CUSTOMER_CREATION_FAILED` - Customer creation failed

---

## Rate Limiting

Rate limiting may be implemented in production. Check response headers for rate limit information.

## Pagination

Currently, list endpoints return all results. Pagination may be added in future versions.

## Filtering and Sorting

Filtering and sorting capabilities may be added to list endpoints in future versions.

---

## OpenAPI Documentation

Interactive API documentation is available at:

- **Development**: `http://localhost:3000/api-reference`

This provides a Swagger UI interface for exploring and testing all API endpoints.

