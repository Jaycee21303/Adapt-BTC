const request = require('supertest');
const app = require('../server');
const { initDatabase } = require('../config/db');

describe('Quiz endpoints', () => {
  let token;
  beforeAll(async () => {
    await initDatabase();
    const registration = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Quiz User', email: 'quiz@example.com', password: 'Password123!' });
    token = registration.body.token;
  });

  it('returns quiz questions for a lesson', async () => {
    const res = await request(app)
      .get('/api/quiz/1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('accepts quiz submissions and grades them', async () => {
    const res = await request(app)
      .post('/api/quiz/submit')
      .set('Authorization', `Bearer ${token}`)
      .send({
        lessonId: 1,
        answers: [
          { questionId: 1, answer: 'The decentralized network' },
          { questionId: 2, answer: '21 million' },
        ],
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.score).toBeGreaterThanOrEqual(1);
  });
});
