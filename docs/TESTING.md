# API Testing Guide

This document outlines comprehensive test cases for the House Help API. Use this as a checklist for manual testing or as a reference for automated test implementation.

## Test Environment Setup

- **Base URL**: `http://localhost:3000`
- **RPC Endpoint**: `/rpc`
- **Auth Endpoint**: `/api/auth/*`

## Test Categories

1. [Customer Authentication Tests](#customer-authentication-tests)
2. [Customer Profile Tests](#customer-profile-tests)
3. [Customer Address Management Tests](#customer-address-management-tests)
4. [Customer Favorites Tests](#customer-favorites-tests)
5. [Professional Authentication Tests](#professional-authentication-tests)
6. [Professional Profile Tests](#professional-profile-tests)
7. [Professional Document Tests](#professional-document-tests)
8. [Professional Availability Tests](#professional-availability-tests)
9. [Professional Service Tests](#professional-service-tests)
10. [Services Router Tests](#services-router-tests)
11. [Error Handling Tests](#error-handling-tests)
12. [Security Tests](#security-tests)
13. [Integration Tests](#integration-tests)

---

## Customer Authentication Tests

### C-AUTH-001: Customer Sign Up - Success
- **Endpoint**: `customer.signUp`
- **Method**: `POST`
- **Test Data**: Valid name, email, password
- **Expected**: 200 OK, customer object returned
- **Verify**: Customer created in database, user account created

### C-AUTH-002: Customer Sign Up - Duplicate Email
- **Endpoint**: `customer.signUp`
- **Method**: `POST`
- **Test Data**: Email that already exists
- **Expected**: Error response (BAD_REQUEST or similar)
- **Verify**: No duplicate customer created

### C-AUTH-003: Customer Sign Up - Invalid Email Format
- **Endpoint**: `customer.signUp`
- **Method**: `POST`
- **Test Data**: Invalid email format (e.g., "notanemail")
- **Expected**: Validation error
- **Verify**: Error message indicates invalid email

### C-AUTH-004: Customer Sign Up - Missing Required Fields
- **Endpoint**: `customer.signUp`
- **Method**: `POST`
- **Test Data**: Missing name, email, or password
- **Expected**: Validation error
- **Verify**: All required fields validated

### C-AUTH-005: Customer Sign In - Success
- **Endpoint**: `customer.signIn`
- **Method**: `POST`
- **Test Data**: Valid email and password
- **Expected**: 200 OK, session and customer data returned
- **Verify**: Session cookie set, customer data correct

### C-AUTH-006: Customer Sign In - Invalid Credentials
- **Endpoint**: `customer.signIn`
- **Method**: `POST`
- **Test Data**: Wrong password
- **Expected**: Error (SIGN_IN_FAILED)
- **Verify**: No session created

### C-AUTH-007: Customer Sign In - Non-existent User
- **Endpoint**: `customer.signIn`
- **Method**: `POST`
- **Test Data**: Email that doesn't exist
- **Expected**: Error (SIGN_IN_FAILED)
- **Verify**: Appropriate error message

---

## Customer Profile Tests

### C-PROF-001: Edit Customer Profile - Success
- **Endpoint**: `customer.edit`
- **Method**: `POST`
- **Auth**: Valid customer session
- **Test Data**: Valid name and/or image
- **Expected**: 200 OK, updated customer object
- **Verify**: Changes persisted in database

### C-PROF-002: Edit Customer Profile - Unauthorized
- **Endpoint**: `customer.edit`
- **Method**: `POST`
- **Auth**: No session or invalid session
- **Expected**: 401 Unauthorized
- **Verify**: Error message indicates authentication required

### C-PROF-003: Edit Customer Profile - Partial Update
- **Endpoint**: `customer.edit`
- **Method**: `POST`
- **Auth**: Valid customer session
- **Test Data**: Only name (no image)
- **Expected**: 200 OK, only name updated
- **Verify**: Image unchanged, name updated

---

## Customer Address Management Tests

### C-ADDR-001: Add Address - Success
- **Endpoint**: `customer.addAddress`
- **Method**: `POST`
- **Auth**: Valid customer session
- **Test Data**: Valid address with coordinates
- **Expected**: 200 OK, address object with location
- **Verify**: Address created, geolocation set correctly

### C-ADDR-002: Add Address - Invalid Coordinates
- **Endpoint**: `customer.addAddress`
- **Method**: `POST`
- **Auth**: Valid customer session
- **Test Data**: Invalid latitude/longitude (e.g., > 90, > 180)
- **Expected**: Validation error
- **Verify**: Error message indicates invalid coordinates

### C-ADDR-003: Add Address - Missing Required Fields
- **Endpoint**: `customer.addAddress`
- **Method**: `POST`
- **Auth**: Valid customer session
- **Test Data**: Missing address, latitude, longitude, or label
- **Expected**: Validation error
- **Verify**: All required fields validated

### C-ADDR-004: Get Addresses - Success
- **Endpoint**: `customer.getAddresses`
- **Method**: `GET`
- **Auth**: Valid customer session
- **Expected**: 200 OK, array of addresses
- **Verify**: Only customer's addresses returned

### C-ADDR-005: Get Address - Success
- **Endpoint**: `customer.getAddress`
- **Method**: `POST`
- **Auth**: Valid customer session
- **Test Data**: Valid address ID
- **Expected**: 200 OK, address object
- **Verify**: Correct address returned

### C-ADDR-006: Get Address - Not Found
- **Endpoint**: `customer.getAddress`
- **Method**: `POST`
- **Auth**: Valid customer session
- **Test Data**: Non-existent address ID
- **Expected**: Error (NOT_FOUND)
- **Verify**: Error message indicates address not found

### C-ADDR-007: Get Address - Unauthorized Access
- **Endpoint**: `customer.getAddress`
- **Method**: `POST`
- **Auth**: Valid customer session (different customer)
- **Test Data**: Address ID belonging to another customer
- **Expected**: Error (NOT_FOUND or FORBIDDEN)
- **Verify**: Cannot access other customers' addresses

### C-ADDR-008: Edit Address - Success
- **Endpoint**: `customer.editAddress`
- **Method**: `POST`
- **Auth**: Valid customer session
- **Test Data**: Valid address ID and updated fields
- **Expected**: 200 OK, updated address object
- **Verify**: Changes persisted, geolocation updated if coordinates changed

### C-ADDR-009: Edit Address - Partial Update
- **Endpoint**: `customer.editAddress`
- **Method**: `POST`
- **Auth**: Valid customer session
- **Test Data**: Only address field updated
- **Expected**: 200 OK, only address field updated
- **Verify**: Other fields unchanged

### C-ADDR-010: Delete Address - Success
- **Endpoint**: `customer.deleteAddress`
- **Method**: `POST`
- **Auth**: Valid customer session
- **Test Data**: Valid address ID
- **Expected**: 200 OK, deleted address object
- **Verify**: Address removed from database

### C-ADDR-011: Delete Address - Not Found
- **Endpoint**: `customer.deleteAddress`
- **Method**: `POST`
- **Auth**: Valid customer session
- **Test Data**: Non-existent address ID
- **Expected**: Error (NOT_FOUND)
- **Verify**: Appropriate error message

---

## Customer Favorites Tests

### C-FAV-001: Add Professional to Favorites - Success
- **Endpoint**: `customer.makeProfessionalFavorite`
- **Method**: `POST`
- **Auth**: Valid customer session
- **Test Data**: Valid professional ID
- **Expected**: 200 OK, favorite object created
- **Verify**: Favorite relationship created in database

### C-FAV-002: Add Professional to Favorites - Duplicate
- **Endpoint**: `customer.makeProfessionalFavorite`
- **Method**: `POST`
- **Auth**: Valid customer session
- **Test Data**: Professional already in favorites
- **Expected**: Error (duplicate entry error)
- **Verify**: No duplicate favorite created

### C-FAV-003: Add Professional to Favorites - Invalid Professional
- **Endpoint**: `customer.makeProfessionalFavorite`
- **Method**: `POST`
- **Auth**: Valid customer session
- **Test Data**: Non-existent professional ID
- **Expected**: Error (foreign key constraint or NOT_FOUND)
- **Verify**: Appropriate error handling

### C-FAV-004: Get Favorite Professionals - Success
- **Endpoint**: `customer.getFavoriteProfessionals`
- **Method**: `GET`
- **Auth**: Valid customer session
- **Expected**: 200 OK, array of favorite professionals
- **Verify**: Only customer's favorites returned

### C-FAV-005: Get Favorite Professionals - Empty List
- **Endpoint**: `customer.getFavoriteProfessionals`
- **Method**: `GET`
- **Auth**: Valid customer session (no favorites)
- **Expected**: 200 OK, empty array
- **Verify**: Returns empty array, not error

### C-FAV-006: Remove from Favorites - Success
- **Endpoint**: `customer.removeProfessionalFromFavorites`
- **Method**: `POST`
- **Auth**: Valid customer session
- **Test Data**: Valid favorite ID
- **Expected**: 200 OK, status 204
- **Verify**: Favorite removed from database

### C-FAV-007: Remove from Favorites - Not Found
- **Endpoint**: `customer.removeProfessionalFromFavorites`
- **Method**: `POST`
- **Auth**: Valid customer session
- **Test Data**: Non-existent favorite ID
- **Expected**: Error (NOT_FOUND)
- **Verify**: Appropriate error message

---

## Professional Authentication Tests

### P-AUTH-001: Professional Sign Up - Success
- **Endpoint**: `professional.signUp`
- **Method**: `POST`
- **Test Data**: Valid name, email, password
- **Expected**: 200 OK, professional object returned
- **Verify**: Professional created, approval status is PENDING

### P-AUTH-002: Professional Sign Up - Duplicate Email
- **Endpoint**: `professional.signUp`
- **Method**: `POST`
- **Test Data**: Email that already exists
- **Expected**: Error response
- **Verify**: No duplicate professional created

### P-AUTH-003: Professional Sign In - Success
- **Endpoint**: `professional.signIn`
- **Method**: `POST`
- **Test Data**: Valid email and password
- **Expected**: 200 OK, session and professional data
- **Verify**: Session cookie set, professional data correct

### P-AUTH-004: Professional Sign In - Invalid Credentials
- **Endpoint**: `professional.signIn`
- **Method**: `POST`
- **Test Data**: Wrong password
- **Expected**: Error (SIGN_IN_FAILED)
- **Verify**: No session created

---

## Professional Profile Tests

### P-PROF-001: Complete Profile - Success
- **Endpoint**: `professional.completeProfile`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: All required profile fields
- **Expected**: 200 OK, updated professional object
- **Verify**: All fields persisted correctly

### P-PROF-002: Complete Profile - Missing Required Fields
- **Endpoint**: `professional.completeProfile`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Missing required fields
- **Expected**: Validation error
- **Verify**: All required fields validated

### P-PROF-003: Edit Profile - Success
- **Endpoint**: `professional.edit`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Valid update fields
- **Expected**: 200 OK, updated professional object
- **Verify**: Changes persisted

### P-PROF-004: Edit Profile - Partial Update
- **Endpoint**: `professional.edit`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Only bio updated
- **Expected**: 200 OK, only bio updated
- **Verify**: Other fields unchanged

### P-PROF-005: Get Profile - Success
- **Endpoint**: `professional.getProfile`
- **Method**: `GET`
- **Auth**: Valid professional session
- **Expected**: 200 OK, professional profile
- **Verify**: Correct profile data returned

### P-PROF-006: Update Duty Status - Success
- **Endpoint**: `professional.updateDutyStatus`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: `{"isAvailable": false}`
- **Expected**: 200 OK, updated professional
- **Verify**: isAvailable field updated

### P-PROF-007: Update Duty Status - Toggle
- **Endpoint**: `professional.updateDutyStatus`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Toggle from true to false and back
- **Expected**: 200 OK each time
- **Verify**: Status toggles correctly

---

## Professional Document Tests

### P-DOC-001: Add Document - Success
- **Endpoint**: `professional.addDocument`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Valid document type and URL
- **Expected**: 200 OK, document object created
- **Verify**: Document created, isVerified is false

### P-DOC-002: Add Document - All Document Types
- **Endpoint**: `professional.addDocument`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Each document type (AADHAAR, PAN, POLICE_VERIFICATION, REFERENCE_LETTER, CERTIFICATE)
- **Expected**: 200 OK for each
- **Verify**: All document types accepted

### P-DOC-003: Add Document - Duplicate Document Type
- **Endpoint**: `professional.addDocument`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Document type that already exists for professional
- **Expected**: Error (unique constraint violation)
- **Verify**: No duplicate document type allowed

### P-DOC-004: Add Document - Invalid Document Type
- **Endpoint**: `professional.addDocument`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Invalid document type enum value
- **Expected**: Validation error
- **Verify**: Only valid enum values accepted

---

## Professional Availability Tests

### P-AVAIL-001: Create Availability - Success
- **Endpoint**: `professional.createAvailability`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Valid day, start time, end time
- **Expected**: 200 OK, availability object created
- **Verify**: Availability created in database

### P-AVAIL-002: Create Availability - All Days of Week
- **Endpoint**: `professional.createAvailability`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Create availability for each day of week
- **Expected**: 200 OK for each
- **Verify**: All days accepted

### P-AVAIL-003: Create Availability - Invalid Time Format
- **Endpoint**: `professional.createAvailability`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Invalid time format (e.g., "25:00", "9:5")
- **Expected**: Validation error
- **Verify**: Time format validated (HH:MM, 24-hour)

### P-AVAIL-004: Create Availability - End Time Before Start Time
- **Endpoint**: `professional.createAvailability`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: endTime < startTime (e.g., start: "17:00", end: "09:00")
- **Expected**: Validation error or business logic error
- **Verify**: End time must be after start time

### P-AVAIL-005: Create Availability - Duplicate
- **Endpoint**: `professional.createAvailability`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Same day, start time, end time already exists
- **Expected**: Error (BAD_REQUEST - "Availability already exists")
- **Verify**: Duplicate availability prevented

### P-AVAIL-006: Get Availability - Success
- **Endpoint**: `professional.getAvailability`
- **Method**: `GET`
- **Auth**: Valid professional session
- **Expected**: 200 OK, array of availability objects
- **Verify**: Only professional's availability returned

### P-AVAIL-007: Get Availability - Empty List
- **Endpoint**: `professional.getAvailability`
- **Method**: `GET`
- **Auth**: Valid professional session (no availability set)
- **Expected**: 200 OK, empty array
- **Verify**: Returns empty array, not error

### P-AVAIL-008: Update Availability - Success
- **Endpoint**: `professional.updateAvailability`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Valid availability ID and updated times
- **Expected**: 200 OK, updated availability
- **Verify**: Changes persisted

### P-AVAIL-009: Update Availability - Not Found
- **Endpoint**: `professional.updateAvailability`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Non-existent availability ID
- **Expected**: Error (NOT_FOUND)
- **Verify**: Appropriate error message

### P-AVAIL-010: Delete Availability - Success
- **Endpoint**: `professional.deleteAvailability`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Valid availability ID
- **Expected**: 200 OK, deleted availability
- **Verify**: Availability removed from database

### P-AVAIL-011: Delete Availability - Not Found
- **Endpoint**: `professional.deleteAvailability`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Non-existent availability ID
- **Expected**: Error (NOT_FOUND)
- **Verify**: Appropriate error message

---

## Professional Service Tests

### P-SVC-001: Create Service - Success
- **Endpoint**: `professional.createService`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Valid service ID and hourly rate
- **Expected**: 200 OK, professional service created
- **Verify**: Service linked to professional, rate saved

### P-SVC-002: Create Service - Invalid Service ID
- **Endpoint**: `professional.createService`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Non-existent service ID
- **Expected**: Error (foreign key constraint or NOT_FOUND)
- **Verify**: Only valid services can be added

### P-SVC-003: Create Service - Negative Hourly Rate
- **Endpoint**: `professional.createService`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Negative hourly rate
- **Expected**: Validation error or business logic error
- **Verify**: Hourly rate must be positive

### P-SVC-004: Create Service - Duplicate Service
- **Endpoint**: `professional.createService`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Service ID already added by professional
- **Expected**: Error (unique constraint violation)
- **Verify**: No duplicate services for same professional

### P-SVC-005: Get Services - Success
- **Endpoint**: `professional.getServices`
- **Method**: `GET`
- **Auth**: Valid professional session
- **Expected**: 200 OK, array of professional services
- **Verify**: Only professional's services returned

### P-SVC-006: Update Service - Success
- **Endpoint**: `professional.updateService`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Valid service ID and new hourly rate
- **Expected**: 200 OK, updated service
- **Verify**: Hourly rate updated

### P-SVC-007: Update Service - Not Found
- **Endpoint**: `professional.updateService`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Non-existent professional service ID
- **Expected**: Error (NOT_FOUND)
- **Verify**: Appropriate error message

### P-SVC-008: Delete Service - Success
- **Endpoint**: `professional.deleteService`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Valid professional service ID
- **Expected**: 200 OK, deleted service
- **Verify**: Service removed from professional

### P-SVC-009: Delete Service - Not Found
- **Endpoint**: `professional.deleteService`
- **Method**: `POST`
- **Auth**: Valid professional session
- **Test Data**: Non-existent professional service ID
- **Expected**: Error (NOT_FOUND)
- **Verify**: Appropriate error message

---

## Services Router Tests

### SVC-001: Get Services - Success
- **Endpoint**: `services.getServices`
- **Method**: `GET`
- **Auth**: Public
- **Expected**: 200 OK, array of active services
- **Verify**: Only active services returned

### SVC-002: Get Services - Public Access
- **Endpoint**: `services.getServices`
- **Method**: `GET`
- **Auth**: No authentication required
- **Expected**: 200 OK
- **Verify**: Public endpoint accessible without auth

### SVC-003: Get Service - Success
- **Endpoint**: `services.getService`
- **Method**: `POST`
- **Auth**: Public
- **Test Data**: Valid service ID
- **Expected**: 200 OK, service object
- **Verify**: Correct service returned

### SVC-004: Get Service - Not Found
- **Endpoint**: `services.getService`
- **Method**: `POST`
- **Auth**: Public
- **Test Data**: Non-existent service ID
- **Expected**: Error (NOT_FOUND)
- **Verify**: Appropriate error message

### SVC-005: Create Service - Success
- **Endpoint**: `services.createService`
- **Method**: `POST`
- **Auth**: Protected
- **Test Data**: Valid name and description
- **Expected**: 200 OK, service created
- **Verify**: Service created, slug generated correctly

### SVC-006: Create Service - Duplicate Name
- **Endpoint**: `services.createService`
- **Method**: `POST`
- **Auth**: Protected
- **Test Data**: Service name that already exists
- **Expected**: Error (unique constraint violation)
- **Verify**: No duplicate service names

### SVC-007: Update Service - Success
- **Endpoint**: `services.updateService`
- **Method**: `POST`
- **Auth**: Protected
- **Test Data**: Valid service ID and updated fields
- **Expected**: 200 OK, updated service
- **Verify**: Changes persisted

### SVC-008: Delete Service - Success
- **Endpoint**: `services.deleteService`
- **Method**: `POST`
- **Auth**: Protected
- **Test Data**: Valid service ID
- **Expected**: 200 OK, deleted service
- **Verify**: Service removed (or marked inactive)

---

## Error Handling Tests

### ERR-001: Invalid Request Format
- **Test**: Send malformed JSON
- **Expected**: 400 Bad Request or validation error
- **Verify**: Appropriate error message

### ERR-002: Missing Required Fields
- **Test**: Omit required fields in requests
- **Expected**: Validation error listing missing fields
- **Verify**: Clear error messages

### ERR-003: Invalid Data Types
- **Test**: Send wrong data types (string instead of number, etc.)
- **Expected**: Validation error
- **Verify**: Type validation works

### ERR-004: Unauthorized Access
- **Test**: Access protected endpoint without authentication
- **Expected**: 401 Unauthorized
- **Verify**: Authentication required message

### ERR-005: Forbidden Access
- **Test**: Customer accessing professional-only endpoint
- **Expected**: 403 Forbidden or NOT_FOUND
- **Verify**: Role-based access control

### ERR-006: Resource Not Found
- **Test**: Access non-existent resource
- **Expected**: 404 Not Found or NOT_FOUND error code
- **Verify**: Appropriate error message

### ERR-007: Database Constraint Violations
- **Test**: Attempt to violate unique constraints, foreign keys
- **Expected**: Appropriate error response
- **Verify**: Database constraints enforced

---

## Security Tests

### SEC-001: SQL Injection Attempt
- **Test**: Send SQL injection strings in input fields
- **Expected**: Input sanitized, no SQL executed
- **Verify**: Prisma parameterization prevents injection

### SEC-002: XSS Attempt
- **Test**: Send JavaScript in text fields
- **Expected**: Input sanitized or escaped
- **Verify**: XSS prevention in place

### SEC-003: Password Security
- **Test**: Verify passwords are hashed, not stored in plain text
- **Expected**: Passwords hashed in database
- **Verify**: Better-Auth handles password hashing

### SEC-004: Session Security
- **Test**: Verify session tokens are secure
- **Expected**: Secure session cookies, HTTP-only flags
- **Verify**: Session management secure

### SEC-005: CORS Configuration
- **Test**: Verify CORS headers configured correctly
- **Expected**: Only allowed origins can access API
- **Verify**: CORS middleware working

### SEC-006: Rate Limiting
- **Test**: Send multiple rapid requests
- **Expected**: Rate limiting applied (if implemented)
- **Verify**: Abuse prevention

---

## Integration Tests

### INT-001: Complete Customer Flow
1. Sign up as customer
2. Sign in
3. Add address
4. Get addresses
5. Add professional to favorites
6. Get favorites
7. Remove from favorites
8. Edit profile
9. Edit address
10. Delete address

### INT-002: Complete Professional Flow
1. Sign up as professional
2. Sign in
3. Complete profile
4. Add document
5. Create availability (multiple days)
6. Get availability
7. Create service
8. Get services
9. Update service
10. Update duty status
11. Update availability
12. Delete availability
13. Delete service

### INT-003: Cross-User Access
1. Customer A creates address
2. Customer B attempts to access Customer A's address
3. Verify access denied

### INT-004: Service Discovery Flow
1. Get all services (public)
2. Get specific service
3. Professional adds service to their offerings
4. Customer views available professionals for service

### INT-005: Geolocation Tests
1. Add address with coordinates
2. Verify geolocation stored correctly
3. Edit address coordinates
4. Verify geolocation updated
5. Test with various coordinate formats

---

## Performance Tests

### PERF-001: Response Time
- **Test**: Measure response times for all endpoints
- **Expected**: < 500ms for most endpoints
- **Verify**: Acceptable performance

### PERF-002: Concurrent Requests
- **Test**: Send multiple concurrent requests
- **Expected**: All requests handled correctly
- **Verify**: No race conditions or deadlocks

### PERF-003: Large Data Sets
- **Test**: Get addresses/services with many records
- **Expected**: Pagination or reasonable response time
- **Verify**: Performance with large datasets

---

## Test Execution Checklist

- [ ] All customer authentication tests
- [ ] All customer profile tests
- [ ] All customer address management tests
- [ ] All customer favorites tests
- [ ] All professional authentication tests
- [ ] All professional profile tests
- [ ] All professional document tests
- [ ] All professional availability tests
- [ ] All professional service tests
- [ ] All services router tests
- [ ] All error handling tests
- [ ] All security tests
- [ ] All integration tests
- [ ] Performance baseline established

---

## Test Data Management

### Test Users
- Create test customers with various profiles
- Create test professionals with various approval statuses
- Maintain test data separate from production

### Cleanup
- Clean up test data after test runs
- Use transactions where possible for test isolation
- Reset database state between test suites

---

## Automated Testing Recommendations

Consider implementing automated tests using:
- **Unit Tests**: Test individual functions and procedures
- **Integration Tests**: Test API endpoints with test database
- **E2E Tests**: Test complete user flows
- **Load Tests**: Test performance under load

### Testing Tools
- Jest or Vitest for unit/integration tests
- Supertest for API testing
- k6 or Artillery for load testing
- Postman/Newman for API test automation

---

## Notes

- Some endpoints may not be fully implemented yet (check TODO comments in code)
- Booking-related endpoints may be added in future versions
- Review and rating endpoints may be added in future versions
- Payment endpoints may be added in future versions

