const request = require('supertest');
const app = require('../server');
const { initDatabase } = require('../config/db');

describe('Course endpoints', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  it('lists courses', async () => {
    const res = await request(app).get('/api/courses').expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('fetches a course by id', async () => {
    const res = await request(app).get('/api/courses/1').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(1);
  });
});
