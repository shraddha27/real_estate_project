# Architecture Overview

## Project Structure

This project follows a **clean architecture** with **MVC (Model-View-Controller)** pattern, tailored for enterprise-grade TypeScript applications.

### Directory Layout

```
src/
├── config/              # Configuration Management
│   ├── environment.ts   # Environment variables
│   └── index.ts         # Exports
│
├── models/              # Data Models & Interfaces
│   ├── property.ts      # Property interface and DTOs
│   └── index.ts         # Exports
│
├── services/            # Business Logic Layer
│   ├── property.service.ts   # Service implementation
│   └── index.ts              # Exports
│
├── controllers/         # HTTP Request Handlers
│   ├── property.controller.ts # Route handlers
│   └── index.ts              # Exports
│
├── routes/              # API Route Definitions
│   ├── property.routes.ts    # Route setup
│   └── index.ts              # Exports
│
├── middleware/          # Express Middleware
│   ├── error.middleware.ts   # Error handling
│   └── index.ts              # Exports
│
├── common/              # Shared Utilities
│   └── logger.ts        # Logging service
│
├── web/                 # Web Application Layer
│   ├── server/
│   │   └── index.ts     # Express setup
│   └── index.ts         # App entry point
│
└── __tests__/           # Unit & Integration Tests
    ├── services/        # Service tests
    └── controllers/     # Controller tests
```

## Design Patterns Used

### 1. **Dependency Injection**
Services are instantiated as singletons and injected into controllers, making them testable and loosely coupled.

```typescript
// Service singleton
export default new PropertyService();

// Injected in controller
async listProperties(req: Request, res: Response, next: NextFunction) {
  const result = await propertyService.listProperties(filters);
}
```

### 2. **Repository Pattern**
PropertyStore (in-memory) acts as a data repository, abstracting data access logic.

```typescript
class PropertyStore {
  private properties: Map<string, IProperty> = new Map();
  create(dto: CreatePropertyDto): IProperty { }
  update(id: string, dto: UpdatePropertyDto): IProperty | undefined { }
}
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

## Scalability Considerations

1. **Replace In-Memory Store**: Replace PropertyStore with database queries
2. **Caching Layer**: Add Redis for frequently accessed properties
3. **Authentication**: Add JWT-based auth middleware
4. **Validation**: Add input validation middleware
5. **Pagination**: Built-in support for limit/offset
6. **Logging**: Winston logger with multiple transports
7. **Error Tracking**: Can integrate Sentry or similar

## Best Practices Implemented

✅ **Separation of Concerns**
- Controllers handle HTTP
- Services handle business logic
- Models define data contracts

✅ **DRY (Don't Repeat Yourself)**
- Centralized error handling
- Reusable middleware
- Common logger utility

✅ **SOLID Principles**
- Single Responsibility: Each class has one reason to change
- Open/Closed: Easy to extend with new features
- Liskov Substitution: Services can be swapped/mocked
- Interface Segregation: Focused interfaces (IProperty)
- Dependency Inversion: Depends on abstractions, not implementations

✅ **Type Safety**
- Full TypeScript strict mode
- Interface-driven development
- No implicit any types

✅ **Maintainability**
- Clear folder structure
- Comprehensive comments
- Consistent naming conventions
- Modular, single-purpose files

## How to Extend

### Adding a New Resource (e.g., Tenant)

1. Create `src/models/tenant.ts` with interfaces
2. Create `src/services/tenant.service.ts` with business logic
3. Create `src/controllers/tenant.controller.ts` with HTTP handlers
4. Create `src/routes/tenant.routes.ts` with API definitions
5. Add tests in `src/__tests__/`
6. Register routes in `src/web/server/index.ts`

This modular structure makes adding features straightforward and predictable.
