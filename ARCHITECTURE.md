# Architecture Overview

## Project Structure

This project uses **vertical feature slices**: each business capability owns its contract, validation, persistence adapter, service, controller, and routes. Shared infrastructure remains outside feature folders.

### Directory Layout

```
src/
├── features/
│   └── properties/      # One complete business vertical
│       ├── property.ts       # Domain types and DTOs
│       ├── validation.ts     # HTTP input validation
│       ├── repository.ts     # Persistence contract and adapter
│       ├── service.ts        # Use cases and business rules
│       ├── controller.ts     # HTTP handlers
│       └── routes.ts         # Feature route composition
├── auth/                 # Authentication vertical
├── common/               # Shared errors and logging
├── config/               # Environment configuration
├── database/             # Shared Sequelize connection and definitions
├── middleware/           # Cross-feature HTTP middleware
├── models/common.ts      # Shared type utilities
├── routes/index.ts       # Thin API composition root
└── web/                  # Application entry point
```

## Design Patterns Used

### 1. **Functional Composition**
Features expose factories that close over their dependencies. The composition root creates the default service and controller, while tests can provide an in-memory store or mock service.

```typescript
// Feature-owned service factory
export const createPropertyService = (store = createSequelizePropertyStore()) => ({ /* use cases */ });

// Controller receives a service dependency
export const createPropertyController = (service = createPropertyService()) => ({ /* handlers */ });
```

### 2. **Repository Pattern**
PropertyStore is a functional repository contract. The in-memory implementation is used by tests, while the Sequelize adapter handles production persistence.

```typescript
const createPropertyStore = (): PropertyStore => {
  const properties = new Map<string, IProperty>();
  return {
    create: async (dto: CreatePropertyDto) => { /* create */ },
    update: async (id: string, dto: UpdatePropertyDto) => { /* update */ },
  };
};
```

### 3. **DTO Pattern (Data Transfer Objects)**
Separate DTOs for request/response bodies and database models.

```typescript
interface CreatePropertyDto { /* request */ }
interface UpdatePropertyDto { /* request */ }
interface IProperty { /* database */ }
```

### 4. **Middleware Chain**
Request flows through middleware stack: logging → validation → controller → error handler

```typescript
app.use(express.json());           // Parse JSON
app.use(requestLogger);            // Log request
app.use('/api', propertyRoutes);   // Route to handler
app.use(errorHandler);             // Handle errors
```

### 5. **Error Handling Strategy**
Centralized error handler catches all exceptions and returns consistent API responses.

```typescript
export const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({ success: false, error: { statusCode, message } });
};
```

## Type Safety

Full TypeScript strict mode enabled:
- `strict: true` - All strict checks enabled
- `noImplicitAny: false` - Allows implicit any (can be enabled)
- `strictNullChecks: true` - Null/undefined checks
- `forceConsistentCasingInFileNames: true` - Consistent file naming

## API Contracts

### Success Response Format
```json
{
  "success": true,
  "data": { /* resource */ },
  "message": "Optional message"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Error description"
  }
}
```

## Testing Strategy

- **Unit Tests**: Service and Controller tests
- **Mocking**: Jest mocks for service dependencies
- **Coverage**: Aim for >80% code coverage
- **Test Patterns**: Describe-it blocks with AAA (Arrange-Act-Assert)


## Best Practices Implemented

✅ **Vertical ownership**
- A feature owns its HTTP, domain, validation, and persistence code.
- Shared code is limited to infrastructure and genuinely cross-feature types.


✅ **Functional boundaries**
- Dependencies are explicit factory arguments.
- Stores are structural contracts and can be replaced without changing use cases.
- New capabilities are added as new vertical slices rather than new global layers.

✅ **Type Safety**
- Full TypeScript strict mode
- Interface-driven development
- No implicit any types

✅ **Maintainability**
- Clear folder structure
- Comprehensive comments
- Consistent naming conventions
- Modular, single-purpose files


### Adding a New Resource (e.g., Tenant)

1. Create `src/features/tenant/`.
2. Add the tenant contract, validation, repository, service, controller, and routes inside that folder.
3. Add focused tests next to the feature or under `src/__tests__/tenant/`.
4. Register the feature routes in `src/routes/index.ts`.

This modular structure makes adding features straightforward and predictable.
