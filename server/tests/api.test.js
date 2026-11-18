import jwt from 'jsonwebtoken';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

// These requests are rejected by middleware before any database call, so no MongoDB is needed.
const app = createApp();

describe('API guards and validation', () => {
  it('reports health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('rejects an invalid registration with a clear message', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'A', email: 'nope', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.details.map((d) => d.field)).toEqual(expect.arrayContaining(['name', 'email', 'password']));
  });

  it('requires sign-in to place an order', async () => {
    const res = await request(app).post('/api/orders').send({});
    expect(res.status).toBe(401);
  });

  it('rejects a forged session cookie', async () => {
    const forged = jwt.sign({ sub: '64b000000000000000000000' }, 'wrong-secret');
    const res = await request(app).get('/api/auth/me').set('Cookie', `shopsphere_token=${forged}`);
    expect(res.status).toBe(401);
  });

  it('validates product query parameters', async () => {
    const res = await request(app).get('/api/products?category=spaceships');
    expect(res.status).toBe(400);
  });

  it('returns JSON 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nothing-here');
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/Route not found/);
  });

  it('sets security headers', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});
