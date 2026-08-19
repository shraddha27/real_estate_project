# Real Estate Property Management API

A TypeScript-based REST API for managing residential and commercial properties. Add, list, search, and manage property information with a clean, enterprise-grade architecture.

## Features

- ✅ Add new properties with comprehensive details (price, location, type, amenities)
- ✅ List all properties with pagination and filtering
- ✅ Search properties by location, type, or price range
- ✅ Update property information
- ✅ Delete properties
- ✅ Type-safe API with strict TypeScript compilation
- ✅ Structured logging and error handling
- ✅ PostgreSQL persistence
- ✅ JWT authentication with bcrypt password hashing
- ✅ Comprehensive test coverage

## Project Structure

```
src/
├── config/              # Configuration management
│   ├── environment.ts   # Environment variables
│   └── index.ts         # Config exports
├── models/              # Data models and interfaces
│   ├── property.ts      # Property model
│   └── index.ts         # Model exports
├── services/            # Business logic layer
│   ├── property.service.ts   # Property operations
│   └── index.ts              # Service exports
├── controllers/         # Request handlers
│   ├── property.controller.ts # Property endpoints
│   └── index.ts              # Controller exports
├── routes/              # API routes
│   ├── property.routes.ts    # Property routes
│   └── index.ts              # Route exports
├── middleware/          # Express middleware
│   ├── error.middleware.ts   # Error handling
│   └── index.ts              # Middleware exports
├── web/
│   ├── server/          # Server initialization
│   │   └── index.ts
│   └── index.ts         # Application entry point
├── auth/                # Registration, login, and JWT middleware
├── database/            # PostgreSQL pool, schema, and property repository
└── __tests__/           # Test files
    ├── services/
    └── controllers/
```

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
npm install
```

Copy `sample.env` to `.env` and update `JWT_SECRET` with a long random value.
The default local database is `postgresql://postgres:root@localhost:5432/postgres`.
The migration creates the `users` and `properties` tables.

Run database migrations before starting the API:

```bash
npm run db:migrate
```

Rollback the latest migration with `npm run db:rollback`.

### Development

```bash
npm run start:dev
```

Server runs on `http://localhost:3000`

Interactive API documentation is available at `http://localhost:3000/api-docs`.
The raw OpenAPI document is available at `http://localhost:3000/api-docs.json`.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

### Docker

Start the API with a local PostgreSQL container:

```bash
docker compose up --build
```

The API is available at `http://localhost:3000` and Swagger at
`http://localhost:3000/api-docs`. Compose runs migrations automatically before
starting the API. Stop the services with:

```bash
docker compose down
```

PostgreSQL data is stored in the `postgres_data` Docker volume. To use an
existing PostgreSQL instance running on the host instead, replace the API
`DATABASE_URL` with:

```text
postgresql://postgres:root@host.docker.internal:5432/postgres
```

### Testing

```bash
npm test
npm test:watch
npm test:coverage
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create a user and receive a JWT |
| POST | `/api/auth/login` | Authenticate and receive a JWT |

Property endpoints require an HTTP header in this format:

```text
Authorization: Bearer <token>
```

### Properties

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | List all properties |
| GET | `/api/properties?location=NYC&minPrice=100000` | Filter properties |
| GET | `/api/properties/:id` | Get property details |
| POST | `/api/properties` | Add new property |
| PUT | `/api/properties/:id` | Update property |
| DELETE | `/api/properties/:id` | Delete property |

### Example Requests

**Add Property:**
```json
POST /api/properties
{
  "title": "Luxury Penthouse",
  "description": "Modern 3-bedroom penthouse",
  "location": "Manhattan, NYC",
  "price": 2500000,
  "type": "residential",
  "bedrooms": 3,
  "bathrooms": 2,
  "squareFeet": 2500,
  "amenities": ["pool", "gym", "doorman"]
}
```

**List Properties:**
```
GET /api/properties?location=NYC&minPrice=500000&maxPrice=3000000
```

## Code Quality

- TypeScript strict mode enabled
- ESLint for code consistency
- Jest for unit and integration tests
- Git-ready with proper .gitignore

## Architecture Highlights

### Level 7 Interview Code (Enterprise-Grade)

✅ **MVC Pattern**: Clear separation of concerns
- Controllers handle HTTP requests
- Services contain business logic
- Models define data structures

✅ **Type Safety**: Full TypeScript strict mode
- No implicit any
- Strict null checks
- Interface-driven design

✅ **Error Handling**: Structured error middleware
- Centralized error handling
- Proper HTTP status codes
- Meaningful error messages

✅ **Scalability**: 
- Service layer abstraction
- Dependency management
- Easy to extend and test

✅ **Best Practices**:
- Environment-based configuration
- Structured logging
- Comprehensive test coverage
- Clean code principles

## Technology Stack

- **Runtime**: Node.js + Express.js
- **Language**: TypeScript 5.x
- **Testing**: Jest
- **Linting**: ESLint
- **Logging**: Winston

## License

MIT
