import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { initializeApp } from '../../web/server';
import { environment } from '../../config';

jest.mock('../../auth/auth.service', () => ({
  register: jest.fn().mockResolvedValue({
    token: 'registered-token',
    user: { id: 'user-1', username: 'alice' },
  }),
  login: jest.fn().mockResolvedValue({
    token: 'login-token',
    user: { id: 'user-1', username: 'alice' },
  }),
}));

describe('API integration', () => {
  const app = express();
  initializeApp(app);

  it('registers a user through the HTTP API', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.body.data.user.username).toBe('alice');
  });

  it('logs in through the HTTP API', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'alice', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toBe('login-token');
  });

  it('rejects invalid request bodies before the controller', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'a', password: 'short' });

    expect(response.status).toBe(400);
    expect(response.body.error.statusCode).toBe(400);
  });

  it('rejects protected property routes without a token', async () => {
    const response = await request(app).get('/api/properties');

    expect(response.status).toBe(401);
    expect(response.headers['x-request-id']).toEqual(expect.any(String));
  });

  it('rejects invalid cross-field filters', async () => {
    const token = jwt.sign({ id: 'user-1', username: 'alice' }, environment.JWT_SECRET);
    const response = await request(app)
      .get('/api/properties?minPrice=500&maxPrice=100')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.error.message).toContain('minPrice');
  });

  it('serves the OpenAPI document', async () => {
    const response = await request(app).get('/api-docs.json');

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe('3.0.3');
    expect(response.body.paths['/api/properties']).toBeDefined();
    expect(response.body.paths['/api/auth/login']).toBeDefined();
  });
});
