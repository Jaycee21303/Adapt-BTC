const request = require('supertest');
const app = require('../server');
const { initDatabase } = require('../config/db');

describe('Auth endpoints', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  it('registers and logs in a user', async () => {
    const registration = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'Password123!' })
      .expect(201);
    expect(registration.body.success).toBe(true);
    expect(registration.body.user.email).toBe('test@example.com');

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Password123!' })
      .expect(200);
    expect(login.body.success).toBe(true);
    expect(login.body.token).toBeDefined();
  });
});
