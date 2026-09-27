import request from 'supertest';
import { createApp } from '../app';
import { setupTestDB } from './setup';

setupTestDB();

const app = createApp();

describe('Authentication API', () => {
  const testUser = {
    email: 'tester@example.com',
    password: 'Password123!',
  };

  describe('POST /auth/register', () => {
    it('should register a new user and return a JWT with safe user info', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.data.user.password).toBeUndefined(); // Security: never return password
      expect(res.body.data.user.id).toBeDefined();
    });

    it('should reject registration with duplicate email (409 Conflict)', async () => {
      // First registration
      await request(app).post('/auth/register').send(testUser);

      // Duplicate registration attempt
      const res = await request(app).post('/auth/register').send(testUser);
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already registered');
    });

    it('should fail when email format is invalid (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'not-an-email', password: 'Password123!' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail when password is shorter than 6 characters', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'short@example.com', password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/auth/register').send(testUser);
    });

    it('should login successfully with valid credentials and return JWT', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send(testUser);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should reject login with wrong password (401 Unauthorized)', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should reject login with non-existent email (401 Unauthorized)', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'doesnotexist@example.com', password: 'Password123!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /auth/me', () => {
    let token: string;

    beforeEach(async () => {
      const regRes = await request(app).post('/auth/register').send(testUser);
      token = regRes.body.data.token;
    });

    it('should return safe user info for authenticated user', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should reject requests without authorization token (401 Unauthorized)', async () => {
      const res = await request(app).get('/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject requests with invalid token format or fake token', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid.fake.token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
