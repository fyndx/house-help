# House Help App Documentation

## Overview

House Help is a comprehensive platform connecting customers with professional service providers for various household services. The platform enables customers to book services like cleaning, cooking, plumbing, electrical work, and more, while professionals can manage their availability, services, and bookings.

## Table of Contents

1. [API Documentation](./API.md) - Complete API reference
2. [Testing Guide](./TESTING.md) - Test cases and scenarios for API testing
3. [Architecture](./ARCHITECTURE.md) - System architecture and design decisions

## Key Features

### For Customers
- User registration and authentication
- Profile management
- Address management with geolocation support
- Browse and search services
- Book services (immediate or scheduled)
- Manage favorite professionals
- View booking history
- Recurring bookings support

### For Professionals
- Professional registration and profile completion
- Document verification (Aadhaar, PAN, Police Verification, etc.)
- Service management with custom hourly rates
- Availability management (weekly schedule)
- Booking management
- Earnings tracking
- Duty status management

### Services
- Multiple service categories (Cleaning, Cooking, Plumbing, Electrical, Other)
- Service discovery
- Base hourly rates
- Professional-specific pricing

## Technology Stack

- **Backend**: Elysia (TypeScript web framework)
- **API Layer**: oRPC (Type-safe RPC with OpenAPI)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better-Auth
- **Mobile**: React Native with Expo
- **Styling**: TailwindCSS with NativeWind
- **Runtime**: Bun
- **Monorepo**: Turborepo

## Project Structure

```
house-help/
├── apps/
│   ├── customer/      # Customer mobile app
│   ├── field-ops/     # Field operations app
│   ├── runner/        # Runner/Professional app
│   └── server/        # Backend API server
├── packages/
│   ├── api/           # API routers and business logic
│   ├── auth/          # Authentication configuration
│   └── db/            # Database schema and Prisma client
└── docs/              # Documentation
```

## Getting Started

### Prerequisites

- Bun runtime (v1.3.1+)
- PostgreSQL database
- Node.js (for Expo development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up the database:
   ```bash
   bun db:push
   ```

4. Start the development server:
   ```bash
   bun dev
   ```

The API will be available at `http://localhost:3000`

## API Endpoints

The API is organized into three main routers:

- **Customer Router** (`/rpc/customer.*`) - Customer-specific operations
- **Professional Router** (`/rpc/professional.*`) - Professional-specific operations
- **Services Router** (`/rpc/services.*`) - Service management

### Authentication

The API uses Better-Auth for authentication. Most endpoints require authentication via session cookies or authorization headers.

### API Base URLs

- **RPC Endpoint**: `http://localhost:3000/rpc`
- **OpenAPI Documentation**: `http://localhost:3000/api-reference`
- **Auth Endpoints**: `http://localhost:3000/api/auth/*`

## Database Schema

The application uses PostgreSQL with PostGIS extension for geospatial queries. Key models include:

- **User** - Base user account
- **Customer** - Customer profile and data
- **Professional** - Professional profile and verification
- **Service** - Available services
- **Booking** - Service bookings
- **CustomerAddress** - Customer addresses with geolocation
- **ProfessionalAvailability** - Professional working hours
- **ProfessionalService** - Services offered by professionals with custom rates

## Development

### Available Scripts

- `bun dev` - Start all applications in development mode
- `bun build` - Build all applications
- `bun dev:server` - Start only the server
- `bun dev:native` - Start React Native/Expo development server
- `bun db:push` - Push schema changes to database
- `bun db:studio` - Open Prisma Studio
- `bun check-types` - Check TypeScript types across all apps

### Code Quality

The project uses Biome for code formatting and linting:

```bash
bun check
```

## Security

- All passwords are hashed using secure algorithms
- Session-based authentication with secure cookies
- Role-based access control (Customer, Professional, Admin)
- Professional document verification system
- Aadhaar verification support

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and type checks
4. Submit a pull request

## License

See LICENSE file for details.

