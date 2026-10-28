import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Institution } from '../src/models/Institution.js';

const app = createApp();

describe('Authentication API', () => {
  it('should successfully register an institution user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Prof. Sharma',
        email: 'sharma@dtie.edu.in',
        password: 'Password@123',
        role: 'institution',
        institutionName: 'Delhi Tech Institute',
        aicteId: '1-99887766',
        state: 'Delhi',
        district: 'Central',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('sharma@dtie.edu.in');
    expect(res.body.user.role).toBe('institution');
    expect(res.body.user.institution).toBeDefined();
    // Verify password is NOT in response
    expect(res.body.user.password).toBeUndefined();
  });

  it('should fail registration with invalid email or short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'A',
        email: 'invalid-email',
        password: '123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('should login with correct credentials and issue auth token', async () => {
    // Pre-create user
    await User.create({
      name: 'Dr. Officer',
      email: 'officer@aicte.gov.in',
      password: 'Password@123',
      role: 'officer',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'officer@aicte.gov.in',
        password: 'Password@123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    await User.create({
      name: 'Admin Test',
      email: 'admin@aicte.gov.in',
      password: 'Password@123',
      role: 'admin',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@aicte.gov.in',
        password: 'WrongPassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should protect /api/auth/me when unauthenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
