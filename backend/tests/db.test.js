const { pool, initDatabase } = require('../config/db');

describe('Database connectivity', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  it('responds to a simple query', async () => {
    const result = await pool.query('SELECT 1 as value');
    expect(result.rows[0].value).toBe(1);
  });
});
