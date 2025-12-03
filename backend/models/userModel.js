const db = require('../config/db');

const createUser = async ({ name, email, passwordHash, role = 'user' }) => {
  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [name, email, passwordHash, role]
  );
  return result.rows[0];
};

const findByEmail = async (email) => {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const findById = async (id) => {
  const result = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

module.exports = { createUser, findByEmail, findById };
