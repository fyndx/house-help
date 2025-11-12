# Architecture Documentation

## System Overview

House Help is a monorepo-based application built with modern TypeScript technologies, designed to connect customers with professional service providers for household services.

## Architecture Patterns

### Monorepo Structure

The project uses Turborepo for managing a monorepo with multiple applications and shared packages:

```
house-help/
├── apps/              # Applications
│   ├── customer/      # Customer mobile app
│   ├── field-ops/     # Field operations app
│   ├── runner/        # Professional/Runner mobile app
│   └── server/        # Backend API server
└── packages/          # Shared packages
    ├── api/           # API routers and business logic
    ├── auth/          # Authentication configuration
    └── db/            # Database schema and Prisma client
```

### Technology Stack

#### Backend
- **Elysia**: Fast, type-safe web framework built on Bun
- **oRPC**: Type-safe RPC framework with OpenAPI integration
- **Better-Auth**: Authentication and session management
- **Prisma**: TypeScript-first ORM
- **PostgreSQL**: Primary database with PostGIS extension

#### Frontend/Mobile
- **React Native**: Cross-platform mobile framework
- **Expo**: React Native development platform
- **TailwindCSS**: Utility-first CSS framework
- **NativeWind**: TailwindCSS for React Native

#### Development Tools
- **Bun**: JavaScript runtime and package manager
- **Turborepo**: Monorepo build system
- **TypeScript**: Type-safe development
- **Biome**: Code formatting and linting

## API Architecture

### Request Flow

```
Client Request
    ↓
Elysia Server (apps/server)
    ↓
oRPC Handler
    ↓
Context Creation (authentication, user resolution)
    ↓
Router (packages/api/routers)
    ↓
Business Logic
    ↓
Prisma Client (packages/db)
    ↓
PostgreSQL Database
```

### Router Structure

The API is organized into logical routers:

1. **Customer Router** (`customer.*`)
   - Customer authentication
   - Profile management
   - Address management
   - Favorite professionals

2. **Professional Router** (`professional.*`)
   - Professional authentication
   - Profile management
   - Document management
   - Availability management
   - Service management

3. **Services Router** (`services.*`)
   - Service CRUD operations
   - Service discovery

### Authentication Flow

1. User signs up/signs in via Better-Auth
2. Session cookie is set
3. Context creation extracts session from cookie
4. User role (Customer/Professional) is resolved
5. Protected procedures verify authentication and role

### Context Creation

The context creation process (`packages/api/src/context.ts`):

1. Extracts session from request headers
2. Queries database for user's customer/professional records
3. Attaches session, customer, and professional to context
4. Makes context available to all procedures

## Database Architecture

### Database Schema

The database uses PostgreSQL with PostGIS for geospatial features:

#### Core Models

- **User**: Base user account (managed by Better-Auth)
- **Customer**: Customer-specific data
- **Professional**: Professional-specific data and verification
- **Service**: Available services catalog

#### Relationship Models

- **CustomerAddress**: Customer addresses with geolocation
- **ProfessionalService**: Services offered by professionals
- **ProfessionalAvailability**: Weekly availability schedule
- **ProfessionalDocument**: Verification documents
- **FavoriteProfessional**: Customer favorites

#### Future Models (Referenced in Schema)

- **Booking**: Service bookings
- **BookingItem**: Items within a booking
- **Review**: Customer reviews
- **Payment**: Payment transactions
- **Earning**: Professional earnings
- **Payout**: Professional payouts

### Geospatial Features

The application uses PostGIS for location-based features:

- **CustomerAddress.location**: Geography point for customer addresses
- **Professional.baseLocation**: Geography point for professional base location
- Spatial queries for finding professionals near customer addresses

### Indexes

Key indexes for performance:

- User ID indexes for fast lookups
- Geolocation GIST indexes for spatial queries
- Composite indexes for common query patterns
- Status indexes for filtering

## Security Architecture

### Authentication

- **Better-Auth**: Handles password hashing, session management
- **Session-based**: Uses secure HTTP-only cookies
- **Role-based**: Customer and Professional roles

### Authorization

- **Protected Procedures**: Require valid session
- **Public Procedures**: No authentication required
- **Role Verification**: Context includes user role information

### Data Protection

- **Password Hashing**: Handled by Better-Auth
- **SQL Injection Prevention**: Prisma parameterized queries
- **Input Validation**: Zod schemas for all inputs
- **CORS**: Configured for allowed origins only

## API Design Patterns

### Procedure Pattern

All API endpoints follow the oRPC procedure pattern:

```typescript
export const router = {
  endpointName: protectedProcedure
    .input(z.object({ ... }))
    .handler(async ({ input, context }) => {
      // Business logic
      return result;
    }),
};
```

### Error Handling

- **oRPC Errors**: Standardized error responses
- **Error Codes**: Semantic error codes (NOT_FOUND, BAD_REQUEST, etc.)
- **Error Messages**: User-friendly error messages
- **Logging**: Errors logged to console

### Type Safety

- **End-to-end Types**: oRPC provides type safety from server to client
- **Zod Validation**: Runtime validation with TypeScript types
- **Prisma Types**: Database types generated from schema

## Mobile App Architecture

### App Structure

Three separate mobile apps:

1. **Customer App**: For customers to book services
2. **Runner App**: For professionals to manage bookings
3. **Field Ops App**: For field operations management

### Shared Components

- Container components
- Header buttons
- Sign in/up forms
- Tab bar icons

### State Management

- React hooks for local state
- Context API for global state (if needed)
- oRPC client for API communication

## Development Workflow

### Local Development

1. Start database: `bun db:start`
2. Push schema: `bun db:push`
3. Start server: `bun dev:server`
4. Start mobile app: `bun dev:native`

### Code Organization

- **Shared Logic**: In packages
- **App-specific**: In apps
- **Type Safety**: TypeScript throughout
- **Code Quality**: Biome for formatting

### Database Migrations

- **Prisma Migrations**: Version-controlled schema changes
- **Migration Files**: In `packages/db/prisma/migrations`
- **Schema Files**: Split by domain in `packages/db/prisma/schema`

## Deployment Considerations

### Server Deployment

- Elysia server runs on Bun runtime
- Environment variables for configuration
- Database connection pooling
- CORS configuration for production

### Database Deployment

- PostgreSQL with PostGIS extension required
- Connection string in environment variables
- Migration strategy for schema updates
- Backup and recovery procedures

### Mobile App Deployment

- Expo for building and distribution
- Separate builds for each app (customer, runner, field-ops)
- App store deployment process
- OTA updates via Expo

## Scalability Considerations

### Current Architecture

- Single server instance
- Direct database connections
- Stateless API design

### Future Scalability Options

- **Horizontal Scaling**: Multiple server instances
- **Load Balancing**: Distribute requests
- **Database Replication**: Read replicas
- **Caching**: Redis for frequently accessed data
- **CDN**: For static assets
- **Message Queue**: For async operations (notifications, etc.)

## Monitoring and Observability

### Current State

- Console logging for errors
- Basic error handling

### Recommended Additions

- **Structured Logging**: JSON logs with correlation IDs
- **Error Tracking**: Sentry or similar
- **Performance Monitoring**: APM tools
- **Health Checks**: Endpoint for monitoring
- **Metrics**: Request rates, error rates, latency

## Future Enhancements

### Planned Features (Based on Schema)

- Booking system implementation
- Payment processing
- Review and rating system
- Notification system
- Recurring bookings
- Professional earnings and payouts

### Architecture Improvements

- Background job processing
- Real-time notifications (WebSockets)
- Search functionality (Elasticsearch or similar)
- File upload service
- Email/SMS service integration

## Best Practices

### Code Organization

- Keep routers focused on single domains
- Extract complex business logic to separate functions
- Use TypeScript types throughout
- Validate all inputs with Zod

### Database

- Use transactions for multi-step operations
- Index frequently queried fields
- Use PostGIS for all location-based queries
- Keep migrations small and focused

### API Design

- Use semantic HTTP status codes via oRPC
- Provide clear error messages
- Document all endpoints
- Version APIs if breaking changes needed

### Security

- Never expose sensitive data in responses
- Validate and sanitize all inputs
- Use parameterized queries (Prisma handles this)
- Implement rate limiting in production
- Regular security audits

