# Quick Start Examples

## Running the Application

### Start Development Server
```bash
npm install
npm run start:dev
```

Server will start on `http://localhost:3000`

## API Examples

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. List All Properties
```bash
curl http://localhost:3000/api/properties
```

Response:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "title": "Modern City Apartment",
        "location": "Manhattan, NYC",
        "price": 850000,
        "type": "residential",
        "bedrooms": 2,
        "bathrooms": 2,
        "squareFeet": 1200,
        "amenities": ["gym", "pool", "doorman"],
        "createdAt": "2024-01-20T10:30:00Z",
        "updatedAt": "2024-01-20T10:30:00Z"
      }
    ],
    "total": 3,
    "limit": 10,
    "offset": 0
  }
}
```

### 3. Filter Properties by Location
```bash
curl "http://localhost:3000/api/properties?location=NYC&minPrice=500000&maxPrice=1500000"
```

### 4. Get Property by ID
```bash
curl http://localhost:3000/api/properties/{id}
```

### 5. Create New Property
```bash
curl -X POST http://localhost:3000/api/properties \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Luxury Penthouse",
    "description": "Modern penthouse with city views",
    "location": "Manhattan, NYC",
    "price": 3500000,
    "type": "residential",
    "bedrooms": 3,
    "bathrooms": 3,
    "squareFeet": 2800,
    "amenities": ["pool", "gym", "doorman", "concierge"]
  }'
```

### 6. Update Property
```bash
curl -X PUT http://localhost:3000/api/properties/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "price": 3200000,
    "title": "Updated Penthouse"
  }'
```

### 7. Delete Property
```bash
curl -X DELETE http://localhost:3000/api/properties/{id}
```

## Running Tests

```bash
# Run all tests
npm test

# Run with watch mode
npm test:watch

# Run with coverage
npm test:coverage
```

## Building for Production

```bash
npm run build
npm start
```

Built files will be in `dist/` directory

## Linting

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```
