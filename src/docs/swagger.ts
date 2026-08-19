import { OpenAPIV3 } from 'openapi-types';

export const swaggerDocument: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Real Estate Property Management API',
    version: '1.0.0',
    description: 'Manage properties with JWT-authenticated REST endpoints.',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local server' }],
  tags: [
    { name: 'Health', description: 'Service health' },
    { name: 'Authentication', description: 'User registration and login' },
    { name: 'Properties', description: 'Property management' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Credentials: {
        type: 'object', required: ['username', 'password'],
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 100, example: 'alice' },
          password: { type: 'string', minLength: 8, format: 'password', example: 'password123' },
        },
      },
      User: {
        type: 'object', required: ['id', 'username'],
        properties: { id: { type: 'string', format: 'uuid' }, username: { type: 'string' } },
      },
      AuthResponse: {
        type: 'object', required: ['success', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object', required: ['token', 'user'],
            properties: { token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } },
          },
        },
      },
      Property: {
        type: 'object', required: ['id', 'title', 'description', 'location', 'price', 'type', 'squareFeet', 'amenities', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string', example: 'Modern City Apartment' },
          description: { type: 'string' },
          location: { type: 'string', example: 'Manhattan, NYC' },
          price: { type: 'number', format: 'double', example: 850000 },
          type: { type: 'string', enum: ['residential', 'commercial', 'industrial', 'land'] },
          bedrooms: { type: 'integer', minimum: 0 },
          bathrooms: { type: 'integer', minimum: 0 },
          squareFeet: { type: 'integer', minimum: 1 },
          amenities: { type: 'array', items: { type: 'string' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PropertyInput: {
        type: 'object', required: ['title', 'description', 'location', 'price', 'type', 'squareFeet'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string', minLength: 1 },
          location: { type: 'string', minLength: 1, maxLength: 200 },
          price: { type: 'number', minimum: 0, exclusiveMinimum: true },
          type: { type: 'string', enum: ['residential', 'commercial', 'industrial', 'land'] },
          bedrooms: { type: 'integer', minimum: 0 },
          bathrooms: { type: 'integer', minimum: 0 },
          squareFeet: { type: 'integer', minimum: 1 },
          amenities: { type: 'array', items: { type: 'string' } },
        },
      },
      Error: {
        type: 'object', properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'object', properties: { statusCode: { type: 'integer' }, message: { type: 'string' } } },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'], summary: 'Check API health', responses: {
          '200': { description: 'Service is healthy' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Authentication'], summary: 'Register a user', requestBody: {
          required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Credentials' } } },
        }, responses: {
          '201': { description: 'User registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '400': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '409': { description: 'Username already exists' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'], summary: 'Log in and receive a JWT', requestBody: {
          required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Credentials' } } },
        }, responses: {
          '200': { description: 'Authenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '400': { description: 'Invalid request' }, '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/properties': {
      get: {
        tags: ['Properties'], summary: 'List properties', security: [{ bearerAuth: [] }], parameters: [
          { name: 'location', in: 'query', schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['residential', 'commercial', 'industrial', 'land'] } },
          { name: 'minPrice', in: 'query', schema: { type: 'number', minimum: 0 } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number', minimum: 0 } },
          { name: 'minBedrooms', in: 'query', schema: { type: 'integer', minimum: 0 } },
          { name: 'maxBedrooms', in: 'query', schema: { type: 'integer', minimum: 0 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0, default: 0 } },
        ], responses: {
          '200': { description: 'Paginated properties' }, '400': { description: 'Invalid filters' }, '401': { description: 'Authentication required' },
        },
      },
      post: {
        tags: ['Properties'], summary: 'Create a property', security: [{ bearerAuth: [] }], requestBody: {
          required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PropertyInput' } } },
        }, responses: { '201': { description: 'Created' }, '400': { description: 'Invalid property' }, '401': { description: 'Authentication required' } },
      },
    },
    '/api/properties/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      get: { tags: ['Properties'], summary: 'Get a property', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Property details' }, '404': { description: 'Not found' }, '401': { description: 'Authentication required' } } },
      put: { tags: ['Properties'], summary: 'Update a property', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PropertyInput' } } } }, responses: { '200': { description: 'Updated' }, '400': { description: 'Invalid property' }, '404': { description: 'Not found' } } },
      delete: { tags: ['Properties'], summary: 'Delete a property', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Deleted' }, '404': { description: 'Not found' }, '401': { description: 'Authentication required' } } },
    },
  },
};
